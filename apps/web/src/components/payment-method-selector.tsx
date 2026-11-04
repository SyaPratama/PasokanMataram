'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { PAYMENT_METHODS, type PaymentMethod } from '@pasok/config';

export type { PaymentMethod };

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
}

const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { id: PAYMENT_METHODS.QRIS,          label: 'QRIS',                        description: 'Scan QR Code dari aplikasi e-wallet' },
  { id: PAYMENT_METHODS.VA_BCA,        label: 'BCA Virtual Account',         description: 'Transfer ke Virtual Account BCA' },
  { id: PAYMENT_METHODS.VA_MANDIRI,    label: 'Mandiri Virtual Account',     description: 'Transfer ke Virtual Account Mandiri' },
  { id: PAYMENT_METHODS.VA_BNI,        label: 'BNI Virtual Account',         description: 'Transfer ke Virtual Account BNI' },
  { id: PAYMENT_METHODS.VA_BRI,        label: 'BRI Virtual Account',         description: 'Transfer ke Virtual Account BRI' },
  { id: PAYMENT_METHODS.VA_BSI,        label: 'BSI Virtual Account',         description: 'Transfer ke Virtual Account BSI' },
  { id: PAYMENT_METHODS.VA_BPD_DIY,    label: 'BPD DIY Virtual Account',     description: 'Transfer ke Virtual Account BPD DIY' },
  { id: PAYMENT_METHODS.EWALLET_GOPAY, label: 'GoPay',                       description: 'Bayar via GoPay' },
  { id: PAYMENT_METHODS.EWALLET_DANA,  label: 'DANA',                        description: 'Bayar via DANA' },
  { id: PAYMENT_METHODS.EWALLET_OVO,   label: 'OVO',                         description: 'Bayar via OVO' },
  { id: PAYMENT_METHODS.EWALLET_SHOPEE,label: 'ShopeePay',                   description: 'Bayar via ShopeePay' },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gelap">Metode Pembayaran</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAYMENT_METHOD_OPTIONS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`
              relative p-4 rounded-xl border-2 text-left transition-all
              ${
                selected === method.id
                  ? 'border-primer bg-primer-light'
                  : 'border-netral-border bg-white hover:border-primer/50'
              }
            `}
          >
            {selected === method.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primer flex items-center justify-center">
                <Check className="w-3 h-3 text-white" aria-hidden="true" />
              </div>
            )}
            <div className="text-sm font-bold text-gelap">{method.label}</div>
            <div className="text-xs text-gelap/70 mt-1">{method.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
