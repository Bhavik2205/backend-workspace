import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EInvitedMemberRole, EInvitedMemberStatus } from "@types";
import { SuperadminUserEntity } from "./superadminuser.entity";

@Entity("invitedusers")
export class InvitedUsersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 255, nullable: false})
    invitedBy: string;

    @Column({type: "varchar", length: 255, nullable: false})
    email: string;

    @Column({type: "enum", enum: EInvitedMemberRole, nullable: false}) //change to enum.
    role: EInvitedMemberRole;

    @Column({type: "enum", enum: EInvitedMemberStatus, nullable: false, default: EInvitedMemberStatus.Pending}) //change to enum.
    status: EInvitedMemberStatus;

    @CreateDateColumn({nullable: false })
    createdAt: Date;

    @UpdateDateColumn({nullable: true})
    updatedAt: Date;
}