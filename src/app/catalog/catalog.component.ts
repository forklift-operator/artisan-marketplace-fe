import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent {
  private productService = inject(ProductService);
  authService = inject(AuthService);
  private orderService = inject(OrderService);

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
    // delegate to OrderService so UI updates reactively
    this.orderService.addItem(product.id!, product.name, product.price || 0, 1);
  }
}
