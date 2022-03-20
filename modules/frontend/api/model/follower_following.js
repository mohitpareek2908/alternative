function FollowerFollowing() {
	
	FollowerFollowing = this;
	
	 /** Function for un follow these users that follow by you
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
     this.followUnfollowUser = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let followedBy			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
        let fullName			    =	(loginUserData.full_name)		?	loginUserData.full_name		:	"";		
		let otherUserSlug           	 = (req.body.other_user_slug) ? req.body.other_user_slug : "";
		let finalResponse = {};
		console.log("here in hirdejhs");
		if (followedBy == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again1")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		const users			           = db.collection(TABLE_USERS);
		
		let otherUserCondition = {
            slug: otherUserSlug
        }
        /** Set options data for get user details **/
        let otherUserOptions = {
            conditions	:	otherUserCondition,
            fields		:	{facebook_id :0}
        };
		
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

            let requestToUserId					    =	(userResponse.result._id)				? 	userResponse.result._id			:"";		
			
			usersFollower.findOne({
				
				user_id 	: ObjectId(requestToUserId),
				followed_by : ObjectId(followedBy),
				action_type : FOLLOW_ACTION_TYPE,
			},{},(findErr,findResult)=>{
				
				findResult = findResult ? findResult : {};
				if(Object.keys(findResult).length > 0){
					
					usersFollower.deleteOne({
						user_id 	: ObjectId(requestToUserId),
						followed_by : ObjectId(followedBy),
						action_type : FOLLOW_ACTION_TYPE,
					},(err,result)=>{
						
						let followersObj = {
							user_id 			:	ObjectId(requestToUserId),
							counter_val 		:	DEACTIVE
						}
						updateUserFollowersCount(req,res,followersObj).then(updateResponse=>{})
						
						
						let followingObj = {
							user_id 			:	ObjectId(followedBy),
							counter_val 		:	DEACTIVE
						}
						updateUserFollowingCount(req,res,followingObj).then(updateResponse=>{})
						
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: {
									follow_status : DEACTIVE
								},
								message: res.__("users.this_user_unfollow_successfully")
							}
						};
						return returnApiResult(req,res,finalResponse);
					
						
						
							
					})
				}else{
					
					usersFollower.insertOne({
						user_id 	: ObjectId(requestToUserId),
						followed_by : ObjectId(followedBy),
						is_approved 		        :	DEACTIVE,
						is_close_friend 		    :	DEACTIVE,
						status			            :	 ACTIVE,
						action_type 				: 	FOLLOW_ACTION_TYPE,
						modified 		            : 	getUtcDate(),
						created 		            : 	getUtcDate(),
					},(insertErr,insertSuccess)=>{
						
						let notificationMessageParams	= [fullName];
						let notificationOptions 		= {
							notification_data : {
								notification_type	: NOTIFICATION_FOLLOW_REQUEST,
								message_params		: notificationMessageParams,
								parent_table_id		: requestToUserId,
								user_id				: ObjectId(requestToUserId),
								user_ids			: [requestToUserId],
								user_role			: requestToUserId,
								user_role_id		: requestToUserId,
								created_by			: followedBy,
								request_status		: DEACTIVE,
								pn_type				: PN_TYPE_CONFIG.follow_request,
								notification_action	: PN_TYPE_CONFIG.follow_request,
							}
						};
						insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
						
							
						});
						
						
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: {
									follow_status : FOLLOW_REQUEST_PENDING
								},
								message: res.__("users.user_follow_request_added_successfully_message")
							}
						};
						return returnApiResult(req,res,finalResponse);
						
						
					})
					
					
				}
				
			});
		});
		
	}
	
	
	 /** Function for get follow request list
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.followRequestList = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		
		let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit	= API_DEFAULT_LIMIT;
		
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		let condition = {
			user_id : ObjectId(userId),
			is_approved : DEACTIVE,
			action_type 				: 	FOLLOW_ACTION_TYPE,
		}
		let searchCondition = {};
			
		let	userName 	= (req.body.user_name)		? req.body.user_name	: "";
		if(userName != ""){
		
			searchCondition['user_full_name'] = { $regex : new RegExp(userName, "i") }
		}
		console.log("searchCondition");
		console.log(searchCondition);
			
		const asyncParallel			= require('async/parallel');
		asyncParallel({
			request_list : (callback)=>{
				usersFollower.aggregate([
					{
						$match : condition
					},
					{
						$lookup:{
							from: TABLE_USERS,
							let: { followedBy: "$followed_by" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$_id", "$$followedBy"] },
												{ $eq: ["$active", ACTIVE] },
											]
										},
									}
								},
								{ $project: { "_id": 1, "full_name": 1,"profile_image":1,"slug":1} }
								
							],
							as: "user_details"
						}
					},
					{
						$project : {
							_id : 1,
							user_id : 1,
							followed_by : 1,
							created : 1,
							created_date: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
							user_full_name: { $arrayElemAt: ["$user_details.full_name", 0] },
							user_profile_image: { $arrayElemAt: ["$user_details.profile_image", 0] },
							user_slug: { $arrayElemAt: ["$user_details.slug", 0] },
						}
					},
					{
						$match: searchCondition
					}
					
				]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
					
					callback(err, result);
				})
			},
			request_count : (callback)=>{
				usersFollower.countDocuments(condition,(err,countResult)=>{
					callback(err, countResult);
				});
			}
		},(err, response)=>{
			var totalRecord	= (response['request_count']) ? response['request_count'] : 0;
			
			finalResponse = {
				'data': {
					status			: STATUS_SUCCESS,
					request_list		: (response['request_list']) ? response['request_list'] : [],
					recordsTotal	:	totalRecord,
					limit			: limit,
					page			: page,
					total_page		: Math.ceil(totalRecord/limit),
					user_image_url	: USERS_URL,
				}
			}
			return returnApiResult(req,res,finalResponse);
		});
	}
	
	
	 /** Function for accept and reject follow reuest
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.acceptRejectFollowRequest = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
        let fullName			    =	(loginUserData.full_name)		?	loginUserData.full_name		:	"";		
        let slug			    =	(loginUserData.slug)		?	loginUserData.slug		:	"";		
		
		let actionType			=	(req.body.action_type) ? req.body.action_type : "";
		let otherUserSlug		=	(req.body.other_user_slug) ? req.body.other_user_slug : "";
		let notificationId		=	(req.body.notification_id) ? req.body.notification_id : "";
		
		let finalResponse = {};
		if (userId == '' || actionType == "") {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		
		let otherUserCondition = {
            slug: otherUserSlug
        }
        /** Set options data for get user details **/
        let otherUserOptions = {
            conditions	:	otherUserCondition,
            fields		:	{facebook_id :0}
        };
		
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

            let followedByUserId					    =	(userResponse.result._id)				? 	userResponse.result._id			:"";		
		
			if(actionType == FOLLOW_REQUEST_ACCEPT){
				usersFollower.updateOne({
					user_id : ObjectId(userId),
					followed_by : ObjectId(followedByUserId),
					action_type 				: 	FOLLOW_ACTION_TYPE,
				},{
					$set : {
						is_approved : ACTIVE
					}
				},(updateErr,updateResult)=>{
					
					let notificationObj = {
						user_id : userId,
						followed_by_user_id : followedByUserId,
					}
					updateNotificationRequestStatus(req,res,notificationObj).then(notificationRes =>{
						
					})
					let followersObj = {
						user_id 			:	ObjectId(userId),
						counter_val 		:	ACTIVE
					}
					updateUserFollowersCount(req,res,followersObj).then(updateResponse=>{})
					
					
					let followingObj = {
						user_id 			:	ObjectId(followedByUserId),
						counter_val 		:	ACTIVE
					}
					updateUserFollowingCount(req,res,followingObj).then(updateResponse=>{})
					
					
					let notificationMessageParams	= [fullName];
					let notificationOptions 		= {
						notification_data : {
							notification_type	: NOTIFICATION_FOLLOW_REQUEST_ACCEPT,
							message_params		: notificationMessageParams,
							parent_table_id		: followedByUserId,
							user_id				: ObjectId(followedByUserId),
							user_ids			: [followedByUserId],
							user_role			: followedByUserId,
							user_role_id		: followedByUserId,
							created_by			: followedByUserId,
							request_status		: DEACTIVE,
							pn_type				: PN_TYPE_CONFIG.follow_request_accept_reject,
							notification_action	: PN_TYPE_CONFIG.follow_request_accept_reject,
							extra_parameters	: {
								slug	: slug,
							}
						}
					};
					insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
					
						
					});
					
					
					finalResponse = {
                    'data': {
							status: STATUS_SUCCESS,
							errors: {},
							request_status : ACTIVE,
							message: res.__("front.request_has_been_accpeted")
						}
					};
					return returnApiResult(req,res,finalResponse);
				})
				
				
			}else if(actionType == FOLLOW_REQUEST_REJECT){
				
				 usersFollower.findOneAndDelete({"user_id":ObjectId(userId),"followed_by":ObjectId(followedByUserId)},{},(err,likeResponse)=>{
					
					let notificationObj = {
						user_id : userId,
						followed_by_user_id : followedByUserId,
					}
					updateNotificationRequestStatus(req,res,notificationObj).then(notificationRes =>{
						
					})
					
					finalResponse = {
                    'data': {
							status: STATUS_SUCCESS,
							errors: {},
							request_status : ACTIVE,
							message: res.__("front.request_has_been_rejectd")
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				 })
				
			}
		});
	}
	
	
	
	 /** Function for get followers list
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.followersList = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";
		let otherUserSlug		=	(req.body.other_user_slug) ? req.body.other_user_slug : "";		
		let finalResponse = {};
		
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		
		let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit	= API_DEFAULT_LIMIT;
		
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		
		let otherUserCondition = {
            slug: otherUserSlug
        }
        /** Set options data for get user details **/
        let otherUserOptions = {
            conditions	:	otherUserCondition,
            fields		:	{facebook_id :0}
        };
		
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

            let followerForUserId					    =	(userResponse.result._id)				? 	userResponse.result._id			:"";		
			let condition = {
				user_id : ObjectId(followerForUserId),
				is_approved : ACTIVE,
				action_type 				: 	FOLLOW_ACTION_TYPE,
			}
			let searchCondition = {};
			
			let	userName 	= (req.body.user_name)		? req.body.user_name	: "";
			if(userName != ""){
				//searchCondition['user_full_name'] = { $regex: "^" + userName + "$", $options: "i" };
				searchCondition['user_full_name'] = { $regex : new RegExp(userName, "i") };
			}
			
			const asyncParallel			= require('async/parallel');
			asyncParallel({
				followers_list : (callback)=>{
					usersFollower.aggregate([
						{
							$match : condition
						},
						{
							$lookup:{
								from: TABLE_USERS,
								let: { followedBy: "$followed_by" },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ["$_id", "$$followedBy"] },
													{ $eq: ["$active", ACTIVE] },
												]
											},
										}
									},
									{ $project: { "_id": 1, "full_name": 1,"profile_image":1,"slug":1} }
									
								],
								as: "user_details"
							}
						},
						{
							$project : {
								_id : 1,
								user_id : 1,
								followed_by : 1,
								is_approved : 1,
								is_close_friend : 1,
								created : 1,
								created_date: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
								user_full_name: { $arrayElemAt: ["$user_details.full_name", 0] },
								user_profile_image: { $arrayElemAt: ["$user_details.profile_image", 0] },
								user_slug: { $arrayElemAt: ["$user_details.slug", 0] },
							}
						},
						{
							$match: searchCondition
						}
						
					]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
						
						callback(err, result);
					})
				},
				followers_count : (callback)=>{
					usersFollower.countDocuments(condition,(err,countResult)=>{
						callback(err, countResult);
					});
				},
				get_login_user_following_user : (callback)=>{
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
				follow_request_count : (callback)=>{
					let followRequestCon = {
						user_id : ObjectId(followerForUserId),
						is_approved : DEACTIVE,
						action_type 				: 	FOLLOW_ACTION_TYPE,
					}
					usersFollower.countDocuments(followRequestCon,(err,countResult)=>{
						callback(err, countResult);
					});
				}
			},(err, response)=>{
				var totalRecord	= (response['followers_count']) ? response['followers_count'] : 0;
				var followRequestCount	= (response['follow_request_count']) ? response['follow_request_count'] : 0;
				var login_user_following_user	= (response['get_login_user_following_user']) ? response['get_login_user_following_user'] : 0;
				var login_user_follow_request_pending	= (response['get_login_user_follow_request_pending']) ? response['get_login_user_follow_request_pending'] : 0;
				
				finalResponse = {
					'data': {
						status			: STATUS_SUCCESS,
						followers_list		: (response['followers_list']) ? response['followers_list'] : [],
						recordsTotal	:	totalRecord,
						login_user_following_user	:	login_user_following_user,
						login_user_follow_request_pending	:	login_user_follow_request_pending,
						limit			: limit,
						page			: page,
						followRequestCount			: followRequestCount,
						total_page		: Math.ceil(totalRecord/limit),
						user_image_url	: USERS_URL,
					}
				}
				return returnApiResult(req,res,finalResponse);
			});
		});
	}
	
	/** Function for share post with followers
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.sharePostWithFollowers = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
		let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
		let fullName			=	(loginUserData.full_name)		?	loginUserData.full_name		:	"";		
		
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		let otherUserSlug		=	(req.body.other_user_slug)		?	req.body.other_user_slug		:	"";		
		let postSlug			=	(req.body.post_slug)			?	req.body.post_slug				:	"";	
		
		let otherUserCondition = {
			slug: otherUserSlug
		}
		/** Set options data for get user details **/
		let otherUserOptions = {
			conditions	:	otherUserCondition,
			fields		:	{facebook_id :0}
		};
		
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
				
				let postResultData	=	(postResponse.result)	?	postResponse.result		:	"";
				postSlug			=	(postResultData.slug)	?	postResultData.slug		:	"";
				let	postTitle		=	(postResultData.title)	?	postResultData.title	:	"";
				
				let notificationMessageParams	= [fullName,postTitle];
				let notificationOptions 		= {
					notification_data : {
						notification_type	: NOTIFICATION_SHARE_POST_TO_FOLLOWERS,
						message_params		: notificationMessageParams,
						parent_table_id		: ADMIN_ID,
						user_id				: ObjectId(sendToUserId),
						user_ids			: [sendToUserId],
						user_role			: sendToUserId,
						user_role_id		: sendToUserId,
					}
				};
				insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
				});
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						message: res.__("front.post_has_been_share_to_user_successfully")
					}
				};
				return returnApiResult(req,res,finalResponse);
				
				
			})
		
		});
	}
	
	
	/** Function for add and remove close friend
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.addAndRemoveCloseFriend = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
		let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
		let fullName			=	(loginUserData.full_name)		?	loginUserData.full_name		:	"";		
		
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		let otherUserSlug		=	(req.body.other_user_slug)		?	req.body.other_user_slug		:	"";		
		let actionType			=	(req.body.action_type)		?	req.body.action_type		:	"";		
			
		
		
		let otherUserCondition = {
			slug: otherUserSlug
		}
		/** Set options data for get user details **/
		let otherUserOptions = {
			conditions	:	otherUserCondition,
			fields		:	{facebook_id :0}
		};
		
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

			let followedByUserId			=	(userResponse.result._id)				? 	userResponse.result._id			:"";	
			const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
			
			let markStatus	=	DEACTIVE;
			let successMsg  = res.__("front.remove_as_close_friend_successfull");
			if(actionType == CLOSE_FRIEND_ADD){
				successMsg  = res.__("front.mark_as_close_friend_successfull");
				markStatus = ACTIVE;
			}
			//console.log(userId)
			//console.log(followedByUserId)
			usersFollower.findOne({
				user_id : ObjectId(userId),
				followed_by : ObjectId(followedByUserId),
				is_approved : ACTIVE,
				action_type 				: 	FOLLOW_ACTION_TYPE,
			},{},(findErr,findResult)=>{
				findResult = findResult ? findResult : {};
				if(Object.keys(findResult).length > 0){
					
					usersFollower.updateOne({
						user_id : ObjectId(userId),
						followed_by : ObjectId(followedByUserId),
						is_approved : ACTIVE,
						action_type 				: 	FOLLOW_ACTION_TYPE,
					},{
						$set : {
							is_close_friend : markStatus,
						}
					},(updateErr,updateResult)=>{
						
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								errors: {},
								message: successMsg
							}
						};
						return returnApiResult(req,res,finalResponse);
							
					})
				}else{
					
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: {},
							message: res.__("front.system.something_going_wrong_please_try_again")
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
			});
		
		});
		
	}
	
	
	 /** Function for get followers list
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.followingUserList = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";	
		let otherUserSlug		=	(req.body.other_user_slug) ? req.body.other_user_slug : "";				
		let finalResponse = {};
		console.log("userId "+userId); 
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		
		let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit	= API_DEFAULT_LIMIT;
		
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		
		let otherUserCondition = {
			slug: otherUserSlug
		}
		/** Set options data for get user details **/
		let otherUserOptions = {
			conditions	:	otherUserCondition,
			fields		:	{facebook_id :0}
		};
		
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

			let followedByUserId			=	(userResponse.result._id)				? 	userResponse.result._id			:"";	
			let condition = {
				followed_by : ObjectId(followedByUserId),
				is_approved : ACTIVE,
				action_type : FOLLOW_ACTION_TYPE,
			}
			let searchCondition = {};
			
			let	userName 	= (req.body.user_name)		? req.body.user_name	: "";
			if(userName != ""){
				//searchCondition['user_full_name'] = { $regex: "^" + userName + "$", $options: "i" };
				searchCondition['user_full_name'] = { $regex : new RegExp(userName, "i") };
			}
			
			const asyncParallel			= require('async/parallel');
			asyncParallel({
				following_list : (callback)=>{
					usersFollower.aggregate([
						{
							$match : condition
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
									{ $project: { "_id": 1, "full_name": 1,"profile_image":1,"slug":1} }
									
								],
								as: "user_details"
							}
						},
						{
							$project : {
								_id : 1,
								user_id : 1,
								followed_by : 1,
								created : 1,
								is_approved : 1,
								is_close_friend : 1,
								created_date: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
								user_full_name: { $arrayElemAt: ["$user_details.full_name", 0] },
								user_profile_image: { $arrayElemAt: ["$user_details.profile_image", 0] },
								user_slug: { $arrayElemAt: ["$user_details.slug", 0] },
							}
						},
						{
							$match: searchCondition
						}
						
					]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
						
						callback(err, result);
					})
				},
				following_count : (callback)=>{
					usersFollower.countDocuments(condition,(err,countResult)=>{
						callback(err, countResult);
					});
				},
				get_login_user_following_user : (callback)=>{
					let followingCondition = {
						followed_by : ObjectId(userId),
						is_approved : ACTIVE,
						action_type : FOLLOW_ACTION_TYPE,
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
				follow_request_count : (callback)=>{
					let followRequestCon = {
						user_id : ObjectId(userId),
						is_approved : DEACTIVE,
						action_type 				: 	FOLLOW_ACTION_TYPE,
					}
					usersFollower.countDocuments(followRequestCon,(err,countResult)=>{
						callback(err, countResult);
					});
				}
			},(err, response)=>{
				var totalRecord	= (response['following_count']) ? response['following_count'] : 0;
				var followRequestCount	= (response['follow_request_count']) ? response['follow_request_count'] : 0;
				
				finalResponse = {
					'data': {
						status			: STATUS_SUCCESS,
						following_list		: (response['following_list']) ? response['following_list'] : [],
						login_user_following_user		: (response['get_login_user_following_user']) ? response['get_login_user_following_user'] : [],
						login_user_follow_request_pending		: (response['get_login_user_follow_request_pending']) ? response['get_login_user_follow_request_pending'] : [],
						recordsTotal	:	totalRecord,
						limit			: limit,
						page			: page,
						followRequestCount			: followRequestCount,
						total_page		: Math.ceil(totalRecord/limit),
						user_image_url	: USERS_URL,
					}
				}
				return returnApiResult(req,res,finalResponse);
			});
		});
	}
	
	
	/** Function for Subscribe user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.subscribeUnsubscribeUser = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
		let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
		let fullName			=	(loginUserData.full_name)		?	loginUserData.full_name		:	"";		
		
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		let otherUserSlug		=	(req.body.other_user_slug)		?	req.body.other_user_slug		:	"";		
		let actionType			=	(req.body.action_type)		?	req.body.action_type		:	"";		
			
		
		
		let otherUserCondition = {
			slug: otherUserSlug
		}
		/** Set options data for get user details **/
		let otherUserOptions = {
			conditions	:	otherUserCondition,
			fields		:	{facebook_id :0}
		};
		
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

			let followedToUserId			=	(userResponse.result._id)				? 	userResponse.result._id			:"";	
			let followedByUserId			=	userId;
			const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
			
			
			
			usersFollower.findOne({
				user_id : ObjectId(followedToUserId),
				followed_by : ObjectId(followedByUserId),
				action_type 				: 	SUBSCRIBE_ACTION_TYPE,
			},{},(findErr,findResult)=>{
				findResult = findResult ? findResult : {};
				if(Object.keys(findResult).length > 0){
					
					usersFollower.deleteOne({
						user_id : ObjectId(followedToUserId),
						followed_by : ObjectId(followedByUserId),
						action_type : SUBSCRIBE_ACTION_TYPE,
					},(err,result)=>{
						
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: {
									subscribe : DEACTIVE
								},
								message: res.__("users.user_unsubscribe_successfully_message")
							}
						};
						return returnApiResult(req,res,finalResponse);
						
					});
				}else{
					
					usersFollower.insertOne({
						user_id 	: ObjectId(followedToUserId),
						followed_by : ObjectId(followedByUserId),
						is_approved 		        :	ACTIVE,
						is_close_friend 		    :	DEACTIVE,
						status			            :	 ACTIVE,
						action_type 				: 	SUBSCRIBE_ACTION_TYPE,
						modified 		            : 	getUtcDate(),
						created 		            : 	getUtcDate(),
					},(insertErr,insertSuccess)=>{
						
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: {
									subscribe : ACTIVE
								},
								message: res.__("users.user_subscribe_successfully_message")
							}
						};
						return returnApiResult(req,res,finalResponse);
					})
				}
			});
		
		});
		
	}
	
	
	 /** Function for remove followers user 
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
     this.removeFollowers = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let	userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
		let otherUserSlug       = (req.body.other_user_slug) ? req.body.other_user_slug : "";
		let finalResponse = {};
		
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		const users			           = db.collection(TABLE_USERS);
		
				console.log("reached here 1");
		
		let otherUserCondition = {
            slug: otherUserSlug
        }
        /** Set options data for get user details **/
        let otherUserOptions = {
            conditions	:	otherUserCondition,
            fields		:	{facebook_id :0}
        };
		
		/** Get other user detail **/
		getUserDetailBySlug(req, res, otherUserOptions).then(userResponse => {

			console.log("reached here 2");
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

            let followedBy					    =	(userResponse.result._id)				? 	userResponse.result._id			:"";	
			let condition = {
				user_id 	: ObjectId(userId),
				followed_by : ObjectId(followedBy),
				action_type : FOLLOW_ACTION_TYPE,

			};	
		
			console.log("reached here 3");
		
			usersFollower.findOne( condition,{},(findErr,findResult)=>{

				console.log(findResult);
				console.log(findErr);
				if(findErr){
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							message: res.__("front.system.something_going_wrong_please_try_again")
		
						}
					};
					return returnApiResult(req,res,finalResponse);
				}	
				
				findResult = findResult ? findResult : {};
				if(Object.keys(findResult).length > 0){
					
					usersFollower.deleteOne({
						user_id 	: ObjectId(userId),
						followed_by : ObjectId(followedBy),
						action_type : FOLLOW_ACTION_TYPE,
					},(err,result)=>{
						
						let optionObj = {
							user_id 			:	ObjectId(userId),
							counter_val 		:	DEACTIVE
						}
						updateUserFollowersCount(req,res,optionObj).then(updateResponse=>{})
						
						let followingObj = {
							user_id 			:	ObjectId(followedBy),
							counter_val 		:	DEACTIVE
						}
						updateUserFollowingCount(req,res,followingObj).then(updateResponse=>{})
						
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: {
									follow_status : DEACTIVE
								},
								message: res.__("users.this_user_remove_from_followers_successfully")
							}
						};
						return returnApiResult(req,res,finalResponse);
					
						
						
							
					})
				}else{
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							message: res.__("front.system.something_going_wrong_please_try_again")
		
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
				
			});
		});
		
	}
	
	
	
	 /** Function for get close friend list
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.closeFriendList = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		
		let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit	= API_DEFAULT_LIMIT;
		
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		let condition = {
			user_id : ObjectId(userId),
			is_approved : ACTIVE,
			is_close_friend : ACTIVE,
			action_type 				: 	FOLLOW_ACTION_TYPE,
		}
		const asyncParallel			= require('async/parallel');
		asyncParallel({
			close_friend_list : (callback)=>{
				usersFollower.aggregate([
					{
						$match : condition
					},
					{
						$lookup:{
							from: TABLE_USERS,
							let: { followedBy: "$followed_by" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$_id", "$$followedBy"] },
												{ $eq: ["$active", ACTIVE] },
											]
										},
									}
								},
								{ $project: { "_id": 1, "full_name": 1,"profile_image":1,"slug":1} }
								
							],
							as: "user_details"
						}
					},
					{
						$project : {
							_id : 1,
							user_id : 1,
							followed_by : 1,
							created : 1,
							created_date: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
							user_full_name: { $arrayElemAt: ["$user_details.full_name", 0] },
							user_profile_image: { $arrayElemAt: ["$user_details.profile_image", 0] },
							user_slug: { $arrayElemAt: ["$user_details.slug", 0] },
						}
					},
					{
						$match: {
							user_full_name: { $exists: true }
						}
					}
					
				]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
					
					callback(err, result);
				})
			},
			close_friend_count : (callback)=>{
				usersFollower.countDocuments(condition,(err,countResult)=>{
					callback(err, countResult);
				});
			}
		},(err, response)=>{
			var totalRecord	= (response['close_friend_count']) ? response['close_friend_count'] : 0;
			
			finalResponse = {
				'data': {
					status				: STATUS_SUCCESS,
					close_friend_list	: (response['close_friend_list']) ? response['close_friend_list'] : [],
					recordsTotal		:	totalRecord,
					limit				: limit,
					page				: page,
					total_page			: Math.ceil(totalRecord/limit),
					user_image_url		: USERS_URL,
				}
			}
			return returnApiResult(req,res,finalResponse);
		});
	}
	
	
	
	 /** Function for get following  back user list
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.followingBackUser  = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";
		let otherUserSlug		=	(req.body.other_user_slug) ? req.body.other_user_slug : "";		
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		
		let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit	= API_DEFAULT_LIMIT;
		
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		
		let followersCondition = {
			user_id : ObjectId(userId),
			is_approved : ACTIVE,
			action_type : FOLLOW_ACTION_TYPE,
		}
		const asyncParallel			= require('async/parallel');
		usersFollower.distinct('followed_by',followersCondition,(err,followersUserId)=>{
			console.log("followersUserId");
			console.log(followersUserId);
			let searchCondition = {};
			let followingBackCondition = {
				user_id : {$in : followersUserId},
				followed_by : ObjectId(userId),
				is_approved : ACTIVE,
				action_type 				: 	FOLLOW_ACTION_TYPE,
			}
			console.log(followingBackCondition);
			asyncParallel({
				following_back_user_list : (callback)=>{
					
					usersFollower.aggregate([
						{
							$match : followingBackCondition
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
									{ $project: { "_id": 1, "full_name": 1,"profile_image":1,"slug":1} }
									
								],
								as: "user_details"
							}
						},
						{
							$project : {
								_id : 1,
								user_id : 1,
								followed_by : 1,
								is_approved : 1,
								is_close_friend : 1,
								created : 1,
								created_date: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
								user_full_name: { $arrayElemAt: ["$user_details.full_name", 0] },
								user_profile_image: { $arrayElemAt: ["$user_details.profile_image", 0] },
								user_slug: { $arrayElemAt: ["$user_details.slug", 0] },
							}
						},
						{
							$match: searchCondition
						}
						
					]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
						
						callback(err, result);
					})
				},
				following_back_user_count : (callback)=>{
					usersFollower.countDocuments(followingBackCondition,(err,countResult)=>{
						callback(err, countResult);
					});
				},
				follow_request_count : (callback)=>{
					let followRequestCon = {
						user_id : ObjectId(userId),
						is_approved : DEACTIVE,
						action_type 				: 	FOLLOW_ACTION_TYPE,
					}
					usersFollower.countDocuments(followRequestCon,(err,countResult)=>{
						callback(err, countResult);
					});
				}
				
			},(err, response)=>{
				var totalRecord	= (response['following_back_user_count']) ? response['following_back_user_count'] : 0;
				var followRequestCount	= (response['follow_request_count']) ? response['follow_request_count'] : 0;
				
				finalResponse = {
					'data': {
						status							: STATUS_SUCCESS,
						followers_list		: (response['following_back_user_list']) ? response['following_back_user_list'] : [],
						recordsTotal					:	totalRecord,
						followRequestCount					:	followRequestCount,
						limit							: limit,
						page							: page,
						total_page						: Math.ceil(totalRecord/limit),
						user_image_url					: USERS_URL,
					}
				}
				return returnApiResult(req,res,finalResponse);
				
			});
			
		});
		
	
	}
	
	
	 /** Function for get not following  back user list
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.notFollowingBackUser  = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";
		let otherUserSlug		=	(req.body.other_user_slug) ? req.body.other_user_slug : "";		
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		
		let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit	= API_DEFAULT_LIMIT;
		
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		
		let followersCondition = {
			followed_by : ObjectId(userId),
			//is_approved : ACTIVE,
			action_type : FOLLOW_ACTION_TYPE,
		}
		const asyncParallel			= require('async/parallel');
		usersFollower.distinct('user_id',followersCondition,(err,followersUserId)=>{
			
			console.log("followersUserId");
			console.log(followersUserId);
			let notFollowingBackCondition = {
				user_id : ObjectId(userId), 
				followed_by :  {$nin : followersUserId}, 
				is_approved : ACTIVE,
				action_type 				: 	FOLLOW_ACTION_TYPE,
				
			}
			
			let searchCondition = {};
			asyncParallel({
				not_following_back_user_list : (callback)=>{
					
					usersFollower.aggregate([
						{
							$match : notFollowingBackCondition
						},
						{
							$lookup:{
								from: TABLE_USERS,
								let: { followedBy: "$followed_by" },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ["$_id", "$$followedBy"] },
													{ $eq: ["$active", ACTIVE] },
												]
											},
										}
									},
									{ $project: { "_id": 1, "full_name": 1,"profile_image":1,"slug":1} }
									
								],
								as: "user_details"
							}
						},
						{
							$project : {
								_id : 1,
								user_id : 1,
								followed_by : 1,
								is_approved : 1,
								is_close_friend : 1,
								created : 1,
								created_date: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
								user_full_name: { $arrayElemAt: ["$user_details.full_name", 0] },
								user_profile_image: { $arrayElemAt: ["$user_details.profile_image", 0] },
								user_slug: { $arrayElemAt: ["$user_details.slug", 0] },
							}
						},
						{
							$match: searchCondition
						}
						
					]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
						
						callback(err, result);
					})
				},
				not_following_back_user_count : (callback)=>{
					usersFollower.countDocuments(notFollowingBackCondition,(err,countResult)=>{
						callback(err, countResult);
					});
				},
				follow_request_count : (callback)=>{
					let followRequestCon = {
						user_id : ObjectId(userId),
						is_approved : DEACTIVE,
						action_type 				: 	FOLLOW_ACTION_TYPE,
					}
					usersFollower.countDocuments(followRequestCon,(err,countResult)=>{
						callback(err, countResult);
					});
				}
				
			},(err, response)=>{
				var totalRecord	= (response['not_following_back_user_count']) ? response['not_following_back_user_count'] : 0;
				var followRequestCount	= (response['follow_request_count']) ? response['follow_request_count'] : 0;
				
				finalResponse = {
					'data': {
						status							: STATUS_SUCCESS,
						followers_list		: (response['not_following_back_user_list']) ? response['not_following_back_user_list'] : [],
						recordsTotal					:	totalRecord,
						followRequestCount					:	followRequestCount,
						limit							: limit,
						page							: page,
						total_page						: Math.ceil(totalRecord/limit),
						user_image_url					: USERS_URL,
					}
				}
				return returnApiResult(req,res,finalResponse);
				
			});
			
			
			
			
		});
		
	
	}
	
}
module.exports = new FollowerFollowing();