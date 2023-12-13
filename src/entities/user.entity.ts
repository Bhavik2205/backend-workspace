import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, ManyToMany, JoinTable } from "typeorm";
import { ParticipateEntity, AnswersEntity, QuestionEntity, DocumentEntity, WorkflowEntity, WorkspaceEntity, LogEntity } from "@entities";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  firstName: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  lastName: string;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  mobile: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  country: string;

  @Column({ type: "boolean", nullable: false })
  isActive: boolean;

  @Column({ type: "boolean", nullable: false })
  isAdmin: boolean;

  @Column({ type: "varchar", length: 100, nullable: true })
  companyName: string;

  @Column({ type: "text", nullable: true })
  imageUrl: string;

  @Column({ type: "boolean", nullable: true })
  is2FAEnabled: boolean;

  @Column({ type: "int", nullable: true })
  planId: number;

  @CreateDateColumn({ nullable: true })
  codeExpiredIn: Date;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @OneToMany(() => QuestionEntity, question => question.user)
  question: QuestionEntity[];

  @OneToMany(() => AnswersEntity, answer => answer.user)
  answer: AnswersEntity[];

  @OneToOne(() => ParticipateEntity, participates => participates.user)
  participates: ParticipateEntity;

  @OneToMany(() => DocumentEntity, document => document.user)
  document: DocumentEntity[];

  @OneToMany(() => WorkflowEntity, workflow => workflow.user)
  workflow: WorkflowEntity[];

  @OneToOne(() => WorkspaceEntity, workspace => workspace.user)
  workspace: WorkspaceEntity;

  @ManyToMany(() => LogEntity, log => log.user)
  @JoinTable({
    name: "logs",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "id", referencedColumnName: "id" },
  })
  logs: LogEntity[];
}
