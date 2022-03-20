const {body, validationResult } = require('express-validator');
//const User = this;
const Block = this;



/**
 * Function for add Faq validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addFaqValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body('user_type').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.faq.please_select_faq_user_type', { value, location, path });
      }),
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.question').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.faq.please_enter_faq_question', { value, location, path });
      }),
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.answer').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.faq.please_enter_faq_answer', { value, location, path });
      }),
  ]
}


/**
 * Function for edit Block validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editFaqValidationRules = (req,res) =>{

	return   [
	body('user_type').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.faq.please_select_faq_user_type', { value, location, path });
      }),
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.question').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.faq.please_enter_faq_question', { value, location, path });
      }),
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.answer').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.faq.please_enter_faq_answer', { value, location, path });
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
  editFaqValidationRules,
  addFaqValidationRules,
  validate,
}
