import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { LoginDto } from './dto/login.dto';
import { CryptoUtil } from '../utils/crypto.util';

@Injectable()
export class AdminService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async login(loginDto: LoginDto) {
        const { username, password } = loginDto;

        // Encrypt incoming password to match stored password
        const encryptedPassword = CryptoUtil.encrypt(password);

        const admin = await this.db.query.admins.findFirst({
            where: eq(schema.admins.username, username),
        });

        if (!admin || admin.password !== encryptedPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Usually you'd return a JWT here, but for now we'll return a success message
        return {
            message: 'Login successful',
            admin: {
                id: admin.id,
                username: admin.username,
            },
        };
    }
}
