import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EUserType, EEmailVerificationStatus, ESStatus } from "@types";

@Entity("superadminuser")
export class SuperadminUserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 255, nullable: false})
    firstName: string;

    @Column({type: "varchar", length: 255, nullable: false})
    lastName: string;

    @Column({type: "varchar", length: 255, nullable: false, unique: true})
    email: string;

    @Column({type: "varchar", length: 255, nullable: false})
    password: string;

    @Column({type: "enum", enum: EUserType, nullable: false}) //apply enum. required change
    role: EUserType;

    @Column({type: "enum", enum: EEmailVerificationStatus, nullable: false, default: EEmailVerificationStatus.Unverified}) //apply enum. required change
    emailVerificationStatus: EEmailVerificationStatus;

    @Column({type: "enum", enum: ESStatus, nullable: false, default: ESStatus.Active})
    status: ESStatus;

    @CreateDateColumn({nullable: false})
    createdAt: Date;

    @UpdateDateColumn({nullable: true})
    updatedAt: Date;

    @Column({type: "varchar", length: 255, nullable: false})
    ip: string;
}