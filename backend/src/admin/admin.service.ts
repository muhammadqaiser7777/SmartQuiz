import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { LoginDto } from './dto/login.dto';
import { CryptoUtil } from '../utils/crypto.util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
    constructor(
        @Inject('DRIZZLE_DB')
        private db: NodePgDatabase<typeof schema>,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const { username, password } = loginDto;

        const admin = await this.db.query.admins.findFirst({
            where: eq(schema.admins.username, username),
        });

        if (!admin || !CryptoUtil.compare(password, admin.password)) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: admin.id, username: admin.username };

        return {
            message: 'Login successful',
            access_token: this.jwtService.sign(payload),
            admin: {
                id: admin.id,
                username: admin.username,
            },
        };
    }
}
