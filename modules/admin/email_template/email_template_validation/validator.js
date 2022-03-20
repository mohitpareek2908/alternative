const {body, validationResult } = require('express-validator');
//const User = this;
const Block = this;




/**
 * Function for edit Block validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editEmailTemplateRules = (req,res) =>{

return   [
	body('name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		  consoleLog(value);
		  consoleLog(req.body);
		  consoleLog(location);
		  consoleLog(path);
        return req.__('admin.email_template.please_enter_name', { value, location, path });
      }),
	  body('email_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.subject').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.email_template.please_enter_subject', { value, location, path });
      }),
	  body('email_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.body').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.email_template.please_enter_email_body', { value, location, path });
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
	editEmailTemplateRules,
  validate,
}
