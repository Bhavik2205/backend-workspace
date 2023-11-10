import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateTeamDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public name: string;
}
