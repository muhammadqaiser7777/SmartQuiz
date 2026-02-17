import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TeacherJwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        const secret = process.env.JWT_SECRET_TEACHER;
        console.log('Teacher JWT Guard - Using secret:', secret ? 'secret found' : 'NO SECRET FOUND');

        try {
            const payload = await this.jwtService.verifyAsync(token, { secret });
            console.log('Teacher JWT Guard - Payload verified:', payload);
            request.user = payload;
            return true;
        } catch (error) {
            console.error('Teacher JWT Guard - Verification failed:', error.message);
            throw new UnauthorizedException('Invalid teacher token');
        }
    }
}
