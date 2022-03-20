const {body, validationResult } = require('express-validator');

const Splash = this;



/**
 * Function for add Splash validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addTestimonialsValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
		body('page_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.name').notEmpty()
		.withMessage((value, { req, location, path }) => {
			return req.__('admin.testimonial.please_enter_name', { value, location, path });
		}),
		body('page_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.description').notEmpty()
		.withMessage((value, { req, location, path }) => {
			return req.__('admin.splashscreens.please_enter_description', { value, location, path });
		})
	]
	
}


/**
 * Function for edit Splash validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editTestimonialsValidationRules = (req,res) =>{

	return   [
	body('page_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.testimonial.please_enter_name', { value, location, path });
      }),
	body('page_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.description').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.splashscreens.please_enter_description', { value, location, path });
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
  editTestimonialsValidationRules,
  addTestimonialsValidationRules,
  validate,
}
