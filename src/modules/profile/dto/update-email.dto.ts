import { IsNotEmpty, IsString, MaxLength, IsEmail } from "class-validator";
import { Constants } from "@configs";

export class UpdateEmailDto {
  @IsString()
  @IsNotEmpty()
  presentPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  email: string;
}
