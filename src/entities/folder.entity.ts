import { DocumentEntity } from "@entities";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("folders")
export class FolderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "integer" })
  workspaceId: number;

  //new column
  @Column({ type: "integer", nullable: true })
  parentId: number; // Add a parentId column to represent the parent folder

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(() => FolderEntity, folder => folder.subfolders)
  @JoinColumn({ name: "parentId" })
  parent: FolderEntity;

  @OneToMany(() => FolderEntity, folder => folder.parent)
  subfolders: FolderEntity[];

  @OneToMany(() => DocumentEntity, document => document.folder)
  document: DocumentEntity[];
}
