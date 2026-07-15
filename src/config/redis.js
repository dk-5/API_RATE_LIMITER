import Redis from "ioredis";

const config = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
};

if (process.env.REDIS_PASS) {
    config.password = process.env.REDIS_PASS;
}

const redisClient = new Redis(config);
redisClient.on("connect", () => console.log("Redis connected"));
redisClient.on("error", (err) => console.log("Redis error:", err.message));

export default redisClient;