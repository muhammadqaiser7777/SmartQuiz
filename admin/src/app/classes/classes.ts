import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassesService, Class } from '../services/classes.service';
import { ToastService } from '../services/toast.service';

@Component({
    selector: 'app-classes',
    standalone: true,
    imports: [CommonModule, FormsModule],
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
        this.classesService.getClasses().subscribe({
            next: (data) => {
                console.log('Classes loaded:', data);
                this.classes = data;
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

        if (this.editingId) {
            this.classesService.updateClass(this.editingId, this.formName).subscribe({
                next: (updatedClass) => {
                    const index = this.classes.findIndex(c => c.id === this.editingId);
                    if (index !== -1) {
                        this.classes[index] = updatedClass;
                    }
                    this.cancelForm();
                    this.toastService.success('Class updated successfully');
                },
                error: (err) => {
                    console.error('Error updating class:', err);
                    this.toastService.error('Failed to update class');
                }
            });
        } else {
            this.classesService.createClass(this.formName).subscribe({
                next: (newClass) => {
                    this.classes = [...this.classes, newClass];
                    this.cancelForm();
                    this.toastService.success('Class created successfully');
                },
                error: (err) => {
                    console.error('Error creating class:', err);
                    this.toastService.error('Failed to create class');
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
}
