import { TRequest, TResponse } from "@types";
import { Constants } from "../../../configs/constants";

export class FilesizeValidator {
  public static validate(req: TRequest, res: TResponse, next: () => void) {
    if (req.files) {
      const { file } = req.files;
      if (file.truncated) {
        return res.status(413).json({ error: `File size limit has been reached, Max allowed size is ${Constants.MAX_FILE_SIZE / 1024 / 1024}MB` });
      }
    }
    return next();
  }
}
