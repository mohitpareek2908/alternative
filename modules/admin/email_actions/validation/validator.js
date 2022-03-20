const {body, validationResult } = require('express-validator');

const User = this;



/**
 * Function for edit Setting validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const editEmailActionValidationRules = (req,res) =>{

	return   [

		body('action')
		  .notEmpty()
		  .withMessage((value, { req, location, path }) => {
			return req.__('admin.email_actions.please_enter_action', { value, location, path });
		  }),
		body('options')
		  .notEmpty()
		  .withMessage((value, { req, location, path }) => {
			return req.__('admin.email_actions.please_enter_options', { value, location, path });
		  }), 
	
	  ]
	
	
}

/**
 * Function for add Setting validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const addEmailActionValidationRules = (req,res) => {
	/** Check validation **/	

	return   [

		body('action')
		  .notEmpty()
		  .withMessage((value, { req, location, path }) => {
			return req.__('admin.email_actions.please_enter_action', { value, location, path });
		  }),
		body('options')
		  .notEmpty()
		  .withMessage((value, { req, location, path }) => {
			return req.__('admin.email_actions.please_enter_options', { value, location, path });
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
	//	consoleLog(allErrors);
		if (allErrors.isEmpty()) {
			return next()
		}
		let formErrors = parseValidation(allErrors.errors);	
		//let formErrors = allErrors.errors;	
		
		return res.send({
			status : STATUS_ERROR,
			message : formErrors
		});
	}else{
		return next()
	}
}

module.exports = {
	addEmailActionValidationRules,
	editEmailActionValidationRules,
    validate,
}
