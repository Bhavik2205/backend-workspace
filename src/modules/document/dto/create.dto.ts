import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  public categoryId: number;

  @IsNotEmpty()
  @IsString()
  public folderId: number;

  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;

  @IsOptional()
  @IsBoolean()
  isDownloadable?: boolean;
}
