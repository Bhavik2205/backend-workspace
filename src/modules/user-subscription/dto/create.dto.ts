import { IsInt, IsNotEmpty } from "class-validator";

export class CreateSubscriptionDto {
  @IsNotEmpty()
  public token: string;

  @IsNotEmpty()
  @IsInt()
  public planId: number;
}
