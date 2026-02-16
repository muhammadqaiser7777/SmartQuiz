import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Teacher } from '../services/api';
import { AuthService } from '../services/auth';

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Component({
    selector: 'app-teachers',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './teachers.html',
    styleUrls: ['./teachers.css']
})
export class TeachersComponent implements OnInit {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);
    private apiUrl = 'http://localhost:2001/admin';

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    teachers: Teacher[] = [];
    loading = true;
    error: string | null = null;

    // Pagination
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    limit = 20;

    // Search
    searchTerm = '';

    ngOnInit() {
        this.loadTeachers();
    }

    loadTeachers() {
        this.loading = true;
        this.error = null;

        const token = this.authService.getToken();
        if (!token) {
            this.error = 'Not authenticated. Please login first.';
            this.loading = false;
            console.error('No token found');
            this.cdr.detectChanges();
            return;
        }

        let url = `${this.apiUrl}/teachers?page=${this.currentPage}&limit=${this.limit}`;
        if (this.searchTerm) {
            url += `&search=${encodeURIComponent(this.searchTerm)}`;
        }

        this.http.get<PaginatedResponse<Teacher>>(url, {
            headers: this.getHeaders()
        }).subscribe({
            next: (response) => {
                this.teachers = response.data;
                this.totalPages = response.totalPages;
                this.totalItems = response.total;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading teachers:', err);
                this.error = err.status === 401
                    ? 'Unauthorized. Please login again.'
                    : 'Failed to load teachers';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.loadTeachers();
        }
    }

    nextPage() {
        this.goToPage(this.currentPage + 1);
    }

    prevPage() {
        this.goToPage(this.currentPage - 1);
    }

    search() {
        this.currentPage = 1;
        this.loadTeachers();
    }
}
