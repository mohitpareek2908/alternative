const {body, validationResult } = require('express-validator');

const ad = this;


/**
 *  Function for valdation of add ads management 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addValidationRules = (req,res) => {
	/** Check validation **/
	
	return   [ 
	body('full_name')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('front.contactus.please_enter_name', { value, location, path });
      }),
	  body('message')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('front.contactus.please_enter_message', { value, location, path });
      }),
	body('email')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('front.contactus.please_enter_email', { value, location, path });
      }),
	body('phone')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('front.contactus.please_enter_phone', { value, location, path });
      }),
	body('subject')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('front.contactus.please_enter_subject', { value, location, path });
      }),

  ]
}










/**
 * Function for validate error and return
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const validate = (req, res, next) => {
	if(isPost(req)){
		const allErrors = validationResult(req)
		if (allErrors.isEmpty()) {
			return next()
		}
		let formErrors = parseValidation(allErrors.errors);	
		
		return res.send({
			status : STATUS_ERROR,
			message : formErrors
		});
	}else{
		return next()
	}
}

module.exports = {
  addValidationRules,
   validate,
}
