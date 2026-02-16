import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Teacher } from '../services/api';
import { AuthService } from '../services/auth';
import { TeacherAssignmentsService, TeacherAssignment, ClassOption, CourseOption } from '../services/teacher-assignments.service';

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
    private teacherAssignmentsService = inject(TeacherAssignmentsService);
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

    // Manage Modal
    showManageModal = false;
    selectedTeacher: Teacher | null = null;
    teacherAssignments: TeacherAssignment[] = [];
    loadingAssignments = false;

    // Add/Edit Modal
    showAssignmentModal = false;
    editingAssignment: TeacherAssignment | null = null;
    availableClasses: ClassOption[] = [];
    availableCourses: CourseOption[] = [];
    filteredCourses: CourseOption[] = [];
    selectedClassId: number | null = null;
    selectedCourseId: number | null = null;
    savingAssignment = false;

    // Search autocomplete
    classSearchTerm = '';
    courseSearchTerm = '';
    filteredClasses: ClassOption[] = [];
    showClassSuggestions = false;
    showCourseSuggestions = false;
    selectedClassName = '';
    selectedCourseName = '';

    ngOnInit() {
        this.loadTeachers();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        this.showClassSuggestions = false;
        this.showCourseSuggestions = false;
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

    // Manage Teacher Assignments
    openManageModal(teacher: Teacher) {
        this.selectedTeacher = teacher;
        this.showManageModal = true;
        this.loadTeacherAssignments();
    }

    closeManageModal() {
        this.showManageModal = false;
        this.selectedTeacher = null;
        this.teacherAssignments = [];
    }

    loadTeacherAssignments() {
        if (!this.selectedTeacher) return;

        this.loadingAssignments = true;
        this.teacherAssignmentsService.getAssignmentsByTeacher(this.selectedTeacher.id).subscribe({
            next: (assignments) => {
                this.teacherAssignments = assignments;
                this.loadingAssignments = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading assignments:', err);
                this.loadingAssignments = false;
                this.cdr.detectChanges();
            }
        });
    }

    openAddAssignmentModal() {
        this.editingAssignment = null;
        this.selectedClassId = null;
        this.selectedCourseId = null;
        this.filteredCourses = [];
        this.loadAvailableClasses();
        this.showAssignmentModal = true;
    }

    openEditAssignmentModal(assignment: TeacherAssignment) {
        this.editingAssignment = assignment;
        this.selectedClassId = assignment.classId;
        this.selectedCourseId = assignment.courseId;
        this.selectedClassName = assignment.className || '';
        this.selectedCourseName = assignment.courseName || '';
        this.classSearchTerm = assignment.className || '';
        this.courseSearchTerm = assignment.courseName || '';
        this.loadAvailableClasses();
        this.loadCoursesByClass(assignment.classId);
        this.showAssignmentModal = true;
    }

    closeAssignmentModal() {
        this.showAssignmentModal = false;
        this.editingAssignment = null;
        this.selectedClassId = null;
        this.selectedCourseId = null;
        this.filteredCourses = [];
        this.classSearchTerm = '';
        this.courseSearchTerm = '';
        this.filteredClasses = [];
        this.selectedClassName = '';
        this.selectedCourseName = '';
    }

    loadAvailableClasses() {
        this.teacherAssignmentsService.getAvailableClasses().subscribe({
            next: (classes) => {
                this.availableClasses = classes;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading classes:', err)
        });
    }

    searchClasses() {
        const term = this.classSearchTerm.toLowerCase();
        if (!term) {
            this.filteredClasses = [];
            this.showClassSuggestions = false;
            return;
        }

        // Filter classes based on search term and limit to 3
        this.filteredClasses = this.availableClasses
            .filter(cls => cls.name.toLowerCase().includes(term))
            .slice(0, 3);
        this.showClassSuggestions = this.filteredClasses.length > 0;
    }

    searchCourses() {
        if (!this.selectedClassId) {
            return;
        }

        const term = this.courseSearchTerm.toLowerCase();
        if (!term) {
            this.filteredCourses = [];
            this.showCourseSuggestions = false;
            return;
        }

        // Load courses for the selected class and filter
        this.teacherAssignmentsService.getCoursesByClass(this.selectedClassId).subscribe({
            next: (courses) => {
                this.filteredCourses = courses
                    .filter(course => course.name.toLowerCase().includes(term))
                    .slice(0, 3);
                this.showCourseSuggestions = this.filteredCourses.length > 0;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading courses:', err)
        });
    }

    selectClass(cls: ClassOption) {
        this.selectedClassId = cls.id;
        this.selectedClassName = cls.name;
        this.classSearchTerm = cls.name;
        this.showClassSuggestions = false;

        // Reset course selection
        this.selectedCourseId = null;
        this.selectedCourseName = '';
        this.courseSearchTerm = '';
        this.filteredCourses = [];
    }

    selectCourse(course: CourseOption) {
        this.selectedCourseId = course.id;
        this.selectedCourseName = course.name;
        this.courseSearchTerm = course.name;
        this.showCourseSuggestions = false;
    }

    onClassChange() {
        this.selectedCourseId = null;
        if (this.selectedClassId) {
            this.loadCoursesByClass(this.selectedClassId);
        } else {
            this.filteredCourses = [];
        }
    }

    loadCoursesByClass(classId: number) {
        this.teacherAssignmentsService.getCoursesByClass(classId).subscribe({
            next: (courses) => {
                this.filteredCourses = courses;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading courses:', err)
        });
    }

    saveAssignment() {
        if (!this.selectedTeacher || !this.selectedClassId || !this.selectedCourseId) {
            return;
        }

        this.savingAssignment = true;

        if (this.editingAssignment) {
            // Update existing assignment
            this.teacherAssignmentsService.updateAssignment(this.editingAssignment.id, {
                classId: this.selectedClassId,
                courseId: this.selectedCourseId
            }).subscribe({
                next: () => {
                    this.savingAssignment = false;
                    this.closeAssignmentModal();
                    this.loadTeacherAssignments();
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error updating assignment:', err);
                    this.savingAssignment = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            // Create new assignment
            this.teacherAssignmentsService.createAssignment({
                teacherId: this.selectedTeacher.id,
                classId: this.selectedClassId,
                courseId: this.selectedCourseId
            }).subscribe({
                next: () => {
                    this.savingAssignment = false;
                    this.closeAssignmentModal();
                    this.loadTeacherAssignments();
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error creating assignment:', err);
                    this.savingAssignment = false;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    deleteAssignment(assignment: TeacherAssignment) {
        if (!confirm(`Are you sure you want to remove this assignment?`)) {
            return;
        }

        this.teacherAssignmentsService.deleteAssignment(assignment.id).subscribe({
            next: () => {
                this.loadTeacherAssignments();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error deleting assignment:', err);
                this.cdr.detectChanges();
            }
        });
    }
}
