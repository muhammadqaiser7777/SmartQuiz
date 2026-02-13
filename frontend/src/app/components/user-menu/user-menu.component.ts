import { Component, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-user-menu',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-menu.component.html',
    styleUrl: './user-menu.component.css'
})
export class UserMenuComponent {
    isOpen = signal(false);
    user: any;
    private router = inject(Router);

    constructor() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            this.user = JSON.parse(userStr);
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const container = document.querySelector('.user-menu-container');
        if (container && !container.contains(target)) {
            this.isOpen.set(false);
        }
    }

    toggleMenu(event: Event) {
        event.stopPropagation();
        this.isOpen.update(v => !v);
    }

    logout() {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/login']);
    }
}
