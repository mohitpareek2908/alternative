const {body, validationResult } = require('express-validator');

const ad = this;


/**
 *  Function for valdation of contact management 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const replyValidationRules = (req,res) => {
	/** Check validation **/
	
	return   [
		body('reply')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
			consoleLog("found here");
		return req.__('front.post.please_enter_reply', { value, location, path });
		})

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
		consoleLog(formErrors);
		return res.send({
			status : STATUS_ERROR,
			message : formErrors
		});
	}else{
		return next()
	}
}

module.exports = {
	replyValidationRules,
  validate,
}
