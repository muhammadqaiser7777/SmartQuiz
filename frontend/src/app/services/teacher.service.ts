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
}
