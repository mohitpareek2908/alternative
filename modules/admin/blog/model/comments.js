function BlogComments() {

	/**
	 * Function for get blog comments list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getBlogComments = (req, res, next)=>{
		if(isPost(req)){
			let limit			= 	(req.body.length) 			? 	parseInt(req.body.length) 			:	ADMIN_LISTING_LIMIT;
			let skip			=	(req.body.start) 			?	parseInt(req.body.start)			:	DEFAULT_SKIP;
			let statusSearch	= 	(req.body.status_search)	? 	parseInt(req.body.status_search)	:	'';
			
			const collection	= 	db.collection(TABLE_COMMENT);
			const async			= 	require("async");
			
			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Set conditions **/
				let commonConditions = {
					is_deleted		: 	NOT_DELETED,
				};
				
				/** Conditions for search using status*/
				if (statusSearch != "") {
					switch(statusSearch){
						case SEARCHING_ACTIVE:						
							dataTableConfig.conditions["status"] 		= 	ACTIVE;
						break;

						case SEARCHING_DEACTIVE:
							dataTableConfig.conditions["status"] 		= 	DEACTIVE;
						break;
					}
				}
				
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				async.parallel([
					(callback)=>{
						dataTableConfig.conditions['post_model'] = COMMENT_MODEL_BLOG;
						/** Get list of blog's **/
						collection.aggregate([
							{ "$match":dataTableConfig.conditions},
							{ "$sort": dataTableConfig.sort_conditions},
							{ "$skip": skip },
							{ "$limit": limit },
							{$lookup:{
								from			: TABLE_BLOG,
								localField		: 'post_id',
								foreignField	: '_id',
								as				: 'blogdetails'
							}},
							{$lookup:{
								from			: TABLE_USERS,
								localField		: 'user_id',
								foreignField	: '_id',
								as				: 'userdetails'
							}},
							{$lookup:{
								from			: TABLE_COMMENT,
								localField		: 'parent_id',
								foreignField	: '_id',
								as				: 'parentdetails'
							}},
							{"$project": {
								parent_id 	: 1,post_id	: 1,name	: 1,email : 1,comment : 1,status	: 1,modified : 1,created : 1,replied_comment:1,
								"blogdetails": { "$arrayElemAt": [ "$blogdetails.blog_title", 0 ] } ,
								"userdetails": { "$arrayElemAt": [ "$userdetails.full_name", 0 ] } ,
								"parentdetails": { "$arrayElemAt": [ "$parentdetails.comment", 0 ] } ,

							}}
						]).collation(COLLATION_VALUE).toArray((err, result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in blogs collection **/
						collection.find(dataTableConfig.conditions).count((err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in blogs **/
						collection.find(dataTableConfig.conditions).count((err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err, response)=>{
					/** Send response **/
					res.send({
						status			: (!err) ? STATUS_SUCCESS : STATUS_ERROR,
						draw			: dataTableConfig.result_draw,
						data			: (response[0]) ? response[0] :[],
						recordsFiltered	: (response[2]) ? response[2] :0,
						recordsTotal	: (response[1]) ? response[1] :0
					});
				});
			});
		}else{
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS["admin/blog/comments/list"]);
			res.render('comments/list');
		}
	};//End getBlogList()

	/**
	 * Function to get comment detail
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 */
	getCommentDetails = (req,res)=>{	
		return new Promise(resolve=>{
			let modelId = (req.params.id) ? req.params.id : "";
			if(!modelId || modelId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				return resolve(response);
			}
			try{
				/** Get block details **/
				const blocksComment = db.collection(TABLE_COMMENT);
				blocksComment.findOne({
						_id : ObjectId(modelId)
					}
					,(err, result)=>{
						if(result){
							/** Send success response **/
							let response = {
								status	: STATUS_SUCCESS,
								result	: (result)	?	result	:{}
							};
							return resolve(response);
						}else{
							/** Send error response */
							let response = {
								status	: STATUS_ERROR,
								message	: res.__("admin.system.invalid_access")
							};
							resolve(response);
						}
					}
				);
			}catch(e){
				/** Send error response */
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.something_going_wrong_please_try_again")
				};
				resolve(response);
			}
		});
	};//End getCommentDetails()
	
	/**
	 * Function for add blog comment
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.addComment = (req, res, next)=>{
		if(isPost(req)){
			
			/** Sanitize Data */
			req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);

			/** Check validation */
			req.checkBody({
				'blog_id': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_choose_blog")
				},
				
				'user_id': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_choose_user")
				},
				'comment': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_enter_comment")
				},
			});

			/** parse Validation array  */
			let errors = parseValidation(req.validationErrors(),req);
			if (errors) {
				/** Send error response */
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}
			
			let blog_id					= 	(req.body.blog_id) 			? req.body.blog_id 			: '';
			let user_id					=	(req.body.user_id)			? req.body.user_id 			: '';
			let parent_id				=	(req.body.parent_id)		? req.body.parent_id 		: DEACTIVE;
			let comment					=	(req.body.comment)			? req.body.comment 			: '';

			/** Get blog category detail **/
			const userTable	=	db.collection(TABLE_USERS);
			userTable.findOne({_id: ObjectId(user_id)},(errUser, resultUser)=>{
				/** return error response */
				if(errUser)	return next(errUser);
				/** insert block record */
				let insertData	=	{
					parent_id			:	parent_id != DEACTIVE ? ObjectId(parent_id) : DEACTIVE,
					user_id				: 	ObjectId(user_id),
					post_id				: 	ObjectId(blog_id),
					post_model			:	COMMENT_MODEL_BLOG,
					name				:	resultUser.full_name ? resultUser.full_name : '',	
					email				:	resultUser.email ? resultUser.email : '',	
					comment				: 	comment,
					user_ip				: 	'',	
					status				:	ACTIVE,							
					is_deleted			:	NOT_DELETED,							
					modified 			: 	getUtcDate(),
					created 			:	getUtcDate()
				}

				const commentTable = db.collection(TABLE_COMMENT);
				commentTable.insert(insertData,(err,result)=>{
					if(err) return next(err);
					
					/** Send success response */
					req.flash('success',res.__("admin.blog.comment_has_been_successfully_added"));
					res.send({
						status 			: STATUS_SUCCESS,
						redirect_url 	: WEBSITE_ADMIN_URL+'blog/comments',
						message 		: res.__("admin.blog.comment_has_been_successfully_added")
					});
				});
			});
			
		}else{
			/** Get Category list */
			let options =  {
				collections:[
					{
						collection : TABLE_BLOG,
						columns	:	["_id","blog_title"],
						conditions:{
							//status	: ACTIVE
						}
					},
					{
						collection : TABLE_USERS,
						columns	:	["_id","full_name"],
						conditions:{
							user_role_id	: CUSTOMER_USER_ROLE_ID
						}
					},
				]
			}
			getDropdownList(req,res,options).then(response =>{
				req.breadcrumbs(BREADCRUMBS['admin/blog/comments/add']);
				res.render('comments/add',{
					blog_list	:	(response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",
					user_list	:	(response && response.final_html_data && response.final_html_data["1"])	?	response.final_html_data["1"]:"",
				});
			});
			
		}
	};//End addComment()
	
	/**
	 * Function for update comment detail
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.editComment = (req, res, next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body	=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let id 		= 	(req.params.id)	?	req.params.id :"";

			/** Check validation **/
			req.checkBody({
				'blog_id': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_choose_blog")
				},
				'user_id': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_choose_user")
				},
				'comment': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_enter_comment")
				},
			});

			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			if (errors) {
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}
		
			let blog_id					= 	(req.body.blog_id) 			? req.body.blog_id 			: '';
			let user_id					=	(req.body.user_id)			? req.body.user_id 			: '';
			let parent_id				=	(req.body.parent_id)		? req.body.parent_id 		: DEACTIVE;
			let comment					=	(req.body.comment)			? req.body.comment 			: '';

			/** Get blog category detail **/
			const userTable	=	db.collection(TABLE_USERS);
			userTable.findOne({_id: ObjectId(user_id)},(errUser, resultUser)=>{
				/** return error response */
				if(errUser)	return next(errUser);
				/** insert block record */
				let updateData	=	{
					parent_id			:	parent_id != DEACTIVE ? ObjectId(parent_id) : DEACTIVE,
					user_id				: 	ObjectId(user_id),
					post_id				: 	ObjectId(blog_id),
					name				:	resultUser.full_name ? resultUser.full_name : '',	
					email				:	resultUser.email ? resultUser.email : '',	
					comment				: 	comment,
					user_ip				: 	'',							
					modified 			: 	getUtcDate(),
				}

				const blocksComment 		= db.collection(TABLE_COMMENT);
				blocksComment.updateOne({
						_id : ObjectId(id)
					},
					{$set: updateData},(err,result)=>{
						if(err) return next(err);
						
						/** Send success response **/
						req.flash("success",res.__("admin.blog.blog_comment_has_been_updated_successfully"));
						res.send({
							status			: 	STATUS_SUCCESS,
							redirect_url	:	WEBSITE_ADMIN_URL+"blog/comments",
							message			: 	res.__("admin.blog.blog_comment_has_been_updated_successfully"),
						});
					}
				);
			});
		}else{
			
			/** Get comment details **/
			getCommentDetails(req, res).then((responseComment)=>{
				if(responseComment.status == STATUS_SUCCESS){
					
					/** Get Category list */
					let options =  {
						collections:[
							{
								collection 	: TABLE_BLOG,
								columns		:	["_id","blog_title"],
								selected	:	[responseComment.result.post_id],
								disabled	: 	'disabled',
								conditions:{
									//status	: ACTIVE
								}
							},
							{
								collection 	: 	TABLE_USERS,
								columns		:	["_id","full_name"],
								selected	:	[responseComment.result.user_id],
								disabled	: 	'disabled',
								conditions:{
									user_role_id	: CUSTOMER_USER_ROLE_ID
								}
							},
						]
					}
					getDropdownList(req,res,options).then(response =>{
						req.breadcrumbs(BREADCRUMBS['admin/blog/comments/edit']);
						res.render('comments/edit',{
							blog_list	:	(response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",
							user_list	:	(response && response.final_html_data && response.final_html_data["1"])	?	response.final_html_data["1"]:"",
							record	:	(responseComment && responseComment.result)	?	responseComment && responseComment.result:{},
						});
					});
				}else{
					/** Send error response **/
					req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
					res.redirect(WEBSITE_ADMIN_URL+"blog/comments");
				}
			});
		}
	};//End editComment()
	/**
	 * Function for update comment status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.updateCommentStatus = (req,res, next)=>{
		let recordId		 = 	(req.params.id) 			?	req.params.id 			:"";
		let recordStatus	=	(req.params.status) 		? req.params.status : '';
		let statusType		=	(req.params.status_type) 	? req.params.status_type : '';
		
		if(recordId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			let updateData = {
				modified : getUtcDate()
			};
			if(statusType == ACTIVE_INACTIVE_STATUS)
			{
				updateData['status']	=	(recordStatus == ACTIVE) ? DEACTIVE :ACTIVE;
			}
			/**update status*/
			const collection = db.collection(TABLE_COMMENT);
			collection.update({_id : ObjectId(recordId)},{$set : updateData},(err,result)=>{
				if(err) return next(err);
				
				/** Send success response **/
				req.flash(STATUS_SUCCESS,res.__("admin.blog.comment_status_successfully_updated"));
				res.redirect(WEBSITE_ADMIN_URL+"blog/comments");
			});
			
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"blog/comments");
		}
	}; //end updateCommentStatus
	
	/**
	 * Function for replied on user comment
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.repliedOnUserComment = (req, res, next)=>{
		if(isPost(req)){
			
			/** Sanitize Data */
			req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);

			/** Check validation */
			req.checkBody({
				'comment': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_enter_comment")
				},
			});

			/** parse Validation array  */
			let errors = parseValidation(req.validationErrors(),req);
			if (errors) {
				/** Send error response */
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}
			
			let commentId	= 	(req.body.comment_id) 	? req.body.comment_id 	: '';
			let comment		=	(req.body.comment)	 	? req.body.comment 		: '';

			/** Update replied on user comment on blog */
			const collection 	= 	db.collection(TABLE_COMMENT);
			let repliedComment	=	{replied_comment: {comment	: comment,created : getUtcDate()}};
			collection.updateOne({_id: ObjectId(commentId)},{$set:repliedComment},(err,result)=>{
				if(err) return next(err);
				
				/** Send success response */
				req.flash('success',res.__("admin.blog.comment_has_been_successfully_added"));
				res.send({
					status 			: STATUS_SUCCESS,
					redirect_url 	: WEBSITE_ADMIN_URL+'blog/comments',
					message 		: res.__("admin.blog.comment_has_been_successfully_added")
				});
			});
		}
	};//End repliedOnUserComment()
}

module.exports = new BlogComments();
