import { IsArray, ValidateNested } from "class-validator";
import { CreateParticipateDto } from "./create-participate.dto";

export class CreateMultipleParticipateDto {
  @IsArray()
  @ValidateNested({ each: true })
  public participatesData: CreateParticipateDto[];
}
