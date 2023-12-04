import { IsOptional, IsString } from "class-validator";

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  public categoryId: number;

  @IsOptional()
  @IsString()
  public folderId: number;

  @IsOptional()
  @IsString()
  isEditable?: boolean;

  @IsOptional()
  @IsString()
  isDownloadable?: boolean;
}
