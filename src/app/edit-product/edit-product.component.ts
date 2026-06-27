import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-edit-product',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent {
private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product = signal<Product | null>(null);
  loading = signal(false);
  saving = signal(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProduct(id);
    });
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading.set(false);
        alert('Product not found!');
        this.router.navigate(['/vendor/dashboard']);
      }
    });
  }

  saveProduct() {
    if (!this.product() || !this.product()!.name || !this.product()!.description) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving.set(true);
    this.productService.updateProduct(this.product()!.id!, this.product()!).subscribe({
      next: () => {
        this.saving.set(false);
        alert('Product updated successfully! ✅');
        this.router.navigate(['/vendor/dashboard']);
      },
      error: (err) => {
        console.error('Error saving product:', err);
        alert('Failed to update product. Please try again.');
        this.saving.set(false);
      }
    });
  }
}
