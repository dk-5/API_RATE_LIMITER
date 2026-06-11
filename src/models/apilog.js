import mongoose from "mongoose";

const apilogSchema=new mongoose.Schema({
    apiId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Api"
    },
    endpoint:{
        type:String,
    },
    method:{
        type:String
    },
    status:{
        type:Boolean,
        default:true,

    },
    createdAt: {
  type: Date,
  default: Date.now
}
    
})

export default apilogSchema