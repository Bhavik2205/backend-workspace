import { TRequest, TResponse } from "@types";
import { Constants } from "../../../configs/constants";

export class FilemimeValidator {
  public static validate(req: TRequest, res: TResponse, next: () => void) {
    if (req.files) {
      const { file } = req.files;
      const validMimes = Constants.VALID_MIMETYPES;
      if (!validMimes.includes(file.mimetype)) {
        return res.status(400).json({ error: `Invalid file, allowed file types are [${Constants.VALID_MIMETYPES.join(", ")}]` });
      }
    }
    return next();
  }
}
