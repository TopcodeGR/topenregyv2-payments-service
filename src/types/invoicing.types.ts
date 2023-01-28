
import { RawAxiosRequestHeaders } from "axios"

export interface IElorusClientGetDTO {
    id: string;
    custom_id: string;
    active: boolean;
    first_name: string;
    last_name: string;
    company: string;
    display_name: string;
    profession: string;
    notes: string;
    vat_number: string;
    tax_office: string;
    is_client: boolean;
    client_type: number;
    is_supplier: boolean;
    default_lanugage: string;
    default_theme?: number;
    default_taxes: string[],
    default_currency_code: string;
    addresses: IElorusClientAddress[]
    email: IElorusClientEmail[];
    phones: IElorusClientPhone[]
    organization: string;
    created: Date;
    modified: Date;
}

export interface IElorusClientPostDTO {

    custom_id?: string;
    active: boolean;
    first_name?: string;
    last_name?: string;
    company: string;
    display_name: string;
    profession: string;
    notes?: string;
    vat_number: string;
    tax_office: string;
    is_client: boolean;
    client_type: number;
    is_supplier: boolean;
    default_lanugage: string;
    default_theme?: number;
    default_taxes: string[],
    default_currency_code: string;
    addresses: IElorusClientAddress[]
    email: IElorusClientEmail[];
    phones: IElorusClientPhone[]

}


export interface IElorusClientAddress {
    id?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    ad_type: string;
    branch_code?: number;
}


export interface IElorusClientEmail {
    id?: string;
    email: string;
    primary: boolean;
}

export interface IElorusClientPhone {
    id?: string;
    number: string;
    primary: boolean;
}


export interface IElorusInvoiceGetDTO {
    id: string;
    documentType: string; //2657635925672068389
    date: string;
    number: string;
    client: string;
    client_display_name?: string;
    client_profession?: string;
    client_vat_number?: string;
    client_tax_office?: string;
    billing_address: IElorusInvoiceBillingAddress;
    shipping_address: IElorusInvoiceShippingAddress
    client_contact_person?: string;
    client_phone_number?: string;
    client_email?: string;
    currency_code?: string;
    exhange_rate?: string;
    calculator_mode?: ELORUS_INVOICE_CALCULATOR_MODE;
    items: IElorusInvoiceItem[];
    withholding_taxes: number[]
    template: number;
    terms: string;
    public_notes: string;
    permalink: string;
    paid_on_receipt: string;
    payment_methond: ELORUS_INVOICE_PAYMENT_METHOD
    vat_payment_suspension: boolean;
    mydata_document_type: ELORUS_INVOICE_MY_DATA_DOCUMENT_TYPE

}
export interface IElorusInvoicePostDTO {
    documenttype: string; //2657635925672068389
    date: string;
    draft: boolean;
    client?: string;
    client_display_name?: string;
    client_profession?: string;
    client_vat_number?: string;
    client_tax_office?: string;
    billing_address?: IElorusInvoiceBillingAddress;
    shipping_address?: IElorusInvoiceShippingAddress
    client_contact_person?: string;
    client_phone_number?: string;
    client_email?: string;
    currency_code?: string;
    exhange_rate?: string;
    calculator_mode?: ELORUS_INVOICE_CALCULATOR_MODE;
    items: IElorusInvoiceItem[];
    withholding_taxes?: number[]
    template?: string;
    terms?: string;
    public_notes?: string;
    paid_on_receipt?: string;
    payment_method?: ELORUS_INVOICE_PAYMENT_METHOD
    vat_payment_suspension?: boolean;
    mydata_document_type: string
}

export interface IElorusInvoiceItem {
    product?: string;
    title?: string;
    description?: string;
    quantity?: string;
    unit_measure?: ELORUS_INVOICE_UNIT_MEASURE
    unit_value?: string;
    unit_discount?: string;
    taxes?: string[]; //2657635929606325405
    vat_exemption_category?: string;
    unit_total?: string;
    mydata_classification_category?: ELORUS_INVOICE_MY_DATA_CLASSIFICATION_CATEGORY
    mydata_classification_type?: ELORUS_INVOICE_MY_DATA_CLASSIFICATION_TYPE


}

export interface IElorusProductGetDTO {
    id: string;
    custom_id: string;
    title: string;
    code: string;
    description: string;
    sales: boolean;
    sale_value: string;
    priceAfterTax: number;
    sale_taxes: string[];
    purchases: boolean;
    purchase_value: string;
    purchase_taxes: string[];
    maange: boolean;
    stock: string;
    unit_measure: string;
    my_data_clasification_category: string;
    organisation: string;
    created: Date;
    modified: Date;
}

export interface IElorusInvoicePaymentPostDTO {

    transaction_type: ELORUS_PAYMENT_TRANSACTION_TYPE;
    title: string;
    date: string;
    contact: string;
    calculator_mode: ELORUS_INVOICE_CALCULATOR_MODE;
    amount: string;
    invoice_payments: IElorusPaymentInvoice[]
}

export interface IElorusPaymentGetDTO {
    id: string;
    custom_id: string;
    transaction_type: ELORUS_PAYMENT_TRANSACTION_TYPE;
    title: string;
    date: Date;
    income_type: string;
    sequence: string;
    number: string;
    contact: string;
    contact_name: string;
    contact_vat_number: string;
    contact_address: IElorusInvoiceBillingAddress;
    currency_code: string;
    exchange_rate: string;
    calculator_mode: ELORUS_INVOICE_CALCULATOR_MODE;
    net: string;
    taxes: string[];
    amount: string;
    payment_method: ELORUS_INVOICE_PAYMENT_METHOD;
    vat_exemption_category?: string;
    mydata_classification_category: ELORUS_INVOICE_MY_DATA_CLASSIFICATION_CATEGORY
    mydata_classification_type: ELORUS_INVOICE_MY_DATA_CLASSIFICATION_TYPE
    mydata_document_type: ELORUS_INVOICE_MY_DATA_DOCUMENT_TYPE;
    mydata_uid: string;
    mydata_latest_mark: string;
    mydata_latest_cancel_mark: string;
    mydata_submission_status: string;
    authentication_code: string;
    softone_link: string;
    invoice_payments: IElorusPaymentInvoice[]
    organization: string
    created: Date;
    modified: Date;
}


export interface IElorusPaymentInvoice {
    invoice: string;
    amount: string;
}
export enum ELORUS_PAYMENT_TRANSACTION_TYPE {
    CLIENT_PAYMENT = "ip"
}

export enum ELORUS_INVOICE_PAYMENT_METHOD {
    CASH = 3,
    WEB_BANKING = 6
}

export enum ELORUS_INVOICE_MY_DATA_DOCUMENT_TYPE {
    SERVICE_RENDERED_INVOICE = "2.1"
}

export enum ELORUS_INVOICE_MY_DATA_CLASSIFICATION_CATEGORY {
    PROVISION_OF_SERVICES = "category1_3"
}

export enum ELORUS_INVOICE_MY_DATA_CLASSIFICATION_TYPE {
    E3_561_001 = "E3_561_001",
    E3_561_003 = "E3_561_003",
    E3_561_007 = "E3_561_007"
}

export enum ELORUS_INVOICE_UNIT_MEASURE {
    ITEM = 0,
    SERVICE = 1
}
export enum ELORUS_INVOICE_CALCULATOR_MODE {
    TAX_EXCLUSIVE = "initial",
    TAX_INCLUSIVE = "total"
}

export interface IElorusInvoiceBillingAddress {
    address_line: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    branch_code?: number;
}

export interface IElorusInvoiceShippingAddress {
    address_line: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}


export type IElorusApiHeaders = RawAxiosRequestHeaders & {
    'Authorization': string;
    "X-Elorus-Organization": string
}


export interface ISubscriptionPaidEventData {
    stripeCustomerId: string;
}

export interface ISubscriptionCanceledEventData {
    stripeCustomerId: string;
}

export interface ISubscriptionReactivatedEventData {
    stripeCustomerId: string;
}

export interface IPaymentFailedEventData {
    stripeCustomerId: string;
    date: string;
    attempsCount: number;
}