import { Controller, Get, Post, Body, UseGuards, Request, Query, Param } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherJwtAuthGuard } from '../auth/guards/teacher-jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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
}
