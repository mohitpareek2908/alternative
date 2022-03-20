const crypto 	= 	require("crypto");
const async		= 	require("async");

function AdManagements() {

	AdsModel 	= 	this;

	/**
	 * Function for get list of ads list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.getAdsList = (req, res,next)=>{
		let statusType	=	(req.params.type)	?	req.params.type	:"";
		if(isPost(req)){
			let limit			= 	(req.body.length) 				? 	parseInt(req.body.length) 			:ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start)  				?	parseInt(req.body.start)  			:DEFAULT_SKIP;
			let fromDate 		= 	(req.body.fromDate) 	 		? 	req.body.fromDate				:"";
			let toDate 			= 	(req.body.toDate) 	 			? 	req.body.toDate					:"";
			let statusSearch	= 	(req.body.status_search)		? 	parseInt(req.body.status_search)	:"";
			
			const collection	= 	db.collection(TABLE_ADS);
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
							dataTableConfig.conditions["status"] 		= ACTIVE;
						break;

						case SEARCHING_DEACTIVE:
							dataTableConfig.conditions["status"] 		= DEACTIVE;
						break;

					}
				}
			
				if (fromDate != "" && toDate != "") {
					dataTableConfig.conditions["$and"]=[
						{ "start_date": { $gte 	: newDate(fromDate)} },
						{ "end_date": { $lt 	: newDate(toDate)} },
					]
				}
				
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				
				async.parallel([
					(callback)=>{
						/** Get list of banner's **/
						collection.find(dataTableConfig.conditions,{projection:{_id:1,start_date:1,end_date:1,created:1,ad_name:1,display_placement:1,image:1,status:1,modified:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).skip(skip).limit(limit).toArray((err, result)=>{
							/** Set options for append image **/
							let options = {
								"file_url" 			: 	ADS_URL,
								"file_path" 		: 	ADS_FILE_PATH,
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
						/** Get total number of records in banner collection **/
						collection.find(commonConditions).count((err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records couting in banner **/
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
			req.breadcrumbs(BREADCRUMBS["admin/ad_managements/list"]);
			res.render("list",{
				status_type			:	statusType,
			});
		
			
		}
	};//End getBannerList()
	
	
	
	/**
	 * Function for add ads
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addAds = (req,res,next)=>{
		let deductAmountValue = res.locals.settings["Site.amount_deduct_on_ad_per_cliick"];
		//const moment = require('moment');
	//	const moment = require('moment');
		/* let insertData11 = {
				
				modified 			: 	getUtcDate(),
				modified_1 			: 	moment('2021-01-28 21:31',  moment.defaultFormat).toDate(),
				modified_2 			: 	moment('2021-01-28 23:59', "YYYY-MM-DD HH:mm").toDate(),
				
			
				
			} */
		
		
		if(isPost(req)){
			/** Sanitize Data **/
			req.body 				= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let budget        		= 	(req.body.ad_budget) ? req.body.ad_budget : 0;
			var startDate 			= 	(req.body.start_date)				? 	getUtcDate(req.body.start_date)		:	"";
			var endDate				= 	(req.body.end_date)					? 	getUtcDate(req.body.end_date)		:	"";
			
			consoleLog("basic validation cleared.");
			
			//return false;
			let errors = [];
			
			if((typeof req.files == typeof undefined)|| (!req.files) || (typeof req.files.image == typeof undefined)){
				
				errors.push({"param":"image","msg":res.__("admin.system.please_select_image")});
			}
			
			
			if(budget && budget <= 0){
				errors.push({'param':'ad_budget','msg':res.__("admin.ad_managements.please_enter_value_greater_than_zero")});
			}
			if(startDate >= endDate){
				errors.push({'param':'end_date','msg':res.__("admin.ad_managements.end_date_should_be_greater_than_start_date")});
			}
			if(errors.length > 0){
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}	
			
			/** Configure ads conditions **/
			const ads = db.collection(TABLE_ADS);
			let errMessageArray =[];

			/** Set options for upload image **/
			let image	= 	(req.files && req.files.image)	?	req.files.image	:"";
			let options	=	{
				'image' 	:	image,
				'filePath' 	: 	ADS_FILE_PATH,
				
			};
			/** Upload banner  image **/
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
				var adName 				= 	(req.body.ad_name)					?	req.body.ad_name					:	"";
				var displayPlacement 	= 	(req.body.display_placement)		?	req.body.display_placement			:	"";
				var redirectUrl 		= 	(req.body.redirect_url)				?	req.body.redirect_url				:	"";
				
				ads.insertOne({
					ad_name				:	adName,
					display_placement	: 	displayPlacement,
					amount_deduct_per_click :  Number(deductAmountValue), 
					redirect_url		: 	redirectUrl,
					ad_budget			:   Number(budget), 
					image				: 	imageName,
					start_date			: 	startDate,
					end_date			: 	endDate,
					
					created 			: 	getUtcDate(),
					modified 			: 	getUtcDate(),
					status				: 	ACTIVE,
					is_deleted			: 	NOT_DELETED						   
				},(err,result)=>{
					if(err) return next(err);
					req.flash(STATUS_SUCCESS,res.__("admin.ad_managements.ad_managements_has_been_save_successfully"));
					res.send({
						status		: STATUS_SUCCESS,
						redirect_url: WEBSITE_ADMIN_URL+"ad_managements",
						message		: res.__("admin.ad_managements.ad_managements_has_been_save_successfully"),
					});
				});
			}).catch(next);
				
		
		}else{
			/** Render edit page **/
			req.breadcrumbs(BREADCRUMBS["admin/ad_managements/add"]);
			res.render("add",{	
				deduct_amount_value : deductAmountValue 			
			});
		}	
	};//End addBanner()
	
	
	
	/**
	 * Function for ads Detail
	 *
	 * @param req			As Request Data
	 * @param res 			As Response Data
	 *
	 * @return json
	 */
	let getAdsDetails = (req,res)=>{
		return new Promise(resolve=>{
			let bannerId	=	(req.params.id)	?	req.params.id	:"";
			if(!bannerId || bannerId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				const ads	= db.collection(TABLE_ADS);
				ads.findOne(
					{
						_id 			: 	ObjectId(bannerId),
						is_deleted		: 	NOT_DELETED,
					},(err, result)=>{
						if(result){
							/** Set options for append image full path **/
							let options = {
								"file_url" 			: 	ADS_URL,
								"file_path" 		: 	ADS_FILE_PATH,
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
			}
		});
	};//End getBannerDetails()

	
	
	/**
	 * Function for update ads Detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editAds = (req,res,next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body 			= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let id 				= 	(req.params.id)				? 	req.params.id					:	"";
			let budget        	= 	(req.body.ad_budget) ? req.body.ad_budget : 0;
			var startDate 		= 	(req.body.start_date)				? 	getUtcDate(req.body.start_date)		:	"";
			var endDate			= 	(req.body.end_date)					? 	getUtcDate(req.body.end_date)		:	"";
		/* 	req.checkBody({
				'ad_name':{
					notEmpty: true,
					errorMessage: res.__("admin.ad_managements.please_enter_ad_name")
				},
				'display_placement': {
					notEmpty	: true,
					errorMessage: res.__("admin.ad_managements.please_select_display_placement")
				},
				'redirect_url': {
					notEmpty	: true,
					isURL : {
						errorMessage: res.__("admin.ad_managements.please_enter_valid_redirect_url")
					},
					errorMessage: res.__("admin.ad_managements.please_enter_redirect_url")
				},
				"ad_budget": {
					notEmpty		: 	true,
					isNumeric:{
						errorMessage: res.__("admin.ad_managements.please_enter_numeric_value")
					},
					errorMessage	:	res.__("admin.ad_managements.please_enter_ad_budget")
				},
				'start_date': {
					notEmpty	: true,
					errorMessage: res.__("admin.ad_managements.please_select_start_date")
				},
				'end_date': {
					notEmpty	: true,
					errorMessage: res.__("admin.ad_managements.please_select_end_date")
				},
			});
			 */
			
			let errors = [];

			if(budget && budget <= 0){
				errors.push({'param':'ad_budget','msg':res.__("admin.ad_managements.please_enter_value_greater_than_zero")});
			}
            if(startDate >= endDate){
				errors.push({'param':'end_date','msg':res.__("admin.ad_managements.end_date_should_be_greater_than_start_date")});
			}
			if(errors.length > 0){
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}	
			
			/** Configure banner unique conditions **/
			const ads = db.collection(TABLE_ADS);
			
				
				
				let errMessageArray =[];
				
					/** Set options for upload image **/
					let oldimage= 	(req.body.old_image) ? req.body.old_image :"";
					
					let image	= 	(req.files && req.files.image)	?	req.files.image	:"";
					let options	=	{
						'image' 	:	image,
						'filePath' 	: 	ADS_FILE_PATH,
						'oldPath' 	: 	oldimage
					};
					
					/** Upload banner  image **/
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
						var adName 				= 	(req.body.ad_name)					?	req.body.ad_name					:	"";
						var displayPlacement 	= 	(req.body.display_placement)		?	req.body.display_placement			:	"";
						var redirectUrl 		= 	(req.body.redirect_url)				?	req.body.redirect_url				:	"";
						
						/** Set Update data */
						let updateData	=	{						
							image				: 	imageName,
							ad_budget			:   Number(budget),
							ad_name				: 	adName,
							display_placement	: 	displayPlacement,
							redirect_url		: 	redirectUrl,
							start_date			: 	startDate,
							end_date			: 	endDate,
							modified	 		: 	getUtcDate(),
						};
						
						
						/** Update banner data **/
						ads.updateOne({
							_id : ObjectId(id)
						},{$set : updateData},(updateErr,result)=>{
							if(updateErr) return next(updateErr);
							
							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.ad_managements.ad_managements_has_been_updated_successfully"));
							res.send({
								status		: STATUS_SUCCESS,
								redirect_url: WEBSITE_ADMIN_URL+"ad_managements",
								message		: res.__("admin.banner.ad_managements_has_been_updated_successfully"),
							});
						});					
					}).catch(next);
				
				
		}else{
			/** Get ads details **/
			getAdsDetails(req, res).then(response=>{
				if(response.status != STATUS_SUCCESS){
					/** Send error response **/
					req.flash(STATUS_ERROR,response.message);
					res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
					return;
				}				
				
				/** Render edit page **/
				req.breadcrumbs(BREADCRUMBS["admin/ad_managements/edit"]);
				res.render("edit",{
					result : (response.result) ? response.result :{}
				});				
			}).catch(next);			
		}	
	};//End editAds()
	
	
	
		

	/**
	 * Function for delete ads
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.deleteAds = (req,res)=>{
		try{
			let adId		 = (req.params.id) ? req.params.id : "";
			if(adId){
				/** Delete user*/
				const ads = db.collection(TABLE_ADS);
				ads.updateOne(
					{
						_id : ObjectId(adId)
					},{
						
						$set : {
							is_deleted : ACTIVE
						}
					},
					(err,result)=>{
						if(!err){
							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.ad_managements.ad_deleted_successfully"));
							res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
						}else{
							/** Send error response **/
							req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
							res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
						}
					}
				);
			}else{
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
			}
		}catch(e){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
			res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
		}
	};//End deleteAds()
	
	
	
	
	
	/**
	 * Function for view ads 
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.viewDetail = (req,res)=>{
		/** Get promo code details **/
		getAdsDetails(req, res).then(response=>{
			if(response.status != STATUS_SUCCESS){
				/** Send error response **/
				req.flash(STATUS_ERROR,response.message);
				res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
				return;
			}
			
			/** Render edit page **/
			req.breadcrumbs(BREADCRUMBS["admin/ad_managements/view"]);
			res.render("view",{
				result : (response.result) ? response.result :{},
			});
		});
	}
	
	
	
	
	/**
	 * Function for update ads status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.updateAdsStatus = (req,res)=>{
		let adId		 = 	(req.params.id) 		?	req.params.id 			:"";
		let userStatus	 =	(req.params.status) 		? 	req.params.status	 	:"";
		let statusType	 =	(req.params.status_type) 	? 	req.params.status_type	:"";

		if(adId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			try{
				let updateData = {
					modified 	:	getUtcDate()
				};
				if(statusType == ACTIVE_INACTIVE_STATUS){
					updateData["status"]			=	(userStatus==ACTIVE) ? DEACTIVE :ACTIVE;
				}
				console.log("updateData");
				//console.log(updateData);
				/** Update ads status*/
				const ads = db.collection(TABLE_ADS);
				ads.updateOne({_id : ObjectId(adId)},{$set :updateData},(err,result)=>{
					if(!err){
						/** Send success response **/
						req.flash(STATUS_SUCCESS,res.__("admin.ad_managements.ads_status_has_been_updated_successfully"));
						res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
					}else{
						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
					}
				});
			}catch(e){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"ad_managements");
		}
	};//End updateBannerStatus()
	
	
	
	
	
}
module.exports = new AdManagements();
