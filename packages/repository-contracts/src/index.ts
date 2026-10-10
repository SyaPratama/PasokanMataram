import {
  Tenant,
  TenantId,
  User,
  UserId,
  HubOperator,
  OperatorId,
  CrossDockHub,
  HubId,
  MacroRole,
} from '@pasok/domain';

/**
 * Kontrak Port Repositori Generik untuk persistensi entitas domain.
 * Mematuhi arsitektur Repository Pattern DDD dan Konstitusi Prinsip IV.
 */
export interface IRepository<T, TId> {
  /**
   * Menemukan entitas berdasarkan identitas primernya.
   * @param id Identitas entitas domain.
   */
  findById(id: TId): Promise<T | null>;

  /**
   * Menyimpan entitas baru ke media persistensi.
   * @param entity Entitas domain yang akan disimpan.
   */
  save(entity: T): Promise<void>;

  /**
   * Memperbarui data entitas yang telah ada.
   * @param entity Entitas domain dengan pembaruan status/nilai.
   */
  update(entity: T): Promise<void>;

  /**
   * Menghapus entitas berdasarkan ID.
   * @param id Identitas entitas yang dihapus.
   */
  delete(id: TId): Promise<void>;
}

/**
 * Port Repositori Entitas Tenant dengan isolasi baris multi-tenant.
 */
export interface ITenantRepository extends IRepository<Tenant, TenantId> {
  /**
   * Mencari tenant berdasarkan nama bisnis resmi.
   * @param businessName Nama legal badan usaha.
   */
  findByBusinessName(businessName: string): Promise<Tenant | null>;

  /**
   * Mengambil daftar tenant berdasarkan Macro-Role tertentu.
   * @param macroRole Kategori macro entitas bisnis.
   */
  findByMacroRole(macroRole: MacroRole): Promise<readonly Tenant[]>;
}

/**
 * Port Repositori Pengguna Akun dan Kredensial.
 */
export interface IUserRepository extends IRepository<User, UserId> {
  /**
   * Mencari pengguna berdasarkan alamat surel unik.
   * @param email Alamat surel pendaftaran.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Mengambil seluruh anggota tim dalam cakupan satu tenant.
   * @param tenantId ID organisasi pemilik akun.
   */
  findAllByTenantId(tenantId: TenantId): Promise<readonly User[]>;
}

/**
 * Port Repositori Fasilitas Fisik Cross-Docking Hub.
 */
export interface ICrossDockHubRepository extends IRepository<CrossDockHub, HubId> {
  /**
   * Mengambil semua fasilitas hub logistik yang berstatus aktif di D.I. Yogyakarta.
   */
  findActiveHubs(): Promise<readonly CrossDockHub[]>;
}

/**
 * Port Repositori Operator Logistik Fasilitas Hub Tertutup.
 */
export interface IHubOperatorRepository extends IRepository<HubOperator, OperatorId> {
  /**
   * Mencari profil penugasan operator berdasarkan User ID terkait.
   * @param userId ID identitas pengguna.
   */
  findByUserId(userId: UserId): Promise<HubOperator | null>;

  /**
   * Mencari penugasan operator aktif berdasarkan token aktivasi kriptografis.
   * @param tokenHash Hash SHA-256 dari token aktivasi.
   */
  findByActivationTokenHash(tokenHash: string): Promise<HubOperator | null>;

  /**
   * Mengambil seluruh operator yang ditugaskan pada fasilitas fisik tertentu.
   * @param hubId ID fasilitas fisik logistik.
   */
  findAllByHubId(hubId: HubId): Promise<readonly HubOperator[]>;
}
