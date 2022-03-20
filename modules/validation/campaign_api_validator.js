const {body, validationResult } = require('express-validator');

const Campaign = this;




/**
 * Function for edit user validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const editCampaignValidationRules = (req,res) =>{
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
			
			body('interest_id')
			.notEmpty()
			.withMessage((value, { req, location, path }) => {
			return req.__('front.campaign.please_select_interest', { value, location, path });
			}),	
	
			body('budget')
			.notEmpty()
			.withMessage((value, { req, location, path }) => {
			return req.__('front.campaign.please_enter_budget', { value, location, path });
			})
			.isFloat({ min:CAMPAIGN_BUDGET_MIN_VLAUE})
			.withMessage((value, { req, location, path }) => {
				return req.__('front.campaign.minimum_budget_err', { value, location, path });
				}),	
	
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
 * Function for add user validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const addCampaignValidationRules = (req,res) => {

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
			
			body('interest_id')
			.notEmpty()
			.withMessage((value, { req, location, path }) => {
			return req.__('front.campaign.please_select_interest', { value, location, path });
			}),	
	
			body('budget')
			.notEmpty()
			.withMessage((value, { req, location, path }) => {
			return req.__('front.campaign.please_enter_budget', { value, location, path });
			})
			.isFloat({ min:CAMPAIGN_BUDGET_MIN_VLAUE})
			.withMessage((value, { req, location, path }) => {
				return req.__('front.campaign.minimum_budget_err', { value, location, path });
				}),	
	
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
 * Function for  post report validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const campaignReportValidationRules = (req,res) => {

	/** Check validation **/	
return   [
	body('comment')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_commnent', { value, location, path });
		}),

	]
	
}
	




module.exports = {
addCampaignValidationRules,
editCampaignValidationRules,
campaignReportValidationRules,
}
