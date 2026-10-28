/**
 * @file apps/web/src/components/sandbox/sandbox-context.tsx
 * @description Mock sandbox context with sandbox mode permanently disabled.
 */

'use client';

import * as React from 'react';

interface SandboxContextType {
  isSandboxMode: boolean;
  activePersona: string;
  setSandboxMode: (mode: boolean) => void;
  setPersona: (persona: string) => void;
  resetSandboxData: () => void;
  openPaymentModal: () => void;
  addPoolingReservation: (campaignId: string, quantityKg: number) => void;
  approveKybSubmission: (tenantId: string) => void;
  markInvoicePaid: (invoiceId: string) => void;
}

export const INITIAL_SANDBOX_STATE: SandboxContextType = {
  isSandboxMode: false,
  activePersona: 'BUYER',
  setSandboxMode: () => {},
  setPersona: () => {},
  resetSandboxData: () => {},
  openPaymentModal: () => {},
  addPoolingReservation: () => {},
  approveKybSubmission: () => {},
  markInvoicePaid: () => {},
};

const SandboxContext = React.createContext<SandboxContextType>(INITIAL_SANDBOX_STATE);

export function SandboxProvider({ children }: { children: React.ReactNode }) {
  return <SandboxContext.Provider value={INITIAL_SANDBOX_STATE}>{children}</SandboxContext.Provider>;
}

export function useSandbox() {
  return React.useContext(SandboxContext);
}
