import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TeacherJwtAuthGuard } from './guards/teacher-jwt.guard';
import { StudentJwtAuthGuard } from './guards/student-jwt.guard';
import { RoleGuard } from './guards/role.guard';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { TeacherModule } from '../teacher/teacher.module';
import { StudentModule } from '../student/student.module';

@Module({
    imports: [
        // Default JWT module (for admin)
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' },
        }),
        PassportModule,
        forwardRef(() => TeacherModule),
        forwardRef(() => StudentModule),
    ],
    providers: [AuthService, JwtAuthGuard, TeacherJwtAuthGuard, StudentJwtAuthGuard, RoleGuard, GoogleStrategy],
    controllers: [AuthController],
    exports: [AuthService, JwtModule, JwtAuthGuard, TeacherJwtAuthGuard, StudentJwtAuthGuard, RoleGuard],
})
export class AuthModule { }
