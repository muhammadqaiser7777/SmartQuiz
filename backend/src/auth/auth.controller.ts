import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthService } from './auth.service';
import { StudentService } from '../student/student.service';
import { TeacherService } from '../teacher/teacher.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly studentService: StudentService,
        private readonly teacherService: TeacherService,
    ) { }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req) {
        // Guard handles redirect to Google
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res) {
        const user = req.user;
        console.log('Google Auth User:', user);
        const role = user.role; // This was set in GoogleStrategy validate

        let result;
        let userData;
        if (role === 'teacher') {
            result = await this.teacherService.loginOrSignupServerSide(user);
            userData = result.teacher;
        } else {
            result = await this.studentService.loginOrSignupServerSide(user);
            userData = result.student;
        }

        // Redirect back to frontend with token, role, and user details
        // Ensure this matches your Angular app's port (usually 4200 or 2002 as seen in angular.json)
        const frontendUrl = 'http://localhost:2002';
        const redirectUrl = `${frontendUrl}/login?token=${result.access_token}&role=${role}&name=${encodeURIComponent(userData.name)}&email=${encodeURIComponent(userData.email)}&picture=${encodeURIComponent(userData.profilePicture)}`;

        console.log(`Redirecting to: ${redirectUrl}`);
        res.redirect(redirectUrl);
    }
}
