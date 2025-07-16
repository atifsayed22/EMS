const Project = require('../models/project');
const Company = require('../models/company');
const Employee = require('../models/employee');

module.exports.listProjects = async(req, res) => {
    const company = await Company.findOne({ owner: req.user._id });
    const projects = await Project.find({company: company._id})
        .populate('leader')
        .populate('teamMembers');
    res.render('projects/showprojects.ejs', {projects});
};

module.exports.renderProjectForm = async (req, res) => {
    const company = await Company.findOne({ owner: req.user._id });
    const employees = await Employee.find({ company: company._id });
    res.render('projects/addProject.ejs', { employees, company });
};

module.exports.createProject = async (req, res) => {
    const { title, description, status, leader, teamMembers, startDate, endDate } = req.body;
    const company = await Company.findOne({ owner: req.user._id });

    const newProject = new Project({
        title,
        description,
        status,
        leader,
        teamMembers,
        startDate,
        endDate,
        company: company._id
    });

    await newProject.save();
    req.flash('success', 'Project created successfully!');
    res.redirect('/projects');
};