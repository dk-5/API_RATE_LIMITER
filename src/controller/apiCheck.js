import bcrypt from 'bcrypt'
import Api from '../models/api.js'
import User from '../models/user.js'
import redisClient from '../config/redis.js'
import { planConfigs } from '../config/plans.js'

const apiStore = async (req, res) => {
    const { apikey } = req.body
    const userId = req.userId
    const hashedKey = await bcrypt.hash(apikey, 10)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    try {
        const user = await User.findById(userId)
        const plan = user ? user.plan : 'free'
        const config = planConfigs[plan] || planConfigs.free

        const existingKeys = await Api.countDocuments({ userId, isActive: true })
        if (existingKeys >= config.maxKeys) {
            return res.status(400).json({ error: `Maximum ${config.maxKeys} API key(s) allowed for ${config.label} plan` })
        }

        const newApi = new Api({
            userId,
            hashedKey,
            expiresAt,
            plan,
            rateLimit: config.rateLimit,
            windowSize: config.windowSize,
        })
        await newApi.save()
        return res.status(201).json({ message: "API key created successfully", keyId: newApi._id })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

const apilimit = async (req, res) => {
    const RATE_LIMIT = req.apiKey.rateLimit || 10
    const WINDOW_SIZE = req.apiKey.windowSize || 60
    const keyId = req.apiKey._id.toString()
    const userId = req.apiKey.userId.toString()
    const redisKey = `rate_limit:${keyId}`

    try {
        const currentCount = await redisClient.incr(redisKey)
        if (currentCount === 1) {
            await redisClient.expire(redisKey, WINDOW_SIZE)
        }

        const allowed = currentCount <= RATE_LIMIT
        const ttl = await redisClient.ttl(redisKey)

        await Api.findByIdAndUpdate(keyId, {
            $inc: { totalRequests: 1 },
            lastUsedAt: new Date()
        })

        if (!allowed) {
            return res.status(429).json({
                error: "Too many requests",
                limit: RATE_LIMIT,
                remaining: 0,
                resetsIn: ttl
            })
        }

        return res.status(200).json({
            message: "Success",
            limit: RATE_LIMIT,
            remaining: RATE_LIMIT - currentCount,
            resetsIn: ttl
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export { apiStore, apilimit }
