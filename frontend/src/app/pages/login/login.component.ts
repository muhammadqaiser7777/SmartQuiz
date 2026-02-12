import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    role = signal<'student' | 'teacher'>('student');
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    ngOnInit() {
        // Check for token and role in URL query params (returned from backend callback)
        this.route.queryParams.subscribe(params => {
            const token = params['token'];
            const role = params['role'];

            if (token && role) {
                // Construct user object (in a real app, you might decode the JWT to get more info)
                const user = {
                    role: role,
                    token: token,
                    // We don't have name/email here without decoding, but dashboard fetches profile anyway
                    name: 'User',
                    email: ''
                };

                localStorage.setItem('user', JSON.stringify(user));

                if (role === 'teacher') {
                    this.router.navigate(['/teacher-dashboard']);
                } else {
                    this.router.navigate(['/student-dashboard']);
                }
            }
        });
    }

    setRole(newRole: 'student' | 'teacher') {
        this.role.set(newRole);
    }

    loginWithGoogle() {
        // Redirect to backend to initiate Google OAuth flow
        const backendUrl = 'http://localhost:2001';
        window.location.href = `${backendUrl}/auth/google?state=${this.role()}`;
        // Note: Using 'state' param to pass schema/role info to backend strategy
    }
}
