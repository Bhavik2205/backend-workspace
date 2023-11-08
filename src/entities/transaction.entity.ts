import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("transactions")
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "json", nullable: true })
  metaData: Record<string, string | number | Date | boolean>;

  @Column({ type: "varchar", length: 255 })
  status: string;

  @Column({ type: "varchar", length: 255 })
  customerId: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
