import { TeamEntity, UserEntity } from "@entities";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("participates")
export class ParticipateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer" })
  teamId: number;

  @Column({ type: "integer" })
  userId: number;

  @Column({ type: "integer", nullable: true })
  roleId: number;

  @Column({ type: "boolean" })
  isInvited: boolean;

  @Column({ type: "integer" })
  workspaceId: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(() => TeamEntity, teams => teams.participates)
  @JoinColumn({ name: "teamId" })
  teams: TeamEntity;

  @OneToOne(() => UserEntity, user => user.participates)
  @JoinColumn({ name: "userId" })
  user: UserEntity;
}
