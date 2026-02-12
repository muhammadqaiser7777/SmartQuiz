import { pgTable, serial, text, timestamp, uuid, integer, unique, pgEnum } from 'drizzle-orm/pg-core';

export const correctOptionEnum = pgEnum('correct_option', ['1', '2', '3', '4']);

export const admins = pgTable('admins', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const teachers = pgTable('teachers', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    authId: text('auth_id').notNull().unique(),
    authProvider: text('auth_provider').notNull(),
    profilePicture: text('profile_picture'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const students = pgTable('students', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    authId: text('auth_id').notNull().unique(),
    authProvider: text('auth_provider').notNull(), // 'google' | 'microsoft'
    profilePicture: text('profile_picture'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const courses = pgTable('courses', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
});

export const classes = pgTable('classes', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
});

export const classCourses = pgTable('class_courses', {
    id: serial('id').primaryKey(),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
}, (t) => ({
    unq: unique().on(t.classId, t.courseId),
}));

export const classTeachers = pgTable('class_teachers', {
    id: serial('id').primaryKey(),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
}, (t) => ({
    unq: unique().on(t.classId, t.teacherId),
}));

export const classStudents = pgTable('class_students', {
    id: serial('id').primaryKey(),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
}, (t) => ({
    unq: unique().on(t.classId, t.studentId),
}));

export const courseTeachers = pgTable('course_teachers', {
    id: serial('id').primaryKey(),
    courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
}, (t) => ({
    unq: unique().on(t.courseId, t.teacherId),
}));

export const courseStudents = pgTable('course_students', {
    id: serial('id').primaryKey(),
    courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
}, (t) => ({
    unq: unique().on(t.courseId, t.studentId),
}));

export const classCourseTeacher = pgTable('class_course_teacher', {
    id: serial('id').primaryKey(),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
}, (t) => ({
    unq: unique().on(t.classId, t.courseId, t.teacherId),
}));

export const classCourseStudent = pgTable('class_course_student', {
    id: serial('id').primaryKey(),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
}, (t) => ({
    unq: unique().on(t.classId, t.courseId, t.studentId),
}));

export const quizzes = pgTable('quizzes', {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: integer('course_id').references(() => courses.id),
    teacherId: uuid('teacher_id').references(() => teachers.id),
    title: text('title').notNull(),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time').notNull(),
    classId: integer('class_id').references(() => classes.id),
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
    correctOption: correctOptionEnum('correct_option').notNull(),
});

export const marks = pgTable('marks', {
    id: uuid('id').defaultRandom().primaryKey(),
    quizId: uuid('quiz_id').notNull().references(() => quizzes.id),
    studentId: uuid('student_id').notNull().references(() => students.id),
    obtainedMarks: integer('obtained_marks').notNull(),
    totalMarks: integer('total_marks').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
