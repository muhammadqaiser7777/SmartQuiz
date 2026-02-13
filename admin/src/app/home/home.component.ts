import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="welcome-message">
            <h1>Welcome to Admin Portal</h1>
            <p>Select an option from the sidebar to manage your portal.</p>
        </div>
    `,
    styles: [`
        .welcome-message {
            text-align: center;
            padding: 60px 20px;
        }
        .welcome-message h1 {
            color: #1a1a2e;
            margin-bottom: 16px;
        }
        .welcome-message p {
            color: #6b7280;
            font-size: 18px;
        }
    `]
})
export class HomeComponent { }
