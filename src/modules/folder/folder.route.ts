import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { isWorkspaceExist, AuthMiddleware, PermissionsMiddleware, Subscription } from "@middlewares";
import { Permissions } from "@acl";
import { FolderController } from "./folder.controller";
import { CreateFolderDto, UpdateFolderDto } from "./dto";

export class FolderRouter extends SFRouter implements RouterDelegates {
  @InjectCls(FolderController)
  private folderController: FolderController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  @InjectCls(Subscription)
  subscription: Subscription;

  initRoutes(): void {
    this.router.post(
      "/",
      this.authMiddleware.auth,
      this.subscription.isSubscribed,
      this.permission.acl(Permissions.CreateNewFolder),
      Validator.validate(CreateFolderDto),
      isWorkspaceExist(),
      this.folderController.create,
    );
    this.router.get("/", this.authMiddleware.auth, this.subscription.isSubscribed, isWorkspaceExist(), this.folderController.read);
    this.router.put("/:folderId", this.authMiddleware.auth, this.subscription.isSubscribed, Validator.validate(UpdateFolderDto), isWorkspaceExist(), this.folderController.update);
    this.router.delete("/:folderId", this.authMiddleware.auth, this.subscription.isSubscribed, this.folderController.delete);
  }
}
