const {body, validationResult } = require('express-validator');
//const User = this;
const State = this;

/**
 * Function for add Country  validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addStateValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body("country_id")
	.notEmpty()
	.withMessage((value, { req, location, path }) => {
		
        return req.__('admin.state.please_select_country_name', { value, location, path });
      }),
	body('state_name')  
	.notEmpty()
    .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.states.please_enter_states_name', { value, location, path });
      }),
  ]
}

/**
 * Function for edit Country validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editStateValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body("country_id")
	.notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.state.please_select_country_name', { value, location, path });
      }),
	body('state_name')
	.notEmpty()  
    .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.states.please_enter_states_name', { value, location, path });
      }),
  ]
}


/**
 * Function for validate error and return
 * @param req As Request Data
 * @param res As Response Data
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
    addStateValidationRules,
	editStateValidationRules,
  validate,
}
