import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, UserMenuComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent {
  // User data is now handled by the user-menu component
}
