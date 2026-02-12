import { Module, forwardRef } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';

@Module({
    imports: [forwardRef(() => AuthModule), DbModule],
    controllers: [TeacherController],
    providers: [TeacherService],
    exports: [TeacherService],
})
export class TeacherModule { }
