import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateWorkspaceDto {
  @IsNotEmpty()
  @IsString()
  presentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public name: string;
}
