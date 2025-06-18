const { validationResult } = require('express-validator');

// Middleware to validate request
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// Validation rules for different routes
const validationRules = {
    // Auth validation rules
    auth: {
        login: [
            { field: 'email', rules: 'isEmail', message: 'Please enter a valid email' },
            { field: 'password', rules: 'notEmpty', message: 'Password is required' }
        ],
        signup: [
            { field: 'name', rules: 'notEmpty', message: 'Name is required' },
            { field: 'email', rules: 'isEmail', message: 'Please enter a valid email' },
            { field: 'password', rules: 'isLength({ min: 6 })', message: 'Password must be at least 6 characters long' }
        ]
    },
    // Property validation rules
    property: {
        create: [
            { field: 'name', rules: 'notEmpty', message: 'Property name is required' },
            { field: 'location', rules: 'notEmpty', message: 'Location is required' },
            { field: 'totalValue', rules: 'isNumeric', message: 'Total value must be a number' },
            { field: 'description', rules: 'notEmpty', message: 'Description is required' }
        ]
    },
    // Crowdfunding validation rules
    crowdfunding: {
        create: [
            { field: 'property', rules: 'isMongoId', message: 'Invalid property ID' },
            { field: 'description', rules: 'notEmpty', message: 'Description is required' },
            { field: 'endDate', rules: 'isDate', message: 'Invalid end date' },
            { field: 'totalTokens', rules: 'isInt({ min: 1 })', message: 'Total tokens must be a positive integer' },
            { field: 'tokenPrice', rules: 'isNumeric', message: 'Token price must be a number' }
        ]
    },
    // Payment validation rules
    payment: {
        create: [
            { field: 'crowdfundingId', rules: 'isMongoId', message: 'Invalid crowdfunding ID' },
            { field: 'tokens', rules: 'isInt({ min: 1 })', message: 'Tokens must be a positive integer' }
        ]
    },
    // Voting validation rules
    voting: {
        create: [
            { field: 'crowdfundingId', rules: 'isMongoId', message: 'Invalid crowdfunding ID' },
            { field: 'title', rules: 'notEmpty', message: 'Voting title is required' },
            { field: 'description', rules: 'notEmpty', message: 'Description is required' },
            { field: 'endDate', rules: 'isDate', message: 'Invalid end date' }
        ],
        vote: [
            { field: 'vote', rules: 'isIn([yes, no])', message: 'Vote must be either yes or no' }
        ]
    }
};

module.exports = {
    validateRequest,
    validationRules
}; 