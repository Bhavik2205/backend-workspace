import { TransactionEntity, UserSubscriptionEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";

export class SubscriptionWebhookController {
  @InitRepository(TransactionEntity)
  transactionRepository: Repository<TransactionEntity>;

  @InitRepository(UserSubscriptionEntity)
  userSubscriptionRepository: Repository<TransactionEntity>;

  constructor() {
    InjectRepositories(this);
  }

  private async transactionDetails(data: any) {
    const transactionData = await this.transactionRepository.create({
      metaData: data,
      customerId: data.customer,
      status: data.status,
    });
    await this.transactionRepository.save(transactionData);
  }

  public webhook = async (req: TRequest, res: TResponse) => {
    const { data } = req.body;
    const eventType = req.body.type;

    switch (eventType) {
    case "payment_intent.amount_capturable_updated": {
      const paymentIntent = data.object;
      await this.transactionDetails(paymentIntent);
      break;
    }
    case "payment_intent.canceled": {
      const paymentIntent = data.object;
      await this.transactionDetails(paymentIntent);
      break;
    }
    case "payment_intent.created": {
      const paymentIntent = data.object;
      await this.transactionDetails(paymentIntent);
      break;
    }
    case "payment_intent.partially_funded": {
      const paymentIntent = data.object;
      await this.transactionDetails(paymentIntent);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = data.object;
      await this.transactionDetails(paymentIntent);
      break;
    }
    case "payment_intent.processing": {
      const paymentIntent = data.object;
      await this.transactionDetails(paymentIntent);
      break;
    }
    case "payment_intent.requires_action": {
      const paymentIntent = data.object;
      await this.transactionDetails(paymentIntent);
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = data.object;
      await this.transactionDetails(paymentIntent);
      break;
    }
    case "subscription_schedule.aborted": {
      const subscriptionSchedule = data.object;
      await this.transactionDetails(subscriptionSchedule);
      break;
    }
    case "subscription_schedule.canceled": {
      const subscriptionSchedule = data.object;
      await this.transactionDetails(subscriptionSchedule);
      break;
    }
    case "subscription_schedule.completed": {
      const subscriptionSchedule = data.object;
      await this.transactionDetails(subscriptionSchedule);
      break;
    }
    case "subscription_schedule.created": {
      const subscriptionSchedule = data.object;
      await this.transactionDetails(subscriptionSchedule);
      break;
    }
    case "subscription_schedule.expiring": {
      const subscriptionSchedule = data.object;
      await this.transactionDetails(subscriptionSchedule);
      break;
    }
    case "subscription_schedule.released": {
      const subscriptionSchedule = data.object;
      await this.transactionDetails(subscriptionSchedule);
      break;
    }
    case "subscription_schedule.updated": {
      const subscriptionSchedule = data.object;
      await this.transactionDetails(subscriptionSchedule);
      break;
    }
    default:
      return res.status(200).send(`Event type: ${eventType}.`);
    }

    return res.status(200).json({ message: "success" });
  };
}
