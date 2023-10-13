import { Router } from "express";
import * as l10n from "jm-ez-l10n";
import { CategoryRouter } from "@modules/category";
import { FolderRouter } from "@modules/folder";
import { WorkspaceRouter } from "@modules/workspace";
import { MiscRouter } from "@modules/misc";
import { AuthRouter } from "@modules/auth";
import { QuestionRouter } from "@modules/question";
import { TeamRouter } from "@modules/team";

export default class Routes {
  public configure() {
    const router = Router();
    router.use("/categories", new CategoryRouter().router);
    router.use("/folders", new FolderRouter().router);
    router.use("/misc", new MiscRouter().router);
    router.use("/workspaces", new WorkspaceRouter().router);
    router.use("/auth", new AuthRouter().router);
    router.use("/questions", new QuestionRouter().router);
    router.use("/teams", new TeamRouter().router);
    router.all("/*", (req, res) =>
      res.status(404).json({
        error: l10n.t("ERR_URL_NOT_FOUND"),
      }),
    );
    return router;
  }
}
