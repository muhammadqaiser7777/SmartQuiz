import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';
import { TeacherService, TeacherAssignment, PaginatedTeacherAssignments } from '../../services/teacher.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, UserMenuComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {
  private teacherService = inject(TeacherService);
  private router = inject(Router);

  assignments: TeacherAssignment[] = [];
  totalAssignments = 0;
  currentPage = 1;
  totalPages = 1;
  limit = 10;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.loading = true;
    this.error = '';

    this.teacherService.getAssignments(this.currentPage, this.limit).subscribe({
      next: (response: PaginatedTeacherAssignments) => {
        this.assignments = response.data;
        this.totalAssignments = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load assignments. Please try again.';
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadAssignments();
    }
  }

  viewDetails(assignment: TeacherAssignment): void {
    this.router.navigate(['/teacher-dashboard/class-course', assignment.id]);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
