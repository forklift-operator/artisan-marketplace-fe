import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id?: number;
  productId: number;
  userId: number;
  rating: number;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:9090/api/v1/reviews';

  constructor(private http: HttpClient) {}

  getProductReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`http://localhost:9090/api/v1/products/${productId}/reviews`);
  }

  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  createReview(review: Review, productId: number): Observable<Review> {
    return this.http.post<Review>(`http://localhost:9090/api/v1/products/${productId}/reviews`, review);
  }

  updateReview(id: number, review: Review): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}`, review);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
