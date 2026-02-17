import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StudentJwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        const secret = process.env.JWT_SECRET_STUDENT;
        try {
            const payload = await this.jwtService.verifyAsync(token, { secret });
            request.user = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid student token');
        }
    }
}
