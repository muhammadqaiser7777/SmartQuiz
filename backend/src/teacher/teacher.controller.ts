import { Controller, Get, UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('teacher')
export class TeacherController {
    constructor(private readonly teacherService: TeacherService) { }


    @Get('profile')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles('teacher')
    getProfile() {
        return { message: 'Welcome Teacher! This is a protected endpoint.' };
    }
}
