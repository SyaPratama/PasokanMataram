'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function PreFooterCtaSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden min-h-[340px] md:min-h-[380px] flex items-center justify-center p-8 sm:p-14 text-center shadow-md bg-primer-deep"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/cta/agricultural-landscape.webp"
              alt="Suasana dapur kuliner dan bahan pangan segar D.I. Yogyakarta"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center brightness-[0.7] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-primer-darkest/80 backdrop-blur-[1px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white/90 backdrop-blur-sm border border-white/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-aksen" />
              Ekosistem Kuliner &amp; Supplier Pangan D.I. Yogyakarta
            </span>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white font-heading tracking-tight leading-tight">
              Siap Memulai Efisiensi Pengadaan Dapur Anda?
            </h2>

            <p className="mt-4 text-xs sm:text-sm md:text-base text-white/85 font-body leading-relaxed max-w-xl mx-auto">
              Gabung bersama jaringan dapur kafe, restoran, dan puluhan supplier pangan lokal se-D.I. Yogyakarta. Pendaftaran gratis dan proses verifikasi legalitas 1x24 jam.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-xs sm:text-sm font-bold font-heading rounded-full bg-sekunder text-white hover:bg-sekunder-hover shadow-lg transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white min-h-[44px]"
              >
                Daftar Kemitraan Sekarang
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                href="/buyer/legalitas"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-full bg-white/15 text-white hover:bg-white/25 border border-white/25 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-white min-h-[44px]"
              >
                Lanjutkan Verifikasi Berkas
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
