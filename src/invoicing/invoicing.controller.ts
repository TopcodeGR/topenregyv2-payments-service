import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { IElorusClientPostDTO, IPaymentFailedEventData, ISubscriptionCanceledEventData, ISubscriptionPaidEventData, ISubscriptionReactivatedEventData } from 'src/types/invoicing.types';
import { InvoicingHandlers } from './invoicing.handlers';
import { InvoicingService } from './invoicing.service';


// eslint-disable-next-line @typescript-eslint/no-var-requires

@Controller('/invoicing')
export class InvoicingController {
    constructor(private readonly invoicingService: InvoicingService, private readonly invoicingHandlers: InvoicingHandlers) { }

    @Get('/clients')
    async getContacts(@Query() query: { [key: string]: string | number }) {
        return await this.invoicingService.getClients(query);
    }
    @Post('/clients')
    async createNewClient(@Body() client: IElorusClientPostDTO) {
        return await this.invoicingService.createClient(client);
    }

    @Get('/invoices')
    async getInvoices(@Query() query: { [key: string]: string | number }) {
        return await this.invoicingService.getInvoices(query);
    }

    @Post('/invoices')
    async createInvoice(@Body("userId") userId: string, @Body("productId") productId: string) {
        return await this.invoicingService.createInvoice(userId, productId);
    }

    @Get('/products/:productId')
    async getProduct(@Param("productId") productId: string) {
        return await this.invoicingService.getProduct(productId);
    }

    @Post('/payments/')
    async createPayment(@Body("invoiceId") invoiceId: string, @Body("date") date: string, @Body("amount") amount: string, @Body("clientId") clientId: string) {
        return await this.invoicingService.createPayment(invoiceId, date, amount, clientId);
    }

    @EventPattern('subscription-paid')
    async handleSubscriptionPaidEvent(data: ISubscriptionPaidEventData) {
        await this.invoicingHandlers.issueInvoiceOnSubscriptionPaid(data)
    }

    @EventPattern('subscription-canceled')
    async handleSubscriptionCanceledEvent(data: ISubscriptionCanceledEventData) {
        await this.invoicingHandlers.deactivateUserOnSubscriptionCanceled(data)
    }

    @EventPattern('subscription-reactivated')
    async handleSubscriptionReactivatedEvent(data: ISubscriptionReactivatedEventData) {
        await this.invoicingHandlers.reactivateUserOnSubscriptionReactivated(data)
    }

    @EventPattern('payment-failed')
    async handlePaymentFailedEvent(data: IPaymentFailedEventData) {
        await this.invoicingHandlers.notifyAdminOnPaymentFailed(data)
    }
}
