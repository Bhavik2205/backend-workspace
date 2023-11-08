import { RouterDelegates } from "@types";
import { InjectCls, SFRouter } from "@helpers";
import { SubscriptionWebhookController } from "./subscription-webhook.controller";

export class SubscriptionWebhookRouter extends SFRouter implements RouterDelegates {
  @InjectCls(SubscriptionWebhookController)
  private SubscriptionWebhookController: SubscriptionWebhookController;

  initRoutes(): void {
    this.router.post("/subscription", this.SubscriptionWebhookController.webhook);
  }
}
