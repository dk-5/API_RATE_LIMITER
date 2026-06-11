import brycpt from 'bcrypt'
import Api from '../models/api.js'
import redisClient from '../config/redis.js'

const apiStore= async (req,res)=>{
    const {apikey}= req.body
    const id=req.userId
    const hashedKey=brycpt.hashSync(apikey,10)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    try 
    {
     const newApi= Api({
        id,
        hashedKey,
        expiresAt:expiresAt,
        
     })
     await newApi.save();
    return res.status(201).json({message:"Success"})
    }
    catch(err){
      return  res.status(404).json({error:err.message})
    }
}

const apilimit=async (req,res)=>{
  const RATE_LIMIT=10
  const WINDOW_SIZE=60
    const {apikey}=req.apiKey;
    const redisKey=`rate_limit:${apikey}`
    const currentCount = await redisClient.incr(redisKey);
    if (currentCount === 1) {
      await redisClient.expire(redisKey, WINDOW_SIZE);
    }
     if (currentCount > RATE_LIMIT) {
       return res.status(429).json({error: "Too many requests",})}
     else 
     {
       return res.status(202).json({message:"Successs"}) 
     }
      
      
    }


export {apiStore,apilimit}