function Wallets() {
	
	/** 
	 * Function to use get wallet amount and tranaction 
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 **/
	this.getWalletTranaction = (req,res,next,callback)=>{
		let finalResponse = {}		
		/** get user id get **/
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";
		if(userId==''){
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {},
					message: res.__("global.user_not_found")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit	= API_DEFAULT_LIMIT;
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		console.log("here TABLE_WALLET_TRANSACTION");
		const walletTransaction = db.collection(TABLE_WALLET_TRANSACTION);
		const async	= require('async');
		async.parallel({
			get_tranaction : (callback)=>{
				walletTransaction.aggregate([
					{
						$match : {
							user_id : ObjectId(userId)
						}
					},
					{$lookup 	: 	{
						"from" 			:	TABLE_USERS,
						"localField" 	:	"credited_by",
						"foreignField" 	:	"_id",
						"as" 			:	"admin_user_details"
					}},
					{$project:{
						amount	:	1,
						reason	:	1,
						tranaction_type : 1,
						created : 1,
						credited_by			: { "$arrayElemAt"	: ["$admin_user_details.full_name",0]},
					}}
				]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
					
					let finalResult = [];
					finalResult = result.map(records => {
						
						records['created'] = (records.created) ? newDate(records.created,DATE_TIME_FORMAT_EXPORT) : "";
						return records;
					})
					callback(err, finalResult);
				});
			},
			tranaction_count : (callback)=>{
				walletTransaction.countDocuments({user_id : ObjectId(userId)},(err,countResult)=>{
					callback(err, countResult);
				});
			},
			user_data : (callback)=>{
				
				let conditions = {
					_id : ObjectId(userId)
				}
				
				/** Set options data for get user details **/
				let userOptions = {
					conditions	:	conditions,
					fields		:	{facebook_id :0,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,password:0,modified:0}
				};
				getUserDetailBySlug(req, res, userOptions).then(response => {
					let userData = (response.result) ? response.result : "";
					callback(null, userData);
				});
			}
			
		},(err, response)=>{
			
			let tranactionList = response['get_tranaction'] ? response['get_tranaction'] : [];
			var totalRecord	= (response['tranaction_count']) ? response['tranaction_count'] : 0;
			var user_data	= (response['user_data']) ? response['user_data'] : 0;
			if(tranactionList.length > 0 ){
				finalResponse = {
					'data': {
						status			: STATUS_SUCCESS,
						result			: tranactionList,//(response[0]) ? response[0] : [],
						user_data		: user_data,
						recordsTotal	: totalRecord,
						limit			: limit,
						page			: page,
						message		 	: "",
						total_page		: Math.ceil(totalRecord/limit)
					}
				};
				return returnApiResult(req,res,finalResponse);
			}else{
				finalResponse = {
					'data': {
						status			: STATUS_SUCCESS,
						result			: [],
						user_data 		: "",
						recordsTotal	: 0,
						recordsSkipTotal: 0,
						limit			: limit,
						page			: page,
						message		 	: res.__("api.global.no_record_found"),
						total_page		: 0
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
		});
	}
	
	
	/** 
	 * Function to use get wallet amount and tranaction 
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 **/
	this.saveWalletTranaction = (req,res,next,callback)=>{
		let finalResponse = {}		
		/** get user id get **/
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";
		if(userId==''){
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {},
					message: res.__("global.user_not_found")
				}
			};
			return callback(finalResponse);
		}
		
		/** Sanitize Data */
		req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		
		/** Check validation */
		req.checkBody({
			"wallet_balance": {
				notEmpty: true,
				isFloat :	{
					options: [{ min: 1 }],
					errorMessage: res.__("admin.system.it_must_be_numeric_value")
				},
				errorMessage: res.__("admin.users.please_enter_wallet_balance")
			},
			'reason': {
				notEmpty	: true,
				errorMessage: res.__("admin.users.please_enter_reason")
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
					message	: errors,
				}
			};
			return callback(finalResponse);
		}
		
		let walletBalance		= 	(req.body.wallet_balance) 	? req.body.wallet_balance	: '';
		let reason				= 	(req.body.reason) 			? req.body.reason			: '';
		
		/** Update product record **/
		let optionsData = {
			wallet_balance		: Number(walletBalance),
			reason				: reason,
			user_id				: ObjectId(userId),
			tranaction_type		: CREDIT,
			credited_by			: userId,
		}
		
		
		/**updated wallet balance*/
		updateWalletBalance(req,res,optionsData).then(userWalletResponse=>{
			if(userWalletResponse.status==STATUS_SUCCESS){
				
				/** Start function for get user list and send notification*/ 
				const users = db.collection(TABLE_USERS);
				users.findOne({_id:ObjectId(userId)},{projection:{full_name:1,email:1}},(errUser, resultUser)=>{
					if(resultUser){
						let fullName	= (resultUser.full_name)	?	resultUser.full_name	:	"";
						let email		= (resultUser.email)		?	resultUser.email		:	"";
						/***Start Send Notification**/
						let notificationMessageParams	= [fullName,walletBalance,CREDIT];
						let notificationOptions 		= {
							notification_data : {
								notification_type	: NOTIFICATION_WALLET_BALLENCE,
								message_params		: notificationMessageParams,
								parent_table_id		: userId,
								user_id				: userId,
								user_ids			: [userId],
								user_role_id		: SUPER_ADMIN_ROLE_ID,
								role_id				: SUPER_ADMIN_ROLE_ID,
								extra_parameters	: {
									user_id	: ObjectId(userId),
								}
							}
						};
						insertNotifications(req,res,notificationOptions).then(notificationResponse=>{ });
						/***End Send Notification**/
						
						
						/**Mail send to wallet amount*/
						if(email!=""){
							/** Set options for send email **/
							let emailOptions = {
								to 			:	email,
								action 		:	"wallet_update_user",
								rep_array 	:	[fullName,walletBalance,CREDIT,reason]
							};
							/** Send Mail*/
							sendMail(req,res,emailOptions);
						}
					}
				});
				/** End function for get user list and send notification*/ 
				
				
					
				/** Send success response  **/
				finalResponse = {'data': {
					status: STATUS_SUCCESS,
					message: res.__("admin.user.wallet_balance_updated_successfully")
				}};
				return callback(finalResponse);
			}else{
				/** Send error response  **/
				finalResponse = { 'data': {
					status: STATUS_ERROR,
					message: res.__("front.user.wallet_balance_updated_successfully")
				}};
				return callback(finalResponse);
			}
		}).catch(next);
	}
	
	
	
	/** 
	 * Function to use get payment order id
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 **/
	
	this.genrateWalletPaymentOrderId = (req,res,next,callback)=>{
		
		let finalResponse = {}		
		/** get user id get **/
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";
		let fullName			=	(loginUserData.full_name)		?	loginUserData.full_name		:	"";
		let mobileNumber			=	(loginUserData.mobile_number)		?	loginUserData.mobile_number		:	"";
		if(userId==''){
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {},
					message: res.__("global.user_not_found")
				}
			};
			return callback(finalResponse);
		}
		
		/** Sanitize Data */
		req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		
		
		req.checkBody({
			
			"amount": {
				notEmpty	: true,
				isFloat:{
					errorMessage: res.__("Please enter valid amount."),
				},
				errorMessage: res.__("Please enter amount.")
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
		let amount = (req.body.amount) ? req.body.amount : DEACTIVE;
		
		let paymentOption = {
			payment_pay : PAYMENT_PAY,
			amount : amount,
		}
		/* Function for genrate razorpay order id */
		genratePaymentOrderId(req,res,paymentOption).then(paymentOrderResponse => {
			let paymentResult = (paymentOrderResponse.order_result) ? paymentOrderResponse.order_result : {};
			let paymentResultData = paymentResult ? paymentResult : {};
			let razorpayOrderId	=	"";
			if(Object.keys(paymentResultData).length > 0){
				razorpayOrderId = (paymentResultData.id) ? paymentResultData.id : "";
			}
			let currency		= (res.locals.settings['Site.razorpay_currency']) ? res.locals.settings['Site.razorpay_currency']: "";
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					errors: "",
					result:{
						amount 					: 	amount,
						user_name 				: 	fullName,
						image_logo				:	WEBSITE_IMG_URL+'logo.png',
						mobile_number			:	mobileNumber,
						order_id				:	razorpayOrderId,
						user_id					:	userId,
						currency				:	currency,
						api_key					:	(res.locals.settings['Site.razorpay_key_id']) ? res.locals.settings['Site.razorpay_key_id']: ""
					}
				}
			};
			return callback(finalResponse);
		})
		
	}
	
	
	
	/** 
	 * Function to use get payment order id
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 **/
	
	this.addMoneyToWallet = (req,res,next,callback)=>{
		
		let finalResponse 	= {};
		req.body 			= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		let loginUserData 	=	(req.user_data) 				?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)				?	loginUserData._id		:	"";		
		let fullName			=	(loginUserData.full_name)				?	loginUserData.full_name		:	"";		
		
		console.log(loginUserData);
		let paymentOption	=	(req.body.paymentOption)		?	req.body.paymentOption		:	"";		
		
		if(userId == ""){
			finalResponse = {
				'data': {
					status	: STATUS_ERROR,
					result	: {},
					message	: res.__("system.something_going_wrong_please_try_again")
				}
			};
			return callback(finalResponse);  
		}
		paymentOption['payment_for'] = "wallet";
		savePaymentResponse(req,res,paymentOption).then(paymentResponse => {
			
			let  amount					=	(paymentOption.amount) ? parseFloat(paymentOption.amount) : DEACTIVE;
			let  paymentStatus			=	(paymentOption.status) ? paymentOption.status : DEACTIVE;
			consoleLog(paymentOption);
			if(paymentStatus == STATUS_SUCCESS)
			{	
				/** Update product record **/
				let optionsData = {
					wallet_balance		: Number(amount),
					
					user_id				: ObjectId(userId),
					tranaction_type		: CREDIT,
					credited_by			: userId,
				}
		
				/**updated wallet balance*/
				updateWalletBalance(req,res,optionsData).then(userWalletResponse=>{
					
					
					/***Start Send Notification**/
					let notificationMessageParams	= [fullName,amount,CREDIT];
					let notificationOptions 		= {
						notification_data : {
							notification_type	: NOTIFICATION_WALLET_BALLENCE,
							message_params		: notificationMessageParams,
							parent_table_id		: userId,
							user_id				: userId,
							user_ids			: [userId],
							user_role_id		: SUPER_ADMIN_ROLE_ID,
							role_id				: SUPER_ADMIN_ROLE_ID,
							created_by			: userId,
							pn_type				: PN_TYPE_CONFIG.add_wallet_balance,
							notification_action	: PN_TYPE_CONFIG.follow_request,							
							extra_parameters	: {
								user_id	: ObjectId(userId),
							}
						}
					};
					insertNotifications(req,res,notificationOptions).then(notificationResponse=>{ });
					/***End Send Notification**/
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							errors: "",
							message : 	 res.__("wallet.wallet_balance_has_been_credit_successfully")
						}
					};
					return returnApiResult(req,res,finalResponse);
					//return callback(finalResponse);
					
					
				})
			}else{
				
				finalResponse = {
					'data': {
						status	: STATUS_ERROR,
						result	: {},
						message	: res.__("system.something_going_wrong_please_try_again")
					}
				};
				return returnApiResult(req,res,finalResponse);
				//return callback(finalResponse); 
			}
			
			
		})
		
		
	}
	
	
	/** 
	 * Function to use send tip money from wallet to wallet on post
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 **/
	
	this.sendPostTipMoneyToWallet = (req,res,next,callback)=>{
		
		let finalResponse 	= {};
		req.body 			= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		let loginUserData 	=	(req.user_data) 				?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)				?	loginUserData._id		:	"";		
		let fullName		=	(loginUserData.full_name)				?	loginUserData.full_name		:	"";		
		let walletBalance		=	(loginUserData.wallet_balance)				?	loginUserData.wallet_balance		:	"";		
		
		let otherUserSlug   = (req.body.other_user_slug) ? req.body.other_user_slug : "";
		let postSlug   = (req.body.post_slug) ? req.body.post_slug : "";
		let amount 			= (req.body.amount) ? req.body.amount : "";
		if(userId == ""){
			finalResponse = {
				'data': {
					status	: STATUS_ERROR,
					result	: {},
					message	: res.__("system.something_going_wrong_please_try_again")
				}
			};
			return callback(finalResponse);  
		}
		let errMessageArray = [];
		
		let otherUserCondition = {
            slug: otherUserSlug
        }
        /** Set options data for get user details **/
        let otherUserOptions = {
            conditions	:	otherUserCondition,
            fields		:	{facebook_id :0}
        };
		getPostDataBySlug(req, res, postSlug).then(postResponse => {
			if (postResponse.status == STATUS_ERROR) {
				 finalResponse = {
					'data': {
						status: STATUS_ERROR,
						message: res.__("admin.system.something_going_wrong_please_try_again")
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
			let postId					    =	(postResponse.result._id)				? 	postResponse.result._id			:"";
			let title					    =	(postResponse.result.title)				? 	postResponse.result.title			:"";
			/** Get other user detail **/
			getUserDetailBySlug(req, res, otherUserOptions).then(userResponse => {
				/** Send error response **/
				if (userResponse.status == STATUS_ERROR) {
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: {},
							message: res.__("front.system.something_going_wrong_please_try_again")
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
				let sendToUserId					    =	(userResponse.result._id)				? 	userResponse.result._id			:"";		
				let sendfullName					    =	(userResponse.result.full_name)				? 	userResponse.result.full_name			:"";		
				
				if(walletBalance < amount)
				{
					errMessageArray.push({'param':'amount','msg':res.__("Sorry your wallet balance is low.")});
				}
				if (errMessageArray.length > 0) {
					var newerrors = stringValidationFromMobile(errMessageArray, req);
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: newerrors,
							message: newerrors,
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
				let sendAmt = currencyFormat(amount);
				let recevieMsg  = res.__("wallet.tip_amount_receive",sendAmt,title,fullName);
				/** Update post user wallte balance***/
				let optionsData = {
					wallet_balance		: Number(amount),
					reason				: recevieMsg,
					user_id				: ObjectId(sendToUserId),
					tranaction_type		: CREDIT,
					credited_by			: userId,
				}

				/**updated wallet balance*/
				updateWalletBalance(req,res,optionsData).then(userWalletResponse=>{
					
					let senderMsg  = res.__("wallet.tip_amount_send",sendAmt,sendfullName,title);
					let loginUserOptionsData = {
						wallet_balance		: Number(amount),
						reason				: senderMsg,
						user_id				: ObjectId(userId),
						tranaction_type		: DEBIT,
						credited_by			: userId,
					}
					updateWalletBalance(req,res,loginUserOptionsData).then(userWalletResponse=>{
						
						let notificationMessageParams	= [sendAmt,title,fullName];
						let notificationOptions 		= {
							notification_data : {
								notification_type	: NOTIFICATION_WALLET_GIFT_RECEVIED,
								message_params		: notificationMessageParams,
								parent_table_id		: sendToUserId,
								user_id				: ObjectId(sendToUserId),
								user_ids			: [sendToUserId],
								user_role			: sendToUserId,
								user_role_id		: sendToUserId,
								created_by			: userId,
								request_status		: DEACTIVE,
								pn_type				: PN_TYPE_CONFIG.wallet_gift_recevied,
								notification_action	: PN_TYPE_CONFIG.wallet_gift_recevied,
							}
						};
						insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
						
							
						});
						
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								
								message: res.__("wallet.tip_amout_has_been_send_successfully"),
							}
						};
						return returnApiResult(req,res,finalResponse);
					})

					
					
				})
			});
		});
	}
}	
module.exports = new Wallets();
