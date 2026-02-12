import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class CoursesService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async findAll() {
        return await this.db.query.courses.findMany();
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
