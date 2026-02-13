import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-secret',
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['email', 'profile'],
            passReqToCallback: true,
        });
    }

    async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile;
        console.log('Google profile:', profile);
        console.log('Request query:', req.query);
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
            id: profile.id,
            // Capture role from the 'state' parameter or query param if needed
            role: req.query.state || 'student'
        };
        console.log('User after Google validation:', user);
        done(null, user);
    }
}
