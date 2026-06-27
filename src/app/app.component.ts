// app.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { ProductResponseDto, ReviewResponseDto, OrderResponseDto } from './models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header class="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <span class="text-xl font-bold tracking-wide border-b-2 border-lime-400">Artisan Marketplace</span>
          </div>

          <nav class="flex items-center space-x-6">
            <button (click)="view.set('catalog')" class="hover:text-lime-400 transition">Catalog</button>
            <button *ngIf="api.currentUser()" (click)="loadOrderHistory()" class="hover:text-lime-400 transition">My Orders</button>

            <div *ngIf="!api.currentUser(); else loggedIn" class="space-x-2">
              <button (click)="view.set('login')" class="bg-lime-500 hover:bg-lime-600 px-4 py-1.5 rounded text-slate-950 font-medium transition">Login</button>
            </div>
            <ng-template #loggedIn>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-300">Hello, {{ api.currentUser()?.username }}</span>
                <button (click)="handleLogout()" class="text-sm text-red-400 hover:underline">Logout</button>
              </div>
            </ng-template>
          </nav>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-8">
        <section *ngIf="view() === 'login'" class="max-w-md mx-auto bg-white p-8 rounded-lg shadow border border-gray-100">
          <h3 class="text-2xl font-bold mb-6 text-slate-800">Account Sign In</h3>
          <form (ngSubmit)="handleLogin()">
            <div class="mb-4">
              <label class="block text-sm font-semibold mb-2">Username</label>
              <input type="text" [(ngModel)]="authForm.username" name="username" class="w-full px-3 py-2 border rounded focus:outline-lime-500" required>
            </div>
            <div class="mb-6">
              <label class="block text-sm font-semibold mb-2">Password</label>
              <input type="password" [(ngModel)]="authForm.password" name="password" class="w-full px-3 py-2 border rounded focus:outline-lime-500" required>
            </div>
            <button type="submit" class="w-full bg-slate-900 text-white py-2.5 rounded font-medium hover:bg-slate-800 transition">Log In</button>
          </form>
        </section>

        <section *ngIf="view() === 'catalog'">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-3xl font-bold text-slate-800">Explore Artisan Creation</h3>
            <button *ngIf="api.currentUser()" (click)="showAddProductModal.set(true)" class="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition">+ Add Product</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div *ngFor="let item of products()" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div class="p-6 flex-1">
                <h4 class="text-xl font-bold mb-2">{{ item.name }}</h4>
                <p class="text-gray-600 text-sm mb-4">{{ item.description }}</p>
                <div class="text-2xl font-bold text-slate-900">$&ZeroWidthSpace;{{ item.price }}</div>
              </div>
              <div class="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button (click)="viewReviews(item.id)" class="text-sm font-medium text-slate-600 hover:text-slate-900">Reviews</button>
                <button (click)="addToCart(item)" class="bg-lime-500 hover:bg-lime-600 text-slate-950 font-semibold text-xs px-4 py-2 rounded uppercase tracking-wider transition">Add to Basket</button>
              </div>
            </div>
          </div>
        </section>

        <section *ngIf="view() === 'reviews'" class="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <button (click)="view.set('catalog')" class="text-sm font-medium text-slate-600 hover:underline mb-6 block">&larr; Back to Catalog</button>
          <h3 class="text-2xl font-bold mb-6">Product Feedbacks</h3>

          <div class="space-y-4 mb-8">
            <div *ngFor="let r of reviews()" class="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div class="text-amber-500 font-bold mb-1">★ {{ r.rating }}/5</div>
              <p class="text-gray-700 text-sm">{{ r.comment }}</p>
            </div>
            <p *ngIf="reviews().length === 0" class="text-gray-400 italic">No reviews written yet for this product.</p>
          </div>

          <form *ngIf="api.currentUser()" (ngSubmit)="submitReview()" class="border-t pt-6">
            <h4 class="font-bold mb-4 text-gray-700">Write a Review</h4>
            <div class="mb-4">
              <label class="block text-sm mb-1">Rating Value</label>
              <select [(ngModel)]="newReview.rating" name="rating" class="p-2 border rounded">
                <option [ngValue]="5">5 - Excellent</option>
                <option [ngValue]="4">4 - Good</option>
                <option [ngValue]="3">3 - Average</option>
                <option [ngValue]="2">2 - Poor</option>
                <option [ngValue]="1">1 - Bad</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-sm mb-1">Commentary</label>
              <textarea [(ngModel)]="newReview.comment" name="comment" class="w-full p-2 border rounded focus:outline-none" rows="3"></textarea>
            </div>
            <button type="submit" class="bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium">Post Feedback</button>
          </form>
        </section>

        <section *ngIf="view() === 'history'" class="space-y-6">
          <h3 class="text-2xl font-bold mb-4">Your Order Records</h3>
          <div *ngFor="let order of orderHistory()" class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div class="flex justify-between border-b pb-3 mb-3">
              <div><span class="font-semibold text-sm text-gray-500">ORDER REF ID:</span> #{{ order.id }}</div>
              <div class="capitalize px-2.5 py-0.5 rounded text-xs font-bold" [ngClass]="order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">
                {{ order.status }}
              </div>
            </div>
            <div class="text-lg font-bold text-right text-slate-900">Total Charged: $&ZeroWidthSpace;{{ order.totalPrice }}</div>
            <button *ngIf="order.status !== 'COMPLETED'" (click)="finalizeOrder(order.id)" class="mt-4 bg-slate-900 text-white text-xs px-4 py-2 rounded hover:bg-slate-800 transition">Mark as Completed</button>
          </div>
        </section>
      </main>

      <aside *ngIf="api.cart().length > 0" class="fixed right-6 bottom-6 w-80 bg-white shadow-2xl rounded-xl border border-gray-200 p-5 z-40">
        <h4 class="font-bold text-lg mb-3 flex items-center justify-between">
          <span>Shopping Cart</span>
          <span class="bg-slate-900 text-white text-xs px-2 py-0.5 rounded-full">{{ api.cart().length }}</span>
        </h4>
        <div class="max-h-48 overflow-y-auto space-y-2 mb-4">
          <div *ngFor="let line of api.cart()" class="flex justify-between items-center text-sm">
            <span class="truncate pr-2">{{ line.product.name }} (x{{ line.quantity }})</span>
            <span class="font-semibold text-slate-700">$&ZeroWidthSpace;{{ line.product.price * line.quantity }}</span>
          </div>
        </div>
        <button (click)="checkout()" class="w-full bg-lime-500 hover:bg-lime-600 text-slate-950 font-bold py-2 rounded shadow transition text-center text-sm">
          Place Order Gateway
        </button>
      </aside>
    </div>
  `
})
export class AppComponent implements OnInit {
  api:ApiService = inject(ApiService);

  view = signal<'catalog' | 'login' | 'reviews' | 'history'>('catalog');
  products = signal<ProductResponseDto[]>([]);
  reviews = signal<ReviewResponseDto[]>([]);
  orderHistory = signal<OrderResponseDto[]>([]);

  showAddProductModal = signal<boolean>(false);
  activeProductId: number = 0;

  authForm = { username: '', password: '' };
  newReview = { rating: 5, comment: '' };

  ngOnInit() {
    this.loadCatalog();
  }

  loadCatalog() {
    this.api.getProducts().subscribe(res => this.products.set(res));
  }

  handleLogin() {
    this.api.login(this.authForm).subscribe(() => {
      this.view.set('catalog');
    });
  }

  handleLogout() {
    this.api.logout().subscribe(() => {
      this.view.set('catalog');
    });
  }

  addToCart(product: ProductResponseDto) {
    const currentCart = this.api.cart();
    const existingIndex = currentCart.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1;
      this.api.cart.set([...currentCart]);
    } else {
      this.api.cart.set([...currentCart, { product, quantity: 1 }]);
    }
  }

  checkout() {
    if (!this.api.currentUser()) {
      this.view.set('login');
      return;
    }
    this.api.createOrder().subscribe(() => {
      this.api.cart.set([]);
      this.loadOrderHistory();
    });
  }

  viewReviews(productId: number) {
    this.activeProductId = productId;
    this.api.getReviews(productId).subscribe(res => {
      this.reviews.set(res);
      this.view.set('reviews');
    });
  }

  submitReview() {
    this.api.addReview(this.activeProductId, this.newReview).subscribe(res => {
      this.reviews.set([...this.reviews(), res]);
      this.newReview = { rating: 5, comment: '' };
    });
  }

  loadOrderHistory() {
    this.api.getHistory().subscribe(res => {
      this.orderHistory.set(res);
      this.view.set('history');
    });
  }

  finalizeOrder(id: number) {
    this.api.completeOrder(id).subscribe(() => this.loadOrderHistory());
  }
}
