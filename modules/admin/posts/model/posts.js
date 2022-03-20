function Posts() {
		
	/** Use in export data **/
	var exportFilterConditions 	=	{};
	var exportCommonConditions 	=	{};
	var exportSortConditions	= 	{_id:SORT_ASC};
	
	/**
	 * Function to get list of posts
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.getPostReportList = (req, res, next) => {
	
		let postedByuserid			= 	(req.params.id)			? 	req.params.id	:"";
		if (isPost(req)) {
			
			let limit = (req.body.length) ? parseInt(req.body.length) : ADMIN_LISTING_LIMIT;
			let skip = (req.body.start) ? parseInt(req.body.start) : DEFAULT_SKIP;
			let statusSearch		= 	(req.body.status_search)		? 	parseInt(req.body.status_search)	:"";
			let postTypeSearch		= 	(req.body.post_type_search)		? 	req.body.post_type_search	:"";
			let postFor				= 	(req.body.status_post_for)		? 	req.body.status_post_for	:"";
			let posted_by			= 	(req.body.posted_by)			? 	req.body.posted_by	:"";
			

			const collection = db.collection(TABLE_POSTS);
			const async = require('async');

			/** Configure Datatable conditions **/
			configDatatable(req, res, null).then(dataTableConfig => {
				/** Set conditions **/
				let commonConditions = {
					is_deleted : NOT_DELETED,
				};


				


				/** Conditions for search using status*/
				if (statusSearch != "") {
					switch(statusSearch){
						case SEARCHING_ACTIVE:
							dataTableConfig.conditions["status"] 		= ACTIVE;
						break;

						case SEARCHING_DEACTIVE:
							dataTableConfig.conditions["status"] 		= DEACTIVE;
						break;

					}
				}

				/** Conditions for search using status*/
				if (postTypeSearch != "") {
					switch(postTypeSearch){
						case POST_TYPE_IMAGE:
							dataTableConfig.conditions["post_type"] 		= POST_TYPE_IMAGE;
						break;

						case POST_TYPE_VIDEO:
							dataTableConfig.conditions["post_type"] 		= POST_TYPE_VIDEO;
						break;

					}
				}
				
				if (postFor != "") {
					
					dataTableConfig.conditions["age_type"] 		= {$in : postFor};
					
				}

				if (posted_by != "") {
					
					dataTableConfig.conditions["user_id"] 		= ObjectId(posted_by);
					
				}
				if (postedByuserid != "") {
					
					dataTableConfig.conditions["user_id"] 		= ObjectId(postedByuserid);
					
				}

			
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				
				
			
				async.parallel([
					(callback)=>{
						/** Get list of enquiry comments  **/
						collection.aggregate([
							{'$match':	dataTableConfig.conditions},
							{
								$lookup : {
									from			: TABLE_USERS,
									localField		: "user_id",
									foreignField	: "_id",
									as				: "user_detail"
								}
							},
							{$project:{
								"_id"             	:1,
								"title"				:1,
								"post_type"			:1,
								"post_likes_count"	:1,
								"post_view_count"	:1,
								"post_comment_count":1,
								"created"			:1,
								"thumbnail_image"	:1,
								"post_media"		:1,	
								"user_id"       	:1,
								"status"			:1,
								"age_type"			:1,
								"user_name"			:   { "$arrayElemAt" : ["$user_detail.full_name",0] },
							}},
							 
							
							{ '$sort': dataTableConfig.sort_conditions },
							{ '$skip': skip },
							{ '$limit': limit },
						]).toArray((err, result)=>{
							
							callback(err, result);
						})
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

				
					
				], (err, response) => {

					
					
					/** Send response **/
					res.send({
						status: (!err) ? STATUS_SUCCESS : STATUS_ERROR,
						draw: dataTableConfig.result_draw,
						data: (response[0]) ? response[0] : [],
						recordsFiltered	: (response[2]) ? response[2] : 0,
						recordsTotal	: (response[1]) ? response[1] : 0
					});
				});
			});
		} else {
			
			let options = {
				collections : [
					
					{
						collection 	: 	TABLE_USERS,
						columns 	: 	["_id","full_name"],
						conditions	:	{is_deleted		: 	NOT_DELETED, 	user_role_id	:	{$in : [ADULTS_USER_ROLE_ID,TEENS_USER_ROLE_ID,KIDS_USER_ROLE_ID]},},
						selected	:	[postedByuserid],
					}
				]
			};

			getDropdownList(req,res,options).then(response=>{
			//	consoleLog(response);
			
				/** render listing page **/
				req.breadcrumbs(BREADCRUMBS['admin/posts/list']);
				res.render('list',{
					users : (response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",
				});
			});
		}
	}//End getPostList()
	
	
	
	/**
	*  Function for view post details
	*
	* @param req As Request Data
	* @param res As Response Data
	*
	* @return null
    */
    this.viewPostDetail = (req,res,next)=>{



		
		let postId	=	(req.params.id)		?	req.params.id	:	"";
		consoleLog();
		if(!postId){
			/** Send success response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"posts");
		}
		let commonConditions = {
			is_deleted : NOT_DELETED,
			_id     : ObjectId(postId),
		};
		const post_reports=db.collection(TABLE_POSTS);
		/**For get post report data */
		post_reports.aggregate([
			{$match:commonConditions},
			

			{
				$lookup : {
					from			: TABLE_USERS,
					localField		: "user_id",
					foreignField	: "_id",
					as				: "user_detail"
				}
			},
			{
				$lookup: {
					from: "categories",
					let: { interestIds: "$interest_ids" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $in: ["$_id", "$$interestIds"] },
									]
								},
							}
						},
						//{ $project: { "_id": 1, "full_name": 1,"mobile_number":1,"profile_image":1} }
					],
					as: "categories_details"
				}
			},
			{$project:{
				"_id"             	:1,
				"title"				:1,
				"description"		:1,
				"post_type"			:1,
				"post_likes_count"	:1,
				"post_view_count"	:1,
				"post_comment_count":1,
				"age_type"			:1,
				"post_hashtags"		:1,
				"created"			:1,
				"privacy"			:1,
				"file_name"			:1,
				"thumbnail_image"	:1,
				"post_media"		:1,				
				"user_id"       	:1,
				"status"			:1,
				"categories_details"			:1,
				"user_name"		:   { "$arrayElemAt" : ["$user_detail.full_name",0] },
				//"categories_details"		:   "$categories_details.name",
			}},
		]).toArray((err,result)=>{
			if(err) return next(err);

			console.log("Thumbnail image is ")
			console.log(result[0].categories_details)
			/**For check result */ 
			if(result.length == 0){
				
				/** Send success response **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"posts");
			}

			consoleLog(result);
				/** Set options for append image full path **/
				let options = {
					"file_url" 			: 	POSTS_URL,
					"file_path" 		: 	POSTS_FILE_PATH,
					"result" 			: 	[result[0]],
					"database_field" 	: 	"image"
				};
				
				/** Append image with full path **/
				appendFileExistData(options).then(fileResponse=>{

					//console.log(fileResponse)
				/**For render */
					req.breadcrumbs(BREADCRUMBS['admin/posts/view']);
					res.render('view',{
						result	: (fileResponse && fileResponse.result && fileResponse.result[0])	?	fileResponse.result[0]	:{},
					
						
					});
				});
		});
	};// end viewPostDetail()





	/**
	 * Function for update post status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.updatePostStatus = (req,res,next)=>{
		let postId		 = 	(req.params.id) 		?	req.params.id 			:"";
		let userStatus	 =	(req.params.status) 		? 	req.params.status	 	:"";
		let statusType	 =	(req.params.status_type) 	? 	req.params.status_type	:"";

		let userStatusText			=	(userStatus==ACTIVE) ? "Activated" :"Deactivated";

		if(postId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			try{

				let updateData = {
					modified 	:	getUtcDate()
				};

				if(statusType == ACTIVE_INACTIVE_STATUS){
					updateData["status"]			=	(userStatus==ACTIVE) ? DEACTIVE :ACTIVE;
				}
				
				/** Update user status*/
				const sliders = db.collection(TABLE_POSTS);
				sliders.updateOne({_id : ObjectId(postId)},{$set :updateData},(err,result)=>{
					if(!err){

						/** Get post details **/
						getPostDetails(req, res,next).then(response=>{
							
						let	posted_by = response.result.user_id;
						let	post_title = response.result.title;
						
						/** Set conditions **/
						let conditions	=	{
							_id	:	ObjectId(posted_by),
							is_deleted		:	NOT_DELETED,
						};
						let userOptions = {
							conditions	:	conditions,
							fields		:	{facebook_id :0,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,modified:0}
						};

						
						/** Get user details **/
						getUserDetail(req, res, userOptions).then(userResponse => {
						
						let resultData	=	(userResponse.result) ? userResponse.result :"";
						let userFullName	=	(resultData.full_name) ? resultData.full_name:"";	
						
						if(Object.keys(resultData).length>0){
							
							/** Set options for send email ***/
							let emailOptions = {
								to: resultData.email,
								action: "post_status_changed",
								rep_array: [post_title,userStatusText,userFullName]
							};
							/** Send email **/
							sendMail(req, res, emailOptions);



					
							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.posts.post_status_has_been_updated_successfully"));
							res.redirect(WEBSITE_ADMIN_URL+"posts");
						}else{
						
								/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"posts");

						}	

						});
					}).catch(next);
					}else{

						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"posts");
					}
				});
			}catch(e){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+"posts");
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"posts");
		}
	};//End updatePostStatus()




	/**
	 * Function for get post's Detail
	 * @param req	As Request Data
	 * @param res 	As Response Data
	 * @return json
	 */
	let getPostDetails = (req,res,next)=>{
		return new Promise(resolve=>{
			let postId		=	(req.params.id)		 	?	req.params.id		 :"";
			consoleLog(postId);
			
			/** Get user details **/
			const posts	= db.collection(TABLE_POSTS);
			posts.findOne({
					is_deleted : NOT_DELETED,
					_id     : ObjectId(postId),
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
						"file_url" 			: 	POSTS_URL,
						"file_path" 		: 	POSTS_FILE_PATH,
						"result" 			: 	[result],
						"database_field" 	: 	"thumbnail_image"
						
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
	};//End getPostDetails()





}
module.exports = new Posts();
