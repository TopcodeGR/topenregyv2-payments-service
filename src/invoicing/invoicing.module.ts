import { Module } from '@nestjs/common';
import { InvoicingController } from './invoicing.controller';
import { InvoicingService } from './invoicing.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InvoicingHandlers } from './invoicing.handlers';

@Module({
    imports: [
        ConfigModule,
        HttpModule,
        ClientsModule.registerAsync([{
            inject: [ConfigService],
            name: "PAYMENTS_SERVICE",
            useFactory: (configService: ConfigService) => {
                return {
                    name: "PAYMENTS_SERVICE",
                    transport: Transport.REDIS,
                    options: {
                        host: configService.get("app.redisHost"),
                        port: configService.get("app.redisPort")
                    }
                }
            }
        }])],
    controllers: [InvoicingController],
    providers: [InvoicingService, InvoicingHandlers],
    exports: [InvoicingService]
})
export class InvoicingModule { }
