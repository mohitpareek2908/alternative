var async = require('async');
var crypto = require('crypto');
var ObjectId = require('mongodb').ObjectID;
global.atob = require("atob");
global.btoa = require("btoa");

/*** All API required file*/
var defaultApi				= require(__dirname + '/default');
var registration 			= require(__dirname + '/registration');
var home 					= require(__dirname + '/home');
var notification			= require(__dirname + '/notification');
var saveInterest			= require(__dirname + '/user');
var posts					= require(__dirname + '/posts');

function MobileApi() {

	/**
	* Function for API data in index value
	**/
	this.index = (async (req, res, next) => {
		var ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress
		


		if (ip.substr(0, 7) == "::ffff:") {
			ip = ip.substr(7)
		}

		var inputData		= (req.body.req) 				? req.body.req 				: "";
		var debugJsonView 	= (req.body.debug_json_view) 	? req.body.debug_json_view 	: 0;
		var decodedData 	= false;
		/** Blank validation **/
		if (inputData != '') {
			
			var decodedData = atob(inputData);
			if (debugJsonView && inputData.indexOf("{") === 0) {
				decodedData = inputData;
			}
			var APIData = JSON.parse(decodedData);
			var methodName 	= (APIData.method_name) ? APIData.method_name 	: '';
			var apiType 	= (APIData.api_type) 	? APIData.api_type 		: '';
			
			var device_type			=	(APIData.device_type) 	? APIData.device_type : "";
			var device_id			=	(APIData.device_id) 	? APIData.device_id : "";
			var device_token		=	(APIData.device_token) 	? APIData.device_token : "";
			
			req.body 		= (APIData.data) 		? APIData.data 			: {};

			/** User slug accourding fetch  data**/
			
			//let apiType = (req.body.api_type) 	? req.body.api_type : ADMIN_API_TYPE;
			let slug 	= (req.body.slug) 		? req.body.slug 	: "";
			if (slug != '') {
				let conditionOptions = {
					conditions	:	{ slug: slug},
				}
				let userDetailResponse = await getUserDetailBySlug(req, res, conditionOptions);
				if (userDetailResponse.status == STATUS_SUCCESS) {
					req.user_data = (userDetailResponse.result) ? userDetailResponse.result : {};
				}
			}
			
			
			/** By common key use by default send*/
			req.body['request_from'] 		=	REQUEST_FROM_API;
			req.body['is_mobile_verified'] 	=	NOT_VERIFIED;
			req.body['is_email_verified'] 	=	NOT_VERIFIED;
			req.body['api_type'] 			=	apiType;
			req.body['device_type'] 		=	device_type;
			req.body['device_id'] 			=	device_id;
			req.body['device_token'] 		=	device_token;
			req.body['method_name'] 		=	methodName;
			
			
			/** Multiple file generate according API**/
			var functionToCall = "";
			switch (methodName) {
				/** REGISTRATION METHOD*/
				case 'login':
				case 'userRegistration':
				case 'resendOtp':
				case 'editProfile':
				case 'verifyOTP':
				case 'checkEmailMobilegetSecurityQuestion':
				case 'forgotPassword':
				case 'resetPassword':
				case 'changePassword':
				case 'updateUserEmailAndMobileNo':
				case 'getUserDetail':
				case 'editUserProfileImage':
				case 'checkEmployeeRequest':
				case 'resentRequestOtp':
				case 'regenerateJWT':
			
					functionToCall = "registration." + methodName;
					break;
				/** REGISTRATION METHOD*/
				
				/** HOME METHOD*/
				case 'getHomePageDetails':
				case 'getFooterDetails':
					functionToCall = "home." + methodName;
					break;
				
				/** NOTIFICATION METHOD*/
				case 'getNotifications':
				case 'deleteNotifications':
				case 'userOnOffNotifications':
				functionToCall = "notification." + methodName;
				break;
				/** Interest METHOD*/
				case 'saveInterestCategories':
				functionToCall = "saveInterest." + methodName;
				break;

				/** Interest METHOD*/
				case 'saveAndRemoveSavedPost':
				case 'saveAndRemoveLikePost':
				case 'unsaveAllPost':
				functionToCall = "posts." + methodName;
				break;
				
				/** default method*/
					default: functionToCall = "defaultApi." + methodName;
			}
			


			/*** Function call to model file*/
			try {
				eval(functionToCall)(req, res, next, function (response) {
					//var myJSON	=	JSON.stringify(response.data);
					//console.log(response);
					//return false;
					var result = JSON.stringify(response);
					
					var utf8 = require('utf8');
					var myJSON = utf8.encode(result);				
					
					if (debugJsonView == 0) {
						
						if(apiType == WEP_API_TYPE){
							res.send({
								response : btoa(myJSON)
							});
						}else{
							res.send(
								btoa(myJSON)
							);
						}
					} else {
					
						res.send(
							response
						);
						
					}
					
				});
			} catch (e) {
				console.log(e);
				res.send({
					result: { message: res.__("admin.system.functionally_error") }
				});
			}
		} else {
			res.send({
				message: res.__("admin.system.invalid_access"),
				status: STATUS_ERROR,
			});
		}
	});
}

module.exports = new MobileApi();
