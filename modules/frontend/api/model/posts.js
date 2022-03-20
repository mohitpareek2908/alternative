const { ObjectId } = require('bson');

const postService = require(WEBSITE_SERVICES_FOLDER_PATH+'post_service');
function Posts() {

	Posts = this;
	var currentDate = String(getUtcDate().getDate()).padStart(2, '');
    


	 /** Function for Add Post 
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
      this.addPost = (req,res,next,callback)=>{
        

        let finalResponse = {};

        req.body = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let slug = (req.body.slug) ? req.body.slug : "";
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
       
            
        /**For check slug */
        if (slug == '' || userId == '') {
          
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    message: res.__("api.global.parameter_missing")

                }
            };
            return returnApiResult(req,res,finalResponse);
        }


		/** Call user service function to add rider user**/
		postService.addPost(req,res,next).then(response=>{
			
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
				
			
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							errors: "",
							result:{
							
							},
							message	:	res.__("post.post_registered_successfully_message")
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				}
		});	


      }






	/**
	 * Function to edit post
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json 
	 **/
	this.editPost = (req,res,next,callback)=>{
	      let finalResponse = {};

        req.body = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let slug = (req.body.slug) ? req.body.slug : "";
		let postSlug = (req.body.post_slug) ? req.body.post_slug : "";
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
       
            
        /**For check slug */
        if (slug == '' || userId == '' || postSlug == '') {
          
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    message: res.__("api.global.parameter_missing")

                }
            };
            return returnApiResult(req,res,finalResponse);
        }




	   /** Call user service function to add rider user**/
	 
	   postService.editPost(req,res,next).then(response=>{


		consoleLog("User response after update is ");
		consoleLog(response);
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
				let slug 			=    (response.result.slug) ? response.result.slug : "";

					/** Set conditions **/
					let conditions	=	{
						user_role_id	:	{$in : [ADULTS_USER_ROLE_ID,TEENS_USER_ROLE_ID,KIDS_USER_ROLE_ID]},
						is_deleted		:	NOT_DELETED,
						slug			:  slug
					};

					/** Set options data for get user details **/
					let userOptions = {
						conditions	:	conditions,
						fields		:	{facebook_id :0,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,modified:0}
					};

					/** Get user details **/
		getUserDetailBySlug(req, res, userOptions).then(userResponse => {

			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					errors: "",
					result:{
						user_id 		: lastInsertId,
						userData        : userResponse.result,
						image_url		: USERS_URL,
					//	mobile_otp 		: mobileOtpCode,
					//	email_otp  		: emailOtpCode,
					//	validate_string : validateString
					},
					message	:	res.__("front.system.user_details_has_been_updated_successfully")
				}
			};
			return returnApiResult(req,res,finalResponse);
		
		
		});
				

			
				
			}

	   });	
   }







    /** Function for View Post by user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
     this.viewPost = (req,res,next,callback)=>{
    
        let finalResponse = {};
        req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let slug            = (req.body.post_slug) ? req.body.post_slug : "";
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
                
        /**For check slug */
        if (slug == '' || userId == '')  {
          
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    message: res.__("api.global.parameter_missing")
                }
            };
            return returnApiResult(req,res,finalResponse);
        }
        const asyncParallel =	require('async/parallel');
		getPostDataBySlug(req, res, slug).then(postResponse => {
			console.log(postResponse);
			if (postResponse.status == STATUS_ERROR) {
				 finalResponse = {
					'data': {
						status: STATUS_ERROR,
						message: res.__("admin.system.something_going_wrong_please_try_again")
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
			const postCollection = db.collection(TABLE_POSTS);
			let postId					    =	(postResponse.result._id)				? 	postResponse.result._id			:"";
			let postResultData					=	(postResponse.result)				? 	postResponse.result			:"";
			let postType							=	(postResponse.result.post_type)				? 	postResponse.result.post_type			:"";
			
			let postUserId = (postResultData.user_id) ? postResultData.user_id : MONGO_ID;
			let currentPostData = (postResultData.created) ? postResultData.created : getUtcDate();
			asyncParallel({	
				get_post_data : (callback)=>{
					/** Get Post details **/
					
					
						let viewLogOtions= {
							post_id 			:	ObjectId(postId),
							user_id 		    :	ObjectId(userId),
							counter_stat 		:	ACTIVE
						};
						
						let viewCounteroptions= {
							post_id 			:	ObjectId(postId),
							counter_stat 		:	ACTIVE
						};
						
					  
						const postViewLog  = db.collection(TABLE_POST_VIEW_LOG); 
						
						postViewLog.findOne({ 
							post_id 			:	ObjectId(postId),
							user_id 		    :	ObjectId(userId) }, {}, (err, postData) => {

							//consoleLog(postData);
							if(!postData ){
								consoleLog("Add Entry in Post Log and Update Post View Counter in Post Table");

								addPostViewlog(req,res,viewLogOtions);
								updateViewCounter(req,res,viewCounteroptions);
							} else{
								consoleLog("Update Post View LOG posyt view counter onl;y");
								   
								updatePostViewlog(req,res,viewLogOtions);

							}
							
							/** Update Post view Counter **/
							let postDataNew = (postResponse.result) ? postResponse.result :{};
							
							postDataNew.date_ago 	=	getTimeAgo(postDataNew.created);
							callback(null, postDataNew);
							
						});

					
					
				},
				get_related_posts  : (callback)=>{
					
						
						let postData		=	(postResponse.result)				? 	postResponse.result			:{};
						
						let interestIds = (postData.interest_ids) ? postData.interest_ids : [];
						
						postCollection.aggregate([
							{
								$match : {
									interest_ids: { $in: interestIds },
									_id : { $ne: ObjectId(postId) },
									post_type : postType,
									is_deleted:NOT_DELETED 
								}
							},
							{
								$lookup:{
									from: TABLE_USERS,
									let: { userId: "$user_id" },
									pipeline: [
										{
											$match: {
												$expr: {
													$and: [
														{ $eq: ["$_id", "$$userId"] },
														{ $eq: ["$active", ACTIVE] },
													]
												},
											}
										},
										//{ $project: { "_id": 1, "full_name": 1,"profile_image":1} }
										
									],
									as: "user_details"
								}
							},
							{$project : {
								title : 1,
								description : 1,
								post_tags : 1,
								post_hashtags : 1,
								post_type : 1,
								privacy : 1,
								age_type : 1,
								interest_ids : 1,
								post_media : 1,
								thumbnail_image : 1,
								user_id : 1,
								post_view_count : 1,
								post_comment_count : 1,
								post_likes_count : 1,
								last_hour_views : 1,
								is_deleted : 1,
								status : 1,
								created : 1,
								slug : 1,
								user_name	:	{$arrayElemAt : ["$user_details.full_name",0]},
								user_profile_image	:	{$arrayElemAt : ["$user_details.profile_image",0]},
								user_slug	:	{$arrayElemAt : ["$user_details.slug",0]},
								
							}}
						
						]).sort({"created":SORT_DESC}).limit(RELATED_POSTS_LIMIT).toArray((postErr,postResult)=>{
							
							let finalResult = [];
							if(postResult && postResult.length > 0){
								
								finalResult = postResult.map(records => {
									records['day_ago'] = getTimeAgo(records.created);
									return records;
								});
								
								callback(null, finalResult);
							}else{
								callback(null, finalResult);
							}
						})
						
				
				},
				get_next_post_link : (callback)=>{

					postCollection.find({
						is_deleted:NOT_DELETED ,
						user_id : ObjectId(postUserId),
						_id : { $ne: ObjectId(postId) }, 
						created : { $gte : currentPostData }
					},{}).sort({"created":SORT_DESC}).limit(ACTIVE).toArray((err,result)=>{
						let nextPostSlug  = "";
						if(result && result.length > 0){
							
							let nextPostData = (result) ? result[0] : {};
							if(Object.keys(nextPostData).length > 0){
								
								nextPostSlug  = (nextPostData.slug) ? nextPostData.slug : "";
								
							}
							
						}
						callback(null, nextPostSlug);
						
					});
					
				},
				get_previous_post_link : (callback)=>{

					postCollection.find({
						is_deleted:NOT_DELETED ,
						user_id : ObjectId(postUserId),
						_id : { $ne: ObjectId(postId) }, 
						created : { $lte : currentPostData }
					},{}).sort({"created":SORT_DESC}).limit(ACTIVE).toArray((err,result)=>{
						let previousPostSlug  = "";
						if(result && result.length > 0){
							
							let previousPostData = (result) ? result[0] : {};
							if(Object.keys(previousPostData).length > 0){
								
								previousPostSlug  = (previousPostData.slug) ? previousPostData.slug : "";
								
							}
							
						}
						callback(null, previousPostSlug);
						
					});
					
				},
				check_post_user_following : (callback)=>{
					const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
					usersFollower.findOne({
						user_id : ObjectId(postUserId),
						followed_by : ObjectId(userId),
						action_type : FOLLOW_ACTION_TYPE,
						//is_approved : ACTIVE,
					},{},(findErr,findResult)=>{
						isfollowing = DEACTIVE;
						findResult = findResult ? findResult : {};
						if(Object.keys(findResult).length > 0){
							isApproved	=	(findResult.is_approved) ? findResult.is_approved : DEACTIVE;
							if(isApproved == ACTIVE)
							{
								isfollowing = ACTIVE; 
							}else if(isApproved == DEACTIVE)
							{
								isfollowing = FOLLOW_REQUEST_PENDING; 
							}
						}
						callback(null, isfollowing);
					})
				},

				post_history : (callback)=>{
					/** Get Post details **/

					
					
					let insertPostHistory = {
						"post_id":ObjectId(postId),
						"user_id":ObjectId(userId),
						"status":ACTIVE,
						"is_deleted":DEACTIVE,	
						"created": getUtcDate()
						};
					
						

					const postHistory  = db.collection(TABLE_POSTS_HISTORY); 

					postHistory.findOneAndUpdate({ "post_id": ObjectId(postId),"user_id":ObjectId(userId)},  {
						$set: { last_viewed_on:getUtcDate(),modified:getUtcDate() },
						$setOnInsert: insertPostHistory
					 }, { upsert: true },(err,updatedDocument) => {

					
					
						callback(null);

					 });	
				},
				
				
			},(asyncErr,asyncResponse)=>{
				console.log("asyncResponse.check_post_user_following");
				console.log(asyncResponse.check_post_user_following);
				if(asyncErr){
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							message: res.__("admin.system.something_going_wrong_please_try_again")
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
				let postDataresult 			= (asyncResponse.get_post_data) ? asyncResponse.get_post_data : {};
				let relatedPosts 			= (asyncResponse.get_related_posts) ? asyncResponse.get_related_posts : {};
				let nextPostLink 			= (asyncResponse.get_next_post_link) ? asyncResponse.get_next_post_link : "";
				let previousPostLink 		= (asyncResponse.get_previous_post_link) ? asyncResponse.get_previous_post_link : "";
				let checkPostUserFollowing 	= (asyncResponse.check_post_user_following);
				let postHistory 			= (asyncResponse.post_history);
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: postDataresult,
						related_posts: relatedPosts,
						next_post_link: nextPostLink,
						previous_post_link: previousPostLink,
						isfollowing: checkPostUserFollowing,
						user_image_url: USERS_URL,
						post_image_url: POSTS_URL,
						android_app_link : (res.locals.settings["Site.android_app_link"]) ? res.locals.settings["Site.android_app_link"] : "",
						apple_app_store : (res.locals.settings["Site.apple_app_store"]) ? res.locals.settings["Site.apple_app_store"] : "",
					}
				};
				return returnApiResult(req,res,finalResponse);
				
			});
		});
		/** Get Post details **/
    }








	/** Function for get  post history list 
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	 this.getPostHistoryList = (req,res,next,callback)=>{
			 
		
			const postHistory       = db.collection(TABLE_POSTS_HISTORY);
			let finalResponse = {};
			
			/** get user id get **/
			let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
			let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";
			
			
			if(userId=='')
			{
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: {},
						message: res.__("global.user_not_found")
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
			let	page 					= (req.body.page)		? parseInt(req.body.page)	: 1;
			let limit					= API_DEFAULT_LIMIT;
		
			let skip					=	(limit * page) - limit;
			limit						=	limit;

			

			postHistory.aggregate([
				{
					$match : {
						user_id: ObjectId(userId),
					}
				},

				{$lookup : {
					from 			: TABLE_POSTS,
					localField 		: "post_id",
					foreignField 	: "_id",
					as 				: "post_details",
				}},
				{$project : {
					post_id				: 1,
					is_deleted 			: 1,
					status 				: 1,
					created 			: 1,
					last_viewed_on		:1,
					post_title			:	{$arrayElemAt : ["$post_details.title",0]},
					post_description	:	{$arrayElemAt : ["$post_details.description",0]},
					post_type			:	{$arrayElemAt : ["$post_details.post_type",0]},
					post_media			:	{$arrayElemAt : ["$post_details.post_media",0]},
					post_thumbnail		:	{$arrayElemAt : ["$post_details.thumbnail_image",0]}, 
					post_slug			:	{$arrayElemAt : ["$post_details.slug",0]},
					post_view_count		: {$arrayElemAt : ["$post_details.post_view_count",0]},
					post_created_date	: {$arrayElemAt : ["$post_details.created",0]},
					view_date			: { $dateToString: { format: TIME_FORMAT_FOR_POST_HISTORY, date: "$last_viewed_on" } },

					
				}}
			
			]).sort({"last_viewed_on":SORT_DESC}).limit(POSTS_HISTORY_LIMIT).toArray((postErr,postResult)=>{
				
				if(postErr){
                    finalResponse = {
                        'data': {
                            status: STATUS_ERROR_INVALID_ACCESS,
                            result: {},
                            message: res.__("front.system.something_going_wrong_please_try_again")
                        }
                        
                    };
                    return returnApiResult(req,res,finalResponse);
                }
				
				postResult=	postResult.map(records => {
					records['day_ago'] = getTimeAgo(records.created);
					return records;
				});

			
				


				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: postResult,
						post_image_url: POSTS_URL,
					
					}
				};
				return returnApiResult(req,res,finalResponse);


				
			})
			
		}



	/** Function for delete  post history
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.deletePostHistory = (req,res,next,callback)=>{


			let finalResponse = {};
			req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
			let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
			let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			let deleteFlag     	= 	(req.body.delete_all) ? req.body.delete_all : DEACTIVE;
			let postHistoryId   = 	(req.body.history_id) ? req.body.history_id : "";

			
			/**For check slug */
			if (userId == '')  {
			  
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						message: res.__("api.global.parameter_missing")
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
			
			
			/** Configure user unique conditions **/
			const postsHistory           = db.collection(TABLE_POSTS_HISTORY);

			let deleteCondition ={};

			if(deleteFlag == DEACTIVE)
			{
				deleteCondition = {
							"_id": ObjectId(postHistoryId),						
							"user_id" : ObjectId(userId)
				};
			}else{
				deleteCondition = {					
					"user_id" : ObjectId(userId)
					};
			}
			
			
			postsHistory.deleteMany(
				deleteCondition
			,(deleteErr,deleteResult)=>{
				
				if(deleteErr){
                    finalResponse = {
                        'data': {
                            status: STATUS_ERROR_INVALID_ACCESS,
                            result: {},
                            message: res.__("front.system.something_going_wrong_please_try_again")
                        }
                        
                    };
                    return returnApiResult(req,res,finalResponse);
                }

				consoleLog(deleteErr)
				consoleLog(deleteResult)
				
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: {
							
						},
						message: res.__("post.post_history_deleted_successfully_message")
					}
				};
				return returnApiResult(req,res,finalResponse);
				
			})
			
		}








	/** Function for report Post by user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
	this.reportPost = (req,res,next,callback)=>{
    
            let finalResponse = {};
            req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
            let slug            = (req.body.post_slug) ? req.body.post_slug : "";
            let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
            let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			let comment            = (req.body.comment) ? req.body.comment : "";
            /**For check slug */
            if (slug == '' || userId == '')  {
              
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR_INVALID_ACCESS,
                        message: res.__("api.global.parameter_missing")
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }
            
    	/** Get Post details **/
		getPostDataBySlug(req, res, slug).then(postResponse => {
            
            /** Send error response **/
				if (postResponse.status == STATUS_ERROR) {
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: errors,
							message	:	errors
						}
					};
					return returnApiResult(req,res,finalResponse);
				}

                let postId					    =	(postResponse.result._id)				? 	postResponse.result._id			:"";			
                let postCreatedBy				=	(postResponse.result.user_id) 			? 	postResponse.result.user_id			:"";		
                let postReportedBy				=	userId;  
               

            /** Configure user unique conditions **/
			const postsReport            = db.collection(TABLE_POST_REPORTS);
            const postsCollection       = db.collection(TABLE_POSTS);

			let insertPostReport = {
								"post_id":ObjectId(postId),
								"user_id":ObjectId(userId),
								"comment":comment,
								"status":ACTIVE,
								"is_deleted":DEACTIVE,	
								"created": getUtcDate()
			};

		
		
			postsReport.findOneAndUpdate({ "post_id": ObjectId(postId),"user_id":ObjectId(userId)},  {
				$set: { modified:getUtcDate() },
				$setOnInsert: insertPostReport
			 }, { upsert: true },(err,updatedDocument) => {
				consoleLog("updatedDocument IS");
					//consoleLog(updatedDocument);
					//consoleLog(updatedDocument.lastErrorObject.updatedExisting);
					
					let updateResponse = updatedDocument.lastErrorObject;
                if(err){
                    finalResponse = {
                        'data': {
                            status: STATUS_ERROR_INVALID_ACCESS,
                            result: {},
                            message: res.__("front.system.something_going_wrong_please_try_again")
                        }
                        
                    };
                    return returnApiResult(req,res,finalResponse);
                }

				if(updatedDocument.value === null)
				{
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							result: {
								report_status : ACTIVE
							},
							message: res.__("post.post_reported_successfully_message")
						}
					};
					return returnApiResult(req,res,finalResponse);
				}else{

					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							result: {
								report_status : DEACTIVE
							},
							message: res.__("post.post_already_reported_message")
						}
					};
					return returnApiResult(req,res,finalResponse);

				}


			});
        });
    }




    /** Function for Like Post by user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.likePost = (req,res,next,callback)=>{
    
            let finalResponse = {};
            req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
            let slug            = (req.body.post_slug) ? req.body.post_slug : "";
            let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
            let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			let fullName		=	(loginUserData.full_name)		?	loginUserData.full_name		:	"";	
			let userRole		=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";	
			let userRoleID		=	(loginUserData.user_role_id)		?	loginUserData.user_role_id		:	"";	
				
            /**For check slug */
            if (slug == '' || userId == '')  {
              
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR_INVALID_ACCESS,
                        message: res.__("api.global.parameter_missing")
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }
            
    	/** Get Post details **/
		getPostDataBySlug(req, res, slug).then(postResponse => {
            
            /** Send error response **/
				if (postResponse.status == STATUS_ERROR) {
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: errors,
							message	:	errors
						}
					};
					return returnApiResult(req,res,finalResponse);
				}

                let postId					    =	(postResponse.result._id)				? 	postResponse.result._id			:"";			
                let postCreatedBy				=	(postResponse.result.user_id) 			? 	postResponse.result.user_id			:"";		
                let postLikedBy					=	userId;  
               

            /** Configure user unique conditions **/
			const postsLikes            = db.collection(TABLE_USER_LIKE_POSTS);
            const postsCollection       = db.collection(TABLE_POSTS);

            postsLikes.findOneAndDelete({"post_id":ObjectId(postId),"post_liked_by":ObjectId(postLikedBy)},{},
            (err,likeResponse)=>{

                if(err){
                    finalResponse = {
                        'data': {
                            status: STATUS_ERROR_INVALID_ACCESS,
                            result: {},
                            message: res.__("front.system.something_going_wrong_please_try_again")
                        }
                        
                    };
                    return returnApiResult(req,res,finalResponse);
                }

                if(!likeResponse.value)
                {   
                    postsLikes.insertOne({
                        post_id 		    : 	ObjectId(postId),
                        post_created_by	    :	ObjectId(postCreatedBy),
                        post_liked_by		:	ObjectId(postLikedBy),
                        status			    :	 ACTIVE,
                        modified 		    : 	getUtcDate(),
                        created 		    : 	getUtcDate(),
                    },(insertErr,insertSuccess)=>{
                        
        
                        if(insertErr){
                            finalResponse = {
                                'data': {
                                    status: STATUS_ERROR_INVALID_ACCESS,
                                    result: {},
                                    message: res.__("front.system.something_going_wrong_please_try_again")
                                }
                                
                            };
                            return returnApiResult(req,res,finalResponse);
                        }

                        let likeCounteroptions= {
                            post_id 			:	ObjectId(postId),
                            counter_stat 		:	ACTIVE
                        };

                        /** Update Post Like Counter **/
                        updateLikeCounter(req,res,likeCounteroptions);
						
						if(postCreatedBy != userId){
							//send post like pn and notification message to post owner user
							let notificationMessageParams	= [fullName];
							let notificationOptions 		= {
								notification_data : {
									notification_type	: NOTIFICATION_POST_LIKED_BY_USER,
									message_params		: notificationMessageParams,
									parent_table_id		: postCreatedBy,
									user_id				: ObjectId(postCreatedBy),
									user_ids			: [postCreatedBy],
									user_role			: postCreatedBy,
									user_role_id		: postCreatedBy,
									created_by			: postCreatedBy,
									request_status		: DEACTIVE,
									pn_type				: PN_TYPE_CONFIG.like_post,
									notification_action	: PN_TYPE_CONFIG.like_post,
									extra_parameters	: {
										slug	: slug,
									}
								}
							};
							insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
							
								
							});
						}

                        finalResponse = {
                            'data': {
                                status: STATUS_SUCCESS,
                                result: {
                                    like_status : ACTIVE
                                },
                                message: res.__("post.post_liked_successfully_message")
                            }
                        };
                        return returnApiResult(req,res,finalResponse);
                        
                        
                    })
                }else{

                    let likeCounteroptions= {
                        post_id 			:	ObjectId(postId),
                        counter_stat 		:	DEACTIVE
                    };

                    /** Update Post Like Counter **/
                    updateLikeCounter(req,res,likeCounteroptions);



                        finalResponse = {
                            'data': {
                                status: STATUS_SUCCESS,
                                result: {
                                    like_status : DEACTIVE
                                },
                                message: res.__("post.post_unliked_successfully_message")
                            }
                        };
                        return returnApiResult(req,res,finalResponse);

                }

                
            });
        });
          }

          

    
    /** Function for Save Post by user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
     this.savePost = (req,res,next,callback)=>{


        let finalResponse = {};
        req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let slug            = (req.body.post_slug) ? req.body.post_slug : "";
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
                
        /**For check slug */
        if (slug == '' || userId == '')  {
          
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    message: res.__("api.global.parameter_missing")
                }
            };
            return returnApiResult(req,res,finalResponse);
        }
        
		/** Get Post details **/
		getPostDataBySlug(req, res, slug).then(postResponse => {
			
			/** Send error response **/
				if (postResponse.status == STATUS_ERROR) {
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: errors,
							message	:	errors
						}
					};
					return returnApiResult(req,res,finalResponse);
				}

				let postId					    =	(postResponse.result._id)				? 	postResponse.result._id			:"";			
				let postCreatedBy				=	(postResponse.result.user_id) 			? 	postResponse.result.user_id			:"";		
				let postSavedBy					=	userId;  
			   

			/** Configure user unique conditions **/
			const postsSaved            = db.collection(TABLE_USER_SAVED_POSTS);
			const postsCollection       = db.collection(TABLE_POSTS);

			postsSaved.findOneAndDelete({"post_id":ObjectId(postId),"post_saved_by":ObjectId(postSavedBy)},{},
			(err,saveResponse)=>{

				if(err){
					finalResponse = {
						'data': {
							status: STATUS_ERROR_INVALID_ACCESS,
							result: {},
							message: res.__("front.system.something_going_wrong_please_try_again")
						}
						
					};
					return returnApiResult(req,res,finalResponse);
				}

				if(!saveResponse.value)
				{   
					postsSaved.insertOne({
						post_id 		    : 	ObjectId(postId),
						post_created_by	    :	ObjectId(postCreatedBy),
						post_saved_by		:	ObjectId(postSavedBy),
						status			    :	 ACTIVE,
						modified 		    : 	getUtcDate(),
						created 		    : 	getUtcDate(),
					},(insertErr,insertSuccess)=>{
						
		
						if(insertErr){
							finalResponse = {
								'data': {
									status: STATUS_ERROR_INVALID_ACCESS,
									result: {},
									message: res.__("front.system.something_going_wrong_please_try_again")
								}
								
							};
							return returnApiResult(req,res,finalResponse);
						}

						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: {
									save_status : ACTIVE
								},
								message: res.__("post.post_saved_successfully_message")
							}
						};
						return returnApiResult(req,res,finalResponse);
						
						
					})
				}else{


						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: {
									save_status : DEACTIVE
								},
								message: res.__("post.post_unsaved_successfully_message")
							}
						};
						return returnApiResult(req,res,finalResponse);

				}

				
			});
		});
       
    }
    
	
	/** Function for comment submit on post
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.commentSubmitOnPost = (req,res,next,callback)=>{
    
            let finalResponse = {};
            req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
            let slug            = (req.body.post_slug) ? req.body.post_slug : "";
            let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
            let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			let fullName		=	(loginUserData.full_name)		?	loginUserData.full_name		:	"";	
			let user_profile_image		=	(loginUserData.profile_image)		?	loginUserData.profile_image		:	"";	
			let userRole		=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";	
			let userRoleID		=	(loginUserData.user_role_id)		?	loginUserData.user_role_id		:	"";	
			let comment			=	(req.body.comment) ? req.body.comment : "";
            /**For check slug */
            if (slug == '' || userId == '')  {
              
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR_INVALID_ACCESS,
                        message: res.__("api.global.parameter_missing")
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }
            
    	/** Get Post details **/
		getPostDataBySlug(req, res, slug).then(postResponse => {
            
            /** Send error response **/
				if (postResponse.status == STATUS_ERROR) {
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: errors,
							message	:	errors
						}
					};
					return returnApiResult(req,res,finalResponse);
				}

                let postId					    =	(postResponse.result._id)				? 	postResponse.result._id			:"";			
                let postCreatedBy				=	(postResponse.result.user_id) 			? 	postResponse.result.user_id			:"";		
                let postLikedBy					=	userId;  
               

            /** Configure user unique conditions **/
			const postComment            = db.collection(TABLE_POST_COMMENT);
            const postsCollection       = db.collection(TABLE_POSTS);
 
			postComment.insertOne({
				post_id 		    : 	ObjectId(postId),
				user_id				:	ObjectId(userId),
				comment				:	comment,
				status			    :	 ACTIVE,
				is_deleted			:	DEACTIVE,
				modified 		    : 	getUtcDate(),
				created 		    : 	getUtcDate(),
			},(insertErr,insertSuccess)=>{
				

				if(insertErr){
					finalResponse = {
						'data': {
							status: STATUS_ERROR_INVALID_ACCESS,
							result: {},
							message: res.__("front.system.something_going_wrong_please_try_again")
						}
						
					};
					return returnApiResult(req,res,finalResponse);
				}
				var lastInsertId	=	(insertSuccess.insertedId) ? insertSuccess.insertedId : "";
				let commentCounteroptions= {
					post_id 			:	ObjectId(postId),
					counter_stat 		:	ACTIVE
				};

				/** Update Post comment Counter **/
				updateCommentCounter(req,res,commentCounteroptions);
				if(postCreatedBy != userId){
					//send post comment pn and notification message to post owner user
					let notificationMessageParams	= [fullName];
					let notificationOptions 		= {
						notification_data : {
							notification_type	: NOTIFICATION_COMMENT_SUBMIT,
							message_params		: notificationMessageParams,
							parent_table_id		: postCreatedBy,
							user_id				: ObjectId(postCreatedBy),
							user_ids			: [postCreatedBy],
							user_role			: postCreatedBy,
							user_role_id		: postCreatedBy,
							created_by			: postCreatedBy,
							request_status		: DEACTIVE,
							pn_type				: PN_TYPE_CONFIG.comment_on_post,
							notification_action	: PN_TYPE_CONFIG.comment_on_post,
							extra_parameters	: {
								slug	: slug,
							}
						}
					};
					insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
					
						
					});
				}
				/*let notificationMessageParams	= [fullName];
				let notificationOptions 		= {
					notification_data : {
						notification_type	: NOTIFICATION_COMMENT_SUBMIT,
						message_params		: notificationMessageParams,
						parent_table_id		: postCreatedBy,
						user_id				: ObjectId(userId),
						user_ids			: [userId],
						user_role			: userRole,
						user_role_id		: userRoleID,
					}
				};
				insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
					if(notificationResponse){
						let options = {
							user_id : ObjectId(userId),
							pn_body : notificationResponse.notificationMessage,
							pn_title : notificationResponse.notificationTitle,
							device_type : 'android',
							device_token : 'android',
						};
					//	pushNotification(res,req,options).then(response=>{});
					}	
				});
				*/
				let postCommentData = [];
				let datePost = getUtcDate();
				let postData  = getTimeAgo(datePost);
					
				finalResponse = {
					
					'data': {
						status: STATUS_SUCCESS,
						result: {
							"_id":lastInsertId,"comment":comment,"post_id":postId,"user_id":userId,"user_name":fullName,"user_profile_image":user_profile_image,"day_ago":postData,"is_liked":DEACTIVE,"user_image_url"	: USERS_URL
							
						},
						message: res.__("post.post_comment_submit_successfully_message")
					}
				};
				return returnApiResult(req,res,finalResponse);
				
				
			})
            
            
        });
    }
	
	
	/** Function for get post comments
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.getPostCommentList = (req,res,next,callback)=>{
    
            let finalResponse = {};
            req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
            let slug            = (req.body.post_slug) ? req.body.post_slug : "";
            let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
            let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			let fullName		=	(loginUserData.full_name)		?	loginUserData.full_name		:	"";	
			let userRole		=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";	
			let userRoleID		=	(loginUserData.user_role_id)		?	loginUserData.user_role_id		:	"";	
			let comment			=	(req.body.comment) ? req.body.comment : "";
            /**For check slug */
            if (slug == '' || userId == '')  {
              
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR_INVALID_ACCESS,
                        message: res.__("api.global.parameter_missing")
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }
			/** Get Post details **/
			getPostDataBySlug(req, res, slug).then(postResponse => {
            
				/** Send error response **/
				if (postResponse.status == STATUS_ERROR) {
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: errors,
							message	:	errors
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
				let postId					    =	(postResponse.result._id)				? 	postResponse.result._id			:"";	
				const postComment            = db.collection(TABLE_POST_COMMENT);
				
				postComment.aggregate([
					{
						$match : {
							post_id 		    : 	ObjectId(postId),
						}
					},
					{$lookup : {
						from 			: "users",
						localField 		: "user_id",
						foreignField 	: "_id",
						as 				: "user_details",
					}},
					{
						$lookup: {	/** Get user like comment or not   **/
							from: TABLE_POSTS_COMMENT_LIKE,
							let: { commentId: "$_id" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$comment_id", "$$commentId"] },
												{ $eq: ['$user_id', ObjectId(userId)] },
											]
										},
									}
								},
							],
							as: 'user_like_comment'
						}
					},
					{$project : {
						comment		:	1,	
						created		:	1,	
						likes_count		:	1,	
						user_name	:	{$arrayElemAt : ["$user_details.full_name",0]},
						user_profile_image	:	{$arrayElemAt : ["$user_details.profile_image",0]},
						created_date : { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
						is_liked: { $arrayElemAt: ["$user_like_comment.status", 0] },
					}},
					{$sort : {created : SORT_DESC}},
				]).toArray((err,result)=>{
					
					let finalResult = [];
					if(result && result.length > 0){
						
						finalResult = result.map(records => {
							records['day_ago'] = getTimeAgo(records.created);
							records['is_liked'] = (records.is_liked) ? records.is_liked : DEACTIVE;
							
					
							return records;
						})
						consoleLog(finalResult);
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: finalResult,
								user_image_url	: USERS_URL,
							
							}
						};
						return returnApiResult(req,res,finalResponse);
						
					}else{
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: [],
							
							}
						};
						return returnApiResult(req,res,finalResponse);
					}
				});
				
			})

			
	}
            
    
	
	
	
    /** Function for Like Post by user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.likePostComment = (req,res,next,callback)=>{
    
            let finalResponse = {};
            req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
            let slug            = (req.body.post_slug) ? req.body.post_slug : "";
            let commentId      = (req.body.comment_id) ? req.body.comment_id : "";
            let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
            let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			let fullName		=	(loginUserData.full_name)		?	loginUserData.full_name		:	"";	
			let userRole		=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";	
			let userRoleID		=	(loginUserData.user_role_id)		?	loginUserData.user_role_id		:	"";	

            /**For check slug */
            if (slug == '' || userId == '')  {
              
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR_INVALID_ACCESS,
                        message: res.__("api.global.parameter_missing")
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }
            
    	/** Get Post details **/
		getPostDataBySlug(req, res, slug).then(postResponse => {
            
            /** Send error response **/
				if (postResponse.status == STATUS_ERROR) {
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: errors,
							message	:	errors
						}
					};
					return returnApiResult(req,res,finalResponse);
				}

                let postId					    =	(postResponse.result._id)				? 	postResponse.result._id			:"";			
                let postCreatedBy				=	(postResponse.result.user_id) 			? 	postResponse.result.user_id			:"";		
                let postLikedBy					=	userId;  
               

            /** Configure user unique conditions **/
			const postCommentLike            = db.collection(TABLE_POSTS_COMMENT_LIKE);
            const postsCollection       = db.collection(TABLE_POSTS);

            postCommentLike.findOneAndDelete({"post_id":ObjectId(postId),"comment_id":ObjectId(commentId),"user_id":ObjectId(userId)},{},
            (err,likeResponse)=>{

                if(err){
                    finalResponse = {
                        'data': {
                            status: STATUS_ERROR_INVALID_ACCESS,
                            result: {},
                            message: res.__("front.system.something_going_wrong_please_try_again")
                        }
                        
                    };
                    return returnApiResult(req,res,finalResponse);
                }

                if(!likeResponse.value)
                {   
                    postCommentLike.insertOne({
                        post_id 		    : 	ObjectId(postId),
                        comment_id	    	:	ObjectId(commentId),
                        user_id				:	ObjectId(postLikedBy),
                        status			    :	 ACTIVE,
                        modified 		    : 	getUtcDate(),
                        created 		    : 	getUtcDate(),
                    },(insertErr,insertSuccess)=>{
                        
        
                        if(insertErr){
                            finalResponse = {
                                'data': {
                                    status: STATUS_ERROR_INVALID_ACCESS,
                                    result: {},
                                    message: res.__("front.system.something_going_wrong_please_try_again")
                                }
                                
                            };
                            return returnApiResult(req,res,finalResponse);
                        }

                        let likeCounteroptions= {
                            post_id 			:	ObjectId(postId),
                            comment_id 			:	ObjectId(commentId),
                            user_id 			:	ObjectId(postLikedBy),
                            counter_stat 		:	ACTIVE
                        };

                        /** Update Post Like Counter **/
                        updatePostCommentLikeCounter(req,res,likeCounteroptions);

						if(postCreatedBy != userId){	
							//send like comment pn and notification message to post owner user
							let notificationMessageParams	= [fullName];
							let notificationOptions 		= {
								notification_data : {
									notification_type	: NOTIFICATION_LIKE_POST_COMMENT,
									message_params		: notificationMessageParams,
									parent_table_id		: postCreatedBy,
									user_id				: ObjectId(postCreatedBy),
									user_ids			: [postCreatedBy],
									user_role			: postCreatedBy,
									user_role_id		: postCreatedBy,
									created_by			: postCreatedBy,
									request_status		: DEACTIVE,
									pn_type				: PN_TYPE_CONFIG.like_comment_on_post,
									notification_action	: PN_TYPE_CONFIG.like_comment_on_post,
									extra_parameters	: {
										slug	: slug,
									}
								}
							};
							insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
							
								
							});
						}
						
                        finalResponse = {
                            'data': {
                                status: STATUS_SUCCESS,
                                result: {
                                    like_status : ACTIVE
                                },
                                message: res.__("post.post_liked_successfully_message")
                            }
                        };
                        return returnApiResult(req,res,finalResponse);
                        
                        
                    })
                }else{

                    let likeCounteroptions= {
                       post_id 			:	ObjectId(postId),
                            comment_id 			:	ObjectId(commentId),
                            user_id 			:	ObjectId(postLikedBy),
                        counter_stat 		:	DEACTIVE
                    };

                    /** Update Post Like Counter **/ 
                    updatePostCommentLikeCounter(req,res,likeCounteroptions);



                        finalResponse = {
                            'data': {
                                status: STATUS_SUCCESS,
                                result: {
                                    like_status : DEACTIVE
                                },
                                message: res.__("post.post_unliked_successfully_message")
                            }
                        };
                        return returnApiResult(req,res,finalResponse);

                }

                
            });
        });
    }
    
     
	
	/** Function for get post list 
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
    this.getPostList = async(req,res,next,callback)=>{
		
		const postsCollection       = db.collection(TABLE_POSTS);
		let finalResponse = {};
		
		/** get user id get **/
		let loginUserData 			=	(req.user_data) 		?	req.user_data 			:	"";
		let userId					=	(loginUserData._id)		?	loginUserData._id		:	"";
		
		let userRoleType			=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";
		let userInterestedCategoryId	=	(loginUserData.interested_category_id)		?	loginUserData.interested_category_id		:	[];
		
		
		
		// categoryIds base on user role
		let roleCategotyId  = await getUserCategoryBaseOnRole(res,res,loginUserData);
		// categoryIds base on user role
		
		// if login user Interested Category id is blank then user role assign category id will push in this variable
		if(userInterestedCategoryId.length == 0)
		{
			userInterestedCategoryId = roleCategotyId;
		}
		
		//these interest category id are from search
		let interestCategoryId	=	(req.body.interest_id) ? req.body.interest_id : [];
		
		//if search interest category id are blank then user interest category id are puch in this variable
		if(interestCategoryId.length == 0)
		{
			interestCategoryId = userInterestedCategoryId;
		}
		
		//make interest category id as objectid
		let categoryIds         = [];
		if(interestCategoryId.length > 0)
		{
			interestCategoryId.map((records)=>{
				categoryIds.push(ObjectId(records));
			})
		}
		
		if(userId=='')
		{
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
		
		let	postType 	= (req.body.post_type)		? req.body.post_type	: "image";
		let	postTag 	= (req.body.post_tag)		? req.body.post_tag	: "";
		let privacyArr = [POST_PRIVACY_PUBLIC];
		
		let followingUser = [
			ObjectId("5f7c0fbdced1c84625f4c52b")
		]
		
		let postCondition = {
			is_deleted	:	NOT_DELETED,
			status  	:	ACTIVE,
			post_type  	:	postType,
			//"$or"			:	[{
									//"user_id"		: {$in: followingUser }
								//}]
			
		}
		if(categoryIds.length > 0){
			
			postCondition[userRoleType] = { $in: categoryIds }
		}
		
		if(postTag != "")
		{
			postCondition["post_hashtags"] = { $regex : new RegExp(postTag, "i") }
		}
		postCondition['age_type'] = { $in: [userRoleType] }
		let searchData = {
			tag : postTag
		}
		
		
		console.log("followingUser");
		console.log(followingUser);
		///privacyArr.push(POST_PRIVACY_FRIENDS)
		postCondition["privacy"] =  {$in : privacyArr};
		
		let newpostCondition = {};
		let andConditionObj = [];
		
		
		andConditionObj.push({is_deleted:NOT_DELETED},{status : ACTIVE},{post_type : postType});
		if(categoryIds.length > 0){
			let filterRoleType = "";
			
			andConditionObj[userRoleType] = { $in: categoryIds };
			//andConditionObj.push({filterRoleType : { $in: categoryIds }});
		}
		newpostCondition['$or']= [{ user_id: followingUser },{"$and":andConditionObj}];
		
		let checknew = {
			//is_deleted:NOT_DELETED,
			status : DEACTIVE,
			//post_type : postType
		}
		let condition = {
			user_id		:	userId,
			condition  	:	newpostCondition,
			searchData	:	searchData,
			post_type	:	postType,
			categoryIds : 	categoryIds
		}
		
		console.log("newpostCondition here");
		consoleLog(newpostCondition);
		
			//return false;
		/** Get Post details **/
		  getPostsList(req, res, condition).then(postResponse => {
			  
			  //consoleLog("postResponse");
			  //consoleLog(postResponse);
			return returnApiResult(req,res,postResponse);

		  });
			
		
		  
		
    }




	    
     /** Function for get post list 
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	  this.getTrendingPostList = (req,res,next,callback)=>{ 
		
		
		const postsLogCollection       = db.collection(TABLE_POST_VIEW_LOG);
		let finalResponse = {};
		
		/** get user id get **/
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";
		
		let userRoleType			=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";
		let interestedCategoryId	=	(loginUserData.interested_category_id)		?	loginUserData.interested_category_id		:	"";
		
		if(userId=='')
		{
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {},
					message: res.__("global.user_not_found")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		

		var lastHour = new Date();
  		lastHour.setHours(lastHour.getHours()-1);

		  consoleLog(lastHour);
		  postsLogCollection.distinct('post_id',{"modified":{$gte: lastHour}},(err, response)=>{

			console.log("Response is ");
			console.log(response);

			let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit	= API_DEFAULT_LIMIT;
		
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		
		let	postType 	= (req.body.post_type)		? req.body.post_type	: "image";
		
		let postCondition = {
			is_deleted	:	NOT_DELETED,
			status  	:	ACTIVE,
			post_type  	:	postType,
			_id			:	{$in:response}
		}
		let searchKeyword = (req.body.search_keyword) ? req.body.search_keyword : "";
		if(searchKeyword != "")
		{
			postCondition['$or']= [{title:{ $regex : new RegExp(searchKeyword, "i") }},{description:{ $regex : new RegExp(searchKeyword, "i") }}]
		}
		postCondition['age_type'] = { $in: [userRoleType] }
		let condition = {
			user_id		:	userId,
			condition  	:	postCondition,
		}




		  /** Get Post details **/
		  getPostsList(req, res, condition).then(postResponse => {
			return returnApiResult(req,res,postResponse);

		  });



		  });
return false;
		
		let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit	= API_DEFAULT_LIMIT;
		
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		
		let	postType 	= (req.body.post_type)		? req.body.post_type	: "image";
		
		let postCondition = {
			is_deleted	:	NOT_DELETED,
			status  	:	ACTIVE,
			post_type  	:	postType,
		}
		const asyncParallel	= require('async/parallel');
		asyncParallel({
			
			post_list : (callback)=>{
				
				postsLogCollection.aggregate([
					{
						$match : postCondition
					},
					{
						$lookup:{
							from: TABLE_USERS,
							let: { userId: "$user_id" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$_id", "$$userId"] },
												//{ $eq: ["$active", ACTIVE] },
											]
										},
									}
								},
								{ $project: { "_id": 1, "full_name": 1} }
								
							],
							as: "user_details"
						}
					},
					{
						$project : {
							
							title 				:	1,
							description 		: 	1,
							post_type			:	1,
							privacy 			:	1,
							post_view_count 	:	1,
							post_comment_count	:	1,
							post_likes_count	:	1,
							images				:	1,
							created				:	1,
							created_date: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
							user_full_name: { $arrayElemAt: ["$user_details.full_name", 0] },
					
						
						}
						
					}
					
				]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
					
					callback(null, result);
				})
				
			},
			post_count : (callback)=>{
				/** Get total number of records  in post collection base on this Condition **/
				postsCollection.countDocuments(postCondition,(err,countResult)=>{
					callback(err, countResult);
				});
			},
			
			
		},(err, response)=>{
			
			
			var totalRecord	= (response['post_count']) ? response['post_count'] : 0;
			finalResponse = {
				'data': {
					status			: STATUS_SUCCESS,
					post_list		: (response['post_list']) ? response['post_list'] : [],
					recordsTotal	: (response['post_count']) ? response['post_count'] : 0,
					limit			: limit,
					page			: page,
					image_url		 	: POSTS_URL,
					message		 	: "",
					total_page		: Math.ceil(totalRecord/limit)
				}
			};
			
			return returnApiResult(req,res,finalResponse);
			
		})
		
    }

	
	  /** Function for get saved post list 
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
    this.getSavedPostList = (req,res,next,callback)=>{
		
		const savedPostsCollection       = db.collection(TABLE_USER_SAVED_POSTS);
		let finalResponse = {};
		
		/** get user id get **/
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";
		
		let userRoleType	=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";
		let categoryIds         = [];
		/*let interestCategoryId	=	(req.body.interest_id) ? req.body.interest_id : [];
		let categoryIds         = [];
		if(interestCategoryId.length > 0)
		{
			interestCategoryId.map((records)=>{
				categoryIds.push(ObjectId(records));
			})
		}*/
		if(userId=='')
		{
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {},
					message: res.__("global.user_not_found")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		let	page 					= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit					= API_DEFAULT_LIMIT;
	
		let skip					=	(limit * page) - limit;
		limit						=	limit;
		//savedPostsCollection.distinct('post_id',{"post_saved_by":ObjectId(userId)},(err, result)=>{
		savedPostsCollection.find(
			{	
				"post_saved_by":ObjectId(userId)
			},{}
			).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{	
				
				let savePostId = [];
				if(result && result.length > 0)
				{
					result.map((records)=>{
						savePostId.push(ObjectId(records.post_id));
					})
					
				}
				
				let	postType 	= (req.body.post_type)		? req.body.post_type	: "image";
				
				let postCondition = {
					is_deleted	:	NOT_DELETED,
					status  	:	ACTIVE,
					post_type  	:	postType,
					
				}
				if(savePostId.length > 0){
					postCondition["_id"] = { $in: savePostId }
				}
				
				let condition = {
					user_id		:	userId,
					condition  	:	postCondition,
				}
				if(savePostId.length > 0)
				{
					/** Get Post details **/
					getPostsList(req, res, condition).then(postResponse => {
						return returnApiResult(req,res,postResponse);
		
					});
				}else{
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							result: {},
							//message: res.__("global.user_not_found")
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				}
		})
		
    }

	
	
	 /** Function for delete all saved post
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
     this.deleteAllSavedPost = (req,res,next,callback)=>{


        let finalResponse = {};
        req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
		
                
        /**For check slug */
        if (userId == '')  {
          
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    message: res.__("api.global.parameter_missing")
                }
            };
            return returnApiResult(req,res,finalResponse);
        }
        
		
		/** Configure user unique conditions **/
		const postsSaved            = db.collection(TABLE_USER_SAVED_POSTS);
		
		postsSaved.deleteMany({
			post_saved_by : ObjectId(userId)
		},(deleteErr,deleteResult)=>{
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: {
						
					},
					message: res.__("post.post_unsaved_successfully_message")
				}
			};
			return returnApiResult(req,res,finalResponse);
			
		})
		
    }



	 /** 
	* Function for delete all saved post
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	  this.deletePost = (req,res,next,callback)=>{


        let finalResponse = {};
        req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
		let slug            = (req.body.slug) ? req.body.slug : "";
		let postSlug        = (req.body.post_slug) ? req.body.post_slug : "";
		let deleteType     = (req.body.delete_post) ? req.body.delete_post : "single";
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
		
                
        /**For check slug */
        if (userId == '')  {
          
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    message: res.__("api.global.parameter_missing")
                }
            };
            return returnApiResult(req,res,finalResponse);
        }

		getPostDataBySlug(req, res, postSlug).then(postResponse => {

			let postId					    =	(postResponse.result)				? 	postResponse.result._id			:"";

			  /**For check slug */
			//   if (postId == '')  {
          
			// 	finalResponse = {
			// 		'data': {
			// 			status: STATUS_ERROR_INVALID_ACCESS,
			// 			message: res.__("api.global.parameter_missing")
			// 		}
			// 	};
			// 	return returnApiResult(req,res,finalResponse);
			// }

			let condition = {};
		
			if(deleteType == "all")
			{
			 condition = {
					
					user_id : ObjectId(userId)
				}

			}else{
				condition = {
					_id: ObjectId(postId),
					user_id : ObjectId(userId)
				}

			}

		
		/** Configure user unique conditions **/
		const postsSaved            = db.collection(TABLE_POSTS);
		
		postsSaved.updateMany(condition,{$set	: {is_deleted:ACTIVE}	},(updateeErr,updateResult)=>{
			let optionObj = {
				user_id 			:	ObjectId(userId),
				counter_val 		:	DEACTIVE
			}
			updateUserPostCount(req,res,optionObj).then(updateResponse=>{})
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					result: {
						
					},
					message: res.__("post.post_deleted_successfully_message")
				}
			};
			return returnApiResult(req,res,finalResponse);
			
		})
	})
		
    }


	
	
	
	/** Function for get post like users
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
     this.getPostLikeUsers = (req,res,next,callback)=>{
		 
        let finalResponse = {};
        req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
		let postSlug			=	(req.body.post_slug)		?	 req.body.post_slug : "";
                
        /**For check slug */
        if (userId == '')  {
          
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    message: res.__("api.global.parameter_missing")
                }
            };
            return returnApiResult(req,res,finalResponse);
        }
        
		let	page 					= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit					= API_DEFAULT_LIMIT;
	
		let skip					=	(limit * page) - limit;
		limit						=	limit;
	
		const postsLikes            = db.collection(TABLE_USER_LIKE_POSTS);
		const asyncParallel			= require('async/parallel');
		getPostDataBySlug(req, res, postSlug).then(postResponse => {
			let postId					    =	(postResponse.result._id)				? 	postResponse.result._id			:"";
			let condition = {
				post_id: ObjectId(postId)
			}
			asyncParallel({
				like_user_list : (callback)=>{
					
					postsLikes.aggregate([
					{
						$match : condition
					},
					{
						$lookup:{
							from: TABLE_USERS,
							let: { userId: "$post_liked_by" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$_id", "$$userId"] },
												//{ $eq: ["$active", ACTIVE] },
											]
										},
									}
								},
								//{ $project: { "_id": 1, "full_name": 1,"profile_image":1} }
								
							],
							as: "user_details"
						}
					},
					{$project : {
							
							user_id	:	{$arrayElemAt : ["$user_details._id",0]},
							user_name	:	{$arrayElemAt : ["$user_details.full_name",0]},
							user_profile_image	:	{$arrayElemAt : ["$user_details.profile_image",0]},
							user_slug	:	{$arrayElemAt : ["$user_details.slug",0]},
						
						}
					}
					]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, userResult)=>{
						callback(null, userResult);
						
					})
					
				},
				total_count : (callback)=>{
					/** Get total number of records  in post like table **/
					postsLikes.countDocuments(condition,(err,countResult)=>{
						callback(err, countResult);
					});
				},
				following_user_ids : (callback)=>{
					const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);

					let followingCondition = {
						followed_by : ObjectId(userId),
						is_approved : ACTIVE,
						action_type 				: 	FOLLOW_ACTION_TYPE,
					}
					usersFollower.distinct('user_id',followingCondition,(err,result)=>{
						callback(err, result);
					});

				},
				get_login_user_follow_request_pending : (callback)=>{
					
					let userObj = {
						user_id : ObjectId(userId),
					}
					getLoginUserFollowRequestPending(req,res,userObj).then(resultResponse=>{
						callback(null, resultResponse.result);
					})
					
				},
			},(err, response)=>{
				var totalRecord	= (response['total_count']) ? response['total_count'] : 0;
				var following_user_ids	= (response['following_user_ids']) ? response['following_user_ids'] : 0;
				var login_user_follow_request_pending	= (response['get_login_user_follow_request_pending']) ? response['get_login_user_follow_request_pending'] : 0;
				
				finalResponse = {
					'data': {
						status			: STATUS_SUCCESS,
						user_list		: (response['like_user_list']) ? response['like_user_list'] : [],
						recordsTotal	: totalRecord,
						following_user_ids : following_user_ids,
						login_user_follow_request_pending : login_user_follow_request_pending,
						limit			: limit,
						page			: page,
						image_url		: POSTS_URL,
						user_image_url	: USERS_URL,
						message		 	: "",
						total_page		: Math.ceil(totalRecord/limit)
					}
				};

				return returnApiResult(req,res,finalResponse);
				
			});
		});
		
    }
	
      
   
}	
module.exports = new Posts();

