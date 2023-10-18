import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity, QuestionEntity, FolderEntity, CategoryEntity } from "@entities";

@Entity("documents")
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "integer", nullable: true })
  docNum: number;

  @Column({ type: "integer" })
  size: number;

  @Column({ type: "text", nullable: false })
  file: string;

  @Column({ type: "integer", nullable: false })
  folderId: number;

  @Column({ type: "integer", nullable: false })
  categoryId: number;

  @Column({ type: "integer", nullable: false })
  userId: number;

  @Column({ type: "integer", nullable: false })
  workspaceId: number;

  @Column({ type: "boolean", nullable: false, default: false })
  isEditable: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  isDownloadable: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(() => UserEntity, user => user.document)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @ManyToOne(() => CategoryEntity, category => category.document)
  @JoinColumn({ name: "categoryId" })
  category: CategoryEntity;

  @ManyToOne(() => FolderEntity, folder => folder.document)
  @JoinColumn({ name: "folderId" })
  folder: FolderEntity;

  @OneToOne(() => QuestionEntity, question => question.document)
  question: QuestionEntity;
}
