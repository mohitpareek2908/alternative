const {body, validationResult } = require('express-validator');
//const User = this;
const Country = this;

/**
 * Function for add Country  validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addCountryValidationRules = (req,res) => {
	/** Check validation **/	
	return   [  
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.country_name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.country.please_enter_country_name', { value, location, path });
      }),
	body('country_iso_code').notEmpty()  
    .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.country.please_enter_country_iso_code', { value, location, path });
      }),
      body('country_code').notEmpty()  
      .withMessage((value, { req, location, path }) => {
          
          return req.__('admin.country.please_enter_country_code', { value, location, path });
        }),
  ]
}

/**
 * Function for edit Country validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editCountryValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body("country_name").notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.country.please_enter_country_name', { value, location, path });
      }),
	body('country_iso_code').notEmpty()  
    .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.country.please_enter_country_iso_code', { value, location, path });
      }),
      body('country_code').notEmpty()  
      .withMessage((value, { req, location, path }) => {
          
          return req.__('admin.country.please_enter_country_code', { value, location, path });
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
    addCountryValidationRules,
	editCountryValidationRules,
  validate,
}
