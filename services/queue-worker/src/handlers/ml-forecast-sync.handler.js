/**
 * @file services/queue-worker/src/handlers/ml-forecast-sync.handler.ts
 * @description Periodic ML forecast sync from FastAPI service to MySQL
 */
export async function handleMlForecastSync(payload) {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    try {
        // Trigger ML service to fetch latest market data and retrain models
        const response = await fetch(`${mlServiceUrl}/api/v1/forecast/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ force_refresh: payload.forceRefresh || false }),
        });
        if (!response.ok) {
            throw new Error(`ML service returned ${response.status}: ${response.statusText}`);
        }
        console.log('[ML Sync Handler] ML forecast sync triggered successfully');
        // TODO: Call backend /api/v1/forecast/sync endpoint to pull results into MySQL
        const backendUrl = process.env.API_URL || 'http://localhost:3001';
        const syncResponse = await fetch(`${backendUrl}/api/v1/forecast/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (syncResponse.ok) {
            const data = await syncResponse.json();
            console.log(`[ML Sync Handler] Synced ${data.data?.synced || 0} forecasts to database`);
        }
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[ML Sync Handler] ML forecast sync failed:', errorMsg);
        throw err;
    }
}
