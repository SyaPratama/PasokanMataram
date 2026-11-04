# Payment Gateway Documentation

## Solosmartpay Integration

PasokMataram uses Solosmartpay as the payment gateway for all transactions.

### Supported Payment Methods

- **QRIS**: EMVCo-compliant QR code payment
- **Virtual Account**: BCA, Mandiri, BNI, BRI, BSI, BPD DIY
- **E-wallet**: Integration via Solosmartpay

### Fee Structure

- **Buyer**: 0.3% platform service fee
- **Merchant**: 0.5% platform fee

### Environment Variables

```bash
# Sandbox
SOLOSMARTPAY_TOKEN=ssp_test_sandbox_token_here
SOLOSMARTPAY_WEBHOOK_SECRET=whsec_sandbox_secret_key_here
SOLOSMARTPAY_SANDBOX=true

# Production
SOLOSMARTPAY_TOKEN=your_production_api_token_here
SOLOSMARTPAY_WEBHOOK_SECRET=your_production_webhook_secret_here
SOLOSMARTPAY_SANDBOX=false
```

### Webhook Configuration

**Endpoint**: `https://api.syapratama.tech/api/v1/webhooks/solosmartpay`

**Signature Verification**: HMAC-SHA256 via `X-SoloSmartPay-Signature` header

**Idempotency**: Event deduplication via `webhook_events` table

### Payment Flow

1. User selects payment method (QRIS/VA)
2. Backend creates invoice via Solosmartpay API
3. User completes payment
4. Webhook notifies platform → reservation status updated to PAID
5. H+1 settlement to supplier

### Database Tables

- `payment_invoices`: Invoice tracking
- `webhook_events`: Idempotency log
- `terms_acceptances`: T&C audit trail

### Migration from Escrow

The platform previously used a Bank BPD DIY escrow vault holding model. Migration to direct Solosmartpay payment eliminates escrow intermediary while maintaining buyer protection through payment gateway guarantees.

**Deprecated tables**: `escrow_settlements` (marked with `deprecated_at`)

### Testing

**Sandbox**: https://sandbox.solosmartpay.com  
**Documentation**: https://docs.solosmartpay.com

Use sandbox credentials in `.env.development.example` for testing webhook integration.
