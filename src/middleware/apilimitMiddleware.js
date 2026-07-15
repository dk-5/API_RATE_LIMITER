import bcrypt from 'bcrypt'
import Api from '../models/api.js'

const apiMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.headers["x-api-key"]
        if (!apiKey) {
            return res.status(401).json({ message: "API key required" })
        }

        const keys = await Api.find({ isActive: true })
        let validKey = null

        for (let key of keys) {
            const isMatch = await bcrypt.compare(apiKey, key.hashedKey)
            if (isMatch) {
                validKey = key
                break
            }
        }

        if (!validKey) {
            return res.status(401).json({ message: "Invalid API key" })
        }

        if (validKey.expiresAt && validKey.expiresAt < new Date()) {
            return res.status(401).json({ message: "API key has expired" })
        }

        req.apiKey = validKey
        next()
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ error: "Server error" })
    }
}

export default apiMiddleware
