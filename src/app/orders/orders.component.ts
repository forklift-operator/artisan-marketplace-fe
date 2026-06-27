import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  loading = signal(false);

  // Updated filters to match the statuses returned by your BE getOrderHistory (COMPLETED, CANCELED)
  statusFilters = ['All', 'COMPLETED', 'CANCELED'];
  selectedStatus = 'All';

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);

    // Changed from getAllOrders() to getOrderHistory()
    this.orderService.getOrderHistory().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.filterByStatus('All');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading order history:', err);
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
      'CANCELED': 'bg-red-100 text-red-800' // Fixed typo: CANCELED with one 'L' matches your Java Status Enum
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
