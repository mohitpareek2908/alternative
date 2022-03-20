const {body, validationResult } = require('express-validator');
//const User = this;
const Block = this;



/**
 * Function for add CMS Page validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addCMSValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_page_name', { value, location, path });
      }),
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.body').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_page_description', { value, location, path });
      }),
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.meta_title').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_meta_title', { value, location, path });
      }), 
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.meta_description').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_meta_description', { value, location, path });
      }), 
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.meta_keyword').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_meta_keyword', { value, location, path });
      }),  
  ]
}


/**
 * Function for edit CMS Page validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editCMSValidationRules = (req,res) =>{

	return   [
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_page_name', { value, location, path });
      }),
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.body').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_page_description', { value, location, path });
      }),
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.meta_title').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_meta_title', { value, location, path });
      }), 
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.meta_description').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_meta_description', { value, location, path });
      }), 
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.meta_keyword').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.cms.please_enter_meta_keyword', { value, location, path });
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
  editCMSValidationRules,
  addCMSValidationRules,
  validate,
}
