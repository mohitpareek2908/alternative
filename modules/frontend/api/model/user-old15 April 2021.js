const userService = require(WEBSITE_SERVICES_FOLDER_PATH+'user_service');
const jwt 			= require('jsonwebtoken');
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


            consoleLog("Condition for login user check ");
            consoleLog(loginUserCondition);
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

                    let viewerUserId					=	(otherUserResponse.result._id)				? 	otherUserResponse.result._id			:"";	

                const userViewLog  = db.collection(TABLE_USER_VIEW_LOG); 

                let viewLogOtions= {
                    viewer_id 			:	ObjectId(viewerUserId),
                    user_id 		    :	ObjectId(userId),
                    counter_stat 		:	ACTIVE
                };
                
                let viewCounteroptions= {
                    _id 			:	ObjectId(userId),
                    counter_stat 		:	ACTIVE
                };



                userViewLog.findOne({ 
                    user_id 			:	ObjectId(userId),
                    viewer_id 		    :	ObjectId(viewerUserId) }, {}, (err, userViewLogData) => {
    
                        consoleLog(userViewLogData);
                        if(!userViewLogData ){
                            consoleLog("Add Entry in Post Log and Update Post View Counter in Post Table");
    
                          addUserViewlog(req,res,viewLogOtions);
                          updateUserViewCounter(req,res,viewCounteroptions);
                        } else{
                            consoleLog("Update Post View LOG posyt view counter onl;y");
                               
                            updateUserViewCounter(req,res,viewLogOtions);
    
                        }
                       
                });





                
         
                        finalResponse = {
                            'data': {
                                status: STATUS_SUCCESS,
                                result: userResponse,
                                message: res.__()
                            }
                        };
                        return returnApiResult(req,res,finalResponse);
                        
                        
                    }); 
    
                });
    
          }





    /** Function for follow Post by user
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
     this.followUser = (req,res,next,callback)=>{
    
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
                    message: res.__("front.system.user_details_has_been_updated_successfully")
                }
            };
            return returnApiResult(req,res,finalResponse);

        });;;
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
            return returnApiResult(req,res,finalResponse);
        });
    };//end getProfileDetail



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
				
				let updateData = {paternal_verification_code : otp};
			
			
				
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







}	
module.exports = new User();
