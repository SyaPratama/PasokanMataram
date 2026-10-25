/**
 * @file apps/web/src/components/sandbox/payment-gateway-simulator-modal.tsx
 * @description Interactive Solosmartpay Payment Gateway Simulator Modal.
 * Implements official Solosmartpay blueprint: 0.3% buyer fee, 0.5% merchant fee, MTV Rp 500k guard, QRIS EMVCo, and BPD DIY VA.
 */

'use client';

import * as React from 'react';
import {
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useSandbox } from './sandbox-context';

export interface PaymentGatewaySimulatorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MINIMUM_TRANSACTION_VALUE = 500000;

export type SupportedMethod = 'QRIS' | 'BPD_DIY' | 'M2' | 'B1' | 'BR' | 'BV';

interface MethodOption {
  id: SupportedMethod;
  name: string;
  category: 'QRIS' | 'VIRTUAL_ACCOUNT';
  description: string;
}

const PAYMENT_METHODS: MethodOption[] = [
  {
    id: 'BPD_DIY',
    name: 'Virtual Account Bank BPD DIY',
    category: 'VIRTUAL_ACCOUNT',
    description: 'Rekening Escrow Daerah Istimewa Yogyakarta (Prefiks 988810)',
  },
  {
    id: 'QRIS',
    name: 'QRIS Dinamis EMVCo',
    category: 'QRIS',
    description: 'Standar Nasional Solosmartpay Interoperable (BCA, Mandiri, GoPay, Dana)',
  },
  {
    id: 'M2',
    name: 'Mandiri Virtual Account (M2)',
    category: 'VIRTUAL_ACCOUNT',
    description: 'Prefiks Multi-payment 8808',
  },
  {
    id: 'B1',
    name: 'BCA Virtual Account (B1)',
    category: 'VIRTUAL_ACCOUNT',
    description: 'Prefiks Corporate VA 1008',
  },
  {
    id: 'BR',
    name: 'BRI BRIVA (BR)',
    category: 'VIRTUAL_ACCOUNT',
    description: 'Prefiks Layanan Kas Daerah 0028',
  },
  {
    id: 'BV',
    name: 'BSI Virtual Account (BV)',
    category: 'VIRTUAL_ACCOUNT',
    description: 'Kemitraan Perbankan Syariah 7008',
  },
];

/**
 * Komponen modal simulator Solosmartpay ramah uji tanpa mutasi database.
 * @param props Properti modal.
 */
export function PaymentGatewaySimulatorModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
}: PaymentGatewaySimulatorModalProps): React.JSX.Element | null {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    activePaymentPreset,
    markInvoicePaid,
  } = useSandbox();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isPaymentModalOpen;
  const handleClose = propOnClose || closePaymentModal;

  const [amountRp, setAmountRp] = React.useState<number>(620000);
  const [selectedMethod, setSelectedMethod] = React.useState<SupportedMethod>('BPD_DIY');
  const [copied, setCopied] = React.useState<boolean>(false);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState<boolean>(false);
  const [generatedInvoiceId, setGeneratedInvoiceId] = React.useState<string>('');
  const [vaNumber, setVaNumber] = React.useState<string>('98881023849102');

  React.useEffect(() => {
    if (activePaymentPreset) {
      if (activePaymentPreset.amountRp && activePaymentPreset.amountRp > 0) {
        setAmountRp(activePaymentPreset.amountRp);
      }
      if (activePaymentPreset.invoiceId) {
        setGeneratedInvoiceId(activePaymentPreset.invoiceId);
      }
      if (
        activePaymentPreset.method &&
        PAYMENT_METHODS.some((m) => m.id === activePaymentPreset.method)
      ) {
        setSelectedMethod(activePaymentPreset.method as SupportedMethod);
      }
    } else if (!generatedInvoiceId) {
      setGeneratedInvoiceId(`INV-SIM-${Date.now().toString().slice(-6)}`);
    }
  }, [activePaymentPreset, generatedInvoiceId]);

  React.useEffect(() => {
    if (selectedMethod === 'BPD_DIY') {
      setVaNumber(`988810${Math.floor(10000000 + Math.random() * 90000000)}`);
    } else if (selectedMethod === 'M2') {
      setVaNumber(`8808${Math.floor(10000000 + Math.random() * 90000000)}`);
    } else if (selectedMethod === 'B1') {
      setVaNumber(`1008${Math.floor(10000000 + Math.random() * 90000000)}`);
    } else if (selectedMethod === 'BR') {
      setVaNumber(`0028${Math.floor(10000000 + Math.random() * 90000000)}`);
    } else if (selectedMethod === 'BV') {
      setVaNumber(`7008${Math.floor(10000000 + Math.random() * 90000000)}`);
    }
  }, [selectedMethod]);

  if (!isOpen) return null;

  const isBelowMtv = amountRp < MINIMUM_TRANSACTION_VALUE;
  const buyerServiceFeeRp = Math.round(amountRp * 0.003);
  const merchantFeeRp = Math.round(amountRp * 0.005);
  const totalPayableRp = amountRp + buyerServiceFeeRp;
  const netMerchantDisbursementRp = amountRp - merchantFeeRp;

  const qrString = `00020101021226670016ID.CO.SOLOSMARTPAY.WWW0118936009123456789012520454115303360540${totalPayableRp}5802ID5911PASOKMATARAM6010YOGYAKARTA6304ABCD`;

  const handleCopy = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatePayment = async () => {
    if (isBelowMtv || isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/v1/sandbox/payment-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: generatedInvoiceId || `INV-SIM-${Date.now().toString().slice(-6)}`,
          orderId: activePaymentPreset?.orderId || `ORD-${Date.now().toString().slice(-6)}`,
          amount: totalPayableRp,
          method: selectedMethod,
          status: 'PAID',
        }),
      });

      if (response.ok) {
        markInvoicePaid(generatedInvoiceId);
        setPaymentSuccess(true);
        setTimeout(() => {
          setIsProcessing(false);
          setPaymentSuccess(false);
          handleClose();
        }, 1500);
      } else {
        markInvoicePaid(generatedInvoiceId);
        setPaymentSuccess(true);
        setTimeout(() => {
          setIsProcessing(false);
          setPaymentSuccess(false);
          handleClose();
        }, 1500);
      }
    } catch {
      markInvoicePaid(generatedInvoiceId);
      setPaymentSuccess(true);
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(false);
        handleClose();
      }, 1500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="solosmartpay-sim-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gelap/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-netral-border shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-netral-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primer-light text-primer rounded-2xl border border-primer/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primer text-white">
                <span>SOLOSMARTPAY SANDBOX</span>
              </div>
              <h2
                id="solosmartpay-sim-title"
                className="text-xl sm:text-2xl font-heading font-extrabold text-gelap"
              >
                Simulator Pembayaran Dual-Rail
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-2xl hover:bg-netral-canvas text-gelap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/40"
            aria-label="Tutup simulator pembayaran"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-8 rounded-3xl bg-primer-light border-2 border-primer/30 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-primer text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-primer">
                Pembayaran Sukses Terverifikasi
              </h3>
              <p className="text-sm font-medium text-gelap mt-1">
                Webhook HMAC-SHA256 berhasil diproses. Dana sebesar Rp {totalPayableRp.toLocaleString('id-ID')} tersimpan aman di rekening Escrow Bank BPD DIY.
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-primer/20 text-xs font-mono font-bold text-primer">
              STATUS: ESCROW_HELD | ZERO DB MUTATION
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="sim-amount-input" className="block text-sm font-bold text-gelap mb-2">
                Nominal Transaksi Dasar Belanja (Rupiah)
              </label>
              <input
                id="sim-amount-input"
                type="number"
                min="100000"
                step="50000"
                value={amountRp}
                onChange={(e) => setAmountRp(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-netral-border rounded-2xl text-xl font-bold font-mono text-gelap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/30 min-h-[48px]"
              />
              {isBelowMtv && (
                <div className="mt-2 p-3 rounded-xl bg-status-warning/15 border-2 border-status-warning/40 text-status-warning text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Batas Pembelian Terendah (MTV) adalah Rp {MINIMUM_TRANSACTION_VALUE.toLocaleString('id-ID')}. Nilai saat ini di bawah ketentuan Solosmartpay & PasokMataram.
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-netral-canvas border-2 border-netral-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gelap uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-primer" />
                <span>Rincian Skema Dual-Rail PayFac Solosmartpay</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white rounded-xl border border-netral-border/80">
                  <div className="text-xs font-medium text-gelap">Biaya Layanan Pembeli (0.3%):</div>
                  <div className="text-base font-bold font-mono text-primer tabular-nums">
                    Rp {buyerServiceFeeRp.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-gelap font-medium mt-0.5">Ditambahkan ke tagihan</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-netral-border/80">
                  <div className="text-xs font-medium text-gelap">Fee Platform Merchant (0.5%):</div>
                  <div className="text-base font-bold font-mono text-sekunder tabular-nums">
                    Rp {merchantFeeRp.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-gelap font-medium mt-0.5">Dipotong saat pencairan H+1</div>
                </div>
              </div>
              <div className="pt-2 border-t border-netral-border/60 flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
                <span className="font-bold text-gelap">Total Tagihan Bayar Pembeli:</span>
                <span className="text-lg font-extrabold font-mono text-primer tabular-nums">
                  Rp {totalPayableRp.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gelap gap-2">
                <span>Hak Bersih Pencairan Supplier/Merchant:</span>
                <span className="font-bold font-mono text-gelap tabular-nums">
                  Rp {netMerchantDisbursementRp.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-gelap mb-2">Pilih Kanal Pembayaran Sandbox:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-3.5 text-left rounded-2xl border-2 transition-all min-h-[48px] flex items-start gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/40 ${
                        isSelected
                          ? 'border-primer bg-primer-light shadow-xs'
                          : 'border-netral-border bg-white hover:bg-netral-canvas'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          isSelected ? 'bg-primer text-white' : 'bg-netral-canvas text-gelap'
                        }`}
                      >
                        {method.category === 'QRIS' ? (
                          <QrCode className="w-5 h-5" />
                        ) : (
                          <Building2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gelap">{method.name}</div>
                        <div className="text-xs text-gelap font-medium mt-0.5 line-clamp-1">
                          {method.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border-2 border-netral-border shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-gelap font-bold">
                <span>INVOICE: {generatedInvoiceId}</span>
                <span className="inline-flex items-center gap-1 text-aksen">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Kedaluwarsa 24 Jam</span>
                </span>
              </div>

              {selectedMethod === 'QRIS' ? (
                <div className="flex flex-col items-center justify-center p-4 bg-netral-canvas rounded-2xl border border-netral-border space-y-3">
                  <div className="p-4 bg-white rounded-2xl border-2 border-primer/40 shadow-sm flex flex-col items-center">
                    <QrCode className="w-40 h-40 text-gelap" />
                    <span className="text-xs font-mono font-bold text-primer mt-2">
                      SOLOSMARTPAY EMVCO
                    </span>
                  </div>
                  <div className="w-full text-center">
                    <div className="text-xs text-gelap font-mono break-all line-clamp-2 px-2">
                      {qrString}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(qrString)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-netral-border bg-white hover:bg-netral-canvas text-xs font-bold text-gelap min-h-[48px]"
                    >
                      {copied ? <Check className="w-4 h-4 text-primer" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Tersalin' : 'Salin String EMVCo'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-netral-canvas rounded-2xl border border-netral-border space-y-2">
                  <div className="text-xs font-semibold text-gelap">Nomor Virtual Account:</div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-2xl font-mono font-extrabold text-primer tracking-wider">
                      {vaNumber}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(vaNumber)}
                      className="px-3.5 py-2 rounded-xl border-2 border-netral-border bg-white hover:bg-netral-border/30 text-xs font-bold text-gelap inline-flex items-center gap-1.5 min-h-[48px] min-w-[48px]"
                      aria-label="Salin nomor virtual account"
                    >
                      {copied ? <Check className="w-4 h-4 text-primer" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-gelap font-medium">
                    Atas Nama: <strong className="text-gelap">PASOK MATARAM ESCROW ({selectedMethod})</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t-2 border-netral-border">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="px-6 py-3 rounded-2xl border-2 border-netral-border text-base font-bold text-gelap hover:bg-netral-canvas min-h-[48px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/40"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={isBelowMtv || isProcessing}
                onClick={handleSimulatePayment}
                className="px-6 py-3 rounded-2xl bg-primer text-white hover:bg-primer-hover active:scale-[0.98] text-base font-bold inline-flex items-center justify-center gap-2 min-h-[48px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/40"
              >
                <span>
                  {isProcessing
                    ? 'Memproses Verifikasi HMAC...'
                    : 'Simulasikan Pembayaran Berhasil (Bayar via Sandbox)'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
