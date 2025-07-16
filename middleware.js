const express = require('express')
const Employee = require('./models/employee.js')
const Company = require('./models/company.js')

module.exports.isLoggedin=(req,res,next)=>{
    if(req.isAuthenticated())return next()
    res.redirect('/login')
}
module.exports.isEmployee= async(req,res,next)=>{
    let {id} = req.params
    const employee = await Employee.findById(id)
    const company = await Company.findOne({owner:req.user._id})
    if(!employee){
        req.flash('error','Employee not found')
        return  res.redirect('/dashboard/employees')
    }
    if(!employee.company.equals(company._id)){
        console.log(employee.company)
        console.log(req.user._id)
        req.flash('error','404 error not found')
      return  res.redirect('/dashboard/employees')
    }
    next()
}