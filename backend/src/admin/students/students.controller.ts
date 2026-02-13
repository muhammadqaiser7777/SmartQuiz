import { Controller, Get, Post, Body } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('admin/students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Get()
    async getAllStudents() {
        return this.studentsService.getAllStudents();
    }

}
