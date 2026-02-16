import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller('admin/classes')
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Get()
    async findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('search') search: string = '',
    ) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const searchTerm = search || undefined;
        return this.classesService.findAll(pageNum, limitNum, searchTerm);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.classesService.findOne(id);
    }

    @Get(':id/courses')
    async getCourses(@Param('id', ParseIntPipe) id: number) {
        return this.classesService.getCourses(id);
    }

    @Post()
    async create(@Body('name') name: string) {
        return this.classesService.create(name);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
        return this.classesService.update(id, name);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.classesService.delete(id);
    }
}
