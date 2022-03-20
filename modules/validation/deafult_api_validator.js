const {body, validationResult } = require('express-validator');

const User = this;

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
		let formErrors = "";
		let apiType = (req.body.api_type) 	? req.body.api_type : ADMIN_API_TYPE;
		if((apiType)==MOBILE_API_TYPE || (apiType)==WEP_API_TYPE){
			if(apiType == MOBILE_API_TYPE){
				formErrors = stringValidationFromMobile(allErrors.errors);
			}else{
				formErrors = parseValidationFrontApi(allErrors.errors);
			}
			consoleLog(formErrors);
			let finalResponse = {
				'data': {
					status: STATUS_ERROR,
					errors: formErrors,
					message: formErrors,
				}
			};
			returnApiResult(req, res,finalResponse);
				
		}else{
			formErrors = parseValidation(allErrors.errors);	
			
			return res.send({
				status : STATUS_ERROR,
				message : formErrors
			});
		}
	}else{
		return next()
	}
}

authenticateAccess = (req, res, next) => {
	
	/** JWT Authentication **/
	let jwtOption = {
		token: (req.headers.authorization) ? req.headers.authorization : "",
		secretKey: JWT_CONFIG.secret,
		slug: (req.body.slug) ? req.body.slug : "",
	}

	JWTAuthentication(req, res, jwtOption).then(responseData => {
		
		if (responseData.status == STATUS_ERROR) {
			return res.send({
				status : STATUS_ERROR,
				message : {}
			});
		} else {
			return res.send({
				status : STATUS_SUCCESS,
				message : {}
			});
		}
	});
	
	
}


module.exports = {
  validate,
  authenticateAccess,
}
