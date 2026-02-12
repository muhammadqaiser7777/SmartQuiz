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
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
