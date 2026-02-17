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

    @Post('class-to-student')
    async assignClassToStudent(@Body('classId') classId: number, @Body('studentId') studentId: string) {
        return this.assignmentsService.assignClassToStudent(classId, studentId);
    }
    @Delete('class-to-student')
    async unassignClassFromStudent(@Body('classId') classId: number, @Body('studentId') studentId: string) {
        return this.assignmentsService.unassignClassFromStudent(classId, studentId);
    }
}
