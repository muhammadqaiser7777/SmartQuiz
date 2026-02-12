import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { TeacherModule } from '../teacher/teacher.module';
import { StudentModule } from '../student/student.module';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' },
        }),
        PassportModule,
        forwardRef(() => TeacherModule),
        forwardRef(() => StudentModule),
    ],
    providers: [AuthService, JwtAuthGuard, RoleGuard, GoogleStrategy],
    controllers: [AuthController],
    exports: [AuthService, JwtModule, JwtAuthGuard, RoleGuard],
})
export class AuthModule { }
