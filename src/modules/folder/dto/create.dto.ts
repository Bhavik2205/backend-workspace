import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  public name: string;
}
