function notification() {

	Notification = this;

	/**
	 * Function to get notification list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.list = (req, res)=>{
		if(isPost(req)){
			let limit			= 	(req.body.length)		? 	parseInt(req.body.length)	: ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start)		? 	parseInt(req.body.start)	: DEFAULT_SKIP;
			let fromDate 		= 	(req.body.fromDate)		?	req.body.fromDate 			: "";
			let toDate 			= 	(req.body.toDate)		? 	req.body.toDate 			: "";
			let authId			=	(req.session.user._id)	?	req.session.user._id		:"";
			const collection	=	db.collection('notifications');

			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Set common conditions **/
				let	commonConditions = {
					user_id	:	ObjectId(authId)
				};

				/** Conditions for date */
				if (fromDate != "" && toDate != "") {
					dataTableConfig.conditions["created"] = {
						$gte 	: newDate(fromDate),
						$lte 	: newDate(toDate),
					}
				}

				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);

				const async	= require('async');
				async.parallel([
					(callback)=>{
						/** Get list of notification **/
						collection.aggregate([
							{$match	: commonConditions},
							{$lookup :{
								"from" 			: "users",
								"localField"	: "created_by",
								"foreignField"	: "_id",
								"as" 			: "users_created_by"
							}},
							{$project :{
								_id:1,message:1,created:1,created_by:1,created_role_id:1,user_role_id:1,user_id:1,url:1,extra_parameters:1,is_read:1,
								created_by_name	: {$arrayElemAt : ["$users_created_by.full_name",0]},
							}},
							{$match	: dataTableConfig.conditions},
							{$sort  : dataTableConfig.sort_conditions},
							{$skip 	: skip},
							{$limit : limit},
						]).toArray((err, result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in notification collection **/
						collection.countDocuments(commonConditions,(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in notification **/
						collection.aggregate([
							{$match	: commonConditions},
							{$lookup :{
								"from" 			: "users",
								"localField"	: "created_by",
								"foreignField"	: "_id",
								"as" 			: "users_created_by"
							}},
							{$project :{
								_id:1,message:1,created:1,created_by:1,created_role_id:1,user_role_id:1,user_id:1,
								created_by_name	: {$arrayElemAt : ["$users_created_by.full_name",0]},
							}},
							{$match	: dataTableConfig.conditions},
							{$count : "count"},
						]).toArray((err, filterContResult)=>{
							filterContResult	=	(filterContResult && filterContResult[0] && filterContResult[0].count)	?	filterContResult[0].count	:0;
							callback(err,filterContResult);
						});
					}
				],
				(err,response)=>{
					/** Send response **/
					res.send({
						status			: (!err) ? STATUS_SUCCESS : STATUS_ERROR,
						draw			: dataTableConfig.result_draw,
						data			: (response[0]) ? response[0] : [],
						recordsTotal	: (response[1]) ? response[1] : 0,
						recordsFiltered	: (response[2]) ? response[2] : 0,
					});
				});
			});
		}else{
			req.breadcrumbs(BREADCRUMBS['admin/notification/list']);
			res.render('list');
		}
	};//End list()

	/**
	 * Function to get header notifications
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getHeaderNotifications = (req, res)=>{
		let authId			= 	(req.session.user && req.session.user._id) ? req.session.user._id 	:"";
		let authUserRoleId	= 	(req.session.user.user_role_id)	?	req.session.user.user_role_id	:"";
		if(authId){
			try{
				/** Set common conditions **/
				let commonConditions	={
					user_id	:	ObjectId(authId)
				};

				/** Get list of notification **/
				const notifications	= db.collection('notifications');
				notifications.find(commonConditions,{projection:{_id:1,message:1,url:1,created:1,is_seen:1,notification_type:1,extra_parameters:1}}).sort({created : SORT_DESC}).limit(ADMIN_HEADER_NOTIFICATION_DISPLAY_LIMIT).toArray((err,result)=>{
					if(!err){
						/** Update unread notifications as read notifications **/
						const clone = require("clone");
						let updateNotificationConditions 		= clone(commonConditions);
						updateNotificationConditions["is_seen"]	= NOT_SEEN;
						notifications.updateMany(updateNotificationConditions,{$set:{
							is_seen		: SEEN,
							is_read		: READ,
							modified 	: getUtcDate()
						}},(udpateErr,updateResult)=>{});

						/**Function to genrate notification url */
						generateNotificationUrl(req,res,{result:result}).then((response)=>{
							res.send({
								status 	: STATUS_SUCCESS,
								result 	: (response.data) ? response.data : [],
							});
						});
					}else{
						/** Send error response **/
						res.send({
							status	: STATUS_ERROR,
							result	: [],
							message	: res.__("admin.system.something_going_wrong_please_try_again")
						});
					}
				});
			}catch(e){
				/** Send error response **/
				res.send({
					status	: STATUS_ERROR,
					result	: [],
					message	: res.__("admin.system.something_going_wrong_please_try_again")
				});
			}
		}else{
			/** Send error response **/
			res.send({
				status	: STATUS_ERROR,
				result	: [],
				message	: res.__("admin.system.invalid_access")
			});
		}
	};//End getHeaderNotifications()

	/**
	 * Function to get header notifications counter
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getHeaderNotificationsCounter = (req, res)=>{
		let authId			= 	(req.session.user && req.session.user._id) ? req.session.user._id 	:"";
		let authUserRoleId	= 	(req.session.user.user_role_id)	?	req.session.user.user_role_id	:"";
		if(authId){
			try{
				/** Set common conditions **/
				let	commonConditions	={
					user_id	:	ObjectId(authId),
					is_seen	:	NOT_SEEN
				};

				/** Get count of unseen notification **/
				const notifications	= db.collection('notifications');
				notifications.countDocuments(commonConditions,(err,count)=>{
					if(!err){
						res.send({
							status 	: STATUS_SUCCESS,
							counter : (count) ? count : 0,
						});
					}else{
						/** Send error response **/
						res.send({
							status	: STATUS_ERROR,
							counter : 0,
							message	: res.__("admin.system.something_going_wrong_please_try_again")
						});
					}
				});
			}catch(e){
				res.send({
					status	: STATUS_ERROR,
					counter : 0,
					message	: res.__("admin.system.something_going_wrong_please_try_again")
				});
			}
		}else{
			/** Send error response **/
			res.send({
				status	: STATUS_ERROR,
				counter : 0,
				message	: res.__("admin.system.invalid_access")
			});
		}
	};//End getHeaderNotificationsCounter()
}
module.exports = new notification();
