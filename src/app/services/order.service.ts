import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, concatMap, from, of, toArray, map } from 'rxjs';

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

  private hasPendingSyncChanges = false;
  private syncIntervalId: any;

  constructor(private http: HttpClient) {
    try {
      const raw = localStorage.getItem('cart');
      if (raw) this.itemsSignal.set(JSON.parse(raw));
    } catch {}

    this.loadPendingOrder();
    this.startPeriodicSync(10 * 60 * 1000);
  }

  getPendingOrder(): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders`, { withCredentials: true });
  }

  loadPendingOrder() {
    this.getPendingOrder().subscribe({
      next: (order) => {
        this.currentOrder.set(order);
        console.log('Loaded pending order:', order);

        // FIX: Prioritize the server's items if they exist to keep data accurate across reloads
        if (order.items && order.items.length > 0) {
          this.updateLocalStateFromOrder(order);
        }
      },
      error: (err) => console.error('Failed initial pending order load:', err)
    });
  }

  private startPeriodicSync(intervalMs: number) {
    if (this.syncIntervalId) clearInterval(this.syncIntervalId);

    this.syncIntervalId = setInterval(() => {
      if (this.hasPendingSyncChanges) {
        this.syncEntireCartToServer().subscribe();
      }
    }, intervalMs);
  }

  /**
   * FIX: Loops through local items and calls the update API sequentially.
   * Returns an Observable containing the final server-side representation of the Order.
   */
  private syncEntireCartToServer(): Observable<Order | null> {
    const itemsToSync = this.itemsSignal();

    if (itemsToSync.length === 0) {
      this.hasPendingSyncChanges = false;
      return of(this.currentOrder());
    }

    console.log('🔄 Syncing cart modifications to backend sequentially...');

    return from(itemsToSync).pipe(
      concatMap((item) => {
        // Send the payload mapping matching your OrderUpdateRequestDto
        return this.http.put<Order>(
          `${this.apiUrl}/orders/update`,
          { productId: Number(item.id), quantity: item.quantity },
          { withCredentials: true }
        );
      }),
      // toArray collects all emissions, allowing us to capture the final updated state cleanly
      toArray(),
      map((allResponses) => {
        const finalOrderState = allResponses[allResponses.length - 1];
        if (finalOrderState) {
          this.currentOrder.set(finalOrderState);
        }
        return finalOrderState;
      }),
      tap({
        finalize: () => {
          this.hasPendingSyncChanges = false;
          console.log('✅ All cart items updated successfully on the server.');
        }
      })
    );
  }

  /**
   * POST /api/v1/orders/{orderId}/complete
   * FIX: Forces a complete checkout sync run right before calling completion
   */
  completeOrder(orderId: number): Observable<Order> {
    return this.syncEntireCartToServer().pipe(
      concatMap((freshOrderState) => {
        // Validation check against our fresh server data stream
        if (!freshOrderState || !freshOrderState.items || freshOrderState.items.length === 0) {
          throw new Error("Cannot complete checkout because your backend cart is empty.");
        }

        return this.http.post<Order>(
          `${this.apiUrl}/orders/${orderId}/complete`,
          {},
          { withCredentials: true }
        );
      }),
      tap(() => this.clearCart())
    );
  }

  /* --- LOCAL OPERATIONAL MUTATIONS --- */

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
    this.hasPendingSyncChanges = true;
    try { localStorage.setItem('cart', JSON.stringify(items)); } catch {}

    this.syncEntireCartToServer().subscribe();
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
