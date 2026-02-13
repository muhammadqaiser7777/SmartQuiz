import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { HomeComponent } from './home/home.component';
import { CoursesComponent } from './courses/courses';
import { ClassesComponent } from './classes/classes';
import { StudentsComponent } from './students/students';
import { TeachersComponent } from './teachers/teachers';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'classes', component: ClassesComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'teachers', component: TeachersComponent }
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];