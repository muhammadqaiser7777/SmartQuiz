import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { OAuthLoginDto } from '../auth/dto/oauth-login.dto';
import { AuthService } from '../auth/auth.service';
import { CreateQuizDto, QuizWithQuestions, QuizListQueryDto } from './dto/quiz.dto';

export interface QuizLeaderboardEntry {
    studentId: string;
    studentName: string;
    studentEmail: string;
    obtainedMarks: number;
    totalMarks: number;
    percentage: number;
    rank: number;
}

export interface QuizDetailsWithLeaderboard {
    quiz: QuizWithQuestions;
    leaderboard: QuizLeaderboardEntry[];
    totalSubmissions: number;
    averageMarks: number;
}

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

    // ==================== QUIZ METHODS ====================

    /**
     * Create a new quiz with questions
     * Times are received as ISO 8601 strings (timezone-aware) and stored in UTC
     */
    async createQuiz(teacherId: string, quizData: CreateQuizDto) {
        // Verify teacher exists
        const [teacher] = await this.db.query.teachers.findMany({
            where: eq(schema.teachers.id, teacherId),
        });

        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        // Verify class belongs to teacher
        const [classAssignment] = await this.db.query.classCourseTeacher.findMany({
            where: and(
                eq(schema.classCourseTeacher.teacherId, teacherId),
                eq(schema.classCourseTeacher.classId, quizData.classId),
                eq(schema.classCourseTeacher.courseId, quizData.courseId)
            ),
        });

        if (!classAssignment) {
            throw new ForbiddenException('You are not assigned to this class and course');
        }

        // Parse and convert timezone-aware times to UTC
        const startTime = new Date(quizData.startTime);
        const endTime = new Date(quizData.endTime);

        // Validate times
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new ForbiddenException('Invalid start or end time format');
        }

        if (endTime <= startTime) {
            throw new ForbiddenException('End time must be after start time');
        }

        // Calculate marks per question
        const totalQuestions = quizData.questions.length;
        if (totalQuestions === 0) {
            throw new ForbiddenException('At least one question is required');
        }

        const marksPerQuestion = Math.floor(quizData.totalMarks / totalQuestions);

        // Create quiz with questions in a transaction
        const [quiz] = await this.db.insert(schema.quizzes).values({
            courseId: quizData.courseId,
            teacherId: teacherId,
            title: quizData.title,
            startTime: startTime, // Stored in UTC in database
            endTime: endTime,       // Stored in UTC in database
            classId: quizData.classId,
            totalQuestions: totalQuestions,
            totalMarks: quizData.totalMarks,
        }).returning();

        // Insert all questions
        const questionsToInsert = quizData.questions.map(q => ({
            quizId: quiz.id,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
        }));

        const questions = await this.db.insert(schema.questions).values(questionsToInsert).returning();

        return {
            message: 'Quiz created successfully',
            quiz: {
                id: quiz.id,
                title: quiz.title,
                startTime: quiz.startTime.toISOString(),
                endTime: quiz.endTime.toISOString(),
                totalQuestions: quiz.totalQuestions,
                totalMarks: quiz.totalMarks,
                classId: quiz.classId,
                courseId: quiz.courseId,
            },
            questions: questions.map(q => ({
                id: q.id,
                question: q.question,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctOption: q.correctOption,
                marks: marksPerQuestion,
            })),
        };
    }

    /**
     * Get all quizzes for a teacher with optional filtering
     */
    async getQuizzes(teacherId: string, query: QuizListQueryDto) {
        const { page, limit, classId, courseId } = query;
        const offset = (page - 1) * limit;

        // Build where conditions
        const conditions = [eq(schema.quizzes.teacherId, teacherId)];
        if (classId) {
            conditions.push(eq(schema.quizzes.classId, classId));
        }
        if (courseId) {
            conditions.push(eq(schema.quizzes.courseId, courseId));
        }

        // Get total count
        const allQuizzes = await this.db.query.quizzes.findMany({
            where: and(...conditions),
        });

        const total = allQuizzes.length;
        const totalPages = Math.ceil(total / limit);

        // Get paginated quizzes
        const quizzes = await this.db.query.quizzes.findMany({
            where: and(...conditions),
            limit: limit,
            offset: offset,
            orderBy: (quizzes, { desc }) => [desc(quizzes.startTime)],
        });

        // Get class and course names for each quiz
        const result = await Promise.all(quizzes.map(async (quiz) => {
            const classId = quiz.classId ?? 0;
            const courseId = quiz.courseId ?? 0;

            const [classItem] = await this.db.query.classes.findMany({
                where: eq(schema.classes.id, classId),
            });
            const [course] = await this.db.query.courses.findMany({
                where: eq(schema.courses.id, courseId),
            });

            return {
                id: quiz.id,
                title: quiz.title,
                startTime: quiz.startTime?.toISOString() ?? '',
                endTime: quiz.endTime?.toISOString() ?? '',
                totalQuestions: quiz.totalQuestions ?? 0,
                totalMarks: quiz.totalMarks ?? 0,
                classId: classId,
                className: classItem?.name || 'Unknown Class',
                courseId: courseId,
                courseName: course?.name || 'Unknown Course',
            };
        }));

        return {
            data: result,
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Get a single quiz with all questions
     */
    async getQuizById(teacherId: string, quizId: string): Promise<QuizWithQuestions | null> {
        const [quiz] = await this.db.query.quizzes.findMany({
            where: and(
                eq(schema.quizzes.id, quizId),
                eq(schema.quizzes.teacherId, teacherId)
            ),
        });

        if (!quiz) {
            return null;
        }

        // Get all questions for this quiz
        const quizQuestions = await this.db.query.questions.findMany({
            where: eq(schema.questions.quizId, quizId),
        });

        return {
            id: quiz.id,
            courseId: quiz.courseId!,
            teacherId: quiz.teacherId!,
            title: quiz.title!,
            startTime: quiz.startTime!,
            endTime: quiz.endTime!,
            classId: quiz.classId!,
            totalQuestions: quiz.totalQuestions!,
            totalMarks: quiz.totalMarks!,
            questions: quizQuestions.map(q => ({
                id: q.id,
                quizId: q.quizId!,
                question: q.question!,
                optionA: q.optionA!,
                optionB: q.optionB!,
                optionC: q.optionC!,
                optionD: q.optionD!,
                correctOption: q.correctOption!,
            })),
        };
    }

    /**
     * Get quiz details with leaderboard
     */
    async getQuizDetailsWithLeaderboard(teacherId: string, quizId: string): Promise<QuizDetailsWithLeaderboard | null> {
        // First verify the quiz belongs to this teacher
        const [quiz] = await this.db.query.quizzes.findMany({
            where: and(
                eq(schema.quizzes.id, quizId),
                eq(schema.quizzes.teacherId, teacherId)
            ),
        });

        if (!quiz) {
            return null;
        }

        // Get all questions for this quiz
        const quizQuestions = await this.db.query.questions.findMany({
            where: eq(schema.questions.quizId, quizId),
        });

        // Get all marks for this quiz
        const quizMarks = await this.db.query.marks.findMany({
            where: eq(schema.marks.quizId, quizId),
        });

        // Build leaderboard with student details
        const leaderboard: QuizLeaderboardEntry[] = [];
        let totalObtainedMarks = 0;

        for (let i = 0; i < quizMarks.length; i++) {
            const mark = quizMarks[i];
            const [student] = await this.db.query.students.findMany({
                where: eq(schema.students.id, mark.studentId),
            });

            const percentage = mark.totalMarks > 0
                ? Math.round((mark.obtainedMarks / mark.totalMarks) * 100)
                : 0;

            leaderboard.push({
                studentId: mark.studentId,
                studentName: student?.name || 'Unknown Student',
                studentEmail: student?.email || '',
                obtainedMarks: mark.obtainedMarks,
                totalMarks: mark.totalMarks,
                percentage,
                rank: 0, // Will be set after sorting
            });

            totalObtainedMarks += mark.obtainedMarks;
        }

        // Sort by obtained marks descending and assign ranks
        leaderboard.sort((a, b) => b.obtainedMarks - a.obtainedMarks);
        leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        // Calculate average marks
        const averageMarks = quizMarks.length > 0
            ? Math.round(totalObtainedMarks / quizMarks.length)
            : 0;

        return {
            quiz: {
                id: quiz.id,
                courseId: quiz.courseId!,
                teacherId: quiz.teacherId!,
                title: quiz.title!,
                startTime: quiz.startTime!,
                endTime: quiz.endTime!,
                classId: quiz.classId!,
                totalQuestions: quiz.totalQuestions!,
                totalMarks: quiz.totalMarks!,
                questions: quizQuestions.map(q => ({
                    id: q.id,
                    quizId: q.quizId!,
                    question: q.question!,
                    optionA: q.optionA!,
                    optionB: q.optionB!,
                    optionC: q.optionC!,
                    optionD: q.optionD!,
                    correctOption: q.correctOption!,
                })),
            },
            leaderboard,
            totalSubmissions: quizMarks.length,
            averageMarks,
        };
    }
}
