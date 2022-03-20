var modelPath   		=	__dirname+"/model/api";
var modulePath 			= 	"/api/";
var middlewarePath 		= 	__dirname + "/middleware/middleware";
global.atob = require("atob");
global.btoa = require("btoa");
/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});
const { validate,authenticateAccess } = require(WEBSITE_VALIDATION_FOLDER_PATH+'deafult_api_validator.js');
const { loginValidationRules,resetPasswordValidationRules,forgetPasswordValidationRules,addUserValidationRules,editUserValidationRules,updateEmailAddressValidationRules,changePasswordValidationRules,verifyOtpValidationRules} = require(WEBSITE_VALIDATION_FOLDER_PATH+'user_api_validator.js');
const { addPostValidationRules,editPostValidationRules,postReportValidationRules } = require(WEBSITE_VALIDATION_FOLDER_PATH+'post_api_validator.js');
const { addCampaignValidationRules,editCampaignValidationRules,campaignReportValidationRules } = require(WEBSITE_VALIDATION_FOLDER_PATH+'campaign_api_validator.js');


/***************************************** Start Routing API *****************************************/

/** Routing is used to get cms page detail **/
app.all(modulePath + "getCmsDetails",makeRequest, function (req, res, next) {
	
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.getCmsDetails(req, res, next);
});

app.all(modulePath + "get-faq",makeRequest, function (req, res, next) {
	
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.getFaq(req, res, next);
});


/** Routing is used to get country list **/
app.all(modulePath + "get-country",makeRequest,function (req, res, next) {
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.getCountryList(req, res, next);
});

/** Routing is used to state list **/
app.all(modulePath + "get-states",makeRequest,function (req, res, next) {
var defaultApi = require(__dirname + "/model/default");
defaultApi.getStateList(req, res, next);
});	

/** Routing is used to city list **/
app.all(modulePath + "get-cities",makeRequest,function (req, res, next) {
var defaultApi = require(__dirname + "/model/default");
defaultApi.getCityListBaseOnState(req, res, next);
});


app.all(modulePath + "paypalOne",makeRequest,function (req, res, next) {
var defaultApi = require(__dirname + "/model/default");
defaultApi.paypalOne(req, res, next);
});




/** Routing is used to login **/
app.all(modulePath + "login",makeRequest,loginValidationRules(),validate,function (req, res, next) {
	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.login(req, res, next);
});


/** Routing is used to login **/
app.all(modulePath + "social-login",makeRequest,function (req, res, next) {
	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.socialUserLogin(req, res, next);
});



/** Routing is used to logout **/
app.all(modulePath + "logout",makeRequest,function (req, res, next) {
	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.logOut(req, res, next);
});


/** Routing is used for forgot password form **/
app.all(modulePath+"forgot-password",makeRequest,forgetPasswordValidationRules(), validate,(req, res)=>{
	
	var registrationApi = require(__dirname + "/model/registration");
    registrationApi.forgotPassword(req, res);
});


/** Routing is used for Resend OTP form **/
app.all(modulePath+"resend-otp",makeRequest,function (req, res,next){
	var registrationApi = require(__dirname + "/model/registration");
    registrationApi.resendOtp(req, res,next);
});


/** Routing is used to resend OTP **/
app.all(modulePath + "reset-password",makeRequest,resetPasswordValidationRules(),validate,function (req, res, next) {
	
	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.resetPassword(req, res, next);
});



/** Routing is used to verify account **/
app.all(modulePath + "verifyOtp",makeRequest, verifyOtpValidationRules(),validate,function (req, res, next) {
	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.verifyOTP(req, res, next);
});


/** Routing is used for Resend OTP form **/
app.all(modulePath+"otp-for-paternal-control",makeRequest,function (req, res,next){
	var userApi = require(__dirname + "/model/user");
    userApi.otpForPaternalControl(req, res,next);
});



/** Routing is used to sign up **/
app.all(modulePath + "user_registration",makeRequest,addUserValidationRules(), validate,function (req, res, next) {
	
	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.userRegistration(req, res, next);
});

/** Routing is used to get user interest **/
app.all(modulePath + "user_category",makeRequest,function (req, res, next) {
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.getUserCategory(req, res, next);
});

/** Routing is used to get user interest role wise **/
app.all(modulePath + "user_role_interest",makeRequest,function (req, res, next) {
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.getUserInterestRoleWise(req, res, next);
});

/** Routing is used to get user interest role wise **/
app.all(modulePath + "get_master_data",makeRequest,function (req, res, next) {
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.getMasterValue(req, res, next);
});



/** Routing is used to save user interest **/
app.all(modulePath + "save_user_category",makeRequest,function (req, res, next) {
	var userApi = require(__dirname + "/model/user");
	userApi.saveInterestCategories(req, res, next);
});



/** Routing is used to edit user details**/
app.all(modulePath + "edit_user",makeRequest,editUserValidationRules(), validate,function (req, res, next) {

	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.editUser1(req, res, next);
});


/** Routing is used to update email address **/
app.all(modulePath + "update_email_address",makeRequest,updateEmailAddressValidationRules(), validate,function (req, res, next) {
	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.updateUserEmailAddress(req, res, next);
});

/** Routing is used to stop push notification **/
app.all(modulePath + "stop_pn",makeRequest,function (req, res, next) {
	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.stopPn(req, res, next);
});

/** Routing is used to stop all push notification **/
app.all(modulePath + "stop_all_pn",makeRequest,function (req, res, next) {
	var registrationApi = require(__dirname + "/model/registration");
	registrationApi.stopAllPn(req, res, next);
});

/** Routing is used change User password **/
app.all(modulePath + "change_password",makeRequest, changePasswordValidationRules(),validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/user");
	postApi.changeUserPassword(req, res, next);
});



/** Routing is used follow User **/
app.all(modulePath + "follow_user",makeRequest, validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/user");
	postApi.followUser(req, res, next);
});



/** Routing is uswed to delete user account**/
app.all(modulePath + "delete_user",makeRequest, validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/user");
	postApi.deleteUser(req, res, next);
});




/** Routing is used to view other user profile **/
app.all(modulePath + "viewUser",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/user");
	postApi.viewUser(req, res, next);   
});


/** Routing is used to view user profile **/
app.all(modulePath + "view_my_profile",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/user");
	postApi.getMyProfileDetail(req, res, next);   
});
/** Routing is used to get profile image list **/
app.all(modulePath + "getMyProfileImageList",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/user");
	postApi.getMyProfileImageList(req, res, next);   
});
/** Routing is use to get profile video list **/
app.all(modulePath + "getMyProfileVideoList",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/user");
	postApi.getMyProfileVideoList(req, res, next);   
});


/** Routing is used to regenerate JWT **/
app.all(modulePath + "regenerate_jwt", function (req, res, next) {
	    /** Set current view folder **/
    req.rendering.views	=	__dirname + "/views";

    /** Set layout  **/
	req.rendering.layout    = WEBSITE_ADMIN_LAYOUT_PATH+"before_login";
	var users = require(__dirname + "/model/registration");
	users.regenerateJWT(req, res, next);
});

/****************************************************************************===== POST URL =====********************************************************************************/

/** Routing is used to Add Post (Video/Image) **/
app.all(modulePath + "add_post",makeRequest,addPostValidationRules(), validate,function (req, res, next) {
	
	var postApi = require(__dirname + "/model/posts");
	postApi.addPost(req, res, next);
});


/** Routing is used to edit Post (Video / Image) **/
app.all(modulePath + "edit_post",makeRequest,editPostValidationRules(), validate,function (req, res, next) {
	
	var postApi = require(__dirname + "/model/posts");
	postApi.editPost(req, res, next);
});

/** Routing is used to sign up **/
app.all(modulePath + "reportPost",makeRequest, postReportValidationRules(),validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.reportPost(req, res, next);
});

/** Routing is used to sign up **/
app.all(modulePath + "likePost",makeRequest, validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.likePost(req, res, next);
});
/** Routing is use to get post like user list **/
app.all(modulePath + "post_like_user_list",makeRequest, validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.getPostLikeUsers(req, res, next);
});



/** Routing is used to save post for later view **/
app.all(modulePath + "savePost",makeRequest, validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.savePost(req, res, next);
});
/** Routing is used to delete all saved post **/
app.all(modulePath + "deleteAllSavedPost",makeRequest, validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.deleteAllSavedPost(req, res, next);
});


/** Routing is used to save post for later view **/
app.all(modulePath + "commentSubmitOnPost",makeRequest, validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.commentSubmitOnPost(req, res, next);
});

/** Routing is used to save post for later view **/
app.all(modulePath + "getPostCommentList",makeRequest, validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.getPostCommentList(req, res, next);
});


/** Routing is used to sign up **/
app.all(modulePath + "likePostComment",makeRequest, validate,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.likePostComment(req, res, next);
});

/** Routing is used to view post **/
app.all(modulePath + "viewPost",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.viewPost(req, res, next);
});

/** Routing is used to delete post**/
app.all(modulePath + "deletePost",makeRequest,function (req, res, next) {
	
	var postApi = require(__dirname + "/model/posts");
	postApi.deletePost(req, res, next);
});

/** Routing is used to view post history**/
app.all(modulePath + "viewPostHistory",makeRequest,function (req, res, next) {
	
	var postApi = require(__dirname + "/model/posts");
	postApi.getPostHistoryList(req, res, next);
});


/** Routing is used to delete post history**/
app.all(modulePath + "deleteHistory",makeRequest,function (req, res, next) {
	
	var postApi = require(__dirname + "/model/posts");
	postApi.deletePostHistory(req, res, next);
});


/** Routing is used to get post list **/
app.all(modulePath + "post_list",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.getPostList(req, res, next);
});

/** Routing is used to get  saved post list **/
app.all(modulePath + "getSavedPostList",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.getSavedPostList(req, res, next);
});


/** Routing is used to get post list **/
app.all(modulePath + "trending_post_list",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/posts");
	postApi.getTrendingPostList(req, res, next);
});


/****************************************************************************===== POST URL =====********************************************************************************/


/** Routing is used to get cms page detail **/
app.all(modulePath + "decryptCryptoReq",makeRequest, function (req, res, next) {
	
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.decryptCryptoReq(req, res, next);
});
/** Routing is used to get cms page detail **/
app.all(modulePath + "encryptCryptoReq",makeRequest, function (req, res, next) {
	
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.encryptCryptoReq(req, res, next);
});


/** Routing is used to get cms page detail **/
app.all(modulePath + "bulkInsert",makeRequest, function (req, res, next) {
	
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.bulkInsert(req, res, next);
});


/** Routing is used to get tag on search screen **/
app.all(modulePath + "getAllTags",makeRequest,function (req, res, next) {
	var searchApi = require(__dirname + "/model/search");
	searchApi.getAllTags(req, res, next);
});
/** Routing is used to get all users on search screen **/
app.all(modulePath + "getSiteUser",makeRequest,function (req, res, next) {
	var searchApi = require(__dirname + "/model/search");
	searchApi.getSiteUser(req, res, next);
});


/****************************************************************************===== User Follow URL =====********************************************************************************/
/** Routing is used follow User **/
app.all(modulePath + "followUnfollowUser",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.followUnfollowUser(req, res, next);
});
/** Routing is used follower request list **/
app.all(modulePath + "followRequestList",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.followRequestList(req, res, next);
});
/** Routing is used accept Reject Follow Request **/
app.all(modulePath + "acceptRejectFollowRequest",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.acceptRejectFollowRequest(req, res, next);
});


/** Routing is used for remove follower list**/
app.all(modulePath + "removeFollowers",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.removeFollowers(req, res, next);
});


/** Routing is used to get followers list **/
app.all(modulePath + "followersList",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.followersList(req, res, next);
});

/** Routing is used to get followers list **/
app.all(modulePath + "followingUserList",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.followingUserList(req, res, next);
});

/** Routing is used to share post with follwers **/
app.all(modulePath + "sharePostWithFollowers",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.sharePostWithFollowers(req, res, next);
});

/** Routing is used to share post with follwers **/
app.all(modulePath + "addAndRemoveCloseFriend",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.addAndRemoveCloseFriend(req, res, next);
});
/** Routing is used to share post with follwers **/
app.all(modulePath + "subscribeUnsubscribeUser",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.subscribeUnsubscribeUser(req, res, next);
});
/** Routing is used to get close friend list**/
app.all(modulePath + "closeFriendList",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.closeFriendList(req, res, next);
});
/** Routing is used to get following back user**/
app.all(modulePath + "followingBackUser",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.followingBackUser(req, res, next);
});
/** Routing is used to get following back user**/
app.all(modulePath + "notFollowingBackUser",makeRequest, validate,function (req, res, next) {
	var userFollow = require(__dirname + "/model/follower_following");
	userFollow.notFollowingBackUser(req, res, next);
});


/****************************************************************************===== Notification =====********************************************************************************/

/** Routing is used to get user notificatioin list **/
app.all(modulePath + "getNotifications",makeRequest, validate,function (req, res, next) {
	var notificatioin = require(__dirname + "/model/notification");
	notificatioin.getNotifications(req, res, next);
});

/** Routing is used to delete notifiaction **/
app.all(modulePath + "deleteNotification",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/notification");
	postApi.deleteNotifications(req, res, next);
});


/** Routing is used to get list of  notifiaction **/
app.all(modulePath + "getNotifications",makeRequest,function (req, res, next) {
	var postApi = require(__dirname + "/model/notification");
	postApi.getNotifications(req, res, next);
});


/****************************************************************************===== Notification =====********************************************************************************/



/****************************************************************************===== Campaign Routes =====********************************************************************************/
/** Routing is used to add a Campaign **/
app.all(modulePath + "addCampaign",makeRequest,validate,function (req, res, next) {
	var campaign = require(__dirname + "/model/campaign.js");
	campaign.addCampaign(req, res, next);
});

app.all(modulePath + "addPostCampaign",makeRequest, validate,function (req, res, next) {
	var campaign = require(__dirname + "/model/campaign.js");
	campaign.addPostAsCampaign(req, res, next);
});

app.all(modulePath + "campaignList",makeRequest, validate,function (req, res, next) {
	var campaign = require(__dirname + "/model/campaign.js");
	campaign.campaignList(req, res, next);
});

app.all(modulePath + "editCampaign",makeRequest, editCampaignValidationRules(), validate,function (req, res, next) {
	var campaign = require(__dirname + "/model/campaign.js");
	campaign.editCampaign(req, res, next);
});

app.all(modulePath + "campaignReport",makeRequest, validate,function (req, res, next) {
	var campaign = require(__dirname + "/model/campaign.js");
	campaign.campaignReport(req, res, next);
});
app.all(modulePath + "clickOnCampaign",makeRequest, validate,function (req, res, next) {
	var campaign = require(__dirname + "/model/campaign.js");
	campaign.clickOnCampaign(req, res, next);
});
/****************************************************************************===== End Campaign Routes =====********************************************************************************/



/****************************************************************************===== Message Routes =====********************************************************************************/
/** Routing is used to save message **/
app.all(modulePath + "saveMessage",makeRequest,function (req, res, next) {
	var message = require(__dirname + "/model/message");
	message.saveMessage(req, res, next);
});
/** Routing is used to save file message **/
app.all(modulePath + "saveFileMessage",makeRequest,function (req, res, next) {
	var message = require(__dirname + "/model/message");
	message.saveFileMessage(req, res, next);
});


/** Routing is used to get message **/
app.all(modulePath + "getMessages",makeRequest,function (req, res, next) {
	var message = require(__dirname + "/model/message");
	message.getMessages(req, res, next);
});
/** Routing is used to get message user list **/
app.all(modulePath + "getMessageUserList",makeRequest,function (req, res, next) {
	var message = require(__dirname + "/model/message");
	message.getMessageUserList(req, res, next);
});


/****************************************************************************===== End Message Routes =====********************************************************************************/


/****************************************************************************===== Wallet Routes =====********************************************************************************/

/** Routing is used to add money **/
app.all(modulePath + "addMoneyToWallet",makeRequest,function (req, res, next) {
	var wallets = require(__dirname + "/model/wallets");
	wallets.addMoneyToWallet(req, res, next);
});

/** Routing is used to send tip money wallet to wallet **/
app.all(modulePath + "sendPostTipMoneyToWallet",makeRequest,function (req, res, next) {
	var wallets = require(__dirname + "/model/wallets");
	wallets.sendPostTipMoneyToWallet(req, res, next);
});
/** Routing is used to add money **/
app.all(modulePath + "getWalletTranaction",makeRequest,function (req, res, next) {
	var wallets = require(__dirname + "/model/wallets");
	wallets.getWalletTranaction(req, res, next);
});
/****************************************************************************===== End Wallet Routes =====********************************************************************************/

app.all(modulePath + "sendUserPn",makeRequest, function (req, res, next) {
	
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.sendUserPn(req, res, next);
});


app.all(modulePath + "gteCategoryWithRole",makeRequest, function (req, res, next) {
	
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.gteCategoryWithRole(req, res, next);
});
app.all(modulePath + "gteCategoryWithRoleAdd",makeRequest, function (req, res, next) {
	
	var defaultApi = require(__dirname + "/model/default");
	defaultApi.gteCategoryWithRoleAdd(req, res, next);
});




/**
 *  Function to make request for api
 * */
function makeRequest(req, res, next) {
	console.log("hello");
	var ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress
	


	if (ip.substr(0, 7) == "::ffff:") {
		ip = ip.substr(7)
	}
	
	var inputData		= (req.body.req) 				? req.body.req 				: "";
	var debugJsonView 	= (req.body.debug_json_view) 	? req.body.debug_json_view 	: 0;
	var isCrypto	 	=	(req.body.is_crypto) 		? Number(req.body.is_crypto)	: DEACTIVE;
	var apiTypeN		=	MOBILE_API_TYPE;
	var decodedData 	= false;
	/** Blank validation **/
	if (inputData != '') {
		
		var decodedData = atob(inputData);
		if (debugJsonView && inputData.indexOf("{") === 0) {
			decodedData = inputData;
		}else{
			/** crypto wise and base64wise conditions **/
			if(isCrypto==ACTIVE){
				
				inputData = decryptCryptoMobile(inputData)

			}
			var decodedData = b64DecodeUnicode(inputData);
		}
		console.log("req.headers")
		console.log(req.headers.api_type)
		//let showData = encryptCryptoMobile(decodedData);
		//console.log("showData");
		//console.log(showData);
		
		//let showData
		//let getData = decryptCryptoMobile(showData);
		
		//console.log("getData");
		//console.log(getData);
		console.log(decodedData);
		var APIData = JSON.parse(decodedData);
		console.log("APIData");
		console.log(APIData);
		//return false;
		var methodName 	= (APIData.method_name) ? APIData.method_name 	: '';
		//var apiType 	= (APIData.api_type) 	? APIData.api_type 		: '';
		var apiType 	= (req.headers.api_type) ? req.headers.api_type : "mobile";
		
		var device_type			=	(APIData.device_type) 	? APIData.device_type : "";
		var device_id			=	(APIData.device_id) 	? APIData.device_id : "";
		var device_token		=	(APIData.device_token) 	? APIData.device_token : "";
		
		req.body 		= (APIData.data) 		? APIData.data 			: {};

		/** User slug accourding fetch  data**/
		
		let slug 	= (req.body.slug) 		? req.body.slug 	: "";
		let email 	= (req.body.email) 		? req.body.email 	: "";

		let conditionOptions = {
		}
		if(slug != "")
		{
			conditionOptions = {
				conditions	:	{ slug: slug},
			}
		}
		if(methodName == "forgot-password" || methodName == "reset-password")
		{
			if(email != "")
			{
				conditionOptions = {
					conditions	:	{ email: email},
				}
			}
		}

		/** JWT Authentication **/
		let jwtOption = {
			token: (req.headers.authorization) ? req.headers.authorization : "",
			secretKey: JWT_CONFIG.secret,
			slug: (req.body.slug) ? req.body.slug : "",
		}
		JWTAuthentication(req, res, jwtOption).then(responseData => {
			
			req.body['debugJsonView'] 		=	debugJsonView;
			if(responseData.status != STATUS_SUCCESS){
				
				let returnResponse = {
					'data': {
						status			:	STATUS_ERROR,
						message: res.__("admin.system.invalid_access"),
					}
				};
				return returnApiResult(req, res,returnResponse);
				
				//return returnApiResult()
			}

	
			getUserDetailBySlug(req, res, conditionOptions).then(userDetailResponse => {
				
						
			
				var is_active ; 
				if (userDetailResponse.status == STATUS_SUCCESS) {
					req.user_data = (userDetailResponse.result) ? userDetailResponse.result : {};
					is_active = req.user_data.active ? req.user_data.active : ACTIVE;
					
				}
				
				if(is_active == DEACTIVE)
				{
					
					if(methodName == "logout")
					{
						let returnResponse = {
							'data': {
								status			:	STATUS_SUCCESS,
								message			: res.__("user.you_have_logged_out_successfully")
								
							}
						};
						return returnApiResult(req, res,returnResponse);
	

					}else if(methodName == "login"){
						let returnResponse = {
							'data': {
								status			:	STATUS_SUCCESS,
								message			: res.__("user.account_temporarily_disabled")
								
							}
						};
						return returnApiResult(req, res,returnResponse);

					}
					else {
						let returnResponse = {
							'data': {
								status			:	STATUS_ERROR,
								is_active		: 	DEACTIVE,
								message			: res.__("user.account_temporarily_disabled")
							}
						};
						return returnApiResult(req, res,returnResponse);
	

					}
					
				}else{
					
							/** By common key use by default send*/
				req.body['request_from'] 		=	REQUEST_FROM_API;
				req.body['is_mobile_verified'] 	=	NOT_VERIFIED;
				req.body['is_email_verified'] 	=	NOT_VERIFIED;
				req.body['api_type'] 			=	apiType;
				req.body['is_crypto'] 			=	isCrypto;
				req.body['device_type'] 		=	device_type;
				req.body['device_id'] 			=	device_id;
				req.body['device_token'] 		=	device_token;
				req.body['method_name'] 		=	methodName;
				req.body['is_active'] 			=	ACTIVE;
				//req.body['debugJsonView'] 		=	debugJsonView;
				
				return next();

				}
				
				
			});
		})
	}else{
		
		res.send({
			message: res.__("admin.system.invalid_access"),
			status: STATUS_ERROR,
		});
	}
	
}
/** Going backwards: from bytestream, to percent-encoding, to original string.*/
b64DecodeUnicode = (str)=>{
	return decodeURIComponent(atob(str).split('').map(function (c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
}


/**
 *  Function to check if admin is accessing the front end website in the same browser
 * */
function authenticateMiddlewareAccess(req, res, next) {
	setTimeout(function () {
		/*** Start authentication functionality **/
		var inputdata = (req.body.req) ? req.body.req : "";

		var decordedData = false;
		if (inputdata != '') {
		
			var decordedData = atob(inputdata);
			if (inputdata.indexOf("{") === 0) {
				decordedData = inputdata;
			}
			var data = JSON.parse(decordedData);
			method_name = data.method_name;
			slug = (data.data && data.data.slug)	?	data.data.slug	:	"";
			
		} else {
			let response = {
				status: TOKEN_STATUS_ERROR,
				message: res.__("admin.system.invalid_access")
			}
			let result = JSON.stringify(response);
			let utf8 = require('utf8');
			let myJSON = utf8.encode(result);


			res.send({ response: btoa(myJSON) });
			return false;
		}
		/*** end authentication functionality **/

		var middlewareUser = require(middlewarePath);
		middlewareUser.authenticateAccess(req, res, next, method_name, slug, function (accessPermission) {
			if (accessPermission) {
				return next();
			} else {
				let response = {
					status: TOKEN_STATUS_ERROR,
					message: res.__("admin.system.invalid_access")
				}
				let result = JSON.stringify(response);
				let utf8 = require('utf8');
				let myJSON = utf8.encode(result);


				res.send({ response: btoa(myJSON) });
				return false;
			}
		});
	}, 250);
}
