import * as React from 'react';
import { Badge } from '../ui/badge';
import type { KybStatus } from '../../types/tenant';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Properti untuk komponen lencana status verifikasi KYB.
 */
interface StatusBadgeProps {
  status: KybStatus;
  className?: string;
}

/**
 * Komponen indikator status verifikasi legalitas usaha mitra PasokMataram.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case 'VERIFIED':
      return (
        <Badge variant="success" className={className}>
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-primer flex-shrink-0" aria-hidden="true" />
          Terverifikasi
        </Badge>
      );
    case 'PENDING_VERIFICATION':
      return (
        <Badge variant="warning" className={className}>
          <Clock className="w-3.5 h-3.5 mr-1 text-aksen-dark flex-shrink-0" aria-hidden="true" />
          Menunggu Verifikasi
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="destructive" className={className}>
          <XCircle className="w-3.5 h-3.5 mr-1 text-status-danger flex-shrink-0" aria-hidden="true" />
          Ditolak
        </Badge>
      );
    case 'UNVERIFIED':
    default:
      return (
        <Badge variant="outline" className={className}>
          Belum Lengkap
        </Badge>
      );
  }
}

