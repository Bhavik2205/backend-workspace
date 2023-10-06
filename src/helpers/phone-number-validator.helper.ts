import PhoneNumber from "libphonenumber-js";
import { Log } from "./logger.helper";

export class PhoneNumberValidator {
  public static logger = Log.getLogger();

  public static validate(phoneNumber: string): boolean {
    const parsedNumber = PhoneNumber(phoneNumber);

    if (parsedNumber && parsedNumber.country) {
      return true;
    }
    return false;
  }
}
