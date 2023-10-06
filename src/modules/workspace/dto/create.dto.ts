import { IsNotEmpty, IsOptional, IsString, MaxLength, IsEnum } from "class-validator";
import { EWorkspacePurpose, EWorkspaceType } from "@types";

export class CreateWorkspaceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public name: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  public description?: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(EWorkspacePurpose)
  public purpose: EWorkspacePurpose;

  @IsNotEmpty()
  @IsString()
  @IsEnum(EWorkspaceType)
  public type: EWorkspaceType;
}
