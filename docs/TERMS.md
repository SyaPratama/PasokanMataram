# Terms & Conditions and Privacy Policy

## Overview

PasokMataram requires users to accept Terms & Conditions and Privacy Policy during registration. This document outlines the technical implementation and legal compliance requirements.

## User-Facing Pages

### Terms of Service
**Route**: `/terms`  
**File**: `apps/web/src/app/terms/page.tsx`

Content includes:
- Platform usage rules
- User obligations (buyers and farmer groups)
- Payment terms and fee structure (0.3% buyer fee, 0.5% merchant fee)
- Dispute resolution process
- Liability limitations
- Intellectual property rights

### Privacy Policy
**Route**: `/privacy-policy`  
**File**: `apps/web/src/app/privacy-policy/page.tsx`

Content includes:
- Data collection practices (KYB documents, transaction data)
- Data storage and security (Appwrite Cloud, MySQL RLS)
- Third-party services (Solosmartpay, Appwrite, Redis)
- User rights (GDPR-inspired: access, rectification, deletion)
- Cookie usage
- Contact information for data requests

## Technical Implementation

### Registration Acceptance

During user registration, a mandatory checkbox requires acceptance:

```typescript
// apps/web/src/app/(auth)/register/page.tsx
const [formData, setFormData] = React.useState({
  // ... other fields
  acceptedTerms: false,
});
```

Form validation prevents submission without acceptance:
```typescript
if (!formData.acceptedTerms) {
  setError('Anda harus menerima syarat & ketentuan untuk mendaftar');
  return;
}
```

### Database Schema

Acceptances are stored in the `terms_acceptances` table:

```sql
CREATE TABLE terms_acceptances (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  tenant_id CHAR(36) NOT NULL,
  accepted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  INDEX idx_user_id (user_id),
  INDEX idx_tenant_id (tenant_id)
);
```

**Migration**: `packages/database/migrations/005_add_terms_acceptances_table.sql`

### Acceptance Recording

When user registers, the acceptance is recorded:

```typescript
await pool.execute(
  `INSERT INTO terms_acceptances (id, user_id, tenant_id, accepted_at, ip_address, user_agent)
   VALUES (?, ?, ?, NOW(), ?, ?)`,
  [acceptanceId, userId, tenantId, ipAddress, userAgent]
);
```

## Legal Compliance Considerations

### Indonesian Data Protection (PP 71/2019)

1. **Consent**: Users must explicitly consent before data processing
2. **Purpose limitation**: Data only used for stated purposes
3. **Data minimization**: Only collect necessary data
4. **Security**: Implement appropriate technical safeguards

### Payment Gateway Compliance

Solosmartpay integration requires disclosure of:
- Fee structure (dual-rail: 0.3% buyer, 0.5% merchant)
- Payment processing timeframe
- Refund and dispute resolution process

### KYB Document Handling

Special considerations for business verification documents:
- Encrypted storage (Appwrite Cloud with encryption at rest)
- Access logging (RLS tenant isolation)
- Retention policy (document when and why each document type is collected)

## Updating Terms

When terms are updated:

1. **Version control**: Add version number and effective date to terms page
2. **Re-acceptance**: Implement logic to require re-acceptance for material changes
3. **Notification**: Send email/in-app notification about changes
4. **Audit trail**: Log all acceptances with timestamp and version

Example implementation for versioned acceptance:

```typescript
// Future enhancement
interface TermsVersion {
  version: string;
  effectiveDate: Date;
  requiresReacceptance: boolean;
}

// Check if user needs to re-accept
const latestVersion = '1.1';
const userAcceptedVersion = await getUserAcceptedVersion(userId);
if (userAcceptedVersion < latestVersion) {
  // Prompt for re-acceptance
}
```

## Audit and Compliance

### Retention Requirements

- Keep acceptance records for **7 years** after account closure (Indonesian tax law)
- Store IP addresses and user agents for fraud prevention
- Log all terms page views (analytics)

### Right to Withdraw Consent

Users can request account deletion:
1. Submit deletion request via email to `privacy@syapratama.tech`
2. 30-day grace period for data recovery
3. Permanent deletion after grace period
4. Retain acceptance records and transaction history for legal compliance (anonymized)

### Data Export

Users can request data export:
- Personal profile information
- Transaction history
- KYB documents uploaded
- Payment invoices
- Notification history

Format: JSON or PDF, delivered within 30 days.

## Contact Information

For legal, privacy, or compliance inquiries:
- **Email**: `privacy@syapratama.tech`
- **DPO** (Data Protection Officer): `tama@syapratama.tech`

## Implementation Checklist

- [X] Terms of Service page created
- [X] Privacy Policy page created
- [X] Registration checkbox implemented
- [X] Database table for acceptances
- [X] IP address and user agent logging
- [ ] Email notification system for terms updates
- [ ] Versioning system for terms changes
- [ ] User data export API endpoint
- [ ] Account deletion workflow

## References

- **PP 71/2019**: Penyelenggaraan Sistem dan Transaksi Elektronik
- **UU ITE 11/2008**: Undang-Undang Informasi dan Transaksi Elektronik
- **GDPR**: General Data Protection Regulation (EU inspiration)
- **PCI DSS**: Payment Card Industry Data Security Standard (Solosmartpay compliance)
