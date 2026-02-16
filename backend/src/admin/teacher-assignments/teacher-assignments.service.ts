import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

export interface TeacherAssignment {
    id: number;
    classId: number;
    courseId: number;
    teacherId: string;
    className?: string;
    courseName?: string;
    teacherName?: string;
    teacherEmail?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateTeacherAssignmentDto {
    teacherId: string;
    classId: number;
    courseId: number;
}

export interface UpdateTeacherAssignmentDto {
    classId?: number;
    courseId?: number;
}

@Injectable()
export class TeacherAssignmentsService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(dto: CreateTeacherAssignmentDto): Promise<TeacherAssignment> {
        // Check if teacher exists
        const [teacher] = await this.db.query.teachers.findMany({
            where: eq(schema.teachers.id, dto.teacherId),
        });
        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        // Check if class exists
        const [classItem] = await this.db.query.classes.findMany({
            where: eq(schema.classes.id, dto.classId),
        });
        if (!classItem) {
            throw new NotFoundException('Class not found');
        }

        // Check if course exists
        const [course] = await this.db.query.courses.findMany({
            where: eq(schema.courses.id, dto.courseId),
        });
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Check if assignment already exists
        const existingAssignment = await this.db.query.classCourseTeacher.findMany({
            where: eq(schema.classCourseTeacher.teacherId, dto.teacherId),
        });
        const duplicate = existingAssignment.find(
            a => a.classId === dto.classId && a.courseId === dto.courseId
        );
        if (duplicate) {
            throw new ConflictException('This teacher is already assigned to this class and course');
        }

        const [assignment] = await this.db.insert(schema.classCourseTeacher)
            .values({
                teacherId: dto.teacherId,
                classId: dto.classId,
                courseId: dto.courseId,
            })
            .returning();

        return {
            ...assignment,
            className: classItem.name,
            courseName: course.name,
            teacherName: teacher.name,
            teacherEmail: teacher.email,
        };
    }

    async findByTeacher(teacherId: string): Promise<TeacherAssignment[]> {
        // Check if teacher exists
        const [teacher] = await this.db.query.teachers.findMany({
            where: eq(schema.teachers.id, teacherId),
        });
        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        const assignments = await this.db.query.classCourseTeacher.findMany({
            where: eq(schema.classCourseTeacher.teacherId, teacherId),
        });

        // Get class and course details for each assignment
        const result: TeacherAssignment[] = [];
        for (const assignment of assignments) {
            const [classItem] = await this.db.query.classes.findMany({
                where: eq(schema.classes.id, assignment.classId),
            });
            const [course] = await this.db.query.courses.findMany({
                where: eq(schema.courses.id, assignment.courseId),
            });

            result.push({
                ...assignment,
                className: classItem?.name,
                courseName: course?.name,
                teacherName: teacher.name,
                teacherEmail: teacher.email,
            });
        }

        return result;
    }

    async findAll(): Promise<TeacherAssignment[]> {
        const assignments = await this.db.query.classCourseTeacher.findMany();

        const result: TeacherAssignment[] = [];
        for (const assignment of assignments) {
            const [teacher] = await this.db.query.teachers.findMany({
                where: eq(schema.teachers.id, assignment.teacherId),
            });
            const [classItem] = await this.db.query.classes.findMany({
                where: eq(schema.classes.id, assignment.classId),
            });
            const [course] = await this.db.query.courses.findMany({
                where: eq(schema.courses.id, assignment.courseId),
            });

            result.push({
                ...assignment,
                className: classItem?.name,
                courseName: course?.name,
                teacherName: teacher?.name,
                teacherEmail: teacher?.email,
            });
        }

        return result;
    }

    async findOne(id: number): Promise<TeacherAssignment> {
        const [assignment] = await this.db.query.classCourseTeacher.findMany({
            where: eq(schema.classCourseTeacher.id, id),
        });

        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }

        const [teacher] = await this.db.query.teachers.findMany({
            where: eq(schema.teachers.id, assignment.teacherId),
        });
        const [classItem] = await this.db.query.classes.findMany({
            where: eq(schema.classes.id, assignment.classId),
        });
        const [course] = await this.db.query.courses.findMany({
            where: eq(schema.courses.id, assignment.courseId),
        });

        return {
            ...assignment,
            className: classItem?.name,
            courseName: course?.name,
            teacherName: teacher?.name,
            teacherEmail: teacher?.email,
        };
    }

    async update(id: number, dto: UpdateTeacherAssignmentDto): Promise<TeacherAssignment> {
        const [existingAssignment] = await this.db.query.classCourseTeacher.findMany({
            where: eq(schema.classCourseTeacher.id, id),
        });

        if (!existingAssignment) {
            throw new NotFoundException('Assignment not found');
        }

        const classId = dto.classId || existingAssignment.classId;
        const courseId = dto.courseId || existingAssignment.courseId;

        // If changing class or course, check for duplicates
        if (dto.classId || dto.courseId) {
            const existingAssignments = await this.db.query.classCourseTeacher.findMany({
                where: eq(schema.classCourseTeacher.teacherId, existingAssignment.teacherId),
            });
            const duplicate = existingAssignments.find(
                a => a.classId === classId && a.courseId === courseId && a.id !== id
            );
            if (duplicate) {
                throw new ConflictException('This teacher is already assigned to this class and course');
            }
        }

        // Validate class and course if being changed
        if (dto.classId) {
            const [classItem] = await this.db.query.classes.findMany({
                where: eq(schema.classes.id, dto.classId),
            });
            if (!classItem) {
                throw new NotFoundException('Class not found');
            }
        }

        if (dto.courseId) {
            const [course] = await this.db.query.courses.findMany({
                where: eq(schema.courses.id, dto.courseId),
            });
            if (!course) {
                throw new NotFoundException('Course not found');
            }
        }

        const [updatedAssignment] = await this.db
            .update(schema.classCourseTeacher)
            .set({
                classId,
                courseId,
            })
            .where(eq(schema.classCourseTeacher.id, id))
            .returning();

        const [teacher] = await this.db.query.teachers.findMany({
            where: eq(schema.teachers.id, updatedAssignment.teacherId),
        });
        const [classItem] = await this.db.query.classes.findMany({
            where: eq(schema.classes.id, updatedAssignment.classId),
        });
        const [course] = await this.db.query.courses.findMany({
            where: eq(schema.courses.id, updatedAssignment.courseId),
        });

        return {
            ...updatedAssignment,
            className: classItem?.name,
            courseName: course?.name,
            teacherName: teacher?.name,
            teacherEmail: teacher?.email,
        };
    }

    async delete(id: number): Promise<{ message: string }> {
        const [assignment] = await this.db.query.classCourseTeacher.findMany({
            where: eq(schema.classCourseTeacher.id, id),
        });

        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }

        await this.db
            .delete(schema.classCourseTeacher)
            .where(eq(schema.classCourseTeacher.id, id))
            .returning();

        return { message: 'Assignment deleted successfully' };
    }

    async getAvailableClasses(): Promise<{ id: number; name: string }[]> {
        const classes = await this.db.query.classes.findMany();
        return classes.map(c => ({ id: c.id, name: c.name }));
    }

    async getAvailableCourses(): Promise<{ id: number; name: string }[]> {
        const courses = await this.db.query.courses.findMany();
        return courses.map(c => ({ id: c.id, name: c.name }));
    }

    async getCoursesByClass(classId: number): Promise<{ id: number; name: string }[]> {
        // First try to get courses assigned to this class
        const classCourses = await this.db
            .select({
                courseId: schema.classCourses.courseId,
                courseName: schema.courses.name,
            })
            .from(schema.classCourses)
            .innerJoin(schema.courses, eq(schema.classCourses.courseId, schema.courses.id))
            .where(eq(schema.classCourses.classId, classId));

        // If there are assigned courses, return them
        if (classCourses.length > 0) {
            return classCourses.map(c => ({ id: c.courseId, name: c.courseName }));
        }

        // Otherwise, return all available courses
        const allCourses = await this.db.query.courses.findMany();
        return allCourses.map(c => ({ id: c.id, name: c.name }));
    }
}
