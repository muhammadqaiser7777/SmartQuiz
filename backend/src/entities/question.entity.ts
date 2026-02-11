import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizId: string;

  @Column()
  question: string;

  @Column()
  optionA: string;

  @Column()
  optionB: string;

  @Column()
  optionC: string;

  @Column()
  optionD: string;

  @Column()
  correctOption: string; 
}