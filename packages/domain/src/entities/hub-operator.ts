import {
  HubId,
  OperatorId,
  UserId,
  OperatorStatus,
  asHubId,
  asOperatorId,
  asUserId,
} from '../types/tenant';

/**
 * Value Object immutable untuk verifikasi token aktivasi operator logistik hub.
 */
export class ActivationToken {
  private readonly _tokenHash: string;
  private readonly _expiresAt: Date;

  public constructor(tokenHash: string, expiresAt: Date) {
    if (!tokenHash || tokenHash.trim().length === 0) {
      throw new Error('Hash token aktivasi tidak boleh kosong');
    }
    if (expiresAt.getTime() <= Date.now()) {
      throw new Error('Waktu kedaluwarsa token aktivasi harus berada di masa mendatang');
    }
    this._tokenHash = tokenHash;
    this._expiresAt = new Date(expiresAt.getTime());
  }

  public get tokenHash(): string {
    return this._tokenHash;
  }

  public get expiresAt(): Date {
    return new Date(this._expiresAt.getTime());
  }

  public isExpired(): boolean {
    return Date.now() > this._expiresAt.getTime();
  }
}

/**
 * Entitas Domain HubOperator dengan proteksi invarian dan pengikatan fasilitas fisik.
 */
export class HubOperatorEntity {
  private readonly _id: OperatorId;
  private readonly _userId: UserId;
  private readonly _assignedHubId: HubId;
  private readonly _microRole: 'OPERATOR_QC' | 'SUPERVISOR_HUB';
  private _status: OperatorStatus;
  private _activationToken: ActivationToken | null;
  private readonly _issuedByAdminId: UserId;
  private readonly _createdAt: Date;

  public constructor(params: {
    id: OperatorId;
    userId: UserId;
    assignedHubId: HubId;
    microRole: 'OPERATOR_QC' | 'SUPERVISOR_HUB';
    status: OperatorStatus;
    activationToken: ActivationToken | null;
    issuedByAdminId: UserId;
    createdAt?: Date;
  }) {
    this._id = asOperatorId(params.id);
    this._userId = asUserId(params.userId);
    this._assignedHubId = asHubId(params.assignedHubId);

    if (params.microRole !== 'OPERATOR_QC' && params.microRole !== 'SUPERVISOR_HUB') {
      throw new Error(`MicroRole operator "${params.microRole}" tidak valid`);
    }
    this._microRole = params.microRole;
    this._status = params.status;
    this._activationToken = params.activationToken;
    this._issuedByAdminId = asUserId(params.issuedByAdminId);
    this._createdAt = params.createdAt ? new Date(params.createdAt.getTime()) : new Date();
  }

  public get id(): OperatorId {
    return this._id;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get assignedHubId(): HubId {
    return this._assignedHubId;
  }

  public get microRole(): 'OPERATOR_QC' | 'SUPERVISOR_HUB' {
    return this._microRole;
  }

  public get status(): OperatorStatus {
    return this._status;
  }

  public get activationToken(): ActivationToken | null {
    return this._activationToken;
  }

  public get issuedByAdminId(): UserId {
    return this._issuedByAdminId;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt.getTime());
  }

  /**
   * Mengaktifkan akun operator setelah kata sandi ditetapkan.
   */
  public activate(): void {
    if (this._status !== 'PENDING_ACTIVATION') {
      throw new Error(`Tidak dapat mengaktifkan operator dengan status "${this._status}"`);
    }
    this._status = 'ACTIVE';
    this._activationToken = null;
  }

  /**
   * Mencabut hak operasional akun operator.
   */
  public revoke(): void {
    this._status = 'REVOKED';
  }

  /**
   * Memvalidasi apakah operator berwenang memproses manifes di fasilitas fisik tertentu.
   * @param physicalHubId ID fasilitas fisik yang diverifikasi.
   * @returns Boolean kelayakan akses fasilitas.
   */
  public canOperateAtHub(physicalHubId: HubId): boolean {
    if (this._status !== 'ACTIVE') {
      return false;
    }
    return this._assignedHubId === physicalHubId;
  }
}
