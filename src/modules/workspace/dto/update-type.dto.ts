import { EWorkspaceType } from "@types";
import { IsEnum, IsNotEmpty } from "class-validator";

export class UpdateTypeDto {
@IsNotEmpty()
@IsEnum(EWorkspaceType)
public type: EWorkspaceType;
}
