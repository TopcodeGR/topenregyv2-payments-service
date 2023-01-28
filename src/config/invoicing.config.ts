import { registerAs } from '@nestjs/config';

export default registerAs('invoicing', () => ({
    elorusApiKey: process.env.ELORUS_API_KEY,
    elorusApiUrl: process.env['ELORUS_API_URL'],
    elorusOrganisationId: process.env['ELORUS_ORGANISATION_ID'],
    elorusDocumentType: process.env["ELORUS_DOCUMENT_TYPE"],
    elorusTemplateId: process.env["ELORUS_TEMPLATE_ID"],
    topenergyV2ProductId: process.env["TOPENERGYV2_PRODUCT_ID"],
    elorusTaxId: process.env["ELORUS_TAX_ID"],
    elorusTaxFactor: process.env["ELORUS_TAX_FACTOR"]
}));

