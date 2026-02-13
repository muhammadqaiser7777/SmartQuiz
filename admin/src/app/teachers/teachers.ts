import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-teachers',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="content-container">
            <h2>Manage Teachers</h2>
            <p>Teachers management will be implemented here.</p>
        </div>
    `,
    styles: [`
        .content-container {
            padding: 20px;
        }
        h2 {
            color: #333;
        }
    `]
})
export class TeachersComponent { }
