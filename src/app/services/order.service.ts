import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:9090/api/v1/orders';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.post<Order[]>(this.apiUrl, {});
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
