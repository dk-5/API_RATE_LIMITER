import brycpt from 'bcrypt'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import 'dotenv/config';
const registerUser = async (req,res)=>{
const {email,password}=req.body;
const user = await User.findOne({email})
if(!user){
const hashedPassword=brycpt.hashSync(password,8)
try 
{
const newUser= new User({
    email,
    password:hashedPassword,
})
await newUser.save();
res.status(201).json({ message: 'User registered successfully' });

}
catch(err){
res.status(401).json({ message:err.message });

}
}
else 
{
    res.status(402).json({message:"User Already exists"})
}

}
const loginUser = async (req,res)=>{
const {email,password}=req.body
try {
const user = await User.findOne({email})
if(!user){
    return res.status(404).send({message:"User not found"})
}
const ispasswordValid=brycpt.compareSync(password,user.password) 
if(!ispasswordValid){
  return res.status(401).send({message:"Invalid credentials"})  
}
const token= jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:'24h'})
res.status(201).json({token})
} catch(err)
{
res.status(500).json({ error: err.message });
}
   
}
export {loginUser,registerUser}