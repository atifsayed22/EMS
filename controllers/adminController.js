const express =require('express')
const {ValidateInput}=require('../validateInput.js')
const {validationResult}=require('express-validator')
const Admin = require('../models/admin.js')
const passport = require('passport')
const { model } = require('mongoose')

module.exports.registerAdmin=async(req,res)=>{
    const err = validationResult(req)
    if(!err.isEmpty()){
        return res.send(err)
    }

    let{firstName,lastName,username,email,password,mobile}=req.body
    const newAdmin = new Admin({firstName,lastName,username,email,mobile})
    const registerAdmin = await Admin.register(newAdmin,password)

    req.login(registerAdmin, (err) => {
        if (err) return next(err);
        req.flash('success', "Signup and logged-in successfully");
        res.redirect('/dashboard/main');
    });



}
module.exports.renderSignup = (req,res)=>{
    res.render('auth/signup.ejs')
}
module.exports.renderLogin=(req,res)=>{
    res.render('auth/login.ejs')
}
module.exports.adminLogin = async(req,res)=>{
    const err = validationResult(req)
    if(!err.isEmpty()){
        return res.send(err)
    }
    

    res.redirect('/dashboard/main')
    // res.redirect('adminDashboard/dashboard.ejs')

} 