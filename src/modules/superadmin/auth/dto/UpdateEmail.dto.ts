import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { Constants } from "../../../configs";

export class UpdateEmailDto {
  @IsNotEmpty()
  @IsString()
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  newemail: string;
}
