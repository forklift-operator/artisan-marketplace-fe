import { Routes } from '@angular/router';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';
import { CatalogPage } from './pages/catalog.page';
import { ProductDetailPage } from './pages/product-detail.page';
import { AddProductPage } from './pages/add-product.page';
import { OrdersPage } from './pages/orders.page';
import { ProfilePage } from './pages/profile.page';
import { VendorDashboardPage } from './pages/vendor-dashboard.page';
import { EditProductPage } from './pages/edit-product.page';

export const routes: Routes = [
  { path: '', redirectTo: '/catalog', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'catalog', component: CatalogPage },
  { path: 'product/:id', component: ProductDetailPage },
  { path: 'add-product', component: AddProductPage },
  { path: 'my-orders', component: OrdersPage },
  { path: 'profile', component: ProfilePage },
  { path: 'vendor/dashboard', component: VendorDashboardPage },
  { path: 'vendor/product/:id/edit', component: EditProductPage },
  { path: '**', redirectTo: '/catalog' }
];
