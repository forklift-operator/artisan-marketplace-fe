// api.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserResponseDto, ProductResponseDto, ReviewResponseDto, OrderResponseDto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:9090/api/v1';

  // State Management via Signals
  currentUser = signal<UserResponseDto | null>(null);
  cart = signal<{ product: ProductResponseDto; quantity: number }[]>([]);

  // ==========================================
  // AUTH CONTROLLER
  // ==========================================
  register(credentials: any): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.baseUrl}/auth/register`, credentials);
  }

  login(credentials: any): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {}).pipe(
      tap(() => this.currentUser.set(null))
    );
  }

  // ==========================================
  // PRODUCT CONTROLLER
  // ==========================================
  getProducts(): Observable<ProductResponseDto[]> {
    return this.http.get<ProductResponseDto[]>(`${this.baseUrl}/products`);
  }

  addProduct(productData: any): Observable<ProductResponseDto> {
    return this.http.post<ProductResponseDto>(`${this.baseUrl}/products`, productData);
  }

  // ==========================================
  // REVIEW CONTROLLER
  // ==========================================
  getReviews(productId: number): Observable<ReviewResponseDto[]> {
    // Maps to endpoint: /products/{product_id}/reviews
    return this.http.get<ReviewResponseDto[]>(`http://localhost:8080/products/${productId}/reviews`);
  }

  addReview(productId: number, reviewData: any): Observable<ReviewResponseDto> {
    return this.http.post<ReviewResponseDto>(`http://localhost:8080/products/${productId}/reviews`, reviewData);
  }

  // ==========================================
  // ORDER CONTROLLER
  // ==========================================
  createOrder(): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(`${this.baseUrl}/orders`);
  }

  getHistory(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(`${this.baseUrl}/orders/history`);
  }

  updateOrder(updateData: any): Observable<OrderResponseDto> {
    return this.http.put<OrderResponseDto>(`${this.baseUrl}/orders/update`, updateData);
  }

  completeOrder(orderId: number): Observable<OrderResponseDto> {
    return this.http.post<OrderResponseDto>(`${this.baseUrl}/orders/${orderId}/complete`, {});
  }
}
