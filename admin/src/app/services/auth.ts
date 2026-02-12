import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Point this to your NestJS backend (AdminController route)
  private apiUrl = 'http://localhost:3000/admin'; 

  constructor(private http: HttpClient) {}

}