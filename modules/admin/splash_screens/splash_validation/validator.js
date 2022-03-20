const {body, validationResult } = require('express-validator');

const Splash = this;



/**
 * Function for add Splash validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addSplashValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
		body('post_media_type').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.splashscreens.please_select_post_media_type', { value, location, path });
      }),
		body('page_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.title').notEmpty()
		.withMessage((value, { req, location, path }) => {
			return req.__('admin.splashscreens.please_enter_title', { value, location, path });
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
const editSplashValidationRules = (req,res) =>{ 

	return   [
	body('post_media_type').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.splashscreens.please_select_post_media_type', { value, location, path });
      }),
	body('page_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.title').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.splashscreens.please_enter_title', { value, location, path });
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
  editSplashValidationRules,
  addSplashValidationRules,
  validate,
}
