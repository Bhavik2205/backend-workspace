import { env } from "@configs";
import { SubscriptionPlanEntity, UserEntity, UserSubscriptionEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
import axios from "axios";
import { CreateSubscriptionDto } from "./dto";

const stripe = require("stripe")(env.stripeSecret);
const stripeCardToken = require("stripe")(env.stripePublic);

export class UserSubscriptionController {
  @InitRepository(UserSubscriptionEntity)
  userSubscriptionRepository: Repository<UserSubscriptionEntity>;

  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  @InitRepository(SubscriptionPlanEntity)
  subscriptionPlanRepository: Repository<SubscriptionPlanEntity>;

  constructor() {
    InjectRepositories(this);
  }

  public cardToken = async (req: TRequest, res: TResponse) => {
    try {
      const token = await stripeCardToken.tokens.create({
        card: {
          number: "4242424242424242",
          exp_month: 10,
          exp_year: 2024,
          cvc: "123",
        },
      });

      res.status(200).json({
        token,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  private async createSubscription(customerId: string, priceId: string) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
    });
    return subscription;
  }

  private async updateSubscriptionDetails(customerId: string, planId: number, subscriptionId: string, productId: string) {
    const mostRecentSubscription = await this.userSubscriptionRepository.findOne({
      where: { customerId },
      order: { createdAt: "DESC" },
    });

    if (mostRecentSubscription) {
      await this.userSubscriptionRepository.update(mostRecentSubscription.id, {
        planId,
        subscriptionId,
        productId,
      });
    }
  }

  private async customerDetails(customerId: string, userId: number) {
    const customerDetail = await this.userSubscriptionRepository.create({
      customerId,
      userId,
    });
    await this.userSubscriptionRepository.save(customerDetail);
  }

  private async userPlan(planId: number, userId: number) {
    await this.userRepository.update(userId, {
      planId,
    });
  }

  public create = async (req: TRequest<CreateSubscriptionDto>, res: TResponse) => {
    try {
      const { me } = req;
      const { planId, token } = req.dto;

      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const plan = await this.subscriptionPlanRepository.findOne({
        where: {
          id: +planId,
        },
      });

      const existingCustomer = await stripe.customers.list({ email: user.email, limit: 1 });

      if (existingCustomer.data.length > 0) {
        await this.customerDetails(existingCustomer.data[0].id, me.id);

        const subscription = await this.createSubscription(existingCustomer.data[0].id, plan.priceId);

        await this.updateSubscriptionDetails(existingCustomer.data[0].id, plan.id, subscription.id, subscription.items.data[0].plan.product);

        const planDetail = await this.subscriptionPlanRepository.findOne({
          where: {
            id: planId,
          },
        });

        if (planDetail.slug !== "additional-storage-space") {
          await this.userPlan(planId, user.id);
        }

        res.status(200).json({ data: subscription.id });
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          source: token,
        });

        await this.customerDetails(customer.id, me.id);

        const subscription = await this.createSubscription(customer.id, plan.priceId);

        await this.updateSubscriptionDetails(customer.id, plan.id, subscription.id, subscription.items.data[0].plan.product);

        const planDetail = await this.subscriptionPlanRepository.findOne({
          where: {
            id: planId,
          },
        });

        if (planDetail.slug !== "additional-storage-space") {
          await this.userPlan(planId, user.id);
        }

        res.status(200).json({ data: subscription.id });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public delete = async (req: TRequest, res: TResponse) => {
    try {
      const { subscriptionId } = req.params;
      const { me } = req;

      const user = await this.userRepository.findOne({
        where: {
          id: me.id,
        },
      });

      const deleted = await stripe.subscriptions.cancel(subscriptionId);

      const subscription = await axios.get("https://api.dev.workspace.tesseractsquare.com/subscriptions", {
        headers: {
          Authorization: req.headers.authorization,
        },
      });
      console.log(subscription);

      if (subscription?.data?.data?.planId) {
        user.planId = subscription.data.data.planId;
      } else {
        user.planId = null;
      }

      await this.userRepository.save(user);
      res.status(200).json({ data: deleted.id });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public read = async (req: TRequest, res: TResponse) => {
    try {
      const { me } = req;
      const userData = await this.userSubscriptionRepository.findOne({
        where: {
          userId: me.id,
        },
      });

      if (!userData) {
        return res.status(200).json({ data: {} });
      }

      const stripeSubscription = await stripe.subscriptions.list({
        customer: userData.customerId,
      });

      if (stripeSubscription.data.length === 0) {
        return res.status(200).json({ data: {} });
      }

      const subscriptions = await this.userSubscriptionRepository.findOne({
        where: {
          subscriptionId: stripeSubscription.data[0].id,
        },
        relations: ["plan"],
      });
      return res.status(200).json({ data: subscriptions });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  public readInvoice = async (req: TRequest, res: TResponse) => {
    try {
      const { me } = req;

      const subscribedData = await this.userSubscriptionRepository.findOne({
        where: {
          userId: me.id,
        },
      });

      if (!subscribedData) {
        return res.status(200).json({ data: [] });
      }

      const invoiceData = await stripe.invoices.list({
        customer: subscribedData.customerId,
      });

      const invoices = invoiceData.data.map((invoice: any) => ({
        id: invoice.id,
        amount: invoice.lines.data[0].amount,
        description: invoice.lines.data[0].description,
        interval: invoice.lines.data[0].plan.interval,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        created: invoice.created,
      }));

      return res.status(200).json({ data: invoices });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  public readOneInvoice = async (req: TRequest, res: TResponse) => {
    try {
      const { invoiceId } = req.params;

      const invoiceData = await stripe.invoices.retrieve(invoiceId);

      const subscriptions = await this.userSubscriptionRepository.findOne({
        where: {
          subscriptionId: invoiceData.subscription,
        },
        relations: ["plan"],
      });

      const invoice = {
        id: invoiceData.id,
        email: invoiceData.customer_email,
        billing_reason: invoiceData.billing_reason,
        amount: invoiceData.lines.data[0].amount,
        currency: invoiceData.currency,
        status: invoiceData.status,
        description: invoiceData.lines.data[0].description,
        interval: invoiceData.lines.data[0].plan.interval,
        invoice_pdf: invoiceData.invoice_pdf,
        hosted_invoice_url: invoiceData.hosted_invoice_url,
        created: invoiceData.created,
        planDetail: subscriptions.plan,
      };

      res.status(200).json({ data: invoice });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public readSubscriptionPlans = async (req: TRequest, res: TResponse) => {
    try {
      const { page, limit } = req.pager;
      const [data, count] = await this.subscriptionPlanRepository.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
      });

      res.status(200).json({
        data,
        count,
        limit,
      });
    } catch (error) {
      res.status(200).json({ error: error.message });
    }
  };
}
