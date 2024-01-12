import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, PermissionsMiddleware, isWorkspaceExist } from "@middlewares";
import { Permissions } from "@acl";
import { SettingController } from "./setting.controller";
import { UpdateFeedbackDto } from "./dto/update-feedback.dto";

export class SettingRouter extends SFRouter implements RouterDelegates {
  @InjectCls(SettingController)
  private settingController: SettingController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  initRoutes(): void {
    this.router.post("/notification", this.authMiddleware.auth, this.permission.acl(Permissions.EditSettings), isWorkspaceExist(), this.settingController.updateQANotification);
    this.router.post("/teamQA", this.authMiddleware.auth, this.permission.acl(Permissions.EditSettings), isWorkspaceExist(), this.settingController.isTeamSpecificQA);
    this.router.post("/feedback", this.authMiddleware.auth, this.permission.acl(Permissions.EditSettings), isWorkspaceExist(), Validator.validate(UpdateFeedbackDto), this.settingController.isFeedbackActive);
  }
}
