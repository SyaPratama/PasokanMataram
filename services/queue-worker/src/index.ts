/**
 * Background Queue Worker Microservice.
 * Demonstrates eager worker registration with lazy payload evaluation on demand.
 */

import { createQueueWorker, type QueueJob, type WorkerInstance } from '@pasok/queue';
import { lazyAsync } from '@pasok/domain';
import { query } from '@pasok/database';
import { handleDailyDataIngest } from './handlers/ml-ingest-handler';
import { handleForecastPublish } from './handlers/ml-forecast-publisher';
export * from './adapters/bapanas-adapter';
export * from './adapters/pihps-adapter';
export * from './adapters/bmkg-adapter';
export * from './adapters/lelang-kulonprogo-adapter';
export * from './handlers/ml-ingest-handler';
export * from './ml/feature-store';
export * from './ml/pasok-ensemble';
export * from './handlers/ml-forecast-publisher';
export * from './workers/escrow-disbursement';

export interface WorkerSupervisor {
  workers: WorkerInstance[];
  startAll: () => void;
  stopAll: () => void;
}

/**
 * Handles newly uploaded KYB documents.
 * Employs lazy document detail fetcher to avoid querying database unless OCR is requested.
 */
export async function handleKybDocumentUploaded(job: QueueJob<'kyb.document.uploaded'>): Promise<void> {
  const { tenantId, documentId, storageKey } = job.payload;
  const resolveFullDocument = lazyAsync(async () => {
    const res = await query(
      'SELECT id, file_storage_key, file_mime_type, status FROM kyb_documents WHERE id = $1',
      [documentId]
    );
    return res.rows[0] || null;
  });
  console.log(`[WORKER] Memproses KYB berkas tenant ${tenantId}, dokumen: ${documentId}, path: ${storageKey}`);
  await resolveFullDocument();
}

/**
 * Handles KYB verification decision updates.
 */
export async function handleKybStatusChanged(job: QueueJob<'kyb.status.changed'>): Promise<void> {
  const { tenantId, newStatus, rejectionReason } = job.payload;
  console.log(`[WORKER] KYB status diperbarui untuk tenant ${tenantId}: ${newStatus}. Alasan: ${rejectionReason || 'N/A'}`);
}

/**
 * Handles welcome email dispatch.
 */
export async function handleWelcomeEmail(job: QueueJob<'notification.welcome.email'>): Promise<void> {
  const { recipientEmail, recipientName } = job.payload;
  console.log(`[WORKER] Mengirim email selamat datang ke ${recipientName} <${recipientEmail}>`);
}

/**
 * Supervises eager worker registration across registered queues.
 */
export function initializeWorkerSupervisor(): WorkerSupervisor {
  const workers: WorkerInstance[] = [
    createQueueWorker('kyb.document.uploaded', handleKybDocumentUploaded),
    createQueueWorker('kyb.status.changed', handleKybStatusChanged),
    createQueueWorker('notification.welcome.email', handleWelcomeEmail),
    createQueueWorker('ml.data.ingest.daily', handleDailyDataIngest),
    createQueueWorker('ml.forecast.publish.daily', handleForecastPublish),
  ];
  return {
    workers,
    startAll() {
      workers.forEach((w) => w.start());
    },
    stopAll() {
      workers.forEach((w) => w.stop());
    },
  };
}

if (process.argv[1]?.includes('queue-worker') || process.env.RUN_WORKER === 'true') {
  const supervisor = initializeWorkerSupervisor();
  supervisor.startAll();
  console.log('[PASOKMATARAM-WORKER] Background queue workers aktif dan mendengarkan antrean.');
  setInterval(() => {}, 60000);
}
