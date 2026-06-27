import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { OrderService, Order } from '../services/order.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
private userService = inject(UserService);
  private orderService = inject(OrderService);
  authService = inject(AuthService);
  private router = inject(Router);

  user = signal<User | null>(null);
  orders = signal<Order[]>([]);
  loading = signal(false);
  updating = signal(false);
  expandOrder = signal<number | null>(null);

  editForm: any = {};

  stats = {
    totalOrders: 0,
    reviewsGiven: 8,
    productsListed: 5
  };

  ngOnInit() {
    this.loadProfile();
    this.loadOrders();
  }

  loadProfile() {
    this.loading.set(true);

    // Get current user from auth service
    this.authService.currentUser$.subscribe(currentUser => {
      if (currentUser) {
        this.user.set(currentUser);
        this.editForm = {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email
        };
        this.stats.totalOrders = 5; // Mock data
      }
      this.loading.set(false);
    });
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  updateProfile() {
    if (!this.user()) return;

    this.updating.set(true);
    const updatedUser: User = {
      ...this.user()!,
      ...this.editForm
    };

    this.userService.updateUser(this.user()!.id, updatedUser).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.authService.setCurrentUser(updated);
        this.updating.set(false);
        alert('Profile updated successfully! ✅');
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.updating.set(false);
      }
    });
  }

  getRoleEmoji(role: string): string {
    const emojis: Record<string, string> = {
      'USER': '👤',
      'VENDOR': '🎨',
      'ADMIN': '👑'
    };
    return emojis[role] || '👤';
  }

  getOrderStatusColor(status: string): string {
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
