import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService, Course } from '../../services/courses.service';
import { ClassesService, ClassCourse } from '../../services/classes.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-course-select-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './course-select-modal.component.html',
    styleUrl: './course-select-modal.component.css'
})
export class CourseSelectModalComponent implements OnInit {
    @Input() classId!: number;
    @Input() className: string = '';
    @Output() close = new EventEmitter<void>();
    @Output() coursesUpdated = new EventEmitter<void>();

    showAssignModal = false;
    assignedCourses: ClassCourse[] = [];
    allCourses: Course[] = [];
    filteredCourses: Course[] = [];
    searchTerm = '';
    selectedCourseIds: number[] = [];
    loading = false;
    loadingAssigned = false;
    loadingAll = false;

    constructor(
        private coursesService: CoursesService,
        private classesService: ClassesService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadAssignedCourses();
        this.loadAllCourses();
    }

    loadAssignedCourses() {
        this.loadingAssigned = true;
        this.classesService.getClassCourses(this.classId).subscribe({
            next: (courses) => {
                this.assignedCourses = courses;
                this.loadingAssigned = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading assigned courses:', err);
                this.toastService.error('Failed to load assigned courses');
                this.loadingAssigned = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadAllCourses() {
        this.loadingAll = true;
        this.coursesService.getCourses(1, 100).subscribe({
            next: (response) => {
                this.allCourses = response.data;
                this.filteredCourses = response.data;
                this.loadingAll = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading courses:', err);
                this.toastService.error('Failed to load courses');
                this.loadingAll = false;
                this.cdr.detectChanges();
            }
        });
    }

    searchCourses() {
        const term = this.searchTerm.toLowerCase();
        this.filteredCourses = this.allCourses.filter(course =>
            course.name.toLowerCase().includes(term)
        );
    }

    toggleCourseSelection(courseId: number) {
        const index = this.selectedCourseIds.indexOf(courseId);
        if (index === -1) {
            this.selectedCourseIds.push(courseId);
        } else {
            this.selectedCourseIds.splice(index, 1);
        }
    }

    isCourseSelected(courseId: number): boolean {
        return this.selectedCourseIds.includes(courseId);
    }

    isCourseAssigned(courseId: number): boolean {
        return this.assignedCourses.some(ac => ac.courseId === courseId);
    }

    assignSelectedCourses() {
        if (this.selectedCourseIds.length === 0) {
            this.toastService.error('Please select at least one course');
            return;
        }

        this.loading = true;
        const assignPromises = this.selectedCourseIds.map(courseId =>
            this.classesService.assignCourseToClass(courseId, this.classId).toPromise()
        );

        Promise.all(assignPromises).then(() => {
            this.toastService.success('Courses assigned successfully');
            this.showAssignModal = false;
            this.selectedCourseIds = [];
            this.loadAssignedCourses();
            this.coursesUpdated.emit();
            this.loading = false;
        }).catch((err) => {
            console.error('Error assigning courses:', err);
            this.toastService.error('Failed to assign courses');
            this.loading = false;
        });
    }

    unassignCourse(courseId: number) {
        if (confirm('Are you sure you want to unassign this course from this class?')) {
            this.classesService.unassignCourseFromClass(courseId, this.classId).subscribe({
                next: () => {
                    this.assignedCourses = this.assignedCourses.filter(ac => ac.courseId !== courseId);
                    this.toastService.success('Course unassigned successfully');
                    this.coursesUpdated.emit();
                },
                error: (err) => {
                    console.error('Error unassigning course:', err);
                    this.toastService.error('Failed to unassign course');
                }
            });
        }
    }

    openAssignModal() {
        this.showAssignModal = true;
        this.searchTerm = '';
        this.selectedCourseIds = [];
        // Filter out already assigned courses
        this.filteredCourses = this.allCourses.filter(course =>
            !this.isCourseAssigned(course.id)
        );
    }

    closeAssignModal() {
        this.showAssignModal = false;
    }

    closeModal() {
        this.close.emit();
    }
}
