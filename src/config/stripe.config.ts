import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  apiKey: process.env.STRIPE_API_KEY,
  apiVersion: process.env.STRIPE_API_VERSION,
  subscriptionPaymentSusccessUrl:
    process.env['STRIPE_SUBSCRIPTION_PAYMENT_SUCCESS_URL'],
  subsriptionPaymentCancelUrl:
    process.env['STRIPE_SUBSCRIPTION_PAYMENT_CANCEL_URL'],
  webhookSecret: process.env["STRIPE_WEBHOOK_SECRET"]
}));
