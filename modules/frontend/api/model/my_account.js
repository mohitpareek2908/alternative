function MyAccount() {

	MyAccount = this;

	/**
	 * Function for update user(driver) location
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.updateUserLocation  = (req,res,next)=>{
		return new Promise(resolve=>{
			/** Sanitize Data **/
			req.body 		=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let userId		=	(req.body.user_id)		? req.body.user_id					:"";
			let latitude	=	(req.body.latitude)		? parseFloat(req.body.latitude)		:0;
			let longitude	=	(req.body.longitude)	? parseFloat(req.body.longitude)	:0;
			
			if(!userId  || !latitude || !longitude){
				/** Send error response **/
				return resolve({
					status	: 	STATUS_ERROR, 
					message	:	res.__("system.missing_parameters")
				});
			}
			
			/** Update user location **/
			const users = db.collection('users');
			users.updateOne({
				_id 		 : ObjectId(userId),
				user_role_id : DRIVER_USER_ROLE_ID
			},
			{$set: {
				latitude	: 	latitude,
				longitude	: 	longitude,
				long_lat 	:	[longitude,latitude],
				modified 	:	getUtcDate()
			}},(err,updateResult)=>{
				if(err)	return next(err);
				
				/** Send success response **/
				resolve({
					status		: STATUS_SUCCESS,
					message 	: res.__("user.location_updated"),
				});
			});
		});
	};//End updateUserLocation()
	
	/**
	 * Function to update user availability status
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As next to the middleware function
	 *
	 * @return json
	 **/
    this.updateUserAvailabilityStatus = (req, res, next)=>{
		/** Sanitize Data **/
		req.body 	=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		let userId 	= 	(req.body.user_id)	? req.body.user_id	:"";
		let status 	= 	(req.body.status)	? req.body.status	:"";
		
		if(!userId || !status){
			/** Send error response **/
			return resolve({
				status	: 	STATUS_ERROR, 
				message	:	res.__("system.missing_parameters")
			});
		}
			
		/**/
		let updatedData	=	{
			is_online : parseInt(status)
		};
		
		if(status == OFFLINE) updatedData["is_available"] = NOT_AVAILABLE;
		
		/** Update user availability status **/
		const users	 =	db.collection("users");
		users.updateOne({_id : ObjectId(userId)},{$set: updatedData},(updateErr,updateResult)=>{
			if(updateErr) return next(updateErr);
			
			if(status != OFFLINE){
				/** check user is available or not **/
				MyAccount.checkUserAvailability(req,res,{user_id : userId}).then(response=>{
					if(response.status == STATUS_SUCCESS){
						/** Mark user as available **/
						users.updateOne({
							_id : ObjectId(userId)
						},{
							$set : {
								is_available : response.is_available
							}
						});
					}					
				});
			}

			/** Send success response **/
			resolve({
				status	: STATUS_SUCCESS,
				message : res.__("user.availability_status_has_been_changed_successfully")
			});
		});
	};//End updateUserAvailabilityStatus();
	
	/**
	 * Function to check user availability
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 * @param options	As Object Data
	 *
	 * @return json
	 **/
	this.checkUserAvailability = (req,res,options) =>{
		return new Promise(resolve=>{
			let userId	= (options.user_id) ? options.user_id :"";
			
			if(!userId){
				/** Send error response **/
				return resolve({
					status	: 	STATUS_ERROR, 
					options :	options, 
					message	:	res.__("system.something_going_wrong_please_try_again")
				});
			} 
			
			/** Check in rides table that driver does not have any ride "in process" **/
			const ride_managements =	db.collection("ride_managements");
			ride_managements.countDocuments({
				driver_id	: ObjectId(userId),
				ride_status : RIDE_INPROCESS
			},(rideErr, rideCount)=>{
				if(rideErr){
					return resolve({
						status	: 	STATUS_ERROR, 
						options :	options, 
						message	:	res.__("system.something_going_wrong_please_try_again")
					});
				}				
				
				if(rideCount > 0){
					/** Send success response **/
					return resolve({
						status		:	STATUS_SUCCESS, 
						options 	:	options, 
						is_available: 	NOT_AVAILABLE
					});
				}
				
				/** Check in ride logs table that driver does not have any assigned ride **/
				const ride_assignment_logs = db.collection("ride_assignment_logs");
				ride_assignment_logs.countDocuments({
					user_id 		: 	ObjectId(userId),
					user_role_id 	: 	DRIVER_USER_ROLE_ID,
					status			: 	RIDE_ASSIGNED,
				},(logErr, logCount)=>{
					if(logErr){
						return resolve({
							status	: 	STATUS_ERROR, 
							options :	options, 
							message	:	res.__("system.something_going_wrong_please_try_again")
						});
					}	
					
					if(logCount > 0){
						/** Send success response **/
						return resolve({
							status		:	STATUS_SUCCESS, 
							options 	:	options, 
							is_available: 	NOT_AVAILABLE
						});
					}
					
					/** Send success response **/
					resolve({
						status		:	STATUS_SUCCESS, 
						options 	:	options, 
						is_available: 	AVAILABLE
					});
				});
			});	
		});
	}// end checkUserAvailability()
	
	/**
	 * Function to update user password
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.changePassword = (req, res,next)=>{
		return new Promise(resolve=>{
			/** Sanitize Data **/
			req.body 	= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let userId	= 	(req.body.user_id)	?	req.body.user_id :"";
			
			if(!userId){
				/** Send error response **/
				return resolve({
					status	: 	STATUS_ERROR, 
					message	:	res.__("system.missing_parameters")
				});
			} 
					
			/** Check validation **/
			req.checkBody({
				"old_password": {
					notEmpty		:	true,
					errorMessage	: 	res.__("user.please_enter_old_password")
				},
				"password"	: {
					notEmpty	: 	true,
					isLength	:	{
						options			: PASSWORD_LENGTH,
						errorMessage	: res.__("user.password_length_should_be_minimum_6_character")
					},
					errorMessage	:	res.__("user.please_enter_password")
				},
				"confirm_password"	:{
					notEmpty		: 	true,
					isLength		:	{
						options			: 	PASSWORD_LENGTH,
						errorMessage	:	res.__("user.confirm_password_length_should_be_minimum_6_character")
					},
					errorMessage	:	res.__("user.please_enter_confirm_password")
				},
			});

			req.checkBody('confirm_password', res.__("user.confirm_password_should_be_same_as_password")).equals(req.body.password);
			
			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			
			/** Send error response **/
			if(errors) return resolve({status : STATUS_ERROR, message : errors});
					
			const crypto 		=	require('crypto');
			let password		= 	(req.body.password)		? 	req.body.password		:"";
			let oldPassword		= 	(req.body.old_password)	?	req.body.old_password	:"";
			let newPassword		= 	crypto.createHash('md5').update(password).digest("hex");
			oldPassword			= 	crypto.createHash('md5').update(oldPassword).digest("hex");
			
			/** Set options for get user details **/
			let options = {
				conditions	:	{
					_id			:	ObjectId(userId),
					password	: 	oldPassword,
					is_deleted	: 	NOT_DELETED,
				},
				fields	:	{_id :1}
			};

			/** Get user details **/
			const RegistrationModel	=	require(WEBSITE_MODULES_PATH+"api/model/registration");
			RegistrationModel.getUserData(req,res,options).then(response=>{
				if(response.status != STATUS_SUCCESS) return next(response.message);
				
				let resultData	=	(response.result) ? response.result :"";
				if(!resultData){
					return resolve({
						status	:	STATUS_ERROR,
						message	:	[{'param':'old_password','msg':res.__("user.sorry_the_password_you_have_provided_is_wrong_take_a_bit_of_time_think_and_try_again")}],
					});
				}
				
				/** Update user password **/
				let resultId  = (resultData._id) ? resultData._id  :"";
				const users = db.collection('users');
				users.updateOne({
						_id : ObjectId(resultId)
					},
					{$set: {
						password : newPassword,
						modified : getUtcDate()
					}},(updateErr,updateResult)=>{
						if(updateErr) return next(updateErr);
						
						/** Send success response **/
						resolve({
							status	: STATUS_SUCCESS,
							message : res.__("user.success_your_password_has_been_changed_successfully"),
						});
					}
				);
			}).catch(next);			
		});
	};//End changePassword()
}	
module.exports = new MyAccount();
