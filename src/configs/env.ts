import { IsIn, IsInt, IsNotEmpty, Max, Min } from "class-validator";
import dotenv from "dotenv";
import { Constants } from "./constants";

dotenv.config();

class Env {
  @IsInt()
  @Min(2000)
  @Max(9999)
  public port: number;

  @IsNotEmpty()
  public dbName: string;

  @IsNotEmpty()
  public dbHost: string;

  @IsNotEmpty()
  public dbUser: string;

  @IsInt()
  @Min(2000)
  @Max(9999)
  public dbPort: number;

  @IsNotEmpty()
  public dbPassword: string;

  @IsNotEmpty()
  @IsIn(Constants.ENVIRONMENTS)
  public nodeEnv: string;
}

export const env = new Env();

env.dbName = process.env.DB_NAME;
env.dbHost = process.env.DB_HOST;
env.dbUser = process.env.DB_USER;
env.dbPort = +(process.env.DB_PORT || 3306);
env.dbPassword = process.env.DB_PASSWORD;
env.port = +process.env.PORT;
env.nodeEnv = process.env.NODE_ENV;
