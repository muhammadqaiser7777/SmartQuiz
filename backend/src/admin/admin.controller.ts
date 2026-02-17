import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import type { LoginDto } from './dto/login.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.adminService.login(loginDto);
    }
}
