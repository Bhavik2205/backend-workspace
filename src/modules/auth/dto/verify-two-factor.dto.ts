import { IsInt, IsNotEmpty } from "class-validator";

export class VerifyTwoFactorDto {
  @IsNotEmpty()
  @IsInt()
  code: number;
}
