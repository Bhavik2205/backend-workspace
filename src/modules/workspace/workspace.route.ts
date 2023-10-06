import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { WorkspaceController } from "./workspace.controller";
import { CreateWorkspaceDto } from "./dto";

export class WorkspaceRouter extends SFRouter implements RouterDelegates {
  @InjectCls(WorkspaceController)
  private workspaceController: WorkspaceController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/", Validator.validate(CreateWorkspaceDto), this.authMiddleware.auth, this.workspaceController.create);
    this.router.get("/", this.authMiddleware.auth, this.workspaceController.read);
    this.router.get("/:workspaceId", this.authMiddleware.auth, this.workspaceController.readOne);
    this.router.delete("/:workspaceId", this.authMiddleware.auth, this.workspaceController.delete);
  }
}
