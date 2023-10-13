import { IsNotEmpty, IsOptional, IsString, MaxLength, IsInt, IsBoolean } from "class-validator";

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public topic: string;

  @IsNotEmpty()
  @IsInt()
  public to: number;

  @IsNotEmpty()
  @IsInt()
  public from: number;

  @IsNotEmpty()
  @IsString()
  public question: string;

  @IsOptional()
  @IsInt()
  public documentId: number;

  @IsOptional()
  @IsBoolean()
  public sendForApproval: boolean;

  @IsOptional()
  @IsBoolean()
  public isHighPriority: boolean;

  @IsOptional()
  @IsBoolean()
  public isClosed: boolean;
}
