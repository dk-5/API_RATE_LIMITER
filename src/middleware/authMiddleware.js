import jwt from "jsonwebtoken"
import 'dotenv/config';
const authMiddleware=(req,res,next)=>{
const token = req.headers['authorization']?.split(' ')[1]; // ✅ extracts token after "Bearer"
if(!token){
    return res.status(404).json({message:"token not provided"})
}

jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
if(err){return res.status(404).send({err})}
req.userId=decoded.id;
next();
})
}
export default authMiddleware;