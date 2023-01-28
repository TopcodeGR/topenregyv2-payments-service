import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { InvoicingModule } from 'src/invoicing/invoicing.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    InvoicingModule,
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
    }])
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule { }
