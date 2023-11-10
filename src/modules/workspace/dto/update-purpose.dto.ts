import { EWorkspacePurpose } from "@types";
import { IsEnum, IsNotEmpty } from "class-validator";

export class UpdatePurposeDto {
@IsNotEmpty()
@IsEnum(EWorkspacePurpose)
public purpose: EWorkspacePurpose;
}
