import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
      <div class="max-w-md mx-auto">
        <div class="card-artisan p-8 shadow-xl">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="text-5xl mb-4">🔐</div>
            <h1 class="text-3xl font-bold text-amber-900">Welcome Back</h1>
            <p class="text-gray-600 text-sm mt-2">Sign in to your artisan account</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onLogin()" class="space-y-6">
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

            <button 
              type="submit" 
              [disabled]="loading"
              class="w-full btn-primary font-bold py-3 text-white transition-all"
            >
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <!-- Error Message -->
          <div *ngIf="error" class="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
            {{ error }}
          </div>

          <!-- Sign Up Link -->
          <div class="mt-6 text-center">
            <p class="text-gray-600 text-sm">
              Don't have an account?
              <a routerLink="/register" class="text-amber-700 font-bold hover:text-amber-900 transition">
                Create one
              </a>
            </p>
          </div>
        </div>

        <!-- Testimonial -->
        <div class="mt-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-amber-700">
          <p class="text-gray-700 italic text-sm mb-3">"Supporting artisans has never been easier!"</p>
          <p class="text-amber-900 font-semibold text-xs">— Sarah M., Happy Customer</p>
        </div>
      </div>
    </div>
  `
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  form = {
    email: '',
    password: ''
  };

  loading = false;
  error = '';

  onLogin() {
    if (!this.form.email || !this.form.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.form).subscribe({
      next: (user) => {
        this.authService.setCurrentUser(user);
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}
