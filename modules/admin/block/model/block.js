function Block() {

	/**
	 * Function for get block list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 * @param next	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.getBlockList = (req, res,next)=>{
		if(isPost(req)){
			let limit			= (req.body.length) ? parseInt(req.body.length) : ADMIN_LISTING_LIMIT;
			let skip			= (req.body.start) 	? parseInt(req.body.start)	: DEFAULT_SKIP;
			const collection	= db.collection(TABLE_BLOCK);
			const async			= require("async");
			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				async.parallel([
					(callback)=>{
						/** Get list of block's **/
						collection.find(dataTableConfig.conditions,{projection: {_id:1,block_name:1,description:1,page_name:1,modified:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err, result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in blocks collection **/
						collection.countDocuments({},(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in blocks **/
						collection.countDocuments(dataTableConfig.conditions,(err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err, response)=>{
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
			req.breadcrumbs(BREADCRUMBS["admin/block/list"]);
			res.render('list');
		}
	};//End getBlockList()

	/**
	 * Function to get block's detail
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	* @param next	As 	Callback argument to the middleware function
	 *
	 * @return json
	 */
	getBlockDetails = (req,res,next)=>{
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
				const blocks = db.collection(TABLE_BLOCK);
				blocks.findOne({
						_id : ObjectId(blockId)
					},
					{projection: {
						_id:1,block_name:1,page_name:1,description:1,modified:1,blocks_descriptions:1
					}},(err, result)=>{
						if(err) return next(err);

						if(!result){
							/** Send error response */
							let response = {
								status	: STATUS_ERROR,
								message	: res.__("admin.system.invalid_access")
							};
							return resolve(response);
						}

						/** Send success response */
						let response = {
							status	: STATUS_SUCCESS,
							result	: result
						};
						resolve(response);
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
	};//End getBlockDetails()

	/**
	 * Function for update block's detail
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editBlock = (req, res,next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body	= sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let id 		= (req.params.id)	? req.params.id :"";
			if(id == "" || typeof req.body.blocks_descriptions === typeof undefined || typeof req.body.blocks_descriptions[DEFAULT_LANGUAGE_MONGO_ID] === typeof undefined || !req.body.blocks_descriptions[DEFAULT_LANGUAGE_MONGO_ID] || req.body.blocks_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == ""){
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}

			const clone			= require('clone');
			let allData			= req.body;
				req.body		= clone(allData.blocks_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
			req.body.page_name	= (allData.page_name) 		? allData.page_name 	: "";
			let pageDescription = (req.body.description)	? req.body.description	: "";

		

			if(pageDescription!= ""){
				req.body.description =  pageDescription.replace(new RegExp(/&nbsp;|<br \/\>/g)," ").trim();
			}

			
			try{
				let pageName	= (req.body.page_name) 		? req.body.page_name 	: "";
				let blockName	= (req.body.block_name) 	? req.body.block_name 	: "";
				let description	= (req.body.description)	? req.body.description 	: "";

				/** Update block record **/
				const blocks 		= db.collection(TABLE_BLOCK);
				blocks.updateOne({
						_id : ObjectId(id)
					},
					{$set: {
						page_name			: pageName,
						block_name			: blockName,
						description			: pageDescription,
						default_language_id	: DEFAULT_LANGUAGE_MONGO_ID,
						blocks_descriptions	: (allData.blocks_descriptions) ? allData.blocks_descriptions :{},
						modified 			: getUtcDate()
					}},(err,result)=>{
						if(err) return next(err);

						/** Send success response **/
						req.flash("success",res.__("admin.block.block_details_has_been_updated_successfully"));
						res.send({
							status			: STATUS_SUCCESS,
							redirect_url	: WEBSITE_ADMIN_URL+"block",
							message			: res.__("admin.block.block_details_has_been_updated_successfully"),
						});
					}
				);
			}catch(e){
				/** Send error response **/
				res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}
		}else{
			/** Get language list **/
			getLanguages().then((languageList)=>{
				/** Get blocks details **/
				getBlockDetails(req, res,next).then((response)=>{
					if(response.status != STATUS_SUCCESS){
						/** Send Error response **/
						req.flash("error",response.message);
						res.redirect(WEBSITE_ADMIN_URL+"block");
						return;
					}

					/** Render edit page **/
					req.breadcrumbs(BREADCRUMBS["admin/block/edit"]);
					res.render('edit',{
						result			: response.result,
						language_list	: languageList
					});
				}).catch(next);
			}).catch(next);
		}
	};//End editBlock()

	/**
	 * Function for add block
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 * @param next	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addBlock = (req, res, next)=>{
		if(isPost(req)){
			/** Sanitize Data */
			req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			if(req.body.blocks_descriptions == undefined || req.body.blocks_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == undefined || req.body.blocks_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == ''){
				/** Send error response */
				return res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}

			const clone			= require('clone');
			let allData			= req.body;
			req.body			= clone(allData.blocks_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
			req.body.page_name	= (allData.page_name) 	? allData.page_name 	: "";
			let pageDescription = (req.body.description)? req.body.description	: "";
			/** Check validation */
		

			if(pageDescription!= ""){
				req.body.description =  pageDescription.replace(new RegExp(/&nbsp;|<br \/\>/g),' ').trim();
			}
			/** parse Validation array  */
			
			try{
				let pageName	= (req.body.page_name)		? req.body.page_name 	: '';
				let blockName	= (req.body.block_name) 	? req.body.block_name 	: '';
				let description	= (req.body.description)	? req.body.description 	: '';

				/**Get database slugs */
				const async = require('async');
				async.parallel([
					(callback)=>{
						/** Set options **/
						let options = {
							title 		: blockName,
							table_name 	: TABLE_BLOCK,
							slug_field 	: "block_name"
						};
						/** Make slugs */
						getDatabaseSlug(options).then(blockResponse=>{
							callback(null,blockResponse);
						},error=>{
							callback(STATUS_ERROR,{});
						}).catch(next);
					},
					(callback)=>{
						/** Set page options **/
						let pageOptions = {
							title 		: pageName,
							table_name 	: TABLE_BLOCK,
							slug_field 	: "page_name"
						};
						/** Make slugs */
						getDatabaseSlug(pageOptions).then(pageResponse=>{
							callback(null,pageResponse);
						},error=>{
							callback(STATUS_ERROR,{});
						}).catch(next);
					}
				],(err,response)=>{
					if(err) return next(err);

					let blockResponse	= (response && response[0]) ? response[0] : {};
					let pageResponse	= (response && response[1]) ? response[1] : {};
					/** insert block record */
					let insertData	=	{
						page_name			: pageName,
						block_name			: blockName,
						block_slug			: (blockResponse && blockResponse.title)? blockResponse.title	:"",
						page_slug			: (pageResponse && pageResponse.title)	? pageResponse.title	:"",
						description			: description,
						default_language_id	: DEFAULT_LANGUAGE_MONGO_ID,
						blocks_descriptions	: (allData.blocks_descriptions) ? allData.blocks_descriptions :{},
						modified 			: getUtcDate(),
						created 			: getUtcDate()
					}

					const blocks = db.collection(TABLE_BLOCK);
					blocks.insertOne(insertData,(err,result)=>{
						if(err) return next(err);

						/** Send success response */
						req.flash('success',res.__("admin.block.block_has_been_added_successfully"));
						res.send({
							status 			: STATUS_SUCCESS,
							redirect_url 	: WEBSITE_ADMIN_URL+'block',
							message 		: res.__("admin.block.block_has_been_added_successfully")
						});
					});
				});
			}catch(e){
				/** Send error response **/
				res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}
		}else{
			/** Get language list */
			getLanguages().then((languageList)=>{
				req.breadcrumbs(BREADCRUMBS['admin/block/add']);
				res.render('add',{
					language_list	: languageList
				});
			});
		}
	};//End addBlock()
}

module.exports = new Block();
