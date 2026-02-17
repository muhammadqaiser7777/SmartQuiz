import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService, CreateQuizDto, QuestionDto, Quiz, PaginatedQuizzes } from '../../services/teacher.service';

@Component({
    selector: 'app-quiz-create-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './quiz-create-modal.component.html',
    styleUrls: ['./quiz-create-modal.component.css']
})
export class QuizCreateModalComponent implements OnInit {
    @Input() classId!: number;
    @Input() courseId!: number;
    @Output() close = new EventEmitter<void>();
    @Output() quizCreated = new EventEmitter<Quiz>();

    private teacherService = inject(TeacherService);

    // Quiz form data
    quizTitle = '';
    startTime = '';
    timeLimit = 30; // Default 30 minutes, max 60
    endTime = '';
    totalMarks = 0;

    // Questions
    questions: QuestionDto[] = [];
    currentQuestion: QuestionDto = this.getEmptyQuestion();

    // UI state
    loading = false;
    error = '';

    // Constants
    readonly MAX_TIME_LIMIT = 60;
    readonly MIN_TIME_LIMIT = 1;

    ngOnInit(): void {
        // Set default start time (current time + 1 hour)
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        this.startTime = this.formatDateTimeLocal(oneHourLater);
        this.calculateEndTime();
    }

    getEmptyQuestion(): QuestionDto {
        return {
            question: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: '1'
        };
    }

    formatDateTimeLocal(date: Date): string {
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Convert local datetime to ISO string with timezone
    toISOString(localDateTime: string): string {
        const date = new Date(localDateTime);
        return date.toISOString();
    }

    // Calculate end time based on start time and time limit
    calculateEndTime(): void {
        if (!this.startTime) {
            this.endTime = '';
            return;
        }

        const start = new Date(this.startTime);
        const end = new Date(start.getTime() + this.timeLimit * 60 * 1000);
        this.endTime = this.formatDateTimeLocal(end);
    }

    // Called when start time changes
    onStartTimeChange(): void {
        this.calculateEndTime();
    }

    // Called when time limit changes
    onTimeLimitChange(): void {
        // Enforce max limit
        if (this.timeLimit > this.MAX_TIME_LIMIT) {
            this.timeLimit = this.MAX_TIME_LIMIT;
        }
        if (this.timeLimit < this.MIN_TIME_LIMIT) {
            this.timeLimit = this.MIN_TIME_LIMIT;
        }
        this.calculateEndTime();
    }

    addQuestion(): void {
        if (this.currentQuestion.question.trim() === '') {
            this.error = 'Please enter a question';
            return;
        }
        if (!this.currentQuestion.optionA || !this.currentQuestion.optionB ||
            !this.currentQuestion.optionC || !this.currentQuestion.optionD) {
            this.error = 'Please fill in all 4 options';
            return;
        }

        this.questions.push({ ...this.currentQuestion });
        this.currentQuestion = this.getEmptyQuestion();
        this.error = '';
    }

    removeQuestion(index: number): void {
        this.questions.splice(index, 1);
    }

    createQuiz(): void {
        if (!this.quizTitle.trim()) {
            this.error = 'Please enter a quiz title';
            return;
        }
        if (!this.startTime) {
            this.error = 'Please select start time';
            return;
        }

        // Validate start time is not in the past
        const now = new Date();
        const startDateTime = new Date(this.startTime);
        // Add 2 minute buffer to handle slight delays
        now.setMinutes(now.getMinutes() + 2);

        if (startDateTime <= now) {
            this.error = 'Start time cannot be in the past';
            return;
        }

        // Validate time limit
        if (!this.timeLimit || this.timeLimit < this.MIN_TIME_LIMIT) {
            this.error = 'Time limit must be at least 1 minute';
            return;
        }
        if (this.timeLimit > this.MAX_TIME_LIMIT) {
            this.error = `Time limit cannot exceed ${this.MAX_TIME_LIMIT} minutes`;
            return;
        }

        // Calculate end time and validate gap
        this.calculateEndTime();
        const endDateTime = new Date(this.endTime);
        const diffInMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);

        if (diffInMinutes > this.MAX_TIME_LIMIT) {
            this.error = `The gap between start and end time cannot exceed ${this.MAX_TIME_LIMIT} minutes`;
            return;
        }

        if (this.questions.length === 0) {
            this.error = 'Please add at least one question';
            return;
        }
        if (this.totalMarks <= 0) {
            this.error = 'Please enter total marks';
            return;
        }

        this.loading = true;
        this.error = '';

        const quizData: CreateQuizDto = {
            title: this.quizTitle,
            startTime: this.toISOString(this.startTime),
            endTime: this.toISOString(this.endTime),
            totalMarks: this.totalMarks,
            classId: this.classId,
            courseId: this.courseId,
            questions: this.questions
        };

        this.teacherService.createQuiz(quizData).subscribe({
            next: (response) => {
                this.loading = false;
                this.quizCreated.emit(response.quiz);
                this.close.emit();
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Failed to create quiz. Please try again.';
            }
        });
    }

    closeModal(): void {
        this.close.emit();
    }
}
