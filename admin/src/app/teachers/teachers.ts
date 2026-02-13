import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Teacher } from '../services/api';
import { AuthService } from '../services/auth';

@Component({
    selector: 'app-teachers',
    standalone: true,
    imports: [CommonModule],
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

        this.http.get<Teacher[]>(`${this.apiUrl}/teachers`, {
            headers: this.getHeaders()
        }).subscribe({
            next: (data) => {
                this.teachers = data;
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
}
