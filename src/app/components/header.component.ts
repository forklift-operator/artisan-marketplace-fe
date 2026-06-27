import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 text-white shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <!-- Logo/Brand -->
          <div class="flex items-center gap-3">
            <div class="text-3xl">🎨</div>
            <div>
              <h1 class="text-2xl font-bold tracking-tight">Artisan Market</h1>
              <p class="text-xs text-amber-100">Handmade with love</p>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <a routerLink="/catalog" routerLinkActive="text-yellow-300" [routerLinkActiveOptions]="{exact: true}"
               class="hover:text-yellow-300 transition-colors duration-200">
              Browse
            </a>
            <a *ngIf="(authService.currentUser$ | async)" routerLink="/my-orders"
               routerLinkActive="text-yellow-300"
               class="hover:text-yellow-300 transition-colors duration-200">
              My Orders
            </a>
            <ng-container *ngIf="(authService.currentUser$ | async) as user">
              <a *ngIf="user?.role === 'VENDOR'"
                 routerLink="/vendor/dashboard"
                 routerLinkActive="text-yellow-300"
                 class="hover:text-yellow-300 transition-colors duration-200">
                Dashboard
              </a>
              <a *ngIf="user?.role === 'ADMIN'"
                 routerLink="/admin"
                 routerLinkActive="text-yellow-300"
                 class="hover:text-yellow-300 transition-colors duration-200">
                Admin
              </a>
            </ng-container>
          </nav>

          <!-- Auth Section -->
          <div class="flex items-center gap-4">
            <div *ngIf="authService.currentUser$ | async as user" class="flex items-center gap-3">
              <!-- Profile Icon/Link -->
              <a routerLink="/profile" class="flex items-center gap-2 hover:opacity-80 transition">
                <div class="text-2xl">{{ getRoleEmoji(user.role) }}</div>
                <div class="hidden sm:block">
                  <p class="text-xs text-amber-100">{{ user.firstName }}</p>
                  <p class="text-xs font-bold">{{ user.role }}</p>
                </div>
              </a>

              <!-- Logout Button -->
              <button (click)="logout()"
                class="btn-secondary bg-red-600 hover:bg-red-700 border-0 px-4 py-2 text-sm">
                Logout
              </button>
            </div>
            <div *ngIf="!(authService.currentUser$ | async)" class="flex gap-2">
              <a routerLink="/login"
                class="btn-secondary px-4 py-2 text-sm">
                Login
              </a>
              <a routerLink="/register"
                class="btn-primary px-4 py-2 text-sm">
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/catalog';
    });
  }

  getRoleEmoji(role: string): string {
    const emojis: Record<string, string> = {
      'USER': '👤',
      'VENDOR': '🎨',
      'ADMIN': '👑'
    };
    return emojis[role] || '👤';
  }
}
