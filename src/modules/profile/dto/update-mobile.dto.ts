import { IsNotEmpty, IsString } from "class-validator";

export class UpdateMobileDto {
  @IsString()
  @IsNotEmpty()
  presentPassword: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;
}
