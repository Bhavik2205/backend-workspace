import { ParticipateEntity } from "@entities";
import { ERolesRole } from "@types";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("roles")
export class RolesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "json" })
  permission: JSON;

  @Column({ type: "enum", enum: ERolesRole })
  role: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToMany(() => ParticipateEntity, participates => participates.roles)
  participates: ParticipateEntity[];
}
