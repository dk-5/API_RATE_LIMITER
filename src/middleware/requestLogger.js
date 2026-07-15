import ApiLog from '../models/apilog.js'

const logBuffer = []
const FLUSH_INTERVAL = 5000
const MAX_BUFFER_SIZE = 10

async function flushLogs() {
    if (logBuffer.length === 0) return
    const logsToFlush = logBuffer.splice(0, logBuffer.length)
    try {
        await ApiLog.insertMany(logsToFlush, { ordered: false })
    } catch (err) {
        console.error('Failed to flush logs:', err.message)
    }
}

setInterval(flushLogs, FLUSH_INTERVAL)

const requestLogger = (req, res, next) => {
    const startTime = Date.now()

    res.on('finish', () => {
        const responseTime = Date.now() - startTime
        const log = {
            apiId: req.apiKey?._id,
            userId: req.apiKey?.userId,
            endpoint: req.originalUrl || req.url,
            method: req.method,
            statusCode: res.statusCode,
            allowed: res.statusCode !== 429,
            responseTime,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'] || '',
            createdAt: new Date()
        }

        logBuffer.push(log)
        if (logBuffer.length >= MAX_BUFFER_SIZE) {
            flushLogs()
        }
    })

    next()
}

export { requestLogger, flushLogs }
