import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDb from './db/db.js'
import authRouter from './routes/authRoute.js'
import apiRouter from './routes/apiRoutes.js'
import dashboardRouter from './routes/dashboardRoutes.js'

connectDb()

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
