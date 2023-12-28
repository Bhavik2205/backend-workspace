import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import fileUpload from "express-fileupload";
import { AuthMiddleware, PermissionsMiddleware, SettingMiddleware, Subscription, isWorkspaceExist } from "@middlewares";
import { Permissions } from "@acl";
import { WorkspaceController } from "./workspace.controller";
import { CreateWorkspaceDto, UpdateDescriptionDto, UpdatePurposeDto, UpdateTypeDto, UpdateWorkspaceDto } from "./dto";

export class WorkspaceRouter extends SFRouter implements RouterDelegates {
  @InjectCls(WorkspaceController)
  private workspaceController: WorkspaceController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  @InjectCls(SettingMiddleware)
  setting: SettingMiddleware;

  @InjectCls(Subscription)
  subscription: Subscription;

  initRoutes(): void {
    this.router.get("/storage", this.authMiddleware.auth, this.subscription.isSubscribed, isWorkspaceExist(), this.workspaceController.storage);
    this.router.post(
      "/",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.subscription.workspace,
      Validator.validate(CreateWorkspaceDto),
      this.workspaceController.create,
    );
    this.router.get("/", this.authMiddleware.auth, this.workspaceController.read);
    this.router.get("/:workspaceId", this.authMiddleware.auth, this.subscription.isSubscribed, this.workspaceController.readOne);
    this.router.put("/update-name", this.authMiddleware.auth, this.subscription.isSubscribed, Validator.validate(UpdateWorkspaceDto), this.workspaceController.update);
    this.router.delete(
      "/:workspaceId",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.setting.setting,
      this.permission.acl(Permissions.EditSettings),
      this.workspaceController.delete,
    );
    this.router.put(
      "/update-description",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      Validator.validate(UpdateDescriptionDto),
      this.workspaceController.updateDescriptoin,
    );
    this.router.post("/image", fileUpload(), Validator.fileMimeValidateImage, this.authMiddleware.auth, this.subscription.isSubscribed, this.workspaceController.updateImage);
    this.router.get(
      "/:workspaceId/workspace-profile",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.setting.setting,
      this.permission.acl(Permissions.EditSettings),
      this.workspaceController.workspaceSetting,
    );
    this.router.put(
      "/update-purpose",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      Validator.validate(UpdatePurposeDto),
      isWorkspaceExist(),
      this.workspaceController.updatePurpose,
    );
    this.router.put(
      "/update-type",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      isWorkspaceExist(),
      Validator.validate(UpdateTypeDto),
      this.workspaceController.updateType,
    );
  }
}
