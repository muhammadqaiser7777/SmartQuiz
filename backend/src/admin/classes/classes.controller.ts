import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller('admin/classes')
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Get()
    async findAll() {
        return this.classesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.classesService.findOne(id);
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
