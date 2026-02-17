import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentJwtAuthGuard } from '../auth/guards/student-jwt.guard';
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

@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post('create')
    async createStudent(@Body() body: { name: string; email: string }) {
        return this.studentService.createStudent(body.name, body.email);
    }

    // Keep your protected routes as they are
    @Get('profile')
    @UseGuards(StudentJwtAuthGuard, RoleGuard)
    @Roles('student')
    getProfile(@Request() req: RequestWithUser) {
        const studentId = req.user.sub || req.user.id;
        return { message: 'Welcome Student! This is a protected endpoint.', studentId };
    }
}