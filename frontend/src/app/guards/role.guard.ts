import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const expectedRoles = route.data['roles'] as string[];

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    const user = authService.getUser();

    if (user && expectedRoles.includes(user.role)) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};
