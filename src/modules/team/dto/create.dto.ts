import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateTeamDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public name: string;
}
