import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { isWorkspaceExist, AuthMiddleware } from "@middlewares";
import { FolderController } from "./folder.controller";
import { CreateFolderDto, UpdateFolderDto } from "./dto";

export class FolderRouter extends SFRouter implements RouterDelegates {
  @InjectCls(FolderController)
  private folderController: FolderController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/", Validator.validate(CreateFolderDto), this.authMiddleware.auth, isWorkspaceExist(), this.folderController.create);
    this.router.get("/", this.authMiddleware.auth, isWorkspaceExist(), this.folderController.read);
    this.router.put("/:folderId", Validator.validate(UpdateFolderDto), this.authMiddleware.auth, isWorkspaceExist(), this.folderController.update);
    this.router.delete("/:folderId", this.authMiddleware.auth, this.folderController.delete);
  }
}
