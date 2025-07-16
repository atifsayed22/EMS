const {body} = require('express-validator')

module.exports.ValidateInput=[
    body('firstName').notEmpty().withMessage("First name is required"),
    body('lastName').notEmpty().withMessage("Last name is required"),
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage("enter a valid email"),
    body('mobile')
    .isMobilePhone().withMessage('Enter a valid mobile number'),
    body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    
]
module.exports.ValidateLogin=[
    body('username').notEmpty().withMessage("username can't be empty"),
    body('password').notEmpty().withMessage("password ca't be empty")
]