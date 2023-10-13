import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { QuestionEntity } from "./question.entity";
import { UserEntity } from "./user.entity";

@Entity("answers")
export class AnswersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer" })
  questionId: number;

  @Column({ type: "text" })
  answer: string;

  @Column({ type: "integer" })
  userId: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(() => QuestionEntity, question => question.answer)
  question: QuestionEntity;

  @ManyToOne(() => UserEntity, user => user.answer)
  user: UserEntity;
}
