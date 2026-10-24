export interface FacilityDetail {
  id: string;
  badge: string;
  title: string;
  image: string;
  summary: string;
  sopSteps: string[];
  specs: { label: string; value: string }[];
}

export const FACILITIES: FacilityDetail[] = [
  {
    id: 'transit-hub',
    badge: 'Sentra Sortir Bantul',
    title: 'Hub Transit & Sortir Fisik Terpadu',
    image: '/images/solutions/transit-hub.webp',
    summary:
      'Fasilitas sentral seluas 1.200 m\u00B2 di Sewon Bantul yang dilengkapi ruang pendingin pra-distribusi, meja sortir grade A, dan stasiun uji petik kadar air instan.',
    sopSteps: [
      'Pemeriksaan visual kebersihan, keutuhan, dan kesegaran bahan pangan dari supplier mitra.',
      'Uji petik kadar air menggunakan moisture meter digital untuk komoditas bawang merah dan cabai rawit.',
      'Sortir 3-tahap memisahkan Grade A (standar restoran/hotel) dan Grade B (industri olahan).',
      'Pra-pendinginan di cold-room suhu 8-12\u00B0C sebelum dimuat ke armada cold-chain pengiriman.',
    ],
    specs: [
      { label: 'Kapasitas Harian', value: '15 Ton Komoditas' },
      { label: 'Suhu Cold-Room', value: '8\u00B0C \u2013 12\u00B0C Terkontrol' },
      { label: 'Radius Distribusi', value: 'Seluruh Wilayah DIY (< 45 Menit)' },
    ],
  },
  {
    id: 'qc-lab',
    badge: 'Presisi Digital',
    title: 'Kalibrasi Timbangan Presisi & Slip Digital',
    image: '/images/solutions/qc-lab.webp',
    summary:
      'Stasiun timbangan digital industri tersertifikasi Metrologi yang terintegrasi langsung dengan kontrak PO digital, mengeliminasi selisih timbangan antara supplier dan dapur.',
    sopSteps: [
      'Kalibrasi timbangan berkala sesuai standar Balai Standardisasi Metrologi Legal D.I. Yogyakarta.',
      'Pencatatan berat netto otomatis secara digital tanpa input manual manusia (zero human error).',
      'Pencetakan slip timbang ber-QR code unik yang ditempel pada setiap peti muatan sayur dan bumbu.',
      'Penyelarasan data timbangan real-time ke aplikasi PWA tablet koki untuk validasi penerimaan barang.',
    ],
    specs: [
      { label: 'Toleransi Deviasi', value: '< 0.05% (Standar Metrologi)' },
      { label: 'Kecepatan Timbang', value: '10 Detik per Peti Muatan' },
      { label: 'Pencatatan Data', value: 'Auto-sync ke Database RLS' },
    ],
  },
  {
    id: 'field-harvest',
    badge: 'Kemitraan Pemasok',
    title: 'Kemitraan Supplier Pangan Resmi & Kontrak Pasokan',
    image: '/images/solutions/field-harvest.webp',
    summary:
      'Kontrak pasokan langsung bersama peternakan unggas, RPH daging, koperasi susu, dan produsen pangan terdaftar di D.I. Yogyakarta.',
    sopSteps: [
      'Verifikasi legalitas supplier melalui NIB OSS dan sertifikasi mutu resmi pangan.',
      'Penyusunan jadwal suplai berkala untuk menjaga stabilitas stok dapur restoran.',
      'Penetapan harga dasar berkeadilan yang melindungi supplier dan memberikan efisiensi bagi dapur.',
      'Sistem pembayaran escrow terproteksi dengan pencairan dana otomatis pasca konfirmasi serah-terima koki.',
    ],
    specs: [
      { label: 'Sentra Pemasok', value: 'Turi, Segoroyoso, Kaliurang, Sentolo' },
      { label: 'Jaminan Kontrak', value: 'Forward Supply Contract' },
      { label: 'Kepastian Dana', value: 'Rekening Bersama Escrow T+0' },
    ],
  },
  {
    id: 'garansi-mutu',
    badge: 'Garansi Mutu',
    title: 'Jaminan Penggantian Barang Busuk & Kendala Pengiriman',
    image: '/images/solutions/garansi-mutu.webp',
    summary:
      'Garansi penuh untuk setiap pengiriman komoditas. Jika barang tiba dalam kondisi busuk, rusak, atau terjadi kendala selama perjalanan, kami ganti sepenuhnya tanpa biaya tambahan.',
    sopSteps: [
      'Pemeriksaan bersama saat kurir tiba di dapur restoran bersama staf koki penerima.',
      'Pencatatan foto dan bobot komoditas yang mengalami penurunan grade atau busuk di aplikasi PWA.',
      'Penggantian barang dikirim ulang pada slot distribusi darurat hari yang sama.',
      'Penyesuaian nilai tagihan otomatis pada rekening escrow bersama jika stok pengganti tidak tersedia.',
    ],
    specs: [
      { label: 'Waktu Klaim', value: 'Maks 2 Jam Pasca Serah-Terima' },
      { label: 'Kompensasi', value: '100% Penggantian Fisik / Refund Escrow' },
      { label: 'Biaya Retur', value: 'Gratis Bebas Biaya Kirim Ulang' },
    ],
  },
];
