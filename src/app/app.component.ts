import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {HeaderComponent} from './header/header.component';
import {CartComponent} from './cart/cart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, CartComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-amber-50">
      <app-header></app-header>
      <app-cart></app-cart>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
}

