import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Constants } from "@configs";

export class UpdateNameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.FIRST_NAME_MAX_LENGTH)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.LAST_NAME_MAX_LENGTH)
  lastName: string;
}
