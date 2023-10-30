import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("userRoles")
export class UserRolesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer", nullable: true })
  userId: number;

  @Column({ type: "integer" })
  roleId: number;

  @Column({ type: "integer" })
  participateId: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
