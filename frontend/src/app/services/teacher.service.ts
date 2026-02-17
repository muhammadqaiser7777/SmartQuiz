import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeacherAssignment {
    id: number;
    classId: number;
    courseId: number;
    teacherId: string;
    className: string;
    courseName: string;
    totalStudents: number;
    createdAt: Date;
}

export interface PaginatedTeacherAssignments {
    data: TeacherAssignment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Quiz-related interfaces
export interface QuestionDto {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: '1' | '2' | '3' | '4';
}

export interface CreateQuizDto {
    title: string;
    startTime: string;
    endTime: string;
    totalMarks: number;
    classId: number;
    courseId: number;
    questions: QuestionDto[];
}

export interface QuizQuestion {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: '1' | '2' | '3' | '4';
    marks: number;
}

export interface Quiz {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    totalQuestions: number;
    totalMarks: number;
    classId: number;
    className?: string;
    courseId: number;
    courseName?: string;
}

export interface QuizLeaderboardEntry {
    studentId: string;
    studentName: string;
    studentEmail: string;
    obtainedMarks: number;
    totalMarks: number;
    percentage: number;
    rank: number;
}

export interface QuizDetailsWithLeaderboard {
    quiz: {
        id: string;
        title: string;
        startTime: string;
        endTime: string;
        totalQuestions: number;
        totalMarks: number;
        questions: QuizQuestion[];
    };
    leaderboard: QuizLeaderboardEntry[];
    totalSubmissions: number;
    averageMarks: number;
}

export interface PaginatedQuizzes {
    data: Quiz[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class TeacherService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:2001/teacher';

    getAssignments(page: number = 1, limit: number = 10): Observable<PaginatedTeacherAssignments> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<PaginatedTeacherAssignments>(`${this.apiUrl}/assignments`, { params });
    }

    getAssignmentById(id: number): Observable<TeacherAssignment> {
        return this.http.get<TeacherAssignment>(`${this.apiUrl}/assignments/${id}`);
    }

    // Quiz methods
    createQuiz(quizData: CreateQuizDto): Observable<any> {
        return this.http.post(`${this.apiUrl}/quiz`, quizData);
    }

    getQuizzes(classId?: number, courseId?: number, page: number = 1, limit: number = 10): Observable<PaginatedQuizzes> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (classId) {
            params = params.set('classId', classId.toString());
        }
        if (courseId) {
            params = params.set('courseId', courseId.toString());
        }

        return this.http.get<PaginatedQuizzes>(`${this.apiUrl}/quizzes`, { params });
    }

    getQuizById(quizId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/quiz/${quizId}`);
    }

    getQuizDetailsWithLeaderboard(quizId: string): Observable<QuizDetailsWithLeaderboard> {
        return this.http.get<QuizDetailsWithLeaderboard>(`${this.apiUrl}/quiz/${quizId}/details`);
    }
}
