import {
  Body,
  Controller,
  Get,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require('stripe')(
  'sk_test_51I0sskESuGEYFRwyaw7pD7OueQsD9UCEbHPKWoLwOidbale9AeEngIFngd0vThvvMQf2t29hlH1ochhgUQDgL3Jc00v4MKKPpr',
);

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/create-checkout-session')
  async createCheckoutSesstion(
    @Body('lookup_key') lookupKey: string,
  ): Promise<any> {
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
    });

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      phone_number_collection: {
        enabled: true,
      },
      customer_update: {
        name: 'auto',
      },
      line_items: [
        {
          price: prices.data[0].id,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: 'cus_NAvomcsWYQZCYU',
      success_url: `http://localhost:3000/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000?canceled=true`,
    });
    console.log(session);
    return { session: session.url };
  }

  @Post('/create-portal-session')
  async createPortalSession(
    @Body('session_id') sessionId: string,
  ): Promise<any> {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const returnUrl = 'http://localhost:3000';
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });

    return { portalSession: portalSession.url };
  }

  //whsec_e1596236346bd61710a49a6f2eee25f493c4df003f4db335edf75527a4ab87ce
  @Post('/webhook')
  async webhook(@Req() req: RawBodyRequest<Request>): Promise<any> {
    const secret =
      'whsec_e1596236346bd61710a49a6f2eee25f493c4df003f4db335edf75527a4ab87ce';
    const signature = req.headers['stripe-signature'];
    console.log(signature);
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      secret,
    );

    let subscription;
    let status;
    switch (event.type) {
      case 'invoice.created':
        const invoice = event.data.object;
        console.log(invoice);
        const updateInvoice = await stripe.invoices.update(invoice.id, {
          number: '114',
        });
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case 'customer.subscription.deleted':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription deleted.
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case 'customer.subscription.created':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription created.
        // handleSubscriptionCreated(subscription);
        break;
      case 'customer.subscription.updated':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription update.
        // handleSubscriptionUpdated(subscription);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
  }
}
