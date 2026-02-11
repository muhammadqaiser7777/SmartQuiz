import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL!;
// Only replace 'db' with 'localhost' if we are NOT running inside a Docker container.
const isDocker = process.env.RUNNING_IN_DOCKER === 'true';
const connectionUrl = isDocker ? databaseUrl : databaseUrl.replace('@db', '@localhost');

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: connectionUrl,
    },
});
