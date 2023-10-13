import { ParticipateEntity, QuestionEntity } from "@entities";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("teams")
export class TeamEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "integer" })
  workspaceId: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToMany(() => QuestionEntity, question => question.from)
  question: QuestionEntity[];

  @OneToMany(() => ParticipateEntity, participate => participate.teams)
  participates: ParticipateEntity[];
}
