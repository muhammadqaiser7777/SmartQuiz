import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';
import { TeacherService, TeacherAssignment } from '../../services/teacher.service';

@Component({
    selector: 'app-class-course-dashboard',
    standalone: true,
    imports: [CommonModule, UserMenuComponent, RouterModule],
    templateUrl: './class-course-dashboard.component.html',
    styleUrls: ['./class-course-dashboard.component.css']
})
export class ClassCourseDashboardComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private teacherService = inject(TeacherService);

    assignment: TeacherAssignment | null = null;
    loading = true;
    error = '';

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const assignmentId = parseInt(id, 10);
            if (!isNaN(assignmentId)) {
                this.loadAssignment(assignmentId);
            } else {
                this.error = 'Invalid assignment ID';
                this.loading = false;
            }
        } else {
            this.error = 'No assignment ID provided';
            this.loading = false;
        }
    }

    loadAssignment(id: number): void {
        this.loading = true;
        this.teacherService.getAssignmentById(id).subscribe({
            next: (assignment) => {
                this.assignment = assignment;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading assignment:', err);
                this.error = 'Failed to load assignment details';
                this.loading = false;
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/teacher-dashboard']);
    }
}
