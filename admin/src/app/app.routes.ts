import { Routes } from '@angular/router';
// Change 'login.component' to just 'login' to match your file name
import { LoginComponent } from './login/login'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];