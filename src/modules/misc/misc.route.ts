import { RouterDelegates } from "@types";
import { InjectCls, SFRouter } from "@helpers";
import { MiscController } from "./misc.controller";

export class MiscRouter extends SFRouter implements RouterDelegates {
  @InjectCls(MiscController)
  private miscController: MiscController;

  initRoutes() {
    this.router.get("/enums", this.miscController.getEnums);
  }
}
