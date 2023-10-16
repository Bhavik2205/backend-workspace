import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  public categoryId: number;

  @IsNotEmpty()
  @IsString()
  public folderId: number;

  @IsOptional()
  @IsString()
  isEditable?: boolean;

  @IsOptional()
  @IsString()
  isDownloadable?: boolean;
}
