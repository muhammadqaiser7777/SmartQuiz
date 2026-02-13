import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class TeachersService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async getAllTeachers() {
        const teachers = await this.db.query.teachers.findMany({
            columns: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return teachers;
    }
}
