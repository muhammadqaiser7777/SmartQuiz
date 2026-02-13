import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, UserMenuComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent {
  // User data is now handled by the user-menu component
}
