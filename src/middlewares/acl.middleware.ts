import * as l10n from "jm-ez-l10n";
import { TResponse, TRequest } from "@types";
import { JwtHelper } from "@helpers";

export function acl(permission: string) {
  return async (req: TRequest, res: TResponse, next: () => void) => {
    const user = JwtHelper.decode<any>(req.headers.authorization.replace("Bearer ", ""));

    if (!user) {
      return { code: 401, reason: l10n.t("ERR_USER_NOT_EXIST") };
    }

    // Get permission from your DB
    const userPermissions = [""];
    const canAccess = userPermissions.includes(permission);

    if (!canAccess) {
      return { code: 403, reason: l10n.t("ERR_PERMISSION_DENIED", { permission }) };
    }
    req.me = user;
    return next();
  };
}
