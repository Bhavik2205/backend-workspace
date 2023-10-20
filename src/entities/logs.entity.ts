import { ELogsActivity } from "@types";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
}
