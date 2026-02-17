import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { TeacherDashboardComponent } from './pages/teacher-dashboard/teacher-dashboard.component';
import { ClassCourseDashboardComponent } from './pages/class-course-dashboard/class-course-dashboard.component';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'student-dashboard',
        component: StudentDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['student'] }
    },
    {
        path: 'teacher-dashboard',
        component: TeacherDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['teacher'] }
    },
    {
        path: 'teacher-dashboard/class-course/:id',
        component: ClassCourseDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['teacher'] }
    },
];
