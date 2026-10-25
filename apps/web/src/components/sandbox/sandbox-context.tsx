/**
 * @file apps/web/src/components/sandbox/sandbox-context.tsx
 * @description In-memory Sandbox Engine Provider and Zero DB Mutation Interceptor.
 * Provides isolated mock state, persona switching, and Solosmartpay simulation triggers.
 */

'use client';

import * as React from 'react';

export type SandboxPersona = 'BUYER' | 'SUPPLIER' | 'HUB' | 'ADMIN';

export interface SandboxPoolingCampaign {
  id: string;
  campaignUuid: string;
  commodity: string;
  targetQuotaKg: number;
  currentCollectedKg: number;
  participantsCount: number;
  closingHoursLeft: number;
  normalPricePerKg: number;
  pooledPricePerKg: number;
  savingPercent: number;
  status: 'OPEN' | 'NEARING_TARGET' | 'LOCKED';
  grade: string;
  moistureContent: string;
  storageZone: string;
  targetTemp: string;
  allowedShrinkage: string;
  certifications: string[];
}

export interface SandboxInvoice {
  invoiceId: string;
  orderId: string;
  grossAmountRp: number;
  buyerServiceFeeRp: number;
  merchantFeeRp: number;
  totalPayableRp: number;
  paymentMethod: string;
  vaNumber?: string;
  qrString?: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  createdAt: string;
}

export interface SandboxKybItem {
  tenantId: string;
  businessName: string;
  nib: string;
  siup: string;
  address: string;
  contactPerson: string;
  phone: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
  documents: {
    nibUrl: string;
    ktpUrl: string;
    watermarkApplied: boolean;
  };
}

export interface SandboxWeighTicket {
  ticketId: string;
  deliveryId: string;
  commodity: string;
  supplierName: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  digitalScaleId: string;
  toleranceDeviationKg: number;
  isWithinSniTolerance: boolean;
  weighedAt: string;
}

export interface SandboxState {
  buyer: {
    campaigns: SandboxPoolingCampaign[];
    reservations: Array<{
      reservationId: string;
      campaignId: string;
      commodity: string;
      quantityKg: number;
      amountRp: number;
      vaNumber: string;
      status: 'PENDING' | 'PAID';
      createdAt: string;
    }>;
    standingOrders: Array<{
      id: string;
      commodity: string;
      frequency: string;
      weeklyQuotaKg: number;
      nextDelivery: string;
      status: 'ACTIVE' | 'PAUSED';
    }>;
  };
  supplier: {
    allocations: Array<{
      id: string;
      commodity: string;
      allocatedKg: number;
      harvestDate: string;
      hubDestination: string;
      status: 'COMMITTED' | 'DISPATCHED' | 'RECEIVED';
    }>;
    forecasts: Array<{
      commodity: string;
      predictedPriceRp: number;
      priceChangePercent: number;
      confidence: number;
      trend: 'UP' | 'DOWN' | 'STABLE';
    }>;
  };
  hub: {
    weighTickets: SandboxWeighTicket[];
    coldChainSensors: Array<{
      zoneId: string;
      zoneName: string;
      targetTemp: string;
      currentTemp: string;
      status: 'NORMAL' | 'WARNING';
    }>;
    quarantineItems: Array<{
      id: string;
      commodity: string;
      supplier: string;
      weightKg: number;
      issue: string;
      status: 'ISOLATED' | 'INSPECTED' | 'DISPOSED';
    }>;
  };
  admin: {
    kybQueue: SandboxKybItem[];
    escrowLedger: {
      totalEscrowHeldRp: number;
      availableSettlementRp: number;
      pendingRefundRp: number;
      bpdDiyEscrowAccount: string;
    };
  };
  invoices: SandboxInvoice[];
}

export const INITIAL_SANDBOX_STATE: SandboxState = {
  buyer: {
    campaigns: [
      {
        id: 'POOL-BWR-SRI-09',
        campaignUuid: '11111111-2222-3333-4444-555555555551',
        commodity: 'Bawang Merah Srikayangan Super A',
        targetQuotaKg: 1000,
        currentCollectedKg: 850,
        participantsCount: 38,
        closingHoursLeft: 4,
        normalPricePerKg: 36000,
        pooledPricePerKg: 31000,
        savingPercent: 13.8,
        status: 'OPEN',
        grade: 'Super A (Diameter >2.5 cm)',
        moistureContent: '75%',
        storageZone: 'Ambient Berventilasi',
        targetTemp: '25-28C',
        allowedShrinkage: 'Maksimal 5.0% (SNI)',
        certifications: ['Prima 3 DIY', 'Bebas Residu'],
      },
      {
        id: 'POOL-CBI-PAN-05',
        campaignUuid: '11111111-2222-3333-4444-555555555552',
        commodity: 'Cabai Rawit Merah Panjatan Segar',
        targetQuotaKg: 500,
        currentCollectedKg: 490,
        participantsCount: 22,
        closingHoursLeft: 2,
        normalPricePerKg: 54000,
        pooledPricePerKg: 46500,
        savingPercent: 13.9,
        status: 'NEARING_TARGET',
        grade: 'Petik Segar Panjatan Pilihan',
        moistureContent: '80%',
        storageZone: 'Chilled Berventilasi',
        targetTemp: '8-12C',
        allowedShrinkage: 'Maksimal 4.0%',
        certifications: ['Gapoktan Kulon Progo', 'Halal BPJPH'],
      },
      {
        id: 'POOL-BRS-SEY-12',
        campaignUuid: '11111111-2222-3333-4444-555555555553',
        commodity: 'Beras Premium Pandan Wangi Seyegan',
        targetQuotaKg: 2000,
        currentCollectedKg: 2000,
        participantsCount: 45,
        closingHoursLeft: 0,
        normalPricePerKg: 17000,
        pooledPricePerKg: 14800,
        savingPercent: 12.9,
        status: 'LOCKED',
        grade: 'Pandan Wangi Pecah Kulit <5%',
        moistureContent: '14%',
        storageZone: 'Gudang Kering Bertingkat',
        targetTemp: '22-26C',
        allowedShrinkage: 'Maksimal 1.5%',
        certifications: ['Organik Sleman', 'SNI 6128:2020'],
      },
    ],
    reservations: [
      {
        reservationId: 'RSV-SBX-001',
        campaignId: 'POOL-BWR-SRI-09',
        commodity: 'Bawang Merah Srikayangan Super A',
        quantityKg: 20,
        amountRp: 620000,
        vaNumber: '98881023849102',
        status: 'PAID',
        createdAt: '2025-05-10T06:00:00.000Z',
      },
    ],
    standingOrders: [
      {
        id: 'SO-SBX-01',
        commodity: 'Bawang Merah Srikayangan Super A',
        frequency: 'Senin, Kamis',
        weeklyQuotaKg: 60,
        nextDelivery: 'Senin Pukul 04:30 WIB',
        status: 'ACTIVE',
      },
      {
        id: 'SO-SBX-02',
        commodity: 'Cabai Rawit Merah Panjatan Segar',
        frequency: 'Setiap Hari',
        weeklyQuotaKg: 35,
        nextDelivery: 'Besok Pukul 04:30 WIB',
        status: 'ACTIVE',
      },
      {
        id: 'SO-SBX-03',
        commodity: 'Beras Premium Pandan Wangi Seyegan',
        frequency: 'Rabu',
        weeklyQuotaKg: 100,
        nextDelivery: 'Rabu Pukul 05:00 WIB',
        status: 'ACTIVE',
      },
      {
        id: 'SO-SBX-04',
        commodity: 'Tomat Mutiara Bantul',
        frequency: 'Selasa, Jumat',
        weeklyQuotaKg: 40,
        nextDelivery: 'Selasa Pukul 04:30 WIB',
        status: 'PAUSED',
      },
    ],
  },
  supplier: {
    allocations: [
      {
        id: 'ALC-SBX-101',
        commodity: 'Bawang Merah Srikayangan Super A',
        allocatedKg: 400,
        harvestDate: '2025-05-12',
        hubDestination: 'Logistics Hub Bantul',
        status: 'COMMITTED',
      },
      {
        id: 'ALC-SBX-102',
        commodity: 'Cabai Rawit Merah Panjatan Segar',
        allocatedKg: 250,
        harvestDate: '2025-05-11',
        hubDestination: 'Logistics Hub Bantul',
        status: 'DISPATCHED',
      },
      {
        id: 'ALC-SBX-103',
        commodity: 'Beras Premium Pandan Wangi Seyegan',
        allocatedKg: 1200,
        harvestDate: '2025-05-09',
        hubDestination: 'Logistics Hub Sleman',
        status: 'RECEIVED',
      },
    ],
    forecasts: [
      {
        commodity: 'Bawang Merah Srikayangan',
        predictedPriceRp: 32500,
        priceChangePercent: 4.8,
        confidence: 0.94,
        trend: 'UP',
      },
      {
        commodity: 'Cabai Rawit Merah Panjatan',
        predictedPriceRp: 48000,
        priceChangePercent: 3.2,
        confidence: 0.91,
        trend: 'UP',
      },
      {
        commodity: 'Beras Pandan Wangi',
        predictedPriceRp: 14800,
        priceChangePercent: 0.0,
        confidence: 0.98,
        trend: 'STABLE',
      },
      {
        commodity: 'Bawang Putih Imogiri',
        predictedPriceRp: 39000,
        priceChangePercent: -2.5,
        confidence: 0.89,
        trend: 'DOWN',
      },
      {
        commodity: 'Cabai Keriting Kulon Progo',
        predictedPriceRp: 42000,
        priceChangePercent: 1.8,
        confidence: 0.93,
        trend: 'UP',
      },
      {
        commodity: 'Tomat Mutiara Bantul',
        predictedPriceRp: 11500,
        priceChangePercent: -3.8,
        confidence: 0.88,
        trend: 'DOWN',
      },
    ],
  },
  hub: {
    weighTickets: [
      {
        ticketId: 'WT-SBX-8801',
        deliveryId: 'DEL-BTL-091',
        commodity: 'Bawang Merah Srikayangan Super A',
        supplierName: 'Gapoktan Srikayangan Manunggal',
        grossWeightKg: 420.5,
        tareWeightKg: 20.0,
        netWeightKg: 400.5,
        digitalScaleId: 'SCALE-BTL-DIGI-01',
        toleranceDeviationKg: 0.5,
        isWithinSniTolerance: true,
        weighedAt: '2025-05-10T04:15:00.000Z',
      },
      {
        ticketId: 'WT-SBX-8802',
        deliveryId: 'DEL-PAN-042',
        commodity: 'Cabai Rawit Merah Panjatan Segar',
        supplierName: 'Gapoktan Panjatan Makmur',
        grossWeightKg: 262.2,
        tareWeightKg: 12.0,
        netWeightKg: 250.2,
        digitalScaleId: 'SCALE-BTL-DIGI-02',
        toleranceDeviationKg: 0.2,
        isWithinSniTolerance: true,
        weighedAt: '2025-05-10T04:45:00.000Z',
      },
    ],
    coldChainSensors: [
      {
        zoneId: 'ZONE-A1',
        zoneName: 'Ruang Chilled Cabai & Sayur Daun',
        targetTemp: '8-12C',
        currentTemp: '9.4C',
        status: 'NORMAL',
      },
      {
        zoneId: 'ZONE-B2',
        zoneName: 'Ruang Ambient Berventilasi Bawang',
        targetTemp: '25-28C',
        currentTemp: '26.1C',
        status: 'NORMAL',
      },
      {
        zoneId: 'ZONE-C3',
        zoneName: 'Silo Kering Beras & Biji-bijian',
        targetTemp: '22-26C',
        currentTemp: '23.5C',
        status: 'NORMAL',
      },
    ],
    quarantineItems: [
      {
        id: 'QRN-SBX-01',
        commodity: 'Cabai Rawit Merah Panjatan (Batch 04)',
        supplier: 'Mitra Tani Panjatan',
        weightKg: 15.0,
        issue: 'Penyortiran busuk batang melampaui batas SNI 5%',
        status: 'ISOLATED',
      },
    ],
  },
  admin: {
    kybQueue: [
      {
        tenantId: 'tnt-sbx-rest-01',
        businessName: 'Gudeg Pawon Legendaris Yogyakarta',
        nib: '9120003418291',
        siup: '503/0481/SIUP-MB/2021',
        address: 'Jl. Jatisari No. 16, Warungboto, Umbulharjo, Kota Yogyakarta',
        contactPerson: 'Bapak H. Prapto',
        phone: '081234567890',
        status: 'SUBMITTED',
        submittedAt: '2025-05-10T02:00:00.000Z',
        documents: {
          nibUrl: '/docs/mock/nib-gudeg.pdf',
          ktpUrl: '/docs/mock/ktp-prapto.webp',
          watermarkApplied: true,
        },
      },
      {
        tenantId: 'tnt-sbx-gpk-02',
        businessName: 'Gapoktan Makmur Srikayangan Kulon Progo',
        nib: '9120007812903',
        siup: '503/1102/SIUP-AGRO/2022',
        address: 'Desa Srikayangan, Sentolo, Kulon Progo',
        contactPerson: 'Ibu Siti Rahayu',
        phone: '081398765432',
        status: 'UNDER_REVIEW',
        submittedAt: '2025-05-09T14:30:00.000Z',
        documents: {
          nibUrl: '/docs/mock/nib-gapoktan.pdf',
          ktpUrl: '/docs/mock/ktp-siti.webp',
          watermarkApplied: true,
        },
      },
    ],
    escrowLedger: {
      totalEscrowHeldRp: 48500000,
      availableSettlementRp: 41250000,
      pendingRefundRp: 0,
      bpdDiyEscrowAccount: '9888-001-PASOK-ESCROW',
    },
  },
  invoices: [
    {
      invoiceId: 'INV-RSV-SBX-001',
      orderId: 'RSV-SBX-001',
      grossAmountRp: 620000,
      buyerServiceFeeRp: 1860,
      merchantFeeRp: 3100,
      totalPayableRp: 621860,
      paymentMethod: 'BPD_DIY',
      vaNumber: '98881023849102',
      status: 'PAID',
      createdAt: '2025-05-10T06:00:00.000Z',
    },
  ],
};

export interface PaymentPreset {
  orderId?: string;
  amountRp?: number;
  invoiceId?: string;
  method?: string;
}

export interface SandboxContextValue {
  isSandboxMode: boolean;
  activePersona: SandboxPersona;
  sandboxState: SandboxState;
  setSandboxMode: (enabled: boolean) => void;
  setPersona: (persona: SandboxPersona) => void;
  resetSandboxData: () => void;
  isPaymentModalOpen: boolean;
  openPaymentModal: (preset?: PaymentPreset) => void;
  closePaymentModal: () => void;
  activePaymentPreset: PaymentPreset | null;
  addPoolingReservation: (
    campaignId: string,
    quantityKg: number
  ) => { invoiceId: string; vaNumber: string; totalPayableRp: number; grossAmountRp: number };
  approveKybSubmission: (tenantId: string) => void;
  markInvoicePaid: (invoiceId: string) => void;
}

const STORAGE_KEY_STATE = 'pasok_sandbox_state_v1';
const STORAGE_KEY_MODE = 'pasok_sandbox_active';
const STORAGE_KEY_PERSONA = 'pasok_sandbox_persona_active';

const SandboxContext = React.createContext<SandboxContextValue | undefined>(undefined);

/**
 * Hook akses konteks sandbox PasokMataram.
 * @returns Instans SandboxContextValue.
 */
export function useSandbox(): SandboxContextValue {
  const context = React.useContext(SandboxContext);
  if (!context) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return context;
}

interface SandboxProviderProps {
  children: React.ReactNode;
}

/**
 * Provider Sandbox PasokMataram dengan isolasi mutasi data basis data nol.
 * @param props Properti children.
 */
export function SandboxProvider({ children }: SandboxProviderProps): React.JSX.Element {
  const [isSandboxMode, setIsSandboxModeState] = React.useState<boolean>(false);
  const [activePersona, setActivePersonaState] = React.useState<SandboxPersona>('BUYER');
  const [sandboxState, setSandboxState] = React.useState<SandboxState>(INITIAL_SANDBOX_STATE);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState<boolean>(false);
  const [activePaymentPreset, setActivePaymentPreset] = React.useState<PaymentPreset | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlSandbox = urlParams.get('sandbox');
    const urlPersona = urlParams.get('persona') as SandboxPersona | null;

    const storedMode = window.sessionStorage.getItem(STORAGE_KEY_MODE);
    const storedPersona = window.sessionStorage.getItem(STORAGE_KEY_PERSONA) as SandboxPersona | null;
    const storedState = window.sessionStorage.getItem(STORAGE_KEY_STATE);

    const isEnabled = urlSandbox === 'true' || storedMode === 'true';
    setIsSandboxModeState(isEnabled);

    const resolvedPersona: SandboxPersona =
      urlPersona && ['BUYER', 'SUPPLIER', 'HUB', 'ADMIN'].includes(urlPersona)
        ? urlPersona
        : storedPersona && ['BUYER', 'SUPPLIER', 'HUB', 'ADMIN'].includes(storedPersona)
        ? storedPersona
        : 'BUYER';
    setActivePersonaState(resolvedPersona);

    if (storedState) {
      try {
        const parsed = JSON.parse(storedState) as SandboxState;
        setSandboxState(parsed);
      } catch {
        setSandboxState(INITIAL_SANDBOX_STATE);
      }
    }

    if (isEnabled) {
      document.cookie = `pasok_sandbox_mode=true; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `pasok_sandbox_persona=${resolvedPersona}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, []);

  const setSandboxMode = React.useCallback((enabled: boolean) => {
    setIsSandboxModeState(enabled);
    if (typeof window !== 'undefined') {
      if (enabled) {
        window.sessionStorage.setItem(STORAGE_KEY_MODE, 'true');
        document.cookie = `pasok_sandbox_mode=true; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `pasok_sandbox_persona=${activePersona}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        window.sessionStorage.removeItem(STORAGE_KEY_MODE);
        document.cookie = `pasok_sandbox_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `pasok_sandbox_persona=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
  }, [activePersona]);

  const setPersona = React.useCallback((persona: SandboxPersona) => {
    setActivePersonaState(persona);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY_PERSONA, persona);
      document.cookie = `pasok_sandbox_persona=${persona}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, []);

  const resetSandboxData = React.useCallback(() => {
    setSandboxState(INITIAL_SANDBOX_STATE);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(INITIAL_SANDBOX_STATE));
    }
  }, []);

  const openPaymentModal = React.useCallback((preset?: PaymentPreset) => {
    setActivePaymentPreset(preset || null);
    setIsPaymentModalOpen(true);
  }, []);

  const closePaymentModal = React.useCallback(() => {
    setIsPaymentModalOpen(false);
    setActivePaymentPreset(null);
  }, []);

  const addPoolingReservation = React.useCallback(
    (campaignId: string, quantityKg: number) => {
      const campaign = sandboxState.buyer.campaigns.find((c) => c.id === campaignId);
      const commodity = campaign ? campaign.commodity : 'Bawang Merah Srikayangan Super A';
      const pricePerKg = campaign ? campaign.pooledPricePerKg : 31000;
      const grossAmountRp = quantityKg * pricePerKg;
      const buyerServiceFeeRp = Math.round(grossAmountRp * 0.003);
      const merchantFeeRp = Math.round(grossAmountRp * 0.005);
      const totalPayableRp = grossAmountRp + buyerServiceFeeRp;

      const reservationId = `RSV-SBX-${Date.now().toString().slice(-4)}`;
      const invoiceId = `INV-${reservationId}`;
      const vaNumber = `988810${Math.floor(10000000 + Math.random() * 90000000)}`;

      const newReservation = {
        reservationId,
        campaignId,
        commodity,
        quantityKg,
        amountRp: grossAmountRp,
        vaNumber,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
      };

      const newInvoice: SandboxInvoice = {
        invoiceId,
        orderId: reservationId,
        grossAmountRp,
        buyerServiceFeeRp,
        merchantFeeRp,
        totalPayableRp,
        paymentMethod: 'BPD_DIY',
        vaNumber,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      setSandboxState((prev) => {
        const nextCampaigns = prev.buyer.campaigns.map((c) => {
          if (c.id === campaignId) {
            const nextKg = Math.min(c.targetQuotaKg, c.currentCollectedKg + quantityKg);
            return {
              ...c,
              currentCollectedKg: nextKg,
              participantsCount: c.participantsCount + 1,
              status: nextKg >= c.targetQuotaKg ? ('LOCKED' as const) : c.status,
            };
          }
          return c;
        });

        const next: SandboxState = {
          ...prev,
          buyer: {
            ...prev.buyer,
            campaigns: nextCampaigns,
            reservations: [newReservation, ...prev.buyer.reservations],
          },
          invoices: [newInvoice, ...prev.invoices],
        };

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(next));
        }

        return next;
      });

      return {
        invoiceId,
        vaNumber,
        totalPayableRp,
        grossAmountRp,
      };
    },
    [sandboxState.buyer.campaigns]
  );

  const approveKybSubmission = React.useCallback((tenantId: string) => {
    setSandboxState((prev) => {
      const nextQueue = prev.admin.kybQueue.map((item) =>
        item.tenantId === tenantId ? { ...item, status: 'VERIFIED' as const } : item
      );

      const next: SandboxState = {
        ...prev,
        admin: {
          ...prev.admin,
          kybQueue: nextQueue,
        },
      };

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(next));
      }

      return next;
    });
  }, []);

  const markInvoicePaid = React.useCallback((invoiceId: string) => {
    setSandboxState((prev) => {
      const nextInvoices = prev.invoices.map((inv) =>
        inv.invoiceId === invoiceId ? { ...inv, status: 'PAID' as const } : inv
      );

      const paidInvoice = prev.invoices.find((inv) => inv.invoiceId === invoiceId);
      const nextReservations = prev.buyer.reservations.map((r) =>
        paidInvoice && r.reservationId === paidInvoice.orderId
          ? { ...r, status: 'PAID' as const }
          : r
      );

      const next: SandboxState = {
        ...prev,
        invoices: nextInvoices,
        buyer: {
          ...prev.buyer,
          reservations: nextReservations,
        },
        admin: {
          ...prev.admin,
          escrowLedger: {
            ...prev.admin.escrowLedger,
            totalEscrowHeldRp:
              prev.admin.escrowLedger.totalEscrowHeldRp +
              (paidInvoice ? paidInvoice.totalPayableRp : 0),
          },
        },
      };

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(next));
      }

      return next;
    });
  }, []);

  const value = React.useMemo<SandboxContextValue>(
    () => ({
      isSandboxMode,
      activePersona,
      sandboxState,
      setSandboxMode,
      setPersona,
      resetSandboxData,
      isPaymentModalOpen,
      openPaymentModal,
      closePaymentModal,
      activePaymentPreset,
      addPoolingReservation,
      approveKybSubmission,
      markInvoicePaid,
    }),
    [
      isSandboxMode,
      activePersona,
      sandboxState,
      setSandboxMode,
      setPersona,
      resetSandboxData,
      isPaymentModalOpen,
      openPaymentModal,
      closePaymentModal,
      activePaymentPreset,
      addPoolingReservation,
      approveKybSubmission,
      markInvoicePaid,
    ]
  );

  return <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>;
}
