import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
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

  @IsInt()
  public smtpPort: number;

  @IsString()
  public smtpHost: string;

  @IsString()
  public smtpUser: string;

  @IsString()
  public smtpPass: string;

  @IsString()
  public twilioSID: string;

  @IsString()
  public twilioToken: string;

  @IsString()
  public twilioNumber: string;

  @IsString()
  public brevoApiKey: string;

  @IsString()
  public brevoURL: string;

  @IsString()
  public domain: string;
}

export const env = new Env();

env.dbName = process.env.DB_NAME;
env.dbHost = process.env.DB_HOST;
env.dbUser = process.env.DB_USER;
env.dbPort = +(process.env.DB_PORT || 3306);
env.dbPassword = process.env.DB_PASSWORD;
env.port = +process.env.PORT;
env.nodeEnv = process.env.NODE_ENV;
env.smtpHost = process.env.SMTP_HOST;
env.smtpPort = +process.env.SMTP_PORT;
env.smtpUser = process.env.SMTP_USER;
env.smtpPass = process.env.SMTP_PASS;
env.twilioSID = process.env.TWILIO_SID;
env.twilioToken = process.env.TWILIO_TOKEN;
env.twilioNumber = process.env.TWILIO_NUMBER;
env.brevoApiKey = process.env.BREVO_API_KEY;
env.brevoURL = process.env.BREVO_URL;
env.domain = process.env.DOMAIN;
