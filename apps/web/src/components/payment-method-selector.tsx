'use client';

import * as React from 'react';
import { Check } from 'lucide-react';

export type PaymentMethod = 'qris' | 'va_bca' | 'va_bni' | 'va_mandiri' | 'va_bri' | 'va_bsi' | 'va_bpd_diy';

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  logo?: string;
  description: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  { id: 'qris', label: 'QRIS', description: 'Scan QR Code dari aplikasi e-wallet' },
  { id: 'va_bca', label: 'BCA Virtual Account', description: 'Transfer ke Virtual Account BCA' },
  { id: 'va_mandiri', label: 'Mandiri Virtual Account', description: 'Transfer ke Virtual Account Mandiri' },
  { id: 'va_bni', label: 'BNI Virtual Account', description: 'Transfer ke Virtual Account BNI' },
  { id: 'va_bri', label: 'BRI Virtual Account', description: 'Transfer ke Virtual Account BRI' },
  { id: 'va_bsi', label: 'BSI Virtual Account', description: 'Transfer ke Virtual Account BSI' },
  { id: 'va_bpd_diy', label: 'BPD DIY Virtual Account', description: 'Transfer ke Virtual Account BPD DIY' },
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
        {PAYMENT_METHODS.map((method) => (
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
