import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  productId: number;
  quantity: number;
  price?: number;
}

export interface Order {
  id?: number;
  items: OrderItem[];
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
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
  private apiUrl = 'http://localhost:9090/api/v1/orders';

  // Signal holding the current pending order from the server (if any)
  currentOrder: WritableSignal<Order | null> = signal(null);
  // Derived cart items for the UI (keeps title optional — components may enrich)
  itemsSignal: WritableSignal<CartItem[]> = signal([]);

  constructor(private http: HttpClient) {
    // initialize from localStorage if present as fallback
    try {
      const raw = localStorage.getItem('cart');
      if (raw) this.itemsSignal.set(JSON.parse(raw));
    } catch {}
  }

  getPendingOrder(): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}`);
  }

  loadPendingOrder() {
    this.getPendingOrder().subscribe({
      next: (order) => {
        this.currentOrder.set(order);
        const items: CartItem[] = (order.items || []).map(i => ({
          id: String(i.productId),
          title: undefined,
          price: i.price || 0,
          quantity: i.quantity
        }));
        this.itemsSignal.set(items);
        try { localStorage.setItem('cart', JSON.stringify(items)); } catch {}
      },
      error: (err) => {
        // If request fails, keep whatever is in localStorage/itemsSignal
        console.error('Failed loading pending order:', err);
      }
    });
  }

  // Add an item to the cart (updates signal and localStorage). Title is optional.
  addItem(id: string | number, title: string | undefined, price: number, quantity = 1) {
    const sid = String(id);
    const items = [...this.itemsSignal()];
    const idx = items.findIndex(i => i.id === sid);
    if (idx > -1) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
    } else {
      items.push({ id: sid, title, price: price || 0, quantity });
    }
    this.itemsSignal.set(items);
    try { localStorage.setItem('cart', JSON.stringify(items)); } catch {}
    // Optionally, synchronize with server: if currentOrder exists call updateOrder, else createOrder.
    // Skipping server sync to avoid unexpected API assumptions; can be added later.
  }

  removeItemByIndex(index: number) {
    const items = [...this.itemsSignal()];
    if (index < 0 || index >= items.length) return;
    items.splice(index, 1);
    this.itemsSignal.set(items);
    try { localStorage.setItem('cart', JSON.stringify(items)); } catch {}
  }

  updateQuantityByIndex(index: number, qty: number) {
    const items = [...this.itemsSignal()];
    if (index < 0 || index >= items.length) return;
    items[index] = { ...items[index], quantity: qty };
    this.itemsSignal.set(items);
    try { localStorage.setItem('cart', JSON.stringify(items)); } catch {}
  }

  clearCart() {
    this.itemsSignal.set([]);
    try { localStorage.removeItem('cart'); } catch {}
  }

  /* Existing API helpers (kept) */
  getAllOrders(): Observable<Order[]> {
    return this.http.post<Order[]>(this.apiUrl, {} as any);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrder(id: number, order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
  }

  updateOrderItems(items: OrderItem[]): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/update`);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
