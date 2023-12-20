import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { EUserType } from "@types";

@Entity("twoFactorAuthRequest")
export class TwoFactorAuthRequestEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "integer", nullable: false })
  userId: number;

  @Column({ type: "enum", enum: EUserType, nullable: false})
  userType: EUserType;

  @Column({ type: "text", nullable: false })
  hashCode: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}