function BlogTag() {

	/**
	 * Function for get block list
	 * @param req As Request Data
	 * @param res As Response Data
	 * @return render/json
	 */
	this.getTagsList = (req, res, next)=>{
		if(isPost(req)){
			let limit			=  (req.body.length) 			? 	parseInt(req.body.length) 			:	ADMIN_LISTING_LIMIT;
			let skip			=	(req.body.start) 			?	parseInt(req.body.start)			:	DEFAULT_SKIP;
			let statusSearch	=	(req.body.status_search) 	?	parseInt(req.body.status_search)	: 	'';

			const collection	= 	db.collection(TABLE_BLOG_TAGS);
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
						/** Get list of tags **/
						collection.find(dataTableConfig.conditions,{
							_id:1,tag_name:1,meta_title:1,meta_keywords:1,meta_description:1,modified:1,slug:1,status:1,created:1}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err, result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in tag collection **/
						collection.find({}).count((err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in tag **/
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
			req.breadcrumbs(BREADCRUMBS["admin/blog/tags/list"]);
			res.render('tags/list');
		}
	};//End getTagsList()
	

	/**
	 * Function to get tag's detail
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 */
	getTagDetails = (req,res)=>{
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
					/** Get tag details **/
					const collection = db.collection(TABLE_BLOG_TAGS);
					collection.findOne({
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
	};//End getTagDetails()

	/**
	 * Function for update block's detail
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.editTag = (req, res, next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body	=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let id 		= 	(req.params.id)	?	req.params.id :"";

		 	
				let allData			= 	req.body;
			
				/** Check validation **/
				req.checkBody({
					'tag_name': {
						notEmpty	: true,
						errorMessage: res.__("admin.blogtag.please_enter_tag_name")
					},
				});

				/** parse Validation array  **/
				let errors = parseValidation(req.validationErrors(),req);
				if (!errors) {
					try{
						let tagName					= 	(req.body.tag_name) 		? req.body.tag_name 		: '';
						let categoryMetaTitle		= 	(req.body.meta_title) 		? req.body.meta_title 		: tagName;
						let categoryMetaKeyword		= 	(req.body.meta_keywords) 	? req.body.meta_keywords 	: tagName;
						let categoryMetaDescription	= 	(req.body.meta_description) ? req.body.meta_description : tagName;
					
						/** Update block record **/
						
						
						const blocks = db.collection(TABLE_BLOG_TAGS);
						let errMessageArray = [];
						blocks.findOne({
							_id			: {$ne: ObjectId(id)},
							tag_name 	: {$regex : '^'+cleanRegex(tagName)+'$',$options : 'i'},
							is_deleted	: NOT_DELETED
						},{ _id:1,tag_name:1 },(err,tagresult)=>{
							
							if(err) return next(err);
							if(tagresult){
								
								let resultTagName	=	(tagresult.tag_name) ?  tagresult.tag_name	:	'';
								if(resultTagName == tagName){
									errMessageArray.push({'param':'tag_name','msg':res.__("admin.tags.this_tag_is_already_exist")});
								}
							
							}
							if(errMessageArray.length > 0){
								/** Send error response **/
								return res.send({
									status	: STATUS_ERROR,
									message	: errMessageArray,
								});
							}
						
							blocks.updateOne({
									_id : ObjectId(id)
								},
								{$set: {
										tag_name			: 	tagName,
										meta_title				:	categoryMetaTitle,
										meta_keywords			:	categoryMetaKeyword,
										meta_description		:	categoryMetaDescription,
										status 					:	ACTIVE,
										modified 				: 	getUtcDate()
								}},(err,result)=>{
									if(!err){
										/** Send success response **/
										req.flash("success",res.__("admin.blogtag.tag_has_been_updated_successfully"));
										res.send({
											status			: 	STATUS_SUCCESS,
											redirect_url	:	WEBSITE_ADMIN_URL+"blog/tags",
											message			: 	res.__("admin.blogtag.tag_has_been_updated_successfully"),
										});
									}else{
										/** Send error response **/
										res.send({
											status	: STATUS_ERROR,
											message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
										});
									}
								}
							);
						});
					}catch(e){
						/** Send error response **/
						res.send({
							status	: STATUS_ERROR,
							message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
						});
					}
				}else{
					/** Send error response **/
					res.send({
						status	: STATUS_ERROR,
						message	: errors,
					});
				}
			 
		}else{
			/** Get language list **/
			getLanguages().then((languageList)=>{
				/** Get blocks details **/
				getTagDetails(req, res).then((categoryresponse)=>{
						if(categoryresponse.status == STATUS_SUCCESS){
							/** Render edit page **/
							req.breadcrumbs(BREADCRUMBS["admin/blog/tags/edit"]);
							res.render('tags/edit',{
								result			: categoryresponse.result,
								language_list	: languageList,
							
							});
						}else{
							/** Send Error response **/
							req.flash("error",response.message);
							res.redirect(WEBSITE_ADMIN_URL+"blog/tags");
						}

				



				});
			});
		}
	};//End editTag()

	/**
	 * Function for add tag
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.addTag = (req, res, next)=>{
		if(isPost(req)){
			/** Sanitize Data */
			req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);

				/** Check validation */
				req.checkBody({
					'tag_name': {
						notEmpty	: true,
						errorMessage: res.__("admin.blogtag.please_enter_tag_name")
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
				try{
					let tagName					= 	(req.body.tag_name) 		? req.body.tag_name 		: '';
					let categoryMetaTitle		= 	(req.body.meta_title) 	    ? req.body.meta_title 		: tagName;
					let categoryMetaKeyword		= 	(req.body.meta_keywords) 	? req.body.meta_keywords 	: tagName;
					let categoryMetaDescription	= 	(req.body.meta_description) ? req.body.meta_description : tagName;

					
					const tag = db.collection(TABLE_BLOG_TAGS);
					let errMessageArray = [];
					tag.findOne({
						tag_name 	: {$regex : '^'+cleanRegex(tagName)+'$',$options : 'i'},
						is_deleted	: NOT_DELETED
					},{ _id:1,tag_name:1 },(err,tagresult)=>{
						
						if(err) return next(err);
						if(tagresult){
							
							let resultTagName	=	(tagresult.tag_name) ?  tagresult.tag_name	:	'';
							if(resultTagName == tagName){
								errMessageArray.push({'param':'tag_name','msg':res.__("admin.tags.this_tag_is_already_exist")});
							}
						
						}
						
						if(errMessageArray.length > 0){
							/** Send error response **/
							return res.send({
								status	: STATUS_ERROR,
								message	: errMessageArray,
							});
						}
						
						/** Set slug options **/
						let options = {
							title 		:	tagName,
							table_name 	: 	TABLE_BLOG_TAGS,
							slug_field 	: 	"tag_name"
						};
						
						/** Make slugs */
						getDatabaseSlug(options).then(slugDataResponse=>{

								/** insert tag record */
								let insertData	=	{
									tag_name				: 	tagName,
									slug					: 	(slugDataResponse && slugDataResponse.title)	?	slugDataResponse.title	:	tagName,
									tag_url					: 	(slugDataResponse && slugDataResponse.title)	?	slugDataResponse.title	:	tagName,
									meta_title				:	categoryMetaTitle,
									meta_keywords			:	categoryMetaKeyword,
									meta_description		:	categoryMetaDescription,
									status 					:	ACTIVE,
									is_deleted 				:	NOT_DELETED,
									modified 				: 	getUtcDate(),
									created 				:	getUtcDate()
								}

								tag.insert(insertData,(err,result)=>{
									if(!err){
										/** Send success response */
										req.flash('success',res.__("admin.blocktag.tag_has_been_added_successfully"));
										res.send({
											status 			: STATUS_SUCCESS,
											redirect_url 	: WEBSITE_ADMIN_URL+'blog/tags',
											message 		: res.__("admin.blockcategory.tag_has_been_added_successfully")
										});
									}else{
										/** Send error response */
										res.send({
											status 	: STATUS_ERROR,
											message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
										});
									}
								});

						},error=>{
							/** Send error response */
							res.send({
								status	: STATUS_ERROR,
								message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
							});
						});
					});
				}catch(e){
					/** Send error response **/
					res.send({
						status	:	STATUS_ERROR,
						message	: 	[{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
				}
				
		}else{
			req.breadcrumbs(BREADCRUMBS['admin/blog/tags/add']);
			res.render('tags/add',{	});
		}
	};//End addTag()
	
		/**
	 * Function for update category status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.updateTagStatus = (req,res, next)=>{
		let recordId		= 	(req.params.id) 			?	req.params.id 			: "";
		let recordStatus	=	(req.params.status) 		? 	req.params.status 		: '';
		let statusType		=	(req.params.status_type) 	? 	req.params.status_type 	: '';
		
		if(recordId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			try{
				let updateData = {
					modified : getUtcDate()
				};
				if(statusType == ACTIVE_INACTIVE_STATUS)
				{
					updateData['status']	=	(recordStatus == ACTIVE) ? DEACTIVE :ACTIVE;
				}
				
				/**update status*/
				const collection = db.collection(TABLE_BLOG_TAGS);
				collection.update({_id : ObjectId(recordId)},{$set : updateData},(err,result)=>{
					if(!err){
						/** Send success response **/
						req.flash(STATUS_SUCCESS,res.__("admin.blog_tag.blog_tag_status_has_been_updated_successfully"));
						res.redirect(WEBSITE_ADMIN_URL+"blog/tags");
					}else{
						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"blog/tags");
					}
				});
			}catch(e){
				
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+"blog/tags");
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"blog/tags");
		}
	}; //end updateCategoryStatus
}

module.exports = new BlogTag();
