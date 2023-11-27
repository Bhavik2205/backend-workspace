import { validate } from "class-validator";
import { TRequest, TResponse } from "@types";
import { Constants } from "../configs/constants";

export class Validator {
  public static validate<T>(objType: new () => T) {
    // @ts-ignore
    return (req, res, next) => {
      const obj = this.createInstanceFromJson(objType, {
        ...req.body,
        ...req.params,
        _me: req.me,
      }) as any;
      // eslint-disable-next-line consistent-return
      validate(obj).then(err => {
        if (err.length) {
          // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
          const _error = err[0].constraints;
          const [first] = Object.keys(_error);
          const error = _error[first];
          return res.status(400).json({ error });
        }
        req.dto = obj;
        next();
      });
    };
  }

  private static createInstanceFromJson<T>(objType: new () => T, json: any) {
    // eslint-disable-next-line new-cap
    const newObj = new objType();
    // eslint-disable-next-line no-restricted-syntax
    for (const prop in json) {
      if ({}.propertyIsEnumerable.call(json, prop)) {
        // @ts-ignore
        newObj[prop] = json[prop];
      }
    }
    return newObj;
  }

  public static fileMimeValidate(req: TRequest, res: TResponse, next: () => void) {
    if (req.files) {
      const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
      const validMimes = Constants.VALID_MIMETYPES;
      const isValid = files.every((file: any) => validMimes.includes(file.mimetype));

      if (!isValid) {
        return res.status(400).json({ error: `Invalid file, allowed file types are [${Constants.VALID_MIMETYPES.join(", ")}]` });
      }
    }
    return next();
  }

  public static fileMimeValidateImage(req: TRequest, res: TResponse, next: () => void) {
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
