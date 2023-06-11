const Joi = require("joi");

const adminValidator = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = {
  adminValidator
}
