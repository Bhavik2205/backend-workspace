import { env } from "@configs";
import { SubscriptionPlanEntity, UserEntity, UserSubscriptionEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";
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
      order: { createdAt: 'DESC' },
    });
  
    if (mostRecentSubscription) {
      await this.userSubscriptionRepository.update(mostRecentSubscription.id, {
        planId,
        subscriptionId,
        productId
      });
    }
  }
  
  private async customerDetails(customerId: string, userId: number) {
    const customerDetail = await this.userSubscriptionRepository.create({
      customerId,
      userId
    });
    await this.userSubscriptionRepository.save(customerDetail);
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

        res.status(200).json({ data: subscription.id });
        
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          source: token,
        });
        
        await this.customerDetails(customer.id, me.id);

        const subscription = await this.createSubscription(customer.id, plan.priceId);
        
        await this.updateSubscriptionDetails(customer.id, plan.id, subscription.id, subscription.items.data[0].plan.product);
        
        res.status(200).json({ data: subscription.id });
      }

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public delete = async (req: TRequest, res: TResponse) => {
    try {
      const { planId } = req.params;
      const { me } = req;

      const subscriptionDetail = await this.userSubscriptionRepository.findOne({
        where: {
          userId: me.id,
          planId: +planId,
        }
      })

      const deleted = await stripe.subscriptions.cancel(subscriptionDetail.subscriptionId);

      await this.userSubscriptionRepository.update(subscriptionDetail.id, {
        isActive: false
      });

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
          userId: me.id
        },
      }) 
      const stripeSubscription = await stripe.subscriptions.list({
        customer: userData.customerId
      }); 
      const subscriptions = await this.userSubscriptionRepository.findOne({
        where: {
          subscriptionId: stripeSubscription.data[0].id
        },
        relations: ['plan']
      }) 
      res.status(200).json({ data: subscriptions });
    } catch (error) {
      res.status(200).json({ error: error.msg });
    }   
  }
  
  public readInvoice = async (req: TRequest, res: TResponse) => {
    try {
      const { me } = req;

      const subscribedData = await this.userSubscriptionRepository.findOne({
        where: {
          userId: me.id
        }
      })

      const invoiceData = await stripe.invoices.list({
        customer: subscribedData.customerId
      })

      const invoices = invoiceData.data.map((invoice: any) => ({
        id: invoice.id,
        amount: invoice.lines.data[0].amount,
        description: invoice.lines.data[0].description,
        interval: invoice.lines.data[0].plan.interval,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        created: invoice.created
      }));

      res.status(200).json({ data: invoices });
    } catch (error) {
      res.status(400).json({ error: error.msg });
    }
  } 

  public readOneInvoice = async (req: TRequest, res: TResponse) => {
    try {
      const { invoiceId } = req.params;

      const invoiceData = await stripe.invoices.retrieve(
        invoiceId
      );

      const subscriptions = await this.userSubscriptionRepository.findOne({
        where: {
          subscriptionId: invoiceData.subscription
        },
        relations: ['plan']
      }) 

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
        planDetail: subscriptions.plan
      }
 
      res.status(200).json({ data: invoice });
    } catch (error) {
      res.status(400).json({ error: error.msg });
    }
  } 

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
      res.status(200).json({ error: error.msg });
    }
  }
}
