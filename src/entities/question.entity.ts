import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity, AnswersEntity, TeamEntity, DocumentEntity } from "@entities";

@Entity("questions")
export class QuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  topic: string;

  @Column({ type: "integer" })
  to: number;

  @Column({ type: "integer" })
  from: number;

  @Column({ type: "text" })
  question: string;

  @Column({ type: "integer", nullable: true })
  documentId: number;

  @Column({ type: "integer" })
  userId: number;

  @Column({ type: "boolean", nullable: true, default: false })
  sendForApproval: boolean;

  @Column({ type: "boolean", nullable: true, default: false })
  isHighPriority: boolean;

  @Column({ type: "boolean", nullable: true, default: false })
  isClosed: boolean;

  @Column({ type: "boolean", nullable: true, default: true })
  isNew: boolean;

  @Column({ type: "integer" })
  workspaceId: number;

  @Column({ type: "integer" })
  queNum: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(() => UserEntity, user => user.question)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @OneToMany(() => AnswersEntity, answer => answer.question)
  answer: AnswersEntity[];

  @ManyToOne(() => TeamEntity, from => from.question)
  @JoinColumn({ name: "from" })
  queFrom: TeamEntity;

  @ManyToOne(() => TeamEntity, to => to.question)
  @JoinColumn({ name: "to" })
  queTo: TeamEntity;

  @OneToOne(() => DocumentEntity, document => document.question)
  @JoinColumn({ name: "documentId" })
  document: DocumentEntity;
}
