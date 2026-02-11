import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

const logger = new Logger('DatabaseConnection');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Test the connection
pool.connect()
    .then((client) => {
        logger.log('Successfully connected to the database');
        client.release();
    })
    .catch((err) => {
        logger.error('Failed to connect to the database', err.stack);
    });
