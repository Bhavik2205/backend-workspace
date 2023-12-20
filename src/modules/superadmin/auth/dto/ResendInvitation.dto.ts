import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Constants } from "../../../configs";

export class ResendInviteDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(Constants.EMAIL_MAX_LENGTH)
    email: string;
}