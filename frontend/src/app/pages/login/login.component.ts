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
    errorMessage = signal<string>('');
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const token = params['token'];
            const role = params['role'];
            const name = params['name'];
            const email = params['email'];
            const picture = params['picture'];
            const error = params['error'];

            // Handle error from backend
            if (error) {
                this.errorMessage.set(decodeURIComponent(error));
                return;
            }

            if (token && role) {
                const user = {
                    role: role,
                    token: token,
                    name: name ? decodeURIComponent(name) : 'User',
                    email: email ? decodeURIComponent(email) : '',
                    picture: picture ? decodeURIComponent(picture) : ''
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
        this.errorMessage.set(''); // Clear error when role changes
    }

    loginWithGoogle() {
        const backendUrl = 'http://localhost:2001';
        window.location.href = `${backendUrl}/auth/google?state=${this.role()}`;
    }
}
