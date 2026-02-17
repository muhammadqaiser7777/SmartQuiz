import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassesService, Class } from '../../services/classes.service';
import { ToastService } from '../../services/toast.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-class-select-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './class-select-modal.component.html',
    styleUrl: './class-select-modal.component.css'
})
export class ClassSelectModalComponent implements OnInit {
    @Input() studentId!: string;
    @Input() studentName: string = '';
    @Input() currentClassId: number | null = null;
    @Input() currentClassName: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() classAssigned = new EventEmitter<{ classId: number; className: string }>();

    allClasses: Class[] = [];
    filteredClasses: Class[] = [];
    searchTerm = '';
    selectedClassId: number | null = null;
    loading = false;
    loadingClasses = false;

    private apiUrl = 'http://localhost:2001/admin';

    constructor(
        private classesService: ClassesService,
        private toastService: ToastService,
        private http: HttpClient,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadClasses();
    }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    loadClasses() {
        this.loadingClasses = true;
        // Get all classes with high limit for modal
        this.classesService.getClasses(1, 1000, this.searchTerm).subscribe({
            next: (response) => {
                this.allClasses = response.data;
                this.filteredClasses = response.data;
                this.loadingClasses = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.toastService.error('Failed to load classes');
                this.loadingClasses = false;
                this.cdr.detectChanges();
            }
        });
    }

    searchClasses() {
        const term = this.searchTerm.toLowerCase();
        this.filteredClasses = this.allClasses.filter(cls =>
            cls.name.toLowerCase().includes(term)
        );
    }

    selectClass(classId: number) {
        this.selectedClassId = classId;
    }

    isClassSelected(classId: number): boolean {
        return this.selectedClassId === classId;
    }

    isCurrentClass(classId: number): boolean {
        return this.currentClassId === classId;
    }

    getSelectedClassName(): string {
        if (!this.selectedClassId) return '';
        const cls = this.allClasses.find(c => c.id === this.selectedClassId);
        return cls?.name || '';
    }

    assignClass() {
        if (!this.selectedClassId) {
            this.toastService.error('Please select a class');
            return;
        }

        this.loading = true;
        const selectedClass = this.allClasses.find(c => c.id === this.selectedClassId);

        this.http.post(`${this.apiUrl}/students/${this.studentId}/assign-class`,
            { classId: this.selectedClassId },
            { headers: this.getHeaders() }
        ).subscribe({
            next: () => {
                this.toastService.success('Class assigned successfully');
                this.classAssigned.emit({
                    classId: this.selectedClassId!,
                    className: selectedClass?.name || ''
                });
                this.loading = false;
            },
            error: (err) => {
                this.toastService.error('Failed to assign class');
                this.loading = false;
            }
        });
    }

    removeClass() {
        if (confirm('Are you sure you want to remove this student from their class?')) {
            this.loading = true;
            this.http.delete(`${this.apiUrl}/students/${this.studentId}/remove-class`,
                { headers: this.getHeaders() }
            ).subscribe({
                next: () => {
                    this.toastService.success('Class removed successfully');
                    this.classAssigned.emit({ classId: 0, className: '' });
                    this.loading = false;
                },
                error: (err) => {
                    this.toastService.error('Failed to remove class');
                    this.loading = false;
                }
            });
        }
    }

    closeModal() {
        this.close.emit();
    }
}
