import { UserSubscriptionEntity } from "@entities";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("subscriptionPlans")
export class SubscriptionPlanEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "json", nullable: true })
  metaData: Record<string, string | number | Date | boolean>;

  @Column({ type: "integer" })
  price: number;

  @Column({ type: "json", nullable: true })
  feature: Record<string, string | number | Date | boolean>;

  @Column({ type: "varchar", length: 255 })
  productId: string;

  @Column({ type: "integer", nullable: true })
  discount: number;

  @Column({ type: "varchar", length: 255 })
  duration: string;

  @Column({ type: "varchar", length: 255 })
  priceId: string;

  @Column({ type: "text", nullable: true })
  images: string;

  @Column({ type: "text", nullable: true })
  slug: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToOne(() => UserSubscriptionEntity, subscription => subscription.plan)
  subscription: UserSubscriptionEntity;
}
