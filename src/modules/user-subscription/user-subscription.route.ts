import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { AuthMiddleware, PermissionsMiddleware } from "@middlewares";
import { UserSubscriptionController } from "./user-subscription.controller";
import { CreateSubscriptionDto } from "./dto";

export class UserSubscriptionRouter extends SFRouter implements RouterDelegates {
  @InjectCls(UserSubscriptionController)
  private userSubscriptionController: UserSubscriptionController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  @InjectCls(PermissionsMiddleware)
  permission: PermissionsMiddleware;

  initRoutes(): void {
    this.router.post("/card-token", this.authMiddleware.auth, this.userSubscriptionController.cardToken);
    this.router.post("/", this.authMiddleware.auth, Validator.validate(CreateSubscriptionDto), this.userSubscriptionController.create);
    this.router.post("/:subscriptionId", this.authMiddleware.auth, this.userSubscriptionController.delete);
    this.router.get("/", this.authMiddleware.auth, this.userSubscriptionController.read);
    this.router.get("/invoice", this.authMiddleware.auth, this.userSubscriptionController.readInvoice);
    this.router.get("/invoice/:invoiceId", this.authMiddleware.auth, this.userSubscriptionController.readOneInvoice);
    this.router.get("/plans", this.authMiddleware.auth, this.userSubscriptionController.readSubscriptionPlans);
  }
}
