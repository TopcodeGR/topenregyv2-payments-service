import { Body, Controller, Headers, Param, Post, RawBodyRequest, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires

@Controller('/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) { }

  @Post('/:userId/createCheckoutSession')
  async createCheckoutSession(
    @Param('userId') userId: string,
    @Body('lookup_key') lookupKey: string,
  ): Promise<string> {
    console.log('test')
    return this.stripeService.createCheckoutSession(
      userId,
      lookupKey,
    );
  }

  @Post('/webhook')
  async webhook(@Req() req: RawBodyRequest<Request>): Promise<any> {
    const signature = req.headers['stripe-signature'];
    await this.stripeService.manageWebhookTrigger(signature, req.rawBody)
  }

}
