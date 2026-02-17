import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { OAuthLoginDto } from '../auth/dto/oauth-login.dto';
import { AuthService } from '../auth/auth.service';

export interface TeacherAssignmentWithCount {
    id: number;
    classId: number;
    courseId: number;
    teacherId: string;
    className: string;
    courseName: string;
    totalStudents: number;
    createdAt: Date;
}

export interface PaginatedTeacherAssignments {
    data: TeacherAssignmentWithCount[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

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

        // Check if user is already registered as a student
        const existingStudent = await this.db.query.students.findFirst({
            where: eq(schema.students.email, email),
        });

        if (existingStudent) {
            throw new ForbiddenException('You already have a student account, cannot login/signup as teacher');
        }

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

    async getMyAssignments(teacherId: string, page: number = 1, limit: number = 10): Promise<PaginatedTeacherAssignments> {
        console.log('getMyAssignments: Looking for teacher with ID:', teacherId);

        // Check if teacher exists
        const [teacher] = await this.db.query.teachers.findMany({
            where: eq(schema.teachers.id, teacherId),
        });

        if (!teacher) {
            console.log('getMyAssignments: Teacher not found for ID:', teacherId);
            throw new NotFoundException('Teacher not found');
        }

        console.log('getMyAssignments: Teacher found:', teacher.name);

        // Get total count
        const allAssignments = await this.db.query.classCourseTeacher.findMany({
            where: eq(schema.classCourseTeacher.teacherId, teacherId),
        });

        const total = allAssignments.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        // Get paginated assignments
        const assignments = await this.db.query.classCourseTeacher.findMany({
            where: eq(schema.classCourseTeacher.teacherId, teacherId),
            limit: limit,
            offset: offset,
        });

        // Get class and course details and student count for each assignment
        const result: TeacherAssignmentWithCount[] = [];
        for (const assignment of assignments) {
            const [classItem] = await this.db.query.classes.findMany({
                where: eq(schema.classes.id, assignment.classId),
            });
            const [course] = await this.db.query.courses.findMany({
                where: eq(schema.courses.id, assignment.courseId),
            });

            // Count students in this class-course combination
            const students = await this.db.query.classCourseStudent.findMany({
                where: and(
                    eq(schema.classCourseStudent.classId, assignment.classId),
                    eq(schema.classCourseStudent.courseId, assignment.courseId)
                ),
            });

            result.push({
                id: assignment.id,
                classId: assignment.classId,
                courseId: assignment.courseId,
                teacherId: assignment.teacherId,
                className: classItem?.name || 'Unknown Class',
                courseName: course?.name || 'Unknown Course',
                totalStudents: students.length,
                createdAt: new Date(),
            });
        }

        return {
            data: result,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async getAssignmentById(assignmentId: number, teacherId: string): Promise<TeacherAssignmentWithCount | null> {
        const [assignment] = await this.db.query.classCourseTeacher.findMany({
            where: and(
                eq(schema.classCourseTeacher.id, assignmentId),
                eq(schema.classCourseTeacher.teacherId, teacherId)
            ),
        });

        if (!assignment) {
            return null;
        }

        const [classItem] = await this.db.query.classes.findMany({
            where: eq(schema.classes.id, assignment.classId),
        });
        const [course] = await this.db.query.courses.findMany({
            where: eq(schema.courses.id, assignment.courseId),
        });

        // Count students in this class-course combination
        const students = await this.db.query.classCourseStudent.findMany({
            where: and(
                eq(schema.classCourseStudent.classId, assignment.classId),
                eq(schema.classCourseStudent.courseId, assignment.courseId)
            ),
        });

        return {
            id: assignment.id,
            classId: assignment.classId,
            courseId: assignment.courseId,
            teacherId: assignment.teacherId,
            className: classItem?.name || 'Unknown Class',
            courseName: course?.name || 'Unknown Course',
            totalStudents: students.length,
            createdAt: new Date(),
        };
    }

    async createTeacher(name: string, email: string) {
        // Check if teacher already exists
        const existingTeacher = await this.db.query.teachers.findFirst({
            where: eq(schema.teachers.email, email),
        });

        if (existingTeacher) {
            throw new ForbiddenException('Teacher with this email already exists');
        }

        // Check if user is already registered as a student
        const existingStudent = await this.db.query.students.findFirst({
            where: eq(schema.students.email, email),
        });

        if (existingStudent) {
            throw new ForbiddenException('This email is already registered as a student');
        }

        // Create new teacher
        const [teacher] = await this.db.insert(schema.teachers).values({
            name,
            email,
            authId: email, // Use email as authId for manually created teachers
            authProvider: 'manual',
        }).returning();

        return {
            message: 'Teacher created successfully',
            teacher: {
                id: teacher.id,
                name: teacher.name,
                email: teacher.email,
            },
        };
    }
}
