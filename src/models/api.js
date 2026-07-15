import mongoose from 'mongoose'

const apiSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    hashedKey: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    rateLimit: {
        type: Number,
        default: 10
    },
    windowSize: {
        type: Number,
        default: 60
    },
    totalRequests: {
        type: Number,
        default: 0
    },
    lastUsedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
    }
})

export default mongoose.model('Api', apiSchema)
