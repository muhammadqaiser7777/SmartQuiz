import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/students') // <--- Changed to match your Angular api.ts
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post('create')
    async createStudent(@Body() body: { name: string; email: string }) {
        return this.studentService.createStudent(body.name, body.email);
    }

    // Keep your protected routes as they are
    @Get('profile')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('student')
    getProfile() {
        return { message: 'Welcome Student! This is a protected endpoint.' };
    }
}