import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import stripeConfig from '../config/stripe.config';
import eurekaConfig from '../config/eureka.config';
import { EurekaModule } from 'nestjs-eureka';
import { StripeModule } from '../stripe/stripe.module';
import invoicingConfig from 'src/config/invoicing.config';
import { InvoicingModule } from 'src/invoicing/invoicing.module';
import appConfig from 'src/config/app.config';
import { InvoicingService } from 'src/invoicing/invoicing.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [stripeConfig, eurekaConfig, invoicingConfig, appConfig],
    }),
    EurekaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        eureka: {
          host: configService.get('eureka.host'),
          port: configService.get('eureka.port'),
          registryFetchInterval: 1000,
          servicePath: configService.get('eureka.servicePath'),
          maxRetries: 3,
        },
        service: {
          name: configService.get('eureka.serviceName'),
          port: configService.get('eureka.servicePort'),
        },
      }),

      inject: [ConfigService],
    }),
    StripeModule,
    InvoicingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

/*

 */
