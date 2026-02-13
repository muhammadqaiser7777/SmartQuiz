import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class DashboardComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    currentRoute: string = 'dashboard';
    isSidebarOpen: boolean = false;

    constructor() {
        this.router.events.subscribe(() => {
            this.currentRoute = this.router.url.split('/')[1] || 'dashboard';
            // Close sidebar on route change (mobile)
            this.closeSidebar();
        });
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    closeSidebar() {
        this.isSidebarOpen = false;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
