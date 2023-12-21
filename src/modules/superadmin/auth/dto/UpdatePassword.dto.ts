import { Constants } from "@configs";
import { IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  oldpassword: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  newpassword: string;
}
