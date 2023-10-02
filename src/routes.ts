import { Router } from "express";
import * as l10n from "jm-ez-l10n";
import { LeadRouter } from "@modules/lead";

export default class Routes {
  public configure() {
    const router = Router();
    router.use("/leads", new LeadRouter().router);
    router.all("/*", (req, res) =>
      res.status(404).json({
        error: l10n.t("ERR_URL_NOT_FOUND"),
      }),
    );
    return router;
  }
}
