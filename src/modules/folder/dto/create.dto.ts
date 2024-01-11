import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public name: string;

  @IsOptional()
  @IsNumber()
  public parentId?: number; // Make parentId optional for creating top-level folders
}
