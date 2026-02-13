import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';

@Injectable()
export class StudentsService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async getAllStudents() {
        const students = await this.db.query.students.findMany({
            columns: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return students;
    }
}
