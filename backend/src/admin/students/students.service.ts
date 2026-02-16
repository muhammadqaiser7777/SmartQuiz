import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { eq, and, or, ilike } from 'drizzle-orm';

export interface StudentWithClass {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    classId: number | null;
    className: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class StudentsService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async getAllStudents(page: number = 1, limit: number = 20, search?: string): Promise<PaginatedResponse<StudentWithClass>> {
        const offset = (page - 1) * limit;

        // Build where condition for search
        let whereCondition: any = undefined;
        if (search) {
            whereCondition = or(
                ilike(schema.students.name, `%${search}%`),
                ilike(schema.students.email, `%${search}%`)
            );
        }

        // Get total count
        const countResult = whereCondition
            ? await this.db.select({ count: schema.students.id }).from(schema.students).where(whereCondition)
            : await this.db.select({ count: schema.students.id }).from(schema.students);
        const total = countResult.length;

        // Get paginated students with their assigned class
        const studentsWithClasses = await this.db
            .select({
                id: schema.students.id,
                name: schema.students.name,
                email: schema.students.email,
                profilePicture: schema.students.profilePicture,
                createdAt: schema.students.createdAt,
                updatedAt: schema.students.updatedAt,
                classId: schema.classStudents.classId,
                className: schema.classes.name,
            })
            .from(schema.students)
            .leftJoin(schema.classStudents, eq(schema.students.id, schema.classStudents.studentId))
            .leftJoin(schema.classes, eq(schema.classStudents.classId, schema.classes.id))
            .where(whereCondition)
            .limit(limit)
            .offset(offset);

        return {
            data: studentsWithClasses,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async assignClass(studentId: string, classId: number) {
        // Check if student exists
        const student = await this.db.query.students.findFirst({
            where: eq(schema.students.id, studentId),
        });
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Check if class exists
        const classItem = await this.db.query.classes.findFirst({
            where: eq(schema.classes.id, classId),
        });
        if (!classItem) {
            throw new NotFoundException('Class not found');
        }

        // Remove any existing class assignment for this student
        await this.db
            .delete(schema.classStudents)
            .where(eq(schema.classStudents.studentId, studentId));

        // Remove any existing course assignments for this student
        await this.db
            .delete(schema.classCourseStudent)
            .where(eq(schema.classCourseStudent.studentId, studentId));

        // Assign new class
        const [classStudent] = await this.db
            .insert(schema.classStudents)
            .values({
                studentId: studentId,
                classId: classId,
            })
            .returning();

        // Get all courses assigned to this class
        const classCourses = await this.db
            .select()
            .from(schema.classCourses)
            .where(eq(schema.classCourses.classId, classId));

        // Assign all class courses to the student
        if (classCourses.length > 0) {
            const courseStudentValues = classCourses.map(cc => ({
                classId: classId,
                courseId: cc.courseId,
                studentId: studentId,
            }));

            await this.db
                .insert(schema.classCourseStudent)
                .values(courseStudentValues);
        }

        return {
            studentId: studentId,
            classId: classId,
            className: classItem.name,
            coursesAssigned: classCourses.length,
        };
    }

    async removeClass(studentId: string) {
        // Check if student exists
        const student = await this.db.query.students.findFirst({
            where: eq(schema.students.id, studentId),
        });
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Remove class assignment
        await this.db
            .delete(schema.classStudents)
            .where(eq(schema.classStudents.studentId, studentId));

        // Remove course assignments for this student
        await this.db
            .delete(schema.classCourseStudent)
            .where(eq(schema.classCourseStudent.studentId, studentId));

        return { message: 'Class removed successfully' };
    }
}
