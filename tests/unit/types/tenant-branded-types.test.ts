import { describe, it, expect } from 'vitest';
import { asTenantId, asUserId, asKybDocumentId, asOutletId } from '@pasok/domain';

describe('Branded Types & Invariants (Prinsip III Konstitusi)', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  const invalidUuid = 'not-a-valid-uuid-string';

  it('berhasil memvalidasi dan mencetak TenantId dari UUID valid', () => {
    const tenantId = asTenantId(validUuid);
    expect(tenantId).toBe(validUuid);
  });

  it('melempar TypeError jika TenantId bukan format UUID', () => {
    expect(() => asTenantId(invalidUuid)).toThrow(TypeError);
  });

  it('berhasil memvalidasi dan mencetak UserId dari UUID valid', () => {
    const userId = asUserId(validUuid);
    expect(userId).toBe(validUuid);
  });

  it('melempar TypeError jika UserId bukan format UUID', () => {
    expect(() => asUserId(invalidUuid)).toThrow(TypeError);
  });

  it('berhasil memvalidasi KybDocumentId dan OutletId', () => {
    const docId = asKybDocumentId(validUuid);
    const outletId = asOutletId(validUuid);
    expect(docId).toBe(validUuid);
    expect(outletId).toBe(validUuid);
  });
});
