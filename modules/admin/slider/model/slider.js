const async		= 	require("async");

function Slider(){
	SliderModel 	= 	this;

	/**
	 * Function for get splash screens  list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.getScreensItemList = (req, res)=>{
        let statusType	=	(req.params.type)	?	req.params.type	:"";
      
		if(isPost(req)){
			let limit			= 	(req.body.length) 				? 	parseInt(req.body.length) 			:ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start)  				?	parseInt(req.body.start)  			:DEFAULT_SKIP;
			let fromDate 		= 	(req.body.fromDate) 	 		? 	req.body.fromDate 					:"";
			let toDate 			= 	(req.body.toDate) 	 			? 	req.body.toDate 					:"";
			let statusSearch	= 	(req.body.status_search)		? 	parseInt(req.body.status_search)	:"";
			const collection	= 	db.collection(TABLE_SLIDER);
			/** Configure DataTable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Set conditions **/
				let commonConditions = {
					is_deleted		: 	NOT_DELETED,					
				};

				/** Conditions for search using status*/
				if (statusSearch != "") {
					switch(statusSearch){
						case SEARCHING_ACTIVE:
							dataTableConfig.conditions["is_active"] 		= 	ACTIVE;
						break;

						case SEARCHING_DEACTIVE:
							dataTableConfig.conditions["is_active"] 		= 	DEACTIVE;
						break;
					}
				}

				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);	
				async.parallel([
					(callback)=>{
						/** Get list of splash screen **/
						collection.find(dataTableConfig.conditions,{_id:1,image:1,is_active:1,is_deleted:1,modified:1,title:1}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err, result)=>{
							/** Set options for append image **/
							let options = {
								"file_url" 			: 	SLIDERS_URL, 
								"file_path" 		: 	SLIDER_FILE_PATH,
								"result" 			: 	result,
								"database_field" 	: 	"image"
							};
		
							/** Append image with full path **/
							appendFileExistData(options).then(response=>{
								result = (response && response.result)	?	response.result	:[];
								callback(err, result);
							});
						});
					},
					(callback)=>{
						/** Get total number of records in splash_screens collection **/
						collection.find(commonConditions).count((err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records couting in splash_screens **/
						collection.find(dataTableConfig.conditions).count((err,filterContResult)=>{
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
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS["admin/slider/list"]);
			res.render("list",{
				status_type	:	statusType,
			});
		}
    }

	
	
	
	/**
	 * Function for add Screen
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 * @return render/json
	 */
	this.addScreen = (req,res,next)=>{
		
		if(isPost(req)){
			
			req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			
			if(req.body.page_descriptions == undefined || req.body.page_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == undefined || req.body.page_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == ''){
				/** Send error response */
				return res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}

			const clone				= require('clone');
			let allData				= req.body;
			
			req.body 				= 	clone(allData.page_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
			let screenTitle 		= (req.body.title)? req.body.title	: "";
			let screenDescription 	= (req.body.description)? req.body.description	: "";
			/** Check validation */
			
			
			req.body.pages_descriptions	= 	(allData.pages_descriptions)?	allData.pages_descriptions	:"";
		
			/** parse Validation array  */
			let errMessageArray = [];

			if((typeof req.files == typeof undefined)|| (!req.files) || (typeof req.files.image == typeof undefined)){
			
				errMessageArray.push({'param':'image','msg':res.__("admin.splashscreens.please_select_banner_image")});
			}
		
			if(errMessageArray.length == 0){
				/** Set options for upload image **/
				let image	= 	(req.files && req.files.image)	?	req.files.image	:"";
				let options	=	{
					'image' 	:	image,
					'filePath' 	: 	SLIDER_FILE_PATH
				};

				/** Upload retailer image **/
				var imageName = '';			
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
							message	: errMessageArray,
						});
					}	

					const splashscreens = db.collection(TABLE_SLIDER);
					splashscreens.insertOne({
						title				:	screenTitle,
						description			: 	screenDescription,
						image				: 	imageName,
						is_deleted			:	NOT_DELETED,
						is_active 			: 	ACTIVE,
						default_language_id	: 	DEFAULT_LANGUAGE_MONGO_ID,
						pages_descriptions	: 	(allData.page_descriptions)	?	allData.page_descriptions :{},
						created 			: 	getUtcDate(),
						modified 			: 	getUtcDate()
					},(err,result)=>{
						if(err) return next(err);
							
						/** Send success response */
						req.flash(STATUS_SUCCESS,res.__("admin.slider.slider_has_been_added_successfully"));
						res.send({
							status			: STATUS_SUCCESS,
							redirect_url	: WEBSITE_ADMIN_URL+'slider',
							message			: res.__("admin.slider.slider_has_been_added_successfully")
						});
					});
				}).catch(next);
			}else{
				/** Send error response */
				return res.send({
					status	: STATUS_ERROR,
					message	: errMessageArray,
				});
			}
		}else{
		
			/** Get language list */
			getLanguages().then((languageList)=>{
				
				req.breadcrumbs(BREADCRUMBS['admin/slider/add']);
				res.render('add',{
					language_list	: languageList
				});
			});
			
							
			
			
		}
	
	}
	
	
	
	
	
	/**
	 * Function for edit Screen
	 
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 * @return render/json
	 */
	this.editSplashScreen = (req,res,next)=>{
		
		if(isPost(req)){
			let splashScreencreenId	= 	(req.params.id) ? 	req.params.id 	:"";
			req.body = 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
					
		
			
			
			if(req.body.page_descriptions == undefined || req.body.page_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == undefined || req.body.page_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == ''){
				/** Send error response */
				return res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}

			const clone				= require('clone');
			let allData				= req.body;
			let oldimage			= 	(req.body.old_image) 			? 	req.body.old_image 			:"";
			
			req.body 				= 	clone(allData.page_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
			let screenTitle 		=  (req.body.title)? req.body.title	: "";
			let screenDescription 	= (req.body.description)? req.body.description	: ""
			
			
			
			
			
			
			
			//consoleLog(oldimage);
			//return false;
			
				/** Set options for upload image **/
				let image	= 	(req.files && req.files.image)	?	req.files.image	:"";
				let options	=	{
					'image' 	:	image,
					'filePath' 	: 	SLIDER_FILE_PATH,
					'oldPath' 	: 	oldimage
				};

				/** Upload retailer image **/
				var imageName = '';			
				moveUploadedFile(req, res,options).then(response=>{
					let errMessageArray = [];
					if(response.status == STATUS_ERROR){
						errMessageArray.push({'param':'image','msg':response.message});
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
					const splashscreens = db.collection(TABLE_SLIDER);
					splashscreens.updateOne({
						_id	:	ObjectId(splashScreencreenId)
						},{
							$set:{
								title				:	screenTitle,
								description			: 	screenDescription,
								pages_descriptions	: 	(allData.page_descriptions)	?	allData.page_descriptions :{},
								image				: 	imageName,
								modified 			: 	getUtcDate()
							}
						},(err,result)=>{
							if(err) return next(err);
								
							/** Send success response */
							req.flash(STATUS_SUCCESS,res.__("admin.slider.slider_has_been_updated_successfully"));
							res.send({
								status			: STATUS_SUCCESS,
								redirect_url	: WEBSITE_ADMIN_URL+'slider',
								message			: res.__("admin.slider.slider_has_been_updated_successfully")
							});
						});
				}).catch(next);
			
		}else{
			/** Get language list */
			getLanguages().then((languageList)=>{
				getSplashScreenDetails(req, res).then(response=>{
						
						req.breadcrumbs(BREADCRUMBS['admin/slider/edit']);
						/**Render edit splash page */
						res.render('edit',{
							language_list	: languageList,
							result			:	(response.result) ? response.result :{}
						});
					
				}).catch(next);
			});
		}
	
		
	}
	
	
	
		/**
	 * Function for splash screen Detail
	 *
	 * @param req	As Request Data
	 * @param res 	As Response Data
	 *
	 * @return json
	 */
	let getSplashScreenDetails = (req,res)=>{
		return new Promise(resolve=>{
			let splashScreenId	=	(req.params.id)	?	req.params.id	:"";
			if(!splashScreenId || splashScreenId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				try{
					const splash_screens	= db.collection(TABLE_SLIDER);
					splash_screens.findOne(
						{
							_id 			: 	ObjectId(splashScreenId),							
							is_deleted		: 	NOT_DELETED,
						},(err, result)=>{
							if(result){
								/** Set options for append image full path **/
								let options = {
									"file_url" 			: 	SLIDERS_URL,
									"file_path" 		: 	SLIDER_FILE_PATH,
									"result" 			: 	[result],
									"database_field" 	: 	"image"
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
							}else{
								/** Send error response **/
								let response = {
									status	: STATUS_ERROR,
									message	: res.__("admin.system.invalid_access")
								};
								resolve(response);
							}
						}
					);
				}catch(e){
					/** Send error response **/
					let response = {
						status	: STATUS_ERROR,
						message	: res.__("admin.system.something_going_wrong_please_try_again")
					};
					resolve(response);
				}
			}
		});
	};//End getSplashScreenDetails()
	
	
	
	/**
	 * Function for delete splash screen
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.deleteScreen = (req,res)=>{
			let splashScreenId		 = (req.params.id) ? req.params.id : "";
			
			if(splashScreenId){
				/** Delete user*/
				const splash_screens = db.collection(TABLE_SLIDER);
				splash_screens.updateOne({
					"_id"	:	ObjectId(splashScreenId)
				},{
					$set:{
						is_deleted	:	DELETED,
						modified	:	getUtcDate()
					}
				}, function(err, result) {
					if(!err){	
						/** Send success response **/
						req.flash(STATUS_SUCCESS,res.__("admin.slider.splash_screen_deleted_successfully"));
						res.redirect(WEBSITE_ADMIN_URL+"slider");
					}else{
						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"slider");
					}
				 });
			}else{
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"slider");
			}
		
	};//End deleteScreen()
	
		/**
	 * Function for update splash screens status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.updateSplashScreen = (req,res)=>{
		let userStatus	 	 =	(req.params.status) 		? 	req.params.status	 	:"";
		let statusType		 =	(req.params.status_type) 	? 	req.params.status_type	:"";
		let splashScreenId	 =	(req.params.id) 			? 	req.params.id			:"";

		if(splashScreenId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			try{
				let updateData = {
					modified 	:	getUtcDate()
				};
				if(statusType == ACTIVE_INACTIVE_STATUS){
					updateData["is_active"]			=	(userStatus==ACTIVE) ? DEACTIVE :ACTIVE;
				}
				
				/** Update user status*/
				const splash_screens = db.collection(TABLE_SLIDER);
				splash_screens.update({_id : ObjectId(splashScreenId)},{$set :updateData},(err,result)=>{
					if(!err){
						/** Send success response **/
						req.flash(STATUS_SUCCESS,res.__("admin.slider.slider_status_has_been_updated_successfully"));
						res.redirect(WEBSITE_ADMIN_URL+"slider");
					}else{
						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"slider");
					}
				});
			}catch(e){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+"slider");
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"slider");
		}
	};//End updateSplashScreen()

}

module.exports = new Slider();
