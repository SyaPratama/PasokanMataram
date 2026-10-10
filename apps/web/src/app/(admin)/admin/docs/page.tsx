'use client';

import * as React from 'react';
import { FileText, ShieldCheck, Code, Layers, BookOpen, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DocSection {
  title: string;
  category: string;
  summary: string;
  docPath: string;
}

const DOCS_LIST: DocSection[] = [
  {
    title: 'Konstitusi PasokMataram v1.9.0',
    category: 'Tata Kelola Platform',
    summary: '15 Prinsip utama arsitektur, isolasi data per tenant, kontrak antrean fail-fast, dan nol toleransi emoji.',
    docPath: '.specify/memory/constitution.md',
  },
  {
    title: 'Desain Sistem & Token Palet Alam Mataram',
    category: 'UI/UX & Aksesibilitas',
    summary: 'Rasio kontras WCAG 2.1 AA, palet primer Daun Tropis (#2E5339), dan token @pasok/config.',
    docPath: '.specify/memory/design.md',
  },
  {
    title: 'Spesifikasi OpenAPI 3.1 & Skema Validasi Zod',
    category: 'Integrasi API',
    summary: 'Kontrak endpoint onboarding KYB, MinIO presigned URL, registrasi tenant, dan alokasi truk hub.',
    docPath: 'contracts/openapi.yaml',
  },
  {
    title: 'Protokol Redlock & PostgreSQL Row-Level Security',
    category: 'Keamanan Data',
    summary: 'Implementasi session context app.current_tenant_id dan mutex locking pada mutasi kas escrow.',
    docPath: 'packages/database/src/tenant-context.ts',
  },
];

/**
 * Halaman Dokumentasi Tata Kelola Platform & Standar Rekayasa Perangkat Lunak PasokMataram.
 */
export default function AdminDocsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Dokumentasi Resmi Terpusat</Badge>
            <span className="text-xs text-gelap/60">Arsitektur Monorepo Turborepo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Pusat Dokumentasi Platform &amp; Tata Kelola
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Dokumentasi prinsip konstitusi, spesifikasi antrean asinkron, dan panduan audit kepatuhan KYB DIY.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCS_LIST.map((doc) => (
          <div
            key={doc.title}
            className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-primer uppercase tracking-wider">{doc.category}</span>
                <h2 className="text-sm font-bold text-gelap font-heading mt-0.5">{doc.title}</h2>
              </div>
              <Badge variant="outline">{doc.docPath.split('/').pop()}</Badge>
            </div>

            <p className="text-xs text-gelap/85 leading-relaxed">{doc.summary}</p>

            <div className="pt-2 border-t border-netral-border/60 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-gelap/60 truncate max-w-xs">{doc.docPath}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`Membuka rujukan berkas: ${doc.docPath}`)}
                className="text-xs"
              >
                Baca Referensi
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
