"use strict";
/**
 * @file packages/cache/src/index.ts
 * @description Redis caching layer with tenant-scoped keys
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.get = get;
exports.set = set;
exports.del = del;
exports.invalidatePattern = invalidatePattern;
const redis_1 = require("redis");
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = (0, redis_1.createClient)({ url: redisUrl });
exports.client = client;
client.on('error', (err) => console.error('[Redis Error]', err));
let connected = false;
async function ensureConnection() {
    if (!connected) {
        await client.connect();
        connected = true;
    }
}
async function get(key) {
    await ensureConnection();
    return client.get(key);
}
async function set(key, value, ttlSeconds) {
    await ensureConnection();
    if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, value);
    }
    else {
        await client.set(key, value);
    }
}
async function del(key) {
    await ensureConnection();
    await client.del(key);
}
async function invalidatePattern(pattern) {
    await ensureConnection();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
        await client.del(keys);
    }
}
