function Master(){
	
	/**
	 * Function to get master list
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 * 
	 * @return render/json
	 */
	this.getMasterList = (req,res,next)=>{
		let masterType	=	(req.params.type)	?	req.params.type	: "";
		let displayType	= 	toTitleCase(masterType.replace(RegExp("_","g")," "));
		const async		=	require("async");
		
		if(isPost(req)){
			let limit			=	(req.body.length)	?	parseInt(req.body.length)	:ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start)	? 	parseInt(req.body.start)	:DEFAULT_SKIP;
			const collection	=	db.collection(TABLE_MASTERS);
			
			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Common Conditions **/
				let commonConditions = {
					dropdown_type	:	masterType
				};
				
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				async.parallel([
					(callback)=>{
						/** Get list of master **/
						collection.aggregate([
							{$match : 	dataTableConfig.conditions},
							{$sort 	:	dataTableConfig.sort_conditions},
							{$skip 	: 	skip},
							{$limit : 	limit},
							{$lookup	: 	{
								"from" 			:	TABLE_MASTERS,
								"localField" 	:	"parent_id",
								"foreignField" 	:	"_id",
								"as" 			:	"parent_details"
							}},
							{$project 	:	{
								"_id" : 1,
								"name" : 1,
								"modified" : 1,
								"status" : 1,
								"image" : 1,
								"is_popular": 1,
								"parent_name" : {"$arrayElemAt"	: ["$parent_details.name",0]}
							}},
							{$sort 	:	dataTableConfig.sort_conditions},
						]).toArray((err, result)=>{
							/** Set options for appened image **/
							let options = {
								"file_url" 			: 	MASTER_FILE_URL,
								"file_path" 		: 	MASTER_FILE_PATH,
								"result" 			: 	result,
								"database_field" 	: 	"image"
							};
							/** Appened image with full path **/
							appendFileExistData(options).then(response=>{
								result = (response && response.result)	?	response.result	:[];
								callback(err, result);
							});	
							
						});
					},
					(callback)=>{
						/** Get total number of records in masters collection **/
						collection.countDocuments(commonConditions,(err,countResult)=>{ 
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in masters **/
						collection.countDocuments(dataTableConfig.conditions,(err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err,response)=>{
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
			async.parallel([
				(callback)=>{
					if(masterType == "car"){
						/** Set options for get brand list **/
						let options = {
							collections : [{
								collection 	: TABLE_MASTERS,
								columns 	: ["_id","name"],
								conditions 	: {status:ACTIVE,dropdown_type:"brand"},
							}]
						};

						/** Get brand list **/
						getDropdownList(req, res,options).then(parentResponse=>{
							if(parentResponse.status != STATUS_SUCCESS) return callback(parentResponse.status,"");
							
							let brandList = (parentResponse && parentResponse.final_html_data && parentResponse.final_html_data["0"])	?	parentResponse.final_html_data["0"]:"";
							callback(null,brandList);
						}).catch(next);
					}else{
						callback(null,"");
					}
				},
			],
			(err,response)=>{
				if(err) return next(err);
				
				/** Render listing page **/
				req.breadcrumbs(BREADCRUMBS["admin/master/list"]);
				res.render("list",{
					parent_list			: 	(response && response[0]) ? response[0] :"",
					type				: 	masterType,	
					displayType 		:	displayType,
					dynamic_variable	: 	displayType,
					dynamic_url			: 	masterType,
				});
			});			
		}		
	};//End getMasterList()
	
	/**
	 * Function for add master details
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addMaster = (req,res,next)=>{
		let masterType	=	(req.params.type)	?	req.params.type	: "";
		let displayType	= 	toTitleCase(masterType.replace(RegExp("_","g")," "));
		
		convertMultipartFormData(req,res).then(()=>{
			if(isPost(req)){
				
				/** Sanitize Data **/
				req.body = sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			if(req.body.master_descriptions == undefined || req.body.master_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == undefined || req.body.master_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == ''){
				/** Send error response */
				return res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}
			
		
				
				const clone			= 	require("clone");
				let parentId		=	(req.body.parent_id)	? 	ObjectId(req.body.parent_id) 	:"";
				
				let allData			= 	req.body;

				req.body 			= 	clone(allData.master_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
				
				let name			=	(req.body.name)			? 	req.body.name.trim() 			:"";
				let helpText		=	(req.body.help_text)			? 	req.body.help_text.trim() 			:"";
				

				
				let errors = [];
				if(masterType == "category"){
					if((typeof req.files == typeof undefined)|| (!req.files) || (typeof req.files.image == typeof undefined)){
						if(!errors) errors = [];
						errors.push({"param":"image","msg":res.__("admin.master.please_select_image")});
					}
				}
				consoleLog("Master submitted.101");
				
				consoleLog(masterType);
				/** Send error response **/				
				if(errors.length >0 ) return res.send({status : STATUS_ERROR, message : errors});
					consoleLog("Recahed till here");
				/** Check name is unique **/
				const masters = db.collection(TABLE_MASTERS);
				
						
					/** Set options for upload image **/
					let image	= 	(req.files && req.files.image)	?	req.files.image	:"";
					let options = {
						'image' 	:	image,
						'filePath' 	: 	MASTER_FILE_PATH,
						'oldPath' 	: 	""
					};
						
					/** Upload master  image **/
					moveUploadedFile(req, res,options).then(response=>{	
						if(response.status == STATUS_ERROR){
							errors.push({'param':'image','msg':response.message});
						}else{
							var imageName = (typeof response.fileName !== typeof undefined) ? response.fileName : '';
						}
						
						if(errors.length > 0){
							/** Send error response **/
							return res.send({
								status	: STATUS_ERROR,
								message	: errors,
							});
						}
						
						/** Save master record **/
						masters.insertOne({
							name				:	name,
							help_text			:	helpText,
							dropdown_type		:	masterType,
							image				:	imageName,
							parent_id			:	parentId,
							master_descriptions	: 	(allData.master_descriptions) ? allData.master_descriptions :{},
							status	 			:	ACTIVE,
							created 			:	getUtcDate(),
							modified 			: 	getUtcDate()
						},(addErr,addResult)=>{
							if(addErr) return next(addErr);
							
							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.master.master_has_been_added_successfully",displayType));
							res.send({
								status			:	STATUS_SUCCESS,
								redirect_url	: 	WEBSITE_ADMIN_URL+"master/"+masterType,
								message			:	res.__("admin.master.master_has_been_added_successfully",displayType),
							});
						});	
					}).catch(next);						
				
			}else{
				const async	= require("async");
				async.parallel([
					(callback)=>{
						if(masterType == "car"){
							/** Set options for get brand list **/
							let options = {
								collections : [{
									collection 	: TABLE_MASTERS,
									columns 	: ["_id","name"],
									conditions 	: {status:ACTIVE,dropdown_type:"brand"},
								}]
							};

							/** Get brand list **/
							getDropdownList(req, res,options).then(parentResponse=>{
								if(parentResponse.status != STATUS_SUCCESS) return callback(parentResponse.status,"");
								
								let brandList = (parentResponse && parentResponse.final_html_data && parentResponse.final_html_data["0"])	?	parentResponse.final_html_data["0"]:"";
								callback(null,brandList);
							}).catch(next);
						}else{
							callback(null,"");
						}
					},
					(callback)=>{
						/** Get language list **/
						getLanguages().then(languageList=>{
							callback(null,languageList);
						}).catch(next);	
					}
				],
				(err,response)=>{
					if(err) return next(err);
					
					/** Render add page **/
					req.breadcrumbs(BREADCRUMBS["admin/master/add"]);
					res.render("add",{
						parent_list			: 	(response && response[0]) ? response[0] :"",
						language_list		: 	(response && response[1]) ? response[1] :[],						
						type				: 	masterType,
						displayType 		:	displayType,
						dynamic_variable	: 	displayType,
						dynamic_url			: 	masterType,
					});
				});
			}
		});
	};//End addMaster()
	
	/**
	 * Function to get master's Detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return json
	 */
	let getMasterDetails = (req,res,next)=>{	
		return new Promise(resolve=>{
			let masterId 	= 	(req.params.id) 	? 	req.params.id 	:"";
			let masterType	=	(req.params.type)	?	req.params.type	:"";
			
			/** Get master details **/
			const masters = db.collection(TABLE_MASTERS);
			masters.aggregate([
				{$match : 	{
					_id 			: 	ObjectId(masterId),
					dropdown_type	:	masterType	
				}},
				{$lookup	: 	{
					"from" 			:	TABLE_MASTERS,
					"localField" 	:	"parent_id",
					"foreignField" 	:	"_id",
					"as" 			:	"parent_details"
				}},
				{$project 	:	{
					"_id" : 1,"name" : 1,"modified" : 1,"status" : 1,"image" : 1,"is_popular": 1,"master_descriptions": 1,"parent_id": 1,
					"parent_name" : {"$arrayElemAt"	: ["$parent_details.name",0]}
				}},
			]).toArray((err, result)=>{
				if(err) return next(err);
				
				/** Send error response **/
				if(!result ||result.length == 0) return resolve({status	: STATUS_ERROR, message	: res.__("admin.system.invalid_access")});
				
				/** Set options for appened image full path **/
				let options = {
					"file_url" 			: 	MASTER_FILE_URL,
					"file_path" 		: 	MASTER_FILE_PATH,
					"result" 			: 	result,
					"database_field" 	: 	"image"
				};
				
				/** Appened image with full path **/
				appendFileExistData(options).then(imageResponse=>{
					/** Send success response **/
					let response = {
						status	: STATUS_SUCCESS,
						result	: (imageResponse && imageResponse.result && imageResponse.result[0])	?	imageResponse.result[0]	:{}
					};
					resolve(response);
				}).catch(next)
			});
							
			//~ masters.findOne({
					//~ _id 			: 	ObjectId(masterId),
					//~ dropdown_type	:	masterType,
				//~ },
				//~ {projection: {_id:1,name:1,status:1,master_descriptions:1,modified:1,image:1,is_popular:1,parent_id:1}},
				//~ (err, result)=>{
					//~ if(err) return next(err);
					//~ 
					//~ if(!result){
						//~ return resolve({
							//~ status	: STATUS_ERROR,
							//~ message	: res.__("admin.system.invalid_access")
						//~ });
					//~ }
					//~ 
					//~ 
				//~ }
			//~ );
		});
	};// End getMasterDetails().
    
	/**
	 * Function to update master's Detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.masterUpdate = (req,res,next)=>{
		let masterType	=	(req.params.type)	?	req.params.type	: "";
		let displayType	= 	toTitleCase(masterType.replace(RegExp("_","g")," "));
		
		convertMultipartFormData(req,res).then(()=>{
			if(isPost(req)){
				/** Sanitize Data **/
				req.body	= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
				let id		= 	(req.params.id) 	? 	req.params.id 	:"";
				
				if(masterType =="" || id =="" || typeof req.body.master_descriptions === typeof undefined || (typeof req.body.master_descriptions[DEFAULT_LANGUAGE_MONGO_ID] === typeof undefined || !req.body.master_descriptions[DEFAULT_LANGUAGE_MONGO_ID] || req.body.master_descriptions[DEFAULT_LANGUAGE_MONGO_ID] =="")){
					/** Send error response **/
					return res.send({
						status	: STATUS_ERROR,
						message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
					
				}
				
				const clone			= 	require("clone");
				let allData			=	req.body;
				req.body			=	clone(allData.master_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
				req.body.parent_id 	= 	(allData.parent_id)		?	allData.parent_id				:"";
				let name			=	(req.body.name)			? 	req.body.name.trim() 			:"";
				let helpText		=	(req.body.help_text)			? 	req.body.help_text.trim() 			:"";
				let parentId		=	(req.body.parent_id)	? 	ObjectId(req.body.parent_id) 	:"";
				
			

				
				/** parse Validation array  **/
				let errors = [];
				/** Check name is unique **/
				const masters = db.collection(TABLE_MASTERS);
				
					
					let errMessageArray = 	[];
					
					
					/** Set options for upload image **/
					let image 			= 	(req.files && req.files.image)	? 	req.files.image 	:"";
					let oldImage 		= 	(allData.old_image) 			?	allData.old_image	:"";
					let options	=	{
						'image' 	:	image,
						'filePath' 	: 	MASTER_FILE_PATH,
						'oldPath' 	: 	oldImage
					};
					
					/** Upload user image **/
					moveUploadedFile(req, res,options).then(response=>{	
						if(response.status == STATUS_ERROR){
							errMessageArray.push({'param':'image','msg':response.message});
						}else{
							var imageName = (typeof response.fileName !== typeof undefined) ? response.fileName : '';
						}
						
						if(errMessageArray.length > 0){
							/** Send error response **/
							return res.send({
								status	: STATUS_ERROR,
								message	: errMessageArray
							});								
						}	
						
						/** Update master record **/
						masters.updateOne({
							_id : ObjectId(id)
						},
						{$set: {
							name				: 	name,
							help_text			:	helpText,
							parent_id			:	parentId,
							image				: 	imageName,
							master_descriptions	: 	(allData.master_descriptions) ? allData.master_descriptions :{},
							modified 			:	getUtcDate()
						}},(updateErr,updateResult)=>{
							if(updateErr) return next(updateErr);
							
							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.master.master_details_has_been_updated_successfully",displayType));
							res.send({
								status			: 	STATUS_SUCCESS,
								redirect_url	:	WEBSITE_ADMIN_URL+"master/"+masterType,
								message			: 	res.__("admin.master.master_details_has_been_updated_successfully",displayType),
							});
						});
					}).catch(next);
				
			}else{
				/** Get master details **/
				getMasterDetails(req,res,next).then(masterResponse=>{
					if(masterResponse.status != STATUS_SUCCESS){
						/** Send error response **/
						req.flash("error",masterResponse.message);
						res.redirect(WEBSITE_ADMIN_URL+"master/"+masterType);
						return;
					}
					
					let result 		= masterResponse.result;
					let parentId 	= (result.parent_id) ? result.parent_id :"";
					
					const async	= require("async");
					async.parallel([
						(callback)=>{
							if(masterType == "car"){
								/** Set options for get brand list **/
								let options = {
									collections : [{
										collection 	: 	TABLE_MASTERS,
										columns 	: 	["_id","name"],
										selected	:	[String(parentId)],
										conditions 	: 	{
											dropdown_type:"brand",
											$or : [
												{status	:	ACTIVE},
												{_id	:	parentId}
											]
										},
									}]
								};

								/** Get brand list **/
								getDropdownList(req, res,options).then(parentResponse=>{
									if(parentResponse.status != STATUS_SUCCESS) return callback(parentResponse.status,"");
									
									let brandList = (parentResponse && parentResponse.final_html_data && parentResponse.final_html_data["0"])	?	parentResponse.final_html_data["0"]:"";
									callback(null,brandList);
								}).catch(next);
							}else{
								callback(null,"");
							}
						},
						(callback)=>{
							/** Get language list **/
							getLanguages().then(languageList=>{
								callback(null,languageList);
							}).catch(next);	
						}
					],
					(err,response)=>{
						if(err) return next(err);
						
						/** Render edit page **/
						req.breadcrumbs(BREADCRUMBS["admin/master/edit"]);
						res.render("edit",{
							parent_list			: 	(response && response[0]) ? response[0] :"",
							language_list		: 	(response && response[1]) ? response[1] :[],
							result				:	result,
							type				: 	masterType,
							displayType 		:	displayType,
							dynamic_variable	: 	displayType,
							dynamic_url			: 	masterType,		
						});	
					});
				}).catch(next);	
			}
		});
	};//End masterUpdate()
	  
	/**
	 * Function for update master status
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.updateMasterStatus = (req,res,next)=>{
		let masterType		=	(req.params.type)			?	req.params.type			: "";
		let masterId		=	(req.params.id)				?	req.params.id			: "";
		let masterStatus	=	(req.params.status==ACTIVE) ? 	DEACTIVE 				: ACTIVE;
		let displayType		= 	toTitleCase(masterType.replace(RegExp("_","g")," "));
		
		/** Update master status **/
		const masters = db.collection(TABLE_MASTERS);
		masters.updateOne({
			_id : ObjectId(masterId)
		},
		{$set : {
			status		: 	masterStatus,
			modified	:	getUtcDate()			
		}},(err, result)=>{
			if(err) return next(err);
				
			/** Send success response **/
			req.flash("success",res.__("admin.master.status_has_been_updated_successfully",displayType));
			res.redirect(WEBSITE_ADMIN_URL+"master/"+masterType);	
		});
	};// end updateMasterStatus()
	
	/**
	 * Function for view master's Detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render
	 */
	this.viewMaster = (req,res,next)=>{
		let masterType	=	(req.params.type)	?	req.params.type	: "";
		let masterId	=	(req.params.id)		?	req.params.id	: "";
		let displayType	= 	toTitleCase(masterType.replace(RegExp("_","g")," "));
		
		/** Get master details **/
		getMasterDetails(req,res,next).then(response=>{
			if(response.status != STATUS_SUCCESS){
				/** Send error response **/
				req.flash("error",response.message);
				res.redirect(WEBSITE_ADMIN_URL+"master/"+masterType);
				return;
			}
			
			/** Render view page*/
			req.breadcrumbs(BREADCRUMBS["admin/master/view"]);
			res.render("view",{
				result			: 	response.result,						
				type			: 	masterType,
				displayType 	:	displayType,
				dynamic_variable: 	displayType,
				dynamic_url		:	masterType,							
			});
		}).catch(next);	
	};//End viewMaster()
}
module.exports = new Master();
