import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassesService, Class } from '../services/classes.service';
import { ToastService } from '../services/toast.service';
import { CourseSelectModalComponent } from '../components/course-select-modal/course-select-modal.component';

@Component({
    selector: 'app-classes',
    standalone: true,
    imports: [CommonModule, FormsModule, CourseSelectModalComponent],
    templateUrl: './classes.html',
    styleUrl: './classes.css'
})
export class ClassesComponent implements OnInit {
    classes: Class[] = [];
    showForm = false;
    formName = '';
    editingId: number | null = null;
    loading = false;
    error: string | null = null;

    // Pagination
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    limit = 20;

    // Search
    searchTerm = '';

    // Modal state
    showCourseModal = false;
    selectedClassId: number | null = null;
    selectedClassName: string = '';

    constructor(
        private classesService: ClassesService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadClasses();
    }

    loadClasses() {
        this.loading = true;
        this.error = null;
        this.classesService.getClasses(this.currentPage, this.limit, this.searchTerm).subscribe({
            next: (response) => {

                this.classes = response.data;
                this.totalPages = response.totalPages;
                this.totalItems = response.total;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading classes:', err);
                this.error = 'Failed to load classes';
                this.loading = false;
                this.cdr.detectChanges();
                this.toastService.error('Failed to load classes');
            }
        });
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.loadClasses();
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
        this.loadClasses();
    }

    showCreateForm() {
        this.showForm = true;
        this.formName = '';
        this.editingId = null;
    }

    editClass(cls: Class) {
        this.showForm = true;
        this.formName = cls.name;
        this.editingId = cls.id;
    }

    cancelForm() {
        this.showForm = false;
        this.formName = '';
        this.editingId = null;
    }

    saveClass() {
        if (!this.formName.trim()) return;

        // Frontend validation: Check for duplicate name
        const trimmedName = this.formName.trim().toLowerCase();
        const duplicateClass = this.classes.find(c => 
            c.name.toLowerCase() === trimmedName && 
            c.id !== this.editingId
        );
        
        if (duplicateClass) {
            this.toastService.error('A class with this name already exists');
            return;
        }

        if (this.editingId) {
            this.classesService.updateClass(this.editingId, this.formName).subscribe({
                next: (updatedClass) => {
                    const index = this.classes.findIndex(c => c.id === this.editingId);
                    if (index !== -1) {
                        this.classes[index] = updatedClass;
                    }
                    this.formName = '';
                    this.editingId = null;
                    this.cdr.detectChanges();
                    this.toastService.success('Class updated successfully');
                },
                error: (err) => {
                    console.error('Error updating class:', err);
                    // Handle duplicate name error from backend
                    if (err.status === 409) {
                        this.toastService.error('A class with this name already exists');
                    } else {
                        this.toastService.error('Failed to update class');
                    }
                }
            });
        } else {
            this.classesService.createClass(this.formName).subscribe({
                next: (newClass) => {
                    this.classes = [...this.classes, newClass];
                    this.formName = '';
                    this.cdr.detectChanges();
                    this.toastService.success('Class created successfully');
                },
                error: (err) => {
                    console.error('Error creating class:', err);
                    // Handle duplicate name error from backend
                    if (err.status === 409) {
                        this.toastService.error('A class with this name already exists');
                    } else {
                        this.toastService.error('Failed to create class');
                    }
                }
            });
        }
    }

    deleteClass(id: number) {
        if (confirm('Are you sure you want to delete this class?')) {
            this.classesService.deleteClass(id).subscribe({
                next: () => {
                    this.classes = this.classes.filter(c => c.id !== id);
                    this.toastService.success('Class deleted successfully');
                },
                error: (err) => {
                    console.error('Error deleting class:', err);
                    this.toastService.error('Failed to delete class');
                }
            });
        }
    }

    openCourseModal(cls: Class) {
        this.selectedClassId = cls.id;
        this.selectedClassName = cls.name;
        this.showCourseModal = true;
    }

    closeCourseModal() {
        this.showCourseModal = false;
        this.selectedClassId = null;
        this.selectedClassName = '';
    }

    onCoursesUpdated() {
        // Optionally refresh data or show notification
    }
}
