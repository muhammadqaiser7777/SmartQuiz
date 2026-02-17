import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

export interface User {
    role: 'student' | 'teacher';
    token: string;
    name: string;
    email: string;
    picture: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {
    private router = inject(Router);
    private tokenCheckSubscription: Subscription | null = null;

    constructor() {
        // Check token expiration on app start
        this.initializeTokenCheck();
    }

    ngOnDestroy(): void {
        this.stopTokenCheck();
    }

    private initializeTokenCheck(): void {
        // Check token expiration every minute
        this.tokenCheckSubscription = interval(60000).subscribe(() => {
            if (this.isTokenExpired()) {
                this.logout();
            }
        });
    }

    private stopTokenCheck(): void {
        if (this.tokenCheckSubscription) {
            this.tokenCheckSubscription.unsubscribe();
            this.tokenCheckSubscription = null;
        }
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
        const user = this.getUser();
        if (!user || !user.token) {
            return true;
        }

        const decoded = this.decodeToken(user.token);
        if (!decoded || !decoded.exp) {
            return true;
        }

        const expirationDate = new Date(decoded.exp * 1000);
        return expirationDate <= new Date();
    }

    getTokenExpirationDate(): Date | null {
        const user = this.getUser();
        if (!user || !user.token) {
            return null;
        }

        const decoded = this.decodeToken(user.token);
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

    getUser(): User | null {
        const userJson = localStorage.getItem('user');
        if (!userJson) {
            return null;
        }
        try {
            return JSON.parse(userJson) as User;
        } catch {
            return null;
        }
    }

    getToken(): string | null {
        const user = this.getUser();
        return user?.token || null;
    }

    isLoggedIn(): boolean {
        const user = this.getUser();
        if (!user || !user.token) {
            return false;
        }
        // Also check if token is expired
        return !this.isTokenExpired();
    }

    logout(): void {
        this.stopTokenCheck();
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
    }

    // Method to restart token check after login
    restartTokenCheck(): void {
        this.stopTokenCheck();
        this.initializeTokenCheck();
    }
}
