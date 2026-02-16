import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import type { CreateTeacherAssignmentDto, UpdateTeacherAssignmentDto } from './teacher-assignments.service';

@Controller('admin/teacher-assignments')
export class TeacherAssignmentsController {
    constructor(private readonly teacherAssignmentsService: TeacherAssignmentsService) { }

    @Post()
    async create(@Body() dto: CreateTeacherAssignmentDto) {
        return this.teacherAssignmentsService.create(dto);
    }

    @Get()
    async findAll() {
        return this.teacherAssignmentsService.findAll();
    }

    @Get('teacher/:teacherId')
    async findByTeacher(@Param('teacherId') teacherId: string) {
        return this.teacherAssignmentsService.findByTeacher(teacherId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const numId = parseInt(id, 10);
        if (isNaN(numId)) {
            return { error: 'Invalid ID' };
        }
        return this.teacherAssignmentsService.findOne(numId);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateTeacherAssignmentDto) {
        const numId = parseInt(id, 10);
        if (isNaN(numId)) {
            return { error: 'Invalid ID' };
        }
        return this.teacherAssignmentsService.update(numId, dto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        const numId = parseInt(id, 10);
        if (isNaN(numId)) {
            return { error: 'Invalid ID' };
        }
        return this.teacherAssignmentsService.delete(numId);
    }

    @Get('classes/available')
    async getAvailableClasses() {
        return this.teacherAssignmentsService.getAvailableClasses();
    }

    @Get('courses/available')
    async getAvailableCourses() {
        return this.teacherAssignmentsService.getAvailableCourses();
    }

    @Get('courses/by-class/:classId')
    async getCoursesByClass(@Param('classId') classId: string) {
        const numId = parseInt(classId, 10);
        if (isNaN(numId)) {
            return { error: 'Invalid class ID' };
        }
        return this.teacherAssignmentsService.getCoursesByClass(numId);
    }
}
