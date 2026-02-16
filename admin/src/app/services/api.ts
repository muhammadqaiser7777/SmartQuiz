import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Teacher {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    classId: number | null;
    className: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:2001/admin';

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }
}
