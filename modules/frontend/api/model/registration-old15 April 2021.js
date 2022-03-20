const userService = require(WEBSITE_SERVICES_FOLDER_PATH+'user_service');
const jwt 			= require('jsonwebtoken');
var crypto 			= require('crypto');
const tokenList 	= {};
function Registration() {

	Registration = this;
	var currentDate = String(getUtcDate().getDate()).padStart(2, '');
	
	

	 /** Function for login user
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.login = (req,res,next,callback)=>{
		/** Sanitize Data **/
		req.body 		= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		let roleType	=	(req.body.role_type)	?	req.body.role_type 	:"";
		let finalResponse = {};
		
			
		const crypto 		= 	require("crypto");
		let username 		=	(req.body.email)	? 	req.body.email	:"";
		let simplePassword 	= 	(req.body.password)		? 	req.body.password	:"";
		let apiType 		= 	(req.body.api_type)		? 	req.body.api_type	:"";
		consoleLog(req.body);
		
		/** Set conditions **/
		let conditions	=	{
			user_role_id	:	{$in : [ADULTS_USER_ROLE_ID,TEENS_USER_ROLE_ID,KIDS_USER_ROLE_ID]},
			is_deleted		:	NOT_DELETED,
		};

		
	
		conditions["$or"] 		=	[
			{"email"			: 	{$regex : '^'+username+'$',$options : 'i'}}, // this regex used to check user name with case insensitive
			{'phone_number'	:	username}
		];
		
		
		/** Set options data for get user details **/
		let userOptions = {
			conditions	:	conditions,
			fields		:	{facebook_id :0,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,modified:0}
		};
		
		/** Get user details **/
		getUserDetailBySlug(req, res, userOptions).then(userResponse => {
		
			let resultData	=	(userResponse.result) ? userResponse.result :"";
			
			if(!resultData){
				/** Send error/success response **/
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: {},
						token: "",
						refresh_token: "",
						token_life		: 	JWT_CONFIG.tokenLife,
						message: res.__("user.email_entered_incorrect")
					}
				};
				return returnApiResult(req, res,finalResponse);
				
				
			}
			
			let password =  (resultData.password) ? resultData.password : "";
			
			bcryptCheckPasswordCompare(simplePassword,password).then(function(passwordMatch) {
				
				if(!passwordMatch){
					
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR_INVALID_ACCESS,
							result: {},
							token: "",
							refresh_token: "",
							token_life		: 	JWT_CONFIG.tokenLife,
							message: res.__("admin.user.please_enter_correct_email_or_password")
						}
					};
					return returnApiResult(req, res,finalResponse);
					
					
				}
				
				if(resultData.user_type != roleType){
					console.log("hi");
					/** Response if user role type not equal to login user role type*/
					finalResponse = {
						'data': {
							status: STATUS_ERROR_INVALID_ACCESS,
							result: {},
							token: "",
							refresh_token: "",
							token_life		: 	JWT_CONFIG.tokenLife,
							message: res.__("Invalid Access")
						}
					};
					return returnApiResult(req, res,finalResponse);
					
				}
				if(resultData.active != ACTIVE){
					/** Response if user deactivated by admin*/
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							result: {},
							token: "",
							refresh_token: "",
							token_life		: 	JWT_CONFIG.tokenLife,
							message: res.__("user.account_temporarily_disabled")
						}
					};
					return returnApiResult(req, res,finalResponse);
					
					
				}
				if(resultData.is_mobile_verified == VERIFIED && resultData.is_email_verified == VERIFIED){
					/** Save user login Logs **/
					Registration.saveLoginLogs(req,res,resultData).then(loginActivityResponse=>{});

					/** Send success response **/
					let fullName = (resultData.full_name) ? resultData.full_name : "";
					let userRoleId = (resultData.user_role_id) ? resultData.user_role_id : "";
					let loginValidateString = (resultData.login_validate_string) ? resultData.login_validate_string : "";

					
					
					/*** Start JWT Authentication ***/
					let userEmail 	= (resultData.email) ? resultData.email : "";
					let slug 		= (resultData.slug) ? resultData.slug : "";
					
					const jwtUser = {
						"email"		: userEmail,
						"slug"		: slug,
					}
					
					/*** End JWT Authentication */
					
					/** Success msg and generate token*/
					jwtTokenGenerate(req,res,jwtUser).then(jwtResponse=>{
						
						tokenList['token'] 			= (jwtResponse.token) ? jwtResponse.token : "";
						tokenList['refresh_token']	= (jwtResponse.refresh_token) ? jwtResponse.refresh_token : "";
						
						let returnResponse = {
							'data': {
								status			:	STATUS_SUCCESS,
								result			: 	resultData,
								image_url		: 	USERS_URL,
								token			: 	(jwtResponse.token) ? jwtResponse.token : "",
								refresh_token	: 	(jwtResponse.refresh_token) ? jwtResponse.refresh_token : "",
								token_life		: 	(jwtResponse.token_life) ? jwtResponse.token_life : "",
								message: res.__("front.user.you_are_logged_in", fullName),
							}
						};
						return returnApiResult(req, res,returnResponse);
					
					});
						
				}else{
					var validateString	=	(resultData.validate_string) ? resultData.validate_string : "";
					var clickLink = "Your email is not verified. ";
					
					 /** Genrate OTP for mobile **/
					getRandomOTP().then(mobile_otp => {
						
						/** Genrate OTP for email **/
						getRandomOTP().then(email_otp => {
							var mobileOtpCode 		= 	mobile_otp;
							var emailOtpCode 		= 	email_otp;
							let updateData = {};
							updateData = {
								mobile_verification_code : mobileOtpCode,
								email_verification_code : emailOtpCode,
							}
							
							const users = db.collection("users");
							users.updateOne({
								_id : ObjectId(resultData._id)
							},
							{$set	: updateData	},(updateErr,updateResult)=>{
								
									//Use to send  forgot password OTP
									var mobileNumber = (resultData.mobile_number) ? resultData.mobile_number : '';
								
									var otpCode = mobileOtpCode;
									var smsBody = ((res.locals.settings['User.resend_otp_message']) ? res.locals.settings['User.resend_otp_message'] : '{OTP}').replace(RegExp('{OTP}', 'g'), otpCode);
									let smsOption = {
										mobile_number: mobileNumber,
										user_id: (resultData._id) ? ObjectId(resultData._id) : '',
										sms_template: smsBody
									}
								//	sendSMS(req, res, smsOption);

									var userId = (resultData._id) ? resultData._id : '';
									var name = (resultData.full_name) ? resultData.full_name : '';
									var email = (resultData.email) ? resultData.email : '';
									var userType = (resultData.user_type) ? resultData.user_type : '';

									var otpCode = emailOtpCode;
									/** Set options for send email ***/
									let emailOptions = {
										to: email,
										action: "resend_otp",
										rep_array: [name, emailOtpCode]
									};
									/** Send email **/
									sendMail(req, res, emailOptions);

									if(apiType == WEP_API_TYPE){
									finalResponse = {
										'data': {
											status: STATUS_ERROR,
											
												result:{
													validate_string : validateString,
													clickLink		:	clickLink,
													mobile_verification_code : mobileOtpCode,
													email_verification_code	:	emailOtpCode
												} ,
												message: clickLink,
											}
										};
									}else{
										finalResponse = {
											'data': {
												status: STATUS_SUCCESS,
												
												result:{
													validate_string : validateString,
													user_type				: userType,
													is_email_verified				: resultData.is_email_verified,
													mobile_verification_code : mobileOtpCode,
													email_verification_code	:	emailOtpCode
												} ,
												message: "Your email not verified.Please verify.",
											}
										};
									}
									return returnApiResult(req, res,finalResponse);
									
							});
						
						});
					})
				}
			});
		});
	
};//End login()






	/**
	 * Function for social user login
	**/
	this.socialUserLogin = function (req, res, callback) {
		/** Sanitize Data **/
		req.body = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);

		/** Check validation **/
		var facebook_id = (req.body.facebook_id) ? req.body.facebook_id : '';
		var google_id = (req.body.google_id) ? req.body.google_id : '';
		var username = (req.body.username) ? req.body.username : '';

		if (facebook_id != '' || google_id != '' || username != '') {
			var users = db.collection(TABLE_USERS);
			users.findOne(
				{
					$and: [
						{ 'email': username }
					],
					$or: [
						{ 'fb_social_id': facebook_id },
						{ 'google_social_id': google_id }
					]
				},
				{
					//~ _id:1
				},
				function (err, result) {
					consoleLog("Result is");
					console.log(result);
					if (result) {
						if (result.active == ACTIVE) {
							if (result.is_admin_approved == VERIFIED) {
								/*** verified users and update social id */
								if (facebook_id != '') {
									users.updateOne(
										{
											_id: ObjectId(result._id)
										},
										{
											$set: {
												facebook_id: facebook_id,
											}
										},
									)
								} else if (google_id != '') {
									users.updateOne(
										{
											_id: ObjectId(result._id)
										},
										{
											$set: {
												google_id: google_id,
											}
										},
									)
								} else {
									users.updateOne(
										{
											_id: ObjectId(result._id)
										},
										{
											$set: {
											}
										},
									)
								}
								/*** verified users */

								/*** Start JWT Authentication ***/
								let userEmail 	= (result.email) ? result.email : "";
								let slug 		= (result.slug) ? result.slug : "";
								let fullName 	= (result.full_name) ? result.full_name : "";

								const jwtUser = {
									"email"		: userEmail,
									"slug"		: slug,
								}
								
								/*** End JWT Authentication */
								
								/** Success msg and generate token*/
								jwtTokenGenerate(req,res,jwtUser).then(jwtResponse=>{
									
									tokenList['token'] 			= (jwtResponse.token) ? jwtResponse.token : "";
									tokenList['refresh_token']	= (jwtResponse.refresh_token) ? jwtResponse.refresh_token : "";
									
									let returnResponse = {
										'data': {
											status			:	STATUS_SUCCESS,
											result			: 	result,
											userExist		: ACTIVE,
											image_url		: 	USERS_URL,
											token			: 	(jwtResponse.token) ? jwtResponse.token : "",
											refresh_token	: 	(jwtResponse.refresh_token) ? jwtResponse.refresh_token : "",
											token_life		: 	(jwtResponse.token_life) ? jwtResponse.token_life : "",
											message: res.__("front.user.you_are_logged_in", fullName),
										}
									};
									return returnApiResult(req, res,returnResponse);
								
								});




								// let userLoginTokenEncoded = authKeyJournate(result);
								// var datap = {
								// 	'data': {
								// 		status: STATUS_SUCCESS,
								// 		userExist: USER_EXIST,
								// 		authKey: userLoginTokenEncoded,
								// 		result: result,
								// 		message: res.__("api.user.welcome_to_egyflyers"),
								// 	}
								// };
							//	return returnApiResult(req, res,datap);
								//callback(datap);
							} else {
								var datap = {
									'data': {
										status: STATUS_SUCCESS,
										result: { otp: result.otp, is_verified: result.is_verified, validate_string: result.validate_string },
										message: res.__("api.user.account_not_verified")
									}
								};
								return returnApiResult(req, res,datap);
								//callback(datap);
							}
						} else {
							var datap = {
								'data': {
									status: STATUS_SUCCESS,
									userExist: DEACTIVE,
									result: "",
									message: res.__("api.user.account_temporarily_disabled")
								}
							};
							return returnApiResult(req, res,datap);
						//	callback(datap);
						}
					} else {
						var datap = {
							'data': {
								status: STATUS_SUCCESS,
								result: "",
								userExist: DEACTIVE,
								message: res.__("api.social.user_does_not_exists")
							}
						};
						return returnApiResult(req, res,datap);
					//	callback(datap);
					}
				}
			)
		} else {
			/** Send error response **/
			var datap = {
				'data': {
					status: STATUS_SUCCESS,
					userExist: DEACTIVE,
					message: res.__("api.social.please_entered_value"),
					result: "",
				}
			};
			return returnApiResult(req, res,datap);
		//	callback(datap);
		}

	};//End login()







	
	/**
	 * Function to user registration
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json 
	 **/
	this.userRegistration = (req,res,next,callback)=>{
		 let finalResponse = {};
		 
		/** Call user service function to add rider user**/
		userService.addUser(req,res,next).then(response=>{
			
			console.log("here hirdeh");
			console.log(response);
			
			if(response.status == STATUS_ERROR_INVALID_ACCESS){
				/** Send error response  **/
				let messages = (response.message) ? response.message : res.__("system.something_going_wrong_please_try_again");
				 finalResponse = {
                    'data': {
                        status: STATUS_ERROR_INVALID_ACCESS,
                        message: messages
                    }
                };
                return returnApiResult(req,res,finalResponse);
			}
			
			/** Form validation Errors**/
			if(response.status == STATUS_ERROR_FORM_VALIDATION){
				/** parse Validation array  **/
				let formErrors = (response.errors) ? response.errors : {};
				/** API type accourding validation send**/
				if((req.body.api_type)==MOBILE_API_TYPE){
					var errors = stringValidationFromMobile(formErrors,req);
				}else{
					var errors = parseValidationFrontApi(formErrors,req);
				}
				
				/** Send error response **/
				if (errors) {
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: errors,
							message	:	errors
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
			}
			
			/** Success Return**/
				if(response.status == STATUS_SUCCESS){
					let messageStr 		=  	(response.message) ? response.message : "";
					let mobileNumber 	= 	(response.result.mobileNumber) ? response.result.mobileNumber : "";
					let email 			=	 (response.result.email) ? response.result.email : "";
					let fullName 		=	 (response.result.fullName) ? response.result.fullName : "";
					let mobileOtpCode 	=	 (response.result.mobileOtpCode) ? response.result.mobileOtpCode : "";
					let emailOtpCode 	=	 (response.result.emailOtpCode) ? response.result.emailOtpCode : "";
					let lastInsertId 	=	 (response.result.lastInsertId) ? response.result.lastInsertId : "";
					let validateString 	=	 (response.result.validateString) ? response.result.validateString : "";
					
					if(email != ""){
						/** Set options for send email ***/
                        let emailOptions = {
                            to: email,
                            action: "front_email_verify_otp",
                            rep_array: [fullName,emailOtpCode]
                        };
                        /** Send email **/
                        sendMail(req, res, emailOptions);
					}
					var smsBody = ((res.locals.settings['User.registration_otp_message']) ? res.locals.settings['User.registration_otp_message'] : '{OTP}').replace(RegExp('{OTP}', 'g'), mobileOtpCode);
					
					 let smsOption = {
						mobile_number: mobileNumber,
						user_id:  MONGO_ID,
						sms_template: smsBody
					}
				//	sendSMS(req, res, smsOption);
					
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							errors: "",
							result:{
								user_id 		: lastInsertId,
							//	mobile_otp 		: mobileOtpCode,
								email_otp  		: emailOtpCode,
								validate_string : validateString
							},
							message	:	res.__("user.user_registered_successfully_message")
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				}
		});	
	}




	/**
	 * Function to edit user profile
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json 
	 **/
	this.editUser1 = (req,res,next,callback)=>{
		let finalResponse = {};
	   /** Call user service function to add rider user**/
	 
	   userService.editUser(req,res,next).then(response=>{

		if(response.status == STATUS_ERROR_INVALID_ACCESS){
			/** Send error response  **/
			let messages = (response.message) ? response.message : res.__("system.something_going_wrong_please_try_again");
			 finalResponse = {
				'data': {
					status: STATUS_ERROR_INVALID_ACCESS,
					message: messages
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		
		/** Form validation Errors**/
		if(response.status == STATUS_ERROR_FORM_VALIDATION){
			/** parse Validation array  **/
			let formErrors = (response.errors) ? response.errors : {};
			/** API type accourding validation send**/
			if((req.body.api_type)==MOBILE_API_TYPE){
				var errors = stringValidationFromMobile(formErrors,req);
			}else{
				var errors = parseValidationFrontApi(formErrors,req);
			}
			
			/** Send error response **/
			if (errors) {
				
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						errors: errors,
						message	:	errors
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
		}
		
		/** Success Return**/
			if(response.status == STATUS_SUCCESS){
				let messageStr 		=  	(response.message) ? response.message : "";
				let mobileNumber 	= 	(response.result.mobileNumber) ? response.result.mobileNumber : "";
				let email 			=	 (response.result.email) ? response.result.email : "";
				let fullName 		=	 (response.result.fullName) ? response.result.fullName : "";
				let mobileOtpCode 	=	 (response.result.mobileOtpCode) ? response.result.mobileOtpCode : "";
				let emailOtpCode 	=	 (response.result.emailOtpCode) ? response.result.emailOtpCode : "";
				let lastInsertId 	=	 (response.result.lastInsertId) ? response.result.lastInsertId : "";
				let validateString 	=	 (response.result.validateString) ? response.result.validateString : "";
				

				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						errors: "",
						result:{
							user_id 		: lastInsertId,
						//	mobile_otp 		: mobileOtpCode,
						//	email_otp  		: emailOtpCode,
						//	validate_string : validateString
						},
						message	:	res.__("front.system.user_details_has_been_updated_successfully")
					}
				};
				return returnApiResult(req,res,finalResponse);
				
			}

	   });	
   }
 

	
	
	/**
	 * Function for resend otp
	 *
	 * @param req	As	Request Data
	 * @param res	As	Response Data
	 * @param next	As	Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.resendOtp = (req,res,next,callback)=>{
		consoleLog("resend OTP called");
		
		/** Sanitize Data **/
		req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		let page			= 	(req.body.page)				?	req.body.page		:"";
		let otpFor			= 	(req.body.otp_for)			?	req.body.otp_for		:OTP_FOR_EMAIL;
		let validateString	= 	(req.body.validate_string)	?	req.body.validate_string	:"";

		consoleLog(req.body);

		consoleLog(validateString);
		
		let finalResponse	=	{};
		if(!validateString){
			consoleLog("Errorrs"+validateString);
			
			finalResponse = {
				'data': {
					status: STATUS_ERROR_INVALID_ACCESS,
					errors: "",
					message: res.__("system.something_going_wrong_please_try_again1"),
				}
			};
			return returnApiResult(req,res,finalResponse);
			
		} 

		consoleLog("resend OTP called 1");
		
		/** Set user conditions **/
		let userConditions = {
			user_role_id :	{$in : [KIDS_USER_ROLE_ID,TEENS_USER_ROLE_ID,ADULTS_USER_ROLE_ID]},
			is_deleted	 :	NOT_DELETED
		};

		if(page == FORGOT_PASSWORD_PAGE_TYPE){
			userConditions["forgot_password_validate_string"] = validateString;
		}else if(page == VERIFY_ACCOUNT_PAGE_TYPE){
			userConditions["validate_string"] = validateString;   
		}else{
			userConditions["_id"] = ObjectId(userId);
		}

		consoleLog("resend OTP called 2");
		consoleLog(userConditions);
		
		/** Set options for get user details **/
		let options = {
			conditions	:	userConditions,
			fields		:	{_id:1,mobile_number:1,phone_country_code:1,email:1,full_name:1}
		};

		/** Get user details **/
		Registration.getUserData(req,res,options).then(response=>{
			consoleLog("response IS");
			consoleLog(response);
			
			if(response.status != STATUS_SUCCESS  && !response.result){
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						errors: "",
						message: res.__("system.something_going_wrong_please_try_again2"),
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
			let result	=	(response.result) ? response.result : {};
			getRandomOTP().then(otp=>{
		
				var day = new Date();
				var nextDay = new Date(day);
				nextDay.setDate(day.getDate() + 1);
				
				let updateData = {};
				if(page == VERIFY_ACCOUNT_PAGE_TYPE){
					if(otpFor == OTP_FOR_MOBILE){
						updateData = {
							mobile_verification_code : otp,
							
						}
					}else if(otpFor == OTP_FOR_EMAIL){
						updateData = {
							email_verification_code : otp,
							
						}	
					}
				}else if(page == FORGOT_PASSWORD_PAGE_TYPE){
					updateData = {
						forgot_password_opt_code : otp
					}
					
				}
				
				updateData['otp_verification_code_time'] = nextDay;
				
				consoleLog("updateData IS");
				consoleLog(updateData);
				/** Update otp number **/
				const users = db.collection("users");
				users.updateOne({
					_id : ObjectId(result._id)
				},
				{$set	: updateData	},(updateErr,updateResult)=>{
					
					
					if (otpFor == OTP_FOR_MOBILE) {

						//Use to send  forgot password OTP
						var mobileNumber = (result.mobile_number) ? result.mobile_number : '';
					
						var otpCode = otp;
						var smsBody = ((res.locals.settings['User.resend_otp_message']) ? res.locals.settings['User.resend_otp_message'] : '{OTP}').replace(RegExp('{OTP}', 'g'), otpCode);
						let smsOption = {
							mobile_number: mobileNumber,
							user_id: (result._id) ? ObjectId(result._id) : '',
							sms_template: smsBody
						}
						sendSMS(req, res, smsOption);  
					
						var successMessage = res.__("front.user.forgot_password_mobile_sms_sent_successfully");

					} else if (otpFor == OTP_FOR_EMAIL) {
						var userId = (result._id) ? result._id : '';
						var name = (result.full_name) ? result.full_name : '';
						var email = (result.email) ? result.email : '';

						var otpCode = otp;
						/** Set options for send email ***/
						let emailOptions = {
							to: email,
							action: "resend_otp",
							rep_array: [name, otpCode]
						};
						/** Send email **/
						sendMail(req, res, emailOptions);
						var successMessage = res.__("front.user.forgot_password_email_sent_successfully");
					}
					
					/** Send success response **/
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							OTP: otp,
							message: successMessage,
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				});
			}).catch(next);
		}).catch(next);
	
	};//End resendOtp()

	
	/**
	 * Function to get user data
	 *
	 * @param req		As	Request Data
	 * @param res		As 	Response Data
	 * @param options	As  object of data
	 *
	 * @return json
	 **/
	this.getUserData = (req,res,options) =>{
		return new Promise(resolve=>{
			let conditions	=	(options.conditions)	?	options.conditions	:{};
			let fields		=	(options.fields)		?	options.fields		:{};

			consoleLog("conditions in getUserData function is ");
			consoleLog(conditions);
			consoleLog(fields);
			
			if(!conditions){
				/** Send error response **/
				return resolve({
					status	:	STATUS_ERROR,
					options	: 	options,
					message	: 	res.__("system.something_going_wrong_please_try_again")
				});
			}	
			
			/** Get user details **/
			const users	=	db.collection("users");
			users.findOne(conditions,{projection: fields},(err,result)=>{

			
				if(err){
					/** Send error response **/
					let response = {
						status	:	STATUS_ERROR,
						options	: 	options,
						message	: 	res.__("system.something_going_wrong_please_try_again")
					};
					return resolve(response);
				}
				
				if(!result){
					/** Send success response **/
					return resolve({
						status	:	STATUS_ERROR,
						result 	: 	false,
						options	: 	options,
					});
				}
				
				if(!result["profile_image"]){
					/** Send success response **/
					return resolve({
						status	:	STATUS_SUCCESS,
						result 	: 	result,
						options	: 	options,
					});
				}
				
				/** Set options for append image **/
				let imageOptions = {
					"file_url" 			: 	USERS_URL,
					"file_path" 		: 	USERS_FILE_PATH,
					"result" 			: 	[result],
					"database_field" 	: 	"profile_image"
				};

				/** Append image with full path **/
				appendFileExistData(imageOptions).then(fileResponse=>{
					/** Send success response **/
					resolve({
						status	:	STATUS_SUCCESS,
						result 	: 	(fileResponse && fileResponse.result && fileResponse.result[0])	?	fileResponse.result[0]	:{},
						options	: 	options,
					});
				});
			});
		});
	}// end getUserData()
	
	/**
	
	
	/**
	 * Function to save user login activity
	 *
	 * @param req		As 	Request Data
	 * @param res		As 	Response Data
	 * @param options	As  object of data
	 *
	 * @return json
	 **/
	this.saveLoginLogs = (req,res,options) =>{
		return new Promise(resolve=>{
			try{
				consoleLog("saveLoginLogs");
				let userId		=	(options._id)			? options._id		:"";
				let deviceType 	= 	(req.body.device_type)	? req.body.device_type 	:"";
				let deviceToken = 	(req.body.device_token)	? req.body.device_token :"";
				let deviceId 	= 	(req.body.device_id)	? req.body.device_id :"";
				let async		=	require('async');
				
				/** Send error response **/
				if(!userId) return resolve({status : STATUS_ERROR, options : options, message : res.__("system.something_going_wrong_please_try_again")});
				
				async.parallel([
					(callback)=>{
						/** Manage update data **/
						let userUpdatedData = {
							$set	:	{
								last_login	:	getUtcDate(),
								modified	:	getUtcDate(),
							}
						};
						
						if(deviceType && deviceToken){
							userUpdatedData["$set"]["device_details"] = [{
								device_type 	: 	deviceType.toLowerCase(),
								device_token	: 	deviceToken,
								device_id		: 	deviceId,
							}];
						}
						
						/** Save user device details **/
						const users	=	db.collection("users");
						users.updateOne({_id : ObjectId(userId)},userUpdatedData,(updateErr,updateResult)=>{
							callback(updateErr,updateResult);
						});
					},
					(callback)=>{
						/** Save user login details **/
						const user_logins	=	db.collection("user_logins");
						user_logins.insertOne({
								user_id			:	ObjectId(userId),
								device_type 	: 	deviceType,
								device_token	: 	deviceToken,
								device_id		: 	deviceId,
								logout_time		: 	"",
								created 		: 	getUtcDate(),
							},(err,insertResult)=>{
								callback(err, insertResult);
							}
						);
					},
				],
				(err, asyncResponse)=>{
					/** Send error response **/
					if(err) return resolve({status : STATUS_ERROR, options: options, message : res.__("system.something_going_wrong_please_try_again")});
					
					/** Send success response **/
					resolve({status	: STATUS_SUCCESS, options	: options});
				});
			}catch(e){
				/** Send error response **/
				resolve({
					status	:	STATUS_ERROR,
					options	: 	options,
					message	: 	res.__("system.something_going_wrong_please_try_again")
				});
			}
		});
	}// end saveLoginLogs()



	
	/**
	 * Function to logout
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.logOut = (req, res, next)=>{
		
			let finalResponse = {};
			consoleLog("logout function called");
			req.body 		= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
			consoleLog(req.body);
			consoleLog(loginUserData);

			let userId 		= 	(loginUserData.user_id) 		?	loginUserData.user_id 		:"";
			let deviceType 	= 	(loginUserData.device_type)	? 	loginUserData.device_type 	:"";
			let deviceToken = 	(loginUserData.device_token)	? 	loginUserData.device_token	:"";

			/** Send error response **/
			if (!userId || !deviceToken || !deviceType) {
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						
						result:{
							
						} ,
						message: res.__("system.missing_parameters"),
					}
				};

				return returnApiResult(req, res,finalResponse);

			}
		//	return resolve({status : STATUS_ERROR, message	: res.__("system.missing_parameters")});
			
			/** Update user details **/
			const users	=	db.collection('users');
			users.updateOne({
				_id	:	ObjectId(userId)
			},
			{$pull: {
				device_details: {
					device_type	: deviceType , 
					device_token: deviceToken
				}
			},$set:{
				modified	:	getUtcDate()
			}},(updateErr,updateResult)=>{
				if(updateErr) return next(updateErr);

				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						
						result:{
							
						} ,
						message: res.__("user.you_have_logged_out_successfully"),
					}
				};

				return returnApiResult(req, res,finalResponse);
				
				
			});
		
	};//End logOut()




	
	/**
	 * Function for recover forgot password
	 *
	 * @param req 	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 **/
        /**
	 *  Function for forgot password
	*/
    this.forgotPassword = function (req, res, next, callback) {

		consoleLog("Model Reached.");
        /** Sanitize Data **/
		var crypto = require('crypto');
        req.body = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let finalResponse = {};
      

        let optionType = (req.body.type) ? req.body.type : FORGOT_EMAIL_OPTION;
        let forgetMobileNumber = (req.body.email) ? req.body.email : "";


        if (optionType == FORGOT_EMAIL_OPTION) {
            $match = {
                is_deleted			: NOT_DELETED,
                is_email_verified	: VERIFIED,
                email				: forgetMobileNumber,
                
            }
        } else if (optionType == FORGOT_MOBILE_OPTION) {
            $match = {
                is_deleted			: NOT_DELETED,
                is_mobile_verified	: VERIFIED,
                mobile_number		: forgetMobileNumber,
              
            }
        }

        let currentTimeStamp = new Date().getTime();
        var validateString = crypto.createHash('md5').update(currentTimeStamp + forgetMobileNumber).digest("hex");
        const users = db.collection(TABLE_USERS);
        users.findOne($match, {}, (err, result) => {

            if (err) {
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR_INVALID_ACCESS,
                        result: {},
                        message: res.__("front.system.something_going_wrong_please_try_again")
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }
            result = (result) ? result : {};
			
			if (Object.keys(result).length > 0) {

                /** Genrate OTP**/
                getRandomOTP().then(otp => {
                    var otp_code = otp;
                    var day = new Date();
                    var nextDay = new Date(day);
                    nextDay.setDate(day.getDate() + 1);
                    users.updateOne(
                        { _id: ObjectId(result._id) },
                        {
                            $set: {
                                modified: getUtcDate,
                                otp_verification_code_time: nextDay,
                                forgot_password_opt_code: otp_code,
                                forgot_password_validate_string: validateString
                            }
                        }, (updateErr, updateResult) => {
                            if (updateErr) {
                                finalResponse = {
                                    'data': {
                                        status: STATUS_ERROR,
                                        result: {},
                                        message: res.__("front.system.something_going_wrong_please_try_again")
                                    }
                                };
                                return returnApiResult(req,res,finalResponse);
                            }


                            if (optionType == FORGOT_MOBILE_OPTION) {

                                //Use to send  forgot password OTP
                                var mobileNumber = (result.mobile_number) ? result.mobile_number : '';
                            
                                var otp = otp_code;
                                var smsBody = ((res.locals.settings['User.forgot_password_otp_message']) ? res.locals.settings['User.forgot_password_otp_message'] : '{OTP}').replace(RegExp('{OTP}', 'g'), otp_code);
                                let smsOption = {
                                    mobile_number: mobileNumber,
                                    user_id: (result._id) ? ObjectId(result._id) : '',
                                    sms_template: smsBody
                                }
                                sendSMS(req, res, smsOption);
                                //Use to send  forgot password OTP

                                var successMessage = res.__("front.user.forgot_password_mobile_sms_sent_successfully");

                            } else if (optionType == FORGOT_EMAIL_OPTION) {
                                var userId = (result._id) ? result._id : '';
                                var name = (result.full_name) ? result.full_name : '';
                                var email = (result.email) ? result.email : '';


                                /** Set options for send email ***/
                                let emailOptions = {
                                    to: email,
                                    action: "forgot_password_email",
                                    rep_array: [name, otp_code]
                                };
                                /** Send email **/
                                sendMail(req, res, emailOptions);

                               

                                var successMessage = res.__("front.user.forgot_password_email_sent_successfully");
                            }
                            /** Send success response **/
                            finalResponse = {
                                'data': {
                                    status: STATUS_SUCCESS,
                                    otp_code: otp_code,
                               
                                    mobile_number: forgetMobileNumber,
                                    validate_string: validateString,
                                    message: successMessage,
                                }
                            };
                            return returnApiResult(req,res,finalResponse);
                        });
                });

            } else {
			
				 /** Send error response **/
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						email_mobile_data: forgetMobileNumber,
						validate_string: validateString,
						message : res.__("front.user.forgot_password_account_not_exist")
					}
				};
				return returnApiResult(req,res, finalResponse);
            }
        });
    };
	




	/**
	 * Function for reset password
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.resetPassword = (req,res,next)=>{
		
		/** Sanitize Data **/
		req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		let validateString	= 	(req.body.validate_string)			?	req.body.validate_string	:"";
		let finalResponse = {};
		
		
			
		/** Set user consitions **/
		let conditions	=	{
			user_role_id :	{$in : [KIDS_USER_ROLE_ID,TEENS_USER_ROLE_ID,ADULTS_USER_ROLE_ID]},
			is_deleted	 :	NOT_DELETED
		};
	

		if(validateString){
			conditions["forgot_password_validate_string"] = validateString;
			
		}
					
		/** Set options for get user details **/
		let options 	= 	{
			conditions	:	conditions,
			fields		:	{_id :1,full_name:1,email:1}
		};

		/** Get user details **/
		Registration.getUserData(req,res,options).then(response=>{

		
			
			if (response.status == STATUS_ERROR) {
				finalResponse = {
					status: STATUS_ERROR_INVALID_ACCESS,
					result: {},
					message: res.__("front.system.something_going_wrong_please_try_again")
					
				};
				return returnApiResult(req,res,finalResponse);
			}
			
			
			const crypto 	= 	require("crypto");
			let result		=	response.result;
			let resultId  	= 	(result._id)		?	result._id			:"";
			let password	= 	(req.body.password)	?	req.body.password	:"";

			var name = (result.full_name) ? result.full_name : '';
			var email = (result.email) ? result.email : '';

			/**bcrypt password generate */
			bcryptPasswordGenerate(password).then(function(bcryptPassword) {	
			
			let newPassword	= bcryptPassword;

			/** Update user password **/
			let users = db.collection('users');
			users.updateOne({
					_id : ObjectId(resultId)
				},
				{
					$set	: 	{
						password	: 	newPassword,
						modified 	:	getUtcDate()
					},
					$unset  :	{
						forgot_password_validate_string : 1
					}
				},
				(err,updateResult)=>{
					//if(err)	return next(err);

					if (err) {
						finalResponse = {
							'data': {
								status: STATUS_ERROR,
								result: {},
								message: res.__("front.system.something_going_wrong_please_try_again")
							}
						};
						return returnApiResult(req,res,finalResponse);
					}

					  /** Set options for send email ***/
					  let emailOptions = {
						to: email,
						action: "reset_password",
						rep_array: [name]
					};
					/** Send email **/
					sendMail(req, res, emailOptions);


					
					/** Send success response **/
					
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							message: res.__("user.your_password_has_been_reset_successfully"),
						}
					};
					return returnApiResult(req,res,finalResponse);
					
					
					
				}
			);
		}).catch(next);
	}).catch(next);
		
	};//End resetPassword()
	
	
	
	/**
	 * Function for verifiy mobile number
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	
	this.verifyMobileNumber = (req,res,next)=>{
		return new Promise(resolve=>{
			/** Sanitize Data **/
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let userId			= 	(req.body.user_id)	?	req.body.user_id	:"";
			let otp				= 	(req.body.otp)		?	req.body.otp 		:"";
			let validateString	= 	(req.body.mobile_validate_string)	?	req.body.mobile_validate_string	:"";
			
			if(!userId && !validateString) return resolve({status :STATUS_ERROR, message: res.__("system.missing_parameters")});
			
			/** Check validation */
			req.checkBody({
				"otp": {
					notEmpty		: true,
					errorMessage	: res.__("user.please_enter_otp"),
				}
			});

			/** parse Validation array  */
			let errors = parseValidation(req.validationErrors(),req);

			/** Send error response **/
			if (errors) return res.send({status	: STATUS_ERROR, message	: errors});
			
			/** Set user conditions **/
			let userConditions = {
				user_role_id 		:	{$in : [RIDER_USER_ROLE_ID,DRIVER_USER_ROLE_ID]},
				is_deleted	 		:	NOT_DELETED,
				is_mobile_verified	:	NOT_VERIFIED,
			};
			
			if(validateString){
				userConditions["mobile_validate_string"] = validateString;
			}else{
				userConditions["_id"] = ObjectId(userId);
			}
			
			/** Set requested data for get user details **/
			let userResuestedData = {
				conditions	:	userConditions,
				fields		:	{facebook_id :0,google_id:0,linkedin_id:0,is_deleted:0,created:0,device_details:0,password:0,modified:0}
			};
			
			/** Get user details **/
			Registration.getUserData(req,res,userResuestedData).then(userResponse=>{
				if(userResponse.status != STATUS_SUCCESS) return next(userResponse.message);
				
				let resultData	=	(userResponse.result) ? userResponse.result :"";
				
				/** Send error response **/
				if(!resultData)return resolve({status :	STATUS_ERROR, message : res.__("system.something_going_wrong_please_try_again")});
				
				/** Check entered otp is matched or not **/
				if(otp != resultData.otp) return resolve({status : STATUS_ERROR, message : [{param:"otp",msg:res.__("user.incorrect_otp_message")}]});

				/** Update user details **/
				let resultId 	=	(resultData._id) ? resultData._id	:"";
				const users 	=	db.collection('users');
				users.updateOne({
						_id : ObjectId(resultId)
					},
					{
						$set: {
							is_mobile_verified	: 	VERIFIED,
							modified 			:	getUtcDate()
						},
						$unset :{
							otp 					: 1,
							mobile_validate_string 	: 1
						}
					},(err,updateResult)=>{
						if(err) return next(err);
							
						/*************  Send verify sms *************/
							resultData["is_mobile_verified"] = VERIFIED;
							let userEmail	=	(resultData.email)				?	resultData.email				:"";
							let mobileNumber=	(resultData.mobile_number)		?	resultData.mobile_number		:"";
							let countryCode	=	(resultData.phone_country_code) ? 	resultData.phone_country_code	:DEFAULT_COUNTRY_CODE;
							mobileNumber	=	countryCode+mobileNumber;
							let msgBody		= 	(res.locals.settings['SMS.user_verify']) ? res.locals.settings['SMS.user_verify'] : '';
							
							/** Set options for send sms **/
							let smsOptions	=	{
								mobile_number	:	mobileNumber,
								user_id 		: 	resultId,
								sms_template	:	msgBody
							};

							/** Send sms **/
							sendSMS(req,res,smsOptions).then(smsResponse=>{});
						/*************** Send verify sms  ***************/
						
						/** Save user login Logs **/
							Registration.saveLoginLogs(req,res,resultData).then(loginActivityResponse=>{});
						
						/** Send success response **/
						resolve({
							status	: STATUS_SUCCESS,
							result	: resultData,
							message	: res.__("user.mobile_number_varifiy_successfully"),
						});
					}
				);
			}).catch(next);
		});
	};//End verifiyMobileNumber()

	
	
	
	
	/**
	 * Function to update user mobile number
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.changeMobileNumber = (req,res,next)=>{
		return new Promise(resolve=>{       
			/** Sanitize Data **/
			req.body 		=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let userId		= 	(req.body.user_id) 			? 	req.body.user_id 		:"";
			let mobileNumber=	(req.body.mobile_number)	?	req.body.mobile_number	:"";
			
			/** Send error response **/
			if (!userId) return resolve({status	: STATUS_ERROR, message	: res.__("system.missing_parameters")});
			
			/** Check validation **/
			req.checkBody({
				"mobile_number"	:	{
					notEmpty	:	true,
					isNumeric	:	{
						errorMessage : res.__("user.invalid_mobile_number")
					},
					isLength	:	{
						options		: 	MOBILE_NUMBER_LENGTH,
						errorMessage: 	res.__("user.invalid_mobile_number")
					},
					errorMessage	:	res.__("user.please_enter_mobile_number"),
				},
			});

			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			
			/** Send error response **/
			if(errors) return resolve({status : STATUS_ERROR, message : errors});
			
			/** Set options for check mobile number is valid or not **/
			let mobileOptions = {
				mobile_number	: DEFAULT_COUNTRY_CODE+mobileNumber
			};

			/** Check mobile number is valid or not **/
			checkMobileNumber(req,res,mobileOptions).then(checkMobileResponse=>{
				if(checkMobileResponse.status != STATUS_SUCCESS){
					/** Send error response **/
					return resolve({
						status  : STATUS_ERROR,
						message : [{'param':'mobile_number','msg':res.__("user.enterd_mobile_is_not_valid")}],
					});
				}
				
				/** Set options for check mobile is unique **/	
				let options = {
					conditions	:	{
						_id				: 	{$ne : ObjectId(userId)},
						mobile_number	:	mobileNumber,
						is_deleted		:	NOT_DELETED
					},
					fields	:	{_id:1}
				};
				
				/** Get user details for check mobile is unique **/
				Registration.getUserData(req,res,options).then(response=>{
					if(response.status != STATUS_SUCCESS) return next(response.message);

					if(response.result){
						/** Send error response **/
						return resolve({
							status  : STATUS_ERROR,
							message : [{'param':'mobile_number','msg':res.__("user.mobile_number_is_already_exist")}],
						});
					}			

					/** Get otp number **/
					getRandomOTP().then(otp=>{

						/** Update mobile number **/
						const users = db.collection('users');
						users.updateOne({
								_id : ObjectId(userId)
							},
							{$set: {
								otp 			:	otp,
								mobile_number 	:	mobileNumber,
								modified		:	getUtcDate()
							}},
							(err,updateResult)=>{
								if(err) return next(err);

								/********* Send Sms **************/
									mobileNumber	=	DEFAULT_COUNTRY_CODE+mobileNumber;
									let msgBody		= 	(res.locals.settings['SMS.update_mobile_number']) ? res.locals.settings['SMS.update_mobile_number'] :"";
									msgBody			=	msgBody.replace(RegExp('{OTP}','g'),otp);

									/** Set options for send sms **/
									let smsOptions	=	{
										mobile_number	:	mobileNumber,
										user_id 		: 	userId,
										sms_template	:	msgBody
									};

									/**Send sms **/
									sendSMS(req,res,smsOptions).then(smsResponse=>{});
								/********* Send Sms **************/	

								/** Send success response **/
								resolve({
									status	: 	STATUS_SUCCESS,
									otp 	:	otp,
									message : 	res.__("user.mobile_number_has_been_updated",mobileNumber),
								});
							}
						);
					}).catch(next);
				}).catch(next);
			}).catch(next);
		});
	};//End changeMobileNumber()
	

	
	
	/**
	 * Function for check mobile number and email is unique or not
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.checkUniqueFields  = (req,res,next)=>{
		return new Promise(resolve=>{
			
			/** Sanitize Data **/
			req.body 		=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let email		= 	(req.body.email)		?	req.body.email			:"";
			let mobileNumber= 	(req.body.mobile_number)?	req.body.mobile_number	:"";
			
			/** Check validation **/
			req.checkBody({
				"email": {
					notEmpty	: true,
					errorMessage: res.__("user.please_enter_email"),
					isEmail	: 	{
						errorMessage : res.__("user.please_enter_valid_email_address")
					},
				},
				"mobile_number": {
					notEmpty	: true,
					isNumeric	:		{
						errorMessage: 	res.__("user.invalid_mobile_number")
					},
					isLength	:	{
						options		: MOBILE_NUMBER_LENGTH,
						errorMessage: res.__("user.invalid_mobile_number")
					},
					errorMessage: res.__("user.please_enter_mobile_number"),
				}
			});	
					
			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			
			/** Send error response **/
			if(errors) return resolve({status : STATUS_ERROR, message : errors});
			
			/** Set options for check unique (email and mobile number) **/
			let options = {
				conditions	:	{
					is_deleted	:	NOT_DELETED,
					$or			:	[
						{email 			: 	{$regex : '^'+email+'$',$options : 'i'}},
						{mobile_number	:	mobileNumber}
					]
				},
				fields : {_id:1,email:1,mobile_number:1}
			};

			/** Get user details **/
			Registration.getUserData(req,res,options).then(response=>{
				if(response.status != STATUS_SUCCESS) return next(response.message);
				
				if(response.result){
					let errMessage	 	= 	[];
					let resultMail 	 	= 	(response.result.email)			? 	response.result.email.toLowerCase()	:"";
					let resultMobile 	= 	(response.result.mobile_number) ? 	response.result.mobile_number		:"";
					let enteredMail  	= 	email.toLowerCase();
					
					/** Push error message in array if email or mobile already exists*/
					if(resultMail == enteredMail){
						errMessage.push({'param':'email','msg':res.__("user.email_id_is_already_exist")});
					}
					if(resultMobile == mobileNumber){
						errMessage.push({'param':'mobile_number','msg':res.__("user.mobile_number_is_already_exist")});
					}
				
					/** Send error response **/
					return resolve({status : STATUS_ERROR, message : errMessage});
				}	
				
				/** Set options **/
				let mobileOptions = {mobile_number : DEFAULT_COUNTRY_CODE+mobileNumber};

				/** Check mobile number is valid or not **/
				checkMobileNumber(req,res,mobileOptions).then(checkMobileResponse=>{
					if(checkMobileResponse.status != STATUS_SUCCESS){
						return resolve({
							status 	: STATUS_ERROR,
							message : [{param:'mobile_number',msg:res.__("user.enterd_mobile_is_not_valid")}]
						});	
					} 
					
					/** Send success response **/
					resolve({
						status  	: 	STATUS_SUCCESS,
						available	:	true
					});
				}).catch(next);
			}).catch(next);
		});
	};//End checkUniqueFields()
	
	
	/**
   *  Function for verify OTP
   * 
   * This function use in forgot password otp verify and accoout verification when user come from sign up.
   * 
   */
	this.verifyOTP = function (req, res, next, callback) {
        var validateString = (req.body.validate_string) ? req.body.validate_string : '';
        var page 			= (req.body.page) ? req.body.page : "";
   
        if (validateString != '' && page != "") {
         
 
				if(page == FORGOT_PASSWORD_PAGE_TYPE){
					var match = {
						forgot_password_validate_string: validateString,	
					}
				}else{
					var match = {
						validate_string: validateString,	
					}
				}
				consoleLog(match);
                var users = db.collection(TABLE_USERS);
                users.findOne(
                    match,
                    function (err, result) {
						consoleLog(result);
                        if (result) {
							let otp		= 	(req.body.otp)		?	req.body.otp 		:"";
							let errMessageArray = [];
							
							if(page == FORGOT_PASSWORD_PAGE_TYPE){
								if(otp != result.forgot_password_opt_code) {
									errMessageArray.push({'param':'otp','msg':res.__("user.incorrect_otp_message")});
								}
							}else{
								if(otp != result.mobile_verification_code) {
									errMessageArray.push({'param':'otp','msg':res.__("user.incorrect_otp_message")});
								}	
							}
							var currentDateTime = getUtcDate();
							let otpTime = (result.otp_verification_code_time) ? result.otp_verification_code_time : "";
							
							if(currentDateTime > otpTime ){
								errMessageArray.push({'param':'otp','msg':res.__("user.otp_has_been_expired")});
							}
					
							
							 /** Send error response **/
							if (errMessageArray.length > 0) {
								if((req.body.api_type)==MOBILE_API_TYPE){
									var newerrors = stringValidationFromMobile(errMessageArray, req);
								}else{
									var newerrors = parseValidationFrontApi(errMessageArray, req);
								}
								
								finalResponse = {
									'data': {
										status: STATUS_ERROR,
										errors: newerrors,
										message: newerrors,
									}
								};
								return returnApiResult(req,res,finalResponse);
							}
						
                            var successMessage = res.__("front.user.account_verify_successfully");
                            var updateData = {};
                            if(page == VERIFY_ACCOUNT_PAGE_TYPE){
								var newEmail 	= 	(result.temp_email)			?	result.temp_email 		:"";
								var newMobile 	= 	(result.temp_mobile_number)		?	result.temp_mobile_number 		:"";
								var updateData = {
									modified: getUtcDate(),
									is_email_verified: ACTIVE,
									is_mobile_verified: ACTIVE,
									email:newEmail,
									mobile_number:newMobile,
									validate_string: "",
									temp_mobile_number: "",
									temp_email: "",
									mobile_verification_code: "",
									email_verification_code: "",
								}
							}else if(page == FORGOT_PASSWORD_PAGE_TYPE){
								var updateData = {
									modified: getUtcDate(),
									forgot_password_opt_code: "",
								}
							}
                            var userId = (result._id) ? result._id : MONGO_ID;
							
                            users.updateOne({
                                _id: ObjectId(userId)

                            }, { $set: updateData }, (error, updateResult) => {
								
								let conditions = {
									slug : result.slug
								}
								
								/** Set options data for get user details **/
								let userOptions = {
									conditions	:	conditions,
									fields		:	{facebook_id :0,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,password:0,modified:0}
								};
								
								getUserDetailBySlug(req, res, userOptions).then(response => {
									
								
					
									var userRedirectUrl	=	"";
									
									/*** Start JWT Authentication ***/
									let userEmail 	= (response.result.email) ? response.result.email : "";
									let slug 		= (response.result.slug) ? response.result.slug : "";
									
									const jwtUser = {
										"email"		: userEmail,
										"slug"		: slug,
									}
									//console.log(JWT_CONFIG.secret);
									const token = jwt.sign(jwtUser, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.tokenLife });
									const refreshToken = jwt.sign(jwtUser, JWT_CONFIG.refreshTokenSecret, { expiresIn: JWT_CONFIG.refreshTokenLife });
									tokenList['token'] = token;
									tokenList['refresh_token'] = refreshToken;
									/*** End JWT Authentication */
									
									var finalResponse = {
										'data': {
											status: STATUS_SUCCESS,
											validate_string: validateString,
											result			: 	response.result,
											image_path		: 	USERS_URL,
											token			: 	token,
											refresh_token	: 	refreshToken,
											token_life		: 	JWT_CONFIG.tokenLife,
											message: res.__("front.user.you_are_logged_in", response.result.full_name),
										}
									};
									 return returnApiResult(req,res,finalResponse);
								});

                            });

                        } else {
                            var finalResponse = {
                                'data': {
                                    status: STATUS_ERROR_INVALID_ACCESS,
                                    message: res.__("system.something_going_wrong_please_try_again1")
                                }
                            };
                             return returnApiResult(req,res,finalResponse);
                        }
                    });
            
        } else {
           
             finalResponse = {
				'data': {
					status: STATUS_ERROR,
					errors: "",
					message: res.__("system.something_going_wrong_please_try_again"),
				}
			};
			return returnApiResult(req,res,finalResponse);
		
           
        }
    };
	
	
	
	

	
	
	/**
     * function for get user profile detail
     *
     * param slug
     * */
    this.getUserDetail = (req, res, next, callback) => {
        let slug = (req.body.slug) ? req.body.slug : '';
        let finalResponse = {};
        if (!slug) {
            finalResponse = {
                'data': {
                    status: STATUS_ERROR,
                    errors: "",
                    message: res.__("front.system.invalid_access"),
                }
            };
            return callback(finalResponse);
        }
        let options = { slug: slug }
		let conditions = {
			slug : slug
		}
		/** Set options data for get user details **/
		let userOptions = {
			conditions	:	conditions,
			fields		:	{facebook_id :0,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,password:0,modified:0}
		};
		getUserDetailBySlug(req, res, userOptions).then(response => {
			response['result']['image_url']	=	USERS_URL;
            finalResponse = {
                'data': {
                    status: STATUS_SUCCESS,
                    result: response.result,
                    image_url: USERS_URL,
                    message: 'user data',
                }
            };
            return callback(finalResponse);
        });
    };//end getProfileDetail
    
    
    /**
	 * Function to edit user profile image
	 */
    this.editUserProfileImage = (req, res, next, callback) => {
        req.body = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
		
        let finalResponse = {};
        
        if (userId == '') {
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    result: {},
                    message: res.__("api.global.parameter_missing")

                }
            };
            return callback(finalResponse);
        }
      
		let oldimage = (req.body.old_image) ? req.body.old_image : "";
		let image = (req.files && req.files.image) ? req.files.image : "";
		var imageMessageArray = [];
		if (!req.files || !req.files.image) {
			imageMessageArray.push({ 'param': 'image', 'msg': res.__("front.user.please_select_image") });
		}
		
		if (imageMessageArray.length > 0) {
			
			/** API type accourding validation send**/
			if((req.body.api_type)==MOBILE_API_TYPE){
				var errors = stringValidationFromMobile(imageMessageArray,req);
			}else{
				var errors = parseValidationFrontApi(imageMessageArray,req);
			}
        
			/** Send error response **/
			if (errors) {
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						errors: errors,
						message: errors,
					}
				};
				return callback(finalResponse);
			}
			
			
		}

		let options = {
			'image': image,
			'filePath': USERS_FILE_PATH,

		};
		/** Upload user  image **/
		moveUploadedFile(req, res, options).then(imageresponse => {
			if (imageresponse.status == STATUS_ERROR) {
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: [],
						message: res.__("front.system.something_going_wrong_please_try_again")
					}
				};
				return callback(finalResponse);
			}

			let updateData = {
				profile_image: (imageresponse.fileName) ? imageresponse.fileName : "",
				modified: getUtcDate()
			}
			const users = db.collection("users");
			/** Update user data **/
			
			users.updateOne({
				_id: ObjectId(userId)
			},
				{ $set: updateData }, (updateErr, result) => {
					if (updateErr) {
						finalResponse = {
							'data': {
								status: STATUS_ERROR,
								result: [],
								message: res.__("front.system.something_going_wrong_please_try_again")
							}
						};
						return callback(finalResponse);
					}
					let conditions = {
						slug : loginUserData.slug
					}
					/** Set options data for get user details **/
					let userOptions = {
						conditions	:	conditions,
						fields		:	{facebook_id :0,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,password:0,modified:0}
					};
					getUserDetailBySlug(req, res, userOptions).then(response => {
						/** send success response */
						response['result']['image_url']	=	USERS_URL;
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: response.result,
								image_url: USERS_URL,
								errors: "",
								message: res.__("front.users.profile_image_has_been_updated_successfully"),
							}
						};
						return callback(finalResponse);
					});
				}
			);

		});
        

    }
	
	
    /**
	 *  Function for change password
	 */
    this.changePassword = function (req, res, next, callback) {
        /** Sanitize Data **/
        const crypto 	= 	require("crypto");
        req.body = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
        
        let finalResponse = {};
        if (userId) {
            req.checkBody({
                "old_password": {
                    notEmpty: true,
                    isLength: {
                        options: PASSWORD_LENGTH,
                        errorMessage: res.__("admin.user.password_length_should_be_minimum_6_character")
                    },
                    matches: {
                        options: PASSWORD_VALIDATION_REGULAR_EXPRESSION,
                        errorMessage: res.__("front.user.password_must_be_alphanumeric"),
                    },
                    errorMessage: res.__("front.user.please_enter_old_password")
                },
                "new_password": {
                    notEmpty: true,
                    isLength: {
                        options: PASSWORD_LENGTH,
                        errorMessage: res.__("admin.user.password_length_should_be_minimum_6_character")
                    },
                    matches: {
                        options: PASSWORD_VALIDATION_REGULAR_EXPRESSION,
                        errorMessage: res.__("front.user.password_must_be_alphanumeric"),
                    },
                    errorMessage: res.__("front.user.please_enter_password")
                },
                "confirm_password": {
                    notEmpty: true,
                    isLength: {
                        options: PASSWORD_LENGTH,
                        errorMessage: res.__("admin.user.password_length_should_be_minimum_6_character")
                    },
                    matches: {
                        options: PASSWORD_VALIDATION_REGULAR_EXPRESSION,
                        errorMessage: res.__("front.user.password_must_be_alphanumeric"),
                    },
                    errorMessage: res.__("front.user.please_enter_confirm_password")
                }
            });
            req.checkBody("confirm_password", res.__("front.user.confirm_password_should_be_same_as_password")).equals(req.body.new_password);

            /** API type accourding validation send**/
			if((req.body.api_type)==MOBILE_API_TYPE){
				var errors = stringValidationFromMobile(req.validationErrors(),req);
			}else{
				var errors = parseValidationFrontApi(req.validationErrors(),req);
			}
        
			/** Send error response **/
			if (errors) {
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						errors: errors,
						message: errors,
					}
				};
				return callback(finalResponse);
			}
			
			let oldPassword 		= (req.body.old_password) ? req.body.old_password : '';
			let password 			= (req.body.new_password) ? req.body.new_password : '';
			let confirmPassword 	= (req.body.confirm_password) ? req.body.confirm_password : '';
			let newPassword 		= crypto.createHash('md5').update(req.body.new_password).digest("hex");
			let oldPasswordHash 	= crypto.createHash('md5').update(req.body.old_password).digest("hex");
            const users 			= db.collection(TABLE_USERS);
            users.findOne({ _id: ObjectId(userId), password: oldPasswordHash }, { _id: 1, full_name: 1 }, (err, result) => {
                if (err) {
                    finalResponse = {
                        'data': {
                            status: STATUS_ERROR,
                            result: {},
                            message: res.__("front.user.something_went_wrong_please_try_again")
                        }
                    };
                    return callback(finalResponse);
                }
                if (!err && result) {
                    /** update new password */
                    users.updateOne(
                        {
                            _id: ObjectId(result._id)
                        },
                        {
                            $set: {
                                password: newPassword,
                                modified: getUtcDate(),
                                last_password_set_at: getUtcDate(),
                            }
                        }, (updateError, updateResult) => {
                            if (updateError) {
                                finalResponse = {
                                    'data': {
                                        status: STATUS_ERROR,
                                        result: {},
                                        message: res.__("front.user.something_went_wrong_please_try_again")
                                    }
                                };
                                return callback(finalResponse);
                            }
                            if (!updateError && updateResult) {
                                finalResponse = {
                                    'data': {
                                        status: STATUS_SUCCESS,
                                        errors: "",
                                        message: res.__("front.user_change.your_password_has_been_changed_successfully"),
                                    }
                                };
                                return callback(finalResponse);
                            } else {
                                finalResponse = {
                                    'data': {
                                        status: STATUS_ERROR,
                                        errors: "",
                                        message: res.__("front.user.something_went_wrong_please_try_again"),
                                    }
                                };
                                return callback(finalResponse);
                            }
                        }
                    );
                } else {
					
					var passwordMessageArray = [];
					
					passwordMessageArray.push({ 'param': 'old_password', 'msg': res.__("front.user.your_old_password_is_incorrect") });
					
					/** API type accourding validation send**/
					if((req.body.api_type)==MOBILE_API_TYPE){
						var errorsNew = stringValidationFromMobile(passwordMessageArray,req);
					}else{
						var errorsNew = parseValidationFrontApi(passwordMessageArray,req);
					}
			
                    finalResponse = {
                        'data': {
                            status: STATUS_ERROR,
                            errors: errorsNew,
                            mesage: errorsNew,
                        }
                    };
                    return callback(finalResponse);
                }
            });
        } else {
            finalResponse = {
                'data': {
                    status: STATUS_ERROR,
                    errors: "",
                    message: res.__("front.system.something_going_wrong_please_try_again"),
                }
            };
            return callback(finalResponse);
        }
    };
    
      /**
	 *  Function for  accept corporate employee request
	 */
	this.checkEmployeeRequest = (req, res, next, callback)=> {
		let finalResponse 			= 	{};
		const users 				= 	db.collection(TABLE_USERS);
		const corporateEmployees 	= 	db.collection(TABLE_CORPORATE_EMPLOYEES);
		req.body 					=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		let countryCode				= 	(req.body.country_code) ? req.body.country_code : DEFAULT_COUNTRY_CODE;
		var mobileNumber  			= 	(req.body.mobile_number) ? req.body.mobile_number : "";
		var mobileNumber  			= 	countryCode+mobileNumber;
		var validateString  		= 	(req.body.validate_string) ? req.body.validate_string : "";
		req.checkBody({
			"mobile_number": {
				notEmpty: true,
				isNumeric:{
					errorMessage: res.__("admin.user.invalid_phone_number")
				},
				errorMessage: res.__("admin.user.please_enter_phone_number"),
			},
		});
		/** API type accourding validation send**/
		if((req.body.api_type)==MOBILE_API_TYPE){
			var errors = stringValidationFromMobile(req.validationErrors(),req);
		}else{
			var errors = parseValidationFrontApi(req.validationErrors(),req);
		}
	
		/** Send error response **/
		if (errors) {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					errors: errors,
					message: errors,
				}
			};
			return callback(finalResponse);
		}
		corporateEmployees.findOne({
			validate_string : validateString,
			request_status	: DEACTIVE,
		},{  projection: { _id: 1, email: 1,full_name:1,corporate_id:1,group_id:1} },(empErr,empSuccess)=>{
			
			if(empErr){
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						result: {},
						message: res.__("front.system.something_going_wrong_please_try_again")
					}
					
				};
				return callback(finalResponse);
			}
			empSuccess = (empSuccess) ? empSuccess : {};
			
			if (Object.keys(empSuccess).length > 0) 
			{
				users.findOne({
					is_deleted 		: 	NOT_DELETED,
					mobile_number	:	mobileNumber,
				},{ projection: { _id: 1, mobile_number: 1,user_role_id:1} },(err,result)=>{
					
					if(err){
						finalResponse = {
							'data': {
								status: STATUS_ERROR_INVALID_ACCESS,
								result: {},
								message: res.__("front.system.something_going_wrong_please_try_again")
							}
							
						};
						return callback(finalResponse);
					}
					result = (result) ? result : {};
					
					if (Object.keys(result).length > 0) 
					{
						if(result.user_role_id == RIDER_USER_ROLE_ID)
						{
							/** Genrate OTP for mobile **/
							getRandomOTP().then(mobile_otp => {
								let userMobileNumber = (result.mobile_number) ? result.mobile_number : "";
								let userId =  (result._id) ? ObjectId(result._id) : '';
								var mobileOtpCode 		= 	mobile_otp;
								
								users.updateOne({
									_id : ObjectId(userId)
									
								},{
									$set : {
										request_otp : Number(mobileOtpCode)
									}
								},(updateErr,updateSuccess)=>{
									
									var smsBody = ((res.locals.settings['User.employee_request_accept_otp']) ? res.locals.settings['User.employee_request_accept_otp'] : '{OTP}').replace(RegExp('{OTP}', 'g'), mobileOtpCode);
									let smsOption = {
										mobile_number: userMobileNumber,
										user_id: (result._id) ? ObjectId(result._id) : '',
										sms_template: smsBody
									}
									sendSMS(req, res, smsOption);
									
									finalResponse = {
										'data': {
											status: STATUS_SUCCESS,
											result: {},
											message: res.__("front.employee_otp_sent_successfully")
										}
									};
									return callback(finalResponse);
									
								})
							});
						}else{
							finalResponse = {
								'data': {
									status: STATUS_ERROR,
									result: {},
									message: res.__("front.this_mobile_number_already_used_with_other_user_profile")
								}
							};
							return callback(finalResponse);
						}
					}else{
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS_EMP_DETAIL,
								result: empSuccess,
								message: res.__("Employe detail")
							}
						};
						return callback(finalResponse);
					}
				});
			}else{
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						error: res.__("front.system.invalid_access"),
						message: res.__("front.system.invalid_access")
					}
				};
				return callback(finalResponse);
			}
		});
	}
	
	/**
	 *  Function for accept resent request otp
	 */
	this.resentRequestOtp = (req, res, next, callback)=> {
		let finalResponse = {};
		const users 		= 	db.collection(TABLE_USERS);
		req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		var mobileNumber  	= 	(req.body.mobile_number) ? req.body.mobile_number : "";
		if(mobileNumber == ''){
			finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						result: {},
						message: res.__("front.system.something_going_wrong_please_try_again")
					}
					
				};
				return callback(finalResponse);
		}
		users.findOne({
			is_deleted 		: 	NOT_DELETED,
			mobile_number	:	mobileNumber
		},{ projection: { _id: 1, mobile_number: 1} },(err,result)=>{
			if(err){
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						result: {},
						message: res.__("front.system.something_going_wrong_please_try_again")
					}
					
				};
				return callback(finalResponse);
			}
			 /** Genrate OTP for mobile **/
			getRandomOTP().then(mobile_otp => {
				let userMobileNumber = (result.mobile_number) ? result.mobile_number : "";
				let userId =  (result._id) ? ObjectId(result._id) : '';
				var mobileOtpCode 		= 	mobile_otp;
				
				users.updateOne({
					_id : ObjectId(userId)
					
				},{
					$set : {
						request_otp : Number(mobileOtpCode)
					}
				},(updateErr,updateSuccess)=>{
					
					var otpCode = mobileOtpCode;
					var smsBody = ((res.locals.settings['User.resend_otp_message']) ? res.locals.settings['User.resend_otp_message'] : '{OTP}').replace(RegExp('{OTP}', 'g'), otpCode);
					let smsOption = {
						mobile_number: mobileNumber,
						user_id: (result._id) ? ObjectId(result._id) : '',
						sms_template: smsBody
					}
					sendSMS(req, res, smsOption);
					
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							result: {
								otp : otpCode,
							},
							message: res.__("front.employee_otp_sent_successfully")
						}
					};
					return callback(finalResponse);
					
				});
			})
		})
		
	} //resentRequestOtp                 
    
  
	
	/**
     * 
     * */
    this.acceptEmployeeRequest = (req, res, next, callback)=> {
		let finalResponse 				= 	{};
		const users 					= 	db.collection(TABLE_USERS);
		const corporateEmployees 		= 	db.collection(TABLE_CORPORATE_EMPLOYEES);
		const userProfile		 		= 	db.collection(TABLE_USER_PROFILES);
		req.body 						=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		var mobileNumber  				= 	(req.body.mobile_number) ? req.body.mobile_number : "";
		var mobileOtp  					= 	(req.body.otp) ? req.body.otp : "";
		var validateString  			= 	(req.body.validate_string) ? req.body.validate_string : "";
		
		corporateEmployees.findOne({
			validate_string : validateString,
			request_status	: DEACTIVE,
		},{  projection: { _id: 1, email: 1,full_name:1,corporate_id:1,group_id:1} },(empErr,empSuccess)=>{
			
			if(empErr){
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						result: {},
						message: res.__("front.system.something_going_wrong_please_try_again")
					}
					
				};
				return callback(finalResponse);
			}
			empSuccess = (empSuccess) ? empSuccess : {};
			
			if (Object.keys(empSuccess).length > 0) {
				console.log(mobileOtp +"mobileOtp");
				console.log(mobileNumber +"mobileNumber");
				users.findOne({
					is_deleted 		: 	NOT_DELETED,
					mobile_number	:	mobileNumber,
					request_otp		:	Number(mobileOtp),
				},{ projection: { _id: 1, mobile_number: 1} },(err,userResult)=>{
					if(err){
						finalResponse = {
							'data': {
								status: STATUS_ERROR_INVALID_ACCESS,
								result: {},
								message: res.__("front.system.something_going_wrong_please_try_again")
							}
							
						};
						return callback(finalResponse);
					}
					console.log(userResult+"userResult");
					userResult = (userResult) ? userResult : {};
			
					if (Object.keys(userResult).length > 0) 
					{
						corporateEmployees.updateOne({
							_id : ObjectId(empSuccess._id)
						},{
							$set :{
								request_status : ACTIVE,
								status : ACTIVE,
							}
						},(updateEmpErr,updateEmpSueess)=>{
							
							if(updateEmpErr){
								finalResponse = {
									'data': {
										status: STATUS_ERROR_INVALID_ACCESS,
										result: {},
										message: res.__("front.system.something_going_wrong_please_try_again")
									}
									
								};
								return callback(finalResponse);
							}
							userProfile.insertOne({
								user_id 		: 	ObjectId(userResult._id),
								email			:	empSuccess.email,
								group_id		:	ObjectId(empSuccess.group_id),
								corporate_id	:	ObjectId(empSuccess.corporate_id),
								corporate_emp_id:	ObjectId(empSuccess._id),
								type			:	'rider',
								status			:	 ACTIVE,
								modified 		: 	getUtcDate(),
								created 		: 	getUtcDate(),
							},(insertErr,insertSuccess)=>{
								if(insertErr){
									finalResponse = {
										'data': {
											status: STATUS_ERROR_INVALID_ACCESS,
											result: {},
											message: res.__("front.system.something_going_wrong_please_try_again")
										}
										
									};
									return callback(finalResponse);
								}
								finalResponse = {
									'data': {
										status: STATUS_SUCCESS,
										result: {
										},
										message: res.__("front.corporate_profile_has_been_created_successfully")
									}
								};
								return callback(finalResponse);
								
								
							})
							
							
							
						})
					}else{
						let errMessageArray = [];
						errMessageArray.push({ 'param': 'otp', 'msg': res.__("Invalid OTP") });
						 /** Send error response **/
						if (errMessageArray.length > 0) {
							if((req.body.api_type)==MOBILE_API_TYPE){
								var newerrors = stringValidationFromMobile(errMessageArray, req);
							}else{
								var newerrors = parseValidationFrontApi(errMessageArray, req);
							}
							
							finalResponse = {
								'data': {
									status: STATUS_ERROR,
									errors: newerrors,
									message: newerrors,
								}
							};
							return callback(finalResponse);
						}
					}
					
				});
				
			}else{
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						error: res.__("front.you_have_already_corporate_account_on_this_email"),
						message: res.__("front.you_have_already_corporate_account_on_this_email")
					}
					
				};
				return callback(finalResponse);
			}
		});	
		
	}
	



	/**
     * 
     * */
	this.employeRiderRegistration = (req, res, next, callback)=> {
		let finalResponse 				= 	{};
		/** Call user service function to add rider user**/
		userService.addEmployeeRiderUser(req,res,next).then(response=>{
			
			if(response.status == STATUS_ERROR_INVALID_ACCESS){
				/** Send error response  **/
				let messages = (response.message) ? response.message : res.__("system.something_going_wrong_please_try_again");
				 finalResponse = {
                    'data': {
                        status: STATUS_ERROR_INVALID_ACCESS,
                        message: messages
                    }
                };
                return callback(finalResponse);
			}
			
			/** Form validation Errors**/
			if(response.status == STATUS_ERROR_FORM_VALIDATION){
				/** parse Validation array  **/
				let formErrors = (response.errors) ? response.errors : {};
				/** API type accourding validation send**/
				if((req.body.api_type)==MOBILE_API_TYPE){
					var errors = stringValidationFromMobile(formErrors,req);
				}else{
					var errors = parseValidationFrontApi(formErrors,req);
				}
				
				/** Send error response **/
				if (errors) {
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: errors,
							message	:	errors
						}
					};
					return callback(finalResponse);
				}
			}
			
			/** Success Return**/
				if(response.status == STATUS_SUCCESS){
					let messageStr 		=  	(response.message) ? response.message : "";
					let mobileNumber 	= 	(response.result.mobileNumber) ? response.result.mobileNumber : "";
					let email 			=	 (response.result.email) ? response.result.email : "";
					let fullName 		=	 (response.result.fullName) ? response.result.fullName : "";
					let mobileOtpCode 	=	 (response.result.mobileOtpCode) ? response.result.mobileOtpCode : "";
					let emailOtpCode 	=	 (response.result.emailOtpCode) ? response.result.emailOtpCode : "";
					let validateString 	=	 (response.result.validateString) ? response.result.validateString : "";
					let empUserId 		=	 (response.result.empUserId) ? response.result.empUserId : "";
					
					const corporateEmployees 		= 	db.collection(TABLE_CORPORATE_EMPLOYEES);
					
					corporateEmployees.updateOne({
						_id : ObjectId(empUserId)
					},{
						$set :{
							request_status : ACTIVE,
							status : ACTIVE,
						}
					},(updateEmpErr,updateEmpSueess)=>{
					
						if(email != ""){
							/** Set options for send email ***/
							let emailOptions = {
								to: email,
								action: "front_rider_user_email_verify_otp",
								rep_array: [fullName,emailOtpCode]
							};
							/** Send email **/
							sendMail(req, res, emailOptions);
						}
						var smsBody = ((res.locals.settings['User.registration_otp_message']) ? res.locals.settings['User.registration_otp_message'] : '{OTP}').replace(RegExp('{OTP}', 'g'), mobileOtpCode);
						
						 let smsOption = {
							mobile_number: mobileNumber,
							user_id:  MONGO_ID,
							sms_template: smsBody
						}
						sendSMS(req, res, smsOption);
						
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								errors: "",
								result:{
									mobile_otp 		: mobileOtpCode,
									email_otp  		: emailOtpCode,
									validate_string : validateString
								},
								message	:	res.__("user.user_registered_successfully_message")
							}
						};
						return callback(finalResponse);
					});
					
				}
		});	
	}
	


	/**
     * function for get JWT
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 *
	 * @return json
	 */
	this.regenerateJWT = (req, res, next) => {
		var utf8 = require('utf8');
		var btoa = require("btoa");
		let authorization = (req.headers.authorization) ? req.headers.authorization : '';
		let oldRefreshToken = tokenList.refresh_token;
		let finalResponse = {};
		if (!authorization || (oldRefreshToken != authorization)) {
			finalResponse = {
				'data': {
					status	: STATUS_ERROR,
					errors	: "",
					message	: res.__("front.system.invalid_access"),
				}
			};
			let result = JSON.stringify(finalResponse.data);
			let myJSON = utf8.encode(result);
			res.send({
				response: btoa(myJSON)
			});
		} else {

			const jwtUser 		= {"token": authorization};
			const token 		= jwt.sign(jwtUser, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.tokenLife });
			const refreshToken 	= jwt.sign(jwtUser, JWT_CONFIG.refreshTokenSecret, { expiresIn: JWT_CONFIG.refreshTokenLife });
			tokenList['token'] 	= token;
			tokenList['refresh_token'] = refreshToken;

			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					errors: "",
					token			: token,
					refresh_token	: refreshToken,
					token_life		: JWT_CONFIG.tokenLife,
					
				}
			};
			let result = JSON.stringify(finalResponse.data);
			let myJSON = utf8.encode(result);
			res.send({
				response: btoa(myJSON)
			});
		}
	};//end regenerateJWT




		/**
     * function for edit user email address
     *
     * param slug
     * */
		 this.updateUserEmailAddress = (req, res, next, callback) => {

			let slug 			= (req.body.slug) ? req.body.slug : '';
			let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
			let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			req.body 			= sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
			const users 		= db.collection(TABLE_USERS);
			var finalResponse = {};
	
			consoleLog(userId)
			consoleLog(loginUserData)
	
			if(userId == ""){
				 finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						errors: "",
						message: res.__("front.system.invalid_access"),
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
		   
			   
			let id 				= userId;
			let email 			= (req.body.email) ? req.body.email : '';
			let mobile_no 		= (req.body.mobile_number) ? req.body.mobile_number : '';
			let editType 		= (req.body.type) ? req.body.type : 'email';
		
		
		//	return false;
			switch (editType) {
				case "email":
				
					getRandomOTP().then(email_otp => {
	
						var day = new Date();
						var nextDay = new Date(day);
						nextDay.setDate(day.getDate() + 1);
						
				
						let userOldEmail 			= (loginUserData.email) ? loginUserData.email : "";
						let userNewEmail 			= (req.body.email) ? req.body.email.toLowerCase() : '';
						let currentTimeStamp 		= new Date().getTime();
						if (userOldEmail != userNewEmail) { 
							var validateString = crypto.createHash('md5').update(currentTimeStamp + userNewEmail).digest("hex");
							users.updateOne(
								{
									_id: ObjectId(id)
								},
								{
									$set: {
										temp_email						: userNewEmail,
										validate_string					: validateString,
										email_verification_code			: email_otp,
										otp_verification_code_time		: nextDay,
										modified						: getUtcDate(),
	
									}
								}, (updateError, updateResult) => {
									finalResponse = {
										'data': {
											status					: STATUS_SUCCESS,
											validate_string			: validateString,
											emailOtpCode			: email_otp,
											errors					: "",
											message					: res.__("front.user_email_updated_successfully"),
										}
									};
									return returnApiResult(req,res,finalResponse);
	
								});
						} else {
							var userOldTempEmailId = (loginUserData.temp_email) ? loginUserData.temp_email : "";
							if (userOldTempEmailId != '') {
								users.updateOne({
									_id: ObjectId(id)
	
								}, {
										$set: {
											temp_email		: '',
										}
									}, (updateTempErr, updateTempRes) => {
										finalResponse = {
											'data': {
												status			: STATUS_SUCCESS,
												
												errors			: "",
												message			: res.__("front.user_email_updated_successfully"),
											}
										};
										return returnApiResult(req,res,finalResponse);
	
									});
	
							} else {
								finalResponse = {
									'data': {
										status				: STATUS_SUCCESS,
										errors				: "",
										message				: res.__("front.user_email_updated_successfully"),
									}
								};
								return returnApiResult(req,res,finalResponse);
							}
						}
	
					})		
					
					break;
				case "mobile":
					users.findOne({
						is_deleted: NOT_DELETED,
						_id: { $ne: ObjectId(id) },
						$or: [
							{ mobile_number: mobile_no },
							{ temp_mobile_number: mobile_no },
						]
	
					}, { projection: { _id: 1, mobile_number: 1, temp_mobile_number: 1 } }, (err, result) => {
						if (err) {
							finalResponse = {
								'data': {
									status: STATUS_ERROR_INVALID_ACCESS,
									result: {},
									message: res.__("front.system.something_going_wrong_please_try_again")
								}
							};
							return returnApiResult(req,res,finalResponse);
						}
						if (result) {
	
							let errMessageArray = [];
							let resultMobile = (result.mobile_number) ? result.mobile_number : "";
							let resultTempMobile = (result.temp_mobile_number) ? result.temp_mobile_number : "";
							let enteredMobile_no = mobile_no;
	
							/** Push error message in array if  mobile already exists in mobile_number*/
							if (resultMobile == enteredMobile_no) {
								errMessageArray.push({ 'param': 'mobile_number', 'msg': res.__("admin.user.your_mobile_number_is_already_exist") });
							}
							/** Push error message in array if mobile already exists in temp mobile number*/
							if (resultTempMobile == enteredMobile_no) {
								errMessageArray.push({ 'param': 'mobile_number', 'msg': res.__("admin.user.your_mobile_number_is_already_exist") });
							}
	
							/** Send error response **/
							if (errMessageArray) {
								  /** API type accourding validation send**/
								if((req.body.api_type)==MOBILE_API_TYPE){
									var errors = stringValidationFromMobile(errMessageArray, req);
								}else{
									var errors = parseValidationFrontApi(errMessageArray, req);
								}
								finalResponse = {
									'data': {
										status: STATUS_ERROR,
										errors: errors,
										message: errors,
									}
								};
								return returnApiResult(req,res,finalResponse);
							}
						}
						let userOldMobileNo = (loginUserData.mobile_number) ? loginUserData.mobile_number : "";
						let userNewMobileNo = (req.body.mobile_number) ? req.body.mobile_number : '';
						let currentTimeStamp = new Date().getTime();
						if (userOldMobileNo != userNewMobileNo) {
							var validateString = crypto.createHash('md5').update(currentTimeStamp + userNewMobileNo).digest("hex");
							users.updateOne(
								{
									_id: ObjectId(id)
								},
								{
									$set: {
										temp_mobile_number: userNewMobileNo,
										validate_string: validateString,
										modified: getUtcDate(),
	
									}
								}, (updateError, updateResult) => {
									finalResponse = {
										'data': {
											status: STATUS_SUCCESS,
											validate_string: validateString,
											errors: "",
											message: res.__("front.user_mobile_updated_successfully"),
										}
									};
									return returnApiResult(req,res,finalResponse);
	
								});
						} else {
							var userTempMobileNumber = (loginUserData.temp_mobile_number) ? loginUserData.temp_mobile_number : "";
							if (userTempMobileNumber != '') {
								users.updateOne({
									_id: ObjectId(id),
								}, {
										$set: {
											temp_mobile_number: '',
										}
									}, (updateTempErr, updateTempResult) => {
	
										finalResponse = {
											'data': {
												status: STATUS_SUCCESS,
												errors: "",
												message: res.__("front.user_mobile_updated_successfully"),
											}
										};
										return returnApiResult(req,res,finalResponse);
									})
	
							} else {
								finalResponse = {
									'data': {
										status: STATUS_SUCCESS,
										errors: "",
										message: res.__("front.user_mobile_updated_successfully"),
									}
								};
								return returnApiResult(req,res,finalResponse);
							}
						}
	
	
					});
				break;
			}
			
		}






	
	
	ipone = (req,res)=>{
	
	
	const apn = require('apn');
		let options = {
			token: {
				key: "AuthKey_6T497NY2NP.p8",
				// Replace keyID and teamID with the values you've previously saved.
				keyId: "6T497NY2NP",
				teamId: "SFA9GUN7NY"
			},
			production: false
		};

		let apnProvider = new apn.Provider(options);

		// Replace deviceToken with your particular token:
		let deviceToken = "021d7839f26f472fd7c092c7085146a241a4b6f421c245e92ad77f210fa36d78";

		// Prepare the notifications
		let notification = new apn.Notification();
		notification.expiry = Math.floor(Date.now() / 1000) + 24 * 3600; // will expire in 24 hours from now
		notification.badge = 2;
		notification.sound = "ping.aiff";
		notification.alert = "Test message";
		notification.payload = {'messageFrom': 'Test message'};

		// Replace this with your app bundle ID:
		notification.topic = "com.fullestop.PushChat";

		// Send the actual notification
		apnProvider.send(notification, deviceToken).then( result => {
		// Show the result of the send operation:
		console.log(result);
		});


	// Close the server
	apnProvider.shutdown();
	}
}	
module.exports = new Registration();
