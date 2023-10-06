import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EWorkspacePurpose, EWorkspaceType } from "../types/index";

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

  @Column({ type: "enum", enum: "EWorkspacePurpose" })
  purpose: EWorkspacePurpose;

  @Column({ type: "enum", enum: "EWorkspaceType" })
  type: EWorkspaceType;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
