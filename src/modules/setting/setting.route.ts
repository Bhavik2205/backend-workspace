import { RouterDelegates } from "@types";
import { InjectCls, SFRouter } from "@helpers";
import { AuthMiddleware, PermissionsMiddleware } from "@middlewares";
import { Permissions } from "@acl";
import { SettingController } from "./setting.controller";

export class SettingRouter extends SFRouter implements RouterDelegates {
  @InjectCls(SettingController)
  private settingController: SettingController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  initRoutes(): void {
    this.router.post("/notification", this.authMiddleware.auth, this.permission.acl(Permissions.EditSettings), this.settingController.updateQANotification);
    this.router.post("/teamQA", this.authMiddleware.auth, this.permission.acl(Permissions.EditSettings), this.settingController.isTeamSpecificQA);
  }
}
