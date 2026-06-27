import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <a routerLink="/catalog" class="text-amber-700 hover:text-amber-900 font-bold mb-6 inline-block">
          ← Back
        </a>

        <div class="card-artisan p-8 shadow-xl">
          <!-- Header -->
          <div class="mb-8">
            <div class="text-5xl mb-4">🎨</div>
            <h1 class="text-3xl font-bold text-amber-900">List Your Handmade Product</h1>
            <p class="text-gray-600 text-sm mt-2">Share your beautiful creation with the world</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Product Name -->
            <div>
              <label class="block text-sm font-bold text-amber-900 mb-2">Product Name *</label>
              <input 
                type="text" 
                [(ngModel)]="form.name" 
                name="name"
                placeholder="e.g., Handmade Ceramic Vase"
                required
                class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
              >
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-bold text-amber-900 mb-2">Description *</label>
              <textarea 
                [(ngModel)]="form.description" 
                name="description"
                placeholder="Tell customers about your product. What makes it special?"
                rows="4"
                required
                class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">{{ form.description.length }}/500 characters</p>
            </div>

            <!-- Price & Quantity -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-amber-900 mb-2">Price (USD) *</label>
                <input 
                  type="number" 
                  [(ngModel)]="form.price" 
                  name="price"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                >
              </div>
              <div>
                <label class="block text-sm font-bold text-amber-900 mb-2">Quantity *</label>
                <input 
                  type="number" 
                  [(ngModel)]="form.quantity" 
                  name="quantity"
                  placeholder="1"
                  min="1"
                  required
                  class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                >
              </div>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-bold text-amber-900 mb-2">Location *</label>
              <input 
                type="text" 
                [(ngModel)]="form.location" 
                name="location"
                placeholder="e.g., Sofia, Bulgaria"
                required
                class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
              >
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-bold text-amber-900 mb-2">Category</label>
              <select 
                [(ngModel)]="form.category" 
                name="category"
                class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
              >
                <option value="">Select a category</option>
                <option value="pottery">🏺 Pottery & Ceramics</option>
                <option value="textile">🧵 Textiles & Fiber Arts</option>
                <option value="jewelry">💍 Jewelry & Accessories</option>
                <option value="woodwork">🪵 Woodwork</option>
                <option value="glasswork">🏺 Glasswork</option>
                <option value="metalwork">⚒️ Metalwork</option>
                <option value="painting">🎨 Painting & Drawing</option>
                <option value="sculpture">🗿 Sculpture</option>
                <option value="other">✨ Other</option>
              </select>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-bold text-amber-900 mb-2">Tags (comma separated)</label>
              <input 
                type="text" 
                [(ngModel)]="form.tags" 
                name="tags"
                placeholder="e.g., handmade, unique, eco-friendly"
                class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
              >
            </div>

            <!-- Error Message -->
            <div *ngIf="error" class="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
              {{ error }}
            </div>

            <!-- Submit -->
            <button 
              type="submit" 
              [disabled]="loading"
              class="w-full btn-primary font-bold py-3 text-white transition-all disabled:opacity-50"
            >
              {{ loading ? 'Publishing...' : 'Publish Product' }}
            </button>
          </form>

          <!-- Tips -->
          <div class="mt-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <h3 class="font-bold text-amber-900 mb-3">💡 Tips for Great Listings</h3>
            <ul class="text-sm text-gray-700 space-y-2">
              <li>✓ Use clear, detailed descriptions</li>
              <li>✓ Highlight what makes your product unique</li>
              <li>✓ Be honest about materials and dimensions</li>
              <li>✓ Price competitively</li>
              <li>✓ Add relevant tags for discoverability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AddProductPage {
  private productService = inject(ProductService);
  private router = inject(Router);

  form = {
    name: '',
    description: '',
    price: 0,
    quantity: 1,
    location: '',
    category: '',
    tags: ''
  };

  loading = false;
  error = '';

  onSubmit() {
    // Validation
    if (!this.form.name || !this.form.description || !this.form.price || !this.form.location) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (this.form.price <= 0) {
      this.error = 'Price must be greater than 0';
      return;
    }

    if (this.form.quantity < 1) {
      this.error = 'Quantity must be at least 1';
      return;
    }

    this.loading = true;
    this.error = '';

    const product: Product = {
      name: this.form.name,
      description: this.form.description,
      price: this.form.price,
      quantity: this.form.quantity,
      location: this.form.location
    };

    this.productService.addProduct(product).subscribe({
      next: (createdProduct) => {
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to publish product. Please try again.';
        this.loading = false;
      }
    });
  }
}
