const {body, validationResult } = require('express-validator');

const User = this;




/**
 * Function for edit user validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const editPostValidationRules = (req,res) =>{
	/** Check validation **/	
	return   [
	body('title')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_title', { value, location, path });
		}),
		
		body('description')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_description', { value, location, path });
		}),	

		body('post_tags')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_post_tags', { value, location, path });
		}),	
		
		body('interest_id')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_select_interest', { value, location, path });
		}),	
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
const addPostValidationRules = (req,res) => {

	/** Check validation **/	
return   [
	body('title')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_title', { value, location, path });
		}),
		
		body('description')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_description', { value, location, path });
		}),	

		body('post_tags')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_enter_post_tags', { value, location, path });
		}),	
		
		body('interest_id')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		return req.__('front.post.please_select_interest', { value, location, path });
		}),	
		
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
const postReportValidationRules = (req,res) => {

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
addPostValidationRules,
editPostValidationRules,
postReportValidationRules,
}
