import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { OAuthLoginDto } from '../auth/dto/oauth-login.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TeacherService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
        private authService: AuthService,
    ) { }

    async loginOrSignupServerSide(user: any) {
        const email = user.email;
        const name = `${user.firstName} ${user.lastName}`;
        const profilePicture = user.picture;
        const authId = user.id || email; // Google profile ID if available, otherwise email

        console.log('Teacher login attempt:', { email, name, profilePicture });

        let teacher = await this.db.query.teachers.findFirst({
            where: eq(schema.teachers.email, email),
        });

        if (!teacher) {
            console.log('Creating new teacher:', { name, email, authId, profilePicture });
            [teacher] = await this.db.insert(schema.teachers).values({
                name,
                email,
                authId,
                authProvider: 'google',
                profilePicture,
            }).returning();
            console.log('Created teacher:', teacher);
        } else {
            console.log('Found existing teacher:', teacher);
            if (profilePicture && teacher.profilePicture !== profilePicture) {
                await this.db.update(schema.teachers)
                    .set({ profilePicture, updatedAt: new Date() })
                    .where(eq(schema.teachers.id, teacher.id));
            }
        }

        const token = await this.authService.generateToken({
            id: teacher.id,
            email: teacher.email,
            name: teacher.name,
            role: 'teacher',
        });

        return {
            teacher: {
                id: teacher.id,
                name: teacher.name,
                email: teacher.email,
                profilePicture: teacher.profilePicture,
            },
            ...token,
        };
    }
}
