const {body, validationResult } = require('express-validator');
//const User = this;
const City = this;



/**
 * Function for add city validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addCityValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body("country_id")
	.notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.state.please_select_country_name', { value, location, path });
      }),
	body('state_id') 
	.notEmpty() 
    .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.state.please_enter_state_name', { value, location, path });
      }),
      body('city_name')  
	  .notEmpty()
      .withMessage((value, { req, location, path }) => {
          
          return req.__('admin.state.please_enter_city_name', { value, location, path });
        }),
  ]
}

const editCityValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body("country_id")
	.notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.state.please_select_country_name', { value, location, path });
      }),
	body('state_id')  
	.notEmpty()
    .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.state.please_enter_state_name', { value, location, path });
      }),
      body('city_name')  
	  .notEmpty()
      .withMessage((value, { req, location, path }) => {
          
          return req.__('admin.state.please_enter_city_name', { value, location, path });
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
    addCityValidationRules,
	editCityValidationRules,
  validate,
}
