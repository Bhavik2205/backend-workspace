import { Constants } from "@configs";
import { IsNotEmpty, IsString, IsUUID, Length, Matches } from "class-validator";

export class ResetPasswordDto {
  @IsUUID()
  @IsNotEmpty()
  public token: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  password: string;
}
