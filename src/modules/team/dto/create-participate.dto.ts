import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";

export class CreateParticipateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public email: string;

  @IsOptional()
  @IsInt()
  public roleId: number;
}

export class CreateMultipleParticipateDto {
  @IsArray()
  @ValidateNested({ each: true })
  public participatesData: CreateParticipateDto[];
}
