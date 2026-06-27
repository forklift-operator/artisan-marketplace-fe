import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-amber-50">
      <!-- Header -->
      <section class="bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 text-white py-12">
        <div class="max-w-7xl mx-auto px-4">
          <h1 class="text-4xl font-bold mb-2">🎨 Vendor Control Panel</h1>
          <p class="text-amber-100">Manage your handmade product listings</p>
        </div>
      </section>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <a routerLink="/catalog" class="text-amber-700 hover:text-amber-900 font-bold mb-6 inline-block">
          ← Back to Catalog
        </a>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card-artisan p-6 text-center">
            <div class="text-4xl mb-2">📦</div>
            <p class="text-gray-600 text-sm">Total Products</p>
            <p class="text-3xl font-bold text-amber-900">{{ products().length }}</p>
          </div>
          <div class="card-artisan p-6 text-center">
            <div class="text-4xl mb-2">⭐</div>
            <p class="text-gray-600 text-sm">Avg Rating</p>
            <p class="text-3xl font-bold text-amber-900">{{ averageRating() }}</p>
          </div>
          <div class="card-artisan p-6 text-center">
            <div class="text-4xl mb-2">👁️</div>
            <p class="text-gray-600 text-sm">Total Views</p>
            <p class="text-3xl font-bold text-amber-900">{{ totalViews() }}</p>
          </div>
          <div class="card-artisan p-6 text-center">
            <div class="text-4xl mb-2">💰</div>
            <p class="text-gray-600 text-sm">Revenue</p>
            <p class="text-3xl font-bold text-amber-900">\${{ totalRevenue() }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="mb-8 flex gap-4">
          <button 
            (click)="showAddModal.set(true)"
            class="btn-primary font-bold text-white py-3 px-6"
          >
            ➕ Add New Product
          </button>
          <button 
            (click)="refreshProducts()"
            class="btn-secondary font-bold py-3 px-6"
          >
            🔄 Refresh
          </button>
        </div>

        <!-- Products Table -->
        <div class="card-artisan overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-amber-100 border-b-2 border-amber-200">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-bold text-amber-900">Product Name</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-amber-900">Price</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-amber-900">Stock</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-amber-900">Location</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-amber-900">Created</th>
                  <th class="px-6 py-3 text-left text-sm font-bold text-amber-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of products(); let last = last" [class.border-b]="!last" class="border-b border-amber-100 hover:bg-amber-50 transition">
                  <td class="px-6 py-4">
                    <div class="font-bold text-amber-900">{{ product.name }}</div>
                    <div class="text-xs text-gray-600">{{ product.description | slice:0:50 }}...</div>
                  </td>
                  <td class="px-6 py-4 font-bold text-amber-900">\${{ product.price | number:'1.2-2' }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-sm font-bold"
                      [class.bg-green-100]="product.quantity > 5"
                      [class.text-green-800]="product.quantity > 5"
                      [class.bg-yellow-100]="product.quantity <= 5 && product.quantity > 0"
                      [class.text-yellow-800]="product.quantity <= 5 && product.quantity > 0"
                      [class.bg-red-100]="product.quantity === 0"
                      [class.text-red-800]="product.quantity === 0">
                      {{ product.quantity }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-700">{{ product.location }}</td>
                  <td class="px-6 py-4 text-gray-600 text-sm">{{ product.createdAt | date:'short' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                      <button 
                        (click)="editProduct(product)"
                        class="px-3 py-1 bg-amber-100 text-amber-900 rounded font-bold text-sm hover:bg-amber-200 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        (click)="deleteProduct(product.id!)"
                        class="px-3 py-1 bg-red-100 text-red-700 rounded font-bold text-sm hover:bg-red-200 transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="products().length === 0" class="p-12 text-center">
            <div class="text-5xl mb-4">📭</div>
            <p class="text-gray-600">You haven't added any products yet.</p>
            <button 
              (click)="showAddModal.set(true)"
              class="btn-primary font-bold text-white py-2 px-6 mt-4 inline-block"
            >
              Add Your First Product
            </button>
          </div>
        </div>

        <!-- Edit Modal -->
        <div *ngIf="showEditModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="card-artisan max-w-2xl w-full max-h-96 overflow-y-auto">
            <div class="p-8">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-amber-900">Edit Product</h2>
                <button (click)="showEditModal.set(false)" class="text-2xl text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <form (ngSubmit)="saveProduct()" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-bold text-amber-900 mb-1">Product Name</label>
                    <input 
                      [(ngModel)]="editingProduct.name" 
                      name="name"
                      class="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-amber-900 mb-1">Price</label>
                    <input 
                      type="number" 
                      [(ngModel)]="editingProduct.price" 
                      name="price"
                      step="0.01"
                      class="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                    >
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-bold text-amber-900 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      [(ngModel)]="editingProduct.quantity" 
                      name="quantity"
                      class="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-amber-900 mb-1">Location</label>
                    <input 
                      [(ngModel)]="editingProduct.location" 
                      name="location"
                      class="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-bold text-amber-900 mb-1">Description</label>
                  <textarea 
                    [(ngModel)]="editingProduct.description" 
                    name="description"
                    rows="3"
                    class="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                  ></textarea>
                </div>

                <div class="flex gap-2 justify-end pt-4">
                  <button 
                    type="button"
                    (click)="showEditModal.set(false)"
                    class="btn-secondary font-bold py-2 px-6"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    class="btn-primary font-bold text-white py-2 px-6"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VendorDashboardPage implements OnInit {
  private productService = inject(ProductService);
  authService = inject(AuthService);

  products = signal<Product[]>([]);
  showAddModal = signal(false);
  showEditModal = signal(false);

  editingProduct: Product = {
    name: '',
    description: '',
    quantity: 1,
    price: 0,
    location: ''
  };

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        // In a real app, filter by vendor ID
        this.products.set(data);
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  refreshProducts() {
    this.loadProducts();
  }

  editProduct(product: Product) {
    this.editingProduct = { ...product };
    this.showEditModal.set(true);
  }

  saveProduct() {
    if (this.editingProduct.id) {
      this.productService.updateProduct(this.editingProduct.id, this.editingProduct).subscribe({
        next: () => {
          this.loadProducts();
          this.showEditModal.set(false);
          alert('Product updated successfully! ✅');
        },
        error: (err) => console.error('Error updating product:', err)
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
          alert('Product deleted! 🗑️');
        },
        error: (err) => console.error('Error deleting product:', err)
      });
    }
  }

  averageRating(): string {
    return '4.8';
  }

  totalViews(): number {
    return this.products().length * 250;
  }

  totalRevenue(): number {
    return this.products().reduce((sum, p) => sum + (p.price * p.quantity * 0.5), 0);
  }
}
