import { UserEntity } from "@entities";
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

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToOne(() => UserEntity, user => user.setting)
  @JoinColumn({ name: "userId" })
  user: UserEntity[];
}
