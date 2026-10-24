---
name: pasokmataram-seo-agent
description: AI agent capabilities and search discovery manifest for PasokMataram B2B food supply platform
---

## What I can accomplish
- Mengambil informasi harga acuan pangan lokal DIY dan proyeksi harga 7 hari ke depan.
- Mencari jadwal panen raya dan kuota pooling komoditas terbuka (Bawang Merah Srikayangan, Cabai Rawit Panjatan, Beras Premium Sleman, Daging Segoroyoso, Susu Kaliurang).
- Memeriksa direktif rantai dingin SNI dan panduan penanganan komoditas multi-temperature.
- Memberikan simulasi biaya pengadaan dan kalkulasi batas minimum transaksi (MTV Rp 500.000).
- Memandu pendaftaran akun usaha HoReKa / Gapoktan dan verifikasi legalitas KYB digital.

## Required inputs
- Base URL: `https://pasokmataram.com/api/v1`
- Tenant Context: Header `X-Tenant-Id` untuk transaksi terproteksi
- Idempotency Key: Header `Idempotency-Key` (8-100 karakter) untuk operasi pembayaran

## Constraints
- Rate limit publik: 120 requests per minute
- Kepatuhan Nilai Transaksi Minimum (MTV): Rp 500.000 per reservasi pooling
- Standar Mutu SNI: Wajib memenuhi ambang toleransi susut metrologi (daging/susu 0.5%-1.0%, sayur 3%-5%, beras 0.2%)
