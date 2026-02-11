import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Course } from './course.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: ['teacher', 'student'], default: 'student' })
  role: string;

  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];
}

