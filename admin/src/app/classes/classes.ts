import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-classes',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="content-container">
            <h2>Manage Classes</h2>
            <p>Classes management will be implemented here.</p>
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
export class ClassesComponent { }
