import { WorkspaceEntity } from "@entities";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("settings")
export class SettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer" })
  userId: number;

  @Column({ type: "boolean", default: false })
  isQANotification: boolean;

  @Column({ type: "boolean", default: false })
  isTeamSpecificQA: boolean;

  @Column({ type: "integer" })
  workspaceId: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToOne(() => WorkspaceEntity, workspace => workspace.setting)
  @JoinColumn({ name: "workspaceId" })
  workspace: WorkspaceEntity[];
}
