import { SubscriptionPlanEntity } from "@entities";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("userSubscriptions")
export class UserSubscriptionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer" })
  userId: number;

  @Column({ type: "integer", nullable: true })
  planId: number;

  @Column({ type: "date", nullable: true })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date;

  @Column({ type: "varchar", length: 255 })
  customerId: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  subscriptionId: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  productId: string;

  @Column({ type: "boolean", default: false })
  isActive: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToOne(() => SubscriptionPlanEntity, plan => plan.subscription)
  @JoinColumn({ name: "planId" })
  plan: SubscriptionPlanEntity;
}
