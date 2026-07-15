import mongoose from "mongoose";

const apilogSchema = new mongoose.Schema({
    apiId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Api",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    endpoint: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    statusCode: {
        type: Number,
        required: true
    },
    allowed: {
        type: Boolean,
        default: true
    },
    responseTime: {
        type: Number
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

apilogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

export default mongoose.model('ApiLog', apilogSchema)
