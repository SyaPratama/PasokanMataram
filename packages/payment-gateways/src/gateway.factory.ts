/**
 * @file packages/payment-gateways/src/gateway.factory.ts
 * @description Factory returning the correct PaymentGateway adapter by provider key.
 */

import { activePaymentProvider, type PaymentProvider } from '@pasok/config';
import type { PaymentGateway } from '@pasok/domain';
import { SolosmartpayGateway } from './solosmartpay.gateway';
import { XenditGateway }       from './xendit.gateway';
import { DuitkuGateway }       from './duitku.gateway';
import { MidtransGateway }     from './midtrans.gateway';

export class GatewayFactory {
  private readonly gateways: Record<PaymentProvider, PaymentGateway> = {
    solosmartpay: new SolosmartpayGateway(),
    xendit:       new XenditGateway(),
    duitku:       new DuitkuGateway(),
    midtrans:     new MidtransGateway(),
  };

  get active(): PaymentGateway {
    return this.gateways[activePaymentProvider];
  }

  get(provider: string): PaymentGateway {
    const gw = this.gateways[provider as PaymentProvider];
    if (!gw) throw new Error(`Unknown payment provider: ${provider}`);
    return gw;
  }
}
