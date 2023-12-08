import { ELogsActivity } from "@types";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { WorkspaceEntity } from "./workspace.entity";

@Entity("logs")
export class LogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "json" })
  metadata: Record<string, string | number | Date | boolean>;

  @Column({ type: "enum", enum: ELogsActivity, nullable: true })
  activity: ELogsActivity;

  @Column({ type: "integer", nullable: true })
  workspaceId: number;

  @Column({ type: "integer" })
  userId: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToMany(() => UserEntity, user => user.logs)
  user: UserEntity[]

  @ManyToMany(() => WorkspaceEntity, workspace => workspace.logs)
  workspace: WorkspaceEntity[]
}
