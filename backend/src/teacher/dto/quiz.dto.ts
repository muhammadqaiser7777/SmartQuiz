import * as Joi from 'joi';

// Question DTO for adding questions to a quiz
export const QuestionSchema = Joi.object({
    question: Joi.string().required().min(1).max(1000),
    optionA: Joi.string().required().min(1).max(500),
    optionB: Joi.string().required().min(1).max(500),
    optionC: Joi.string().required().min(1).max(500),
    optionD: Joi.string().required().min(1).max(500),
    correctOption: Joi.string().valid('1', '2', '3', '4').required(),
});

export interface QuestionDto {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: '1' | '2' | '3' | '4';
}

// Custom validation for quiz time constraints
export const validateQuizTime = (value: { startTime: string; endTime: string }) => {
    const now = new Date();
    const startTime = new Date(value.startTime);
    const endTime = new Date(value.endTime);

    // Check if start time is in the past
    if (startTime <= now) {
        return { message: 'Start time cannot be in the past' };
    }

    // Check if end time is in the past
    if (endTime <= now) {
        return { message: 'End time cannot be in the past' };
    }

    // Check if end time is before start time
    if (endTime <= startTime) {
        return { message: 'End time must be after start time' };
    }

    // Check if gap exceeds 60 minutes
    const diffInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (diffInMinutes > 60) {
        return { message: 'The gap between start and end time cannot exceed 60 minutes' };
    }

    return null;
};

// Quiz creation DTO - accepts ISO 8601 datetime strings with timezone info
export const CreateQuizSchema = Joi.object({
    title: Joi.string().required().min(1).max(200),
    startTime: Joi.string().required(), // ISO 8601 datetime string with timezone
    endTime: Joi.string().required(),   // ISO 8601 datetime string with timezone
    totalMarks: Joi.number().integer().required().min(1),
    classId: Joi.number().integer().required(),
    courseId: Joi.number().integer().required(),
    questions: Joi.array()
        .items(QuestionSchema)
        .required()
        .min(1)
        .max(100),
}).custom((value, helpers) => {
    const error = validateQuizTime(value);
    if (error) {
        return helpers.error(error.message);
    }
    return value;
});

export interface CreateQuizDto {
    title: string;
    startTime: string; // ISO 8601 datetime string (timezone-aware)
    endTime: string;   // ISO 8601 datetime string (timezone-aware)
    totalMarks: number;
    classId: number;
    courseId: number;
    questions: QuestionDto[];
}

// Quiz with questions response DTO
export interface QuizWithQuestions {
    id: string;
    courseId: number;
    teacherId: string;
    title: string;
    startTime: Date;
    endTime: Date;
    classId: number;
    totalQuestions: number;
    totalMarks: number;
    questions: QuestionInDb[];
}

export interface QuestionInDb {
    id: string;
    quizId: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: '1' | '2' | '3' | '4';
}

// Update quiz DTO (for adding questions after initial creation)
export const AddQuestionsSchema = Joi.object({
    questions: Joi.array()
        .items(QuestionSchema)
        .required()
        .min(1)
        .max(100),
});

export interface AddQuestionsDto {
    questions: QuestionDto[];
}

// Quiz list query DTO
export const QuizListQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    classId: Joi.number().integer(),
    courseId: Joi.number().integer(),
});

export interface QuizListQueryDto {
    page: number;
    limit: number;
    classId?: number;
    courseId?: number;
}
