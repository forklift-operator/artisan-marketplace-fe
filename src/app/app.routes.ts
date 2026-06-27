import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CatalogComponent } from './catalog/catalog.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { AddProductComponent } from './add-product/add-product.component';
import { OrdersComponent } from './orders/orders.component';
import { ProfileComponent } from './profile/profile.component';
import { VendorDashboardComponent } from './vendor-dashboard/vendor-dashboard.component';
import { EditProductComponent } from './edit-product/edit-product.component';

export const routes: Routes = [
  { path: '', redirectTo: '/catalog', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'add-product', component: AddProductComponent },
  { path: 'my-orders', component: OrdersComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'vendor-dashboard', component: VendorDashboardComponent },
  { path: 'vendor/product/:id/edit', component: EditProductComponent },
  { path: '**', redirectTo: '/catalog' }
];
