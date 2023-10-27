import { RouterDelegates } from "@types";
import { InjectCls, SFRouter } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { SettingController } from "./setting.controller";

export class SettingRouter extends SFRouter implements RouterDelegates {
  @InjectCls(SettingController)
  private settingController: SettingController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/notification", this.authMiddleware.auth, this.settingController.updateQANotification);
    this.router.post("/teamQA", this.authMiddleware.auth, this.settingController.isTeamSpecificQA);
  }
}
