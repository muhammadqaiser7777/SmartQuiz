import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string; // Link this to Course later if needed

  @Column()
  title: string;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column()
  class: string;

  @Column({ name: 'total_questions' })
  totalQuestions: number;

  @Column({ name: 'total_marks' })
  totalMarks: number;
}