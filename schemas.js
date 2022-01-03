
const Joi = require('joi');

module.exports.contentSchema = Joi.object({
    content: Joi.object({
        title: Joi.string().required(),
        image: Joi.string().required(),
        story: Joi.string().required(),
    }).required()
});