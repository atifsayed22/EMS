const express = require('express');
const router = express.Router();
const Employee = require('../models/employee.js')
const Company = require('../models/company.js')
const dashboardController = require('../controllers/dashboardController.js');
const { isLoggedin ,isEmployee} = require('../middleware.js');

const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const uploads = multer({ storage });


router.get('/employees/search', isLoggedin, async (req, res) => {
  try {
    const q = req.query.q || '';
    const company = await Company.findOne({ owner: req.user._id });

    const employees = await Employee.find({
      company: company._id,
      $or: [
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { department: new RegExp(q, 'i') },
        {status:new RegExp(q,'i')}
      ]
    });

    // Count for badges and headings
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
      activeCount,
      resignedCount,
      firedCount,
      totalPages: 1,
      currentPage: 1,
      totalEmployees: employees.length,
      query: q
    });
  } catch (err) {
    console.error("Search error:", err);
    req.flash('error', 'Something went wrong during search');
    res.redirect('/dashboard/employees');
  }
});

router.route('/main')
  .get(isLoggedin, dashboardController.renderDashboard);

router.route('/employees/new')
  .get(isLoggedin, dashboardController.addEmpForm)
  .post(
    isLoggedin,
    (req, res, next) => {
      console.log('Before upload middleware'); // Debug log
      next();
    },
    uploads.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'cvFile', maxCount: 1 }
    ]),
    (err, req, res, next) => {
      if (err) {
        console.error('Upload error:', err);
        req.flash('error', 'File upload failed');
        return res.redirect('/dashboard/employees');
      }
      next();
    },
    dashboardController.addEmp
  );


router.route('/employees')
  .get(isLoggedin, dashboardController.employeesRender);

  
router.route('/company')
  .get(isLoggedin,dashboardController.showComp)


router.route('/employees/:id')
  .get(isLoggedin,isEmployee, dashboardController.showEmp);
router.route('/employees/:id/edit')
  .get(isLoggedin,isEmployee,dashboardController.renderEdit)
  .put(isLoggedin,
    isEmployee,
    uploads.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'cvFile', maxCount: 1 }
      ]),
    dashboardController.updateEmp)

// Example using MongoDB, update for your DB if needed

router.route('/report')
  .get(isLoggedin, dashboardController.renderReport)


module.exports = router;
