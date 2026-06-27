import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrderService, CartItem as ServiceCartItem } from '../services/order.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  orderService = inject(OrderService);
  authService = inject(AuthService);

  // Alias to the service's itemsSignal so multiple components stay in sync.
  cartItems: WritableSignal<ServiceCartItem[]> = this.orderService.itemsSignal;
  isOpen = signal(false);

  ngOnInit() {
    // Load pending order from server and populate itemsSignal (falls back to localStorage)
    this.orderService.loadPendingOrder();
  }

  closeCart() {
    this.isOpen.set(false);
  }

  // Delegating modifications to the OrderService so updates are reactive across the app.
  addItem(item: ServiceCartItem) {
    this.orderService.addItem(item.id, item.title, item.price, item.quantity);
  }

  removeItem(index: number) {
    this.orderService.removeItemByIndex(index);
  }

  updateQuantity(index: number, qty: number | string) {
    let q = Number(qty) || 0;
    if (q < 1) q = 1;
    this.orderService.updateQuantityByIndex(index, q);
  }

  increaseQuantity(index: number) {
    const items = this.cartItems();
    this.orderService.updateQuantityByIndex(index, items[index].quantity + 1);
  }

  decreaseQuantity(index: number) {
    const items = this.cartItems();
    if (items[index].quantity > 1) {
      this.orderService.updateQuantityByIndex(index, items[index].quantity - 1);
    } else {
      this.orderService.removeItemByIndex(index);
    }
  }

  clearCart() {
    this.orderService.clearCart();
  }

  getTotal(): number {
    return this.cartItems().reduce((sum, it) => sum + it.price * it.quantity, 0);
  }

  checkout() {
    const items = this.cartItems();
    if (!items || items.length === 0) return;
    if (this.orderService && typeof (this.orderService as any).createOrder === 'function') {
      (this.orderService as any).createOrder({ items: items.map(i => ({ productId: Number(i.id), quantity: i.quantity, price: i.price })), totalPrice: this.getTotal() as any });
      this.clearCart();
      return;
    }
    console.log('Checkout', { items, total: this.getTotal() });
    this.clearCart();
  }

  trackById(index: number, item: ServiceCartItem) {
    return item.id;
  }
}
