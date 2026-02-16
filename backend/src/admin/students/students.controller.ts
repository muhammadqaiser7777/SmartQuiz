import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('admin/students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Get()
    async getAllStudents(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('search') search: string = '',
    ) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const searchTerm = search || undefined;
        return this.studentsService.getAllStudents(pageNum, limitNum, searchTerm);
    }

    @Post(':id/assign-class')
    async assignClass(@Param('id') studentId: string, @Body('classId') classId: number) {
        return this.studentsService.assignClass(studentId, classId);
    }

    @Delete(':id/remove-class')
    async removeClass(@Param('id') studentId: string) {
        return this.studentsService.removeClass(studentId);
    }
}
