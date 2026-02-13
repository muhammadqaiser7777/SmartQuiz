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


  onLogin(event: Event) {
    event.preventDefault();
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
