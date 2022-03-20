const async		= 	require("async");
function Blog() {

	/**
	 * Function for get block list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getBlogList = (req, res, next)=>{
		if(isPost(req)){
			let limit			= 	(req.body.length) 	? 	parseInt(req.body.length) 	:ADMIN_LISTING_LIMIT;
			let skip			=	(req.body.start) 	?	parseInt(req.body.start)	:DEFAULT_SKIP;
			let blogStatus		=	(req.body.blog_status) 		?	parseInt(req.body.blog_status)	: '';

			const collection	= 	db.collection(TABLE_BLOG);
			const async			= 	require("async");
			
			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Conditions for search using status*/
				if (blogStatus !='') {
					switch(blogStatus){
						case BLOG_PUBLISHED:						
							dataTableConfig.conditions["status"] 	= 	ACTIVE;
						break;
						case BLOG_UNPUBLISHED:
							dataTableConfig.conditions["status"] 	= 	DEACTIVE;
						break;
						case BLOG_TRENDING:						
							dataTableConfig.conditions["trending"] 	= 	ACTIVE;
						break;
						case BLOG_NOT_TRENDING:
							dataTableConfig.conditions["trending"] 	= 	DEACTIVE;
						break;
						case BLOG_FEATURED:						
							dataTableConfig.conditions["featured"] 	= 	ACTIVE;
						break;
						case BLOG_NOT_FEATURED:
							dataTableConfig.conditions["featured"] 	= 	DEACTIVE;
						break;
					}
				}
				console.log(dataTableConfig.conditions);
				let commonConditions = 	{is_deleted	: NOT_DELETED};
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				
				async.parallel([
					(callback)=>{
						/** Get list of blog's **/
						collection.aggregate([
							{ "$match":dataTableConfig.conditions},
							{$lookup:{
								from			: TABLE_BLOG_CATEGORIES,
								localField		: 'blog_category_id',
								foreignField	: '_id',
								as				: 'categorydetails'
							}},
							{$lookup:{
								from			: TABLE_USERS,
								localField		: 'user_id',
								foreignField	: '_id',
								as				: 'userdetails'
							}},
							{"$project": {
								blog_category_id 	: 1,blog_title	: 1,full_blog_url : 1,user_id	: 1,slug : 1,meta_title : 1,meta_keywords 	: 1,
								meta_description: 1,status	: 1,modified : 1,trending : 1,featured : 1,blog_image:1,
								"categorydetails": { "$arrayElemAt": [ "$categorydetails.category_name", 0 ] } ,
								"userdetails": { "$arrayElemAt": [ "$userdetails.full_name", 0 ] } ,

							}}
						]).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).skip(skip).limit(limit).toArray((err, result)=>{
							/** Set options for append image **/
							let options = {
								"file_url" 			: 	BLOG_URL,
								"file_path" 		: 	BLOG_FILE_PATH,
								"result" 			: 	result,
								"database_field" 	: 	"blog_image"
							};

							/** Append image with full path **/
							appendFileExistData(options).then(response=>{
								result = (response && response.result)	?	response.result	:[];
								callback(err, result);
							});
						});
					},
					(callback)=>{
						/** Get total number of records in blogs collection **/
						collection.find(commonConditions).count((err,countResult)=>{
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
			req.breadcrumbs(BREADCRUMBS["admin/blog/list"]);
			res.render('list');
		}
	};//End getBlogList()

	/**
	 * Function to get block's detail
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 */
	getBlogDetails = (req,res)=>{	
		return new Promise(resolve=>{
			let blockId = (req.params.id) ? req.params.id : "";
			if(!blockId || blockId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				return resolve(response);
			}
			try{
				/** Get block details **/
				const blocks = db.collection(TABLE_BLOG);
				blocks.findOne({
						_id : ObjectId(blockId)
					},
					{
						_id:1,blog_title:1,blog_image:1,blog_summary:1,description:1,modified:1,blog_category_id:1,meta_title:1,meta_keywords:1,meta_description:1,tag:1,status:1,featured_option:1,publish_date:1
					},(err, result)=>{
						if(result){
							/** Set options for append image full path **/
							let options = {
								"file_url" 			: 	BLOG_URL,
								"file_path" 		: 	BLOG_FILE_PATH,
								"result" 			: 	[result],
								"database_field" 	: 	"blog_image"
							};

							/** Append image with full path **/
							appendFileExistData(options).then(fileResponse=>{
								consoleLog(fileResponse);
								/** Send success response **/
								let response = {
									status	: STATUS_SUCCESS,
									result	: (fileResponse && fileResponse.result && fileResponse.result[0])	?	fileResponse.result[0]	:{}
								};
								return resolve(response);
							});
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
	};//End getBlogDetails()
	
	/**
	 * Function for add block
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.addBlog = (req, res, next)=>{
		if(isPost(req)){
			
			/** Sanitize Data */
			req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let pageDescription = 	(req.body.description)	?	req.body.description	:"";
			if(pageDescription!= ""){
				req.body.description =  pageDescription.replace(new RegExp(/&nbsp;|<br \/\>/g),' ').trim();
			}

			/** Check validation */
			req.checkBody({
				'blog_title': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_enter_blog_title")
				},
				
				'blog_summary': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_enter_blog_summary")
				},
				'description': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_enter_description")
				},
				'blog_category_id': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_select_category")
				},
				'status': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_select_status")
				},
				'publish_date': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_select_publish_date")
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
			
			
			let blogTitleName			= 	(req.body.blog_title) 		? req.body.blog_title 		: '';
			let blog_summary			=	(req.body.blog_summary)		? req.body.blog_summary 	: '';
			let description				=	(req.body.description)		? req.body.description 		: '';
			let publishDate				=	(req.body.publish_date)		? req.body.publish_date 	: '';
			let blog_category_id		=	(req.body.blog_category_id)	? req.body.blog_category_id : '';
			let featured_option			=	(req.body.featured_option)	? req.body.featured_option 	: '';
			let metaTitle				= 	(req.body.meta_title) 	    ? req.body.meta_title 		: blogTitleName;
			let categoryMetaKeyword		= 	(req.body.meta_keywords) 	? req.body.meta_keywords 	: blogTitleName;
			let categoryMetaDescription	= 	(req.body.meta_description) ? req.body.meta_description : blogTitleName;
			let status					= 	(req.body.status) 	    	? req.body.status 			: 0;
			let user_id					=	req.session.user._id;
			let selectedtag				= 	(req.body.tag) 	   			? req.body.tag 				: [];
			let tag						=	[];

			/** Set tag data **/
			setTagData(req,res,selectedtag).then(response =>{
				
				/** Send error response */
				if(response.status == STATUS_ERROR){
					return res.send({
						status	: STATUS_ERROR,
						message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
				}
				selectedtag	 =	 (response.result)	?	response.result	:	[];
				if(selectedtag.length>0){
					selectedtag.map(records=>{
						tag.push(ObjectId(records));
					});
				}
				
				/** Get blog category detail **/
				const blogCategories	=	db.collection(TABLE_BLOG_CATEGORIES);
				blogCategories.findOne({_id: ObjectId(blog_category_id)},(errBlogCategories, resultBlogCategories)=>{
					/** return error response */
					if(errBlogCategories)	return next(errBlogCategories);
					
					let categorySlug	=	(resultBlogCategories	&& resultBlogCategories.category_url)	?	resultBlogCategories.category_url	:'';

					/** Set slug options **/
					let slugOptions = {
						title 		:	blogTitleName,	
						table_name 	: 	TABLE_BLOG,	
						slug_field 	: 	"blog_title"	
					};
				
					/** Make slugs */
					getDatabaseSlug(slugOptions).then(blockResponse=>{
						let image	= 	(req.files && req.files.blog_image)	?	req.files.blog_image	:"";
						let options	=	{
							'image' 	:	image,
							'filePath' 	: 	BLOG_FILE_PATH,
						};
						
						let fullBlogUrl	 =	categorySlug+'/'+blockResponse.title;	
						var imageName =	"";
						let errMessageArray =[];
						/** Upload blog image **/
						moveUploadedFile(req, res,options).then(response=>{
							
							if(response.status == STATUS_ERROR){
								errMessageArray.push({'param':'blog_image','msg':response.message});
							}else{
								var imageName = (typeof response.fileName !== typeof undefined) ? response.fileName : '';
							}
							
							if(errMessageArray.length > 0){
								/** Send error response **/
								return res.send({
									status	: STATUS_ERROR,
									message	: errMessageArray,
								});
							}


							/** insert block record */
							let insertData	=	{
								user_id				:	ObjectId(user_id),
								blog_image			:	imageName,
								tag					:	tag,	
								blog_title			: 	blogTitleName,
								blog_summary		: 	blog_summary,
								publish_date		: 	getUtcDate(publishDate),
								blog_url			: 	(blockResponse && blockResponse.title)	?	blockResponse.title	:"",
								full_blog_url		:	fullBlogUrl,
								description			: 	description,
								blog_category_id	: 	ObjectId(blog_category_id),
								featured_option		:	featured_option,		
								status				:	Number(status),	
								is_deleted			:	NOT_DELETED,	
								meta_title			:	metaTitle,
								meta_keywords		:	categoryMetaKeyword,
								meta_description	:	categoryMetaDescription,							
								modified 			: 	getUtcDate(),
								created 			:	getUtcDate()
							}

							const blocks = db.collection(TABLE_BLOG);
							blocks.insert(insertData,(err,result)=>{
								if(err) return next(err);
								
								/** Send success response */
								req.flash('success',res.__("admin.blog.blog_has_been_added_successfully"));
								res.send({
									status 			: STATUS_SUCCESS,
									redirect_url 	: WEBSITE_ADMIN_URL+'blog/list',
									message 		: res.__("admin.blog.blog_has_been_added_successfully")
								});
							});
						});
					},error=>{
						/** Send error response */
						res.send({
							status	: STATUS_ERROR,
							message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
						});
					});
				});
			});
		}else{
			const fs			=	require("fs");
			const collection	= 	db.collection(TABLE_BLOG_TAGS);
			
			/** Get list of tags's **/
			collection.find({status	: ACTIVE},{tag_name : 1}).toArray((err, result)=>{

				let tagName	=	[];
				if(!err){
					async.each(result,(records,eachCallback)=>{
						tagName.push(JSON.stringify(records.tag_name));
						eachCallback(null);
					},asyncErrs=>{
						fs.writeFile(WEBSITE_ROOT_PATH+"public/admin/tag.json", '['+tagName+']',(responseFile)=>{

							/** Get Category list */
							let options =  {
								collections:[
									{
										collection : TABLE_BLOG_CATEGORIES,
										columns	:	["_id","category_name"],
										conditions:{
											status	: ACTIVE
										}
									},
								]
							}
							getDropdownList(req,res,options).then(response =>{
								
								req.breadcrumbs(BREADCRUMBS['admin/blog/add']);
								res.render('add',{
									category_list	:	(response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",
								});
							});
						});
					});
				}else{
					if(err) return next(err);
				}
			});
		}
	};//End addBlog()
	
	
	
	/**
	 * Function for update block's detail
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.editBlog = (req, res, next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body	=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let id 		= 	(req.params.id)	?	req.params.id :"";

			/** Check validation **/
			req.checkBody({
				'blog_title': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_enter_blog_title")
				},
				
				'blog_summary': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_enter_blog_summary")
				},
				'description': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_enter_description")
				},
				'blog_category_id': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_select_category")
				},
				'status': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_select_status")
				},
				'publish_date': {
					notEmpty	: true,
					errorMessage: res.__("admin.blog.please_select_publish_date")
				},
				
			});

			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			console.log(errors);
			if (errors) {
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}
		
			let blogTitleName			= 	(req.body.blog_title) 		? req.body.blog_title 		: '';
			let blog_summary			=	(req.body.blog_summary)		? req.body.blog_summary 	: '';
			let description				=	(req.body.description)		? req.body.description 		: '';
			let publishDate				=	(req.body.publish_date)		? req.body.publish_date 	: '';
			let blog_category_id		=	(req.body.blog_category_id)	? req.body.blog_category_id : '';
			let featured_option			=	(req.body.featured_option)	? req.body.featured_option 	: '';
			let metaTitle				= 	(req.body.meta_title) 	    ? req.body.meta_title 		: blogTitleName;
			let categoryMetaKeyword		= 	(req.body.meta_keywords) 	? req.body.meta_keywords 	: blogTitleName;
			let categoryMetaDescription	= 	(req.body.meta_description) ? req.body.meta_description : blogTitleName;
			let tagselected				=  	(req.body.tag) 	    		? req.body.tag 				: [];	
			let oldImage				= 	(req.body.old_image) 		? req.body.old_image 		: '';
			
			/** Set tag data **/
			setTagData(req,res,tagselected).then(response =>{
				
				/** Send error response */
				if(response.status == STATUS_ERROR){
					return res.send({
						status	: STATUS_ERROR,
						message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
				}

				let newTags	 =	 (response.result)	?	response.result	:	[];

				/** Set options for upload image **/
				let image	= 	(req.files && req.files.blog_image)	?	req.files.blog_image	:"";
				let options	=	{
					'image' 	:	image,
					'filePath' 	: 	BLOG_FILE_PATH,
					'oldPath' 	: 	oldImage
				};

				/** Upload blog  image **/
				var imageName 			= '';
				var errMessageArray 	= [];
				moveUploadedFile(req, res,options).then(response=>{	
					if(response.status == STATUS_ERROR){
						errMessageArray.push({'param':'blog_image','msg':response.message});
					}else{
						var imageName = (typeof response.fileName !== typeof undefined) ? response.fileName : '';
					}
					
					if(errMessageArray.length > 0){
						/** Send error response **/
						return res.send({
							status	: STATUS_ERROR,
							message	: errMessageArray,
						});
					}
			
					let user_id		=	req.session.user._id;
					let status		= 	(req.body.status) 	  ? req.body.status 	: 0;
					/** Update blog record **/
					const blocks 		= db.collection(TABLE_BLOG);
					blocks.updateOne({
							_id : ObjectId(id)
						},
						{$set: {
							blog_title			: 	blogTitleName,
							blog_image			: 	imageName,
							publish_date		:	getUtcDate(publishDate),
							blog_summary		: 	blog_summary,
							description			: 	description,
							blog_category_id	: 	ObjectId(blog_category_id),
							featured_option		:	featured_option,		
							meta_title			:	metaTitle,
							meta_keywords		:	categoryMetaKeyword,
							meta_description	:	categoryMetaDescription,		
							status				:	Number(status),		
							tag					:	newTags,				
							modified 			: 	getUtcDate()
						}},(err,result)=>{
							if(err) return next(err);
							
							/** Send success response **/
							req.flash("success",res.__("admin.blog.blog_details_has_been_updated_successfully"));
							res.send({
								status			: 	STATUS_SUCCESS,
								redirect_url	:	WEBSITE_ADMIN_URL+"blog/list",
								message			: 	res.__("admin.blog.blog_details_has_been_updated_successfully"),
							});
						}
					);
				});
			});
		}else{
			const fs			=	require("fs");
			const collection	= 	db.collection(TABLE_BLOG_TAGS);
			
			/** Get list of tag's **/
			collection.find({status	: ACTIVE},{}).toArray((err, result)=>{
					
				let tagName	=	[];
				if(result	&&	result.length>0){
					result.map(record=>{
						tagName.push(JSON.stringify(record.tag_name));
					});
					fs.writeFile(WEBSITE_ROOT_PATH+"public/admin/tag.json", '['+tagName+']',()=>{});
				}
			});
			
			/** Get blog details **/
			getBlogDetails(req, res).then((blogresponse)=>{
				if(blogresponse.status == STATUS_SUCCESS){
					let oldTagNames		=	[];
					let blogTag			=	(blogresponse.result	&& blogresponse.result.tag)					?	blogresponse.result.tag	:[];
					let blogCategories	=	(blogresponse.result	&& blogresponse.result.blog_category_id)	?	blogresponse.result.blog_category_id	:'';
					
					/** Get dropdown list(Category, tag)**/
					let options =  {
						collections:[
							{
								collection : TABLE_BLOG_CATEGORIES,
								columns	:	["_id","category_name"],
								selected	: [blogCategories],
								conditions:{
									status	: ACTIVE
								}
							},
						]
					}
					getDropdownList(req,res,options).then(response =>{
						req.breadcrumbs(BREADCRUMBS['admin/blog/edit']);
					
						/** Get exist tags's **/
						collection.find({status	: ACTIVE, _id:{$in:blogTag}},{tag_name:1}).toArray((err, result)=>{
							if(result	&&	result.length>0){
								async.each(result,(records,eachCallback)=>{
									oldTagNames.push(String(records.tag_name));
									eachCallback(null);
								},asyncErrs=>{
									
									res.render('edit',{
										categories_list		:	(response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",
										result				:	 (blogresponse && blogresponse.result)	?	blogresponse.result	:	{},
										old_tag_name		:	 oldTagNames,
									});
								});
							}else{
								res.render('edit',{
									categories_list		:	(response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",
									result				:	 (blogresponse && blogresponse.result)	?	blogresponse.result	:	{},
									old_tag_name		:	 oldTagNames,
								});
							}
						});
					});
				}else{
					/** Send error response **/
					req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
					res.redirect(WEBSITE_ADMIN_URL+"blog/list");
				}
			});
		}
	};//End editBlog()
	
	
	/**
	 * Function to set tag id as object id and create a new tag
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 */
	setTagData = (req,res, tags)=>{
		return new Promise(resolve=>{
			let tagIds		=	[];
			if(tags && tags.length>0){
				let tagNames	=	(tags)	?	tags.split(",")	:[];
				async.forEachOf(tagNames,(tagName,index,callback)=>{
					
					/** Get tag details **/
					const collection = db.collection(TABLE_BLOG_TAGS);
					collection.findOne({tag_name : {$regex : "^"+tagName+"$",$options : "i"}},(errTag, resultTag)=>{
						if(!errTag && !resultTag){
							let insertData = {
								tag_name 			:	tagName,
								slug				: 	tagName,
								tag_url				: 	tagName,
								meta_title 			:	tagName,
								meta_keywords		:	tagName,
								meta_description	:	tagName,
								status				:	ACTIVE,
								is_deleted			:	NOT_DELETED,
								modified			:	getUtcDate(),
								created				:	getUtcDate()
							};
							collection.insertOne(insertData,(err,result)=>{
								tagIds.push(ObjectId(result.insertedId));
								callback(null);
							});
						}else if(!errTag && resultTag){
							tagIds.push(ObjectId(resultTag._id));
							callback(null);
						}else{
							callback(null);
						}
					});
				},asyncErrs=>{

					/** Send success response */
					let response = {
						status	: STATUS_SUCCESS,
						message	: '',
						result	: tagIds
					};
					return resolve(response);
				});
			}else{
				/** Send success response */
				let response = {
					status	: STATUS_SUCCESS,
					message	: '',
					result	: tagIds
				};
				return resolve(response);
			}
		});
	};//End setTagId()
	
	/**
	 * Function for update blog trending status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.updateBlogTrendingStatus = (req,res, next)=>{
		let recordId		 = 	(req.params.id) 			?	req.params.id 			:"";
		let recordStatus	=	(req.params.status) ? req.params.status : '';
		let statusType		=	(req.params.status_type) ? req.params.status_type : '';
		
		if(recordId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			let updateData = {
				modified : getUtcDate()
			};
			if(statusType == ACTIVE_INACTIVE_STATUS)
			{
				updateData['trending']	=	(recordStatus == ACTIVE) ? DEACTIVE :ACTIVE;
			}
			
			/**update status*/
			const collection = db.collection(TABLE_BLOG);
			collection.update({_id : ObjectId(recordId)},{$set : updateData},(err,result)=>{
				if(err) return next(err);
				
				/** Send success response **/
				req.flash(STATUS_SUCCESS,res.__("admin.blog.blog_trending_status_has_been_updated_successfully"));
				res.redirect(WEBSITE_ADMIN_URL+"blog/list");
			});
			
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"blog/list");
		}
	}; //end updateBlogTrendingStatus
	/**
	 * Function for update blog featured status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.updateBlogFeaturedStatus = (req,res, next)=>{
		let recordId		 = 	(req.params.id) 			?	req.params.id 			:"";
		let recordStatus	=	(req.params.status) ? req.params.status : '';
		let statusType		=	(req.params.status_type) ? req.params.status_type : '';
		
		if(recordId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			let updateData = {
				modified : getUtcDate()
			};
			if(statusType == ACTIVE_INACTIVE_STATUS)
			{
				updateData['featured']	=	(recordStatus == ACTIVE) ? DEACTIVE :ACTIVE;
			}
			
			/**update status*/
			const collection = db.collection(TABLE_BLOG);
			collection.update({_id : ObjectId(recordId)},{$set : updateData},(err,result)=>{
				if(err) return next(err);
				
				/** Send success response **/
				req.flash(STATUS_SUCCESS,res.__("admin.blog.blog_featured_status_has_been_updated_successfully"));
				res.redirect(WEBSITE_ADMIN_URL+"blog/list");
			});
			
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"blog/list");
		}
	}; //end updateBlogFeaturedStatus
	/**
	 * Function for update blog featured status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.updateBlogPublishStatus = (req,res, next)=>{
		let recordId		 = 	(req.params.id) 			?	req.params.id 			:"";
		let recordStatus	=	(req.params.status) ? req.params.status : '';
		let statusType		=	(req.params.status_type) ? req.params.status_type : '';
		
		if(recordId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			let updateData = {
				modified : getUtcDate()
			};
			if(statusType == ACTIVE_INACTIVE_STATUS)
			{
				updateData['status']	=	(recordStatus == ACTIVE) ? DEACTIVE :ACTIVE;
			}
			
			/**update status*/
			const collection = db.collection(TABLE_BLOG);
			collection.update({_id : ObjectId(recordId)},{$set : updateData},(err,result)=>{
				if(err) return next(err);
				
				/** Send success response **/
				req.flash(STATUS_SUCCESS,res.__("admin.blog.blog_publish_status_has_been_updated_successfully"));
				res.redirect(WEBSITE_ADMIN_URL+"blog/list");
			});
			
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"blog/list");
		}
	}; //end updateBlogPublishStatus
	
	
	/**
	 * Function for delete blog
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.deleteBlog = (req,res, next)=>{
		let recordId	 = 	(req.params.id) ?	req.params.id :"";
		if(recordId){
			let updateData = {
				is_deleted	:	DELETED,
				modified 	: getUtcDate()
			};
			
			/**update status*/
			const collection = db.collection(TABLE_BLOG);
			collection.update({_id : ObjectId(recordId)},{$set : updateData},(err,result)=>{
				if(err) return next(err);
				
				/** Send success response **/
				req.flash(STATUS_SUCCESS,res.__("admin.blog.blog_has_been_deleted_successfully"));
				res.redirect(WEBSITE_ADMIN_URL+"blog/list");
			});
			
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"blog/list");
		}
	}; //end deleteBlog
	
	
	
	
		/**
	 * Function for update blog's sitemap
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.updateBlogSitemap = (req,res, next)=>{
		try{
			const blogs = db.collection(TABLE_BLOG);
			const blogCategory = db.collection(TABLE_BLOG_CATEGORIES);
			blogs.find({ status:ACTIVE,is_deleted:NOT_DELETED },{ 
				full_blog_url:1,
				}).toArray((err,result)=>{
				if(err) return next(err);
				let writeText	='<?xml version="1.0" encoding="UTF-8"?>'+'\n';
					writeText += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"'+'\n';
					writeText += 'xmlns:image="https://www.google.com/schemas/sitemap-image/1.1">'+'\n';
					
				if(result && result.length>0){
					var fs 			= require('fs');
					var async	= 	require('async');
					fs.appendFile(BLOG_FILE_PATH+'blog-sitemap.xml','', function (err) {
						if (err) return next(err) ;
						
						/** Append all stone data ***/
						async.forEachOf(result,(records,index,eachCallback)=>{
							let fullBlogUrl 	= records.full_blog_url 		 ? records.full_blog_url : '';
							
							var currentDate = new Date();
							var changeDate = newDate(currentDate,SITE_MAP_DATE_FORMAT);
							
							let destination = WEBSITE_FRONT_URL + 'blog/'+fullBlogUrl;
							writeText += '<url>'+'\n';
							writeText += '<loc>'+destination+'</loc>'+'\n';
							writeText	+=	"<lastmod>"+ changeDate +"</lastmod>";
							writeText	+=	'<changefreq>'  + CHANGEFREQ_WEEKLY +  '</changefreq>';
							writeText	+=	'<priority>' + PRIORITY + '</priority>';
							writeText  += '</url>'+'\n'; 
							eachCallback(null);
						},asyncErrs=>{
							
							blogCategory.find({ status:ACTIVE },{ 
							category_url:1,
							}).toArray((err,categoryresult)=>{
								
								
								async.forEachOf(categoryresult,(category_records,index,cateachCallback)=>{
									
									var currentDate = new Date();
									var changeDate = newDate(currentDate,SITE_MAP_DATE_FORMAT);
							
									let categoryUrl 	= category_records.category_url 		 ? category_records.category_url : '';
									let catdestination = WEBSITE_FRONT_URL + 'blog/'+categoryUrl;
									writeText += '<url>'+'\n';
									writeText += '<loc>'+catdestination+'</loc>'+'\n';
									writeText	+=	"<lastmod>"+ changeDate +"</lastmod>";
									writeText	+=	'<changefreq>'  + CHANGEFREQ_WEEKLY +  '</changefreq>';
									writeText	+=	'<priority>' + PRIORITY + '</priority>';
									writeText  += '</url>'+'\n'; 
									cateachCallback(null);
									
									
								},asyncErrs=>{
									
										
									
									writeText  += '</urlset>'+'\n';

									/** Write file in gemstone folder **/
									fs.writeFile(BLOG_FILE_PATH+'blog-sitemap.xml', writeText, (err) => {
										if (err) return next(err) ;
										
										/** Write file in front src folder **/
										fs.writeFile(FRONT_SRC_SITEMAP_FILE_PATH+'blog-sitemap.xml', writeText, (err) => {
											if (err) return next(err) ;
											
											/** Write file in front dist folder **/
											fs.writeFile(FRONT_DIST_FILE_PATH+'blog-sitemap.xml', writeText, (err) => {
												if (err) return next(err) ;
												
												/** Send success response **/
												req.flash(STATUS_SUCCESS,res.__("admin.categories.sitemap_successfully_updated"));
												res.redirect(WEBSITE_ADMIN_URL+"site_map");
											});
										});
									});
								});
							});
						});
					});
				}else{
					req.flash(STATUS_ERROR,res.__("system.no_record_found"));
					res.redirect(WEBSITE_ADMIN_URL+"site_map");
				}
			});
		}catch(e){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
			res.redirect(WEBSITE_ADMIN_URL+"site_map");
		}
		
	}; //end updateBlogSitemap
	
	
	
	
	/**
	 * Function for update read's sitemap
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.updateReadSitemap = (req,res, next)=>{
		try{
			const blogs = db.collection(TABLE_BLOG);
			blogs.find({status:ACTIVE,blog_category_id:ObjectId('5dbbd56b46c1fd034c2478a2')},{
				blog_title:1,
				blog_url:1,
				}).toArray((err,result)=>{
				if(err) return next(err);
				let writeText	='<?xml version="1.0" encoding="UTF-8"?>'+'\n';
					writeText += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"'+'\n';
					writeText += 'xmlns:image="https://www.google.com/schemas/sitemap-image/1.1">'+'\n';
					
				if(result && result.length>0){
					var fs 			= require('fs');
					var async	= 	require('async');
					fs.appendFile(ZODIAC_FILE_PATH+'astrology-sitemap.xml','', function (err) {
						if (err) return next(err) ;
						
						/** Append all stone data ***/
						async.forEachOf(result,(records,index,eachCallback)=>{
							let slug 	= records.slug 		 ? records.slug : '';
							
							var currentDate = new Date();
							var changeDate = newDate(currentDate,SITE_MAP_DATE_FORMAT);

							let destination = WEBSITE_FRONT_URL + 'astrology/zodiac-signs/'+slug;
							writeText += '<url>'+'\n';
							writeText += '<loc>'+destination+'</loc>'+'\n';
							writeText	+=	"<lastmod>"+ changeDate +"</lastmod>";
							writeText	+=	'<changefreq>'  + CHANGEFREQ_WEEKLY +  '</changefreq>';
							writeText	+=	'<priority>' + PRIORITY + '</priority>';
							writeText  += '</url>'+'\n';
							eachCallback(null);
						},asyncErrs=>{ 
							writeText  += '</urlset>'+'\n';

							/** Write file in gemstone folder **/
							fs.writeFile(ZODIAC_FILE_PATH+'astrology-sitemap.xml', writeText, (err) => {
								if (err) return next(err) ;
								
								/** Write file in front src folder **/
								fs.writeFile(FRONT_SRC_SITEMAP_FILE_PATH+'astrology-sitemap.xml', writeText, (err) => {
									if (err) return next(err) ;
									
									/** Write file in front dist folder **/
									fs.writeFile(FRONT_DIST_FILE_PATH+'astrology-sitemap.xml', writeText, (err) => {
										if (err) return next(err) ;
										
										/** Send success response **/
										req.flash(STATUS_SUCCESS,res.__("admin.categories.sitemap_successfully_updated"));
										res.redirect(WEBSITE_ADMIN_URL+"site_map");
									});
								});
							});
						});
					});
				}else{
					req.flash(STATUS_ERROR,res.__("system.no_record_found"));
					res.redirect(WEBSITE_ADMIN_URL+"site_map");
				}
			});
		}catch(e){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
			res.redirect(WEBSITE_ADMIN_URL+"site_map");
		}
		
	}; //end updateReadSitemap
	
}

module.exports = new Blog();
