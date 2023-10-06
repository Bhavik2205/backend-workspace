import { TRequest, TResponse } from "@types";
import * as l10n from "jm-ez-l10n";

export function isWorkspaceExist() {
  return async (req: TRequest, res: TResponse, next: () => void) => {
    const { workspaceid } = req.headers;

    if (!workspaceid) {
      return res.status(400).send({ error: l10n.t("WORKSPACE_NOT_EXIST") });
    }

    return next();
  };
}
