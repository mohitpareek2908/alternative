function BlogCategory() {

	/**
	 * Function for get block list
	 * @param req As Request Data
	 * @param res As Response Data
	 * @return render/json
	 */
	this.getCategoryList = (req, res, next)=>{
		if(isPost(req)){
			let limit			=  (req.body.length) 			? 	parseInt(req.body.length) 			:	ADMIN_LISTING_LIMIT;
			let skip			=	(req.body.start) 			?	parseInt(req.body.start)			:	DEFAULT_SKIP;
			let statusSearch	=	(req.body.status_search) 	?	parseInt(req.body.status_search)	: 	'';
			const collection	= 	db.collection(TABLE_BLOG_CATEGORIES);
			const async			= 	require("async");

			
			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{

				/** Conditions for search using status*/
				if (statusSearch != "") {
					switch(statusSearch){
						case SEARCHING_ACTIVE:						
							dataTableConfig.conditions["status"] 	= 	ACTIVE;
						break;
						case SEARCHING_DEACTIVE:
							dataTableConfig.conditions["status"] 	= 	DEACTIVE;
						break;
					}
				}
				async.parallel([
					(callback)=>{
						/** Get list of categories **/

						collection.aggregate([
							{"$match":dataTableConfig.conditions},
							{ "$sort": { "date": -1 } },
							{ "$lookup": {
								"localField": "parent_id",
								"from": TABLE_BLOG_CATEGORIES,
								"foreignField": "_id",
								"as": "parentinfo",
								} 
							},
							{ "$project": {
								category_name 	: 1,
								slug 			: 1,
								meta_title 		: 1,
								meta_keywords 	: 1,
								meta_description: 1,
								status			: 1,
								modified		: 1,
								"parentcategory": { "$arrayElemAt": [ "$parentinfo.category_name", 0 ] } ,

							} }
						  ]).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).skip(skip).limit(limit).toArray((err, result)=>{
						 
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in blocks collection **/
						collection.find({}).count((err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in blocks **/
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
			req.breadcrumbs(BREADCRUMBS["admin/blog/categories/list"]);
			res.render('categories/list');
		}
	};//End getCategoryList()

	/**
	 * Function to get block's detail
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 */
	getCategoryDetails = (req,res)=>{
		return new Promise(resolve=>{
			let blockId = (req.params.id) ? req.params.id : "";
			if(!blockId || blockId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				try{
					/** Get block details **/
					const blocks = db.collection(TABLE_BLOG_CATEGORIES);
					blocks.findOne({
							_id : ObjectId(blockId)
						},
						{

						},(err, result)=>{
							if(result){
								/** Send success response */
								let response = {
									status	: STATUS_SUCCESS,
									result	: result
								};
								resolve(response);
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
			}
		});
	};//End getBlogDetails()

	/**
	 * Function for update block's detail
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.editCategory = (req, res, next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body	=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let id 		= 	(req.params.id)	?	req.params.id :"";
			
			/** Check validation **/
			req.checkBody({
				'category_name': {
					notEmpty	: true,
					errorMessage: res.__("admin.blogcategory.please_enter_category_name")
				},
			});

			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			if(errors){
				/** Send error response **/
				res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}

			let categoryName			= 	(req.body.category_name) 	? req.body.category_name 	: '';
			let categoryMetaTitle		= 	(req.body.meta_title) 	    ? req.body.meta_title 		: categoryName;
			let categoryMetaKeyword		= 	(req.body.meta_keywords) 	? req.body.meta_keywords 	: categoryName;
			let categoryMetaDescription	= 	(req.body.meta_description) ? req.body.meta_description : categoryName;
			var parentId				= 	(req.body.parent_id) 	    ? req.body.parent_id 		: DEACTIVE;
			
			/** Update cagegory record **/
			const collection 		= db.collection(TABLE_BLOG_CATEGORIES);
			collection.updateOne({
					_id : ObjectId(id)
				},
				{$set: {
					category_name			: 	categoryName,
					parent_id				: 	(parentId!=DEACTIVE)	?	ObjectId(parentId)	:	DEACTIVE,
					meta_title				:	categoryMetaTitle,
					meta_keywords			:	categoryMetaKeyword,
					meta_description		:	categoryMetaDescription,
					status 					:	ACTIVE,
					modified 				: 	getUtcDate()
				}},(err,result)=>{
					
					/** Send error response **/
					if(err) return next(err);
					
					/** Send success response **/
					req.flash("success",res.__("admin.blogcategory.category_has_been_updated_successfully"));
					res.send({
						status			: 	STATUS_SUCCESS,
						redirect_url	:	WEBSITE_ADMIN_URL+"blog/categories",
						message			: 	res.__("admin.blogcategory.category_has_been_updated_successfully"),
					});
				}
			);
		}else{
			/** Get category details **/
			getCategoryDetails(req, res).then((categoryresponse)=>{
				/** Set option to get blog category**/
				let options = {
					collections :[{
							collection	:	TABLE_BLOG_CATEGORIES,
							columns		:	["_id","category_name"],
							selected	: [categoryresponse.result.parent_id],
							conditions:{
								status :	ACTIVE,
								parent_id : DEACTIVE
							}
					}]
				}
				/** Get category list **/
				getDropdownList(req,res,options).then(response=> {
				
					if(response.status == STATUS_SUCCESS){
						/** Render edit page **/
						req.breadcrumbs(BREADCRUMBS["admin/blog/categories/edit"]);
						res.render('categories/edit',{
							result			: categoryresponse.result,
							categories_list	:	(response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",
						});
					}else{
						/** Send Error response **/
						req.flash("error",response.message);
						res.redirect(WEBSITE_ADMIN_URL+"blog/categories");
					}
				});
			});
		}
	};//End editCategory()

	/**
	 * Function for add category
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.addCategory = (req, res, next)=>{
		if(isPost(req)){
			/** Sanitize Data */
			req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);

			/** Check validation */
			req.checkBody({
				'category_name': {
					notEmpty	: true,
					errorMessage: res.__("admin.blogcategory.please_enter_category_name")
				},
			});


			/** parse Validation array  */
			let errors = parseValidation(req.validationErrors(),req);
			if(errors){
				/** Send error response */
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}
	
			let categoryName			= 	(req.body.category_name) 	? req.body.category_name 	: '';
			let categoryMetaTitle		= 	(req.body.meta_title) 	    ? req.body.meta_title 		: categoryName;
			let categoryMetaKeyword		= 	(req.body.meta_keywords) 	? req.body.meta_keywords 	: categoryName;
			let categoryMetaDescription	= 	(req.body.meta_description) ? req.body.meta_description : categoryName;
			var parentId				= 	(req.body.parent_id) 	    ? req.body.parent_id 		: DEACTIVE;
			
			/** Set options **/
			let options = {
				title 		:	categoryName,
				table_name 	: 	TABLE_BLOG_CATEGORIES,
				slug_field 	: 	"category_name"
			};

			/** Make slugs */
			getDatabaseSlug(options).then(slugDataResponse=>{

				/** insert block record */
				let insertData	=	{
					category_name			: 	categoryName,
					parent_id				: 	(parentId!=DEACTIVE)	?	ObjectId(parentId)	:	DEACTIVE,
					slug					: 	(slugDataResponse && slugDataResponse.title)	?	slugDataResponse.title	:	categoryName,
					category_url			: 	(slugDataResponse && slugDataResponse.title)	?	slugDataResponse.title	:	categoryName,
					meta_title				:	categoryMetaTitle,
					meta_keywords			:	categoryMetaKeyword,
					meta_description		:	categoryMetaDescription,
					status 					:	ACTIVE,
					modified 				: 	getUtcDate(),
					created 				:	getUtcDate()
				}

				const blocks = db.collection(TABLE_BLOG_CATEGORIES);
				blocks.insert(insertData,(err,result)=>{
					if(err) return next(err);
					
					/** Send success response */
					req.flash('success',res.__("admin.blockcategory.category_has_been_added_successfully"));
					res.send({
						status 			: STATUS_SUCCESS,
						redirect_url 	: WEBSITE_ADMIN_URL+'blog/categories',
						message 		: res.__("admin.blockcategory.category_has_been_added_successfully")
					});
				});
			},error=>{
				/** Send error response */
				res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			});
					
		}else{
			/** Set option to get blog category */
			let options = {
				collections :[
					{
						collection	:	TABLE_BLOG_CATEGORIES,
						columns		:	["_id","category_name"],
						conditions:{
							status 		:	ACTIVE,
							parent_id 	: DEACTIVE
						}
					},
				]
			}
			/** Get category list */
			getDropdownList(req,res,options).then(response=> {
				req.breadcrumbs(BREADCRUMBS['admin/blog/categories/add']);	
				res.render('categories/add',{
					categories_list	:	(response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",
				});
			});
		}
	};//End addCategory()
	
		/**
	 * Function for update category status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.updateCategoryStatus = (req,res, next)=>{
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
			const collection = db.collection(TABLE_BLOG_CATEGORIES);
			collection.update({_id : ObjectId(recordId)},{$set : updateData},(err,result)=>{
				if(err) return next(err);
				
				/** Send success response **/
				req.flash(STATUS_SUCCESS,res.__("admin.blog_category.blog_category_status_has_been_updated_successfully"));
				res.redirect(WEBSITE_ADMIN_URL+"blog/categories");
			});
			
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"blog/categories");
		}
	}; //end updateCategoryStatus
}

module.exports = new BlogCategory();
