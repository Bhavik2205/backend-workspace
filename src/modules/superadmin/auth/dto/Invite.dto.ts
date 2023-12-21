import { Constants } from "@configs";
import { EInvitedMemberRole } from "@types";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";

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