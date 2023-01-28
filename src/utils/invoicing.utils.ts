import { ConfigService } from "@nestjs/config"
import { IElorusApiHeaders } from "src/types/invoicing.types"

export const getElorusApiHeaders = (configService: ConfigService): IElorusApiHeaders => {
    return {
        "Authorization": `Token ${configService.get("invoicing.elorusApiKey")}`,
        "X-Elorus-Organization": configService.get("invoicing.elorusOrganisationId"),
    }
}

export const createQueryStringFromObject = (queryObject: { [key: string]: string | number }) => {

    return queryObject ? Object.entries(queryObject).map(([k, v]) => `${k}=${v}`).join("&") : ''
}
