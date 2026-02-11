import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const admins = pgTable('admins', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
