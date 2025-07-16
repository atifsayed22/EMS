
const Employee = require('../models/employee.js')
const Company = require('../models/company.js')

module.exports.renderCompanyForm=(req,res)=>{
    res.render('adminDashboard/companyInfo.ejs')
}
module.exports.addCompany= async(req,res)=>{
    const owner = req.user._id
    const logo = req.file
     ? { url: req.file.path, filename: req.file.filename }
     : null;
     const rawDepartments = req.body.departments || [];

     const departments = Array.isArray(rawDepartments)
       ? rawDepartments.filter(dep => dep.trim() !== '')
       : [rawDepartments.trim()].filter(dep => dep !== '');
    const companyInfo = new Company({
        ...req.body,
        department:departments,
        logo:logo,
        owner:owner
    })
    await companyInfo.save()
    console.log(companyInfo)
    req.flash('success',"company information added successfully")
    res.redirect('/dashboard/main')

}
module.exports.showEditComp = async(req,res)=>{
    try {
      const company = await Company.findOne({ owner: req.user._id });
      if (!company) {
        req.flash('error', 'Company not found.');
        return res.redirect('/dashboard');
      }
  
      res.render('adminDashboard/editCompany.ejs', {
        company
      });
    } catch (err) {
      console.error('Error loading company edit page:', err);
      req.flash('error', 'Something went wrong.');
      res.redirect('/dashboard');
    }
  }
  module.exports.updateCompany = async(req,res)=>{

    const rawDepartments = req.body.departments || [];

    const departments = Array.isArray(rawDepartments)
       ? rawDepartments.filter(dep => dep.trim() !== '')
       : [rawDepartments.trim()].filter(dep => dep !== '');
    const company = await Company.findOne({owner:req.user._id})
    company.department=departments
    company.type=req.body.type
    company.name=req.body.name
    if(req.file){
       company.logo= { url: req.file.path, filename: req.file.filename }

    }

    const updatedCompany = await company.save()
    res.redirect('/company')


  
  }
  module.exports.showComp = async(req,res)=>{
    const company = await Company.findOne({ owner: req.user._id })
    if(!company){
        return res.redirect('/company/add')
    }
    const employees = await Employee.find({ company: company._id });
    
    // 1. Total Employees
    const employeeCount = employees.length;
 
    res.render('adminDashboard/company.ejs',{
      company,
      employeeCount
  
    })
  }