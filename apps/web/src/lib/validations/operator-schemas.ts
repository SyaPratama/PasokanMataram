import { z } from 'zod';

/**
 * Skema validasi penerbitan akun Operator Hub oleh Super Admin.
 * Mematuhi FR-020 (Closed Logistics Provisioning).
 */
export const createHubOperatorSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
  email: z
    .string()
    .email('Format alamat surel tidak valid')
    .max(120, 'Alamat surel maksimal 120 karakter'),
  phoneNumber: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{7,11}$/, 'Nomor WhatsApp Indonesia tidak valid (misal: 081234567890)'),
  assignedHubId: z
    .string()
    .min(3, 'ID fasilitas hub fisik wajib dipilih')
    .max(50, 'ID fasilitas hub tidak valid'),
  microRole: z.enum(['OPERATOR_QC', 'SUPERVISOR_HUB'], {
    errorMap: () => ({ message: 'Wewenang wajib OPERATOR_QC atau SUPERVISOR_HUB' }),
  }),
});

export type CreateHubOperatorInput = z.infer<typeof createHubOperatorSchema>;

/**
 * Skema validasi aktivasi mandiri akun operator menggunakan token 24 jam.
 */
export const activateOperatorSchema = z.object({
  token: z
    .string()
    .min(32, 'Token aktivasi tidak sah atau tidak lengkap'),
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter')
    .regex(/[A-Z]/, 'Kata sandi wajib mengandung huruf besar')
    .regex(/[a-z]/, 'Kata sandi wajib mengandung huruf kecil')
    .regex(/[0-9]/, 'Kata sandi wajib mengandung angka')
    .regex(/[^A-Za-z0-9]/, 'Kata sandi wajib mengandung karakter khusus'),
});

export type ActivateOperatorInput = z.infer<typeof activateOperatorSchema>;
