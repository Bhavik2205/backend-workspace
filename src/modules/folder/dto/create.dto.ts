import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public name: string;
}
