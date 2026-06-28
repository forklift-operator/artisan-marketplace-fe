import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { VendorService, VendorStatistics } from '../services/vendor.service';

@Component({
  selector: 'app-vendor-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.css'
})
export class VendorDashboardComponent {
private productService = inject(ProductService);
private vendorService = inject(VendorService);
  authService = inject(AuthService);

  products = signal<Product[]>([]);
  stats = signal<VendorStatistics>({ totalProducts: 0, averageRating: 0 });
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
    this.loadStats();
  }

  loadProducts() {
    const vendorId = this.authService.getLoggedInUserId();
    this.productService.getAllProductsByVendorId(vendorId).subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

loadStats() {
    const vendorId = this.authService.getLoggedInUserId();
    this.vendorService.getVendorStats(vendorId).subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (err) => console.error('Error loading vendor stats:', err)
    });
  }

  refreshProducts() {
    this.loadProducts();
    this.loadStats();
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
}
