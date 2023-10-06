import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("twoFactorAuthRequest")
export class TwoFactorAuthRequestEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "integer", nullable: false })
  userId: number;

  @Column({ type: "text", nullable: false })
  hashCode: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
