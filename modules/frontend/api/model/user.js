const userService = require(WEBSITE_SERVICES_FOLDER_PATH+'user_service');
const jwt 			= require('jsonwebtoken');
var crypto          = require('crypto');
const tokenList 	= {};
function User() {

	User = this;
	var currentDate = String(getUtcDate().getDate()).padStart(2, '');





    /** Function for follow Post by user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
     this.viewUser = (req,res,next,callback)=>{
    
            let finalResponse = {};
            req.body                     = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
            let loginUserslug            = (req.body.slug) ? req.body.slug : "";
            let OtheruserSlug            = (req.body.other_user_slug) ? req.body.other_user_slug : "";
            let loginUserData 	         =	(req.user_data) 		?	req.user_data 			:	"";
            let userId			         =	(loginUserData._id)		?	loginUserData._id		:	"";		
                    
            console.log(loginUserslug);
         //   consoleLog(loginUserData);
            /**For check slug */
            if (loginUserslug == '' || userId == '')  {
              
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR_INVALID_ACCESS,
                        message: res.__("api.global.parameter_missing")
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }
            
           
            let loginUserCondition = {
                slug: loginUserslug
            }
            /** Set options data for get user details **/
            let loginUserOptions = {
                conditions	:	loginUserCondition,
                fields		:	{facebook_id :0}
            };


            console.log("Condition for login user check ");
            console.log(loginUserCondition);
        /** Get user details **/
        getUserDetailBySlug(req, res, loginUserOptions).then(userResponse => {
            consoleLog("user reeposne from  getUserDetail");
            
            consoleLog(userResponse);
            
            /** Send error response **/
                if (userResponse.status == STATUS_ERROR) {
                    
                    finalResponse = {
                        'data': {
                            status: STATUS_ERROR,
                            errors: errors,
                            message	:	errors
                        }
                    };
                    return returnApiResult(req,res,finalResponse);
                }
    
                userId					=	(userResponse.result._id)				? 	userResponse.result._id			:"";	

                let otherUserCondition = {
                    slug: OtheruserSlug
                }

                /** Set options data for get user details **/
                let otherUserOptions = {
                    conditions	:	otherUserCondition,
                    fields		:	{facebook_id :0}
                };
    

                 /** Get viewer details **/
                getUserDetailBySlug(req, res, otherUserOptions).then(otherUserResponse => {

                    let otherUserId					=	(otherUserResponse.result._id)				? 	otherUserResponse.result._id			:"";	

					const userViewLog  = db.collection(TABLE_USER_VIEW_LOG); 

					let viewLogOtions= {
						user_id 			:	ObjectId(userId),
						other_user_id 		    :	ObjectId(otherUserId),
						counter_stat 		:	ACTIVE
					};
					
					let viewCounteroptions= {
						_id 			:	ObjectId(userId),
						counter_stat 		:	ACTIVE
					};



						userViewLog.findOne({ 
						user_id 			:	ObjectId(userId),
						other_user_id 		    :	ObjectId(otherUserId) }, {}, (err, userViewLogData) => {
			
								
								if(!userViewLogData ){
									consoleLog("Add Entry in Post Log and Update Post View Counter in Post Table");
			
								  addUserViewlog(req,res,viewLogOtions);
								 // updateUserViewCounter(req,res,viewCounteroptions);
								} else{
									consoleLog("Update Post View LOG posyt view counter onl;y");
									   
								   // updateUserViewCounter(req,res,viewLogOtions);
			
								}
							const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);	
							const asyncParallel			= require('async/parallel');
							asyncParallel({
								
								check_following : (callback)=>{
									
									usersFollower.findOne({
										user_id : ObjectId(otherUserId),
										followed_by : ObjectId(userId),
										action_type : FOLLOW_ACTION_TYPE,
										
									},{},(findErr,findResult)=>{
										
										isfollowing = DEACTIVE;
										findResult = findResult ? findResult : {};
										if(Object.keys(findResult).length > 0){
											isApproved	=	(findResult.is_approved) ? findResult.is_approved : DEACTIVE;
											isCloseFriend	=	(findResult.is_close_friend) ? findResult.is_close_friend : DEACTIVE;
											if(isApproved == ACTIVE)
											{
												isfollowing = ACTIVE; 
											}else if(isApproved == DEACTIVE)
											{
												isfollowing = FOLLOW_REQUEST_PENDING; 
											}
										}
										let returnData = {
											is_close_friend : isCloseFriend,
											is_following : isfollowing,
										}
										callback(err, returnData);
										//callback(err, isfollowing);
									});
									
								},
								is_subscribe : (callback)=>{
									
									usersFollower.findOne({
										user_id : ObjectId(otherUserId),
										followed_by : ObjectId(userId),
										action_type : SUBSCRIBE_ACTION_TYPE,
									
									},{},(findErr,findResult)=>{
										
										isUserSubscribe = DEACTIVE;
										findResult = findResult ? findResult : {};
										if(Object.keys(findResult).length > 0){
										
											isUserSubscribe = ACTIVE; 
											
										}
										callback(err, isUserSubscribe);
									});
									
								}
								
							},(err, response)=>{
								let followData =  (response['check_following']) ? response['check_following'] : "";
								let isfollowing = (followData['is_following']) ? followData['is_following'] : DEACTIVE;
								let isCloseFriend = (followData['is_close_friend']) ? followData['is_close_friend'] : DEACTIVE;
								
								let isUserSubscribe = (response['is_subscribe']) ? response['is_subscribe'] : DEACTIVE;
								finalResponse = {
									'data': {
										status: STATUS_SUCCESS,
										result: otherUserResponse.result,
										image_url: USERS_URL,
										isfollowing: isfollowing,
										isUsersubscribe: isUserSubscribe,
										isCloseFriend: isCloseFriend,
										message: res.__()
									}
								};
								return returnApiResult(req,res,finalResponse);
								
							})
							
							
								
							   
						});

                        
                    }); 
    
                });
    
          }





    /** Function for follow Post by user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
     this.followUnfollowUserOld = (req,res,next,callback)=>{
    
        let finalResponse = {};
        req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let slug            = (req.body.other_user_slug) ? req.body.other_user_slug : "";
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
    getUserDetailBySlug(req, res, slug).then(userResponse => {
        
        /** Send error response **/
            if (userResponse.status == STATUS_ERROR) {
                
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR,
                        errors: errors,
                        message	:	errors
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }

            let requestFromUserId					    =	(userResponse.result._id)				? 	userResponse.result._id			:"";			
            let requestToUserId					        =	userId;  
           

        /** Configure user unique conditions **/
        const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);

  
        usersFollower.insertOne({
                    request_from_user_id 		 : 	ObjectId(requestFromUserId),
                    request_to_user_id	        :	ObjectId(requestToUserId),
                    is_approved 		        :	DEACTIVE,
                    status			            :	 ACTIVE,
                    modified 		            : 	getUtcDate(),
                    created 		            : 	getUtcDate(),
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
                                
                            },
                            message: res.__("users.user_follow_request_added_successfully_message")
                        }
                    };
                    return returnApiResult(req,res,finalResponse);
                    
                    
                })

            });

    }

    
	



    
    /**
	 * Function to save interest category
	 */
    this.saveInterestCategories = (req, res, next, callback) => {
		req.body                = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let slug                = (req.body.slug) ? req.body.slug : "";
        let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
        let categoryId		    =	(req.body.category_id)		?	req.body.category_id.split(",")	:	"";	
        let categoryIds         = [];
        let finalResponse = {};
        /**For check slug */
        if (slug == '' || categoryId=='') {
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    result: {},
                    message: res.__("api.global.parameter_missing")

                }
            };
            return returnApiResult(req,res,finalResponse);
        }
        consoleLog("inside save user category aAPI");
        consoleLog(" ================");
        consoleLog(categoryId);
        /**For save category */
        categoryId.map((records)=>{
            categoryIds.push(ObjectId(records));
        })
       
        
		
        /**For udate user data */
        const users = db.collection(TABLE_USERS);
        users.updateOne({_id: ObjectId(userId)},{$set:{interested_category_id:categoryIds}},(err,result)=>{
            /**For check err */
            if(err){
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR,
                        message: res.__("front.system.something_going_wrong_please_try_again")
    
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }
            /**Send success response */
            finalResponse = {
                'data': {
                    status: STATUS_SUCCESS,
                    message: res.__("front.system.user_interests_has_been_updated_successfully")
                }
            };
            return returnApiResult(req,res,finalResponse);

        });
    };//End saveInterestCategories()



    /**
	 * Function to change Password
	 */
     this.changeUserPassword = (req, res, next, callback) => {
		req.body                = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let slug                = (req.body.slug) ? req.body.slug : "";
        let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
        const users			    = 	db.collection(TABLE_USERS);
        let finalResponse = {};
        /**For check slug */
        if (slug == '' || userId==''  ) {
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    result: {},
                    message: res.__("api.global.parameter_missing")

                }
            };
            return returnApiResult(req,res,finalResponse);
        }

        let password		= (req.body.password)			? req.body.password			: "";
        let confirmPassword	= (req.body.confirm_password)	? req.body.confirm_password	: "";
        let oldPassword		= (req.body.old_password)		? req.body.old_password		: "";

        try{
            users.findOne({
                    is_deleted	:	NOT_DELETED,
                    slug		:	slug,
                },
                {projection: {_id:1,email:1,password:1}},
                (errs,emailResult)=>{

                    if(emailResult){
                        if(oldPassword !=""){
                            try{

                                bcryptCheckPasswordCompare(oldPassword,emailResult.password).then(function(passwordMatch) {

                                    if(!passwordMatch){
                                        /** Send error response **/
                                        finalResponse = {
                                            'data': {
                                                status: STATUS_ERROR,
                                                result: {},
                                                message: res.__("admin.user_profile.old_password_you_entered_did_not_matched")
                            
                                            }
                                        };

                                        return returnApiResult(req,res,finalResponse);
                                      
                                    }

                            
                                            /** update admin's profile details **/
                                            bcryptPasswordGenerate(password).then(function(bcryptPassword) {
                                        //	newPassword  = crypto.createHash("md5").update(password).digest("hex");
                                            
                                            let insertData = {
                                                password 		: bcryptPassword,
                                                modified 		: getUtcDate()
                                            };
                                            
                                           
                                            users.updateOne({
                                                    _id : ObjectId(userId)
                                                },
                                                {$set: insertData},
                                                (err,result)=>{
                                                    if(!err){
                                                                /** Send success response **/
                                                        finalResponse = {
                                                            'data': {
                                                                status: STATUS_SUCCESS,
                                                                result: {},
                                                                message: res.__("admin.user.password_changed_successfully")
                                            
                                                            }
                                                        };
                
                                                        return returnApiResult(req,res,finalResponse);
                                                       
                                                    
                                                     
                                                    }else{
                                                        /** Send error response **/
                                                        finalResponse = {
                                                            'data': {
                                                                status: STATUS_SUCCESS,
                                                                result: {},
                                                                message: res.__("admin.system.something_going_wrong_please_try_again")
                                            
                                                            }
                                                        };
                
                                                        return returnApiResult(req,res,finalResponse);

                                                     
                                                    }
                                                });




                                        }).catch(next);	
                                    
                                
                                });
                            }catch(e){
                                /** Send error response **/
                              
                                finalResponse = {
                                    'data': {
                                        status: STATUS_SUCCESS,
                                        result: {},
                                        message: res.__("admin.system.something_going_wrong_please_try_again")
                    
                                    }
                                };

                                return returnApiResult(req,res,finalResponse);

                            }
                        }else{
                            finalResponse = {
                                'data': {
                                    status: STATUS_SUCCESS,
                                    result: {},
                                    message: res.__("admin.system.something_going_wrong_please_try_again")
                
                                }
                            };

                            return returnApiResult(req,res,finalResponse);

                        }
                    }else{
                        finalResponse = {
                            'data': {
                                status: STATUS_SUCCESS,
                                result: {},
                                message: res.__("admin.system.something_going_wrong_please_try_again")
            
                            }
                        };

                        return returnApiResult(req,res,finalResponse);

                    }
                }
            );
        }catch(e){
            finalResponse = {
                'data': {
                    status: STATUS_SUCCESS,
                    result: {},
                    message: res.__("admin.system.something_going_wrong_please_try_again")

                }
            };

            return returnApiResult(req,res,finalResponse);
        }



    };//End changeUserPassword()





     /** Function for follow Post by user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
      this.deleteUser = (req,res,next,callback)=>{
    
        let finalResponse = {};
        req.body                     = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
        let loginUserslug            = (req.body.slug) ? req.body.slug : "";
        let accountDeleteReason      = (req.body.account_delete_reason) ? req.body.account_delete_reason : "";
        let OtheruserSlug            = (req.body.other_user_slug) ? req.body.other_user_slug : "";
        let loginUserData 	         =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			         =	(loginUserData._id)		?	loginUserData._id		:	"";		
                
        consoleLog(loginUserslug);
     //   consoleLog(loginUserData);
        /**For check slug */
        if (loginUserslug == '' || userId == '')  {
          
            finalResponse = {
                'data': {
                    status: STATUS_ERROR_INVALID_ACCESS,
                    message: res.__("api.global.parameter_missing")
                }
            };
            return returnApiResult(req,res,finalResponse);
        }
        
       
        let loginUserCondition = {
            slug: loginUserslug
        }
        /** Set options data for get user details **/
        let loginUserOptions = {
            conditions	:	loginUserCondition,
            fields		:	{facebook_id :0}
        };

        let reasonIds         = [];
        accountDeleteReason.map((records)=>{
            reasonIds.push(ObjectId(records));
        })   
     
    /** Get user details **/
    getUserDetailBySlug(req, res, loginUserOptions).then(userResponse => {
        consoleLog("user reeposne from  getUserDetail");
        
        consoleLog(userResponse);
        
        /** Send error response **/
            if (userResponse.status == STATUS_ERROR) {
                
                finalResponse = {
                    'data': {
                        status: STATUS_ERROR,
                        errors: errors,
                        message	:	errors
                    }
                };
                return returnApiResult(req,res,finalResponse);
            }

               
            let userId					=	(userResponse.result._id)				? 	userResponse.result._id			:"";	
            let userEmailAddress	    =	(userResponse.result.email)				? 	userResponse.result.email			:"";	
            let updatedEmailAddress      =   "Delete-"+userId+"-"+userEmailAddress  
            


            let otherUserCondition = {
                slug: OtheruserSlug
            }

            
            let updateData = {
                email                   : updatedEmailAddress,
                account_delete_reason   : reasonIds,
                active                  : DEACTIVE,
                is_deleted              : ACTIVE,
                deleted_at              :   getUtcDate(),
                modified                : getUtcDate()

            }
           
        /** Configure user unique conditions **/
        const users            = db.collection(TABLE_USERS);


        try{
        users.updateOne({
                _id: ObjectId(userId)
            },{ $set:updateData },(err, result)=>{
    

                    if (err) {
                
                        finalResponse = {
                            'data': {
                                status: STATUS_ERROR,
                              
                                message	:res.__("system.something_going_wrong_please_try_again")
                            }
                        };
                        return returnApiResult(req,res,finalResponse);
                    }else{


                        finalResponse = {
                            'data': {
                                status: STATUS_SUCCESS,
                               
                                message: res.__("user.user_has_been_deleted_successfull")
                            }
                        };
                        return returnApiResult(req,res,finalResponse);



                    }
    
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

      }




      	
	/**
     * function for get user profile detail
     *
     * param slug
     * */
    this.getMyProfileDetail = (req, res, next, callback) => {
        let slug = (req.body.slug) ? req.body.slug : '';
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id) ? loginUserData._id : "";
        let finalResponse = {};
        if (!slug) {
            finalResponse = {
                'data': {
                    status: STATUS_ERROR,
                    errors: "",
                    message: res.__("front.system.invalid_access"),
                }
            };
            return returnApiResult(req,res,finalResponse);
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
		const asyncParallel 		= 	require("async/parallel");
		const postCollection = db.collection(TABLE_POSTS);
		asyncParallel({
			get_user_data:(callback)=>{
				getUserDetailBySlug(req, res, userOptions).then(response => {
					response['result']['image_url']	=	USERS_URL;
					callback(null, response.result);
				})
				
			},
			/*image_post : (callback)=>{
				postCollection.find({
					user_id : ObjectId(userId),
					post_type : POST_TYPE_IMAGE,
					is_deleted : DEACTIVE,
					status : ACTIVE
				},{}).toArray((err,result)=>{
					callback(err, result);
				})
			},
			video_post : (callback)=>{
				postCollection.find({
					user_id : ObjectId(userId),
					post_type : POST_TYPE_VIDEO,
					is_deleted : DEACTIVE,
					status : ACTIVE
				},{}).toArray((err,result)=>{
					callback(err, result);
				})
			}*/
		},(err,response)=>{
			
			var user_data	= (response['get_user_data']) ? response['get_user_data'] : {};
			//var image_post	= (response['image_post']) ? response['image_post'] : {};
			//var video_post	= (response['video_post']) ? response['video_post'] : {};
			
			finalResponse = {
                'data': {
                    status: STATUS_SUCCESS,
                    result		: user_data,
                   // image_post	: image_post,
                    //video_post	: video_post,
					post_url	: POSTS_URL,
                    image_url: USERS_URL,
                    message: 'user data',
                }
            };
            return returnApiResult(req,res,finalResponse);
		})
		
    };//end getProfileDetail

	
	/**
     * function for get user profile image list
     *
     * param slug
     * */
    this.getMyProfileImageList = async(req, res, next, callback) => {
		
		let loginUserData 		=	(req.user_data) 		?	req.user_data 			:	"";
		let loginUserId			=	(loginUserData._id) 	? 	loginUserData._id 		: 	"";
		let loginUserRoleType	=	(loginUserData.user_type) 	? 	loginUserData.user_type 		: 	"";
		let loginUserSlug		=	(loginUserData.slug) 	? 	loginUserData.slug 		: 	"";
		let otherUserSlug  	 	= 	(req.body.other_user_slug) ? req.body.other_user_slug : "";
		let isFollow 			= 	(req.body.is_follow) 		? req.body.is_follow : DEACTIVE;
		let isCloseFriend 		= 	(req.body.is_close_friend) 		? req.body.is_close_friend : DEACTIVE;
		let finalResponse 		= 	{};
		
		let userCondition = {
			slug: otherUserSlug
		}
		/** Set options data for get user details **/
		let userOptions = {
			conditions	:	userCondition,
			fields		:	{facebook_id :0}
		};
		let roleCategotyId  = await getLoginUserCategoryId(res,res,loginUserData);
		
        /** Get user details **/
        getUserDetailBySlug(req, res, userOptions).then(userResponse => {
			if(userResponse.status != STATUS_SUCCESS  && !userResponse.result){
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						errors: "",
						message: res.__("system.something_going_wrong_please_try_again2"),
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
			let userData = (userResponse.result) ? userResponse.result : {};
			let userId	=	(userData._id) ? userData._id : "";
			
			if(userId == ""){
				 finalResponse = {
					'data': {
						status: STATUS_ERROR,
						errors: "",
						message: res.__("front.system.invalid_access"),
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
			const asyncParallel 		= 	require("async/parallel");
			const postCollection = db.collection(TABLE_POSTS);
			let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
			let limit	= API_DEFAULT_LIMIT;
			
			let skip	=	(limit * page) - limit;
			limit		=	limit;
			let imagePostCondition = {};
			let privacyArr = [POST_PRIVACY_PUBLIC];
			imagePostCondition = {
				user_id : ObjectId(userId),
				post_type : POST_TYPE_IMAGE,
				is_deleted : DEACTIVE,
				status : ACTIVE
			}
			
			
			if(loginUserSlug != otherUserSlug)
			{
				imagePostCondition[loginUserRoleType] = {$in : roleCategotyId};
				if(isFollow == ACTIVE)
				{	privacyArr.push(POST_PRIVACY_FRIENDS)
					imagePostCondition["privacy"] =  {$in : privacyArr};
				}
				if(isCloseFriend == ACTIVE)
				{
					privacyArr.push(POST_PRIVACY_CLOSE_FRIENDS)
					imagePostCondition["privacy"] =  {$in : privacyArr};
				}

				imagePostCondition["privacy"] =  {$in : privacyArr};
			}
			console.log("imagePostCondition");
			console.log(imagePostCondition);
			

			asyncParallel({
				image_post : (callback)=>{
					postCollection.aggregate([
						{
							$match : imagePostCondition
						},
						{ $lookup: {
							from: TABLE_CATEGORIES,
							let: { interest_ids: "$interest_ids" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $in: ["$_id", "$$interest_ids"] },
											]
										},
									}
								},
								{ $project: { "name": 1} }
							],
							as: "interest_detail"
						}},
						{$project:{
							_id		:	1,
							title	:	1,
							description	:	1,
							post_media	:	1,
							interest_ids	:	1,
							age_type	:	1,
							adult	:	1,
							teen	:	1,
							kid	:	1,
							post_view_count	:	1,
							interest_id_name			:	"$interest_detail.name",
						}}
					]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
						callback(err, result);
						
					})
					//postCollection.find(imagePostCondition,{}).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
						//callback(err, result);
					//})
				},
				image_post_count : (callback)=>{
					/** Get total number of records in post image type collection user_id : ObjectId(userId) **/
					postCollection.countDocuments(imagePostCondition,(err,countResult)=>{
						callback(err, countResult);
					});
				},
				user_like_post_id : (callback)=>{
					/** Get post id there are like by this user **/
					let likeOptions = {
						login_user_id : loginUserId
					}
					userLikedPostId(req,res,likeOptions).then(likeResponse => {
						let likePostId = (likeResponse.result) ? likeResponse.result : "";
						callback(null, likePostId);
					})
				},
				user_save_post_id : (callback)=>{
					/** Get post id there are save by this user **/
					let saveOptions = {
						login_user_id : loginUserId
					}
					userSavedPostId(req,res,saveOptions).then(saveResponse => {
						let savePostId = (saveResponse.result) ? saveResponse.result : "";
						callback(null, savePostId);
					})

				},
			},(err,response)=>{
				consoleLog(response['image_post']);
				if(response['image_post'].length>0){
					
					let totalRecord	= (response['image_post_count']) ? response['image_post_count'] : 0;
					let userLikePostId	= (response['user_like_post_id']) ? response['user_like_post_id'] : {};
					let userSavePostId	= (response['user_save_post_id']) ? response['user_save_post_id'] : {};
				
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							image_post	: (response['image_post']) ? response['image_post'] : "",
							recordsTotal	: totalRecord,
							limit			: limit,
							page			: page,
							liked_post_id	: userLikePostId,
							save_post_id	: userSavePostId,
							post_url	: POSTS_URL,
							image_url: USERS_URL,
							message: 'user data',
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				}else{
					 finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							errors: "",
							
							message: res.__("No Record Found."),
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
				
				
			})
				
			
			
			
		})
		
		
	}
	
	
	/**
     * function for get user profile video list
     *
     * param slug
     * */
    this.getMyProfileVideoList = async(req, res, next, callback) => {
		
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let loginUserId			=	(loginUserData._id) 	? 	loginUserData._id 		: 	"";
		let loginUserRoleType		=	(loginUserData.user_type) 	? 	loginUserData.user_type 		: 	"";
		let loginUserSlug		=	(loginUserData.slug) 	? 	loginUserData.slug 		: 	"";
		let otherUserSlug   = 	(req.body.other_user_slug) ? req.body.other_user_slug : "";
		let isFollow 			= 	(req.body.is_follow) 		? req.body.is_follow : DEACTIVE;
		let finalResponse = {};
		let userCondition = {
			slug: otherUserSlug
		}
		/** Set options data for get user details **/
		let userOptions = {
			conditions	:	userCondition,
			fields		:	{facebook_id :0}
		};
		let roleCategotyId  = await getLoginUserCategoryId(res,res,loginUserData);
        /** Get user details **/
        getUserDetailBySlug(req, res, userOptions).then(userResponse => {
			if(userResponse.status != STATUS_SUCCESS  && !userResponse.result){
				finalResponse = {
					'data': {
						status: STATUS_ERROR_INVALID_ACCESS,
						errors: "",
						message: res.__("system.something_going_wrong_please_try_again2"),
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
			let userData = (userResponse.result) ? userResponse.result : {};
			let userId	=	(userData._id) ? userData._id : "";
				
			if(userId == ""){
				 finalResponse = {
					'data': {
						status: STATUS_ERROR,
						errors: "",
						message: res.__("front.system.invalid_access"),
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
			const asyncParallel 		= 	require("async/parallel");
			const postCollection = db.collection(TABLE_POSTS);
			let	page 	= (req.body.page)		? parseInt(req.body.page)	: 1;
			let limit	= API_DEFAULT_LIMIT;
			
			let skip	=	(limit * page) - limit;
			limit		=	limit;
			let privacyArr = [POST_PRIVACY_PUBLIC];
			let videoPostCondition = {
				user_id : ObjectId(userId),
				post_type : POST_TYPE_VIDEO,
				is_deleted : DEACTIVE,
				status : ACTIVE
			}
			if(loginUserSlug != otherUserSlug)
			{
				videoPostCondition[loginUserRoleType] = {$in : roleCategotyId};
				if(isFollow == ACTIVE)
				{	privacyArr.push(POST_PRIVACY_FRIENDS)
					videoPostCondition["privacy"] =  {$in : privacyArr};
				}else{
					videoPostCondition["privacy"] =  {$in : privacyArr};
				}
			}
		console.log("videoPostCondition")
		console.log(videoPostCondition)
			asyncParallel({
				video_post : (callback)=>{
					
					postCollection.find(videoPostCondition,{}).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
						callback(err, result);
					})
				},
				video_post_count : (callback)=>{
					/** Get total number of records in post image type collection user_id : ObjectId(userId) **/
					postCollection.countDocuments(videoPostCondition,(err,countResult)=>{
						callback(err, countResult);
					});
				},
				user_like_post_id : (callback)=>{
					/** Get post id there are like by this user **/
					let likeOptions = {
						login_user_id : loginUserId
					}
					userLikedPostId(req,res,likeOptions).then(likeResponse => {
						let likePostId = (likeResponse.result) ? likeResponse.result : "";
						callback(null, likePostId);
					})
				},
				user_save_post_id : (callback)=>{
					/** Get post id there are save by this user **/
					let saveOptions = {
						login_user_id : loginUserId
					}
					userSavedPostId(req,res,saveOptions).then(saveResponse => {
						let savePostId = (saveResponse.result) ? saveResponse.result : "";
						callback(null, savePostId);
					})

				},
			},(err,response)=>{
				
				if(response['video_post'].length>0){
					
					var totalRecord	= (response['video_post_count']) ? response['video_post_count'] : 0;
					let userLikePostId	= (response['user_like_post_id']) ? response['user_like_post_id'] : {};
					let userSavePostId	= (response['user_save_post_id']) ? response['user_save_post_id'] : {};
					
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							video_post	: (response['video_post']) ? response['video_post'] : "",
							recordsTotal	: totalRecord,
							limit			: limit,
							page			: page,
							liked_post_id	: userLikePostId,
							save_post_id	: userSavePostId,
							post_url		: POSTS_URL,
							image_url		: USERS_URL,
							message: 'user data',
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				}else{
					 finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							
							errors: "",
							message: res.__("No Record Found."),
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
				
				
			})
		})
	}
	
	
	

    /**
	 * Function for resend otp
	 * @param req	As	Request Data
	 * @param res	As	Response Data
	 * @param next	As	Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.otpForPaternalControl = (req,res,next,callback)=>{
		
		/** Sanitize Data **/
		req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		let slug			= 	(req.body.slug)				?	req.body.slug		:"";
        let page			= 	(req.body.page)				?	req.body.page		:"";
		let otpFor			= 	(req.body.otp_for)			?	req.body.otp_for		:OTP_FOR_EMAIL;
        let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let email           =   (loginUserData.email)		?	loginUserData.email		:	"";		
        let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		

		
		let finalResponse	=	{};
		if(!slug){
			
			finalResponse = {
				'data': {
					status: STATUS_ERROR_INVALID_ACCESS,
					errors: "",
					message: res.__("system.something_going_wrong_please_try_again1"),
				}
			};
			return returnApiResult(req,res,finalResponse);
			
		} 

		
		/** Set user conditions **/
		let userConditions = {
			user_role_id :	{$in : [KIDS_USER_ROLE_ID]},
			is_deleted	 :	NOT_DELETED
		};

		if(page == FORGOT_PASSWORD_PAGE_TYPE){
			userConditions["email"] = email;
		}else if(page == VERIFY_ACCOUNT_PAGE_TYPE){
			userConditions["email"] = email;   
		}else{
			userConditions["email"] = ObjectId(userId);
		}
		
		/** Set options for get user details **/
		let options = {
			conditions	:	userConditions,
			fields		:	{_id:1,mobile_number:1,phone_country_code:1,email:1,full_name:1}
		};


        let conditions = {
			slug : slug
		}
		/** Set options data for get user details **/
		let userOptions = {
			conditions	:	conditions,
			fields		:	{facebook_id :0,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,password:0,modified:0}
		};
		getUserDetailBySlug(req, res, userOptions).then(response => {

			
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

                var validateString 		= crypto.createHash('md5').update(currentTimeStamp + email).digest("hex");
				
				let updateData = {paternal_verification_code : otp,validate_string:validateString};
			
			
				
				updateData['otp_verification_code_time'] = nextDay;

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

                        consoleLog(emailOptions);
						/** Send email **/
						sendMail(req, res, emailOptions);
						var successMessage = res.__("front.user.forgot_password_email_sent_successfully");
					}
					
					/** Send success response **/
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							OTP: otp,
                            validate_string: validateString,
							message: successMessage,
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				});
			}).catch(next);
		}).catch(next);
	
	};//End resendOtp()

	
	





}	
module.exports = new User();
