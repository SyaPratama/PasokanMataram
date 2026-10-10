import type { DIYRegency } from '@pasok/domain';

/**
 * Representasi entitas gerai cabang fisik HoReKa.
 */
export interface MockOutlet {
  id: string;
  name: string;
  isMain: boolean;
  regency: DIYRegency;
  streetAddress: string;
  contactPerson: string;
  phone: string;
  latitude: number;
  longitude: number;
  activeOrdersCount: number;
}

/**
 * Representasi entitas pemohon KYB untuk verifikasi kepatuhan.
 */
export interface MockTenantKyb {
  id: string;
  businessName: string;
  tenantType: 'HOREKA' | 'GAPOKTAN';
  regency: DIYRegency;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
  picName: string;
  picEmail: string;
  picPhone: string;
  nibNumber?: string;
  groupCertificateNumber?: string;
  rejectionReason?: string;
  documents: {
    type: string;
    filename: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
}

/**
 * Representasi pesanan rutin bahan baku dapur (Standing Order).
 */
export interface MockStandingOrder {
  id: string;
  commodityName: string;
  outletName: string;
  quantityKg: number;
  unitPriceRp: number;
  totalRp: number;
  deliveryDate: string;
  deliveryTimeWindow: string;
  status: 'TERJADWAL' | 'TERKONFIRMASI' | 'SIAP_KIRIM';
}

/**
 * Representasi komitmen jadwal panen kelompok tani.
 */
export interface MockHarvestCommitment {
  id: string;
  commodityName: string;
  variety: string;
  estimatedHarvestDate: string;
  totalYieldKg: number;
  allocatedQuotaKg: number;
  dropPointHub: string;
  status: 'VERIFIKASI' | 'TERKUNCI' | 'SIAP_SERAH';
}

/**
 * Dataset tiruan gerai cabang fisik HoReKa di D.I. Yogyakarta.
 */
export const MOCK_OUTLETS: MockOutlet[] = [
  {
    id: 'out-001',
    name: 'Dapur Pusat Malioboro',
    isMain: true,
    regency: 'KOTA_YOGYAKARTA',
    streetAddress: 'Jl. Malioboro No. 42, Sosromenduran, Gedong Tengen',
    contactPerson: 'Chef Bambang Suryono',
    phone: '0812-2345-6789',
    latitude: -7.7928,
    longitude: 110.3658,
    activeOrdersCount: 4,
  },
  {
    id: 'out-002',
    name: 'Gerai Cabang Kaliurang KM 9',
    isMain: false,
    regency: 'SLEMAN',
    streetAddress: 'Jl. Kaliurang KM 9.2, Sardonoharjo, Ngaglik',
    contactPerson: 'Mas Joko Prasetyo',
    phone: '0813-9876-5432',
    latitude: -7.7124,
    longitude: 110.4079,
    activeOrdersCount: 2,
  },
  {
    id: 'out-003',
    name: 'Gerai Cabang Bantul Paseban',
    isMain: false,
    regency: 'BANTUL',
    streetAddress: 'Jl. Jenderal Sudirman No. 18, Kurahan, Bantul',
    contactPerson: 'Mbak Siti Aminah',
    phone: '0818-4567-8901',
    latitude: -7.8893,
    longitude: 110.3298,
    activeOrdersCount: 1,
  },
  {
    id: 'out-004',
    name: 'Gerai Cabang Wates Stasiun',
    isMain: false,
    regency: 'KULON_PROGO',
    streetAddress: 'Jl. Stasiun Wates No. 5, Wates, Kulon Progo',
    contactPerson: 'Mas Bagus Nugroho',
    phone: '0819-1234-5678',
    latitude: -7.8576,
    longitude: 110.1584,
    activeOrdersCount: 2,
  },
  {
    id: 'out-005',
    name: 'Gerai Cabang Wonosari Kota',
    isMain: false,
    regency: 'GUNUNGKIDUL',
    streetAddress: 'Jl. Baron KM 1, Baleharjo, Wonosari',
    contactPerson: 'Pak Wahyu Hidayat',
    phone: '0817-6543-2109',
    latitude: -7.9654,
    longitude: 110.6032,
    activeOrdersCount: 0,
  },
];

/**
 * Dataset tiruan tenant pemohon audit verifikasi KYB.
 */
export const MOCK_TENANTS_KYB: MockTenantKyb[] = [
  {
    id: 'tnt-001',
    businessName: 'Restoran Bale Raos Kraton',
    tenantType: 'HOREKA',
    regency: 'KOTA_YOGYAKARTA',
    status: 'VERIFIED',
    submittedAt: '06 Okt 2026, 09:30 WIB',
    picName: 'Raden Mas Haryo',
    picEmail: 'haryo@baleraos.co.id',
    picPhone: '0812-3456-7890',
    nibNumber: '9120003456781',
    documents: [
      {
        type: 'NIB',
        filename: 'nib_bale_raos_2026.pdf',
        fileUrl: '#',
        uploadedAt: '06 Okt 2026',
      },
      {
        type: 'KTP Penanggung Jawab',
        filename: 'ktp_rm_haryo.webp',
        fileUrl: '#',
        uploadedAt: '06 Okt 2026',
      },
    ],
  },
  {
    id: 'tnt-002',
    businessName: 'Gudeg Sagan Yogyakarta',
    tenantType: 'HOREKA',
    regency: 'SLEMAN',
    status: 'PENDING',
    submittedAt: '08 Okt 2026, 14:15 WIB',
    picName: 'Ibu Endang Widyastuti',
    picEmail: 'operasional@gudegsagan.id',
    picPhone: '0813-2233-4455',
    nibNumber: '9120008876542',
    documents: [
      {
        type: 'NIB',
        filename: 'nib_gudeg_sagan_induk.pdf',
        fileUrl: '#',
        uploadedAt: '08 Okt 2026',
      },
      {
        type: 'KTP Penanggung Jawab',
        filename: 'ktp_endang_widyastuti.webp',
        fileUrl: '#',
        uploadedAt: '08 Okt 2026',
      },
    ],
  },
  {
    id: 'tnt-003',
    businessName: 'Gapoktan Srikayangan Makmur',
    tenantType: 'GAPOKTAN',
    regency: 'KULON_PROGO',
    status: 'VERIFIED',
    submittedAt: '05 Okt 2026, 10:00 WIB',
    picName: 'Pak Subardi',
    picEmail: 'subardi@srikayangan.desa.id',
    picPhone: '0815-6677-8899',
    groupCertificateNumber: '520/SK-DISTAN/KP/2024',
    documents: [
      {
        type: 'SK Kelompok Tani',
        filename: 'sk_gapoktan_srikayangan.pdf',
        fileUrl: '#',
        uploadedAt: '05 Okt 2026',
      },
      {
        type: 'KTP Ketua Gapoktan',
        filename: 'ktp_subardi_srikayangan.webp',
        fileUrl: '#',
        uploadedAt: '05 Okt 2026',
      },
    ],
  },
  {
    id: 'tnt-004',
    businessName: 'Gapoktan Tani Mukti Imogiri',
    tenantType: 'GAPOKTAN',
    regency: 'BANTUL',
    status: 'REJECTED',
    submittedAt: '07 Okt 2026, 11:20 WIB',
    picName: 'Pak Marjuki',
    picEmail: 'marjuki@imogiri-tani.org',
    picPhone: '0816-7788-9900',
    groupCertificateNumber: '520/SK-BTL/2023',
    rejectionReason: 'Salinan SK Kelompok Tani terpotong pada lembar tanda tangan pengesahan Dinas Pertanian dan stempel kelurahan tidak terbaca jelas. Mohon unggah ulang salinan utuh halaman 1 s.d. 3.',
    documents: [
      {
        type: 'SK Kelompok Tani',
        filename: 'sk_gapoktan_imogiri_buram.pdf',
        fileUrl: '#',
        uploadedAt: '07 Okt 2026',
      },
      {
        type: 'KTP Ketua Gapoktan',
        filename: 'ktp_marjuki.webp',
        fileUrl: '#',
        uploadedAt: '07 Okt 2026',
      },
    ],
  },
  {
    id: 'tnt-005',
    businessName: 'Hotel Tentrem Yogyakarta Dapur Utama',
    tenantType: 'HOREKA',
    regency: 'KOTA_YOGYAKARTA',
    status: 'VERIFIED',
    submittedAt: '04 Okt 2026, 16:45 WIB',
    picName: 'Executive Chef Hendra',
    picEmail: 'procurement@tentremhotel.com',
    picPhone: '0811-2233-4455',
    nibNumber: '9120001122334',
    documents: [
      {
        type: 'NIB',
        filename: 'nib_tentrem_fnb.pdf',
        fileUrl: '#',
        uploadedAt: '04 Okt 2026',
      },
      {
        type: 'KTP Penanggung Jawab',
        filename: 'ktp_hendra_procurement.webp',
        fileUrl: '#',
        uploadedAt: '04 Okt 2026',
      },
    ],
  },
];

/**
 * Dataset tiruan pesanan rutin bahan baku dapur HoReKa.
 */
export const MOCK_STANDING_ORDERS: MockStandingOrder[] = [
  {
    id: 'PO-20261009-01',
    commodityName: 'Bawang Merah Srikayangan Gred A',
    outletName: 'Dapur Pusat Malioboro',
    quantityKg: 60,
    unitPriceRp: 26000,
    totalRp: 1560000,
    deliveryDate: 'Besok Subuh, 09 Okt 2026',
    deliveryTimeWindow: '04:00 - 05:00 WIB',
    status: 'TERJADWAL',
  },
  {
    id: 'PO-20261009-02',
    commodityName: 'Cabai Rawit Merah Imogiri Pedas',
    outletName: 'Dapur Pusat Malioboro',
    quantityKg: 25,
    unitPriceRp: 34000,
    totalRp: 850000,
    deliveryDate: 'Besok Subuh, 09 Okt 2026',
    deliveryTimeWindow: '04:15 - 05:00 WIB',
    status: 'TERJADWAL',
  },
  {
    id: 'PO-20261009-03',
    commodityName: 'Beras Mentik Wangi Sleman Organik',
    outletName: 'Gerai Cabang Kaliurang KM 9',
    quantityKg: 150,
    unitPriceRp: 15500,
    totalRp: 2325000,
    deliveryDate: 'Sabtu, 10 Okt 2026',
    deliveryTimeWindow: '05:00 - 06:00 WIB',
    status: 'TERKONFIRMASI',
  },
  {
    id: 'PO-20261009-04',
    commodityName: 'Bawang Merah Srikayangan Gred B',
    outletName: 'Gerai Cabang Bantul Paseban',
    quantityKg: 35,
    unitPriceRp: 22000,
    totalRp: 770000,
    deliveryDate: 'Senin, 12 Okt 2026',
    deliveryTimeWindow: '04:30 - 05:30 WIB',
    status: 'TERKONFIRMASI',
  },
];

/**
 * Dataset tiruan komitmen panen kelompok tani mitra.
 */
export const MOCK_HARVEST_COMMITMENTS: MockHarvestCommitment[] = [
  {
    id: 'HV-202610-01',
    commodityName: 'Bawang Merah Pasir Srikayangan',
    variety: 'Varietas Tajuk Super',
    estimatedHarvestDate: '12 Okt 2026',
    totalYieldKg: 1500,
    allocatedQuotaKg: 1200,
    dropPointHub: 'Sentra Hub Kulon Progo (Sentolo)',
    status: 'TERKUNCI',
  },
  {
    id: 'HV-202610-02',
    commodityName: 'Cabai Rawit Merah Lahan Pasir',
    variety: 'Varietas Ori 212',
    estimatedHarvestDate: '15 Okt 2026',
    totalYieldKg: 650,
    allocatedQuotaKg: 500,
    dropPointHub: 'Sentra Hub Bantul (Srandakan)',
    status: 'SIAP_SERAH',
  },
  {
    id: 'HV-202610-03',
    commodityName: 'Bawang Merah Brebes Masuk Yogya',
    variety: 'Varietas Bima Brebes Adaptasi',
    estimatedHarvestDate: '20 Okt 2026',
    totalYieldKg: 2000,
    allocatedQuotaKg: 800,
    dropPointHub: 'Sentra Hub Sleman (Prambanan)',
    status: 'VERIFIKASI',
  },
];

/**
 * Representasi entitas komoditas pangan segar unggulan D.I. Yogyakarta.
 */
export interface MockCommodity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly originDistrict: string;
  readonly originRegency: DIYRegency;
  readonly basePricePerKg: number;
  readonly grade: string;
  readonly harvestedFrequency: string;
}

/**
 * Dataset tiruan 6 komoditas unggulan pertanian D.I. Yogyakarta.
 */
export const MOCK_COMMODITIES: readonly MockCommodity[] = [
  {
    id: 'cmd-001',
    name: 'Bawang Merah Srikayangan Super',
    description: 'Bawang merah varietas Tajuk dari lahan pasir pesisir Kulon Progo beraroma tajam dan susut rendah.',
    originDistrict: 'Panjatan & Sentolo',
    originRegency: 'KULON_PROGO',
    basePricePerKg: 31000,
    grade: 'Grade A Super (>2.5 cm)',
    harvestedFrequency: 'Panen Tiap Selasa & Jumat',
  },
  {
    id: 'cmd-002',
    name: 'Cabai Rawit Merah Panjatan Segar',
    description: 'Cabai rawit merah petik harian pesisir pantai Kulon Progo dengan tingkat kepedasan optimal.',
    originDistrict: 'Panjatan',
    originRegency: 'KULON_PROGO',
    basePricePerKg: 46500,
    grade: 'Grade A (Segar Bebas Busuk)',
    harvestedFrequency: 'Petik Harian Pukul 06:00',
  },
  {
    id: 'cmd-003',
    name: 'Beras Pandan Wangi Seyegan',
    description: 'Beras aromatik premium hasil gilingan segar mingguan Gabungan Kelompok Tani Sleman Barat.',
    originDistrict: 'Seyegan & Minggir',
    originRegency: 'SLEMAN',
    basePricePerKg: 15500,
    grade: 'Premium (Pecah Butir <5%)',
    harvestedFrequency: 'Giling Segar Tiap Pekan',
  },
  {
    id: 'cmd-004',
    name: 'Bawang Merah Organik Nawungan',
    description: 'Bawang merah organik lereng perbukitan Imogiri Bantul yang dibudidayakan tanpa residu kimia sintetis.',
    originDistrict: 'Imogiri',
    originRegency: 'BANTUL',
    basePricePerKg: 38000,
    grade: 'Organik Bersertifikat',
    harvestedFrequency: 'Panen Tiap Pekan',
  },
  {
    id: 'cmd-005',
    name: 'Kopi Robusta Lereng Merapi',
    description: 'Biji kopi pilihan petik merah perkebunan lereng Gunung Merapi dengan notes nutty dan chocolate.',
    originDistrict: 'Cangkringan & Pakem',
    originRegency: 'SLEMAN',
    basePricePerKg: 85000,
    grade: 'Specialty Grade 1',
    harvestedFrequency: 'Proses Pasca Panen Basah',
  },
  {
    id: 'cmd-006',
    name: 'Kedelai Hitam Mallika Gunungkidul',
    description: 'Kedelai hitam unggul bahan baku kecap premium dan olahan fermentasi gurih dari lahan karst.',
    originDistrict: 'Wonosari & Playen',
    originRegency: 'GUNUNGKIDUL',
    basePricePerKg: 19000,
    grade: 'Grade A Super',
    harvestedFrequency: 'Stok Terjaga Hub Transit',
  },
];

