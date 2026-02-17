import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Point this to your NestJS backend (AdminController route)
  private apiUrl = 'http://localhost:2001/admin';
  private tokenCheckSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {
    // Check token expiration on app start
    this.initializeTokenCheck();
  }

  private initializeTokenCheck(): void {
    // Check token expiration every minute
    this.tokenCheckSubscription = interval(60000).subscribe(() => {
      if (this.isTokenExpired()) {
        this.logout();
      }
    });
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const expirationDate = new Date(decoded.exp * 1000);
    return expirationDate <= new Date();
  }

  getTokenExpirationDate(): Date | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  }

  getSecondsUntilExpiration(): number | null {
    const expirationDate = this.getTokenExpirationDate();
    if (!expirationDate) {
      return null;
    }

    const now = new Date();
    const diff = expirationDate.getTime() - now.getTime();
    return Math.floor(diff / 1000);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // Also check if token is expired
    return !this.isTokenExpired();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    // Optionally redirect to login page
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
