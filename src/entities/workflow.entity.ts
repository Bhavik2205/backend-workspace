import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ParticipateEntity, UserEntity } from "@entities";
import { EWorkflowStatus } from "@types";

@Entity("workflows")
export class WorkflowEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "integer" })
  workspaceId: number;

  @Column({ type: "date", nullable: true })
  dueDate: Date;

  @Column({ type: "integer" })
  userId: number;

  @Column({ type: "integer", nullable: true })
  teamId: number;

  @Column({ type: "integer", nullable: true })
  allocate: number;

  @Column({ type: "integer", nullable: true })
  taskNum: number;

  @Column({ type: "enum", enum: EWorkflowStatus, nullable: true })
  status: EWorkflowStatus;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(() => UserEntity, user => user.workflow)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @ManyToOne(() => ParticipateEntity, participates => participates.workflow)
  @JoinColumn({ name: "allocate" })
  participates: ParticipateEntity;
}
