var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto');
const asyncParallel = require("async/parallel");
const moment = require('moment');
function UserService() {

	/** curent date get*/
	var currentDate = String(getDateMoment().date());
	const saltRounds= BCRYPT_PASSWORD_SALT_ROUNDS;
	/** curent month get*/
	var now = getUtcDate();


	/**
	* function for add rider user
	*
	* param null
	* */
	this.addUser = (req, res, next, callback) => {
		return new Promise(resolve=>{
			/** Sanitize Data **/
			let finalResponse = {};
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let userType		=	(req.body.user_type) 		? 	req.body.user_type	:"";			
			if(userType == "" || !FRONT_USER_TYPE[userType]){
				/** Send error response **/
				finalResponse = {
					status: STATUS_ERROR_INVALID_ACCESS,
					result: {},
					message: res.__("Invalid user type.")
					
				};
				return resolve(finalResponse);	
			}
			consoleLog("basic add start in service");
			
			let password		=	(req.body.password)			? 	req.body.password			:"";			
			let confirmPassword	=	(req.body.confirm_password) ? 	req.body.confirm_password	:"";			
			let userRoleId		=	FRONT_USER_ROLE_IDS[userType];			
			let userId			=	(req.body.user_id) 			? 	req.body.user_id	:ObjectId();	
			let requestFrom		=	(req.body.request_from) 			? 	req.body.request_from	:REQUEST_FROM_ADMIN;				
			/** Set options for upload image **/
			let oldimage= 	(req.body.old_image) ? req.body.old_image :"";
			let image	= 	(req.files && req.files.profile_image)	?	req.files.profile_image	:"";
			
			let email		  			= (req.body.email) ? req.body.email : "";
			let fbSocialId				= (req.body.facebook_id) ? req.body.facebook_id : "";
			let googleSocialId			= (req.body.google_id) ? req.body.google_id : "";  
			let countryCode				= (req.body.country_code) ? req.body.country_code : DEFAULT_COUNTRY_CODE;
			let countryCodeDialCode		= (req.body.country_code_dial_code) ? req.body.country_code_dial_code : '';

			var mobileNumber  				= (req.body.phone_number) ? req.body.phone_number : "";
			var mobileNumber  				= countryCode+mobileNumber;
			var phoneNumber   				= (req.body.phone_number) ? req.body.phone_number : "";  


			
			/** Configure user unique conditions **/
			const users = db.collection(TABLE_USERS);
		
				let errMessageArray = [];

				
				let options	=	{
					'image' 	:	image,
					'filePath' 	: 	USERS_FILE_PATH,
					'oldPath' 	: 	oldimage
				};
			
				/** Upload user image **/
				moveUploadedFile(req, res,options).then(response=>{
					if(response.status == STATUS_ERROR){
						/** Send error response **/
						errMessageArray.push({ 'param': 'profile_image', 'msg': response.message });
						if(errMessageArray.length > 0){
							finalResponse = {
								status: STATUS_ERROR_FORM_VALIDATION,
								errors: errMessageArray,
								message: "Errors",
							};
							return resolve(finalResponse);
						}
					}
					
					
					let fullName 	= 	(req.body.full_name) 	? req.body.full_name 	:""; 
			

					let fullNameBreak = fullName.split(/(?<=^\S+)\s/);
					let firstName 	= 	fullNameBreak[0];
					let lastName 	= 	fullNameBreak[1];


					let authUserId 	=	(req.body.created_by) 	? req.body.created_by 	:MONGO_ID;
					var imageName 	= 	(response.fileName) 	? response.fileName 	:"";
					
					let dateofbirth			= 	(req.body.date_of_birth)	? req.body.date_of_birth:	"";
					let countryId 	= 	(req.body.country_id) 		? 	req.body.country_id				:	MONGO_ID;
					let stateId 	= 	(req.body.state_id) 		? 	req.body.state_id				:	MONGO_ID;
					let cityId 		= 	(req.body.city_id) 			? 	req.body.city_id				:	MONGO_ID;
					let postalCode 	= 	(req.body.postal_code) 		? 	req.body.postal_code				:	DEACTIVE;
				
				/**bcrypt password generate */
				bcryptPasswordGenerate(password).then(function(bcryptPassword) {	
						
						
						/** Set update data **/	
						let updateData = {
							first_name	 	: 	firstName,
							last_name	 	: 	lastName,
							full_name	 	: 	fullName,
							email 			: 	email,
							mobile_number 	: 	mobileNumber,						
							phone_number 	: 	phoneNumber,						
							modified 		: 	getUtcDate()						
						};	
					
						if(password){
							updateData["password"] = bcryptPassword;
						}					
						/** Set options for get user slug **/
						let slugOptions = {
							title 		:	fullName,
							table_name 	: 	TABLE_USERS,
							slug_field 	: 	"slug"
						};
					
						asyncParallel({
							 /** Genrate OTP for mobile **/
							mobile_otp:(callback)=>{
								
								getRandomOTP().then(mobile_otp => {
									callback(null,mobile_otp);
								})
							},
							 /** Genrate OTP for email **
							email_otp:(callback)=>{
								
								getRandomOTP().then(email_otp => {
									callback(null,email_otp);
								})
							},
							 /** Genrate slug **/
							slug:(callback)=>{
								
								getDatabaseSlug(slugOptions).then(slugResponse=>{
									callback(null,slugResponse);
								})
							},
								
						},(err,response)=>{
						
							let mobileOtpCode    	= response.mobile_otp;
							let emailOtpCode    	= response.mobile_otp;
							let slugName   			= response.slug.title;
							let referredBy			=	MONGO_ID
							let isMobileVerified 	=	(req.body.is_mobile_verified) 	? req.body.is_mobile_verified 	: DEACTIVE;
							let isEmailVerified 	=	(req.body.is_email_verified) 	? req.body.is_email_verified 	: DEACTIVE;
							//let isEmailVerified 	=	 ACTIVE;
							
							
							let currentTimeStamp 	= 	new Date().getTime();
							var validateString 		= crypto.createHash('md5').update(currentTimeStamp + email).digest("hex");
							/** Set insert data **/	
							
							var languageId = [];
							languageId.push(ObjectId(MONGO_ID));
							/** Update otp number **/
							var day = new Date();
							var nextDay = new Date(day);
							nextDay.setDate(day.getDate() + 1);
							
							let age = DEACTIVE;
							if(dateofbirth != ""){
								age = 	calculateAge(dateofbirth);
							}

							let pnTypesArray = Object.keys(PN_TYPE_CONFIG).map(item => {
								return  item;
							});
							
							let insertData = {
								first_name	 			: 	firstName,
								last_name	 			: 	lastName,
								full_name	 			: 	fullName,
								email 					: 	email,
								mobile_number 			: 	mobileNumber,						
								phone_number 			: 	phoneNumber,	
								phone_country_code 		: 	countryCode,
								country_code_dial_code	:	countryCodeDialCode,
								wallet_balance 			: 	0,
								created_by 				: 	ObjectId(authUserId),
								is_mobile_verified 		: 	Number(isMobileVerified),
								is_email_verified 		: 	Number(isEmailVerified),
								is_admin_approved		:	Number(ACTIVE),
								is_deleted 				: 	NOT_DELETED,
								active 					: 	ACTIVE,
								profile_view_count		:	DEACTIVE,
							
								country_id 				: 	ObjectId(countryId),
								state_id 				: 	ObjectId(stateId),
								city_id 				: 	ObjectId(cityId),
								user_type				:	userType,
								fb_social_id			:	fbSocialId,
								google_social_id		:	googleSocialId,
								mobile_verification_code: 	mobileOtpCode,
								email_verification_code	: 	emailOtpCode,
								validate_string			: 	validateString,
								temp_email				: 	email,
								temp_mobile_number		: 	mobileNumber,
								profile_image			:	imageName,
								date_of_birth			:	dateofbirth,
								age						:	Number(age),
								is_online				:	OFFLINE,
								postal_code				:	postalCode,
								otp_verification_code_time	:	nextDay,
								password				:	bcryptPassword,
								slug					:	slugName,
								total_post				:	DEACTIVE,
								total_followers			:	DEACTIVE,
								total_following			:	DEACTIVE,
								user_role_id 			: 	userRoleId,
								pn_allowed				:	pnTypesArray,
								created 				: 	getUtcDate(),
								modified 				: 	getUtcDate()			
							};

							consoleLog(insertData);
							//return false;
							let updateData = {
								is_update : ACTIVE,
								
							}
							/** Save and update user data **/
							
							users.findOneAndUpdate({
								_id: userId
							},{
								$set		: updateData,
								$setOnInsert: insertData
							},{upsert: true},
							(err, result) => {
								//consoleLog(result);
								if (err) {
									finalResponse = {
										status: STATUS_ERROR_INVALID_ACCESS,
										result: {},
										message: res.__("front.system.something_going_wrong_please_try_again")
										
									};
									return resolve(finalResponse);
								}
								var lastInsertId	= MONGO_ID;
								
								if(result.lastErrorObject.updatedExisting){
									lastInsertId = (result.value._id) ? result.value._id : "";
								}else{
									lastInsertId = (result.lastErrorObject.upserted) ?  result.lastErrorObject.upserted : "";	
								}
								/** Send success response **/
								let userTypeTitle	=	(FRONT_USER_TYPE[userType])	?	FRONT_USER_TYPE[userType] 	:"";
								finalResponse = {
									status: STATUS_SUCCESS,
									result: {
										userTypeTitle 	: 	userTypeTitle,
										mobileNumber	:	mobileNumber,
										email			:	email,
										fullName		:	fullName,
										password		:	password,
										mobileOtpCode	:	mobileOtpCode,
										emailOtpCode	:	emailOtpCode,
										validateString	:	validateString,
										lastInsertId	:	lastInsertId,
									},
									message: STATUS_SUCCESS,
								};
								return resolve(finalResponse);
								
							});
						});
				}).catch(next);
			});
			
		}).catch(next);
	};
	
	
	
	
	/**
	* function for edit  user
	* param null
	* */
	this.editUser = (req, res, next, callback) => {
		return new Promise(resolve=>{

			
			/** Sanitize Data **/
			let finalResponse = {};
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let userType		=	(req.body.user_type) 		? 	req.body.user_type	:"";			
			if(userType == "" || !FRONT_USER_TYPE[userType]){
				/** Send error response **/
				finalResponse = {
					status: STATUS_ERROR_INVALID_ACCESS,
					result: {},
					message: res.__("Invalid user type.")
					
				};
				return resolve(finalResponse);	
			}
		
			let password		=	(req.body.password)			? 	req.body.password			:"";			
			let confirmPassword	=	(req.body.confirm_password) ? 	req.body.confirm_password	:"";			
			let userRoleId		=	FRONT_USER_ROLE_IDS[userType];	
			let userId;
			let loginUserOldData 	=	(req.user_data) 		?	req.user_data 			:	"";

			if((req.body.api_type)==MOBILE_API_TYPE){
				let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
				 userId 			= (loginUserData._id) ? loginUserData._id : "";	
			
			}else{

				 userId 			= (req.params.id) ? req.params.id : "";	
			}
				
		//	let userId			=	(req.body.user_id) 			? 	req.body.user_id	:ObjectId();	
			let requestFrom		=	(req.body.request_from) 			? 	req.body.request_from	:REQUEST_FROM_ADMIN;				

			let profileDescription		  	= (req.body.profile_description) ? req.body.profile_description : "";
			let email		  				= (req.body.email) ? req.body.email : "";
			let countryCode					= (req.body.country_code) ? req.body.country_code : DEFAULT_COUNTRY_CODE;
			let countryCodeDialCode			= (req.body.country_code_dial_code) ? req.body.country_code_dial_code : '';
			var mobileNumber  				= (req.body.phone_number) ? req.body.phone_number : "";
			var mobileNumber  				= countryCode+mobileNumber;
			var phoneNumber   				= (req.body.phone_number) ? req.body.phone_number : "";  
			const users 					= db.collection(TABLE_USERS);
		
			

				
				/** Set options for upload image **/
				let oldimage= 	(req.body.old_image) ? req.body.old_image :"";
				let image	= 	(req.files && req.files.profile_image)	?	req.files.profile_image	:"";
				let bannerImage	= 	(req.files && req.files.banner_image)	?	req.files.banner_image	:"";
				let options	=	{
					'image' 	:	image,
					'filePath' 	: 	USERS_FILE_PATH,
				//	'oldPath' 	: 	oldimage
				};
			
				/** Upload user  image **/
				moveUploadedFile(req, res,options).then(response=>{
					if(response.status == STATUS_ERROR){
						/** Send error response **/
						return res.send({
							status	: STATUS_ERROR,
							message	: [{'param':'profile_image','msg':response.message}],
						});
					}


					let BannerImageOptions	=	{
						'image' 	:	bannerImage,
						'filePath' 	: 	USERS_FILE_PATH,
					//	'oldPath' 	: 	oldimage
					};

						/** Upload banner  image **/
				moveUploadedFile(req, res,BannerImageOptions).then(bannerResponse=>{
					if(response.status == STATUS_ERROR){
						/** Send error response **/
						return res.send({
							status	: STATUS_ERROR,
							message	: [{'param':'banner_image','msg':response.message}],
						});
					}
					
					let fullName 	= 	(req.body.full_name) 	? req.body.full_name 	:""; 

				
			


				let fullNameBreak = ((/\s/.test(fullName))=="false") ? fullName : fullName.split(/(?<=^\S+)\s/);
				let firstName 	= 	((/\s/.test(fullName))=="false") ? fullName : fullNameBreak[0];
				let lastName 	= 	((/\s/.test(fullName))=="false") ? "" : fullNameBreak[1];

					let authUserId 	=	(req.session.user) 	? req.session.user._id 	:"";
					var imageName 	= 	(response.fileName) ? response.fileName 	:loginUserOldData.profile_image;
					var bannerImageName 	= 	(bannerResponse.fileName) ? bannerResponse.fileName 	:loginUserOldData.banner_image;

					consoleLog("imageName IS ");
					consoleLog(imageName);
					
					
					let dateofbirth			= 	(req.body.date_of_birth)	? req.body.date_of_birth:	DEACTIVE;
					let countryId 	= 	(req.body.country_id) 		? 	req.body.country_id				:	MONGO_ID;
					let stateId 	= 	(req.body.state_id) 		? 	req.body.state_id				:	MONGO_ID;
					let cityId 		= 	(req.body.city_id) 			? 	req.body.city_id				:	MONGO_ID;
					let postalCode 	= 	(req.body.postal_code) 		? 	req.body.postal_code				:	DEACTIVE;

					let age = DEACTIVE;
					if(dateofbirth != ""){
						age = 	calculateAge(dateofbirth);
					}


				/**bcrypt password generate */
			bcryptPasswordGenerate(password).then(function(bcryptPassword) {
						
						
					/***Notification Start**
					let notificationMessageParams	= [fullName];
					let notificationOptions 		= {
						notification_data : {
							notification_type	: NOTIFICATION_USER_REGISTER,
							message_params		: notificationMessageParams,
							parent_table_id		: req.params.id,
							user_id				: req.params.id,
							user_role_id		: SUPER_ADMIN_ROLE_ID,
							user_ids			: [req.params.id],
							role_id				: SUPER_ADMIN_ROLE_ID,
							extra_parameters	: {
								user_id	: ObjectId(req.params.id),
							}
						}
					};
					insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
						if(notificationResponse){
							let options = {
								user_id : req.params.id,
								pn_body : notificationResponse.notificationMessage,
								pn_title : notificationResponse.notificationTitle,
								device_type : 'android',
								device_token : 'android',
							};
							pushNotification(res,req,options).then(response=>{});
						}	
					});
					/***Notification End**/
					
					
					
						/** Set update data **/	
						let updateData = {
							first_name	 	: 	firstName,
							last_name	 	: 	lastName,
							full_name	 	: 	fullName,
							date_of_birth	:	dateofbirth,
							country_id 		: 	ObjectId(countryId),
							state_id 		: 	ObjectId(stateId),
							city_id 		: 	ObjectId(cityId),
							profile_description		:   profileDescription,
							//country_code_dial_code	:	countryCodeDialCode,
							//phone_country_code 		: 	countryCode,
							//mobile_number 			: 	mobileNumber,						
							//phone_number 			: 	phoneNumber,	
							postal_code				:	postalCode,
							profile_image			:	imageName,
							banner_image	:	bannerImageName,		
							age				:	age,			
							modified 		: 	getUtcDate()						
						};	
						consoleLog(updateData);
					
						if(password){
							updateData["password"] = bcryptPassword;
						}					
						if(requestFrom != REQUEST_FROM_ADMIN)
						{
							updateData["country_code_dial_code"] = countryCodeDialCode;
							updateData["phone_country_code"] = countryCode;
							updateData["mobile_number"] = mobileNumber;
							updateData["phone_number"] = phoneNumber;
						}
						/** Set options for get user slug **/
						let slugOptions = {
							title 		:	fullName,
							table_name 	: 	TABLE_USERS,
							slug_field 	: 	"slug"
						};
						
						
					
						/** Get slug **/
						getDatabaseSlug(slugOptions).then(slugResponse=>{

							var lastInsertId	= MONGO_ID;

							/** Set insert data **/	
							// let insertData = {
							// 	wallet_balance 		: 	0,
							// 	created_by 			: 	ObjectId(authUserId),
							// 	is_verified 		: 	VERIFIED,
							// 	is_mobile_verified 	: 	VERIFIED,
							// 	is_email_verified 	: 	VERIFIED,
							// 	is_deleted 			: 	NOT_DELETED,
							// 	active 				: 	ACTIVE,
								
							// 	user_type			:	userType,
							// 	slug 				: 	(slugResponse && slugResponse.title)	?	slugResponse.title	:"",
								
							// 	created 			: 	getUtcDate()
							// };
					
							/** Save and update user data **/
							users.updateOne({
								_id: ObjectId(userId)
							},
							{
								$set		: updateData,
							//	$setOnInsert: insertData
							},{upsert: true},
							(err, result) => {
								
							//	consoleLog(result);
								if(err) return next(err);
							//	consoleLog(result);
								/** Send success response **/
								let userTypeTitle	=	(FRONT_USER_TYPE[userType])	?	FRONT_USER_TYPE[userType] 	:"";
								let message			=	res.__("admin.user.user_details_has_been_updated_successfully",userTypeTitle);


							/** Send success response **/
						//	let userTypeTitle	=	(FRONT_USER_TYPE[userType])	?	FRONT_USER_TYPE[userType] 	:"";

						// if(result.lastErrorObject.updatedExisting){
						// 	lastInsertId = (result.value._id) ? result.value._id : "";
						// }else{
						// 	lastInsertId = (result.lastErrorObject.upserted) ?  result.lastErrorObject.upserted : "";	
						// }


							finalResponse = {
								status: STATUS_SUCCESS,
								result: {
									userTypeTitle 	: 	userTypeTitle,
									mobileNumber	:	mobileNumber,
									email			:	email,
									fullName		:	fullName,
									password		:	password,
								//	mobileOtpCode	:	mobileOtpCode,
								//	emailOtpCode	:	emailOtpCode,
								//	validateString	:	validateString,
									lastInsertId	:	lastInsertId,
									slug 			: loginUserOldData.slug
								},
								message: STATUS_SUCCESS,
							};
							return resolve(finalResponse);
								
								// req.flash(STATUS_SUCCESS,message);
								// res.send({
								// 	status		: STATUS_SUCCESS,
								// 	redirect_url: WEBSITE_ADMIN_URL+"users/"+userType,
								// 	message		: message,
								// });
							
							});
						});
				}).catch(next);
			});
		});

		}).catch(next);
	};

	
	/**
	* function for edit rider profile
	*
	* 
	* */
	this.editRiderProfile = (req, res, next, callback) => {
		return new Promise(resolve=>{
			/** Sanitize Data **/
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);			
			let finalResponse = {};
			
			/** Check validation **/
			req.checkBody({
				"first_name": {
					notEmpty: true,
					errorMessage: res.__("admin.user.please_enter_first_name")
				},
				"last_name": {
					notEmpty: true,
					errorMessage: res.__("admin.user.please_enter_last_name")
				},
				"gender": {
					notEmpty: true,
					errorMessage: res.__("admin.user.please_select_gender"),
				},
				"question_id": {
					notEmpty: true,
					errorMessage: res.__("admin.user.please_enter_question"),
				},
				"answer": {
					notEmpty: true,
					errorMessage: res.__("admin.user.please_enter_answer"),
				},
			}); 
				
			/** parse Validation array  **/
			let errorLength = req.validationErrors().length;
			if(typeof errorLength != 'undefined'){
				finalResponse = {
					status	: STATUS_ERROR_FORM_VALIDATION,
					errors	: req.validationErrors(),
					message	: "Errors",
				};
				return resolve(finalResponse);
			}
			
			let firstName 			= 	(req.body.first_name) 			? 	req.body.first_name 		:	"";
			let lastName 			= 	(req.body.last_name) 			? 	req.body.last_name 			:	"";
			let gender	 			=	(req.body.gender) 				?	req.body.gender 			:	"";
			let questionId 			= 	(req.body.question_id) 			? 	req.body.question_id		:	"";
			let answer 				= 	(req.body.answer) 				? 	req.body.answer 			:	"";
			let slug			 	= 	(req.body.slug) 				? 	req.body.slug				:	"";
			let userId			 	= 	(req.body.user_id) 				? 	req.body.user_id				:	"";
			
			let fullName 			= 	firstName+" "+lastName;
			
			/** Configure user unique conditions **/
			const users = db.collection(TABLE_USERS);
			users.updateOne(
			{
				_id : ObjectId(userId)
			},
			{
				$set: {
					first_name	 		: 	firstName,
					last_name	 		: 	lastName,
					full_name	 		: 	fullName,
					gender 				:	gender,
					question_id			:	ObjectId(questionId),
					answer				:	answer,
					api_type			:	req.body.api_type,
					modified 			: 	getUtcDate(),
				}
			},
			function(err,UserQryResult){
				if(!err && UserQryResult){
					
					let conditions = {
						_id : ObjectId(userId)
					}
					/** Set options data for get user details **/
					let userOptions = {
						conditions	:	conditions,
						fields		:	{facebook_id :0}
					};
					getUserDetailBySlug(req, res, userOptions).then(response => {
					
						finalResponse = {
							status	: STATUS_SUCCESS,
							result	: response.result,
							message	: res.__("admin.user.user_details_has_been_updated_successfully",'Rider'),
						};
						return resolve(finalResponse);
					});
				}else{
					finalResponse = {
						status	: STATUS_ERROR,
						result	: {},
						message	: res.__("system.something_going_wrong_please_try_again")
					};
					return resolve(finalResponse);
				}
				//callback(datap);
			});
		}).catch(next);
	};
	
	
	
	/**
	* function for save user address
	*
	* param null
	* */
	this.saveAddressService = (async (req, res, next, callback) => {
		return new Promise(resolve=>{
			/** Sanitize Data **/
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);			
			let finalResponse = {};
			/** Check validation **/
			req.checkBody({
				"address": {
					notEmpty: true,
					errorMessage: res.__("admin.user.please_enter_address")
				},
				"city_formatted_address": {
					notEmpty: true,
					errorMessage: res.__("admin.user.please_enter_location")
				},
				"zip_code": {
					notEmpty: true,
					errorMessage: res.__("admin.user.please_enter_zip_code"),
				},
			});
			/** parse Validation array **/
			let errorLength = req.validationErrors().length;
			if(typeof errorLength != 'undefined'){
				finalResponse = {
					status	: STATUS_ERROR_FORM_VALIDATION,
					errors	: req.validationErrors(),
					message	: "Errors",
				};
				return resolve(finalResponse);
			}
			let slug					=	(req.body.slug)						?	req.body.slug					:	"";
			let userId					=	(req.body.user_id)					?	req.body.user_id				:	"";
			let address					=	(req.body.address)					?	req.body.address				:	"";
			let cityFormattedAddress	=	(req.body.city_formatted_address)	?	req.body.city_formatted_address	:	"";
			let languageKnown			=	(req.body.language_known)			?	req.body.language_known			:	"";
			let zipCode					=	(req.body.zip_code)					?	req.body.zip_code				:	"";
			let countryCode				=	(req.body.country_code)				?	req.body.country_code			:	"";
			let stateName				=	(req.body.state_name)				?	req.body.state_name				:	"";
			let cityName				=	(req.body.city_name)				?	req.body.city_name				:	"";
			
			
			const country	=	db.collection(TABLE_COUNTRY);
			const states	=	db.collection(TABLE_STATES);
			const city	=	db.collection(TABLE_CITY);
			
			let updateData = {
				updated_at :getUtcDate(),
			}
			let countryInsertData = {
				country_name :countryCode,
				 status		: ACTIVE,
				is_default		: DEACTIVE,
				created_at		:	getUtcDate(),
				
			}
			/** Find in country and update or insert**/
			country.findOneAndUpdate({
				country_iso_code : countryCode
			},{
				$set		: updateData,
				$setOnInsert: countryInsertData
			},{upsert: true},
			(err, result) => {
				
				var countryId = "";
				if(result.lastErrorObject.updatedExisting){
					countryId = (result.value._id) ? result.value._id : "";
				}else{
					countryId = (result.lastErrorObject.upserted) ?  result.lastErrorObject.upserted : "";	
				}	
				
				/** Find in state and update or insert*/
				let stateInsertData = {
					state_name :stateName,
					country_id :ObjectId(countryId),
					status		: ACTIVE,
					created_at		:	getUtcDate(),
				}
				var stateRegex 		= 	new RegExp(["^", stateName, "$"].join(""), "i"); //case-insensitive query?
				states.findOneAndUpdate({
					state_name : stateRegex,
					country_id  : ObjectId(countryId)
				},{
					$set		: updateData,
					$setOnInsert: stateInsertData
				},{upsert: true},
				(err, stateResult) => {
					
					var stateId = "";
					if(stateResult.lastErrorObject.updatedExisting){
						stateId = (stateResult.value._id) ? stateResult.value._id : "";
					}else{
						stateId = (stateResult.lastErrorObject.upserted) ?  stateResult.lastErrorObject.upserted : "";	
					}	
					
					/** Find in city and update or insert*/
					let cityInsertData = {
						city_name :cityName,
						state_id :ObjectId(stateId),
						country_id :ObjectId(countryId),
						status		: ACTIVE,
						created_at		:	getUtcDate(),
					}
					var cityRegex 		= 	new RegExp(["^", cityName, "$"].join(""), "i"); //case-insensitive query?
					city.findOneAndUpdate({
						city_name : cityRegex,
						state_id  : ObjectId(stateId)
					},{
						$set		: updateData,
						$setOnInsert: cityInsertData
					},{upsert: true},
					(err, cityResult) => {
						var cityId = "";
						if(cityResult.lastErrorObject.updatedExisting){
							cityId = (cityResult.value._id) ? cityResult.value._id : "";
						}else{
							cityId = (cityResult.lastErrorObject.upserted) ?  cityResult.lastErrorObject.upserted : "";	
						}
						
						
						
						const userAddress = db.collection(TABLE_USER_ADDRESS);
						
						userAddress.insertOne({
							'user_id'					:	ObjectId(userId),
							'status'					:	ACTIVE,
							'is_deleted'				:	NOT_DELETED,
							'is_favorite'				:	DEACTIVE,
							'address'					:	address,
							'city_formatted_address'	:	cityFormattedAddress,
							'zip_code'					:	zipCode,
							'country_id'				:	ObjectId(countryId),
							'state_id'					:	ObjectId(stateId),
							'city_id'					:	ObjectId(cityId),
							'modified' 					: 	getUtcDate(),
							'created'					:	getUtcDate(),
								
							
							},(insertErr,insertSuccess)=>{
							if(insertErr){
								finalResponse = {
									status: STATUS_ERROR_INVALID_ACCESS,
									result: {},
									message: res.__("front.system.something_going_wrong_please_try_again")
									
								};
								return resolve(finalResponse);
							}
							finalResponse = {
								status: STATUS_SUCCESS,
								message: STATUS_SUCCESS,
							};
							return resolve(finalResponse);
							
							
						});
						
					});
				});
				
			});
			
		}).catch(next);
	}); //End saveAddressService
	
	
	/**
	* function for save profile request 
	*
	* param null
	* */
	this.updateProfileRequestService = (async (req, res, next, callback) => {
		return new Promise(resolve=>{
			/** Sanitize Data **/
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);			
			let finalResponse = {};
			/** Check validation **/
			req.checkBody({
				"message": {
					notEmpty: true,
					errorMessage: res.__("admin.profile_request.please_enter_message")
				},
			});
			/** parse Validation array **/
			let errorLength = req.validationErrors().length;
			if(typeof errorLength != 'undefined'){
				finalResponse = {
					status	: STATUS_ERROR_FORM_VALIDATION,
					errors	: req.validationErrors(),
					message	: "Errors",
				};
				return resolve(finalResponse);
			}
			
			
			let userId		=	(req.body.user_id)		?	req.body.user_id		:	"";
			let message		=	(req.body.message)		?	req.body.message		:	"";
			
			
			const updatePofileRequest	=	db.collection(TABLE_UPDATE_PROFILE_REQUEST);
			updatePofileRequest.insertOne({
				'user_id'		:	ObjectId(userId),
				//'subject_id'	:	ObjectId(subjectId),
				'message'		:	message,
				'is_deleted'	:	NOT_DELETED,				
				'is_approved'	:	DEACTIVE,
				'modified' 		: 	getUtcDate(),
				'created'		:	getUtcDate(),
			},(insertErr,insertSuccess)=>{
				if(insertErr){
					finalResponse = {
						status: STATUS_ERROR_INVALID_ACCESS,
						result: {},
						message: res.__("front.system.something_going_wrong_please_try_again")
						
					};
					return resolve(finalResponse);
				}
				finalResponse = {
					status: STATUS_SUCCESS,
					message: STATUS_SUCCESS,
				};
				return resolve(finalResponse);
			});
		}).catch(next);
	}); //End updateProfileRequestService
	
	
	
	
	
	
}
module.exports = new UserService();
