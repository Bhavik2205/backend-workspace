import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";
import { Constants } from "@configs";
import { EUserType } from "@types";

export class InviteSignupDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(Constants.FIRST_NAME_MAX_LENGTH)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(Constants.LAST_NAME_MAX_LENGTH)
    lastName: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(Constants.EMAIL_MAX_LENGTH)
    @IsOptional()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    })
    @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
    password: string;

    @IsEnum(EUserType, {message: "Invalid User Role"})
    @IsOptional()
    role: string;
    
    @IsString()
    @IsOptional()
    ip: string;
}