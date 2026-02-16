import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface TeacherAssignment {
    id: number;
    classId: number;
    courseId: number;
    teacherId: string;
    className?: string;
    courseName?: string;
    teacherName?: string;
    teacherEmail?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateTeacherAssignmentDto {
    teacherId: string;
    classId: number;
    courseId: number;
}

export interface UpdateTeacherAssignmentDto {
    classId?: number;
    courseId?: number;
}

export interface ClassOption {
    id: number;
    name: string;
}

export interface CourseOption {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class TeacherAssignmentsService {
    private apiUrl = 'http://localhost:2001/admin/teacher-assignments';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    createAssignment(dto: CreateTeacherAssignmentDto): Observable<TeacherAssignment> {
        return this.http.post<TeacherAssignment>(this.apiUrl, dto, { headers: this.getHeaders() });
    }

    getAllAssignments(): Observable<TeacherAssignment[]> {
        return this.http.get<TeacherAssignment[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    getAssignmentsByTeacher(teacherId: string): Observable<TeacherAssignment[]> {
        return this.http.get<TeacherAssignment[]>(`${this.apiUrl}/teacher/${teacherId}`, { headers: this.getHeaders() });
    }

    getAssignment(id: number): Observable<TeacherAssignment> {
        return this.http.get<TeacherAssignment>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    updateAssignment(id: number, dto: UpdateTeacherAssignmentDto): Observable<TeacherAssignment> {
        return this.http.put<TeacherAssignment>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() });
    }

    deleteAssignment(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    getAvailableClasses(): Observable<ClassOption[]> {
        return this.http.get<ClassOption[]>(`${this.apiUrl}/classes/available`, { headers: this.getHeaders() });
    }

    getAvailableCourses(): Observable<CourseOption[]> {
        return this.http.get<CourseOption[]>(`${this.apiUrl}/courses/available`, { headers: this.getHeaders() });
    }

    getCoursesByClass(classId: number): Observable<CourseOption[]> {
        return this.http.get<CourseOption[]>(`${this.apiUrl}/courses/by-class/${classId}`, { headers: this.getHeaders() });
    }
}
