import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import connectDb from './db/db.js'
import authRouter from './routes/authRoute.js'
import apiRouter from './routes/apiRoutes.js'
import dashboardRouter from './routes/dashboardRoutes.js'

await connectDb()

const collections = await mongoose.connection.db.listCollections().toArray()
const apisCollection = collections.find(c => c.name === 'apis')
if (apisCollection) {
    const indexes = await mongoose.connection.db.collection('apis').indexes()
    const userIdIndex = indexes.find(i => i.key && i.key.userId === 1 && i.unique)
    if (userIdIndex) {
        await mongoose.connection.db.collection('apis').dropIndex('userId_1')
        await mongoose.connection.db.collection('apis').createIndex({ userId: 1 })
    }
}

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/api', apiRouter)
app.use('/dashboard', dashboardRouter)

app.use(express.static(path.join(__dirname, '../client/dist')))

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
