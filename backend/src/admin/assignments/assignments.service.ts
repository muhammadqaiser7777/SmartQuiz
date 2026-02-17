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

    // Class to Student
    async assignClassToStudent(classId: number, studentId: string) {
        return await this.db.insert(schema.classStudents).values({ classId, studentId }).returning();
    }
    async unassignClassFromStudent(classId: number, studentId: string) {
        return await this.db.delete(schema.classStudents)
            .where(and(eq(schema.classStudents.classId, classId), eq(schema.classStudents.studentId, studentId)))
            .returning();
    }
}
