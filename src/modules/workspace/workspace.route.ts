import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import fileUpload from "express-fileupload";
import { AuthMiddleware, PermissionsMiddleware } from "@middlewares";
import { Constants } from "@configs";
import { Permissions } from "@acl";
import { WorkspaceController } from "./workspace.controller";
import { CreateWorkspaceDto, UpdateDescriptionDto, UpdateWorkspaceDto } from "./dto";

export class WorkspaceRouter extends SFRouter implements RouterDelegates {
  @InjectCls(WorkspaceController)
  private workspaceController: WorkspaceController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  initRoutes(): void {
    this.router.post("/", Validator.validate(CreateWorkspaceDto), this.authMiddleware.auth, this.workspaceController.create);
    this.router.get("/", this.authMiddleware.auth, this.workspaceController.read);
    this.router.get("/:workspaceId", this.authMiddleware.auth, this.workspaceController.readOne);
    this.router.put("/update-name", Validator.validate(UpdateWorkspaceDto), this.authMiddleware.auth, this.workspaceController.update);
    this.router.delete("/:workspaceId", this.authMiddleware.auth, this.workspaceController.delete);
    this.router.put("/update-description", Validator.validate(UpdateDescriptionDto), this.authMiddleware.auth, this.workspaceController.updateDescriptoin);
    this.router.post(
      "/image",
      fileUpload({
        limits: { fileSize: Constants.MAX_FILE_SIZE },
      }),
      Validator.fileMimeValidate,
      Validator.fileSizeValidate,
      this.authMiddleware.auth,
      this.workspaceController.updateImage,
    );
    this.router.get("/:workspaceId/workspace-profile", this.authMiddleware.auth, this.permission.acl(Permissions.EditSettings), this.workspaceController.workspaceSetting);
  }
}
