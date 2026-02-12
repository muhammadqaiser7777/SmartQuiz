import { Controller, Get, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }


    @Get('profile')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('student')
    getProfile() {
        return { message: 'Welcome Student! This is a protected endpoint.' };
    }
}
