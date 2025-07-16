const mongoose  = require('mongoose')

const CompanySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    logo:{
        url:String,
        filname:String
    },
    department:[{
        type:String,
        required:true
    }],
    description:{
        type:String
    },
    website:String,
    location:String,
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin",
        required:true,
        unique:true
    }
})
module.exports = mongoose.model('Company',CompanySchema)