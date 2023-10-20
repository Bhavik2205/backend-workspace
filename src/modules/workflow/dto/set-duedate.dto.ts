import { IsNotEmpty, IsString } from "class-validator";

export class SetDueDateDto {
  @IsNotEmpty()
  @IsString()
  public dueDate: Date;
}
