const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const AdminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
   
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    
   
});

AdminSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('Admin',AdminSchema)