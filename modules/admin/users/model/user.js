const crypto 	= 	require("crypto");
const async		= 	require("async");
const userService = require(WEBSITE_SERVICES_FOLDER_PATH+'user_service');
function User() {

	UserModel 	= 	this;

	let exportFilterConditions 	=	{};
	let exportCommonConditions 	=	{};
	let exportSortConditions	= 	{_id:SORT_ASC};
	
	/**
	 * Function for login
	 *
	 * @param req 	As	Request Data
	 * @param res 	As 	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/jsonthis
	 */
    this.login = (req, res,next)=>{
		if(isPost(req)){
			console.log("here post")
			/** Sanitize Data **/
			req.body 			= sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let username	 	= (req.body.username) 	? req.body.username	: "";
			let simplePassword 	= (req.body.password)	? req.body.password : "";


			/** Set login options **/
			let loginOptions = {
				user_name 	:	username,
				password	: 	simplePassword
			};

			/** call login function **/
			adminLoginFunction(req,res,next,loginOptions).then(responseData=>{
				
				if(responseData.status	!= STATUS_SUCCESS){
					/** Send error response **/
					return res.send({
						status	: STATUS_ERROR,
						message	: (responseData.errors)	?	responseData.errors	:[],
					});
				}
				var userData = responseData.result ? (responseData.result) : "";
				if(userData.user_role_id == CORPORATE_USER_ROLE_ID && userData.is_profile_complete == DEACTIVE){
					/** Send success response **/
					res.send({
						redirect_url	: WEBSITE_ADMIN_URL+"corporate_profile",
						status			: STATUS_SUCCESS,
					});
				}else if(userData.user_role_id == FLEET_USER_ROLE_ID && userData.is_profile_complete == DEACTIVE){
					/** Send success response **/
					res.send({
						redirect_url	: WEBSITE_ADMIN_URL+"fleet_profile",
						status			: STATUS_SUCCESS,
					});
				}else{
					/** Send success response **/
					res.send({
						redirect_url	: WEBSITE_ADMIN_URL+"dashboard",
						status			: STATUS_SUCCESS,
					});
				}
			}).catch(next);
		}else{
			if(ALLOWED_ADMIN_TO_SET_COOKIE != ACTIVE){
				res.render("login");
				return;
			}

			/** Login user using cookie*/
			let cookie = req.cookies.adminLoggedIn;
			if(!cookie){
				res.render("login");
				return;
			}

			let username			= 	(cookie.username) 	?	cookie.username :"";
			let password			= 	(cookie.password)	? 	cookie.password	:"";
			let decipherUser 		= 	crypto.createDecipher("aes256", "username");
			let decryptedUsername	=	decipherUser.update(username, "hex", "utf8") + decipherUser.final("utf8");
			let decipherPassword	= 	crypto.createDecipher("aes256", "password");
			let decryptedPassword	= 	decipherPassword.update(password, "hex", "utf8") + decipherPassword.final("utf8");

			/** Set login options **/
			let loginOptions = {
				user_name 	:	decryptedUsername,
				password	: 	decryptedPassword
			};

			/** call login function **/
			adminLoginFunction(req,res,next,loginOptions).then(responseData=>{
				
				
				if(responseData.status	!= STATUS_SUCCESS){
					/** Delete cookie*/
					res.clearCookie("adminLoggedIn");
					res.render("login");
					return;
				}

				/** Redirect to dashboard*/
				res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			}).catch(next);
		}
    };//End login()

	
	
	
	
	/**
	 * Function for login
	 *
	 * @param req 		As	Request Data
	 * @param res 		As 	Response Data
	 * @param next 		As 	Callback argument to the middleware function
	 * @param options	As 	Object that have user name and password
	 *
	 * @return json
	 */
    adminLoginFunction = (req,res,next,options)=>{
		return new Promise(resolve=>{
			let username		=	(options.user_name)		?	options.user_name		:"";
			let simplePassword	=	(options.password)		?	options.password		:"";
			let rememberMe		= 	(req.body.remember_me) 	?	req.body.remember_me	:false;
			
			/** Get user Details **/
			const users = db.collection(TABLE_USERS);
			users.findOne({
				is_deleted		:	NOT_DELETED,
				
				email			: 	{$regex : "^"+username+"$",$options : "i"},
				//user_role_id	: 	{$nin:[RIDER_USER_ROLE_ID,DRIVER_USER_ROLE_ID,CORPORATE_USER_ROLE_ID,FLEET_USER_ROLE_ID]}
				user_role_id	: 	{$nin:[RIDER_USER_ROLE_ID,DRIVER_USER_ROLE_ID]}
			},{projection: {
				user_role_id:1,first_name: 1,last_name:1,full_name:1,email:1,password:1,active:1,created:1,is_mobile_verified:1,is_email_verified:1,is_admin_approved:1,is_profile_complete:1,profile_staps:1,company_name:1
			}},(err, resultData)=>{
				if(err) return next(err);

				if(!resultData){
					/** Send error response **/
					return resolve({
						status	: 	STATUS_ERROR,
						options	: 	options,
						errors	: 	[{"param":"password","msg":res.__("admin.user.please_enter_correct_email_or_password")}]
						
					});
				}
				
				/**Compare password */
				let password =  (resultData.password) ? resultData.password : "";
				
				// bcrypt.compare(simplePassword, password).then(function(passwordMatch) {
				bcryptCheckPasswordCompare(simplePassword,password).then(function(passwordMatch) {
					if(!passwordMatch){
						/** Send error response **/
						let response = {
							status	: 	STATUS_ERROR,
							errors	: 	[{"param":"password","msg":res.__("admin.user.please_enter_correct_email_or_password")}],
							options	: 	options
						};
						return resolve(response);
					}
				
				
				
				if(resultData.active != ACTIVE) {
					/** Send error response **/
					return resolve({
						status	: 	STATUS_ERROR,
						options	: 	options,
						errors	: 	[{"param":"password","msg":res.__("admin.user.account_temporarily_disabled")}]
					});
				}
				if(resultData.is_email_verified != ACTIVE) {
					/** Send error response **/
					return resolve({
						status	: 	STATUS_ERROR,
						options	: 	options,
						errors	: 	[{"param":"password","msg":res.__("admin.user.your_email_verification_is_pending")}]
					});
				}
				if(resultData.is_mobile_verified != ACTIVE) {
					/** Send error response **/
					return resolve({
						status	: 	STATUS_ERROR,
						options	: 	options,
						errors	: 	[{"param":"password","msg":res.__("admin.user.your_mobile_verification_is_pending")}]
					});
				}
				/*if(resultData.is_admin_approved != ACTIVE) {
					/** Send error response **
					return resolve({
						status	: 	STATUS_ERROR,
						options	: 	options,
						errors	: 	[{"param":"password","msg":res.__("admin.user.your_admin_verification_is_pending")}]
					});
				}*/
				
				
				
				
				/** If user check stay sign in check box*/
				if(rememberMe  == true){
					let cookie = req.cookies.adminLoggedIn;
					if (cookie === undefined){
						let userCipher			= crypto.createCipher("aes256", "username");
						let encryptedUserName	= userCipher.update(username, "utf8", "hex") + userCipher.final("hex");
						let passwordCipher		= crypto.createCipher("aes256", "password");
						let encryptedPassword	= passwordCipher.update(simplePassword, "utf8", "hex") + passwordCipher.final("hex");

						/**set a new cookie*/
						res.cookie("adminLoggedIn",{username:encryptedUserName,password:encryptedPassword}, { maxAge: ADMIN_LOGGED_IN_COOKIE_EXPIRE_TIME, httpOnly: true });
					}
				}
				req.session.user = resultData;

				/** Send success response **/
				let response = {
					status	:	STATUS_SUCCESS,
					options	: 	options,
					result	: 	resultData
				};
				resolve(response);
			});
			});
		});
	};//End adminLoginFunction()
	

	/**
	 * Function for show dashboard
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render
	 */
	this.dashboard = (req, res, next)=>{
		const users			=	db.collection(TABLE_USERS);
		const notification 	=	db.collection(TABLE_NOTIFICATIONS);
		const posts		 	=	db.collection(TABLE_POSTS);
		const campaign		=	db.collection(TABLE_CAMPAIGN);
		const trips		 	=	db.collection(TABLE_TRIPS);
		
		/** Current Month */
			var date = new Date(), y = date.getFullYear(), m = date.getMonth();
			var firstCurrentMonthDate = new Date(y, m, 1);
			var lastCurrentMonthDate = new Date(y, m + 1, 1);
			
			/** Current Year */
			var currentYear				=	String(getDateMoment().year()).padStart(2, '');
			var firstCurrentYearDate	=	new Date(new Date(currentYear+'-01-01').setHours(00,00,00));
			var lastCurrentYearDate		=	new Date(new Date(currentYear+'-12-31').setHours(23,59,59));
				
		async.parallel([
			(callback)=>{
				/** Set conditions **/
				let conditions	=	{
					"is_deleted"	: 	NOT_DELETED,
					"user_role_id" 	:	{$in:[KIDS_USER_ROLE_ID,TEENS_USER_ROLE_ID,ADULTS_USER_ROLE_ID]}
				};

				/** Get list of user month wise **/
				users.aggregate([
					{$match	: conditions},
					{$group	: {
						_id	: {
							"year"	: { "$substr"	: [ "$created", 0, 4 ] },
							"month"	: { "$substr"	: [ "$created", 5, 2 ] }
						},
						total_kids : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",KIDS_USER_ROLE_ID] },
								]},
								1,
								0
							]}
						},
						total_teens : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",TEENS_USER_ROLE_ID] },
									//{ $eq : ["$is_admin_approved",ACTIVE] },
								]},
								1,
								0
							]}
						},
						total_adults : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",ADULTS_USER_ROLE_ID] },
									//{ $eq : ["$is_admin_approved",ACTIVE] },
								]},
								1,
								0
							]}
						},
						
					}},
					{$sort: {_id : SORT_DESC}}
				]).toArray((err, result)=>{
					consoleLog(result);
					callback(null, result);
				});
			},
			(callback)=>{
				/** Set conditions **/
				let conditions	=	{
					"is_deleted"	: 	NOT_DELETED,
					"user_role_id" 	:	{$in:[KIDS_USER_ROLE_ID,TEENS_USER_ROLE_ID,ADULTS_USER_ROLE_ID]}
				};

				users.aggregate([
					{$match	: conditions},
					{$group	: {
						_id	: null,
						total_kids : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",KIDS_USER_ROLE_ID] },
								]},
								1,
								0
							]}
						},
						total_teens : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",TEENS_USER_ROLE_ID] },
									//{ $eq : ["$is_admin_approved",ACTIVE] },
								]},
								1,
								0
							]}
						},
						total_adults : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",ADULTS_USER_ROLE_ID] },
									//{ $eq : ["$is_admin_approved",ACTIVE] },
								]},
								1,
								0
							]}
						},
					}}
				]).toArray((err, result)=>{
				//	consoleLog(result)
					callback(null, result);
				});
			},
			/** Notification listing ( notification )**/
			(callback)=>{
				let authId			=	(req.session.user._id)	?	req.session.user._id		:"";
				/** Set common conditions **/
				let	commonConditions = {
					user_id	:	ObjectId(authId)
				};
				notification.find(commonConditions,{title:1,message:1,created:1}).sort({created:SORT_DESC}).limit(5).toArray((err,result)=>{
					callback(null, result);
				});
			},
			/** Post Count **/
			(callback)=>{
				
				let	commonConditions = {
					is_deleted	:	DEACTIVE,
				//	status		:   ACTIVE
				};

				/** Get list of user month wise **/
				posts.aggregate([
					{$match	: commonConditions},
					{$group	: {
						_id	: {
							"year"	: { "$substr"	: [ "$created", 0, 4 ] },
							"month"	: { "$substr"	: [ "$created", 5, 2 ] }
						},
						total_posts : {$sum : {
							$cond: [
								{$and: [
									
								]},
								1,
								0
							]}
						},
						
					}},
					
					{$sort: {_id : SORT_DESC}}
				]).toArray((err, result)=>{
				//	consoleLog(result);
					callback(null, result);
				});
				
			},

			/** campaign Count **/
			(callback)=>{
				
				let	commonConditions = {
				//	is_expired			:	DEACTIVE,
				//	status 				: 	ACTIVE,
				//	duration_end_date  	: 	{ $gte : getUtcDate()},
				};

				/** Get list of user month wise **/
				campaign.aggregate([
					{$match	: commonConditions},
					{$group	: {
						_id	: {
							"year"	: { "$substr"	: [ "$created", 0, 4 ] },
							"month"	: { "$substr"	: [ "$created", 5, 2 ] }
						},
						total_campaign : {$sum : {
							$cond: [
								{$and: [
									
								]},
								1,
								0
							]}
						},
						
					}},
					
					{$sort: {_id : SORT_DESC}}
				]).toArray((err, result)=>{
				//	consoleLog("Campaign count resuklt ")
				//	consoleLog(result);
					callback(null, result);
				});
				
			},

			/** ACTIVE posts Count **/
			(callback)=>{
			
				let	commonConditions = {
					is_deleted	:	DEACTIVE,
				//	status		:   ACTIVE
				};
				posts.countDocuments(commonConditions,(err,postCountResult)=>{
					callback(err, postCountResult);
				});
			},
			/** ACTIVE CAMPAIGNS Count **/
			(callback)=>{
			
				let	commonConditions = {
				//	is_expired			:	DEACTIVE,
				//	status 				: 	ACTIVE,
				//	duration_end_date  	: 	{ $gte : getUtcDate()},
				};
				campaign.countDocuments(commonConditions,(err,campaignCountResult)=>{
					callback(err, campaignCountResult);
				});
			},

		],
		(err, response)=>{

			
			const util = require('util');
		
			if(err) return next(errs);			
			/**Render dashboard page*/
			req.breadcrumbs(BREADCRUMBS["admin/dashboard"]);
			res.render("dashboard", {
				stats 						:	(response[1] && response[1][0]) ? response[1][0] : {},
				result						: 	(response[0]) ? response[0] : [],
				notification				: 	(response[2]) ? response[2] : [],
				result_post					: 	(response[3]) ? response[3] : [],
				result_campaign				: 	(response[4]) ? response[4] : [],
				total_posts					: 	(response[5]) ? response[5] : [],
				total_active_campaign		: 	(response[6]) ? response[6] : [],
				user_role_id 				:	req.session.user._id
			});
		});

	};//End dashboard()
	
	
	/**
	 * Function for show corporate dashboard
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render
	 */
	this.corporateDashboard = (req, res, next)=>{
		const users 	    = db.collection(TABLE_USERS);
		const corporate_employees	= db.collection(TABLE_CORPORATE_EMPLOYEES);
		async.parallel([
			(callback)=>{
				/** Set conditions **/
				let conditions	=	{
					"is_deleted"	: 	NOT_DELETED,
				};

				corporate_employees.aggregate([
					{$match	: conditions},
					{$group	: {
						_id	: null,
						total_active_employee : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$status",ACTIVE] },
									{ $eq : ["$request_status",ACTIVE] },
								]},
								1,
								0
							]}
						},
						total_inactive_employee : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$status",DEACTIVE] },
								]},
								1,
								0
							]}
						},
						total_pending_employee : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$request_status",DEACTIVE] },
									{ $eq : ["$status",DEACTIVE] },
								]},
								1,
								0
							]}
						},
					}}
				]).toArray((err, result)=>{
					callback(null, result);
				});
			},
			(callback)=>{
				/** Set conditions **/
				let conditions	=	{
					"is_deleted"	: 	NOT_DELETED,
					"user_role_id" 	:	{$in:[RIDER_USER_ROLE_ID,DRIVER_USER_ROLE_ID,CORPORATE_USER_ROLE_ID]}
				};

				users.aggregate([
					{$match	: conditions},
					{$group	: {
						_id	: null,
						total_riders : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",RIDER_USER_ROLE_ID] },
								]},
								1,
								0
							]}
						},
						total_drivers : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",DRIVER_USER_ROLE_ID] },
									{ $eq : ["$is_admin_approved",ACTIVE] },
								]},
								1,
								0
							]}
						},
						total_corporates : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",CORPORATE_USER_ROLE_ID] },
									{ $eq : ["$is_admin_approved",ACTIVE] },
								]},
								1,
								0
							]}
						},
					}}
				]).toArray((err, result)=>{
					callback(null, result);
				});
			},
			
		],
		(err, response)=>{
			if(err) return next(errs);
			/**Render dashboard page*/
			req.breadcrumbs(BREADCRUMBS["admin/dashboard"]);
			res.render("corporate_dashboard", {
				stats 	:	(response[1] && response[1][0]) ? response[1][0] : {},
				result	: 	(response[0]) ? response[0] : [],
			});
		});
	};//End dashboard()

	/**
	 * Function for show fleet dashboard
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render
	 */
	this.fleetDashboard = (req, res, next)=>{
		const users 	    		= db.collection(TABLE_USERS);
		const corporate_employees	= db.collection(TABLE_CORPORATE_EMPLOYEES);
		async.parallel([
			(callback)=>{
				/** Set conditions **/
				let conditions	=	{
					"is_deleted"	: 	NOT_DELETED,
				};

				users.aggregate([
					{$match	: conditions},
					{$group	: {
						_id	: null,
						total_active_drivers : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$active",ACTIVE] },
									{ $eq : ["$is_admin_approved",ACTIVE] },
									{ $eq : ["$user_role_id",DRIVER_USER_ROLE_ID] },
									{ $eq : ["$fleet_id",ObjectId(req.session.user._id)] },
								]},
								1,
								0
							]}
						},
						total_inactive_employee : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$status",DEACTIVE] },
								]},
								1,
								0
							]}
						},
						total_pending_employee : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$request_status",DEACTIVE] },
									{ $eq : ["$status",DEACTIVE] },
								]},
								1,
								0
							]}
						},
					}}
				]).toArray((err, result)=>{
					callback(null, result);
				});
			},
			(callback)=>{
				/** Set conditions **/
				let conditions	=	{
					"is_deleted"	: 	NOT_DELETED,
					"user_role_id" 	:	{$in:[RIDER_USER_ROLE_ID,DRIVER_USER_ROLE_ID,CORPORATE_USER_ROLE_ID]}
				};

				users.aggregate([
					{$match	: conditions},
					{$group	: {
						_id	: null,
						total_active_drivers : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$active",ACTIVE] },
									{ $eq : ["$is_admin_approved",ACTIVE] },
									{ $eq : ["$user_role_id",DRIVER_USER_ROLE_ID] },
									{ $eq : ["$fleet_id",ObjectId(req.session.user._id)] },
								]},
								1,
								0
						]}},
						total_drivers : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",DRIVER_USER_ROLE_ID] },
									{ $eq : ["$is_admin_approved",ACTIVE] },
								]},
								1,
								0
							]}
						},
						total_corporates : {$sum : {
							$cond: [
								{$and: [
									{ $eq : ["$user_role_id",CORPORATE_USER_ROLE_ID] },
									{ $eq : ["$is_admin_approved",ACTIVE] },
								]},
								1,
								0
							]}
						},
					}}
				]).toArray((err, result)=>{
					callback(null, result);
				});
			},
			
		],
		(err, response)=>{
			
			//console.log(response[1][0])
			if(err) return next(errs);
			/**Render dashboard page*/
			req.breadcrumbs(BREADCRUMBS["admin/dashboard"]);
			res.render("fleet_dashboard", {
				stats 	:	(response[1] && response[1][0]) ? response[1][0] : {},
				result	: 	(response[0]) ? response[0] : [],
			});
		});
	};//End fleetDashboard()



	
	/**
	 * Function for edit admin' s profile details
	 * @param req As Request Data
	 * @param res As Response Data
	 * @return render/json
	 */
	this.editProfile = (req,res,next)=>{
		consoleLog("Its in the model");
		
		if(isPost(req)){
			/** Sanitize Data **/
			req.body 			= sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let password		= (req.body.password)			? req.body.password			: "";
			let confirmPassword	= (req.body.confirm_password)	? req.body.confirm_password	: "";
			let oldPassword		= (req.body.old_password)		? req.body.old_password		: "";
			let id 				= (req.session.user)			? req.session.user._id		: "";
			let userRoleId 		= (req.body.user_role_id)		? req.body.user_role_id		: "";
		

				/** parse Validation array  **/

					let fullName	= 	(req.body.full_name)	? 	req.body.full_name	:"";
					let companyName	= 	(req.body.company_name)	? 	req.body.company_name	:"";
					let email	 	= 	(req.body.email)		? 	req.body.email		:"";
					const users		=	db.collection(TABLE_USERS);
					
					try{
						users.findOne({
								is_deleted	:	NOT_DELETED,
								
								email		:	{$regex : "^"+email+"$",$options:"i"},
							},
							{projection: {_id:1,email:1,password:1}},
							(errs,emailResult)=>{

								if(emailResult){
									if(oldPassword !=""){
										try{

											bcryptCheckPasswordCompare(oldPassword,emailResult.password).then(function(passwordMatch) {

												if(!passwordMatch){
													/** Send error response **/
													res.send({
														status	: STATUS_ERROR,
														message	: [{"param":"old_password","msg":res.__("admin.user_profile.old_password_you_entered_did_not_matched")}],
													});
												}

										
														/** update admin's profile details **/
														bcryptPasswordGenerate(password).then(function(bcryptPassword) {
													//	newPassword  = crypto.createHash("md5").update(password).digest("hex");
														let insertData = {
															full_name 		: fullName,
															company_name 	: companyName,
															password 		: bcryptPassword,
															modified 		: getUtcDate()
														};
														updateAdminProfile(insertData,req,res);
													}).catch(next);	
												
											
											});
										}catch(e){
											/** Send error response **/
											res.send({
												status	: STATUS_ERROR,
												message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
											});
										}
									}else{
										/** update admin 's profile details **/
										let insertData 	=  {
											full_name	: 	fullName,
											company_name 	: companyName,
											modified 	:	getUtcDate()
										};
										updateAdminProfile(insertData,req,res);
									}
								}else{
									/** Send error response **/
									res.send({
										status	: STATUS_ERROR,
										message	: [{'param':'email','msg':res.__("admin.user.your_email_id_is_already_exist")}]
									});
								}
							}
						);
					}catch(e){
						/** Send error response **/
						res.send({
							status	: STATUS_ERROR,
							message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
						});
					}

		}else{
			
			const users 	= db.collection(TABLE_USERS);
			let userId	= (req.session.user) ? req.session.user._id	: "";
			users.findOne({ "_id" : ObjectId(userId), "user_role_id" : {$nin:[RIDER_USER_ROLE_ID,DRIVER_USER_ROLE_ID]}},{projection: {_id:1,full_name:1,email:1,mobile_number:1,user_role_id:1,company_name:1}},(err, result)=>{
				if(!err){
					req.breadcrumbs(BREADCRUMBS["admin/user_profile/edit"]);
				
					res.render("edit_profile",{
						
						result	:	result
					});	
					
				}else{
					/** Send error response **/
					req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
					res.redirect(WEBSITE_ADMIN_URL+"dashboard");
				}
			});
		}
	};//End editProfile()



	/**
	 * Function for update admin 's profile details
	 *
	 * @param insertData As Data to be insert in database
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return json
	 */
	let updateAdminProfile = (insertData,req,res)=>{
		try{
			let id 			= 	(req.session.user) 		?	req.session.user._id 	:"";
			let fullName 	= 	(req.body.full_name)	? 	req.body.full_name     	:"";
			let companyName = 	(req.body.company_name)	? 	req.body.company_name     	:"";
			let mobileNumber= 	(req.body.mobile_number)?	req.body.mobile_number	:"";
			
			/** Update admin detail*/
			const users			= 	db.collection(TABLE_USERS);
			users.updateOne({
					_id : ObjectId(id)
				},
				{$set: insertData},
				(err,result)=>{
					if(!err){
						req.session.user.full_name		=	fullName;
						req.session.user.company_name	=	companyName;
						req.session.user.mobile_number 	= 	mobileNumber;
						/** Send success response **/
						req.flash(STATUS_SUCCESS,res.__("admin.user.your_profile_has_been_updated_successfully"))
						res.send({
							status		: STATUS_SUCCESS,
							redirect_url: WEBSITE_ADMIN_URL+"dashboard",
							message		:res.__("admin.user.your_profile_has_been_updated_successfully"),
						});
					}else{
						/** Send error response **/
						res.send({
							status	: STATUS_ERROR,
							message	: res.__("admin.system.something_going_wrong_please_try_again")
						});
					}
				}
			);
		}catch(e){
			/** Send error response **/
			res.send({
				status	: STATUS_ERROR,
				message	: res.__("admin.system.something_going_wrong_please_try_again")
			});
		}
	}//End updateAdminProfile()

	/**
	 * Function for recover forgot password
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.forgotPassword = (req, res)=>{
		if(isPost(req)){
			
			try{
				/** Sanitize Data **/
				req.body 		= sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
				let email	 	= (req.body.email) ? req.body.email :"";
			
				
			
					const users = db.collection(TABLE_USERS);
					users.findOne({
						"email"			: 	email,
						"user_role_id"	: 	{$nin:[RIDER_USER_ROLE_ID,DRIVER_USER_ROLE_ID,CORPORATE_USER_ROLE_ID]}
					},{projection: {_id:1,full_name:1}},(err, result)=>{
						consoleLog("Forget password called");
						consoleLog(result);
						if (result) {
							let currentTimeStamp	= 	new Date().getTime();
							let validate_string   	=	crypto.createHash("md5").update(currentTimeStamp+req.body.email).digest("hex");
							users.updateOne({
								_id : ObjectId(result._id)
							},
							{$set: {
								forgot_password_validate_string	: 	validate_string,
								modified 						:	getUtcDate()
							}},(err,updateResult)=>{
								if (updateResult) {
									/**  Send reset password link **/
									let link	=	WEBSITE_ADMIN_URL+'reset-password?validate_string='+validate_string;

									/** Set options for send email **/
									let emailOptions = {
										to 			:	email,
										action 		:	"forgot_password",
										rep_array 	:	[result.full_name,link,link]
									};

									/** Send Mail*/
									sendMail(req,res,emailOptions);

									/** Send success response **/
									req.flash(STATUS_SUCCESS,res.__("admin.user.receive_email_with_link").replace(RegExp("{EMAIL}","g"),email));
									res.send({
										status			: 	STATUS_SUCCESS,
										redirect_url	: 	WEBSITE_ADMIN_URL+"forgot-password",
										message			:	res.__("admin.user.receive_email_with_link").replace(RegExp("{EMAIL}","g"),email)
									});
								}else{
									/** Send error response **/
									res.send({
										status : STATUS_ERROR,
										message:[{"param":"email","msg":res.__("admin.system.something_going_wrong_please_try_again")}],
									});
								}
							});
						}else{
							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.user.receive_email_with_link").replace(RegExp("{EMAIL}","g"),email));
							res.send({
								status			: 	STATUS_SUCCESS,
								redirect_url	: 	WEBSITE_ADMIN_URL+"forgot-password",
								message			:	res.__("admin.user.receive_email_with_link").replace(RegExp("{EMAIL}","g"),email),
							});
						}
					});
			
			}catch(e){
				/** Send error response **/
				res.send({
					status	: 	STATUS_ERROR,
					message	:	[{"param":"email","msg":res.__("admin.system.something_going_wrong_please_try_again")}],
				});
			}
		}else{
			/** Render forgot password page*/
			res.render("forgot_password");
		}
    };// end forgotPassword()

	/**
	 * Function for reset password
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.resetPassword = (req, res,next)=>{
		if(req.query &&  typeof req.query.validate_string !== typeof undefined  && req.query.validate_string !=""){
			if(isPost(req)){
				let validateString	= (req.body.validate_string) ? req.body.validate_string : "";
				if (validateString != "") {
					
					let password	= (req.body.password)	? req.body.password			:	"";
					bcryptPasswordGenerate(password).then(function(bcryptPassword) {	
			
					


						let newPassword	= bcryptPassword;

						try{
							const users = db.collection(TABLE_USERS);
							users.findOne({
									forgot_password_validate_string	: validateString,
									user_role_id					: {$nin:[RIDER_USER_ROLE_ID,DRIVER_USER_ROLE_ID]}
								},
								{projection: {
									_id:1,full_name:1
								}},(err, result)=>{
									if (result) {
										try{
											/** update password*/
											users.updateOne({
													_id : ObjectId(result._id)
												},
												{
													$set: {
														password 	: 	newPassword,
														modified	: 	getUtcDate()
													},
													$unset : {
														forgot_password_validate_string : 1	
													}
												},(err,updateResult)=>{
													/** send Success response **/
													req.flash(STATUS_SUCCESS,res.__("admin.user.your_password_has_been_reset_successfully"));
													res.send({
														status			:	STATUS_SUCCESS,
														redirect_url	:	WEBSITE_ADMIN_URL+"login",
														message			:	res.__("admin.user.your_password_has_been_reset_successfully"),
													});
												}
											)
										}catch(e){
											/** Send error response **/
											res.send({
												status:STATUS_ERROR,
												message:[{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}],
											});
										}
									}else{
										/** Send error response **/
										res.send({
											status:STATUS_ERROR,
											message:[{"param":"confirm_password","msg":res.__("admin.user.link_expired_or_wrong_link")}],
										});
									}
								}
							);
						}catch(e){
							/** Send error response **/
							res.send({
								status:STATUS_ERROR,
								message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
							});
						}
					
					}).catch(next);	
				
				}else{
					/** Send error response **/
					res.send({
						status:STATUS_ERROR,
						message:[{"param":"confirm_password","msg":res.__("admin.user.link_expired_or_wrong_link")}],
					});
				}
			}else{
				try{
					/** Get user details **/
					let validateString	= (req.query.validate_string) ? req.query.validate_string :"";
					const users 		= db.collection(TABLE_USERS);
					users.findOne({
							forgot_password_validate_string : validateString,
						},
						{projection: {_id:1,full_name:1}},(err, result)=>{
							if(result) {
								/** Render reset password page **/
								res.render("reset_password",{
									validate_string : validateString
								});
							}else{
								/** Send error response **/
								req.flash(STATUS_ERROR,res.__("admin.user.link_expired_or_wrong_link"));
								res.redirect(WEBSITE_ADMIN_URL+"login");
							}
						}
					);
				}catch(e){
					/** Send error response **/
					req.flash(STATUS_ERROR,res.__("admin.user.link_expired_or_wrong_link"));
					res.redirect(WEBSITE_ADMIN_URL+"login");
				}
			}
		}else{
			/** Send error response **/
			req.flash("error",res.__("admin.user.link_expired_or_wrong_link"));
			res.redirect(WEBSITE_ADMIN_URL+"login");
		}
	};//End resetPassword()

	/********************************* ADMIN Section End *********************/

	/**
	 * Function for get list of users
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.getUserList = (req, res)=>{
		let statusType	= (req.params.type)			?	req.params.type			:"";
		let userType	= (req.params.user_type)	? 	req.params.user_type	:"";
		
		if(!FRONT_USER_TYPE[userType]){
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			return;
		}	
			
		if(isPost(req)){
			let limit			= (req.body.length) 		? parseInt(req.body.length) 		: ADMIN_LISTING_LIMIT;
			let skip			= (req.body.start)  		? parseInt(req.body.start)  		: DEFAULT_SKIP;
			let fromDate 		= (req.body.fromDate) 	 	? req.body.fromDate 				: "";
			
			let toDate 			= (req.body.toDate) 	 	? req.body.toDate 					: "";
			
			let statusSearch	= (req.body.status_search)	? parseInt(req.body.status_search)	: "";
			const collection	= db.collection(TABLE_USERS);
			

			/** Configure DataTable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				consoleLog(dataTableConfig)
				/** Set conditions **/
				let commonConditions = {
					is_deleted		: 	NOT_DELETED,
					user_role_id	:  (FRONT_USER_ROLE_IDS[userType]),
				};
			//	dataTableConfig.sort_conditions  =  { full_name: 1 };
				exportCommonConditions	=	dataTableConfig.conditions;
				exportFilterConditions 	=	dataTableConfig.conditions;
			//	exportSortConditions	=	(dataTableConfig.sort_conditions)? dataTableConfig.sort_conditions : { full_name: 1 };

				/** Conditions for date */
				if (fromDate != "" && toDate != "") {
					dataTableConfig.conditions["created"] = {
						$gte 	: newDate(fromDate),
						$lte 	: newDate(toDate),
					}
				}
				
				/** Conditions for search using status*/
				if (statusSearch != "") {
					switch(statusSearch){
						case SEARCHING_ACTIVE:
							dataTableConfig.conditions["active"] 		= ACTIVE;
						break;

						case SEARCHING_DEACTIVE:
							dataTableConfig.conditions["active"] 		= DEACTIVE;
						break;

						case SEARCHING_VERIFIED:
							dataTableConfig.conditions["is_email_verified"] 	= VERIFIED;
						break;

						case SEARCHING_NOT_VERIFIED:
							dataTableConfig.conditions["is_email_verified"] 	= NOT_VERIFIED;
						break;
						
						case MOBILE_SEARCHING_VERIFIED:
							dataTableConfig.conditions["is_mobile_verified"] 	= VERIFIED;
						break;

						case MOBILE_SEARCHING_NOT_VERIFIED:
							dataTableConfig.conditions["is_mobile_verified"] 	= NOT_VERIFIED;
						break;
					}
				}
			
			
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				
				async.parallel([
					(callback)=>{


						collection.aggregate([
							{
								$match : dataTableConfig.conditions
							},
							{
								$lookup : {
								"from" 			: TABLE_POSTS,
								"localField"	: "_id",
								"foreignField"	: "user_id",
								"as" 			: "post_details"
							}},
							
							
							{
								$project : {
									_id					:	1,
									wallet_balance		:	1,
									full_name			:	1,
									email				:	1,
									mobile_number		:	1,
									active				:	1,
									is_verified			:	1,
									created				:	1,
									is_deleted			:	1,
									user_role_id		:	1,
									is_email_verified	:	1,
									is_mobile_verified	:	1,
									is_expired			:	1,
									created				:	1,
									created_date		: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
									post_count			: {$size:"$post_details"},
								
									
									
								
								}
								
							},
							{'$match':	dataTableConfig.conditions},
							{ '$sort': dataTableConfig.sort_conditions },
                            { '$skip': skip },
                             { '$limit': limit },
							
						]).toArray((err, result)=>{

								consoleLog("result is ");
								consoleLog(result);
						/** Get list of user's **/
						// collection.find(dataTableConfig.conditions,
						// 	{projection: {
						// 		_id:1,
						// 		wallet_balance:1,
						// 		full_name:1,
						// 		email:1,
						// 		mobile_number:1,
						// 		active:1,
						// 		is_verified:1,
						// 		created:1,
						// 		is_deleted:1,
						// 		user_role_id:1,
						// 		is_email_verified:1,
						// 		is_mobile_verified:1
						// 	}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err, result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in users collection **/
						collection.countDocuments(commonConditions,(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records couting in users **/
						collection.countDocuments(dataTableConfig.conditions,(err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err,response)=>{
					/** Send response **/
					res.send({
						status			: (!err) ? STATUS_SUCCESS : STATUS_ERROR,
						draw			: dataTableConfig.result_draw,
						data			: (response[0]) ? response[0] : [],
						recordsFiltered	: (response[2]) ? response[2] : 0,
						recordsTotal	: (response[1]) ? response[1] : 0
					});
				});
			});
		}else{
			const collectionUser	= db.collection(TABLE_USERS);
			
			collectionUser.aggregate([	
				{
					$match : {
						is_deleted : DEACTIVE
					}
				},{
					$project: { full_name: 1, _id: 0 }
				},
				{ $unionWith: { coll: "admin_roles", pipeline: [ { $project: { role_name: 1, _id: 0 } } ]} }
			]).toArray((err,result)=>{
				
			
			
				
				consoleLog(result)
				/** render listing page **/
				req.breadcrumbs(BREADCRUMBS["admin/users/list"]);
				res.render("list",{
					status_type			: 	statusType,
					user_type			: 	userType,
					dynamic_variable	: 	toTitleCase(userType),
					dynamic_url			: 	userType,
				});
			
			});
		}
	};//End getUserList()
	
	
	
	/**
	 * Function for add  user's Detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addUser = (req,res,next)=>{
	
		let userType 	= 	(req.params.user_type) 	?	req.params.user_type:"";
		if(!FRONT_USER_TYPE[userType]){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			return;
		}
		
		
		if(isPost(req)){
			req.body.id						=	(req.params.id) 	? 	ObjectId(req.params.id)		:	ObjectId();
			req.body.created_by	 			=	(req.session.user) 	? 	req.session.user._id 		:	"";
			req.body.user_type	 			=	userType;
			req.body.user_role_id	 		=	FRONT_USER_ROLE_IDS[userType];
			req.body.request_from 			=	REQUEST_FROM_ADMIN;
			req.body.is_mobile_verified 	=	VERIFIED;
			req.body.is_email_verified 		=	VERIFIED;
			consoleLog("Add user function Before service called");
			/** Call user service function to add rider user**/
			userService.addUser(req,res,next).then(response=>{
				
				if(response.status == STATUS_ERROR_INVALID_ACCESS){
					/** Send error response  **/
					res.send({
						status		: STATUS_ERROR,
						redirect_url: WEBSITE_ADMIN_URL+"users/"+userType,
						message		: res.__("admin.system.something_going_wrong_please_try_again"),
					});
				}
				/** Form validation Errors**/
				if(response.status == STATUS_ERROR_FORM_VALIDATION){
					/** parse Validation array  **/
					let formErrors = (response.errors) ? response.errors : {};
					let errors = parseValidation(formErrors,req);
					/** Send error response **/
					if(errors)return res.send({status : STATUS_ERROR, message	: errors});
				}
				
			
				/** Success Return**/
				if(response.status == STATUS_SUCCESS){
					let lastInsertId 	=	(response.result.lastInsertId) ? response.result.lastInsertId : "";
					let userTypeTitle 	=	(response.result.userTypeTitle) ? response.result.userTypeTitle : "";
					let email 			=	(response.result.email) ? response.result.email : "";
					let mobileNumber 	=	(response.result.mobileNumber) ? response.result.mobileNumber : "";
					let fullName 		=	(response.result.fullName) ? response.result.fullName : "";
					let password 		=	(response.result.password) ? response.result.password : "";
					let messageStr =  res.__("admin.user.user_has_been_added_successfully",userTypeTitle);

					if(email != ""){
						/******* Send mail to user *******/
						/** Set options for send email **/
						let emailOptions = {
							to 			: email,
							action 		: "add_user",
							rep_array 	: [fullName,email,password]
						};
						/** Send email **/
						sendMail(req,res,emailOptions);
						/******* Send mail to user *******/
					}
				
					/***Start Send Notification**/
					let notificationMessageParams	= [fullName];
					let notificationOptions 		= {
						notification_data : {
							notification_type	: NOTIFICATION_ADMIN_RIDER_USER_REGISTER,
							message_params		: notificationMessageParams,
							parent_table_id		: ADMIN_ID,
							user_id				: lastInsertId,
							user_ids			: [lastInsertId],
							user_role_id		: SUPER_ADMIN_ROLE_ID,
							role_id				: SUPER_ADMIN_ROLE_ID,
							extra_parameters	: {
								user_id	: ObjectId(lastInsertId),
							}
						}
					};
					insertNotifications(req,res,notificationOptions).then(notificationResponse=>{ });
					
					consoleLog("Print Success msg now");

					req.flash(STATUS_SUCCESS,messageStr);
					res.send({
						status		: STATUS_SUCCESS,
						redirect_url: WEBSITE_ADMIN_URL+"users/"+userType,
						message		: messageStr,
					});
					
				}
			});
		}else{
			let options = {
				collections : [
					{
						collection	: "country_code",
						columns		: ["dial_code","dial_code"],
					},
					{
						collection 	: 	TABLE_COUNTRY,
						columns 	: 	["_id","country_name"],
						conditions	:	{ status :	ACTIVE }
					}
				]
			};
			getDropdownList(req,res,options).then(response=>{
				consoleLog(response);
				/** Render add page **/
				req.breadcrumbs(BREADCRUMBS["admin/users/add"]);
				res.render("add_edit",{
					user_type			: 	userType,
					dynamic_variable	: 	toTitleCase(userType),
					dynamic_url			: 	userType,
					country_code_list	:	(response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",	
					country_list		:	(response && response.final_html_data && response.final_html_data["1"])	?	response.final_html_data["1"]:"",
				});	
			});	
		}
	};//End addUser()
	
	
	
	/**
	 * Function for add or edit user's Detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editUser = (req,res,next)=>{
		let userType 	= 	(req.params.user_type) 	?	req.params.user_type:"";
		let isEditable	=	(req.params.id)			?	true :false;
		let userId		=	(req.params.id) 			? 	ObjectId(req.params.id)		:ObjectId();			
			
		if(!FRONT_USER_TYPE[userType]){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			return;
		}
		
		if(isPost(req)){
			
		
			/** Sanitize Data **/
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let password		=	(req.body.password)			? 	req.body.password			:"";			
			let confirmPassword	=	(req.body.confirm_password) ? 	req.body.confirm_password	:"";			
				
			req.body.id						=	(req.params.id) 	? 	ObjectId(req.params.id)		:	ObjectId();
			req.body.created_by	 			=	(req.session.user) 	? 	req.session.user._id 		:	"";
			req.body.user_type	 			=	userType;
			req.body.user_role_id	 		=	FRONT_USER_ROLE_IDS[userType];
			req.body.request_from 			=	REQUEST_FROM_ADMIN;
			console.log(req.body);
			
			userService.editUser(req,res,next).then(response=>{
				consoleLog("response from service is ");
			//	consoleLog(response);
				if(response.status == STATUS_ERROR_INVALID_ACCESS){
					/** Send error response  **/
					res.send({
						status		: STATUS_ERROR,
						redirect_url: WEBSITE_ADMIN_URL+"users/"+userType,
						message		: res.__("admin.system.something_going_wrong_please_try_again"),
					});
				}
				/** Form validation Errors**/
				if(response.status == STATUS_ERROR_FORM_VALIDATION){
					/** parse Validation array  **/
					let formErrors = (response.errors) ? response.errors : {};
					let errors = parseValidation(formErrors,req);
					/** Send error response **/
					if(errors)return res.send({status : STATUS_ERROR, message	: errors});
				}
				
			consoleLog(response);
				/** Success Return**/
				if(response.status == STATUS_SUCCESS){
					let lastInsertId 	=	(response.result.lastInsertId) ? response.result.lastInsertId : "";
					let userTypeTitle 	=	(response.result.userTypeTitle) ? response.result.userTypeTitle : "";
					let email 			=	(response.result.email) ? response.result.email : "";
					let mobileNumber 	=	(response.result.mobileNumber) ? response.result.mobileNumber : "";
					let fullName 		=	(response.result.fullName) ? response.result.fullName : "";
					let password 		=	(response.result.password) ? response.result.password : "";
					let messageStr =  res.__("admin.user.user_details_has_been_updated_successfully",userTypeTitle);
					/* if(email != ""){
						
						let emailOptions = {
							to 			: email,
							action 		: "add_user",
							rep_array 	: [fullName,mobileNumber,password]
						};
						
						sendMail(req,res,emailOptions);
						
					} */
				
					/***Start Send Notification**/
					let notificationMessageParams	= [fullName];
					let notificationOptions 		= {
						notification_data : {
							notification_type	: NOTIFICATION_ADMIN_RIDER_USER_REGISTER,
							message_params		: notificationMessageParams,
							parent_table_id		: ADMIN_ID,
							user_id				: lastInsertId,
							user_ids			: [lastInsertId],
							user_role_id		: SUPER_ADMIN_ROLE_ID,
							role_id				: SUPER_ADMIN_ROLE_ID,
							extra_parameters	: {
								user_id	: ObjectId(lastInsertId),
							}
						}
					};
					//insertNotifications(req,res,notificationOptions).then(notificationResponse=>{ });
					consoleLog("Edit notification done");
					req.flash(STATUS_SUCCESS,messageStr);
					res.send({
						status		: STATUS_SUCCESS,
						redirect_url: WEBSITE_ADMIN_URL+"users/"+userType,
						message		: messageStr,
					});
					
				}
			});
		

			
			
		}else{
				
			
				/** Get user details **/
				getUserDetails(req, res,next).then(response=>{
					if(response.status != STATUS_SUCCESS){
						/** Send error response **/
						req.flash(STATUS_ERROR,response.message);
						res.redirect(WEBSITE_ADMIN_URL+"users/"+userType);
						return;
					}
					let country_code = response.result.phone_country_code;
					let countryId 	 = response.result.country_id;
					//console.log("country_code "+country_code)
					let options = {
						collections : [
						{
							collection : "country_code",
							columns : ["dial_code","dial_code"],
							selected	:	[country_code],
						},
						{
							collection 	: 	TABLE_COUNTRY,
							columns 	: 	["_id","country_name"],
							conditions	:	{ status :	ACTIVE },
							selected	:	[countryId],
						}
						
						
						]
					};
					getDropdownList(req,res,options).then(responseData=>{
						/** Render edit page **/
						req.breadcrumbs(BREADCRUMBS["admin/users/edit"]);
						res.render("edit",{
							country_code_list	:	(responseData && responseData.final_html_data && responseData.final_html_data["0"])	?	responseData.final_html_data["0"]:"",
							country_list		:	(responseData && responseData.final_html_data && responseData.final_html_data["1"])	?	responseData.final_html_data["1"]:"",
							result 			: 	(response.result)	?	response.result :{},
							user_type		: 	userType,
							dynamic_variable: 	toTitleCase(userType),
							dynamic_url		: 	userType,
							is_editable		: 	isEditable,
							user_id			: userId,			
			
						});
					});
				}).catch(next);
			
		}
	};//End addEditUser()
	
	/**
	 * Function for get user's Detail
	 *
	 * @param req	As Request Data
	 * @param res 	As Response Data
	 *
	 * @return json
	 */
	let getUserDetails = (req,res,next)=>{
		return new Promise(resolve=>{
			let userId		=	(req.params.id)		 	?	req.params.id		 :"";
			let userType 	= 	(req.params.user_type) 	? 	req.params.user_type :"";
			
			/** Get user details **/
			const users	= db.collection(TABLE_USERS);
			users.findOne({
					_id 			: ObjectId(userId),
					user_role_id	: FRONT_USER_ROLE_IDS[userType],
					is_deleted		: NOT_DELETED,
				},(err, result)=>{
					if(err) return next(err);

					if(!result){
						/** Send error response **/
						let response = {
							status	: STATUS_ERROR,
							message	: res.__("admin.system.invalid_access")
						};
						return resolve(response);
					}
					
					/** Set options for append image full path **/
					let options = {
						"file_url" 			: 	USERS_URL,
						"file_path" 		: 	USERS_FILE_PATH,
						"result" 			: 	[result],
						"database_field" 	: 	"profile_image"
					};

					/** Append image with full path **/
					appendFileExistData(options).then(fileResponse=>{
						/** Send success response **/
						let response = {
							status	: STATUS_SUCCESS,
							result	: (fileResponse && fileResponse.result && fileResponse.result[0])	?	fileResponse.result[0]	:{}
						};
						resolve(response);
					});
				}
			);
		});
	};//End getUserDetails()

	/**
	 * Function for view user's Detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render
	 */
	this.viewUserDetails = (req,res,next)=>{
		let userId			=	(req.params.id)				? 	req.params.id				:"";
		let userType 		= 	(req.params.user_type) 		?	req.params.user_type		:"";
		let userTypeTitle	=	(FRONT_USER_TYPE[userType])	?	FRONT_USER_TYPE[userType] 	:"";
		
		if(!FRONT_USER_TYPE[userType]){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			return;
		}
		let conditions = {
			_id 			: ObjectId(userId),
			user_role_id	: FRONT_USER_ROLE_IDS[userType],
		}
		const users = db.collection(TABLE_USERS);
		users.aggregate([
			{$match :conditions},
			{
				$lookup:{
					from : TABLE_COUNTRY,
					let :{countryId : "$country_id"},
					pipeline:[
						{$match:{
							$expr:{
								$and:[{$eq:["$_id","$$countryId"]}]
							}
						}}
					],
					as :"countryDetail"
				}
			},
			{
				$lookup:{
					from : TABLE_STATES,
					let :{stateId : "$state_id"},
					pipeline:[
						{$match:{
							$expr:{
								$and:[{$eq:["$_id","$$stateId"]}]
							}
						}}
					],
					as :"stateDetail"
				}
			},
			{
				$lookup:{
					from : TABLE_CITY,
					let :{cityId : "$city_id"},
					pipeline:[
						{$match:{
							$expr:{
								$and:[{$eq:["$_id","$$cityId"]}]
							}
						}}
					],
					as :"cityDetail"
				}
			},
			{
				$lookup:{
					from : TABLE_POSTS,
					let :{userId : "$_id"},
					pipeline:[
						{$match:{
							$expr:{
								$and:[{$eq:["$user_id","$$userId"]},
								{ $eq: ["$is_deleted", DEACTIVE] },
								]
							}
						}}
					],
					as :"postDetail"
				}
			},

			{$project:
				{
				_id: 1,
				first_name: 1,
				last_name: 1,
				full_name :1,
				date_of_birth	  :1,
				age	  :1,
				email: 1,
				mobile_number: 1,
				wallet_balance :1,
				active: 1,
				is_email_verified: 1,
				is_mobile_verified: 1,
				is_admin_approved: 1,
				created: 1,
				is_verified :1,
				postal_code :1,
				profile_image :1,
				country_name: { $arrayElemAt:["$countryDetail.country_name",0] },
				state_name: { $arrayElemAt:["$stateDetail.state_name",0] },
				city_name: { $arrayElemAt:["$cityDetail.city_name",0] },
				post_cout:{$size:"$postDetail"},
			}}	
		]).toArray((err,result)=>{
			if(err) return next(err);

			if(result.length <= 0){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				return res.redirect(WEBSITE_ADMIN_URL+"users/"+userType);
			}
			
			if(result.is_deleted == DELETED){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.user.this_user_is_deleted_from_the_system",userTypeTitle.toLowerCase()));
				res.redirect(WEBSITE_ADMIN_URL+"users/"+userType);
				return;
			}
			/** Set options for append image full path **/
			let options = {
				"file_url" 			: 	USERS_URL,
				"file_path" 		: 	USERS_FILE_PATH,
				"result" 			: 	[result[0]],
				"database_field" 	: 	"profile_image"
			};

			/** Append image with full path **/
			appendFileExistData(options).then(fileResponse=>{
				
				/** Render view page*/
				req.breadcrumbs(BREADCRUMBS["admin/users/view"]);
				res.render("view",{
					//result				:	result[0],
					result	: (fileResponse && fileResponse.result && fileResponse.result[0])	?	fileResponse.result[0]	:{},
					user_type			:	userType,
					dynamic_variable	: 	toTitleCase(userType),
					dynamic_url			: 	userType,
				});
			
			});
		
		});
	};//End viewUserDetails()







	/**
	 * Function for update user's status
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return null
	 */
	this.updateUserStatus = (req,res,next)=>{
		let userId			=	(req.params.id) 			? 	req.params.id 				:"";
		let userStatus		= 	(req.params.status) 		? 	req.params.status	 		:"";
		let statusType		= 	(req.params.status_type)	? 	req.params.status_type		:"";
		let userType		= 	(req.params.user_type) 		? 	req.params.user_type 		:"";
		let userTypeTitle	=	(FRONT_USER_TYPE[userType])	?	FRONT_USER_TYPE[userType] 	:"";
		
		if(!userId || !statusType ||  !FRONT_USER_TYPE[userType] || (statusType != ACTIVE_INACTIVE_STATUS && statusType != VERIFIED_STATUS)){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			return;
		}

		/** Set update data **/
		let updateData = {
			$set : {
				modified  : getUtcDate()
			}			
		};
		
		if(statusType == ACTIVE_INACTIVE_STATUS){
			updateData["$set"]["active"] =	(userStatus==ACTIVE) ? DEACTIVE :ACTIVE;
		}else if(statusType == VERIFIED_STATUS){
			updateData["$unset"] 					=	{};
			updateData["$set"]["is_verified"] 		=	VERIFIED;
			updateData["$unset"]["validate_string"] =	1;
		} 	

		/** Update user status*/
		const users = db.collection(TABLE_USERS);
		users.updateOne({_id : ObjectId(userId)},updateData,(err,result)=>{
			if(err) return next(err);
			
			/** send mail and notification *
			if(statusType == ACTIVE_INACTIVE_STATUS){
				/**Mail send to user deactive account *
				
				users.findOne({_id : ObjectId(userId)},(err,result)=>{
					let email		=	(result.email)		?	result.email		:	"";
					let fullName	=	(result.full_name)	?	result.full_name	:	"";
					let statusMsg		=	(userStatus==ACTIVE)?	"deactive"			:	"active";
					if(email!=""){
						/** Set options for send email **
						let emailOptions = {
							to 			:	email,
							action 		:	"rider_account_active_deactive_admin",
							rep_array 	:	[fullName,statusMsg]
						};
						/** Send Mail*
						sendMail(req,res,emailOptions);
					}
					
					/***Start Send Notification**
						let notificationMessageParams	= [fullName,statusMsg];
						let notificationOptions 		= {
							notification_data : {
								notification_type	: NOTIFICATION_RIDER_ACCOUNT_ACTIVE_DEACTIVE_ADMIN,
								message_params		: notificationMessageParams,
								parent_table_id		: ADMIN_ID,
								user_id				: userId,
								user_ids			: [userId],
								user_role_id		: SUPER_ADMIN_ROLE_ID,
								role_id				: SUPER_ADMIN_ROLE_ID,
								extra_parameters	: {
									user_id	: ObjectId(userId),
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
						/***End Send Notification**
				});
			}*/
			
			
			/** Send success response **/
			let message = (statusType == VERIFIED_STATUS) ? res.__("admin.user.user_has_been_verified_successfully",userTypeTitle) :res.__("admin.user.user_status_has_been_updated_successfully",userTypeTitle);
			req.flash(STATUS_SUCCESS,message);
			res.redirect(WEBSITE_ADMIN_URL+"users/"+userType);
		});
	};//End updateUserStatus()

	/**
	 * Function for delete user
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return null
	 */
	this.deleteUser = (req,res,next)=>{
		let userId 			= 	(req.params.id) 			? 	req.params.id 				:"";
		let userType		= 	(req.params.user_type) 		? 	req.params.user_type 		:"";
		let userTypeTitle	=	(FRONT_USER_TYPE[userType])	?	FRONT_USER_TYPE[userType] 	:"";
		
		if(!FRONT_USER_TYPE[userType]){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			return;
		}
		
		/** Delete user account **/
		const users = 	db.collection(TABLE_USERS);
		users.updateOne(
			{_id : ObjectId(userId)},
			{$set : {
				is_deleted 	: DELETED,
				deleted_at	: getUtcDate(),
				modified	: getUtcDate()
			}},(err,result)=>{
				if(err) return next(err);

				/** Send success response **/
				req.flash(STATUS_SUCCESS,res.__("admin.user.user_deleted_successfully",userTypeTitle));
				res.redirect(WEBSITE_ADMIN_URL+"users/"+userType);
			}
		);
	};//End deleteUser()
	
	/**
	 * Function to send new login credentials to user
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return null
	 */
	this.sendLoginCredentials = (req,res,next)=>{
		let userId 		= 	(req.params.id) 		? req.params.id 		:"";
		let userType	= 	(req.params.user_type) 	? req.params.user_type 	:"";
		
		if(!FRONT_USER_TYPE[userType]){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			return;
		}
		
		/** Get user details **/
		getUserDetails(req, res,next).then(response=>{
			if(response.status != STATUS_SUCCESS || !response.result){
				/** Send error response  **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"users/"+userType);
				return;
			}
			
			/** Generate random string for password **/
			getRandomString(req,res,null).then(randomResponse=>{
				if(randomResponse.status != STATUS_SUCCESS){
					/** Send error response  **/
					req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
					res.redirect(WEBSITE_ADMIN_URL+"users/"+userType);
					return;
				}
				
				/** Generate new password **/
				let password 	=	(randomResponse.result)	? randomResponse.result	:"";
				let newpassword	=	 crypto.createHash('md5').update(password).digest("hex");

				/** Update password **/
				const users = db.collection(TABLE_USERS);
				users.updateOne({
						_id : ObjectId(userId)
					},
					{$set : {
						password : newpassword,
						modified : getUtcDate()
					}},(err,result)=>{
						if(err) return next(err);
						
						/************ Send reset password mail *************/
							let userResult 	=	response.result;
							let userEmail	= 	(userResult.email)		? userResult.email		:"";
							let userName	= 	(userResult.full_name)	? userResult.full_name	:"";
							let mobileNumber	= 	(userResult.mobile_number)	? userResult.mobile_number	:"";
							/** Set requested data for send email **/
							let emailRequestedData = {
								to 			:	userEmail,
								action 		:	"send_login_credentials",
								rep_array 	:	[userName,userEmail,password]
							};

							/** Send email **/
							sendMail(req,res,emailRequestedData);
						/************ Send reset password mail *************/	

						req.flash(STATUS_SUCCESS,res.__("admin.user.login_credentials_send_successfully"));
						res.redirect(WEBSITE_ADMIN_URL+"users/"+userType);
					}
				);
			}).catch(next);
		}).catch(next);
	};//End sendLoginCredentials()
	
	
	
	/**
	 * Function for veriffy email or mobile
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return null
	 */
	this.verifyEmailOrMObile = (req,res,next)=>{
		let userId			=	(req.params.id) 			? 	req.params.id 				:"";
		let verifyType		= 	(req.params.verify_type) 	? 	req.params.verify_type	 	:"";
		let pageType		= 	(req.params.page_type)		? 	req.params.page_type		:"";
		let userType		= 	(req.params.user_type) 		? 	req.params.user_type 		:"";
		
		if(!userId || !verifyType ||  pageType){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			return;
		}

		/** Set update data **/
		
		let updateData={}
		if(verifyType=='email'){
			var messageData='Email';
			updateData = {
				modified  			:	getUtcDate(),
				is_email_verified	:	VERIFIED,
			}
		}else{			
			var messageData='Mobile';
			updateData = {
				modified  			:	getUtcDate(),
				is_mobile_verified  :	VERIFIED,
			}
		}
		
		/** Get user details **/
		getUserDetails(req, res,next).then(response=>{
			
			if(response.status != STATUS_SUCCESS || !response.result){
				/** Send error response  **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"users/rider");
				return;
			}
			
			/************ Send account verify mail to driver *************/
			let userResult 	=	response.result;
			let userEmail	= 	(userResult.email)			? userResult.email		:"";
			let userName	= 	(userResult.full_name)		? userResult.full_name	:"";
			let mobileNumber= 	(userResult.mobile_number)	? userResult.mobile_number	:"";
			
			
			/** Set requested data for send email **/
			if(verifyType=='email'){
				let emailRequestedData = {
					to 			:	userEmail,
					action 		:	"send_rider_email_verify_by_admin",
					rep_array 	:	[userName]
				};
				sendMail(req,res,emailRequestedData);
			}			
			/************ Send account verify mail to driver *************/	
						
			/** Update user status*/
			const users = db.collection(TABLE_USERS);
			users.updateOne({ _id : ObjectId(userId)},
			{$set	: updateData},
			(err,result)=>{
				if(err) return next(err);
				
				/** Send success response **/
				req.flash(STATUS_SUCCESS, res.__("admin.user.user_has_been_verified_successfully",messageData));				
				res.redirect(WEBSITE_ADMIN_URL+"users/rider");				
			});
						
		}).catch(next);
	};//End verifyEmailOrMObile()
	
	
	/**
	 *  Function for export payment transactions details
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return null
    */
    this.exportData 	= (req,res,next)=>{
		let conditions	=	exportCommonConditions;
		
		/** Get users details **/
		const users	= db.collection(TABLE_USERS);
		users.find(conditions,{projection: {_id:1,wallet_balance:1,full_name:1,email:1,mobile_number:1,active:1,is_verified:1,created:1,is_deleted:1,user_role_id:1,is_email_verified:1,is_mobile_verified:1}}).sort(exportSortConditions).toArray((err,result)=>{
			if(err) return next(err);

			/**Set variable for export */
			let temp = [];

			/** Define excel heading label **/
			let commonColls	= [
				res.__("admin.user.name"),
				res.__("admin.user.email"),
				res.__("admin.user.phone_number"),
				res.__("admin.user.wallet_balance"),
				res.__("admin.user.status"),
				res.__("admin.user.email_status"),
				res.__("admin.user.mobile_status"),
				res.__("admin.user.registered_date"),
			];

			if(result && result.length > 0){
				result.map(records=>{
					let buffer = [
						(records.full_name)		  				  ? records.full_name :"",
						(records.email)			 				  ? records.email	 :"",
						(records.mobile_number)	  				  ? records.mobile_number : 0,
						(records.wallet_balance)  				  ? records.wallet_balance :0,
						(records.active == ACTIVE) 				  ? res.__("admin.system.active")    :res.__("admin.system.inactive"),
						(records.is_email_verified == VERIFIED)   ? res.__("admin.user.user_email_verified")    : res.__("admin.user.user_email_not_verified"),
						(records.is_mobile_verified ==VERIFIED )  ? res.__("admin.user.user_mobile_verified")     : res.__("admin.user.user_mobile_not_verified"),
						(records.created)		  ? newDate(records.created,DATE_TIME_FORMAT_EXPORT) :""
					];
					temp.push(buffer);
				});
			}

			/**  Function to export data in excel format **/
			exportToExcel(req,res,{
				file_prefix 	: FRONT_USER_TYPE[RIDER_USER_TYPE]+"_Report",
				heading_columns	: commonColls,
				export_data		: temp
			});
		});
	};// end exportData()
	
	this.loginSubAdmin  = (req,res,next,callback)=>{
		let validateString	= (req.params.validate_string)			?	req.params.validate_string			:"";
		
		/** Delete user Modules list Flag **/
		let userId  = (req.session && req.session.user && req.session.user._id) ? req.session.user._id : "";
		userModuleFlagAction(userId,"","delete");
		//req.session = null;
		res.clearCookie("adminLoggedIn");
		
		const users 	= db.collection(TABLE_USERS);
		
		users.findOne({
			is_deleted				:	NOT_DELETED,
			login_validate_string			: 	validateString,
			user_role_id	:	{$in : [FLEET_USER_ROLE_ID,CORPORATE_USER_ROLE_ID]},
		},{projection: {
			user_role_id:1,first_name: 1,last_name:1,full_name:1,email:1,active:1,created:1,is_mobile_verified:1,is_email_verified:1,is_admin_approved:1,company_name:1
		}},(err, resultData)=>{
			if(err) return next(err);
			
			if(!resultData){
				/** Send error response */
				res.redirect('/admin/dashboard');
			}
			
			/** Send success response **/
			req.session.user = resultData;
			var fullName = resultData.full_name;
			message =  res.__("front.user.you_are_logged_in", fullName),
			req.flash(STATUS_SUCCESS,message);
			req.flash(STATUS_SUCCESS,message);
			res.redirect('/admin/dashboard');
		})
	}
	
}
module.exports = new User();
