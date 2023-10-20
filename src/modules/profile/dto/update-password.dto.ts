import { IsNotEmpty, IsString, Matches, Length } from "class-validator";
import { Constants } from "@configs";

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  presentPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  newPassword: string;
}
