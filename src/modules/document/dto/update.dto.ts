import { IsOptional, IsString } from "class-validator";

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  public categoryId: number;

  @IsOptional()
  @IsString()
  public folderId: number;
}
