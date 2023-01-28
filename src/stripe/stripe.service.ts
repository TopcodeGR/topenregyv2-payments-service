import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InvoicingService } from 'src/invoicing/invoicing.service';
import { ClientProxy } from '@nestjs/microservices';
import * as moment from 'moment';

@Injectable()
export class StripeService {
  readonly stripe: Stripe;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly invoicingService: InvoicingService,
    @Inject("PAYMENTS_SERVICE") private client: ClientProxy
  ) {
    this.stripe = new Stripe(configService.get('stripe.apiKey'), {
      apiVersion: configService.get('stripe.apiVersion'),
    });
  }

  async createCheckoutSession(
    userId: string,
    lookupKey: string,
  ): Promise<string> {

    let clientid = this.configService.get("app.clientId")
    let clientsecret = this.configService.get("app.clientSecret")

    // eslint-disable-next-line prefer-const
    let user = await firstValueFrom(
      this.httpService
        .get(`http://auth-service/users/${userId}`, {
          headers: {
            clientid,
            clientsecret,
          },
        })
        .pipe(map((value) => value.data.data)),
    );
    const price = await this.getPrice(lookupKey);
    if (!user.stripeCustomerId || user.stripeCustomerId == '') {
      const stripeCustomer = await this.createCustomer(user);

      user = await firstValueFrom(
        this.httpService
          .put(
            `http://auth-service/users/${userId}`,
            { ...user, stripeCustomerId: stripeCustomer.id },
            {
              headers: {
                clientid,
                clientsecret,
              },
            },
          )
          .pipe(map((value) => value.data)),
      );
    }
    const session = await this.stripe.checkout.sessions.create({
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      phone_number_collection: {
        enabled: true,
      },
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      line_items: [
        {
          price: price.id,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: user.stripeCustomerId,
      success_url: `${this.configService.get(
        'stripe.subscriptionPaymentSusccessUrl',
      )}{CHECKOUT_SESSION_ID}`,
      cancel_url: this.configService.get('stripe.subsriptionPaymentCancelUrl'),
    });
    return session.url;
  }

  /*async createPortalSession(sessionId: string): Promise<string> {
    const checkoutSession: Stripe.Checkout.Session = await this.stripe.checkout.sessions.retrieve(sessionId);
    const returnUrl = 'http://localhost:3000';
    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });

    return portalSession.url
  }*/

  async createCustomer(user: any): Promise<Stripe.Customer> {
    const existingCustomer = await this.stripe.customers.search({
      query: `name:\'${user.name}\'`,
    });

    if (existingCustomer.data.length > 0) {
      return existingCustomer.data[0];
    }
    const newCustomer = await this.stripe.customers.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      tax_id_data: [
        {
          type: 'eu_vat',
          value: user.vat,
        },
      ],
    });
    return newCustomer;
  }

  async getPrice(lookupKey: string): Promise<Stripe.Price> {
    const price = await this.stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
    });

    return price.data.length > 0 ? price.data[0] : null;
  }

  async manageSubscriptionUpdated(e: any) {
    let subscriptionCanceled = e.data.object.canceled_at && !e.data.previous_attributes.canceled_at
    let subscriptionReactivated = !e.data.object.canceled_at && e.data.previous_attributes.canceled_at

    if (subscriptionCanceled) {

      this.client.emit("subscription-canceled", { stripeCustomerId: e.data.object.customer })
    }

    if (subscriptionReactivated) {

      this.client.emit("subscription-reactivated", { stripeCustomerId: e.data.object.customer })
    }

  }

  async manageInvoicePaid(e: any) {
    this.client.emit("subscription-paid", { stripeCustomerId: e.data.object.customer })
  }

  async manageInvoiceUpcoming(e: Stripe.Event) {
    console.log("Invoice upcoming")
    console.log(e.data.object)
  }

  async manageInvoicePaymentFailed(e: any) {
    console.log(e.data.object)
    this.client.emit("payment-failed", { stripeCustomerId: e.data.object.customer, date: moment(Date.now()).format("DD-MM-YYYY"), attempsCount: e.data.object.attempt_count })
  }


  async manageWebhookTrigger(signature: string, rawBody: Buffer) {
    console.log("EVENT")
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.configService.get("stripe.webhookSecret"),
    );

    let subscription;
    let status;
    switch (event.type) {
      case 'invoice.upcoming':
        //await this.manageInvoiceUpcoming(event)
        break;
      case 'invoice.paid':
        await this.manageInvoicePaid(event)
        break;
      case 'customer.subscription.updated':
        await this.manageSubscriptionUpdated(event)
        break;
      case 'invoice.payment_failed':
        await this.manageInvoicePaymentFailed(event)
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }
  }
}
