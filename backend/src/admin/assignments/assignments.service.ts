import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class AssignmentsService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    // Course to Class
    async assignCourseToClass(courseId: number, classId: number) {
        return await this.db.insert(schema.classCourses).values({ courseId, classId }).returning();
    }
    async unassignCourseFromClass(courseId: number, classId: number) {
        return await this.db.delete(schema.classCourses)
            .where(and(eq(schema.classCourses.courseId, courseId), eq(schema.classCourses.classId, classId)))
            .returning();
    }

    // Course to Student
    async assignCourseToStudent(courseId: number, studentId: string) {
        return await this.db.insert(schema.courseStudents).values({ courseId, studentId }).returning();
    }
    async unassignCourseFromStudent(courseId: number, studentId: string) {
        return await this.db.delete(schema.courseStudents)
            .where(and(eq(schema.courseStudents.courseId, courseId), eq(schema.courseStudents.studentId, studentId)))
            .returning();
    }

    // Course to Teacher
    async assignCourseToTeacher(courseId: number, teacherId: string) {
        return await this.db.insert(schema.courseTeachers).values({ courseId, teacherId }).returning();
    }
    async unassignCourseFromTeacher(courseId: number, teacherId: string) {
        return await this.db.delete(schema.courseTeachers)
            .where(and(eq(schema.courseTeachers.courseId, courseId), eq(schema.courseTeachers.teacherId, teacherId)))
            .returning();
    }

    // Class to Student
    async assignClassToStudent(classId: number, studentId: string) {
        return await this.db.insert(schema.classStudents).values({ classId, studentId }).returning();
    }
    async unassignClassFromStudent(classId: number, studentId: string) {
        return await this.db.delete(schema.classStudents)
            .where(and(eq(schema.classStudents.classId, classId), eq(schema.classStudents.studentId, studentId)))
            .returning();
    }

    // Class to Teacher
    async assignClassToTeacher(classId: number, teacherId: string) {
        return await this.db.insert(schema.classTeachers).values({ classId, teacherId }).returning();
    }
    async unassignClassFromTeacher(classId: number, teacherId: string) {
        return await this.db.delete(schema.classTeachers)
            .where(and(eq(schema.classTeachers.classId, classId), eq(schema.classTeachers.teacherId, teacherId)))
            .returning();
    }
}
