import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Teacher {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
    createdAt: Date;
    updatedAt: Date;
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
