function Notification() {

	/**
	 * Function for get notifications
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 * @param next	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.getNotifications = (req,res,next,callback)=>{
		let finalResponse = {};
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
		// let limit	= (res.locals.settings['Site.front_record_limit']) ? parseInt(res.locals.settings['Site.front_record_limit']): 0;
		
		let skip	=	(limit * page) - limit;
		limit		=	limit;
		
		
		const notifications = db.collection(TABLE_NOTIFICATIONS);
		const async	= require('async');
		async.parallel([
			(callback)=>{
				/** Get notifications list  **/

				notifications.aggregate([
					{
						$match : {user_id : ObjectId(userId)}
					},
					{$lookup : {
						from 			: TABLE_USERS,
						localField 		: "created_by",
						foreignField 	: "_id",
						as 				: "user_details",
					}},
					{$lookup : {
						from 			: TABLE_POSTS,
						localField 		: "post_id",
						foreignField 	: "_id",
						as 				: "post_details",
					}},
					{$project : {
							message:1,
							is_seen:1,
							is_read:1,
							created:1,
							title:1,
							notification_type:1,
							notification_action:1,
							request_status:1,
							extra_parameters:1,
						
							user_name	:	{$arrayElemAt : ["$user_details.full_name",0]},
							user_profile_image	:	{$arrayElemAt : ["$user_details.profile_image",0]},
							user_slug	:	{$arrayElemAt : ["$user_details.slug",0]},
							post_slug	:	{$arrayElemAt : ["$post_details.slug",0]},
						
						}
					}
					]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
					if(err) return callback(err, []);
					if(!result) return callback(null, []);
					
					let finalResult = [];
					finalResult = result.map(records => {
						records['day_ago'] = getTimeAgo(records.created);
						records['created'] = (records.created) ? newDate(records.created,DATE_TIME_FORMAT_EXPORT) : "";
						//let newDatecheck = getTimeAgo(records.created);
						//console.log("newDatecheck "+newDatecheck);
						
						return records;
					})
					
					let notificationIds = 	result.map(records=>{
												return (records._id) ? ObjectId(records._id) :"";
											});
					/** Update notification read status **/
					notifications.updateMany({_id:{$in:notificationIds},is_read:NOT_READ},{$set:{is_read:READ}},(errs,results)=>{});
					
					callback(null, finalResult);
					
					/**Function to genrate notification url *
					generateNotificationUrl(req,res,{result:result}).then((response)=>{
						callback(null, response.data);
					});*/
				});
			},
			(callback)=>{
				/** Get total number of records in notifications collection user_id : ObjectId(userId) **/
				notifications.countDocuments({user_id : ObjectId(userId)},(err,countResult)=>{
					callback(err, countResult);
				});
			},
			(callback)=>{
				/** Get total number of records in notifications collection with skip **/
				notifications.find({user_id : ObjectId(userId)}).skip(skip).count((err,countResult)=>{
					callback(err, countResult);
				});
			}
		],
		(err, response)=>{
			if(err) return next(err);
			/** Send response **/
			 
			if(response[0].length>0){
				var totalRecord	= (response[1]) ? response[1] : 0;
				finalResponse = {
					'data': {
						status			: STATUS_SUCCESS,
						notifications	: (response[0]) ? response[0] : [],
						recordsTotal	: (response[1]) ? response[1] : 0,
						recordsSkipTotal: (response[2]) ? response[2] : 0,
						user_image_url	: USERS_URL,
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
						notifications	: [],
						recordsTotal	: 0,
						recordsSkipTotal: 0,
						limit			: limit,
						page			: page,
						message		 	: res.__("api.global.no_record_found"),
						total_page		: 0
					}
				};
				//return callback(finalResponse);
				return returnApiResult(req,res,finalResponse);
			}
		});
	};//End getNotifications()


	/**
	 * Function for delete notifications
	 * @param req As Request Data
	 * @param res As Response Data
	 * @param next	As 	Callback argument to the middleware function
	 * @return render/json
	 */
	this.deleteNotifications = (req,res,next,callback)=>{
		/** get user id get **/
		let finalResponse = {}
		req.body            = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";
		let deleteFlag     	= 	(req.body.delete_all) ? req.body.delete_all : DEACTIVE;
		let notificationId   = 	(req.body.notification_id) ? req.body.notification_id : "";


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

		let deleteCondition ={};

			if(deleteFlag == DEACTIVE)
			{
				deleteCondition = {
							"_id": ObjectId(notificationId),						
							"user_id" : ObjectId(userId)
				};
			}else{
				deleteCondition = {					
					"user_id" : ObjectId(userId)
					};
			}
			
				console.log(deleteCondition);

		
			const notifications = db.collection(TABLE_NOTIFICATIONS);			
			notifications.deleteMany(deleteCondition,(err,result)=>{
				if(err) return next(err);
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
						result: {},
						message: res.__("front.notifications.notification_has_been_delete_successfully")
					}
				};
				return returnApiResult(req,res,finalResponse);
			});
	};//End deleteNotifications()
	
	
	/**
	 * Function for user on/off notifications
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 * @param next	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.userOnOffNotifications = (req,res,next,callback)=>{
		/** get user id get **/
		let finalResponse = {}
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";
		let userOnOffStatus	=	(req.body.status)		?	req.body.status			:	OFF_NOTIFICATION_STATUS;
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
		
		/** Message send accourding to status*/
		let message	=	res.__("front.notifications.notification_has_been_off_successfully");
		if(userOnOffStatus==ON_NOTIFICATION_STATUS){
			message	=	res.__("front.notifications.notification_has_been_on_successfully");
		}
		 
		const usersCollection = db.collection(TABLE_USERS);
		usersCollection.updateOne({
			_id : ObjectId(userId)
		},
		{$set	: {
			on_off_status	:	Number(userOnOffStatus)
		}},(updateErr,updateResult)=>{
			finalResponse = {
				'data': {
					status	: STATUS_SUCCESS,
					message	: message
				}
			};
			return callback(finalResponse);
		});
	};//End userOnOffNotifications()
	
}
module.exports = new Notification();