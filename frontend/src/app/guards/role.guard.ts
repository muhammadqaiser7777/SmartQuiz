import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const expectedRoles = route.data['roles'] as string[];

    // For demo/mock, we get user from localStorage
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (user && expectedRoles.includes(user.role)) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};
