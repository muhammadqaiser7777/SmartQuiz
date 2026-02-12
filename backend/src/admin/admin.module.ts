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
        AssignmentsController
    ],
    providers: [
        AdminService,
        CoursesService,
        ClassesService,
        AssignmentsService
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
                AssignmentsController
            );
    }
}
