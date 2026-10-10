import argon2 from 'argon2';

/**
 * Melakukan hashing kata sandi menggunakan algoritma Argon2id berstandar OWASP.
 * Dijalankan eksklusif pada runtime server (Node.js).
 * @param password Kata sandi teks murni.
 * @returns Hash string Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Memvalidasi kesesuaian kata sandi terhadap hash tersimpan.
 * Dijalankan eksklusif pada runtime server (Node.js).
 * @param hash Hash Argon2id dari basis data.
 * @param plainPassword Kata sandi masukan pengguna.
 * @returns Boolean keabsahan kata sandi.
 */
export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    return false;
  }
}
