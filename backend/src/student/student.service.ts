import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { OAuthLoginDto } from '../auth/dto/oauth-login.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class StudentService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
        private authService: AuthService,
    ) { }

    async loginOrSignupServerSide(user: any) {
        const email = user.email;
        const name = `${user.firstName} ${user.lastName}`;
        const profilePicture = user.picture;
        const authId = user.id || email;

        // Check if user is already registered as a teacher
        const existingTeacher = await this.db.query.teachers.findFirst({
            where: eq(schema.teachers.email, email),
        });

        if (existingTeacher) {
            throw new ForbiddenException('You already have a teacher account, cannot login/signup as student');
        }

        let student = await this.db.query.students.findFirst({
            where: eq(schema.students.email, email),
        });

        if (!student) {
            [student] = await this.db.insert(schema.students).values({
                name,
                email,
                authId,
                authProvider: 'google',
                profilePicture,
            }).returning();
        } else {
            if (profilePicture && student.profilePicture !== profilePicture) {
                await this.db.update(schema.students)
                    .set({ profilePicture, updatedAt: new Date() })
                    .where(eq(schema.students.id, student.id));
            }
        }

        const token = await this.authService.generateToken({
            id: student.id,
            email: student.email,
            name: student.name,
            role: 'student',
        });

        return {
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                profilePicture: student.profilePicture,
            },
            ...token,
        };
    }
}
