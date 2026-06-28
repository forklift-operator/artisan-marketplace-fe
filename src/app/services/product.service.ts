import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id?: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  location: string;
  photos?: Photo[]; // array of image URLs
  createdAt?: string;
  updatedAt?: string;
}

export interface Photo {
  id?: number;
  data: string;
  contentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:9090/api/v1/products';

  constructor(private http: HttpClient) {}

  getAllProducts(filters?: any): Observable<Product[]> {
    let url = this.apiUrl;
    if (filters && filters.location) {
      url += `?location=${filters.location}`;
    }
    return this.http.get<Product[]>(url);
  }

  getAllProductsByVendorId(vendorId: number): Observable<Product[]> {
    let url = `${this.apiUrl}/vendor/${vendorId}`;
    return this.http.get<Product[]>(url);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Accept either JSON or FormData (for file uploads)
  addProduct(product: Product | FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product as any, { withCredentials: true });
  }

  // Accept FormData as well for updating photos
  updateProduct(id: number, product: Product | FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product as any, { withCredentials: true });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  searchProducts(query: string, location?: string): Observable<Product[]> {
    let url = `${this.apiUrl}/search?q=${query}`;
    if (location) {
      url += `&location=${location}`;
    }
    return this.http.get<Product[]>(url);
  }
}
