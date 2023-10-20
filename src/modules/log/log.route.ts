import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { LogController } from "./log.controller";
import { DownloadDto } from "./dto";

export class LogRouter extends SFRouter implements RouterDelegates {
  @InjectCls(LogController)
  private logController: LogController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.get("/download", Validator.validate(DownloadDto), this.authMiddleware.auth, this.logController.download);
  }
}
