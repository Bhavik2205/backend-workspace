import { TeamEntity, UserEntity, WorkflowEntity, RolesEntity } from "@entities";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("participates")
export class ParticipateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer" })
  teamId: number;

  @Column({ type: "integer", nullable: true })
  userId: number;

  @Column({ type: "varchar", length: 255 })
  email: string;

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

  @OneToMany(() => WorkflowEntity, workflow => workflow.participates)
  workflow: WorkflowEntity[];

  @ManyToMany(() => RolesEntity, role => role.participates)
  @JoinTable({
    name: "userRoles",
    joinColumn: { name: "participateId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "roleId", referencedColumnName: "id" },
  })
  roles: RolesEntity[];
}
