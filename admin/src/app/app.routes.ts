import { Routes } from '@angular/router';
// Change 'login.component' to just 'login' to match your file name
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard'; // Assuming this exists or create it
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];