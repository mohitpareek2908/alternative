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
		body('name')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_title', { value, location, path });
		}),
		
		body('description')  
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_description', { value, location, path });
		}),	

		body('age_type')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.campaign.please_select_age_type', { value, location, path });
		}),	
		
		body('post_media_type')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('admin.campaign.please_select_post_media_type', { value, location, path });
		}),

		body('kid_interest_id')
		.custom((value, { req, location, path  }) => {
		
			let ageType	 = req.body.age_type;
			if (ageType === 'null' || typeof ageType === 'undefined') { return true;}
			if(typeof(ageType) == "string"){
				
				ageType = [ageType]
			}
			
			if(Object.values(ageType).indexOf("kid") > -1 && (value == "" || typeof(value)==typeof(undefined) ))
			{
				consoleLog("inside if condition")
				return Promise.reject(req.__('front.campaign.please_select_interest', { value, location, path }));
			}else{
				return true;
			}
			
			}),
		
		body('teen_interest_id')
		.custom((value, { req, location, path  }) => {

			
			let ageType	 = req.body.age_type;
			if (ageType === 'null' || typeof ageType === 'undefined') { return true;}
			if(typeof(ageType) == "string"){
				
				ageType = [ageType]
			}
			
			if(Object.values(ageType).indexOf("teen") > -1 && (value == "" || typeof(value)==typeof(undefined) ))
			{
				consoleLog("inside if condition")
				return Promise.reject(req.__('front.campaign.please_select_interest', { value, location, path }));
			}else{
				return true;
			}
			
			}),
		body('adult_interest_id')
		.custom((value, { req, location, path  }) => {
			let ageType	 = req.body.age_type;
			if (ageType === 'null' || typeof ageType === 'undefined') { return true;}
			if(typeof(ageType) == "string"){
				
				ageType = [ageType]
			}
			
			if(Object.values(ageType).indexOf("adult") > -1 && (value == "" || typeof(value)==typeof(undefined) ))
			{
				consoleLog("inside if condition")
				return Promise.reject(req.__('front.campaign.please_select_interest', { value, location, path }));
			}else{
				return true;
			}
			
			}),		


		body('campaign_type')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.campaign.please_select_campaign_type', { value, location, path });
		}),	

		// body('budget')
		// .notEmpty()
		// .withMessage((value, { req, location, path }) => {
		// return req.__('front.campaign.please_enter_budget', { value, location, path });
		// })
		// .isFloat({ min:CAMPAIGN_BUDGET_MIN_VLAUE})
		// .withMessage((value, { req, location, path }) => {
		// 	return req.__('front.campaign.minimum_budget_err', { value, location, path });
		// 	}),	

		body('duration_start_date')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.campaign.please_select_duration_start_date', { value, location, path });
		}),	

		body('duration_end_date')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.campaign.please_select_duration_end_date', { value, location, path });
		}),	



		body('website_url')
		.custom((value, { req, location, path  }) => {
			let campaignType = req.body.campaign_type;
			
			if(campaignType == "company" && value == "" )
			{
			
				return Promise.reject(req.__('front.campaign.please_enter_website_url', { value, location, path }));
			}
			return true;
			})

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
		body('name')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_title', { value, location, path });
		}),
		
		body('description')  
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_description', { value, location, path });
		}),	

		body('age_type')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.campaign.please_select_age_type', { value, location, path });
		}),	
		
		body('post_media_type')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('admin.campaign.please_select_post_media_type', { value, location, path });
		}),

		body('kid_interest_id')
		.custom((value, { req, location, path  }) => {
		
			let ageType	 = req.body.age_type;
			if (ageType === 'null' || typeof ageType === 'undefined') { return true;}
			if(typeof(ageType) == "string"){
				
				ageType = [ageType]
			}
			
			if(Object.values(ageType).indexOf("kid") > -1 && (value == "" || typeof(value)==typeof(undefined) ))
			{
				consoleLog("inside if condition")
				return Promise.reject(req.__('front.campaign.please_select_interest', { value, location, path }));
			}else{
				return true;
			}
			
			}),
		
		body('teen_interest_id')
		.custom((value, { req, location, path  }) => {

			
			let ageType	 = req.body.age_type;
			if (ageType === 'null' || typeof ageType === 'undefined') { return true;}
			if(typeof(ageType) == "string"){
				
				ageType = [ageType]
			}
			
			if(Object.values(ageType).indexOf("teen") > -1 && (value == "" || typeof(value)==typeof(undefined) ))
			{
				consoleLog("inside if condition")
				return Promise.reject(req.__('front.campaign.please_select_interest', { value, location, path }));
			}else{
				return true;
			}
			
			}),
		body('adult_interest_id')
		.custom((value, { req, location, path  }) => {
			let ageType	 = req.body.age_type;
			if (ageType === 'null' || typeof ageType === 'undefined') { return true;}
			if(typeof(ageType) == "string"){
				
				ageType = [ageType]
			}
			
			if(Object.values(ageType).indexOf("adult") > -1 && (value == "" || typeof(value)==typeof(undefined) ))
			{
				consoleLog("inside if condition")
				return Promise.reject(req.__('front.campaign.please_select_interest', { value, location, path }));
			}else{
				return true;
			}
			
			}),		


		body('campaign_type')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.campaign.please_select_campaign_type', { value, location, path });
		}),	

		// body('budget')
		// .notEmpty()
		// .withMessage((value, { req, location, path }) => {
		// return req.__('front.campaign.please_enter_budget', { value, location, path });
		// })
		// .isFloat({ min:CAMPAIGN_BUDGET_MIN_VLAUE})
		// .withMessage((value, { req, location, path }) => {
		// 	return req.__('front.campaign.minimum_budget_err', { value, location, path });
		// 	}),	

		body('duration_start_date')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.campaign.please_select_duration_start_date', { value, location, path });
		}),	

		body('duration_end_date')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.campaign.please_select_duration_end_date', { value, location, path });
		}),	



		body('website_url')
		.custom((value, { req, location, path  }) => {
			let campaignType = req.body.campaign_type;
			
			if(campaignType == "company" && value == "" )
			{
			
				return Promise.reject(req.__('front.campaign.please_enter_website_url', { value, location, path }));
			}
			return true;
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
  addValidationRules,
  editValidationRules,
  validate,
}
