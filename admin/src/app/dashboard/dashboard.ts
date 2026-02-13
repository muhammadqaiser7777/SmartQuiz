import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { CoursesComponent } from '../courses/courses';
import { ClassesComponent } from '../classes/classes';
import { StudentsComponent } from '../students/students';
import { TeachersComponent } from '../teachers/teachers';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CoursesComponent, ClassesComponent, StudentsComponent, TeachersComponent],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class DashboardComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    currentView: 'home' | 'courses' | 'classes' | 'students' | 'teachers' = 'home';

    setView(view: 'home' | 'courses' | 'classes' | 'students' | 'teachers') {
        this.currentView = view;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
