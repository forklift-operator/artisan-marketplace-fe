import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VendorStatistics {
  totalProducts: number;
  averageRating: number;
}

@Injectable({
  providedIn: 'root'
})

export class VendorService {
  private apiUrl = 'http://localhost:9090/api/v1/vendors';

  constructor(private http: HttpClient) {}

  getVendorStats(vendorId: number): Observable<VendorStatistics> {
    return this.http.get<VendorStatistics>(`${this.apiUrl}/${vendorId}/statistics`);
  }
}
