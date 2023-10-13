import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateParticipateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public email: string;

  @IsOptional()
  @IsInt()
  public roleId: number;
}
