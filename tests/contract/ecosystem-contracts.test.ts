import { describe, it, expect } from 'vitest';
import {
  CreateReservationSchema,
  SubmitWeighingSchema,
  FunnelTelemetrySchema,
  evaluateWeighingTolerance,
  asCampaignId,
  asReservationId,
  asEscrowSettlementId,
  asWeighingLogId,
  routeCommodityLogistics,
  validateTransitTemperature,
} from '../../packages/domain/src';

describe('Ecosystem Business Flow Contracts (BIZ-06, BIZ-03, ROLE-03)', () => {
  describe('Branded Types & Validations', () => {
    it('berhasil memvalidasi dan mengonversi UUID valid ke Branded Type', () => {
      const validUuid = '11111111-2222-3333-4444-555555555555';
      const campaignId = asCampaignId(validUuid);
      const reservationId = asReservationId(validUuid);
      const escrowId = asEscrowSettlementId(validUuid);
      const logId = asWeighingLogId(validUuid);

      expect(campaignId).toBe(validUuid);
      expect(reservationId).toBe(validUuid);
      expect(escrowId).toBe(validUuid);
      expect(logId).toBe(validUuid);
    });

    it('melemparkan TypeError jika format UUID tidak valid', () => {
      expect(() => asCampaignId('bukan-uuid')).toThrow(TypeError);
      expect(() => asReservationId('12345')).toThrow(TypeError);
      expect(() => asEscrowSettlementId('')).toThrow(TypeError);
      expect(() => asWeighingLogId('abc-def')).toThrow(TypeError);
    });
  });

  describe('CreateReservationSchema - MTV Rule (Rp 500.000 minimum)', () => {
    it('menolak pesanan reservasi kuota di bawah Rp 500.000', () => {
      const payload = {
        campaignId: '11111111-2222-3333-4444-555555555555',
        buyerTenantId: '22222222-3333-4444-5555-666666666666',
        quantityKg: 5,
        pricePerKg: 80000,
        deliveryAddress: 'Jl. Malioboro No. 12, Sosromenduran, Yogyakarta',
      };

      const result = CreateReservationSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMsg = result.error.errors[0]?.message;
        expect(errorMsg).toContain('minimal Rp 500.000');
      }
    });

    it('menerima pesanan reservasi kuota tepat Rp 500.000', () => {
      const payload = {
        campaignId: '11111111-2222-3333-4444-555555555555',
        buyerTenantId: '22222222-3333-4444-5555-666666666666',
        quantityKg: 10,
        pricePerKg: 50000,
        deliveryAddress: 'Jl. Palagan Tentara Pelajar KM 8, Sleman, Yogyakarta',
      };

      const result = CreateReservationSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantityKg * result.data.pricePerKg).toBe(500000);
      }
    });

    it('menerima pesanan reservasi kuota di atas Rp 500.000', () => {
      const payload = {
        campaignId: '11111111-2222-3333-4444-555555555555',
        buyerTenantId: '22222222-3333-4444-5555-666666666666',
        quantityKg: 25,
        pricePerKg: 75000,
        deliveryAddress: 'Jl. Kaliurang KM 5, Caturtunggal, Depok, Sleman',
      };

      const result = CreateReservationSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantityKg * result.data.pricePerKg).toBe(1875000);
      }
    });
  });

  describe('SubmitWeighingSchema & evaluateWeighingTolerance', () => {
    it('memvalidasi skema input data timbangan hub fisik', () => {
      const payload = {
        reservationId: '11111111-2222-3333-4444-555555555555',
        commodityCategory: 'MEAT',
        temperatureZone: 'CHILLED',
        measuredTempCelsius: 2.5,
        manifestWeightKg: 100,
        actualWeightKg: 99.6,
        scaleDeviceId: 'SCALE-BANTUL-01',
        operatorId: '33333333-4444-5555-6666-777777777777',
      };

      const result = SubmitWeighingSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('menghitung toleransi susut daging dingin (MEAT): WITHIN_TOLERANCE jika susut <= 0.5%', () => {
      const evaluation = evaluateWeighingTolerance({
        commodityCategory: 'MEAT',
        manifestWeightKg: 100,
        actualWeightKg: 99.6,
        measuredTempCelsius: 2.0,
        temperatureZone: 'CHILLED',
      });

      expect(evaluation.toleranceStatus).toBe('WITHIN_TOLERANCE');
      expect(evaluation.shrinkagePercentage).toBe(0.4);
      expect(evaluation.isTemperatureCompliant).toBe(true);
    });

    it('menghitung toleransi susut daging dingin (MEAT): ACCEPTABLE_DEFICIT jika susut antara 0.5% - 1.0%', () => {
      const evaluation = evaluateWeighingTolerance({
        commodityCategory: 'MEAT',
        manifestWeightKg: 100,
        actualWeightKg: 99.2,
        measuredTempCelsius: 3.0,
        temperatureZone: 'CHILLED',
      });

      expect(evaluation.toleranceStatus).toBe('ACCEPTABLE_DEFICIT');
      expect(evaluation.shrinkagePercentage).toBe(0.8);
      expect(evaluation.isTemperatureCompliant).toBe(true);
    });

    it('menghitung toleransi susut daging dingin (MEAT): EXCESS_DEFICIT jika susut > 1.0%', () => {
      const evaluation = evaluateWeighingTolerance({
        commodityCategory: 'MEAT',
        manifestWeightKg: 100,
        actualWeightKg: 98.5,
        measuredTempCelsius: 3.5,
        temperatureZone: 'CHILLED',
      });

      expect(evaluation.toleranceStatus).toBe('EXCESS_DEFICIT');
      expect(evaluation.shrinkagePercentage).toBe(1.5);
      expect(evaluation.notes).toContain('Perlu dispute penyesuaian dana');
    });

    it('menghitung toleransi sayur segar (PERISHABLE_VEGETABLE) dengan batas susut 5.0%', () => {
      const acceptable = evaluateWeighingTolerance({
        commodityCategory: 'PERISHABLE_VEGETABLE',
        manifestWeightKg: 50,
        actualWeightKg: 48,
        measuredTempCelsius: 24.0,
        temperatureZone: 'AMBIENT_VENTILATED',
      });

      expect(acceptable.toleranceStatus).toBe('ACCEPTABLE_DEFICIT');
      expect(acceptable.shrinkagePercentage).toBe(4.0);

      const excess = evaluateWeighingTolerance({
        commodityCategory: 'PERISHABLE_VEGETABLE',
        manifestWeightKg: 50,
        actualWeightKg: 46.5,
        measuredTempCelsius: 25.0,
        temperatureZone: 'AMBIENT_VENTILATED',
      });

      expect(excess.toleranceStatus).toBe('EXCESS_DEFICIT');
      expect(excess.shrinkagePercentage).toBe(7.0);
    });

    it('menghitung toleransi beras (GRAIN) dengan batas susut 0.5%', () => {
      const within = evaluateWeighingTolerance({
        commodityCategory: 'GRAIN',
        manifestWeightKg: 500,
        actualWeightKg: 499,
        measuredTempCelsius: 26.0,
        temperatureZone: 'AMBIENT_VENTILATED',
      });

      expect(within.toleranceStatus).toBe('WITHIN_TOLERANCE');
      expect(within.shrinkagePercentage).toBe(0.2);
    });

    it('mendeteksi surplus jika timbangan fisik lebih tinggi daripada manifest', () => {
      const surplus = evaluateWeighingTolerance({
        commodityCategory: 'MEAT',
        manifestWeightKg: 50,
        actualWeightKg: 51.5,
        measuredTempCelsius: 2.0,
        temperatureZone: 'CHILLED',
      });

      expect(surplus.toleranceStatus).toBe('SURPLUS');
      expect(surplus.weightDifferenceKg).toBe(1.5);
      expect(surplus.shrinkagePercentage).toBe(0);
    });

    it('mendeteksi pelanggaran suhu dingin SNI untuk produk chilled dan frozen', () => {
      const warmMeat = evaluateWeighingTolerance({
        commodityCategory: 'MEAT',
        manifestWeightKg: 100,
        actualWeightKg: 100,
        measuredTempCelsius: 9.5,
        temperatureZone: 'CHILLED',
      });

      expect(warmMeat.isTemperatureCompliant).toBe(false);
      expect(warmMeat.notes).toContain('di luar standar zona CHILLED');

      const warmFrozen = evaluateWeighingTolerance({
        commodityCategory: 'MEAT',
        manifestWeightKg: 100,
        actualWeightKg: 100,
        measuredTempCelsius: -10,
        temperatureZone: 'FROZEN',
      });

      expect(warmFrozen.isTemperatureCompliant).toBe(false);
      expect(warmFrozen.notes).toContain('di luar standar zona FROZEN');
    });
  });

  describe('FunnelTelemetrySchema', () => {
    it('memvalidasi event telemetri corong konversi', () => {
      const payload = {
        step: 'CAMPAIGN_VIEWED',
        campaignId: '11111111-2222-3333-4444-555555555555',
        buyerTenantId: '22222222-3333-4444-5555-666666666666',
        metadata: { source: 'dashboard_banner', device: 'mobile' },
        timestamp: new Date().toISOString(),
      };

      const result = FunnelTelemetrySchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('Multi-Temperature Routing (TASK-301 / BIZ-03)', () => {
    it('merutekan daging dingin (MEAT) ke CHILLER_VAN dan CHILLER_BAY (0-4C)', () => {
      const directive = routeCommodityLogistics('MEAT');
      expect(directive.temperatureZone).toBe('CHILLED');
      expect(directive.recommendedVehicle).toBe('CHILLER_VAN');
      expect(directive.hubStorageBay).toBe('CHILLER_BAY');
      expect(directive.requiresContinuousDataLogger).toBe(true);
      expect(directive.targetTempRangeCelsius.min).toBe(0);
      expect(directive.targetTempRangeCelsius.max).toBe(4);
    });

    it('merutekan susu murni (MILK) ke CHILLER_VAN maksimal 4 jam transit', () => {
      const directive = routeCommodityLogistics('MILK');
      expect(directive.temperatureZone).toBe('CHILLED');
      expect(directive.maxTransitHours).toBe(4);
    });

    it('merutekan komoditas beku ke REFRIGERATED_TRUCK_FREEZER (-25C s.d. -18C)', () => {
      const directive = routeCommodityLogistics('MEAT', true);
      expect(directive.temperatureZone).toBe('FROZEN');
      expect(directive.recommendedVehicle).toBe('REFRIGERATED_TRUCK_FREEZER');
      expect(directive.hubStorageBay).toBe('FREEZER_BAY');
    });

    it('merutekan sayur berventilasi (PERISHABLE_VEGETABLE) ke VENTILATED_PICKUP', () => {
      const directive = routeCommodityLogistics('PERISHABLE_VEGETABLE');
      expect(directive.temperatureZone).toBe('AMBIENT_VENTILATED');
      expect(directive.recommendedVehicle).toBe('VENTILATED_PICKUP');
    });

    it('memvalidasi kepatuhan suhu aman dan mendeteksi deviasi kritis', () => {
      const meatDirective = routeCommodityLogistics('MEAT');

      const safe = validateTransitTemperature(meatDirective, 2.5);
      expect(safe.isCompliant).toBe(true);
      expect(safe.alertLevel).toBe('NONE');

      const warning = validateTransitTemperature(meatDirective, 5.5);
      expect(warning.isCompliant).toBe(false);
      expect(warning.alertLevel).toBe('WARNING');

      const critical = validateTransitTemperature(meatDirective, 10.0);
      expect(critical.isCompliant).toBe(false);
      expect(critical.alertLevel).toBe('CRITICAL');
      expect(critical.diagnosticMessage).toContain('Pelanggaran suhu kritis');
    });
  });
});
