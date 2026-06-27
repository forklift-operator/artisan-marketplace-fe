import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
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
