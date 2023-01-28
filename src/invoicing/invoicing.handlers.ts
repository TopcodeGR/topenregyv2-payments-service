import { HttpService } from "@nestjs/axios";
import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { catchError, firstValueFrom, map } from "rxjs";
import { ISubscriptionCanceledEventData, ISubscriptionPaidEventData, ISubscriptionReactivatedEventData, IPaymentFailedEventData } from "src/types/invoicing.types";
import { InvoicingService } from "./invoicing.service";



@Injectable()
export class InvoicingHandlers {


    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly invoicingService: InvoicingService,
        @Inject("PAYMENTS_SERVICE") private client: ClientProxy
    ) { }


    async issueInvoiceOnSubscriptionPaid(data: ISubscriptionPaidEventData) {
        let clientid = this.configService.get("app.clientId")
        let clientsecret = this.configService.get("app.clientSecret")

        try {

            let user = await firstValueFrom(
                this.httpService
                    .get(`http://auth-service/users/?stripeCustomerId=${data.stripeCustomerId}`, {
                        headers: {
                            clientid,
                            clientsecret
                        },
                    })
                    .pipe(map((value) => value.data.data)),
            );

            user = user[0]
            if (!user) {
                return
            }

            let invoice = await this.invoicingService.createInvoice(user._id, this.configService.get("invoicing.topenergyV2ProductId"))
            let emailData = {
                from: this.configService.get("app.adminEmail"),
                to: this.configService.get("app.adminEmail"),
                subject: `PAID SUBSCRIPTION - TOPENERGYV2`,
                text: `Elorus invoice id: ${invoice.id} - Elorus invoice number: ${invoice.number} - Elorus invoice link: ${invoice.permalink} - Date: ${invoice.date} `
            }

            let emailSent = await firstValueFrom(
                this.httpService
                    .post(`http://email-service/emails`, emailData, {
                        headers: {
                            clientid,
                            clientsecret
                        },
                    }).pipe(map((value) => {
                        console.log(value)
                        return value.data.success
                    })
                    )
            );

        } catch (e) {
            console.log(e)
        }
    }

    async deactivateUserOnSubscriptionCanceled(data: ISubscriptionCanceledEventData) {
        let clientid = this.configService.get("app.clientId")
        let clientsecret = this.configService.get("app.clientSecret")

        console.log("CANCELED")
        try {
            let user = await firstValueFrom(
                this.httpService
                    .get(`http://auth-service/users/?stripeCustomerId=${data.stripeCustomerId}`, {
                        headers: {
                            clientid,
                            clientsecret
                        },
                    })
                    .pipe(map((value) => value.data.data[0])),
            );

            if (!user) {
                return
            }

            let updatedUser = await firstValueFrom(
                this.httpService
                    .put(`http://auth-service/users/${user._id}`, { ...user, active: false }, {
                        headers: {
                            clientid,
                            clientsecret
                        },
                    }).pipe(map((value) => value.data.data))
            )

            let emailData = {
                from: this.configService.get("app.adminEmail"),
                to: this.configService.get("app.adminEmail"),
                subject: `CANCELED SUBSCRIPTION - TOPENERGYV2`,
                text: `Customer: ${user.lastName + " " + user.firstName} - Userid: ${user._id} - Stripe customer id: ${data.stripeCustomerId}`,
            }

            let emailSent = await firstValueFrom(
                this.httpService
                    .post(`http://email-service/emails`, emailData, {
                        headers: {
                            clientid,
                            clientsecret
                        },
                    }).pipe(map((value) => {
                        console.log(value)
                        return value.data.success
                    })
                    )
            );

        } catch (e) {
            console.log(e)
        }
    }

    async reactivateUserOnSubscriptionReactivated(data: ISubscriptionReactivatedEventData) {
        let clientid = this.configService.get("app.clientId")
        let clientsecret = this.configService.get("app.clientSecret")
        console.log("REACTIVATED")
        try {
            let user = await firstValueFrom(
                this.httpService
                    .get(`http://auth-service/users/?stripeCustomerId=${data.stripeCustomerId}`, {
                        headers: {
                            clientid,
                            clientsecret
                        },
                    })
                    .pipe(map((value) => value.data.data[0])),
            );

            if (!user) {
                return
            }

            let updatedUser = await firstValueFrom(
                this.httpService
                    .put(`http://auth-service/users/${user._id}`, { ...user, active: true }, {
                        headers: {
                            clientid,
                            clientsecret
                        },
                    }).pipe(map((value) => value.data.data))
            )

            let emailData = {
                from: this.configService.get("app.adminEmail"),
                to: this.configService.get("app.adminEmail"),
                subject: `REACTIVATED SUBSCRIPTION - TOPENERGYV2`,
                text: `Customer: ${user.lastName + " " + user.firstName} - Userid: ${user._id} - Stripe customer id: ${data.stripeCustomerId}`,
            }

            let emailSent = await firstValueFrom(
                this.httpService
                    .post(`http://email-service/emails`, emailData, {
                        headers: {
                            clientid,
                            clientsecret
                        },
                    }).pipe(map((value) => {
                        console.log(value)
                        return value.data.success
                    })
                    )
            );

        } catch (e) {
            console.log(e)
        }
    }

    async notifyAdminOnPaymentFailed(data: IPaymentFailedEventData) {
        let clientid = this.configService.get("app.clientId")
        let clientsecret = this.configService.get("app.clientSecret")

        let user = await firstValueFrom(
            this.httpService
                .get(`http://auth-service/users/?stripeCustomerId=${data.stripeCustomerId}`, {
                    headers: {
                        clientid,
                        clientsecret
                    },
                })
                .pipe(map((value) => value.data.data[0])),
        );

        if (!user) {
            return
        }

        let emailData = {
            from: this.configService.get("app.adminEmail"),
            to: this.configService.get("app.adminEmail"),
            subject: `FAILED PAYMENT - TOPENERGYV2`,
            text: `Customer: ${user.lastName + " " + user.firstName} - Userid: ${user._id} - Stripe customer id: ${data.stripeCustomerId} - Date: ${data.date} - Attempts count: ${data.attempsCount}`,
        }

        let emailSent = await firstValueFrom(
            this.httpService
                .post(`http://email-service/emails`, emailData, {
                    headers: {
                        clientid,
                        clientsecret
                    },
                }).pipe(map((value) => {
                    console.log(value)
                    return value.data.success
                })
                )
        );
    }


}