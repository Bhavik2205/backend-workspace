import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Constants } from "@configs";

export class UpdateCompanyDto {
  @IsString()
  @IsNotEmpty()
  presentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.COMPANY_NAME_MAX_LENGTH)
  companyName: string;
}
