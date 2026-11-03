/**
 * @file services/settlement-service/src/index.ts
 * @description Entrypoint for the Settlement and Solosmartpay Payment Gateway Microservice.
 */

export * from './solosmartpay';
export * from './service';
export type { PaymentMethod, PaymentStatus } from '@pasok/config';
