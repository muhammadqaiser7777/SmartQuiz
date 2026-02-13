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
    async findAll() {
    return await this.db.query.students.findMany({
        orderBy: (students, { desc }) => [desc(students.createdAt)],
    });
}


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

    async createStudent(name: string, email: string) {
        // Check if student already exists
        const existingStudent = await this.db.query.students.findFirst({
            where: eq(schema.students.email, email),
        });

        if (existingStudent) {
            throw new ForbiddenException('Student with this email already exists');
        }

        // Check if user is already registered as a teacher
        const existingTeacher = await this.db.query.teachers.findFirst({
            where: eq(schema.teachers.email, email),
        });

        if (existingTeacher) {
            throw new ForbiddenException('This email is already registered as a teacher');
        }

        // Create new student
        const [student] = await this.db.insert(schema.students).values({
            name,
            email,
            authId: email, // Use email as authId for manually created students
            authProvider: 'manual',
        }).returning();

        return {
            message: 'Student created successfully',
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
            },
        };
    }
}
