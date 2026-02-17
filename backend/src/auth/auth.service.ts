import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

@Injectable()
export class AuthService {
    private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    constructor(private jwtService: JwtService) { }

    async verifyGoogleToken(token: string) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            return ticket.getPayload();
        } catch (error) {
            throw new UnauthorizedException('Invalid Google token');
        }
    }

    async generateToken(user: { id: string; email: string; name: string; role: 'teacher' | 'student' }) {
        // Use role-specific JWT secret
        const secret = user.role === 'teacher'
            ? process.env.JWT_SECRET_TEACHER
            : process.env.JWT_SECRET_STUDENT;

        console.log(`AuthService: Generating token for ${user.role}, secret found:`, !!secret);

        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        return {
            access_token: this.jwtService.sign(payload, {
                secret: secret,
                expiresIn: '1d'
            }),
        };
    }

    // Generate teacher token with teacher-specific secret
    async generateTeacherToken(user: { id: string; email: string; name: string }) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: 'teacher'
        };

        return {
            access_token: this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET_TEACHER,
                expiresIn: '1d'
            }),
        };
    }

    // Generate student token with student-specific secret
    async generateStudentToken(user: { id: string; email: string; name: string }) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: 'student'
        };

        return {
            access_token: this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET_STUDENT,
                expiresIn: '1d'
            }),
        };
    }
}
