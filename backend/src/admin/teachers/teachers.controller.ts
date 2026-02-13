import { Controller, Get, Post, Body } from '@nestjs/common';
import { TeachersService } from './teachers.service';

@Controller('admin/teachers')
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) { }

    @Get()
    async getAllTeachers() {
        return this.teachersService.getAllTeachers();
    }
}
