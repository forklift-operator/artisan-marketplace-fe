import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface OrderItem {
  productId: number;
  quantity: number;
  price?: number;
}

export interface Order {
  id?: number;
  items: OrderItem[];
  totalAmount?: number;
  status?: string;
}

export interface CartItem {
  id: string;
  title?: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:9090/api/v1';

  currentOrder: WritableSignal<Order | null> = signal(null);
  itemsSignal: WritableSignal<CartItem[]> = signal([]);

  // Track if local cart changes have happened since the last server sync
  private hasPendingSyncChanges = false;
  private syncIntervalId: any;

  constructor(private http: HttpClient) {
    // 1. Initialize from localStorage cache
    try {
      const raw = localStorage.getItem('cart');
      if (raw) this.itemsSignal.set(JSON.parse(raw));
    } catch {}

    // 2. Fetch the initial server layout to grab the operational Order ID
    this.loadPendingOrder();

    // 3. Start background sync cycle (10 mins = 10 * 60 * 1000 ms)
    this.startPeriodicSync(10 * 60 * 1000);
  }

  getPendingOrder(): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders`, { withCredentials: true });
  }

  loadPendingOrder() {
    this.getPendingOrder().subscribe({
      next: (order) => {
        this.currentOrder.set(order);
        // If local storage was empty, safely seed it with the server's state
        if (this.itemsSignal().length === 0 && order.items?.length > 0) {
          this.updateLocalStateFromOrder(order);
        }
      },
      error: (err) => console.error('Failed initial pending order load:', err)
    });
  }

  /**
   * Periodic interval checking if local mutations need to flush to the server
   */
  private startPeriodicSync(intervalMs: number) {
    if (this.syncIntervalId) clearInterval(this.syncIntervalId);

    this.syncIntervalId = setInterval(() => {
      if (this.hasPendingSyncChanges) {
        console.log('⏳ 10-minute cycle triggered: Syncing cart modifications to backend...');
        this.syncEntireCartToServer();
      }
    }, intervalMs);
  }

  /**
   * Loops through current local items and synchronously pushes updates sequentially
   */
  private syncEntireCartToServer() {
    const itemsToSync = this.itemsSignal();

    if (itemsToSync.length === 0) {
      this.hasPendingSyncChanges = false;
      return;
    }

    // Process updates sequentially so Hibernate/Spring transactions do not conflict
    let chain = new Observable<void>((sub) => { sub.next(); sub.complete(); });

    itemsToSync.forEach((item) => {
      chain = chain.pipe(
        tap(() => {
          this.http.put<Order>(
            `${this.apiUrl}/orders/update`,
            { productId: Number(item.id), quantity: item.quantity },
            { withCredentials: true }
          ).subscribe({
            next: (order) => this.currentOrder.set(order),
            error: (err) => console.error(`Error syncing product ${item.id}:`, err)
          });
        })
      );
    });

    chain.subscribe({
      complete: () => {
        this.hasPendingSyncChanges = false;
        console.log('✅ Cart changes synced with backend server.');
      }
    });
  }

  // POST /api/v1/orders/{orderId}/complete
  completeOrder(orderId: number): Observable<Order> {
    // FORCE SYNC right before checkout processing to guarantee matching totals
    this.syncEntireCartToServer();

    return this.http.post<Order>(`${this.apiUrl}/orders/${orderId}/complete`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearCart())
    );
  }

  /* --- LOCAL OPERATIONAL MUTATIONS (No immediate API updates) --- */

  addItem(id: string | number, title: string | undefined, price: number, quantity = 1) {
    const sid = String(id);
    const items = [...this.itemsSignal()];
    const idx = items.findIndex(i => i.id === sid);

    if (idx > -1) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
    } else {
      items.push({ id: sid, title, price: price || 0, quantity });
    }

    this.saveLocalCartState(items);
  }

  removeItemByIndex(index: number) {
    const items = [...this.itemsSignal()];
    const itemToRemove = items[index];
    if (!itemToRemove) return;

    // Send a zero quantity update immediately to the backend to drop it right away
    this.http.put<Order>(
      `${this.apiUrl}/orders/update`,
      { productId: Number(itemToRemove.id), quantity: 0 },
      { withCredentials: true }
    ).subscribe({
      next: (order) => this.currentOrder.set(order),
      error: (err) => console.error('Failed to remove item on server:', err)
    });

    items.splice(index, 1);
    this.saveLocalCartState(items);
  }

  updateQuantityByIndex(index: number, qty: number) {
    const items = [...this.itemsSignal()];
    if (index < 0 || index >= items.length) return;

    items[index] = { ...items[index], quantity: qty };
    this.saveLocalCartState(items);
  }

  private saveLocalCartState(items: CartItem[]) {
    this.itemsSignal.set(items);
    this.hasPendingSyncChanges = true; // Flag for background timer
    try { localStorage.setItem('cart', JSON.stringify(items)); } catch {}
  }

  private updateLocalStateFromOrder(order: Order) {
    const items: CartItem[] = (order.items || []).map(i => ({
      id: String(i.productId),
      title: undefined,
      price: i.price || 0,
      quantity: i.quantity
    }));
    this.itemsSignal.set(items);
    try { localStorage.setItem('cart', JSON.stringify(items)); } catch {}
  }

  clearCart() {
    this.currentOrder.set(null);
    this.itemsSignal.set([]);
    this.hasPendingSyncChanges = false;
    try { localStorage.removeItem('cart'); } catch {}
  }

  getOrderHistory(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/history`, { withCredentials: true });
  }
}
