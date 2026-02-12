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
    event.preventDefault(); // Stop page refresh

    this.authService.login(this.loginData.username, this.loginData.password).subscribe({
      next: (response) => {
        console.log('Login Success!', response);
        // Navigate to a dashboard or home page after login
        // this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
        console.error('Login Error:', err);
      }
    });
  }

}
