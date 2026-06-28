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

  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  loading = false;
  error = '';

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.selectedFiles = Array.from(input.files);
    this.previewUrls = [];

    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

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

    // Use FormData with a JSON 'product' part and photos as files (backend expects @RequestPart("product") and @RequestPart("photos"))
    const formData = new FormData();

    const productDto: any = {
      name: this.form.name,
      description: this.form.description,
      price: this.form.price,
      quantity: this.form.quantity,
      location: this.form.location
    };
    if (this.form.category) productDto.category = this.form.category;
    if (this.form.tags) productDto.tags = this.form.tags;

    // Append product JSON as a blob under key 'product' so Spring @RequestPart("product") can bind it
    formData.append('product', new Blob([JSON.stringify(productDto)], { type: 'application/json' }));

    // Append images under the 'photos' part (multiple allowed)
    this.selectedFiles.forEach((file) => {
      formData.append('photos', file, file.name);
    });

    this.productService.addProduct(formData).subscribe({
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
