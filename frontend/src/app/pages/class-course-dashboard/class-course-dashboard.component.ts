import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';
import { TeacherService, TeacherAssignment, Quiz, PaginatedQuizzes } from '../../services/teacher.service';
import { QuizCreateModalComponent } from '../../components/quiz-create-modal/quiz-create-modal.component';
import { QuizViewModalComponent } from '../../components/quiz-view-modal/quiz-view-modal.component';

@Component({
    selector: 'app-class-course-dashboard',
    standalone: true,
    imports: [CommonModule, UserMenuComponent, RouterModule, QuizCreateModalComponent, QuizViewModalComponent],
    templateUrl: './class-course-dashboard.component.html',
    styleUrls: ['./class-course-dashboard.component.css']
})
export class ClassCourseDashboardComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private teacherService = inject(TeacherService);

    assignment: TeacherAssignment | null = null;
    quizzes: Quiz[] = [];
    loading = true;
    error = '';
    showQuizModal = false;
    showViewModal = false;
    selectedQuizId = '';

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const assignmentId = parseInt(id, 10);
            if (!isNaN(assignmentId)) {
                this.loadAssignment(assignmentId);
            } else {
                this.error = 'Invalid assignment ID';
                this.loading = false;
            }
        } else {
            this.error = 'No assignment ID provided';
            this.loading = false;
        }
    }

    loadAssignment(id: number): void {
        this.teacherService.getAssignmentById(id).subscribe({
            next: (assignment) => {
                this.assignment = assignment;
                // Load quizzes after getting assignment details
                this.loadQuizzes();
            },
            error: (err) => {
                this.error = 'Failed to load assignment details';
                this.loading = false;
            }
        });
    }

    loadQuizzes(): void {
        if (this.assignment) {
            this.teacherService.getQuizzes(this.assignment.classId, this.assignment.courseId).subscribe({
                next: (response: PaginatedQuizzes) => {
                    this.quizzes = response.data;
                    this.loading = false;
                },
                error: (err) => {
                    this.quizzes = [];
                    this.loading = false;
                }
            });
        } else {
            this.loading = false;
        }
    }

    goBack(): void {
        this.router.navigate(['/teacher-dashboard']);
    }

    openQuizModal(): void {
        this.showQuizModal = true;
    }

    closeQuizModal(): void {
        this.showQuizModal = false;
    }

    onQuizCreated(quiz: Quiz): void {
        this.quizzes.push(quiz);
    }

    openViewModal(quizId: string): void {
        this.selectedQuizId = quizId;
        this.showViewModal = true;
    }

    closeViewModal(): void {
        this.showViewModal = false;
        this.selectedQuizId = '';
    }

    formatDateTime(isoString: string): string {
        const date = new Date(isoString);
        return date.toLocaleString();
    }

    isQuizActive(quiz: Quiz): boolean {
        const now = new Date();
        const startTime = new Date(quiz.startTime);
        const endTime = new Date(quiz.endTime);
        return now >= startTime && now <= endTime;
    }

    isQuizExpired(quiz: Quiz): boolean {
        const now = new Date();
        const endTime = new Date(quiz.endTime);
        return now > endTime;
    }

    getQuizStatus(quiz: Quiz): string {
        const now = new Date();
        const startTime = new Date(quiz.startTime);
        const endTime = new Date(quiz.endTime);

        if (now < startTime) {
            return 'Upcoming';
        } else if (now >= startTime && now <= endTime) {
            return 'Active';
        } else {
            return 'Expired';
        }
    }
}
