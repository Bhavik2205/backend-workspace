import Email from "email-templates";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { Constants, env } from "@configs";
import axios from "axios";
import { Log } from "./logger.helper";

export class Notification {
  public static async email(templateNum: number, to: string[], userName: string, workspace?: string, token?: string) {
    const logger = Log.getLogger();
    const emailTransport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: false,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });

    const config = {
      method: "GET",
      url: `https://api.brevo.com/v3/smtp/templates/${templateNum}`,
      headers: {
        accept: "application/json",
        "api-key": `${env.brevoApiKey}`,
      },
    };

    const response = await axios(config);

    let htmlContent = "";
    let subject = "";

    if (templateNum === 10) {
      htmlContent = response.data.htmlContent.replace(/{{\s*contact\.FIRSTNAME\s*}}/, userName).replace(/{{\s*token\s*}}/, token);

      subject = response.data.subject.replace(/{{\s*contact\.FIRSTNAME\s*\|\s*default\s*:\s*''\s*}}/, userName);
    } else if (templateNum === 11) {
      subject = response.data.subject.replace(/{{\s*contact\.WORKSPACENAME\s*\|\s*default\s*:\s*''\s*}}/, workspace);

      htmlContent = response.data.htmlContent
        .replace(/{{\s*contact\.EMAIL\s*}}/, to)
        .replace(/{{\s*contact\.WORKSPACENAME \s*}}/, workspace)
        .replace(/{{\s*contact\.FIRSTNAME\s*}}/, userName)
        .replace(/{{\s*contact\.WORKSPACENAME\s*}}/, workspace);
    }

    const email = new Email({
      message: {
        from: Constants.FROM_EMAIL,
      },
      send: true,
      transport: emailTransport,
    });

    const sentEmail = await email.send({
      template: response.data.name,
      message: {
        to,
        subject,
        html: htmlContent,
      },
    });
    logger.info("Email sent successfully", { emails: to, messageId: sentEmail.messageId });

    return sentEmail;
  }

  public static async sms(message: string, phoneNumber: string): Promise<void> {
    const logger = Log.getLogger();
    const client = twilio(env.twilioSID, env.twilioToken);
    try {
      const twilioMessage = await client.messages.create({
        body: message,
        from: env.twilioNumber,
        to: phoneNumber,
      });
      logger.info("SMS sent with SID", twilioMessage.messagingServiceSid);
    } catch (err) {
      logger.warn("Error sending SMS", err);
      throw err;
    }
  }
}
