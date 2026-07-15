import Api from '../models/api.js'
import ApiLog from '../models/apilog.js'
import User from '../models/user.js'
import { planConfigs } from '../config/plans.js'
import redisClient from '../config/redis.js'

const getOverview = async (req, res) => {
    try {
        const userId = req.userId
        const keys = await Api.find({ userId })
        const keyIds = keys.map(k => k._id)

        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        const [totalToday, allowedToday, blockedToday, uniqueEndpoints] = await Promise.all([
            ApiLog.countDocuments({ apiId: { $in: keyIds }, createdAt: { $gte: startOfDay } }),
            ApiLog.countDocuments({ apiId: { $in: keyIds }, createdAt: { $gte: startOfDay }, allowed: true }),
            ApiLog.countDocuments({ apiId: { $in: keyIds }, createdAt: { $gte: startOfDay }, allowed: false }),
            ApiLog.distinct('endpoint', { apiId: { $in: keyIds }, createdAt: { $gte: startOfDay } })
        ])

        const totalLifetime = keys.reduce((sum, k) => sum + k.totalRequests, 0)
        const user = await User.findById(userId).select('plan')

        res.status(200).json({
            totalToday,
            allowedToday,
            blockedToday,
            totalLifetime,
            activeKeys: keys.filter(k => k.isActive).length,
            totalKeys: keys.length,
            uniqueEndpoints: uniqueEndpoints.length,
            plan: user?.plan || 'free'
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getUsage = async (req, res) => {
    try {
        const userId = req.userId
        const { period = '24h' } = req.query
        const keys = await Api.find({ userId })
        const keyIds = keys.map(k => k._id)

        let startDate, groupFormat
        const now = new Date()

        switch (period) {
            case '24h':
                startDate = new Date(now - 24 * 60 * 60 * 1000)
                groupFormat = { $dateToString: { format: "%Y-%m-%dT%H:00:00", date: "$createdAt" } }
                break
            case '7d':
                startDate = new Date(now - 7 * 24 * 60 * 60 * 1000)
                groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                break
            case '30d':
                startDate = new Date(now - 30 * 24 * 60 * 60 * 1000)
                groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                break
            default:
                startDate = new Date(now - 24 * 60 * 60 * 1000)
                groupFormat = { $dateToString: { format: "%Y-%m-%dT%H:00:00", date: "$createdAt" } }
        }

        const usage = await ApiLog.aggregate([
            { $match: { apiId: { $in: keyIds }, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: groupFormat,
                    total: { $sum: 1 },
                    allowed: { $sum: { $cond: ['$allowed', 1, 0] } },
                    blocked: { $sum: { $cond: ['$allowed', 0, 1] } }
                }
            },
            { $sort: { _id: 1 } }
        ])

        res.status(200).json({ usage, period })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getKeys = async (req, res) => {
    try {
        const userId = req.userId
        const keys = await Api.find({ userId }).select('-hashedKey').sort({ createdAt: -1 })

        const keysWithStats = await Promise.all(keys.map(async (key) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const todayCount = await ApiLog.countDocuments({ apiId: key._id, createdAt: { $gte: today } })
            return {
                ...key.toObject(),
                todayRequests: todayCount
            }
        }))

        res.status(200).json({ keys: keysWithStats })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const updateKeyConfig = async (req, res) => {
    try {
        const { id } = req.params
        const { rateLimit, windowSize } = req.body
        const userId = req.userId

        const key = await Api.findOne({ _id: id, userId })
        if (!key) {
            return res.status(404).json({ message: "API key not found" })
        }

        const user = await User.findById(userId)
        const planConfig = planConfigs[user.plan]
        const maxRate = planConfig.maxCustomRateLimit

        if (rateLimit && (rateLimit < 1 || rateLimit > maxRate)) {
            return res.status(400).json({
                message: `Rate limit must be between 1 and ${maxRate} for ${user.plan} plan`
            })
        }

        if (windowSize && (windowSize < 1 || windowSize > 3600)) {
            return res.status(400).json({ message: "Window size must be between 1 and 3600 seconds" })
        }

        const update = {}
        if (rateLimit) update.rateLimit = rateLimit
        if (windowSize) update.windowSize = windowSize

        const updatedKey = await Api.findByIdAndUpdate(id, update, { new: true }).select('-hashedKey')

        const redisKey = `rate_limit:${id}`
        await redisClient.del(redisKey)

        res.status(200).json({ message: "Config updated", key: updatedKey })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const updatePlan = async (req, res) => {
    try {
        const userId = req.userId
        const { plan } = req.body

        if (!plan || !planConfigs[plan]) {
            return res.status(400).json({ message: "Invalid plan. Choose: free, pro, enterprise" })
        }

        const user = await User.findByIdAndUpdate(userId, { plan }, { new: true })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const config = planConfigs[plan]
        await Api.updateMany(
            { userId },
            { plan, rateLimit: config.rateLimit, windowSize: config.windowSize }
        )

        res.status(200).json({
            message: `Plan updated to ${plan}`,
            plan,
            limits: config
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getLogs = async (req, res) => {
    try {
        const userId = req.userId
        const { page = 1, limit = 50, status } = req.query

        const keys = await Api.find({ userId }).select('_id')
        const keyIds = keys.map(k => k._id)

        const filter = { apiId: { $in: keyIds } }
        if (status === 'allowed') filter.allowed = true
        if (status === 'blocked') filter.allowed = false

        const total = await ApiLog.countDocuments(filter)
        const logs = await ApiLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('apiId', 'plan')

        res.status(200).json({
            logs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getTopEndpoints = async (req, res) => {
    try {
        const userId = req.userId
        const { period = '24h' } = req.query
        const keys = await Api.find({ userId }).select('_id')
        const keyIds = keys.map(k => k._id)

        let startDate
        const now = new Date()
        switch (period) {
            case '24h': startDate = new Date(now - 24 * 60 * 60 * 1000); break
            case '7d': startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); break
            case '30d': startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); break
            default: startDate = new Date(now - 24 * 60 * 60 * 1000)
        }

        const topEndpoints = await ApiLog.aggregate([
            { $match: { apiId: { $in: keyIds }, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { endpoint: '$endpoint', method: '$method' },
                    total: { $sum: 1 },
                    allowed: { $sum: { $cond: ['$allowed', 1, 0] } },
                    blocked: { $sum: { $cond: ['$allowed', 0, 1] } },
                    avgResponseTime: { $avg: '$responseTime' }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 10 }
        ])

        res.status(200).json({ endpoints: topEndpoints, period })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getHeatmap = async (req, res) => {
    try {
        const userId = req.userId
        const keys = await Api.find({ userId }).select('_id')
        const keyIds = keys.map(k => k._id)

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const heatmap = await ApiLog.aggregate([
            { $match: { apiId: { $in: keyIds }, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: {
                        day: { $dayOfWeek: '$createdAt' },
                        hour: { $hour: '$createdAt' }
                    },
                    total: { $sum: 1 },
                    allowed: { $sum: { $cond: ['$allowed', 1, 0] } },
                    blocked: { $sum: { $cond: ['$allowed', 0, 1] } }
                }
            },
            { $sort: { '_id.day': 1, '_id.hour': 1 } }
        ])

        res.status(200).json({ heatmap })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const deleteKey = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const key = await Api.findOneAndDelete({ _id: id, userId })
        if (!key) {
            return res.status(404).json({ message: "API key not found" })
        }

        const redisKey = `rate_limit:${id}`
        await redisClient.del(redisKey)

        res.status(200).json({ message: "API key deleted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export {
    getOverview,
    getUsage,
    getKeys,
    updateKeyConfig,
    updatePlan,
    getLogs,
    getTopEndpoints,
    getHeatmap,
    deleteKey
}
