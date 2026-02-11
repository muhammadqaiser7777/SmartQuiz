import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  teacherId: string;

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;
}