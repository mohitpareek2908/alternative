var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto');
var async = require('async');
var moment = require('moment');
const util = require('util');

const userObj = require(WEBSITE_CLASSES_FOLDER_PATH+'user.js');

function Default() {

	/** curent date get*/
	var currentDate = String(getUtcDate().getDate()).padStart(2, '');

	/** curent month get*/
	var now = getUtcDate();


	/**
	 *  Function for get settings list
	 */
	this.getGlobalSettings = function (req, res, next, callback) {
		var settings = db.collection(TABLE_SETTINGS);
		settings.find({
			"type": {$in : CONDITION_SETTING},
		}, { key_value: 1, value: 1 }).toArray(function (err, result) {
			if (result.length > 0) {
				var dataJson = {};
				for (var i = 0; i < result.length; i++) {
					dataJson[result[i]['key_value']] = result[i]['value']
				}

				var finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: dataJson,
						message: "",
					}
				};
				return callback(finalResponse);

			} else {
				var finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: [],
						message: res.__("api.global.no_record_found")
					}
				};
				return callback(finalResponse);
			}
		});
	};



	/**
     * function for get category Detaills
     *
     * param slug
     * */
	 this.getUserInterestRoleWise = function (req, res, next, callback) {

		req.body 				= sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
		let userRoles 			= (req.body.user_role) 		? req.body.user_role 			: [];
		let loginUserData 		= (req.user_data) 		?	req.user_data 			:	"";
		let userId				= (loginUserData._id)	?	loginUserData._id		:	"";	

		let finalResponse 		= {};

		consoleLog("User roles are ");
		consoleLog(userRoles);

		 /**For check slug */
		 if (userRoles.length == 0) {
			finalResponse = {
				'data': {
					status: STATUS_ERROR_INVALID_ACCESS,
					result: [],
					message: res.__("api.global.parameter_missing")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}

	

		let userRoleId 				= (loginUserData.user_role_id)					?	loginUserData.user_role_id		:	"";	;
		let userRoleType 			= (loginUserData.user_type)						?	loginUserData.user_type		:	"";	
		let userSavedCategory 		= (loginUserData.interested_category_id)		?	loginUserData.interested_category_id		:	"";	
		
		var adminRoles = db.collection(TABLE_ADMIN_ROLE);

		let conditions = {
			user_type 			: { $in: userRoles }
		}
	
		adminRoles.aggregate([
			{$match :conditions},
					
			{
				$lookup:{

					
						from: TABLE_CATEGORIES,
						localField: "category_ids",
						foreignField: "_id",
						as :"categoryDetail"
				}
			},
			
		
			{$project:
				{
					_id:0,
					categoryDetail: {
						_id: 1,
						name: 1,
					}
			}}	
		]).toArray((err,result)=>{
			
			
			
			let cateDetails = result;

			if (cateDetails.length > 0) {

				let categoryList = [];
				categoryList.push({"id":"","name":"Select Category*"});
				cateDetails.map((record)=>{  

				
					let catValues= record.categoryDetail;

					catValues.map((catRecords)=>{  
						
					categoryList.push(catRecords);
					
				})
					
				})

			var filteredArr=	 categoryList.filter(function (a) {
					return !this[a._id] && (this[a._id] = true);
				}, Object.create(null));
				 
				

				var finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: filteredArr,
						message: "",
					}
				};
				return returnApiResult(req,res,finalResponse);
			} else {
				var finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: [],
						message: res.__("api.global.no_record_found")
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
		});
	};


	






	/**
     * function for get category Detaills
     *
     * param slug
     * */
		 this.getUserCategory = function (req, res, next, callback) {

			req.body 			= sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
			let slug 			= (req.body.slug) ? req.body.slug : "";
			let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
			let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			let finalResponse = {};
			 /**For check slug */
			 if (slug == '') {
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						result: {},
						message: res.__("api.global.parameter_missing")
	
					}
				};
				return returnApiResult(req,res,finalResponse);
			}


		
	
			let userRoleId 				= (loginUserData.user_role_id)		?	loginUserData.user_role_id		:	"";	;
			let userRoleType 			= (loginUserData.user_type)		?	loginUserData.user_type		:	"";	
			let userSavedCategory 		= (loginUserData.interested_category_id)		?	loginUserData.interested_category_id		:	"";	
			consoleLog( userSavedCategory );
			consoleLog(typeof userSavedCategory );
	
			var adminRoles = db.collection(TABLE_ADMIN_ROLE);
	
			let conditions = {
				_id 			: ObjectId(userRoleId)
			}
			adminRoles.aggregate([
				{$match :conditions},
						
				{
					$lookup:{
	
						
							from: TABLE_CATEGORIES,
							localField: "category_ids",
							foreignField: "_id",
							as :"categoryDetail"
					}
				},
			
				{$project:
					{
						_id:0,
						categoryDetail: {
							_id: 1,
							name: 1,
						}
				}}	
			]).toArray((err,result)=>{
				
				let cateDetails = result[0].categoryDetail;
				let interestUpdated = DEACTIVE;
	
				if (cateDetails.length > 0) {
	
					let categoryList = [];
					categoryList.push({"id":"","text":"Select Category*"});
					cateDetails.map((record)=>{  
						let bac = Object.values(userSavedCategory).toString();
						
						if(bac.indexOf(String(record._id)) > -1)
						{	
							interestUpdated = ACTIVE;
							categoryList.push({"id":record._id,"text":record.name,"is_saved":ACTIVE})
						}else{
							categoryList.push({"id":record._id,"text":record.name,"is_saved":DEACTIVE})

						}
						
					})
	
					var finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							result: categoryList,
							Is_intreset_updated: interestUpdated,
							message: "",
						}
					};
					return returnApiResult(req,res,finalResponse);
				} else {
					var finalResponse = {
						'data': {
							status: STATUS_ERROR,
							result: [],
							message: res.__("api.global.no_record_found")
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
			});
		};








    /**
     * function for get cms Detaills
     *
     * param slug
     * */
	this.getCmsDetails = function (req, res, next, callback) {
		var slug = (req.body.page_slug) ? req.body.page_slug : "";
		let finalResponse = {};
		
		/** Slug validation **/
		if (slug && slug == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: [],
					message: res.__("api.global.parameter_missing")
				}
			};
			return returnApiResult(req, res,finalResponse);
			
		}
		const cms = db.collection(TABLE_PAGES);
		cms.findOne({ slug: slug },{projection : { name: 1, body: 1,meta_title : 1,meta_description : 1,meta_keyword : 1} }, (err, result) => {
			if (err || result == '' || result == null) {
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: [],
						message: res.__("front.cms.cms_invalid_url")
					}
				};
				return returnApiResult(req, res,finalResponse);
				
			} else {
				
				let userOptions = {};
				userObj.getUzubeUser(req, res, userOptions).then(userResponse => {
					
					consoleLog("userResponse");
					consoleLog(userResponse);
					
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							result: result,
							message: "",
						}
					};
					return returnApiResult(req, res,finalResponse);
				});
			}
		});
	}
		

	/**
	* function for get block
	*
	* param null
	* */
	this.getBlockData = (req, res, next, callback) => {
		let slug = (req.body.slug) ? req.body.slug : '';
		let commonConditions = {
			block_slug: slug,
		}
		const block = db.collection(TABLE_BLOCK);
		block.findOne(
			commonConditions,{
				projection: {
					_id: 1, page_name: 1, block_name: 1, description: 1
				}
		}, (err, blockResult) => {
			let finalResponse = {};
			if (err) {
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: [],
						message: res.__("system.something_going_wrong_please_try_again")
					}
				};
				return callback(finalResponse);
			} else {
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: (blockResult) ? blockResult : [],
						message: ''
					}
				};
				return callback(finalResponse);
			}
		});
	};



	
	/**
	* function for slider data
	*
	* param null
	* */
	this.getSliderData = (req, res, next, callback) => {
		const slider = db.collection(TABLE_SLIDER);
		slider.find( {
			"is_active"	:	ACTIVE
		},
		{
			projection: { 
				_id: 1, image: 1,display_order:1,description:1
			}
		}).sort({"display_order": SORT_ASC}).toArray((err, sliderResult) => {
			let finalResponse = {};
			if (err) {
				finalResponse = {
					'data': {
						status				:	STATUS_ERROR,
						slider_image_url	:	SLIDERS_URL,
						result				:	[],
						message				: res.__("front.system.something_going_wrong_please_try_again")
					}
				};
				return callback(finalResponse);
			} else {
				finalResponse = {
					'data': {
						status				:	STATUS_SUCCESS,
						slider_image_url	:	SLIDERS_URL,
						result				:	(sliderResult) ? sliderResult : [],
						message				:	''
					}
				};
				return callback(finalResponse);
			}
		});
	};
	
	/** 
     * function for contact us page save
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 */
	this.contactUs = (req,res,next,callback) => {
		req.body 	= sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);		
		let firstName	=	(req.body.first_name)	?	req.body.first_name		:'';
		let lastName	=	(req.body.last_name)	?	req.body.last_name		:'';
		let email		=	(req.body.email)		?	req.body.email			:'';
		let phone		=	(req.body.phone_no)		?	req.body.phone_no			:'';
		let subject		=	(req.body.subject)		?	req.body.subject		:'';
		let message		=	(req.body.message)		?	req.body.message		:'';
		let enquiryType	=	(req.body.enquiry_type)	?	req.body.enquiry_type	:'';
		let fullName	=	firstName+ " " +lastName;
		
		let finalResponse	=	{};
		req.checkBody({
			/*"name": {
				notEmpty: true,
				errorMessage: res.__("front.contact.please_enter_name"),
			},*/
			"first_name": {
				notEmpty: true,
				errorMessage: res.__("front.contact.please_enter_first_name"),
			},
			"last_name": {
				notEmpty: true,
				errorMessage: res.__("front.contact.please_enter_last_name"),
			},
			"email": {
				notEmpty: true,
				errorMessage: res.__("front.contact.please_enter_email"),
				isEmail: {
					errorMessage: res.__("front.contact.please_enter_valid_email_address")
				},
			},
			"phone_no": {
				notEmpty: true,
				isNumeric:{
					errorMessage: res.__("front.system.invalid_number")
				},
				isLength:{
					options: MOBILE_NUMBER_LENGTH,
					errorMessage: res.__("front.system.invalid_phone_number_length")
				},
				errorMessage: res.__("front.contact.please_enter_phone_number"),
			},
			"subject": {
				notEmpty: true,
				errorMessage: res.__("front.contact.please_enter_subject"),
			},
			"message": {
				notEmpty: true,
				errorMessage: res.__("admin.contact.please_enter_details"),
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
					status	: STATUS_ERROR,
					errors	: errors,
					message	: "",
				}
			};
			return callback(finalResponse);
		}
		
		
		
		/**Insert in user table**/
		const contactCollection = db.collection(TABLE_CONTACT_US);
		contactCollection.insertOne({
			first_name		 	: 	firstName,
			last_name		 	: 	lastName,
			full_name		 	: 	fullName,
			email 				: 	email.toLowerCase(),
			phone		 		: 	phone,
			subject 			: 	subject,
			message 			:	message,
			enquiry_type		:	enquiryType,
			api_type	 		: 	req.body.api_type,
			modified 			: 	getUtcDate(),
			created		 		: 	getUtcDate(),			
		},(err,result)=>{
			if(!err){ 
				
				/** Send email **/
				let emailOptions	=	{
					to 			: res.locals.settings["Site.admin_email"],
					action 		: "contact_us",
					rep_array 	: [fullName, email, phone, subject, message]
				};
				sendMail(req,res,emailOptions);
				
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: [],
						message: res.__("front.contact.contact_has_been_send_successfully"),
					}
				};
				return callback(finalResponse);
			}else{
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: [],
						message: res.__("front.system.something_going_wrong_please_try_again")
					}
				};
				return callback(finalResponse);
			}
		});
	}
	
	
	/**
	 * Function to get security question
	 * */
	this.getSecurityQuestion = (req,res,next,callback)=>{
		let finalResponse = {};
		var masterListArr = [];
		var master = db.collection(TABLE_MASTERS);
		
		master.find({
			dropdown_type 	: "security_question",
			status			:  ACTIVE,
		},{
			projection: {
				_id: 1,
				name: 1
			}
		}).sort({ name :SORT_ASC }).toArray((err,result)=>{
			if (result.length > 0) {
				masterListArr.push({ "id": "", "text": "Select Question" });
				result.forEach(function (element) {
					masterListArr.push({ "id": element._id, "text": element.name });

				});
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: masterListArr,
						message: "All Security Question",
					}
				};
				return callback(finalResponse);
			}else{
				
				masterListArr.push({ "id": "", "text": "Select Question" });
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: masterListArr,
						message: res.__("front.global.no_record_found")
					}
				};
				return callback(finalResponse);
			}
		});
	}
	
	
	/**Function to get the gender **/
	this.getGender	=	(req,res,next,callback)=>{
		let finalResponse = {};
		var genderListArr = [];
		const result		=	GENDER_TYPE_DROP_DOWN;
		genderListArr.push({ "id": "", "text": "Select Gender*" });
		GENDER_TYPE_DROP_DOWN.map(searchStatus => {
			genderListArr.push({ "id": searchStatus.status_id, "text": searchStatus.status_name });
		});
		finalResponse = {
			'data': {
				status: STATUS_SUCCESS,
				result: genderListArr,
				message: "All Gender",
			}
		};
		return callback(finalResponse);
	}
	


	/**
	 * Function to get country list
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 ***/
		 this.getCountryList = (req,res,next,callback)=>{
			
			const country = db.collection(TABLE_COUNTRY);
			var countryCodeData = [];
			let finalResponse = {};
			country.find({
				
				status : ACTIVE,
			},{projection : { _id : 1,country_name : 1,country_iso_code:1,country_code:1} }).toArray((resultErr,resultSuccess)=>{
				countryCodeData.push({ "id": "", "text": "Select Country*" });
				async.forEachOf(resultSuccess,(records,index,eachCallback)=>{
					countryCodeData.push({ "id": records._id, "text": records.country_name,"country_code":records.country_iso_code,"country_dial_code": records.country_code});
					eachCallback(null)
				}, (parentErr) => {
					if (parentErr) {
						/** Send error response */
						finalResponse = {
							status			: STATUS_ERROR,
							result			: [],
							message			: res.__("system.something_going_wrong_please_try_again")
						};
						return returnApiResult(req,res,finalResponse);
					}
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							result: countryCodeData,
							message: res.__("Country Dial Code"),
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				})
				
			})
		}



	/**
	 * Function to get state list
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 ***/
	this.getStateList = (req,res,next,callback) =>{
		req.body 				= sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
		let countryId 			= (req.body.country_id) ? req.body.country_id : "";
		let finalResponse = {};
			 /**For check country id */
			 if (countryId == '') {
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						result: {},
						message: res.__("api.global.parameter_missing")
	
					}
				};
				return returnApiResult(req,res,finalResponse);
			}

			
		
		var states = db.collection(TABLE_STATES);
		
		states.find({
			country_id:ObjectId(countryId),
			status : ACTIVE,
			is_deleted : DEACTIVE,
		},{
			_id : 1,
			state_name : 1
		}).sort({"state_name":SORT_ASC}).toArray((stateErr,stateResult)=>{
			let stateList = [];
			stateList.push({"id":"","text":"Select State*"});
			stateResult.map((record)=>{
				stateList.push({"id":record._id,"text":record.state_name})
			})
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: stateList,
				}
			};
			return returnApiResult(req,res,finalResponse);
		})
		
	}



	/**
	 * Function to get city base on state list
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 ***/
	 this.getCityListBaseOnState = (req,res,next,callback) =>{
		let finalResponse = {};
		var cities = db.collection(TABLE_CITY);
		let stateId = (req.body.state_id) ? req.body.state_id : "";
		if(stateId == ""){
			finalResponse = {
				'data': {
					status: STATUS_ERROR_INVALID_ACCESS,
					result: {},
					message: res.__("api.global.parameter_missing")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		cities.find({
			state_id : ObjectId(stateId),
			status : ACTIVE,
			is_deleted : DEACTIVE,
		},{
			_id : 1,
			city_name : 1
		}).sort({"city_name":SORT_ASC}).toArray((cityErr,cityResult)=>{
			let cityList = [];
			cityList.push({"id":"","text":"Select City*"});
			cityResult.map((record)=>{
				cityList.push({"id":record._id,"text":record.city_name})
			})
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: cityList,
				}
			};
			return returnApiResult(req,res,finalResponse);
		})
		
	}





	
	/** 
	 * Function to get coutry dial code
	 * **/
	this.getCountryDialCode = (req,res,next,callback)=>{
		const countryCode = db.collection(TABLE_COUNTRY_CODE);
		var countryCodeData = [];
		let finalResponse = {};
		countryCode.find({
		},{projection : { dial_code: 1, dial_code: 1} }).toArray((resultErr,resultSuccess)=>{
			countryCodeData.push({ "id": "", "text": "Select Dial Code" });
			async.forEachOf(resultSuccess,(records,index,eachCallback)=>{
				countryCodeData.push({ "id": records.dial_code, "text": records.dial_code });
				eachCallback(null)
			}, (parentErr) => {
				if (parentErr) {
					/** Send error response */
					finalResponse = {
						status			: STATUS_ERROR,
						result			: [],
						message			: res.__("system.something_going_wrong_please_try_again")
					};
					return callback(finalResponse);
				}
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: countryCodeData,
						message: res.__("Country Dial Code"),
					}
				};
				return callback(finalResponse);
				
			})
			
		})
	}
	
	/**
	 * Function to get master list
	 * */
	this.getMasterValue = (req,res,next,callback)=>{
		let finalResponse = {};
		var masterListArr = [];
		let type_label	  =	'';	
		const master_type			=	(req.body.type) ? req.body.type : '';
		if(master_type == 'language'){
			type_label		=	'Language Known';
		}else if(master_type == 'department'){
			type_label		=	'Department';
		}
		else if(master_type == 'brand'){
			type_label		=	'Brand';
		}else if(master_type == "support"){
			type_label		=	'Support';
		}
		var master = db.collection(TABLE_MASTERS);
		master.find({
			dropdown_type 	:  master_type,
			status			:  ACTIVE,
		},{
			projection: {
				_id: 1,
				name: 1
			}
		}).sort({ name :SORT_ASC }).toArray((err,result)=>{
			if (result.length > 0) {
				masterListArr.push({ "id": "", "text": "Select "+type_label+"*" });
				result.forEach(function (element) {
					masterListArr.push({ "id": element._id, "text": element.name });
				});
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: masterListArr,
						message: "All"+ type_label,
					}
				};
				return returnApiResult(req,res,finalResponse);
			}else{
				masterListArr.push({ "id": "", "text": "Select "+type_label+"*" });
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: masterListArr,
						message: res.__("front.global.no_record_found")
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
		});
	}
	
	
	/**
	 * Function to get splash screens
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 ***/
	this.getSplashScreens = (req,res,next,callback) =>{
		let finalResponse = {};
		const splashscreens = db.collection(TABLE_SPLASH_SCREENS);
		
		splashscreens.find({
			status : ACTIVE,
			is_deleted : NOT_DELETED
		},{projection : { title: 1, description: 1,image:1} }).sort({"created":SORT_DESC}).toArray((err,result)=>{
			if(err){
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: {},
						message: res.__("front.global.no_record_found")
					}
				};
				return callback(finalResponse);
			}
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: result,
					image_path : SPLASH_SCREENS_IMG_URL,
					message: "All Images",
				}
			};
			return callback(finalResponse);
		})
		
	}	
	
	
	this.gteCategoryWithRoleAdd = (req,res,next,callback) =>{
		const asyncParallel 		= 	require("async/parallel");
		const categoryTable = db.collection(TABLE_CATEGORIES);
		const postTable = db.collection(TABLE_POSTS);
		
		const campaign            = db.collection(TABLE_CAMPAIGN);
		
		campaign.find({
			remaining_budget : {$gt : DEACTIVE},
			duration_start_date : { $lte : getUtcDate()},
			duration_end_date  : { $gte : getUtcDate()},
		},{}).toArray((err,result)=>{
			
			console.log("result");
			console.log(result);
		})
		
	}
	
	
	
	this.gteCategoryWithRole = (req,res,next,callback) =>{
		const asyncParallel 		= 	require("async/parallel");
		const categoryTable = db.collection(TABLE_CATEGORIES);
		const postCollection = db.collection(TABLE_POSTS);
		let postSlug = (req.body.post_slug) ? req.body.post_slug : "";
		let campaignSlug = (req.body.campaign_slug) ? req.body.campaign_slug : "";
		asyncParallel({
			category_data:(callback)=>{
				categoryTable.aggregate([
					{$match : {
						status : ACTIVE,
						is_deleted : DEACTIVE,
					}},
					{
						$lookup: {
							"from": "admin_roles",
							"localField": "_id",
							"foreignField": "category_ids",
							"as": "role_detail",
						}
					},
					
					{$project : {
							_id : 1,
							name : 1,
							user_type: "$role_detail.role_name",
						
						}
					}
				]).toArray((err,result)=>{
					callback(null,result);
				})
			},
			post_data:(callback)=>{
				postCollection.findOne({
					slug : postSlug
				},{},(err,result)=>{
					callback(null,result);
				})
			},
			campaign_data:(callback)=>{
				const campaign            = db.collection(TABLE_CAMPAIGN);
				campaign.findOne({
					slug : campaignSlug
				},{},(err,result)=>{
					callback(null,result);
				})
			}
		},(err,response)=>{
			var category_data	= (response['category_data']) ? response['category_data'] : "";
			let  post_data = {};
			if(postSlug != "")
			{
				 post_data	= 	(response['post_data']) ? response['post_data'] : "";
			}else if(campaignSlug != "")
			{
				 post_data	= 	(response['campaign_data']) ? response['campaign_data'] : "";
			}
			let postAdults = (post_data.adult) ? post_data.adult : [];
			let postKids = (post_data.kid) ? post_data.kid : [];
			let postTeens = (post_data.teen) ? post_data.teen : [];
			
			let finalResult = [];
			async.eachSeries(category_data, function iteratee(record, loopCallback) {
				let userType = (record.user_type) ? record.user_type : [];
				let categoryId = (record._id) ? record._id : "";
				let categoryname = (record.name) ? record.name : "";
				
				var checkInAdults = postAdults.some(function (friend) {
					return friend.equals(categoryId);
				});
				
				var checkInKids = postKids.some(function (friend) {
					return friend.equals(categoryId);
				});
				
				var checkInTeens = postTeens.some(function (friend) {
					return friend.equals(categoryId);
				});
			
				finalResult.push({"_id":categoryId,"name":categoryname,"user_type":userType,"in_adults":checkInAdults,"in_kids":checkInKids,"in_teens":checkInTeens});
				
				loopCallback(null)
			}, function done() {
				
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						
						result: finalResult,
						
						
					}
				};
				return returnApiResult(req,res,finalResponse);
				
				//res.end(res.__("Processing.........."));
			});

		})
	
	}
	
	/**
	 * Function to get workable city list
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 ***/
	this.getWorkAbleCity = (req,res,next,callback) =>{
		let finalResponse = {};
		var masterListArr = [];
		var city = db.collection(TABLE_CITY);
		
		city.find({
			status : ACTIVE,
			is_deleted : DEACTIVE,
			is_workable : ACTIVE
		},{
			_id : 1,
			city_name : 1
		}).sort({"city_name":SORT_ASC}).toArray((cityErr,cityResult)=>{
			let cityList = [];
			cityList.push({"id":"","text":"Select City*"});
			cityResult.map((record)=>{
				cityList.push({"id":record._id,"text":record.city_name+"*"})
			})
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: cityList,
					message: "workable city",
				}
			};
			return callback(finalResponse);
		})
		
	}
	
	
	
	
	
	this.chekTimeRange = (req,res,next,callback) =>{
		let finalResponse = {};
		
		let startDate = getUtcDate();
		
		let currentTimestamp = (startDate) ? Math.round(Date.parse(startDate) / 1000) : Math.round(new Date().getTime() / 1000);
	
		let dayStartTime		=	Math.round(Date.parse(startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate() + " " + "00:00:00") / 1000);
		
	
		console.log("dayStartTime "+dayStartTime);
		console.log("currentTimestamp "+currentTimestamp);
	

		var timeStamp = currentTimestamp - dayStartTime;
		const groups = db.collection(TABLE_GROUPS);
	
		
		var currentDate =	getUtcDate();
		var dayNumber	=	currentDate.getDay();
		var dayName		=	DAYS_NAME_ARRAY[dayNumber];	
		
		
		console.log(currentDate.getDay());
		console.log(dayName);
				
		groups.find({
			"_id"	:	ObjectId("5e54dab98f0e7c4e1657dfc4"),
			'days'	:	{ $in:[dayName] },
			"time_range.start_timestamp" : { $lte: timeStamp },
			"time_range.end_timestamp" : { $gte: timeStamp },
		},{}).toArray((err,result)=>{
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: result,
					timeStamp: timeStamp,
					
				}
			};
			return callback(finalResponse);
			
		})
		
	}
	
	
	
	
	this.findPoints = (req,res,next,callback) =>{
		const collection	=	db.collection(TABLE_CITY);
		collection.find({polygons:
		{$geoIntersects:
			{$geometry:{ "type" : "Point",
				"coordinates" : [ 12.8505, 7.7064  ] }
			}
		}
		},{}).toArray((err,result)=>{
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: result,
					
					
				}
			};
			return callback(finalResponse);
		});
	}
	
	
	
	
	/**
	* function for Get active promo code
	*
	* param null
	* */
	this.getPromoCode 	= (req, res, next, callback) => {
		let loginUserData 			=	(req.user_data) 		?	req.user_data 			:	"";
		let userId					=	(loginUserData._id)		?	loginUserData._id		:	"";	
		const promoCode	= db.collection(TABLE_PROMO_CODES);
		promoCode.find( {
		  "$or": [
				{
					code_valid_from:{$lte:getUtcDate() },
					code_valid_to	:{$gte:getUtcDate() },
				
				}, {
					"selected_user_ids" : { $in: [ObjectId(userId)] },
					"status"			:	ACTIVE,
				}
			]
		},
		{
			projection: { 
				_id: 1, promo_code:1, code_description: 1,code_valid_from:1,code_valid_to:1,coupons_count:1,coupons_used:1,created:1,discount_type:1,discount_value:1
			}
		}).sort({"created": SORT_DESC}).toArray((err, result) => {
			let finalResponse = {};
			if (err) {
				finalResponse = {
					'data': {
						status				:	STATUS_ERROR,
						result				:	[],
						message				: 	res.__("front.system.something_going_wrong_please_try_again")
					}
				};
				return callback(finalResponse);
			} else {
				finalResponse = {
					'data': {
						status				:	STATUS_SUCCESS,
						result				:	(result) ? result : [],
						message				:	''
					}
				};
				return callback(finalResponse);
			}
		});
	};
	

	this.sendUserPn = 	(req, res, next, callback)=>{
		let finalResponse	=	{};
		let userId = "60c8616af18b3d0b0aae9775";
		/** Set conditions **/
			let conditions	=	{
				
				is_deleted		:	NOT_DELETED,
				_id				:  ObjectId(userId)
			};

			/** Set options data for get user details **/
			let userOptions = {
				conditions	:	conditions,
				fields		:	{pn_allowed :1,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,modified:0}
			};

			/** Get user details **/
		getUserDetail(req, res, userOptions).then(userResponse => {
			var pnAllowedByUser = (userResponse.result.pn_allowed) 	? userResponse.result.pn_allowed	:[]; 
			pnAllowedByUser.push("new_post");
				console.log(typeof(pnAllowedByUser));
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: userResponse,
					message: res.__("Pn Status")
				}
			};
			return returnApiResult(req, res,finalResponse);
		})
		return false;

		//let  userId 		= (req.body.user_id) ? req.body.user_id : MONGO_ID;
		let  pnBody 		= "Check Test PN"//(req.body.pn_body) ? req.body.pn_body : "Driver near by check";
		let  pnImage 			= (req.body.image) ? req.body.image : "https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
		var options = {
			user_id : userId,
			pn_body : pnBody,
			pn_type : "test",
			image : pnImage,
		}
		/*let pnBodyNew 	= 	{
			user_id		:	userId,
			pnBody		:	res.__("Hello Check PN"),
			data		:	{},
		};
		
		pushNotification(req,res,pnBodyNew);*/
		
		/*pushNotification(req,res,options).then(pnResponse=>{
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: pnResponse,
					message: res.__("Pn Status")
				}
			};
			return returnApiResult(req, res,finalResponse);
			
		});*/
		
	}
	
	/**
	* function for get user faq
	*
	* param null
	* */
	this.getFaq = (req, res, next, callback)=>{
		
		let loginUserData 			=	(req.user_data) 		?	req.user_data 			:	"";
		let userId					=	(loginUserData._id)		?	loginUserData._id		:	"";	
		
		let userType 				= (loginUserData.user_type) ? loginUserData.user_type : "";
		
		let finalResponse	=	{};
		if(!userId || !userType){
			/** Send error response **/

			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: [],
					message: res.__("api.global.parameter_missing")
				}
			};
			return returnApiResult(req, res,finalResponse);

			
			
		}
		const faq	=	db.collection(TABLE_FAQS);
		
		faq.find({
			user_type : userType,
			is_active : ACTIVE
		},
		{projection :{question:1,answer:1,user_type:1,created:1}}).sort({"created":SORT_DESC}).toArray((err,result)=>{
			if(err){
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: {},
						message: res.__("system.something_going_wrong_please_try_again")
					}
				};
				return returnApiResult(req, res,finalResponse);
			}
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: result,
					
				}
			};
			return returnApiResult(req, res,finalResponse);
			
			
			
		})
		
	}
	
	this.encryptCryptoReq = (req, res, next, callback)=>{
	
		console.log("req.body");

		let options = '{"device_type":"android","api_type":"mobile","device_id":"","device_token":"","method_name":"user_login","data":{"role_type":"teens","email":"test@mailinator.com","password":"Password"}}';
		let showData = encryptCryptoMobile(options);
	}
	
	this.decryptCryptoReq = (req, res, next, callback)=>{
	console.log("here");
		let options = "5a378339f6298357db3d9ed7b235afee57c44f3533be643202f6f99fa607be42d020aabf5c31d06faefe5f944c4ccca655dd2da1ecc2cce5fcb8a297b94008c3beed27b5a199bb752c31f9997f5aca6e1e45d4f36a5e1b2d9578ec15a0f42bf0a5187d58548488dd9a56709b801839cb65bc5861ae190296aa51dc26aac644dd90502574eac8c9df7b471f41edccb918f8e92d26b1ceb17e4d92bf34261db707886529292e3491f26c370c4582fc365554018066185aea3d3e6250ba2af6abceb63db797178a8795d10e4f79275f618d57eacb1dda7018a922fcea37bb7ce7dd2e3f9723746925132015cdfaef2d709a";
		let getData = decryptCryptoMobile(options);
		
	}
		
	this.paypalOne = (req,res,next,callback)=>{
		
		let finalResponse = {};
		
		var Paypal = require('paypal-adaptive');

		var paypalSdk = new Paypal({
			userId:    'kapil._1330611871_biz_1361188399_biz_api1.fullestop.com',
			password:  '1361188420',
			signature: 'AFcWxV21C7fd0v3bYYYRCpSSRl31ALsHzde8TXcGoxEptvn2cYd9jtDe',
			sandbox:   true //defaults to false
		});
		

		/*var params = {
			payKey: 'AP-8MF99323N3985513X'
		};
		// Or the transactionId
		/*var params = {
			transactionId: 'AP-1234567890'
		};
		// Or the trackingId
		var params = {
			trackingId: 'AP-1234567890'
		};
		 
		paypalSdk.paymentDetails(params, function (err, response) {
			if (err) {
				consoleLog(err);
			} else {
				// payments details for this payKey, transactionId or trackingId
				consoleLog("No Error");
				consoleLog(response);
			}
		});*/
		
		var payload = {
			requestEnvelope: {
				errorLanguage:  'en_US'
			},
			actionType:     'PAY',
			currencyCode:   'USD',
			feesPayer:      'PRIMARYRECEIVER',
			memo:           'Chained payment example',
			cancelUrl:      'http://test.com/cancel',
			returnUrl:      'http://test.com/success',
			receiverList: {
				receiver: [
					{
						email:  'vijay.soni@fullestop.com',
						amount: '100.00',
						primary:'true'
					},
					{
						email:  'kapil.jain-buyer@fullestop.com',
						amount: '10.00',
						primary:'false'
					}
				]
			}
		};

		paypalSdk.pay(payload, function (err, response) {
			if (err) {
				consoleLog(err);
			} else {
				// Response will have the original Paypal API response
				console.log(response);
				
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						response: response,
						
					}
				};
				return returnApiResult(req, res,finalResponse);
				
				// But also a paymentApprovalUrl, so you can redirect the sender to checkout easily
				//console.log('Redirect to %s', response.paymentApprovalUrl);
				console.log('Redirect to %s', response.paymentApprovalUrl);
			}
		});
		
		
		
	}
		
	
	
	
	
	this.bulkInsert = 	(req, res, next, callback)=>{
		consoleLog("Start");
		consoleLog(getDateMoment().format('LTS'));
		let insertToBeData = [
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			
				{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			
			
				{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			
			
				{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			
			
				{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			
			
				{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			
			
				{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			
			
				{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			
				{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
			{ item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100,item: "abc123", defaultQty: 100, status: "A", points: 100 },
		
		];
	
		const bulk_insert	=	db.collection("bulk_insert").initializeUnorderedBulkOp();  
		//consoleLog(bulk_insert);
		//return false;
		//const newBulk 		=	bulk_insert.initializeUnorderedBulkOp();
		if(insertToBeData.length > 0){
			
			
			/*bulk_insert.insertMany(insertToBeData,(err,result)=>{
				consoleLog("insert");
				consoleLog(getDateMoment().format('LTS'));
			})
			/*insertToBeData.forEach((record,index)=>{
				
				bulk_insert.insert(record,(err,result)=>{
					consoleLog("insert");
				});
				
			});*/
			
			
			async.forEachOf(insertToBeData, (record, index, callback) => {
				//consoleLog(record);
				
				bulk_insert.insert(record,(err,result)=>{
					consoleLog("insert");
					callback(null);
				});
				//
				
			}, err => {
				consoleLog("Done");
				consoleLog(getDateMoment().format('LTS'));
				res.end(res.__("Processing.........."));
			});
			
			
			
			/*async.eachSeries(insertToBeData, function iteratee(item, callback) { 
				
				bulk_insert.insert(item,(err,result)=>{
					consoleLog("insert");
					callback(null);
				});
				
			}, function done() {
				consoleLog("Done");
				consoleLog(getDateMoment().format('LTS'));
				res.end(res.__("Processing.........."));
			});*/

			
		}
		
		
		
				
		
	}
	
}
module.exports = new Default();
