import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-amber-50">
      <!-- Hero Section -->
      <section class="bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 text-white py-12">
        <div class="max-w-7xl mx-auto px-4">
          <h1 class="text-4xl font-bold mb-2">🎨 Handmade Creations</h1>
          <p class="text-amber-100">Browse unique artisan products made with passion and skill</p>
        </div>
      </section>

      <!-- Search & Filter -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterProducts()"
            placeholder="Search products..."
            class="col-span-1 md:col-span-2 px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600"
          >
          <input 
            type="text" 
            [(ngModel)]="locationFilter" 
            (input)="filterProducts()"
            placeholder="Filter by location..."
            class="px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600"
          >
          <button 
            *ngIf="(authService.currentUser$ | async)" 
            routerLink="/add-product"
            class="btn-primary font-bold"
          >
            ➕ Add Product
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="text-center py-12">
          <div class="text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading beautiful creations...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && filteredProducts().length === 0" class="text-center py-12">
          <div class="text-5xl mb-4">🔍</div>
          <p class="text-gray-600">No products found. Try adjusting your search.</p>
        </div>

        <!-- Products Grid -->
        <div *ngIf="!loading() && filteredProducts().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let product of filteredProducts()" class="card-artisan overflow-hidden hover:shadow-lg transition-shadow">
            <!-- Product Image Placeholder -->
            <div class="h-48 bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-5xl">
              🎨
            </div>

            <!-- Product Info -->
            <div class="p-6">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-lg font-bold text-amber-900">{{ product.name }}</h3>
                <span class="badge-handmade">Artisan</span>
              </div>
              
              <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ product.description }}</p>
              
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs text-gray-500">📍 {{ product.location }}</span>
                <span class="text-xs text-gray-500">📦 {{ product.quantity }} in stock</span>
              </div>

              <div class="border-t border-amber-100 pt-3 mt-3">
                <p class="text-2xl font-bold text-amber-900 mb-3">\${{ product.price | number:'1.2-2' }}</p>
                
                <div class="flex gap-2">
                  <button 
                    routerLink="/product/{{ product.id }}"
                    class="flex-1 btn-secondary font-bold py-2 text-sm"
                  >
                    View Details
                  </button>
                  <button 
                    (click)="addToCart(product)"
                    class="flex-1 btn-primary font-bold py-2 text-sm text-white"
                  >
                    🛒 Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CatalogPage implements OnInit {
  private productService = inject(ProductService);
  authService = inject(AuthService);

  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  loading = signal(false);
  
  searchTerm = '';
  locationFilter = '';

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.filteredProducts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading.set(false);
      }
    });
  }

  filterProducts() {
    const filtered = this.products().filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            p.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesLocation = !this.locationFilter || 
                             p.location.toLowerCase().includes(this.locationFilter.toLowerCase());
      return matchesSearch && matchesLocation;
    });
    this.filteredProducts.set(filtered);
  }

  addToCart(product: Product) {
    alert(`Added "${product.name}" to cart! 🛒`);
    // Cart functionality would be implemented here
  }
}
