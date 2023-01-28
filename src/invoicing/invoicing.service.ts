import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from "axios"
import { catchError, firstValueFrom, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ELORUS_INVOICE_CALCULATOR_MODE, ELORUS_INVOICE_MY_DATA_CLASSIFICATION_CATEGORY, ELORUS_INVOICE_MY_DATA_CLASSIFICATION_TYPE, ELORUS_INVOICE_MY_DATA_DOCUMENT_TYPE, ELORUS_INVOICE_PAYMENT_METHOD, ELORUS_PAYMENT_TRANSACTION_TYPE, IElorusClientGetDTO, IElorusClientPostDTO, IElorusInvoiceGetDTO, IElorusInvoiceItem, IElorusInvoicePaymentPostDTO, IElorusInvoicePostDTO, IElorusPaymentGetDTO, IElorusProductGetDTO } from 'src/types/invoicing.types';
import { createQueryStringFromObject, getElorusApiHeaders } from 'src/utils/invoicing.utils';
import { IUser } from 'src/types/app.types';
import * as moment from 'moment';

@Injectable()
export class InvoicingService {


    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async getClients(query: { [key: string]: string | number }): Promise<IElorusClientGetDTO[]> {

        query = {
            ...query,
            ctype: "client",
            active: 1
        }

        let clients = await firstValueFrom(
            this.httpService
                .get(`${this.configService.get("invoicing.elorusApiUrl")}/contacts?${createQueryStringFromObject(query)}`, {
                    headers: getElorusApiHeaders(this.configService)
                })
                .pipe(map((value) => value.data.results)),
        );
        return clients
    }


    async createClient(clientToCreate: IElorusClientPostDTO): Promise<IElorusClientGetDTO> {

        let existingClient = await this.getClients({ search: clientToCreate.vat_number, search_fields: "vat_number" })
        if (existingClient.length > 0) {
            return existingClient[0]
        }
        let client = await firstValueFrom(
            this.httpService
                .post(`${this.configService.get("invoicing.elorusApiUrl")}/contacts/`, clientToCreate, {
                    headers: getElorusApiHeaders(this.configService),
                })
                .pipe(map((value) => value.data))
                .pipe(
                    catchError(e => {
                        throw new HttpException(e.response.data, e.response.status);
                    }),
                )


        );
        return client
    }


    async getInvoices(query: { [key: string]: string | number }): Promise<IElorusInvoiceGetDTO[]> {
        let invoices = await firstValueFrom(
            this.httpService
                .get(`${this.configService.get("invoicing.elorusApiUrl")}/invoices?${createQueryStringFromObject(query)}`, {
                    headers: getElorusApiHeaders(this.configService)
                })
                .pipe(map((value) => value.data.results)),
        );
        return invoices
    }

    async getProduct(productId: string): Promise<IElorusProductGetDTO> {
        let product: IElorusProductGetDTO = await firstValueFrom(
            this.httpService
                .get(`${this.configService.get("invoicing.elorusApiUrl")}/products/${productId}`, {
                    headers: getElorusApiHeaders(this.configService)
                })
                .pipe(map((value) => value.data)),
        );
        product = {
            ...product,
            priceAfterTax: Number(product.sale_value) * Number(this.configService.get("invoicing.elorusTaxFactor"))
        }

        return product
    }

    async createPayment(invoiceId: string, date: string, amount: string, clientId: string): Promise<IElorusPaymentGetDTO> {

        let paymentToCreate: IElorusInvoicePaymentPostDTO = {
            transaction_type: ELORUS_PAYMENT_TRANSACTION_TYPE.CLIENT_PAYMENT,
            title: "Εξόφληση συνδρομής",
            date,
            contact: clientId,
            calculator_mode: ELORUS_INVOICE_CALCULATOR_MODE.TAX_INCLUSIVE,
            amount,
            invoice_payments: [{
                invoice: invoiceId,
                amount
            }]
        }

        let payment: IElorusPaymentGetDTO = await firstValueFrom(
            this.httpService
                .post(`${this.configService.get("invoicing.elorusApiUrl")}/cashreceipts/`, paymentToCreate, {
                    headers: getElorusApiHeaders(this.configService)
                })
                .pipe(map((value) => value.data)),
        );


        return payment;

    }

    async createInvoice(userId: string, productId: string): Promise<IElorusInvoiceGetDTO> {
        let clientid = this.configService.get("app.clientId")
        let clientsecret = this.configService.get("app.clientSecret")

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

        if (!user) {
            return;
        }

        let existingClient = await this.getClients({ search: user.vat, search_fields: "vat_number" })
        let elorusClient: IElorusClientGetDTO = null
        if (existingClient.length > 0) {
            elorusClient = existingClient[0]
        } else {
            elorusClient = await this.createClient({
                active: true,
                company: user.bussinessName,
                display_name: user.bussinessName,
                profession: user.bussinessSector,
                vat_number: user.vat,
                tax_office: user.doi,
                is_client: true,
                client_type: 4,
                is_supplier: false,
                default_lanugage: 'el',
                default_taxes: [this.configService.get("invoicing.elorusTaxId"),],
                default_currency_code: "EUR",
                addresses: [{
                    address: user.address.street,
                    city: user.address.city,
                    state: user.address.state,
                    zip: user.address.zipCode,
                    country: "GR",
                    ad_type: "bill",
                }],
                email: [{
                    email: user.email,
                    primary: true
                }],
                phones: [{
                    number: user.phone,
                    primary: true
                }]
            })
        }

        let product = await this.getProduct(productId)
        let invoiceToCreate: IElorusInvoicePostDTO = {
            documenttype: this.configService.get("invoicing.elorusDocumentType"),
            date: moment(new Date()).format("YYYY-MM-DD"),
            draft: false,
            template: this.configService.get("invoicing.elorusTemplateId"),
            client: elorusClient.id,
            currency_code: elorusClient.default_currency_code,
            calculator_mode: ELORUS_INVOICE_CALCULATOR_MODE.TAX_EXCLUSIVE,
            items: [{
                product: productId,
                mydata_classification_category: ELORUS_INVOICE_MY_DATA_CLASSIFICATION_CATEGORY.PROVISION_OF_SERVICES,
                mydata_classification_type: ELORUS_INVOICE_MY_DATA_CLASSIFICATION_TYPE.E3_561_007

            }],
            paid_on_receipt: product.priceAfterTax.toFixed(2),
            payment_method: ELORUS_INVOICE_PAYMENT_METHOD.CASH,
            mydata_document_type: ELORUS_INVOICE_MY_DATA_DOCUMENT_TYPE.SERVICE_RENDERED_INVOICE
        }


        let invoice: IElorusInvoiceGetDTO = await firstValueFrom(
            this.httpService
                .post(`${this.configService.get("invoicing.elorusApiUrl")}/invoices/`, invoiceToCreate, {
                    headers: getElorusApiHeaders(this.configService),
                })
                .pipe(map((value) => value.data))
                .pipe(
                    catchError(e => {
                        throw new HttpException(e.response.data, e.response.status);
                    }),
                )
        );

        let payment = await this.createPayment(invoice.id, invoice.date, product.priceAfterTax.toFixed(2), invoice.client)
        return invoice
    }

}
