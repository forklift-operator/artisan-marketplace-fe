import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-amber-50">
      <!-- Header -->
      <section class="bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 text-white py-12">
        <div class="max-w-7xl mx-auto px-4">
          <h1 class="text-4xl font-bold mb-2">📦 My Orders</h1>
          <p class="text-amber-100">Track and manage your handmade product orders</p>
        </div>
      </section>

      <!-- Content -->
      <div class="max-w-6xl mx-auto px-4 py-8">
        <a routerLink="/catalog" class="text-amber-700 hover:text-amber-900 font-bold mb-6 inline-block">
          ← Back to Catalog
        </a>

        <!-- Loading State -->
        <div *ngIf="loading()" class="text-center py-12">
          <div class="text-5xl mb-4">⏳</div>
          <p class="text-gray-600">Loading your orders...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && orders().length === 0" class="card-artisan p-12 text-center">
          <div class="text-5xl mb-4">🛒</div>
          <h2 class="text-2xl font-bold text-amber-900 mb-2">No Orders Yet</h2>
          <p class="text-gray-600 mb-6">Start shopping for beautiful handmade products!</p>
          <a routerLink="/catalog" class="btn-primary font-bold text-white py-2 px-6 inline-block">
            Browse Products
          </a>
        </div>

        <!-- Orders List -->
        <div *ngIf="!loading() && orders().length > 0" class="space-y-6">
          <!-- Filters -->
          <div class="card-artisan p-4 flex gap-2">
            <button 
              *ngFor="let status of statusFilters"
              (click)="filterByStatus(status)"
              [class.bg-amber-700]="selectedStatus === status"
              [class.text-white]="selectedStatus === status"
              [class.bg-gray-100]="selectedStatus !== status"
              [class.text-gray-700]="selectedStatus !== status"
              class="px-4 py-2 rounded-lg font-bold transition-colors"
            >
              {{ status }}
            </button>
          </div>

          <!-- Order Cards -->
          <div *ngFor="let order of filteredOrders()" class="card-artisan p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <!-- Order ID -->
              <div>
                <p class="text-xs text-gray-500 font-bold uppercase">Order #</p>
                <p class="text-xl font-bold text-amber-900">#{{ order.id }}</p>
              </div>

              <!-- Date -->
              <div>
                <p class="text-xs text-gray-500 font-bold uppercase">Order Date</p>
                <p class="text-lg font-bold text-amber-900">{{ order.createdAt | date:'short' }}</p>
              </div>

              <!-- Total -->
              <div>
                <p class="text-xs text-gray-500 font-bold uppercase">Total</p>
                <p class="text-2xl font-bold text-amber-900">\${{ order.totalPrice | number:'1.2-2' }}</p>
              </div>

              <!-- Status -->
              <div>
                <p class="text-xs text-gray-500 font-bold uppercase">Status</p>
                <span [attr.class]="'inline-block px-3 py-1 rounded-full text-sm font-bold ' + getStatusColor(order.status || '')"
                >
                  {{ order.status }}
                </span>
              </div>
            </div>

            <!-- Items -->
            <div class="border-t-2 border-amber-100 pt-4 mb-4">
              <p class="text-sm font-bold text-gray-600 mb-2">Items:</p>
              <div class="space-y-2">
                <div *ngFor="let item of order.items" class="flex justify-between text-sm">
                  <span class="text-gray-700">Product #{{ item.productId }} × {{ item.quantity }}</span>
                  <span class="font-bold text-amber-900">\${{ item.price | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button class="btn-secondary font-bold py-2 px-4 text-sm">
                👁️ View Details
              </button>
              <button *ngIf="order.status === 'PENDING'" class="btn-primary font-bold py-2 px-4 text-sm text-white">
                ✅ Confirm Order
              </button>
              <button *ngIf="order.status === 'COMPLETED'" class="btn-secondary font-bold py-2 px-4 text-sm">
                📝 Leave Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrdersPage implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  loading = signal(false);

  statusFilters = ['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED'];
  selectedStatus = 'All';

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.filterByStatus('All');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading.set(false);
      }
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    if (status === 'All') {
      this.filteredOrders.set(this.orders());
    } else {
      this.filteredOrders.set(
        this.orders().filter(o => o.status === status)
      );
    }
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
