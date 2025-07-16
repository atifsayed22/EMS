const express =require('express')
const {ValidateInput}=require('../validateInput.js')
const {validationResult}=require('express-validator')
const Admin = require('../models/admin.js')
const Employee = require('../models/employee.js')
const Company = require('../models/company.js')
const passport = require('passport')
const { model } = require('mongoose')
module.exports.renderDashboard = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user._id });
    if (!company) {
      req.flash('error', 'No company found for this admin.');
      return res.redirect('/company/add');
    }

    const employees = await Employee.find({ company: company._id });

    // Calculate active employees
    const activeEmployees = employees.filter(e => e.status === 'Active');

    // Calculate department data
    const departments = company.department || [];
    const departmentCount = departments.map(dept => ({
      name: dept,
      count: employees.filter(e => e.department === dept).length,
    }));

    // Calculate recent hires (last 30 days)
    const recentHires = employees.filter(e => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(e.dateOfJoining) >= thirtyDaysAgo;
    });

    // Calculate monthly salary
    const monthlySalary = employees.reduce((sum, e) => sum + e.salary, 0);

    res.render('adminDashboard/dashboard.ejs', {
      admin: req.user,
      employees,
      departments,
      departmentCount,
      recentHiresCount: recentHires.length,
      monthlySalary,
      largestDepartment: departmentCount.sort((a, b) => b.count - a.count)[0]?.name || 'N/A',
    });
  } catch (err) {
    console.error("Error rendering dashboard:", err);
    req.flash('error', 'Failed to load dashboard.');
    res.redirect('/');
  }
};
module.exports.employeesRender = async (req, res) => {
  try {
      const company = await Company.findOne({ owner: req.user._id });
      if (!company) {
          req.flash('error', 'No company found');
          return res.redirect('/dashboard');
      }

      // Pagination setup
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // Employees per page
      const skip = (page - 1) * limit;

      // Get employees with pagination
      const employees = await Employee.find({ company: company._id })
          .skip(skip)
          .limit(limit);

      // Count all employees (for pagination)
      const totalEmployees = await Employee.countDocuments({ company: company._id });
      const totalPages = Math.ceil(totalEmployees / limit);

      // Count employees by status
      const activeCount = await Employee.countDocuments({ 
          company: company._id, 
          status: 'Active' 
      });
      const resignedCount = await Employee.countDocuments({
          company: company._id,
          status: 'Resigned'
      });
      const firedCount = await Employee.countDocuments({
          company: company._id,
          status: 'Fired'
      });

      res.render('adminDashboard/employees.ejs', {
          employees,
          admin: req.user,
          departments: company.department,
          // Pagination data
          currentPage: page,
          totalPages,
          totalEmployees,
          // Status counts
          activeCount,
          resignedCount,
          firedCount,
          // Search query (if needed)
          query: req.query.q || ''
      });

  } catch (err) {
      console.error("Error in employeesRender:", err);
      req.flash('error', 'Failed to load employee directory');
      res.redirect('/dashboard');
  }
};
module.exports.renderReport = async (req, res) => {
    try {
      const company = await Company.findOne({ owner: req.user._id });
      if (!company) {
        return res.redirect("/company/add");
      }
  
      const employees = await Employee.find({ company: company._id });
  
      // 1. Total Employees
      const totalEmployees = employees.length;
  
      // 2. Count by Status
      const activeCount = employees.filter(e => e.status === 'Active').length;
      const firedCount = employees.filter(e => e.status === 'Fired').length;
      const resignedCount = employees.filter(e => e.status === 'Resigned').length;
  
      // 3. Count by Department
      const departmentCount = {};
      for (let dept of company.department) {
        departmentCount[dept] = employees.filter(e => e.department === dept).length;
      }
  
      // 4. Salary Summary
      const totalSalary = employees.reduce((acc, e) => acc + e.salary, 0);
      const paidCount = employees.filter(e => e.salaryPaid).length;
      const unpaidCount = totalEmployees - paidCount;
  
      // 5. Recently Joined Employees (last 30 days)
      const recentlyJoined = employees.filter(e => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(e.dateOfJoining) >= thirtyDaysAgo;
      });
  
      // Send to EJS
      res.render('adminDashboard/report.ejs', {
        admin: req.user,
        employees,
        company,
        totalEmployees,
        activeCount,
        firedCount,
        resignedCount,
        departmentCount,
        totalSalary,
        paidCount,
        unpaidCount,
        recentlyJoined
      });
  
    } catch (err) {


      res.status(500).send("Error generating report.");
    }
  };
  module.exports.addEmp = async (req, res) => {
    try {
        console.log("💡 POST /dashboard/employees/new triggered");
        
        // Validate files were uploaded
        if (!req.files?.profileImage || !req.files?.cvFile) {
            req.flash('error', 'Please upload both profile image and CV');
            return res.redirect('/dashboard/employees/new');
        }

        const company = await Company.findOne({ owner: req.user._id });
        if (!company) {
            req.flash('error', 'No company found for this admin');
            return res.redirect('/dashboard/employees/new');
        }

        const newEmployee = new Employee({
            ...req.body,
            profileImage: req.files.profileImage[0].path,
            cvFile:req.files.cvFile[0].path,
            status: 'Active', // Default status
            company:company._id
        });

        await newEmployee.save();
        req.flash('success', 'Employee added successfully!');
        return res.redirect('/dashboard/employees');

    } catch (err) {
        console.error("Error adding employee:", err);
        req.flash('error', err.message || 'Failed to add employee');
        return res.redirect('/dashboard/employees/new');
    }
};
 
  module.exports.showEmp = async(req,res)=>{
    let{id}= req.params

    const employee = await Employee.findOne({_id:id})
    res.render('adminDashboard/showEmployee.ejs',{employee})
  }
module.exports.addEmpForm = async(req,res)=>{
    const company = await Company.findOne({ owner: req.user._id });
    res.render('adminDashboard/newEmployee.ejs',{departments:company.department})
}
module.exports.renderEdit = async(req,res)=>{
  let {id} = req.params
  const employee = await Employee.findById(id)
  const company = await Company.findOne({ owner: req.user._id });
  const departments = company?.department || [];
  res.render('adminDashboard/edit.ejs',{employee,departments})
}
module.exports.updateEmp = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      mobile,
      department,
      role,
      dateOfJoining,
      salary,
      salaryPaid,
      status,
      terminationDate,
      terminationReason
    } = req.body;

    const employee = await Employee.findById(id);

    if (!employee) {
      req.flash('error', 'Employee not found.');
      return res.redirect('/dashboard/employees');
    }

    // Update basic fields
    employee.firstName = firstName;
    employee.lastName = lastName;
    employee.email = email;
    employee.mobile = mobile;
    employee.department = department;
    employee.role = role;
    employee.dateOfJoining = dateOfJoining;
    employee.salary = salary;
    employee.salaryPaid = !!salaryPaid;
    employee.status = status;

    // Only update termination details if applicable
    if (status === 'Fired' || status === 'Resigned') {
      employee.terminationDate = terminationDate || null;
      employee.terminationReason = terminationReason || '';
    } else {
      employee.terminationDate = null;
      employee.terminationReason = '';
    }

    // Handle new profile image (if uploaded)
    if (req.files?.['profileImage']) {
      const img = req.files['profileImage'][0];
      employee.profileImage = img.path;
    }

    // Handle new CV (if uploaded)
    if (req.files?.['cvFile']) {
      const cv = req.files['cvFile'][0];
      employee.cvFile = cv.path;
    }

    await employee.save();

    req.flash('success', 'Employee updated successfully.');
    res.redirect(`/dashboard/employees/${id}`);
  } catch (err) {
    console.error("Update Error:", err);
    req.flash('error', 'Something went wrong while updating employee.');
    res.redirect(`/dashboard/employees/${req.params.id}`);
  }
};
module.exports.showComp = async(req,res)=>{
  const company = await Company.findOne({ owner: req.user._id })
  const employees = await Employee.find({ company: company._id });
  
  // 1. Total Employees
  const employeeCount = employees.length;

  res.render('adminDashboard/company.ejs',{
    company,
    employeeCount

  })
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
  
  console.log(req.files)
  res.send(req.body)

}