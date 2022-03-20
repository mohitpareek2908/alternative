const crypto 	= 	require("crypto");
const async		= 	require("async");

function Banner() {

	UserModel 	= 	this;

	/**
	 * Function for get list of banner
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.getBannerList = (req, res,next)=>{
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
		
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				
				async.parallel([
					(callback)=>{
						/** Get list of banner's **/
						collection.find(dataTableConfig.conditions).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).skip(skip).limit(limit).toArray((err, result)=>{
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
			/** Get banner active lenth  **/
			activeBannerLength(req, res).then(slider_count=>{
				/** render listing page **/
				req.breadcrumbs(BREADCRUMBS["admin/banner/list"]);
				res.render("list",{
					status_type			:	statusType,
					active_slider_count	:	slider_count,
				});
			}).catch(next);
			
			
			
		}
	};//End getBannerList()
	
	
	
	/**
	 * Function for active banner length
	 *
	 * @param req			As Request Data
	 * @param res 			As Response Data
	 *
	 * @return json
	 */
	let activeBannerLength = (req,res)=>{
		return new Promise(resolve=>{
			const slider	= db.collection(TABLE_SLIDER);
			slider.find(
			{
				is_active		: 	ACTIVE,
			}).count((err, result)=>{
				resolve(result);
			});
		});
	};//End activeBannerLength()
	
	
	
	/**
	 * Function for banner's Detail
	 *
	 * @param req			As Request Data
	 * @param res 			As Response Data
	 *
	 * @return json
	 */
	let getBannerDetails = (req,res)=>{
		return new Promise(resolve=>{
			let bannerId	=	(req.params.id)	?	req.params.id	:"";
			if(!bannerId || bannerId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				const slider	= db.collection(TABLE_SLIDER);
				slider.findOne(
					{
						_id 			: 	ObjectId(bannerId),
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
			}
		});
	};//End getBannerDetails()

	/**
	 * Function for update Banner Image Detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editBannerImage = (req,res,next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body 			= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
	
			let id 				= 	(req.params.id)				? 	req.params.id					:	"";
			var displayOrder 	= 	(req.body.display_order)	?	Number(req.body.display_order)	:	0;
			var description 	= 	(req.body.description)		?	req.body.description			:	"";
			
			req.checkBody({
				'display_order':{
					notEmpty: true,
					isNumeric:{
						errorMessage: res.__("admin.slider.invalid_order_value")
					},
					isInt: {
						options: {gt: 0},
						errorMessage: res.__("admin.slider.please_enter_order_should_be_grether_than_zero")
					},
					errorMessage: res.__("admin.slider.please_enter_display_order")
				},
				'description': {
					notEmpty	: true,
					errorMessage: res.__("admin.slider.please_enter_description")
				},
			});
			
			let errors = parseValidation(req.validationErrors(),req);
			if(errors){
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}	
			
			/** Configure banner unique conditions **/
			const sliders = db.collection(TABLE_SLIDER);
			sliders.findOne({
				_id   			:	{$ne : ObjectId(id)},
				display_order 	:	displayOrder
			},{_id:1,image:1},
			(err,result)=>{
				if(err) return next(err);
				
				let errMessageArray =[];
				if(result){
					errMessageArray.push({"param":"display_order","msg":res.__("admin.slider.this_display_order_already_in_use")});
					if(errMessageArray.length > 0){
						/** Send error response **/
						return res.send({
							status	: STATUS_ERROR,
							message	: errMessageArray,
						});
					}
				}else{ 
					/** Set options for upload image **/
					let oldimage= 	(req.body.old_image) ? req.body.old_image :"";
					
					let image	= 	(req.files && req.files.image)	?	req.files.image	:"";
					let options	=	{
						'image' 	:	image,
						'filePath' 	: 	SLIDER_FILE_PATH,
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
					
						/** Set Update data */
						let updateData	=	{						
							image			: 	imageName,
							display_order	: 	displayOrder,
							description		: 	description,
							modified	 	: 	getUtcDate(),
						};
						
						
						/** Update banner data **/
						sliders.updateOne({
							_id : ObjectId(id)
						},{$set : updateData},(updateErr,result)=>{
							if(updateErr) return next(updateErr);
							
							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.banner.banner_details_has_been_updated_successfully"));
							res.send({
								status		: STATUS_SUCCESS,
								redirect_url: WEBSITE_ADMIN_URL+"banner",
								message		: res.__("admin.banner.banner_details_has_been_updated_successfully"),
							});
						});					
					}).catch(next);
				}
			});		
		}else{
			/** Get banner details **/
			getBannerDetails(req, res).then(response=>{
				if(response.status != STATUS_SUCCESS){
					/** Send error response **/
					req.flash(STATUS_ERROR,response.message);
					res.redirect(WEBSITE_ADMIN_URL+"banner");
					return;
				}				
				
				/** Render edit page **/
				req.breadcrumbs(BREADCRUMBS["admin/banner/edit"]);
				res.render("edit",{
					result : (response.result) ? response.result :{}
				});				
			}).catch(next);			
		}	
	};//End editBannerImage()
	
	
	
	/**
	 * Function for add Banner Image
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addBanner = (req,res,next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body 			= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			var displayOrder 	= 	(req.body.display_order)	?	Number(req.body.display_order)	:	0;
			var description 	= 	(req.body.description)		?	req.body.description			:	"";
			
		
			
			let errors = [];			
			if((typeof req.files == typeof undefined)|| (!req.files) || (typeof req.files.image == typeof undefined)){
				if(!errors){
					errors = [];
				}
				errors.push({"param":"image","msg":res.__("admin.system.please_select_image")});
			}
			
			if(errors.length>0){
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}	
			
			/** Configure banner unique conditions **/
			const sliders = db.collection(TABLE_SLIDER);
			let errMessageArray =[];
			
			sliders.findOne({"display_order" : displayOrder},(err,result)=>{
				if(result){
					errMessageArray.push({"param":"display_order","msg":res.__("admin.slider.this_display_order_already_in_use")});
					if(errMessageArray.length > 0){
						/** Send error response **/
						return res.send({
							status	: STATUS_ERROR,
							message	: errMessageArray,
						});
					}
				}else{
					/** Set options for upload image **/
					let image	= 	(req.files && req.files.image)	?	req.files.image	:"";
					let options	=	{
						'image' 	:	image,
						'filePath' 	: 	SLIDER_FILE_PATH,
						
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
					
						sliders.insertOne({
							image			: 	imageName,
							created 		: 	getUtcDate(),
							modified 		: 	getUtcDate(),
							display_order	: 	displayOrder,
							description		: 	description,
							is_active		: 	ACTIVE,
							is_deleted		: 	NOT_DELETED						   
						},(err,result)=>{
							if(err) return next(err);
							req.flash(STATUS_SUCCESS,res.__("admin.banner.banner_details_has_been_save_successfully"));
							res.send({
								status		: STATUS_SUCCESS,
								redirect_url: WEBSITE_ADMIN_URL+"banner",
								message		: res.__("admin.banner.banner_details_has_been_save_successfully"),
							});
						});
					}).catch(next);
				}
			});
		}else{
			/** Render edit page **/
			getLanguages().then((languageList)=>{
			req.breadcrumbs(BREADCRUMBS["admin/banner/add"]);
			res.render("add",{	
				language_list	: languageList			
			});
			});
		}	
	};//End addBanner()
		

	/**
	 * Function for delete banner
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.deleteBanner = (req,res)=>{
		try{
			let bannnerId		 = (req.params.id) ? req.params.id : "";
			if(bannnerId){
				/** Delete user*/
				const slider = db.collection(TABLE_SLIDER);
				slider.deleteOne(
					{
						_id : ObjectId(bannnerId)
					},
					(err,result)=>{
						if(!err){
							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.banner.banner_deleted_successfully"));
							res.redirect(WEBSITE_ADMIN_URL+"banner");
						}else{
							/** Send error response **/
							req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
							res.redirect(WEBSITE_ADMIN_URL+"banner");
						}
					}
				);
			}else{
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"banner");
			}
		}catch(e){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
			res.redirect(WEBSITE_ADMIN_URL+"banner");
		}
	};//End deleteBanner()
	
	
	
	/**
	 * Function for update banner's status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.updateBannerStatus = (req,res)=>{
		let bannnerId		 = 	(req.params.id) 		?	req.params.id 			:"";
		let userStatus	 =	(req.params.status) 		? 	req.params.status	 	:"";
		let statusType	 =	(req.params.status_type) 	? 	req.params.status_type	:"";

		if(bannnerId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			try{
				let updateData = {
					modified 	:	getUtcDate()
				};
				if(statusType == ACTIVE_INACTIVE_STATUS){
					updateData["is_active"]			=	(userStatus==ACTIVE) ? DEACTIVE :ACTIVE;
				}
				
				/** Update user status*/
				const sliders = db.collection(TABLE_SLIDER);
				sliders.updateOne({_id : ObjectId(bannnerId)},{$set :updateData},(err,result)=>{
					if(!err){
						/** Send success response **/
						req.flash(STATUS_SUCCESS,res.__("admin.banner.banner_status_has_been_updated_successfully"));
						res.redirect(WEBSITE_ADMIN_URL+"banner");
					}else{
						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"banner");
					}
				});
			}catch(e){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+"banner");
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"banner");
		}
	};//End updateBannerStatus()
	
	
	
	this.downloadOrderPdf = (req,res,next)=>{
		let id	=	(req.params.id)		?	req.params.id	:	"";
		const fs				=	require("fs");
		var wkhtmltopdf = require('wkhtmltopdf');
		console.log(WEBSITE_ADMIN_URL);
		 let url = WEBSITE_ADMIN_URL+"banner/export_pdf/"+id;
		
		/* To generate pdf */
		wkhtmltopdf(url,{
		pageSize	: 'A4',
		marginTop	: '5mm',
		//marginRight	: '0mm',
		marginBottom: '0mm',
		//marginLeft	: '0mm',
		encoding	: "UTF-8",
		//noOutline	: true,
		//disableSmartShrinking : true,
		// readArgsFromStdin : true
		}).pipe(res);
	}
	
	
	/**
	*  Function for export excel of order detail
	*
	* @param req As Request Data
	* @param res As Response Data
	*
	* @return null
    */

   this.exportDataPDFOrder = (req,res,next)=>{
		let id	=	(req.params.id)		?	req.params.id	:	"";
		console.log("here in order");
		console.log("req.params.id "+req.params.id);
		
			console.log("pdf_base_layout faq");
			res.render("pdf_base_layout",{	
				//language_list	: languageList,
				//default_lang_code :  'en'		
			});
			/*res.render("pdf_base_layout",{
				
					//commonColl_detail : commonColls,
					//export_data		  : temp,
					//new_finalData		  : newfinalData,
					//logo_image		  : SITE_LOGO,
					heading_pdf		  : "TEST KAPIL",
					//order_detail			:	orderDetail,
					//orderItems			:	orderItems
				
			});*/
			
			
		
	};// end exportDataPDFOrder()
	
}
module.exports = new Banner();
