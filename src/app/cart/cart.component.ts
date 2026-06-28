import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {OrderService, CartItem as ServiceCartItem} from '../services/order.service';

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

  cartItems: WritableSignal<ServiceCartItem[]> = this.orderService.itemsSignal;
  isOpen = signal(false); // Controls open/closed state modal view

  ngOnInit() {
    this.orderService.loadPendingOrder();
  }

  openCart() {
    this.isOpen.set(true);
  }

  closeCart() {
    this.isOpen.set(false);
  }

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

  getCartCount(): number {
    return this.cartItems().reduce((sum, it) => sum + it.quantity, 0);
  }

  checkout() {
    const activeOrder = this.orderService.currentOrder();
    console.log(activeOrder);

    if (!activeOrder || !activeOrder.id) {
      console.warn("No active order found to check out.");
      return;
    }

    if (activeOrder.items.length === 0) {
      console.warn("Cannot check out an empty cart.");
      return;
    }

    // Call the newly implemented endpoint mapping
    this.orderService.completeOrder(activeOrder.id).subscribe({
      next: (response) => {
        console.log('Order successfully completed!', response);
        this.closeCart(); // Close the modal on success
        alert('Thank you! Your purchase was successful.');
      },
      error: (err) => {
        console.error('Checkout failed:', err);
        alert(err.error?.message || 'An error occurred during checkout.');
      }
    });
  }

  trackById(index: number, item: ServiceCartItem) {
    return item.id;
  }
}
