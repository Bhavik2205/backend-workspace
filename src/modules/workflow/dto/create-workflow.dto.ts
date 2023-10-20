import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateWorkflowDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public name: string;
}
