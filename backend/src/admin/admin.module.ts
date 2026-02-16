import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';
import { AdminMiddleware } from './admin.middleware';
import { CoursesController } from './courses/courses.controller';
import { CoursesService } from './courses/courses.service';
import { ClassesController } from './classes/classes.controller';
import { ClassesService } from './classes/classes.service';
import { AssignmentsController } from './assignments/assignments.controller';
import { AssignmentsService } from './assignments/assignments.service';
import { TeachersController } from './teachers/teachers.controller';
import { TeachersService } from './teachers/teachers.service';
import { StudentsController } from './students/students.controller';
import { StudentsService } from './students/students.service';
import { TeacherAssignmentsController } from './teacher-assignments/teacher-assignments.controller';
import { TeacherAssignmentsService } from './teacher-assignments/teacher-assignments.service';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [
        AdminController,
        CoursesController,
        ClassesController,
        AssignmentsController,
        TeachersController,
        StudentsController,
        TeacherAssignmentsController
    ],
    providers: [
        AdminService,
        CoursesService,
        ClassesService,
        AssignmentsService,
        TeachersService,
        StudentsService,
        TeacherAssignmentsService
    ],
})
export class AdminModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AdminMiddleware)
            .exclude({ path: 'admin/login', method: RequestMethod.POST })
            .forRoutes(
                AdminController,
                CoursesController,
                ClassesController,
                AssignmentsController,
                TeachersController,
                StudentsController,
                TeacherAssignmentsController
            );
    }
}
