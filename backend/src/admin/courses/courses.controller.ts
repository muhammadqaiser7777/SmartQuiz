import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('admin/courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Get()
    async findAll() {
        return this.coursesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.coursesService.findOne(id);
    }

    @Post()
    async create(@Body('name') name: string) {
        return this.coursesService.create(name);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
        return this.coursesService.update(id, name);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.coursesService.delete(id);
    }
}
