import express from 'express'
import 'dotenv/config';
import connectDb from './db/db.js';
import authRouter from './routes/authRoute.js';
import apiRouter from './routes/apiRoutes.js';

connectDb()
const app=express()
app.use(express.json())
app.use('/auth',authRouter)
app.use('/api',apiRouter)
const PORT= process.env.PORT || 8000
app.use(express.json())
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})
