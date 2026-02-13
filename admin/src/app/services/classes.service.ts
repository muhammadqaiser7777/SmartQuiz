import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface Class {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClassesService {
    private apiUrl = 'http://localhost:2001/admin/classes';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getClasses(): Observable<Class[]> {
        return this.http.get<Class[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    createClass(name: string): Observable<Class> {
        return this.http.post<Class>(this.apiUrl, { name }, { headers: this.getHeaders() });
    }

    updateClass(id: number, name: string): Observable<Class> {
        return this.http.put<Class>(`${this.apiUrl}/${id}`, { name }, { headers: this.getHeaders() });
    }

    deleteClass(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}
