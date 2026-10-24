export type RegencyCode = 'KULON_PROGO' | 'BANTUL' | 'SLEMAN' | 'GUNUNGKIDUL' | 'YOGYAKARTA';

export interface KomoditasItem {
  id: string;
  nama: string;
  sentra: string;
  kabupaten: RegencyCode;
  kabupatenNama: string;
  hargaEstimasi: string;
  satuan: string;
  kuotaTerkumpul: number;
  kuotaTarget: number;
  jadwalPanen: string;
  standarMutu: string;
}

export const DATA_KOMODITAS: KomoditasItem[] = [
  {
    id: 'k-1',
    nama: 'Bawang Merah Srikayangan',
    sentra: 'Kapanewon Sentolo & Panjatan',
    kabupaten: 'KULON_PROGO',
    kabupatenNama: 'Kulon Progo',
    hargaEstimasi: 'Rp 24.500',
    satuan: 'kg',
    kuotaTerkumpul: 850,
    kuotaTarget: 1000,
    jadwalPanen: 'Panen Tiap Selasa & Jumat',
    standarMutu: 'Grade A, diameter >2.5 cm, kadar air <80%',
  },
  {
    id: 'k-2',
    nama: 'Cabai Rawit Merah Panjatan',
    sentra: 'Pesisir Pantai Selatan',
    kabupaten: 'KULON_PROGO',
    kabupatenNama: 'Kulon Progo',
    hargaEstimasi: 'Rp 36.000',
    satuan: 'kg',
    kuotaTerkumpul: 420,
    kuotaTarget: 500,
    jadwalPanen: 'Petik Harian Pukul 06:00',
    standarMutu: 'Segar petik pagi, tangkai utuh, bebas busuk',
  },
  {
    id: 'k-3',
    nama: 'Beras Premium Sleman (Rojolele / Mentik)',
    sentra: 'Seyegan & Minggir',
    kabupaten: 'SLEMAN',
    kabupatenNama: 'Sleman',
    hargaEstimasi: 'Rp 14.800',
    satuan: 'kg',
    kuotaTerkumpul: 2400,
    kuotaTarget: 3000,
    jadwalPanen: 'Giling Segar Mingguan',
    standarMutu: 'Beras kepala min 95%, derajat sosoh 100%',
  },
  {
    id: 'k-4',
    nama: 'Bawang Merah Organik Nawungan',
    sentra: 'Lembah Nawungan, Selopamioro',
    kabupaten: 'BANTUL',
    kabupatenNama: 'Bantul',
    hargaEstimasi: 'Rp 28.000',
    satuan: 'kg',
    kuotaTerkumpul: 600,
    kuotaTarget: 800,
    jadwalPanen: 'Siklus Panen Semi-Organik',
    standarMutu: 'Bebas pestisida sintetis, aroma tajam',
  },
  {
    id: 'k-5',
    nama: 'Kopi Arabika Lereng Merapi',
    sentra: 'Pakem & Cangkringan',
    kabupaten: 'SLEMAN',
    kabupatenNama: 'Sleman',
    hargaEstimasi: 'Rp 115.000',
    satuan: 'kg green bean',
    kuotaTerkumpul: 180,
    kuotaTarget: 250,
    jadwalPanen: 'Full Wash / Natural Process',
    standarMutu: 'Defect <8%, petik merah 95%',
  },
  {
    id: 'k-6',
    nama: 'Kedelai Hitam Mallika Gunungkidul',
    sentra: 'Playen & Ponjong',
    kabupaten: 'GUNUNGKIDUL',
    kabupatenNama: 'Gunungkidul',
    hargaEstimasi: 'Rp 16.500',
    satuan: 'kg',
    kuotaTerkumpul: 1200,
    kuotaTarget: 1500,
    jadwalPanen: 'Panen Musim Kemarau',
    standarMutu: 'Biji utuh, kadar air <13%, non-GMO lokal',
  },
  {
    id: 'k-7',
    nama: 'Sayur Hidroponik Kota Gede (Selada & Pakcoy)',
    sentra: 'Kemantren Kotagede & Mergangsan',
    kabupaten: 'YOGYAKARTA',
    kabupatenNama: 'Kota Yogyakarta',
    hargaEstimasi: 'Rp 18.000',
    satuan: 'kg',
    kuotaTerkumpul: 310,
    kuotaTarget: 400,
    jadwalPanen: 'Panen Harian 05:00 WIB',
    standarMutu: 'Bebas pestisida, daun renyah tanpa layu',
  },
  {
    id: 'k-8',
    nama: 'Ayam Broiler Karkas Segar Turi (NKV-1)',
    sentra: 'Peternakan Turi & Pakem',
    kabupaten: 'SLEMAN',
    kabupatenNama: 'Sleman',
    hargaEstimasi: 'Rp 36.000',
    satuan: 'ekor (1kg)',
    kuotaTerkumpul: 1450,
    kuotaTarget: 1800,
    jadwalPanen: 'Potong Subuh 03:00 WIB',
    standarMutu: 'Halal BPJPH, NKV-1, Chiller 4°C tanpa jeroan',
  },
  {
    id: 'k-9',
    nama: 'Daging Sapi Gandik Segoroyoso Halal',
    sentra: 'Sentra Jagal RPH Segoroyoso',
    kabupaten: 'BANTUL',
    kabupatenNama: 'Bantul',
    hargaEstimasi: 'Rp 135.000',
    satuan: 'kg',
    kuotaTerkumpul: 520,
    kuotaTarget: 700,
    jadwalPanen: 'Jagal Segar Subuh Harian',
    standarMutu: 'JULEHA Halal, RPH Higienis, bebas pengawet',
  },
  {
    id: 'k-10',
    nama: 'Susu Sapi Murni Pasteurisasi Kaliurang',
    sentra: 'Koperasi Kaliurang Mandiri',
    kabupaten: 'SLEMAN',
    kabupatenNama: 'Sleman',
    hargaEstimasi: 'Rp 17.000',
    satuan: 'liter',
    kuotaTerkumpul: 800,
    kuotaTarget: 1000,
    jadwalPanen: 'Pemerahan Pagi 05:30 WIB',
    standarMutu: 'LTLT 63°C, Fat 3.8%, SKP BPOM resmi',
  },
];

export type RegencyFilter = 'SEMUA' | RegencyCode;

export const DAFTAR_WILAYAH: { value: RegencyFilter; label: string }[] = [
  { value: 'SEMUA', label: 'Semua Wilayah (D.I. Yogyakarta)' },
  { value: 'KULON_PROGO', label: 'Kabupaten Kulon Progo' },
  { value: 'BANTUL', label: 'Kabupaten Bantul' },
  { value: 'SLEMAN', label: 'Kabupaten Sleman' },
  { value: 'GUNUNGKIDUL', label: 'Kabupaten Gunungkidul' },
  { value: 'YOGYAKARTA', label: 'Kota Yogyakarta' },
];
