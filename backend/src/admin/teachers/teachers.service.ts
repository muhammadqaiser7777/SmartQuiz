import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
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

export interface TeacherWithDates {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

@Injectable()
export class TeachersService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async getAllTeachers(page: number = 1, limit: number = 20, search?: string): Promise<PaginatedResponse<TeacherWithDates>> {
        const offset = (page - 1) * limit;

        // Build where condition for search
        let whereCondition: any = undefined;
        if (search) {
            whereCondition = or(
                ilike(schema.teachers.name, `%${search}%`),
                ilike(schema.teachers.email, `%${search}%`)
            );
        }

        // Get total count
        const countResult = whereCondition
            ? await this.db.select({ count: schema.teachers.id }).from(schema.teachers).where(whereCondition)
            : await this.db.select({ count: schema.teachers.id }).from(schema.teachers);
        const total = countResult.length;

        const teachers = await this.db.query.teachers.findMany({
            columns: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
            },
            where: whereCondition,
            limit,
            offset,
        });

        return {
            data: teachers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
