const express = require('express');
const router = express.Router();
const Employee = require('../models/employee.js')
const Company = require('../models/company.js')
const companyController = require('../controllers/companyController.js');
const { isLoggedin } = require('../middleware.js');

const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const uploads = multer({ storage });

router.route('/')
  .get(isLoggedin,companyController.showComp)

router.route('/add')
    .get(isLoggedin,companyController.renderCompanyForm)
    .post(isLoggedin, uploads.single('logo'), companyController.addCompany)


router.route('/edit')
    .get(isLoggedin,companyController.showEditComp)
    .post(isLoggedin,
        uploads.single('logo'),
        companyController.updateCompany)

module.exports=router