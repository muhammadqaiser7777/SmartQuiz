import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { eq, ilike, or } from 'drizzle-orm';

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

    async findByName(name: string, excludeId?: number): Promise<any> {
        // Build where condition to check for existing name
        let whereCondition: any;
        if (excludeId) {
            whereCondition = or(
                ilike(schema.courses.name, name),
                eq(schema.courses.name, name.toLowerCase()),
                eq(schema.courses.name, name.toUpperCase()),
            );
            // Query and filter manually for excludeId
            const existingCourses = await this.db.query.courses.findMany({
                where: whereCondition,
            });
            return existingCourses.find(c => c.id !== excludeId) || null;
        }
        const [existingCourse] = await this.db.query.courses.findMany({
            where: or(
                ilike(schema.courses.name, name),
                eq(schema.courses.name, name.toLowerCase()),
                eq(schema.courses.name, name.toUpperCase()),
            ),
        });
        return existingCourse || null;
    }

    async create(name: string) {
        // Check if course with same name already exists
        const existingCourse = await this.findByName(name);
        if (existingCourse) {
            throw new ConflictException('Course with this name already exists');
        }
        const [course] = await this.db.insert(schema.courses).values({ name }).returning();
        return course;
    }

    async update(id: number, name: string) {
        // Check if course with same name already exists (excluding current id)
        const existingCourse = await this.findByName(name, id);
        if (existingCourse) {
            throw new ConflictException('Course with this name already exists');
        }
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
