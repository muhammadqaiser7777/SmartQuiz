import { Controller, Get, Post, Body, UseGuards, Request, Query, Param } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherJwtAuthGuard } from '../auth/guards/teacher-jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateQuizSchema, QuizListQuerySchema } from './dto/quiz.dto';
import { JoiValidationPipe } from '../utils/joi-validation.pipe';
import type { CreateQuizDto, QuizListQueryDto } from './dto/quiz.dto';

interface RequestWithUser extends Request {
    user: {
        sub: string;
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

@Controller('teacher')
export class TeacherController {
    constructor(private readonly teacherService: TeacherService) { }

    @Get('profile')
    @UseGuards(TeacherJwtAuthGuard, RoleGuard)
    @Roles('teacher')
    getProfile(@Request() req: RequestWithUser) {
        const teacherId = req.user.sub || req.user.id;
        return { message: 'Welcome Teacher! This is a protected endpoint.', teacherId };
    }

    @Get('assignments')
    @UseGuards(TeacherJwtAuthGuard, RoleGuard)
    @Roles('teacher')
    getMyAssignments(
        @Request() req: RequestWithUser,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        const teacherId = req.user.sub || req.user.id;
        console.log('TeacherController: Getting assignments for teacher ID:', teacherId);
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        return this.teacherService.getMyAssignments(teacherId, pageNum, limitNum);
    }

    @Get('assignments/:id')
    @UseGuards(TeacherJwtAuthGuard, RoleGuard)
    @Roles('teacher')
    getAssignmentById(
        @Request() req: RequestWithUser,
        @Param('id') id: string
    ) {
        const teacherId = req.user.sub || req.user.id;
        const assignmentId = parseInt(id, 10);
        if (isNaN(assignmentId)) {
            return { error: 'Invalid assignment ID' };
        }
        return this.teacherService.getAssignmentById(assignmentId, teacherId);
    }

    @Post('create')
    async createTeacher(@Body() body: { name: string; email: string }) {
        return this.teacherService.createTeacher(body.name, body.email);
    }

    // ==================== QUIZ ENDPOINTS ====================

    /**
     * Create a new quiz with questions
     * POST /teacher/quiz
     */
    @Post('quiz')
    @UseGuards(TeacherJwtAuthGuard, RoleGuard)
    @Roles('teacher')
    createQuiz(
        @Request() req: RequestWithUser,
        @Body(new JoiValidationPipe(CreateQuizSchema)) quizData: CreateQuizDto
    ) {
        const teacherId = req.user.sub || req.user.id;
        console.log('TeacherController: Creating quiz for teacher ID:', teacherId);
        return this.teacherService.createQuiz(teacherId, quizData);
    }

    /**
     * Get all quizzes for the authenticated teacher
     * GET /teacher/quizzes
     */
    @Get('quizzes')
    @UseGuards(TeacherJwtAuthGuard, RoleGuard)
    @Roles('teacher')
    getQuizzes(
        @Request() req: RequestWithUser,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('classId') classId?: string,
        @Query('courseId') courseId?: string
    ) {
        const teacherId = req.user.sub || req.user.id;
        const query: QuizListQueryDto = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            classId: classId ? parseInt(classId, 10) : undefined,
            courseId: courseId ? parseInt(courseId, 10) : undefined,
        };
        return this.teacherService.getQuizzes(teacherId, query);
    }

    /**
     * Get a specific quiz by ID
     * GET /teacher/quiz/:id
     */
    @Get('quiz/:id')
    @UseGuards(TeacherJwtAuthGuard, RoleGuard)
    @Roles('teacher')
    getQuizById(
        @Request() req: RequestWithUser,
        @Param('id') id: string
    ) {
        const teacherId = req.user.sub || req.user.id;
        return this.teacherService.getQuizById(teacherId, id);
    }

    /**
     * Get quiz details with leaderboard
     * GET /teacher/quiz/:id/details
     */
    @Get('quiz/:id/details')
    @UseGuards(TeacherJwtAuthGuard, RoleGuard)
    @Roles('teacher')
    getQuizDetailsWithLeaderboard(
        @Request() req: RequestWithUser,
        @Param('id') id: string
    ) {
        const teacherId = req.user.sub || req.user.id;
        return this.teacherService.getQuizDetailsWithLeaderboard(teacherId, id);
    }
}
