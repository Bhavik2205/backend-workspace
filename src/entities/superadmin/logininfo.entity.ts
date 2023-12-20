import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EUserType } from "@types";

@Entity("logininfo")
export class LoginInfoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", nullable: false})
    token: string;

    @Column({type: "integer", nullable: false})
    userId: number;

    @Column({type: "enum", enum: EUserType, nullable: false}) //apply enum changes,
    userType: EUserType;

    @Column({type: "varchar", nullable: true})
    systemId: string;

    @Column({type: "varchar", length: 255, nullable: false})
    ip: string;

    @Column({type: "boolean", default: true})
    status: boolean;

    @CreateDateColumn({nullable: false})
    createdAt: Date;

    @UpdateDateColumn({nullable: true})
    updatedAt: Date;
}