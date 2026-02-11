import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('marks')
export class Marks {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizId: string;

  @Column()
  quizTitle: string;

  @Column()
  course: string;

  @Column()
  class: string;

  @Column()
  studentId: string;

  @Column()
  studentName: string;

  @Column()
  teacherId: string;

  @Column()
  teacherName: string;

  @Column({ name: 'obtained_marks' })
  obtainedMarks: number;

  @Column({ name: 'total_marks' })
  totalMarks: number;
}
