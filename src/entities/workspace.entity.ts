import { EWorkspacePurpose, EWorkspaceType } from "@types";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { SettingEntity } from "./setting.entity";
import { LogEntity } from "./logs.entity";

@Entity("workspaces")
export class WorkspaceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "integer" })
  userId: number;

  @Column({ type: "text", nullable: true })
  imageUrl: string;

  @Column({ type: "enum", enum: EWorkspacePurpose })
  purpose: EWorkspacePurpose;

  @Column({ type: "enum", enum: EWorkspaceType })
  type: EWorkspaceType;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToOne(() => UserEntity, user => user.workspace)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @OneToOne(() => SettingEntity, setting => setting.workspace)
  setting: SettingEntity;

  @ManyToMany(() => LogEntity, log => log.workspace)
  @JoinTable({
    name: "logs",
    joinColumn: { name: "workspaceId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "id", referencedColumnName: "id" },
  })
  logs: LogEntity[];
}
