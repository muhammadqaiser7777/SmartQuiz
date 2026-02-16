import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService, Course } from '../services/courses.service';
import { ToastService } from '../services/toast.service';

@Component({
    selector: 'app-courses',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './courses.html',
    styleUrl: './courses.css'
})
export class CoursesComponent implements OnInit {
    courses: Course[] = [];
    showForm = false;
    formName = '';
    editingId: number | null = null;
    loading = false;
    error: string | null = null;

    constructor(
        private coursesService: CoursesService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadCourses();
    }

    loadCourses() {
        this.loading = true;
        this.error = null;
        this.coursesService.getCourses().subscribe({
            next: (data) => {
                this.courses = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading courses:', err);
                this.error = 'Failed to load courses';
                this.loading = false;
                this.cdr.detectChanges();
                this.toastService.error('Failed to load courses');
            }
        });
    }

    showCreateForm() {
        this.showForm = true;
        this.formName = '';
        this.editingId = null;
    }

    editCourse(course: Course) {
        this.showForm = true;
        this.formName = course.name;
        this.editingId = course.id;
    }

    cancelForm() {
        this.showForm = false;
        this.formName = '';
        this.editingId = null;
    }

    saveCourse() {
        if (!this.formName.trim()) return;

        if (this.editingId) {
            this.coursesService.updateCourse(this.editingId, this.formName).subscribe({
                next: (updatedCourse) => {
                    const index = this.courses.findIndex(c => c.id === this.editingId);
                    if (index !== -1) {
                        this.courses[index] = updatedCourse;
                    }
                    this.formName = '';
                    this.editingId = null;
                    this.cdr.detectChanges();
                    this.toastService.success('Course updated successfully');
                },
                error: (err) => {
                    console.error('Error updating course:', err);
                    this.toastService.error('Failed to update course');
                }
            });
        } else {
            this.coursesService.createCourse(this.formName).subscribe({
                next: (newCourse) => {
                    this.courses = [...this.courses, newCourse];
                    this.formName = '';
                    this.cdr.detectChanges();
                    this.toastService.success('Course created successfully');
                },
                error: (err) => {
                    console.error('Error creating course:', err);
                    this.toastService.error('Failed to create course');
                }
            });
        }
    }

    deleteCourse(id: number) {
        if (confirm('Are you sure you want to delete this course?')) {
            this.coursesService.deleteCourse(id).subscribe({
                next: () => {
                    this.courses = this.courses.filter(c => c.id !== id);
                    this.toastService.success('Course deleted successfully');
                },
                error: (err) => {
                    console.error('Error deleting course:', err);
                    this.toastService.error('Failed to delete course');
                }
            });
        }
    }
}
