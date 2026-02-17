import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Student } from '../services/api';
import { AuthService } from '../services/auth';
import { ClassSelectModalComponent } from '../components/class-select-modal/class-select-modal.component';

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Component({
    selector: 'app-students',
    standalone: true,
    imports: [CommonModule, FormsModule, ClassSelectModalComponent],
    templateUrl: './students.html',
    styleUrls: ['./students.css']
})
export class StudentsComponent implements OnInit {
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

    students: Student[] = [];
    loading = true;
    error: string | null = null;

    // Pagination
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    limit = 20;

    // Search
    searchTerm = '';

    // Modal state
    showClassModal = false;
    selectedStudent: Student | null = null;

    ngOnInit() {
        this.loadStudents();
    }

    loadStudents() {
        this.loading = true;
        this.error = null;

        const token = this.authService.getToken();
        if (!token) {
            this.error = 'Not authenticated. Please login first.';
            this.loading = false;
            this.cdr.detectChanges();
            return;
        }


        let url = `${this.apiUrl}/students?page=${this.currentPage}&limit=${this.limit}`;
        if (this.searchTerm) {
            url += `&search=${encodeURIComponent(this.searchTerm)}`;
        }

        this.http.get<PaginatedResponse<Student>>(url, {
            headers: this.getHeaders()
        }).subscribe({
            next: (response) => {

                this.students = response.data;
                this.totalPages = response.totalPages;
                this.totalItems = response.total;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = err.status === 401
                    ? 'Unauthorized. Please login again.'
                    : 'Failed to load students';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.loadStudents();
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
        this.loadStudents();
    }

    openClassModal(student: Student) {
        this.selectedStudent = student;
        this.showClassModal = true;
    }

    closeClassModal() {
        this.showClassModal = false;
        this.selectedStudent = null;
    }

    onClassAssigned(event: { classId: number; className: string }) {
        if (this.selectedStudent) {
            const studentIndex = this.students.findIndex(s => s.id === this.selectedStudent!.id);
            if (studentIndex !== -1) {
                this.students[studentIndex] = {
                    ...this.students[studentIndex],
                    classId: event.classId || null,
                    className: event.className || null
                };
            }
        }
        this.closeClassModal();
        this.cdr.detectChanges();
    }
}
