import { IsNotEmpty, IsString } from "class-validator";

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  public answer: string;
}
