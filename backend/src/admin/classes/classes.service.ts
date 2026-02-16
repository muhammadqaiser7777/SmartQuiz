import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { eq, ilike } from 'drizzle-orm';

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class ClassesService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async findAll(page: number = 1, limit: number = 20, search?: string): Promise<PaginatedResponse<any>> {
        const offset = (page - 1) * limit;

        // Build where condition for search
        let whereCondition: any = undefined;
        if (search) {
            whereCondition = ilike(schema.classes.name, `%${search}%`);
        }

        // Get total count
        const countResult = whereCondition
            ? await this.db.select({ count: schema.classes.id }).from(schema.classes).where(whereCondition)
            : await this.db.select({ count: schema.classes.id }).from(schema.classes);
        const total = countResult.length;

        const classes = await this.db.query.classes.findMany({
            where: whereCondition,
            limit,
            offset,
        });

        return {
            data: classes,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const classItem = await this.db.query.classes.findFirst({
            where: eq(schema.classes.id, id),
        });
        if (!classItem) throw new NotFoundException('Class not found');
        return classItem;
    }

    async getCourses(classId: number) {
        const courses = await this.db
            .select({
                courseId: schema.courses.id,
                courseName: schema.courses.name,
            })
            .from(schema.classCourses)
            .innerJoin(schema.courses, eq(schema.classCourses.courseId, schema.courses.id))
            .where(eq(schema.classCourses.classId, classId));
        return courses;
    }

    async create(name: string) {
        const [classItem] = await this.db.insert(schema.classes).values({ name }).returning();
        return classItem;
    }

    async update(id: number, name: string) {
        const [classItem] = await this.db
            .update(schema.classes)
            .set({ name })
            .where(eq(schema.classes.id, id))
            .returning();
        if (!classItem) throw new NotFoundException('Class not found');
        return classItem;
    }

    async delete(id: number) {
        const [classItem] = await this.db
            .delete(schema.classes)
            .where(eq(schema.classes.id, id))
            .returning();
        if (!classItem) throw new NotFoundException('Class not found');
        return { message: 'Class deleted successfully' };
    }
}
