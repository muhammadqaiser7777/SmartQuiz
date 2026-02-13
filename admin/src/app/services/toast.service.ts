import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts: Toast[] = [];
    private counter = 0;

    toastsSignal = signal<Toast[]>([]);

    show(message: string, type: 'success' | 'error' = 'success', duration = 3000) {
        const id = ++this.counter;
        const toast: Toast = { id, message, type };

        this.toasts = [...this.toasts, toast];
        this.toastsSignal.set(this.toasts);

        setTimeout(() => {
            this.remove(id);
        }, duration);
    }

    success(message: string, duration = 3000) {
        this.show(message, 'success', duration);
    }

    error(message: string, duration = 3000) {
        this.show(message, 'error', duration);
    }

    remove(id: number) {
        this.toasts = this.toasts.filter(t => t.id !== id);
        this.toastsSignal.set(this.toasts);
    }
}
