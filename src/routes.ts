import { Router } from "express";
import * as l10n from "jm-ez-l10n";
import { CategoryRouter } from "@modules/category";
import { FolderRouter } from "@modules/folder";
import { WorkspaceRouter } from "@modules/workspace";
import { MiscRouter } from "@modules/misc";
import { AuthRouter } from "@modules/auth";
import { QuestionRouter } from "@modules/question";
import { TeamRouter } from "@modules/team";
import { DocumentRouter } from "@modules/document";
import { ProfileRouter } from "@modules/profile";
import { WorkflowRouter } from "@modules/workflow";
import { LogRouter } from "@modules/log";
import { UserSubscriptionRouter } from "@modules/user-subscription";
import { SettingRouter } from "@modules/setting";
import { SubscriptionWebhookRouter } from "@modules/subscription-webhook";
import { SuperAdminAuthRouter } from "@modules/superadmin/auth";
import { DataRouter } from "@modules/superadmin/data";

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
    router.use("/documents", new DocumentRouter().router);
    router.use("/profile", new ProfileRouter().router);
    router.use("/workflows", new WorkflowRouter().router);
    router.use("/logs", new LogRouter().router);
    router.use("/subscriptions", new UserSubscriptionRouter().router);
    router.use("/settings", new SettingRouter().router);
    router.use("/webhook", new SubscriptionWebhookRouter().router);
    router.use('/admin', new SuperAdminAuthRouter().router);
    router.use('/data', new DataRouter().router);
    router.all("/*", (req, res) =>
      res.status(404).json({
        error: l10n.t("ERR_URL_NOT_FOUND"),
      }),
    );
    return router;
  }
}
