const {body, validationResult } = require('express-validator');

const ad = this;


/**
 *  Function for valdation of add ads management 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addValidationRules = (req,res) => {
	/** Check validation **/
	
	return   [
	body('ad_name')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_ad_name', { value, location, path });
      }),
	body('display_placement')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_select_display_placement', { value, location, path });
      }),
	body('redirect_url')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_redirect_url', { value, location, path });
      })
	  .isURL()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_valid_redirect_url', { value, location, path });
      }),
	body('ad_budget')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_ad_budget', { value, location, path });
      })
	  .isNumeric()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_numeric_value', { value, location, path });
      }),
	body('start_date')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_select_start_date', { value, location, path });
      })
	/* .custom((value, { req, location, path  }) => {

		consoleLog(req.body);
		var startDate 			= 	(req.body.start_date)				? 	getUtcDate(req.body.start_date)		:	"";	
		var endDate				= 	(req.body.end_date)					? 	getUtcDate(req.body.end_date)		:	"";
		if(startDate >= endDate)
		{  
			return Promise.reject(req.__("admin.ad_managements.end_date_should_be_greater_than_start_date", { value, location, path }));
			
		}
		 
	}) */,
	body('end_date')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_select_end_date', { value, location, path });
      })
	 // .custom((value, { req, location, path }) => {
		//console.log(req.body);
			
		//}),
	/*body('image')
		.custom((value, { req, location, path }) => {
		  if((typeof req.files == typeof undefined)|| (!req.files) || (typeof req.files.image == typeof undefined)){
			  return Promise.reject(req.__('admin.system.please_select_image', { value, location, path }));
		  }
			
		}),*/
  ]
}




/**
 * Function for valdation of edit ads management 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editValidationRules = (req,res) => {
	/** Check validation **/
	
	return   [
	body('ad_name')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_ad_name', { value, location, path });
      }),
	body('display_placement')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_select_display_placement', { value, location, path });
      }),
	body('redirect_url')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_redirect_url', { value, location, path });
      })
	  .isURL()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_valid_redirect_url', { value, location, path });
      }),
	body('ad_budget')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_ad_budget', { value, location, path });
      })
	  .isNumeric()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_enter_numeric_value', { value, location, path });
      }),
	body('start_date')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_select_start_date', { value, location, path });
      })
	  /* .custom((value, { req, location, path  }) => {

		consoleLog(req.body);
		var startDate 			= 	(req.body.start_date)				? 	getUtcDate(req.body.start_date)		:	"";	
		var endDate				= 	(req.body.end_date)					? 	getUtcDate(req.body.end_date)		:	"";
		if(startDate >= endDate)
		{  
			return Promise.reject(req.__("admin.ad_managements.end_date_should_be_greater_than_start_date", { value, location, path }));
			
		}
		 
	}) */,
	body('end_date')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.ad_managements.please_select_end_date', { value, location, path });
      })
	 // .custom((value, { req, location, path }) => {
		//console.log(req.body);
			
		//}),
	/*body('image')
		.custom((value, { req, location, path }) => {
		  if((typeof req.files == typeof undefined)|| (!req.files) || (typeof req.files.image == typeof undefined)){
			  return Promise.reject(req.__('admin.system.please_select_image', { value, location, path }));
		  }
			
		}),*/
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
		
		return res.send({
			status : STATUS_ERROR,
			message : formErrors
		});
	}else{
		return next()
	}
}

module.exports = {
  addValidationRules,
  editValidationRules,
  validate,
}
