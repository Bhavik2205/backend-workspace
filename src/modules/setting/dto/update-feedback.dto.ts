import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateFeedbackDto {
  @IsOptional()
  @IsString()
  public link: string;
}
