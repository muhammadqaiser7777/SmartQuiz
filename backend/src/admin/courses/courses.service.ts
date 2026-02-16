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
export class CoursesService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async findAll(page: number = 1, limit: number = 20, search?: string): Promise<PaginatedResponse<any>> {
        const offset = (page - 1) * limit;

        // Build where condition for search
        let whereCondition: any = undefined;
        if (search) {
            whereCondition = ilike(schema.courses.name, `%${search}%`);
        }

        // Get total count
        const countResult = whereCondition
            ? await this.db.select({ count: schema.courses.id }).from(schema.courses).where(whereCondition)
            : await this.db.select({ count: schema.courses.id }).from(schema.courses);
        const total = countResult.length;

        const courses = await this.db.query.courses.findMany({
            where: whereCondition,
            limit,
            offset,
        });

        return {
            data: courses,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const course = await this.db.query.courses.findFirst({
            where: eq(schema.courses.id, id),
        });
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async create(name: string) {
        const [course] = await this.db.insert(schema.courses).values({ name }).returning();
        return course;
    }

    async update(id: number, name: string) {
        const [course] = await this.db
            .update(schema.courses)
            .set({ name })
            .where(eq(schema.courses.id, id))
            .returning();
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async delete(id: number) {
        const [course] = await this.db
            .delete(schema.courses)
            .where(eq(schema.courses.id, id))
            .returning();
        if (!course) throw new NotFoundException('Course not found');
        return { message: 'Course deleted successfully' };
    }
}
