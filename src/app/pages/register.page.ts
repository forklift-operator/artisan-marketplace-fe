import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
      <div class="max-w-lg mx-auto">
        <div class="card-artisan p-8 shadow-xl">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="text-5xl mb-4">✨</div>
            <h1 class="text-3xl font-bold text-amber-900">Join Artisan Market</h1>
            <p class="text-gray-600 text-sm mt-2">Create your account to buy or sell handmade crafts</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onRegister()" class="space-y-4">
            <!-- Name Fields -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-amber-900 mb-2">First Name</label>
                <input
                  type="text"
                  [(ngModel)]="form.firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                >
              </div>
              <div>
                <label class="block text-sm font-bold text-amber-900 mb-2">Last Name</label>
                <input
                  type="text"
                  [(ngModel)]="form.lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                >
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-bold text-amber-900 mb-2">Email Address</label>
              <input
                type="email"
                [(ngModel)]="form.email"
                name="email"
                placeholder="you@example.com"
                required
                class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
              >
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-bold text-amber-900 mb-2">Password</label>
              <input
                type="password"
                [(ngModel)]="form.password"
                name="password"
                placeholder="••••••••"
                required
                class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
              >
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-bold text-amber-900 mb-2">I want to</label>
              <select
                [(ngModel)]="form.role"
                name="role"
                class="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
              >
                <option value="USER">Shop for Handmade Products</option>
                <option value="VENDOR">Sell My Handmade Products</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <!-- Agreement -->
            <div class="flex items-start gap-2 text-xs text-gray-600">
              <input type="checkbox" required class="mt-1">
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="loading"
              class="w-full btn-primary font-bold py-3 text-white transition-all mt-6"
            >
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>

          <!-- Error Message -->
          <div *ngIf="error" class="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
            {{ error }}
          </div>

          <!-- Login Link -->
          <div class="mt-6 text-center">
            <p class="text-gray-600 text-sm">
              Already have an account?
              <a routerLink="/login" class="text-amber-700 font-bold hover:text-amber-900 transition">
                Sign in
              </a>
            </p>
          </div>
        </div>

        <!-- Features -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-white rounded-lg shadow text-center">
            <div class="text-3xl mb-2">🛍️</div>
            <h3 class="font-bold text-amber-900 text-sm">Browse & Buy</h3>
            <p class="text-gray-600 text-xs mt-1">Discover unique handmade items</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow text-center">
            <div class="text-3xl mb-2">💰</div>
            <h3 class="font-bold text-amber-900 text-sm">Secure Payment</h3>
            <p class="text-gray-600 text-xs mt-1">Safe & protected transactions</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow text-center">
            <div class="text-3xl mb-2">⭐</div>
            <h3 class="font-bold text-amber-900 text-sm">Leave Reviews</h3>
            <p class="text-gray-600 text-xs mt-1">Share your feedback</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  form = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER'
  };

  loading = false;
  error = '';

  onRegister() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.form).subscribe({
      next: (user) => {
        this.authService.setCurrentUser(user);
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
