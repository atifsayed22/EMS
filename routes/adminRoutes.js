const express = require('express')
const { model } = require('mongoose')
const router = express.Router()
const {ValidateInput,ValidateLogin}=require('../validateInput.js')
const adminController = require('../controllers/adminController.js')
const passport = require('passport')

router.route('/signup')
    .get(adminController.renderSignup)
    .post(ValidateInput,adminController.registerAdmin)

router.route('/login')
    .get(adminController.renderLogin)
    .post(ValidateLogin,
        passport.authenticate('local',{
            failureFlash:true,
            failureRedirect:'/login'
        })
        ,adminController.adminLogin)
router.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err) return next()
        res.redirect('/login')
    })
})
module.exports = router