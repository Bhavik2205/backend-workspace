import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateDescriptionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(512)
  public description: string;
}
