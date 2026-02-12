import { Controller, Post, Delete, Body } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

@Controller('admin/assignments')
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    @Post('course-to-class')
    async assignCourseToClass(@Body('courseId') courseId: number, @Body('classId') classId: number) {
        return this.assignmentsService.assignCourseToClass(courseId, classId);
    }
    @Delete('course-to-class')
    async unassignCourseFromClass(@Body('courseId') courseId: number, @Body('classId') classId: number) {
        return this.assignmentsService.unassignCourseFromClass(courseId, classId);
    }

    @Post('course-to-student')
    async assignCourseToStudent(@Body('courseId') courseId: number, @Body('studentId') studentId: string) {
        return this.assignmentsService.assignCourseToStudent(courseId, studentId);
    }
    @Delete('course-to-student')
    async unassignCourseFromStudent(@Body('courseId') courseId: number, @Body('studentId') studentId: string) {
        return this.assignmentsService.unassignCourseFromStudent(courseId, studentId);
    }

    @Post('course-to-teacher')
    async assignCourseToTeacher(@Body('courseId') courseId: number, @Body('teacherId') teacherId: string) {
        return this.assignmentsService.assignCourseToTeacher(courseId, teacherId);
    }
    @Delete('course-to-teacher')
    async unassignCourseFromTeacher(@Body('courseId') courseId: number, @Body('teacherId') teacherId: string) {
        return this.assignmentsService.unassignCourseFromTeacher(courseId, teacherId);
    }

    @Post('class-to-student')
    async assignClassToStudent(@Body('classId') classId: number, @Body('studentId') studentId: string) {
        return this.assignmentsService.assignClassToStudent(classId, studentId);
    }
    @Delete('class-to-student')
    async unassignClassFromStudent(@Body('classId') classId: number, @Body('studentId') studentId: string) {
        return this.assignmentsService.unassignClassFromStudent(classId, studentId);
    }

    @Post('class-to-teacher')
    async assignClassToTeacher(@Body('classId') classId: number, @Body('teacherId') teacherId: string) {
        return this.assignmentsService.assignClassToTeacher(classId, teacherId);
    }
    @Delete('class-to-teacher')
    async unassignClassFromTeacher(@Body('classId') classId: number, @Body('teacherId') teacherId: string) {
        return this.assignmentsService.unassignClassFromTeacher(classId, teacherId);
    }
}
