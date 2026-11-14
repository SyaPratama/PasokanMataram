"use strict";
/**
 * @file packages/cache/src/index.ts
 * @description Upstash Redis caching layer with tenant-scoped keys
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.get = get;
exports.set = set;
exports.del = del;
exports.invalidatePattern = invalidatePattern;
const redis_1 = require("redis");
/**
 * Menurunkan URL TCP ber-TLS dari kredensial Upstash Redis REST.
 * Token REST Upstash juga merupakan kata sandi TCP native database.
 * @returns URL rediss:// siap pakai, atau undefined bila kredensial belum lengkap.
 */
function resolveUpstashUrl() {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!restUrl || !token)
        return undefined;
    try {
        const host = new URL(restUrl).hostname;
        return `rediss://default:${encodeURIComponent(token)}@${host}:6379`;
    }
    catch {
        return undefined;
    }
}
const redisUrl = resolveUpstashUrl();
const client = redisUrl ? (0, redis_1.createClient)({ url: redisUrl }) : null;
exports.client = client;
client?.on('error', (err) => console.error('[Redis Error]', err));
let connected = false;
async function ensureConnection() {
    if (!client) {
        throw new Error('Upstash Redis belum dikonfigurasi: isi UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN.');
    }
    if (!connected) {
        await client.connect();
        connected = true;
    }
    return client;
}
async function get(key) {
    return (await ensureConnection()).get(key);
}
async function set(key, value, ttlSeconds) {
    const activeClient = await ensureConnection();
    if (ttlSeconds) {
        await activeClient.setEx(key, ttlSeconds, value);
    }
    else {
        await activeClient.set(key, value);
    }
}
async function del(key) {
    await (await ensureConnection()).del(key);
}
async function invalidatePattern(pattern) {
    const activeClient = await ensureConnection();
    const keys = await activeClient.keys(pattern);
    if (keys.length > 0) {
        await activeClient.del(keys);
    }
}
