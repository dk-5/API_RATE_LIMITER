import mongoose from 'mongoose'

const apiSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        unique:true
    },
    hashedKey:{
        type:String,
        required:true,
        
    },
    isActive:{
        type:Boolean,
        default:false,
    },
    createdAt:{
     type:Date,
     default:Date.now,
    },
    expiresAt:{
        type:Date,
    }

})

export default mongoose.model('Api',apiSchema)