import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { OrderService, Order } from '../services/order.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true, // Make sure standalone is explicit if using imports array
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  authService = inject(AuthService);
  private router = inject(Router);

  user = signal<User | null>(null);
  orders = signal<Order[]>([]);
  loading = signal(false);
  updating = signal(false);
  expandOrder = signal<number | null>(null);

  isModalOpen = signal<boolean>(false);
  editForm: any = {};

  // Computed signal to dynamically calculate the actual order history total count
  totalOrdersCount = computed(() => this.orders().length);

  stats = {
    reviewsGiven: 8,
    productsListed: 5
  };

  ngOnInit() {
    this.loadProfile();
    this.loadOrders();
  }

  loadProfile() {
    this.loading.set(true);

    this.authService.currentUser$.subscribe(currentUser => {
      if (currentUser) {
        this.user.set(currentUser);
        this.resetEditForm();
      }
      this.loading.set(false);
    });
  }

  loadOrders() {
    // FIX: Changed from getAllOrders() to getOrderHistory() to pull completed/canceled data
    this.orderService.getOrderHistory().subscribe({
      next: (data) => this.orders.set(data),
      error: (err) => console.error('Error loading historical orders:', err)
    });
  }

  openModal() {
    this.resetEditForm();
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  resetEditForm() {
    const currentUser = this.user();
    if (currentUser) {
      this.editForm = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email
      };
    }
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
        this.closeModal();
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
      'CANCELED': 'bg-red-100 text-red-800' // FIX: Changed 'CANCELLED' to 'CANCELED' (one 'L')
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
