function Category() {
	const clone		= 	require('clone');
	
	
	
/**
	 * Function to get category list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getCategoryList = (req, res,next)=>{
		
		if(isPost(req)){
			let limit			= (req.body.length) ? parseInt(req.body.length)	: ADMIN_LISTING_LIMIT;
			let skip			= (req.body.start)	? parseInt(req.body.start)	: DEFAULT_SKIP;
			let fromDate 		= (req.body.fromDate) 	 		? req.body.fromDate 					:"";
			let toDate 			= (req.body.toDate) 	 		? req.body.toDate 						:"";
			let statusSearch	= (req.body.status_search)		? parseInt(req.body.status_search)		:"";
			const collection	= db.collection(TABLE_CATEGORIES);
			const async			= require('async');

			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				let commonConditions = {
					is_deleted		: NOT_DELETED,
					parent_id		: DEACTIVE,
				};
				/** Conditions for date */
				if (fromDate != "" && toDate != "") {
					dataTableConfig.conditions["created"] = {
						$gte 	: newDate(fromDate),
						$lte 	: newDate(toDate),
					}
				}
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
				
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				async.parallel([
					(callback)=>{
						/** Get list of cms **/
						collection.find(dataTableConfig.conditions,{projection: {_id:1,name:1,body:1,created:1,status:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err,result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in pages collection **/
						collection.countDocuments(commonConditions,(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in pages **/
						collection.countDocuments(dataTableConfig.conditions,(err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err, response)=>{
					consoleLog(dataTableConfig);
					consoleLog(response);
					/** Send response **/
					res.send({
						status			: (!err) ? STATUS_SUCCESS : STATUS_ERROR,
						draw			: dataTableConfig.result_draw,
						data			: (response[0]) ? response[0] : [],
						recordsFiltered	: (response[2]) ? response[2] : 0,
						recordsTotal	: (response[1]) ? response[1] : 0
					});
				});
			});
		}else{
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS['admin/category/list']);
			res.render('list');
		}
	};//End getCategoryList()

	/**
	 * Function to get category detail
	 *
	 * @param req	As	Request Data
	 * @param res	As	Response Data
	 * @param next	As 	Callback argument to the middleware function
	 *
	 * @return json
	 */
	let getCategoryDetails = (req,res,next)=>{
		return new Promise(resolve=>{
			let cmsId = (req.params.id) ? req.params.id : "";
			/** Get Cms details **/
			const pages = db.collection(TABLE_CATEGORIES);
			pages.findOne({
					_id : ObjectId(cmsId)
				},
				{projection: {
					_id:1,name:1,modified:1,pages_descriptions:1
				}},(err, result)=>{
					if(err) return next(err);

					if(!result){
						/** Send error response **/
						let response = {
							status	: STATUS_ERROR,
							message	: res.__("admin.system.invalid_access")
						};
						return resolve(response);
					}

					/** Send success response **/
					let response = {
						status	: STATUS_SUCCESS,
						result	: result
					};
					resolve(response);
				}
			);
		});
	};// End getCategoryDetails().

	/**
	 * Function to update cms's detail
	 *
	 * @param req 	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editCategory = (req, res,next)=>{
		let id	= 	(req.params.id)	?	req.params.id	:"";
		if(isPost(req)){
			convertMultipartFormData(req,res).then(function(){
				
				/** Sanitize Data */
				req.body = 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
				if(typeof req.body.pages_descriptions == typeof undefined && (typeof req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == typeof undefined && req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] && req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == "")){
					return res.send({
						status	: STATUS_ERROR,
						message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
				}
				
				var allData				= 	JSON.parse(JSON.stringify(req.body));
				req.body				=	clone(allData);

				req.body.name		=	(allData.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID]["name"])			?	allData.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID]["name"]			:"";
				let multilinualData = allData.pages_descriptions;
				let pageName	= 	(req.body.name) ? 	req.body.name 	:"";

				

			
				/** Save Cms details */
				const pages = db.collection(TABLE_CATEGORIES);
				let updateData = {
					name				: 	(req.body.name)	?	req.body.name	:"",
					default_language_id	: 	DEFAULT_LANGUAGE_MONGO_ID,
					pages_descriptions	: 	(allData.pages_descriptions) ? allData.pages_descriptions :{},
					modified 			:	getUtcDate()
				}
				
				pages.updateOne({
						_id : ObjectId(id)
					},
					{$set: updateData},(err,result)=>{
						if(err) return next(err);
	
						/** Send success response **/
						req.flash(STATUS_SUCCESS,res.__("admin.category.category_details_has_been_updated_successfully"));
						res.send({
							status			: STATUS_SUCCESS,
							redirect_url	: WEBSITE_ADMIN_URL+'category',
							message			: res.__("admin.category.category_details_has_been_updated_successfully"),
						});
					}
				);

			})

		}else{
			/** Get language list **/
			getLanguages().then(languageList=>{
				/** Get banner details **/
				getCategoryDetails(req,res,next).then(response=>{
					if(response.status != STATUS_SUCCESS){
						/** Send error response **/
						req.flash(STATUS_ERROR,response.message);
						res.redirect(WEBSITE_ADMIN_URL+'category');
						return;
					}

					/** Render edit page **/
					req.breadcrumbs(BREADCRUMBS['admin/category/edit']);
					res.render('edit',{
						result			: 	response.result,
						language_list	:	languageList
					});
				}).catch(next);
			}).catch(next);
		}
	};//End editCategory()

	/**
	 * Function for add category
	 *
	 * @param req 	As	Request Data
	 * @param res 	As	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addCategory = (req, res,next)=>{
		
		if(isPost(req)){
			
				/** Sanitize Data */
				req.body = 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
				if(typeof req.body.pages_descriptions == typeof undefined && (typeof req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == typeof undefined && req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] && req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == "")){
					return res.send({
						status	: STATUS_ERROR,
						message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
				} 
				
				var allData				= 	JSON.parse(JSON.stringify(req.body));
				req.body				=	clone(allData);

				req.body.name		=	(allData.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID]["name"])			?	allData.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID]["name"]			:"";
				let multilinualData = allData.pages_descriptions;
				let categoryName	= 	(req.body.name) ? 	req.body.name 	:"";

				
				const pages = db.collection(TABLE_CATEGORIES);
				/** parse Validation array  */
				
				
				categoryName = categoryName.replace(/\(/g,"\\(").replace(/\)/g,"\\)");
				categoryName = categoryName.replace('\\','');
				categoryName = categoryName.replace('\\','');
				
				var categoryNameRegex = new RegExp(["^", categoryName, "$"].join(""), "i"); //case-insensitive query?

				
					
					/** Set options **/
					let options = {
						title 		:	categoryName,
						table_name 	: 	TABLE_CATEGORIES,
						slug_field 	: 	"slug"
					};

					/** Make Slug */
					getDatabaseSlug(options).then(response=>{
						/** Save Cms details */
						
						pages.insertOne({
							parent_id				:	DEACTIVE,
							name					:	categoryName,
							slug					: 	(response && response.title)	?	response.title	:"",
							default_language_id		: 	DEFAULT_LANGUAGE_MONGO_ID,
							pages_descriptions		: 	multilinualData,
							status 					: 	ACTIVE,
							is_deleted 				: 	NOT_DELETED,
							created 				: 	getUtcDate(),
							modified 				: 	getUtcDate()
						},(err,result)=>{
							
							if(err) return next(err);

							/** Send success response */
							req.flash(STATUS_SUCCESS,res.__("admin.category.category_has_been_added_successfully"));
							res.send({
								status			: STATUS_SUCCESS,
								redirect_url	: WEBSITE_ADMIN_URL+'category',
								message			: res.__("admin.category.category_has_been_added_successfully")
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
			/** Get language list */
			getLanguages().then(languageList=>{
				req.breadcrumbs(BREADCRUMBS['admin/category/add']);
				/**Render add cms page */
				res.render('add',{
					language_list	: languageList
				});
			}).catch(next);
		}
	};//End addCategory()

	/**
	 * Function for update status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.updateCategoryStatus = (req,res,next)=>{
		let productId		= 	(req.params.id) 		?	req.params.id 			: '';
		let recordStatus	=	(req.params.status)		? 	req.params.status 		: '';
		let statusType		=	(req.params.status_type)? 	req.params.status_type 	: '';
		let updateData 		= 	{};
		let categoryId		=	'';

		if(productId && statusType && recordStatus){
			/*** Active/Deactive Status **/
			if(statusType == ACTIVE_INACTIVE_STATUS){
				updateData['status']	=	(recordStatus == ACTIVE) ? DEACTIVE :ACTIVE;
				updateData['modified']	=	getUtcDate();
			}
			
			/*** Deleted Status *
			if(statusType == DELETE_STATUS){
				updateData['is_deleted']	=	DELETED;
				updateData['modified']		=	getUtcDate();
			}

			/**update status*/
			const collection = db.collection(TABLE_CATEGORIES);
			
			collection.updateOne({_id : ObjectId(productId)},{$set : updateData},(err,result)=>{
				if(err) return next(err);
				if(updateData.status == DEACTIVE){
					//collection.update({parent_id : ObjectId(productId)},{$set : updateData},(err,result)=>{})
					
				}
				/** Send success response **/
				if(statusType == ACTIVE_INACTIVE_STATUS){
					req.flash(STATUS_SUCCESS,res.__("admin.category.status_has_been_updated_successfully"));
				}
				/*if(statusType == DELETE_STATUS){
					req.flash(STATUS_SUCCESS,res.__("admin.category.status_has_been_deleted_successfully"));
				}*/
				
				
				res.redirect(WEBSITE_ADMIN_URL+"category");
			});
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"category");
		}
	};
}
module.exports = new Category();
