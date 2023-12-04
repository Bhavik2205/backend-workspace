import { RouterDelegates } from "@types";
import { InjectCls, SFRouter } from "@helpers";
import { AuthMiddleware, PermissionsMiddleware, isWorkspaceExist } from "@middlewares";
import { Permissions } from "@acl";
import { LogController } from "./log.controller";

export class LogRouter extends SFRouter implements RouterDelegates {
  @InjectCls(LogController)
  private logController: LogController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  initRoutes(): void {
    this.router.get("/download", this.authMiddleware.auth, this.permission.acl(Permissions.DownloadLog), isWorkspaceExist(), this.logController.download);
  }
}
