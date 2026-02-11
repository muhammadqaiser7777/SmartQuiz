import { pgTable, serial, text, timestamp, pgEnum, uuid, integer } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['teacher', 'student']);

export const admins = pgTable('admins', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    role: userRoleEnum('role').default('student'),
});

export const courses = pgTable('courses', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    teacherId: uuid('teacher_id').references(() => users.id),
});

export const quizzes = pgTable('quizzes', {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: uuid('course_id').references(() => courses.id),
    title: text('title').notNull(),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time').notNull(),
    class: text('class').notNull(),
    totalQuestions: integer('total_questions').notNull(),
    totalMarks: integer('total_marks').notNull(),
});

export const questions = pgTable('questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    quizId: uuid('quiz_id').references(() => quizzes.id),
    question: text('question').notNull(),
    optionA: text('option_a').notNull(),
    optionB: text('option_b').notNull(),
    optionC: text('option_c').notNull(),
    optionD: text('option_d').notNull(),
    correctOption: text('correct_option').notNull(),
});

export const marks = pgTable('marks', {
    id: uuid('id').defaultRandom().primaryKey(),
    quizId: uuid('quiz_id').notNull(),
    quizTitle: text('quiz_title').notNull(),
    course: text('course').notNull(),
    class: text('class').notNull(),
    studentId: uuid('student_id').notNull(),
    studentName: text('student_name').notNull(),
    teacherId: uuid('teacher_id').notNull(),
    teacherName: text('teacher_name').notNull(),
    obtainedMarks: integer('obtained_marks').notNull(),
    totalMarks: integer('total_marks').notNull(),
});
