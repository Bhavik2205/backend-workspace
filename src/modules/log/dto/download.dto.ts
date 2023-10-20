import { IsEnum, IsNotEmpty } from "class-validator";
import { ELogsActivity } from "@types";

export class DownloadDto {
  @IsNotEmpty()
  @IsEnum(ELogsActivity, { each: true })
  public activity: ELogsActivity[];
}
