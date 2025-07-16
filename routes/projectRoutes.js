const express = require('express');
const router = express.Router();
const { isLoggedin } = require('../middleware.js');
const projectController = require('../controllers/projectController.js');

router.get('/', isLoggedin, projectController.listProjects);
router.get('/add', isLoggedin, projectController.renderProjectForm);
router.post('/add', isLoggedin, projectController.createProject);
// router.get('/:id/edit', isLoggedin, projectController.renderEditForm);
// router.post('/:id/edit', isLoggedin, projectController.updateProject);
// router.post('/:id/delete', isLoggedin, projectController.deleteProject);

module.exports = router;
