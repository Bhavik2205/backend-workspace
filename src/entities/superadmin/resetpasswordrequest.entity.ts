import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { EUserType } from "../../types";

@Entity("resetpasswordrequest")
export class ResetPasswordRequestEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "integer", nullable: true })
  userId: number;

  @Column({ type: "enum", enum: EUserType, nullable: false})
  userType: EUserType;

  @Column({ type: "boolean", nullable: false, default: true})
  status: boolean;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
