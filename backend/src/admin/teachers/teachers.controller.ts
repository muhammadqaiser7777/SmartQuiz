import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TeachersService } from './teachers.service';

@Controller('admin/teachers')
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) { }

    @Get()
    async getAllTeachers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('search') search: string = '',
    ) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const searchTerm = search || undefined;
        return this.teachersService.getAllTeachers(pageNum, limitNum, searchTerm);
    }
}
