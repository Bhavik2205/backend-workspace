import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Constants } from "../../../configs";
import { EInvitedMemberRole, EUserType } from "../../../types";

export class InviteUserDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(Constants.EMAIL_MAX_LENGTH)
    email: string;

    @IsEnum(EInvitedMemberRole, {message: "Invalid User Role"})
    @IsNotEmpty()
    role: EInvitedMemberRole;
}