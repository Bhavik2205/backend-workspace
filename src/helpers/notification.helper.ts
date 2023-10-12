import axios from "axios";
import twilio from "twilio";
import { Constants, env } from "@configs";
import { Log } from "./logger.helper";

type TReceiverEmail = {
  name: string;
  email: string;
};

type TInviteEmail = {
  email: string;
};

export class Notification {
  public static async email(subject: string, to: TReceiverEmail[], dynamicData: { url: string }) {
    const data = {
      sender: {
        name: "Workspace",
        email: Constants.FROM_EMAIL,
      },
      to,
      subject,
      htmlContent: `<!DOCTYPE html><html><head><title>Reset Password Email</title></head><body><p>Hello,</p><p>If you've forgotten your password, please click the following link to reset it: <a href="${dynamicData.url}">Reset Password</a></p></body></html>
      `,
    };

    const headers = {
      Accept: "application/json",
      "api-key": env.brevoApiKey,
      "Content-Type": "application/json",
    };

    await axios.post(env.brevoURL, data, { headers });
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
    }
  }

  public static async inviteEmail(subject: string, to: TInviteEmail[], dynamicData: { url: string }) {
    const data = {
      sender: {
        name: "Workspace",
        email: Constants.FROM_EMAIL,
      },
      to,
      subject,
      htmlContent: `<!DOCTYPE html><html><head><title>Invitation</title></head><body><p>Hello,</p><p>Please click the following link to accept invite: <a href="${dynamicData.url}">Accept Invite</a></p></body></html>
      `,
    };

    const headers = {
      Accept: "application/json",
      "api-key": env.brevoApiKey,
      "Content-Type": "application/json",
    };

    axios.post(env.brevoURL, data, { headers });
  }
}
