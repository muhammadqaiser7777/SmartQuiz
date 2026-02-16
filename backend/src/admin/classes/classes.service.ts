import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ClassesService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async findAll() {
        return await this.db.query.classes.findMany();
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
