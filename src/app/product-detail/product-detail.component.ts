import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {ProductService, Product} from '../services/product.service';
import {ReviewService, Review} from '../services/review.service';
import {AuthService} from '../services/auth.service';
import {OrderService} from '../services/order.service';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  private productService = inject(ProductService);
  private reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);
  private orderService = inject(OrderService);

  product = signal<Product | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(false);

  newReview = {
    rating: 5,
    text: ''
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProduct(id);
      this.loadReviews(id);
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
      }
    });
  }

  loadReviews(productId: number) {
    this.reviewService.getProductReviews(productId).subscribe({
      next: (data) => {
        this.reviews.set(data);
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
      }
    });
  }

  submitReview() {
    if (!this.product() || !this.newReview.text.trim()) {
      alert('Please fill in your review');
      return;
    }

    const review: Review = {
      productId: this.product()!.id!,
      userId: this.authService.getLoggedInUserId(),
      rating: this.newReview.rating,
      text: this.newReview.text
    };

    this.reviewService.createReview(review, this.product()!.id!).subscribe({
      next: (newReview) => {
        this.reviews.set([...this.reviews(), newReview]);
        this.newReview = {rating: 5, text: ''};
      },
      error: (err) => console.error('Error submitting review:', err)
    });
  }

  averageRating() {
    if (this.reviews().length === 0) return 0;
    const sum = this.reviews().reduce((acc, r) => acc + r.rating, 0);
    return (sum / this.reviews().length).toFixed(1);
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }

  addToCart() {
    if (!this.product()) return;

    const product = this.product()!;
    this.orderService.addItem(product.id!, product.name, product.price || 0, 1);
    alert(`Added "${product.name}" to cart! 🛒`);
  }
}
