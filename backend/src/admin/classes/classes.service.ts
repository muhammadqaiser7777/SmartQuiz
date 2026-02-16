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

    async findByName(name: string, excludeId?: number): Promise<any> {
        // Build where condition to check for existing name
        let whereCondition: any;
        if (excludeId) {
            whereCondition = or(
                ilike(schema.classes.name, name),
                eq(schema.classes.name, name.toLowerCase()),
                eq(schema.classes.name, name.toUpperCase()),
            );
            // Query and filter manually for excludeId
            const existingClasses = await this.db.query.classes.findMany({
                where: whereCondition,
            });
            return existingClasses.find(c => c.id !== excludeId) || null;
        }
        const [existingClass] = await this.db.query.classes.findMany({
            where: or(
                ilike(schema.classes.name, name),
                eq(schema.classes.name, name.toLowerCase()),
                eq(schema.classes.name, name.toUpperCase()),
            ),
        });
        return existingClass || null;
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
        // Check if class with same name already exists
        const existingClass = await this.findByName(name);
        if (existingClass) {
            throw new ConflictException('Class with this name already exists');
        }
        const [classItem] = await this.db.insert(schema.classes).values({ name }).returning();
        return classItem;
    }

    async update(id: number, name: string) {
        // Check if class with same name already exists (excluding current id)
        const existingClass = await this.findByName(name, id);
        if (existingClass) {
            throw new ConflictException('Class with this name already exists');
        }
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
