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

  @IsNotEmpty()
  @IsInt()
  public smtpPort: number;

  @IsNotEmpty()
  @IsString()
  public smtpHost: string;

  @IsNotEmpty()
  @IsString()
  public smtpUser: string;

  @IsNotEmpty()
  @IsString()
  public smtpPass: string;

  @IsNotEmpty()
  @IsString()
  public twilioSID: string;

  @IsNotEmpty()
  @IsString()
  public twilioToken: string;

  @IsNotEmpty()
  @IsString()
  public twilioNumber: string;

  @IsNotEmpty()
  @IsString()
  public domain: string;

  @IsString()
  public azureStorageAccountName: string;

  @IsString()
  public azureStorageAccountKey: string;

  @IsString()
  public containerName: string;

  @IsString()
  public connectionString: string;

  @IsString()
  public azureURL: string;

  @IsString()
  public stripeSecret: string;

  @IsString()
  public stripePublic: string;

  @IsString()
  public brevoApiKey: string;

  @IsString()
  public startup_domain: string;
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
env.domain = process.env.DOMAIN;
env.smtpHost = process.env.SMTP_HOST;
env.smtpUser = process.env.SMTP_USER;
env.smtpPass = process.env.SMTP_PASS;
env.smtpPort = +process.env.SMTP_PORT;
env.azureStorageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
env.azureStorageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
env.containerName = process.env.CONTAINER_NAME;
env.connectionString = process.env.CONNECTION_STRING;
env.azureURL = process.env.AZURE_URL;
env.stripeSecret = process.env.STRIPE_SECRET;
env.stripePublic = process.env.STRIPE_PUBLIC;
env.brevoApiKey = process.env.BREVO_API_KEY;
env.startup_domain = process.env.DOMAIN;