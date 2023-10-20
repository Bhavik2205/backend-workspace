import { IsInt, IsOptional, IsString } from "class-validator";
import { EWorkflowStatus } from "@types";

export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  public status?: EWorkflowStatus;

  @IsOptional()
  @IsInt()
  public allocate?: number;
}
