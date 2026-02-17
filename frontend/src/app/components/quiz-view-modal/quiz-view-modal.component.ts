import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherService, QuizDetailsWithLeaderboard, QuizLeaderboardEntry, QuizQuestion } from '../../services/teacher.service';

type TabType = 'details' | 'leaderboard';

@Component({
    selector: 'app-quiz-view-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './quiz-view-modal.component.html',
    styleUrls: ['./quiz-view-modal.component.css']
})
export class QuizViewModalComponent implements OnInit {
    @Input() quizId!: string;
    @Output() close = new EventEmitter<void>();

    private teacherService = inject(TeacherService);

    quizDetails: QuizDetailsWithLeaderboard | null = null;
    loading = true;
    error = '';
    activeTab: TabType = 'details';

    // Helper getters for template
    get quizTitle(): string {
        return this.quizDetails?.quiz?.title || 'Quiz Details';
    }

    get quizQuestions(): QuizQuestion[] {
        return this.quizDetails?.quiz?.questions || [];
    }

    get leaderboard(): QuizLeaderboardEntry[] {
        return this.quizDetails?.leaderboard || [];
    }

    get totalSubmissions(): number {
        return this.quizDetails?.totalSubmissions || 0;
    }

    get averageMarks(): number {
        return this.quizDetails?.averageMarks || 0;
    }

    get totalQuestions(): number {
        return this.quizDetails?.quiz?.totalQuestions || 0;
    }

    get totalMarks(): number {
        return this.quizDetails?.quiz?.totalMarks || 0;
    }

    get startTime(): string {
        return this.quizDetails?.quiz?.startTime || '';
    }

    get endTime(): string {
        return this.quizDetails?.quiz?.endTime || '';
    }

    ngOnInit(): void {
        this.loadQuizDetails();
    }

    loadQuizDetails(): void {
        this.loading = true;
        this.error = '';

        this.teacherService.getQuizDetailsWithLeaderboard(this.quizId).subscribe({
            next: (data) => {
                this.quizDetails = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to load quiz details';
                this.loading = false;
            }
        });
    }

    setActiveTab(tab: TabType): void {
        this.activeTab = tab;
    }

    getCorrectAnswerLabel(correctOption: string): string {
        const labels: { [key: string]: string } = {
            '1': 'A',
            '2': 'B',
            '3': 'C',
            '4': 'D'
        };
        return labels[correctOption] || correctOption;
    }

    formatDateTime(isoString: string): string {
        const date = new Date(isoString);
        return date.toLocaleString();
    }

    closeModal(): void {
        this.close.emit();
    }
}
