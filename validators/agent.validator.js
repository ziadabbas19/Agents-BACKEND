const joi = require('joi');

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday','Thursday', 'Friday', 'Saturday'];

exports.createAgentSchema = joi.object({
    name: joi.string().min(2).required(),
    code: joi.string().alphanum().min(2).required(),
    phone: joi.string().optional(),
    notes: joi.string().optional(),
    // areas: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)).required(),
    vacation: joi.array()
    .items(
        joi.string()
        .insensitive()
        .valid(...daysOfWeek)
        .custom((value) => {
          // Normalize format: first letter capital, rest lowercase
            const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            if (!daysOfWeek.includes(normalized)) {
            throw new Error('Invalid day format');
            }
            return normalized;
        }, 'Normalize day format')
    )
    .required()

});

// UPDATE AGENT SCHEMA
exports.updateAgentSchema = joi.object({
    name: joi.string().min(3).max(100).trim(),
    code: joi.string().min(2).max(50).trim(),
    phone: joi.string().pattern(/^[0-9+\-\s()]+$/).allow('', null).trim(),
    notes: joi.string().max(500).allow('', null).trim(),
    vacation: joi.array().items(joi.string()),
    areas: joi.array().items(joi.string().trim()).min(1)
}).min(1);