import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface Course {
    id: number;
    name: string;
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class CoursesService {
    private apiUrl = 'http://localhost:2001/admin/courses';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getCourses(page: number = 1, limit: number = 20, search: string = ''): Observable<PaginatedResponse<Course>> {
        let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        return this.http.get<PaginatedResponse<Course>>(url, { headers: this.getHeaders() });
    }

    createCourse(name: string): Observable<Course> {
        return this.http.post<Course>(this.apiUrl, { name }, { headers: this.getHeaders() });
    }

    updateCourse(id: number, name: string): Observable<Course> {
        return this.http.put<Course>(`${this.apiUrl}/${id}`, { name }, { headers: this.getHeaders() });
    }

    deleteCourse(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
