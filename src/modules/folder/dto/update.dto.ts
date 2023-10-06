import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateFolderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  public name: string;
}
