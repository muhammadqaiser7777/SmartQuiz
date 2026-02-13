import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Required for [(ngModel)]
import { AuthService } from '../services/auth'; // Import your service
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  loginData = { username: '', password: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  validateForm(): boolean {
    // Check if fields are non-empty
    if (!this.loginData.username.trim()) {
      this.errorMessage = 'Username is required';
      return false;
    }

    if (!this.loginData.password.trim()) {
      this.errorMessage = 'Password is required';
      return false;
    }

    // Check if password is at least 8 characters
    if (this.loginData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return false;
    }

    // Check if password contains an uppercase letter
    if (!/[A-Z]/.test(this.loginData.password)) {
      this.errorMessage = 'Password must contain at least one uppercase letter';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  onLogin(event: Event) {
    event.preventDefault();

    // Validate form before submitting
    if (!this.validateForm()) {
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('admin', JSON.stringify(response.admin));
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
        console.error('Login failed', err);
      }
    });
  }

}
