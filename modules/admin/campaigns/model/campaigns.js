const crypto 	= 	require("crypto");
const async		= 	require("async");

function Campaigns() {

	CampaignModel 	= 	this;

	/**
	 * Function for get list of Campaign list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.getCampaignList = (req, res,next)=>{
		let statusType	=	(req.params.type)	?	req.params.type	:"";
		if(isPost(req)){
			let limit			= 	(req.body.length) 				? 	parseInt(req.body.length) 			:ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start)  				?	parseInt(req.body.start)  			:DEFAULT_SKIP;
			let fromDate 		= 	(req.body.fromDate) 	 		? 	req.body.fromDate				:"";
			let toDate 			= 	(req.body.toDate) 	 			? 	req.body.toDate					:"";
			let statusSearch	= 	(req.body.status_search)		? 	parseInt(req.body.status_search)	:"";
			
			const collection	= 	db.collection(TABLE_CAMPAIGN);
			
			/** Configure DataTable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Set conditions **/
				let commonConditions = {};
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
				}else
				{
					commonConditions = {
						status		: 	ACTIVE,
					};
				}
				
				if (fromDate != "" && toDate != "") {
					dataTableConfig.conditions["$and"]=[
						{ "duration_start_date": { $gte 	: newDate(fromDate)} },
						{ "duration_end_date": { $lt 	: newDate(toDate)} },
					]
				}
				
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);

				
				
				async.parallel([
					(callback)=>{
						/** Get list of banner's **/
						collection.find(dataTableConfig.conditions,{projection:{_id:1,budget:1,view_count:1,remaining_budget:1,duration_start_date:1,duration_end_date:1,created:1,name:1,image:1,status:1,modified:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).skip(skip).limit(limit).toArray((err, result)=>{
							/** Set options for append image **/
							let options = {
								"file_url" 			: 	CAMPAIGN_URL,
								"file_path" 		: 	CAMPAIGN_FILE_PATH,
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
			req.breadcrumbs(BREADCRUMBS["admin/campaign_management/list"]);
			res.render("list",{
				status_type			:	statusType,
			});
		
			
		}
	};//End getBannerList()
	
	
	
	/**
	 * Function for add Campaign
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addCampaign = (req,res,next)=>{
		let deductAmountValue = res.locals.settings["Site.amount_deduct_on_ad_per_cliick"];

		
		if(isPost(req)){
			/** Sanitize Data **/
			req.body 				= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			
			


			let campaignName 			    = (req.body.name) ? req.body.name : "";
			let campaignDescription			= (req.body.description) ? req.body.description : "";
			let interestIds			        = (req.body.interest_id) ? req.body.interest_id : [];
			let ageType			            = (req.body.age_type) ? req.body.age_type : [];
			let budget			            = (req.body.budget) ? parseFloat(req.body.budget) : parseFloat(CAMPAIGN_BUDGET_FIXED_VALUE_FOR_ADMIN);
		   
			let campaignType			    = (req.body.campaign_type) ? req.body.campaign_type : "";
			let durationStartDate			= (req.body.duration_start_date) ? req.body.duration_start_date : "";
			let durationEndDate			    = (req.body.duration_end_date) ? req.body.duration_end_date : "";
			let websiteUrl			        = (req.body.website_url) ? req.body.website_url : "";
			let postMediaType			    = (req.body.post_media_type) ? req.body.post_media_type : "";
			let kidInterestIds				=	(req.body.kid_interest_id) 							? 	req.body.kid_interest_id			:[];
			let teenInterestIds				=	(req.body.teen_interest_id) 						? 	req.body.teen_interest_id			:[];
			let adultInterestIds			=	(req.body.adult_interest_id) 						? 	req.body.adult_interest_id			:[];

			if(typeof(interestIds) == "string"){
				consoleLog("Inside");
				interestIds = [interestIds]
			}
			consoleLog(typeof(interestIds));
			
			let interestIdsTypeArray = [];
			if(interestIds.length > 0){
				interestIds.map(listingTypeId=>{
					consoleLog(listingTypeId);
					interestIdsTypeArray.push(ObjectId(listingTypeId))
				})
			}
			
			let ageTypeArray = [];
			//set category role type
			if(typeof(kidInterestIds) == "string"){
				kidInterestIds = [kidInterestIds]
			}
			
			let kidCategoryIdsArray = [];
			if(kidInterestIds.length > 0){
				ageTypeArray.push("kid");
				kidInterestIds.map(listingTypeId=>{
					kidCategoryIdsArray.push(ObjectId(listingTypeId))
					
						interestIdsTypeArray.push(ObjectId(listingTypeId))
					
				})
			}
			
			if(typeof(teenInterestIds) == "string"){
				teenInterestIds = [teenInterestIds]
			}
			
			let teenCategoryIdsArray = [];
			if(teenInterestIds.length > 0){
				ageTypeArray.push("teen");
				teenInterestIds.map(listingTypeId=>{
					teenCategoryIdsArray.push(ObjectId(listingTypeId))
					
						interestIdsTypeArray.push(ObjectId(listingTypeId))
				
					
				})
			}
			
			
			if(typeof(adultInterestIds) == "string"){
				adultInterestIds = [adultInterestIds]
			}
			
			let adultCategoryIdsArray = [];
			if(adultInterestIds.length > 0){
				ageTypeArray.push("adult");
				adultInterestIds.map(listingTypeId=>{
					adultCategoryIdsArray.push(ObjectId(listingTypeId))
					
						interestIdsTypeArray.push(ObjectId(listingTypeId))
					
				})
			}
			
			
		
			let errors = [];
			
			if((typeof req.files == typeof undefined)|| (!req.files) || (typeof req.files.image == typeof undefined)){
				
				errors.push({"param":"image","msg":res.__("admin.system.please_select_image")});
			}
			
			
			if(budget && budget <= 0){
				errors.push({'param':'ad_budget','msg':res.__("admin.campaign_management.please_enter_value_greater_than_zero")});
			}
			if(durationEndDate  < durationStartDate){
				errors.push({'param':'duration_end_date','msg':res.__("admin.campaign_management.end_date_should_be_greater_than_start_date")});
			}
			if(errors.length > 0){
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}	
			
			/** Configure campaign conditions **/
			const campaign = db.collection(TABLE_CAMPAIGN);
			let errMessageArray =[];

			/** Set options for upload image **/
			let image			= 	(req.files && req.files.image)	?	req.files.image	:"";
			let thumbnailImage	= 	(req.files && req.files.thumbnail_image)	?	req.files.thumbnail_image	:"";
			let options	=	{
				'image' 	:	image,
				'filePath' 	: 	CAMPAIGN_FILE_PATH,
				
			};

			if(postMediaType == POST_TYPE_VIDEO)
			{
				options['allowedExtensions'] = ALLOWED_VIDEO_EXTENSIONS;
				options['allowedImageError'] = ALLOWED_VIDEO_ERROR_MESSAGE;
				options['allowedMimeTypes'] = ALLOWED_VIDEO_MIME_EXTENSIONS;
				options['allowedMimeError'] = ALLOWED_VIDEO_MIME_ERROR_MESSAGE;
			
			}

			consoleLog(options);
			/** Upload banner  image **/
			moveUploadedFile(req, res,options).then(response=>{
				if(response.status == STATUS_ERROR){
					errMessageArray.push({'param':'image','msg':response.message});
				}else{
					var imageName = (typeof response.fileName !== typeof undefined) ? response.fileName : '';
				}
				
				let optionsFrthumbnail	=	{
					'image' 				:	thumbnailImage,
					'filePath' 				: 	CAMPAIGN_FILE_PATH,
				};


				moveUploadedFile(req, res,optionsFrthumbnail).then(thumbnailImageResponse=>{
				if(response.status == STATUS_ERROR){
					errMessageArray.push({'param':'thumbnail_image','msg':response.message});
				}else{
					var imageName = (typeof response.fileName !== typeof undefined) ? response.fileName : '';
				}
				
				
				let UploadedFiles = [];
						
				UploadedFiles.push({ 'id':new ObjectId(), 'media': response.fileName });

				let UploadedThumbailFiles = [];
				UploadedThumbailFiles.push({ 'id':new ObjectId(), 'image': thumbnailImageResponse.fileName });
	
				consoleLog(UploadedFiles);
				consoleLog(UploadedThumbailFiles);
				if(errMessageArray.length > 0){
					/** Send error response **/
					return res.send({
						status	: STATUS_ERROR,
						message	: errMessageArray,
					});
				}
				/** Set options for get user slug **/
				let slugOptions = {
					title 		:	campaignName,
					table_name 	: 	TABLE_CAMPAIGN,
					slug_field 	: 	"slug"
				};

			
				getDatabaseSlug(slugOptions).then(slugResponse=>{ 
					let costPerView = (res.locals.settings['Site.campaign_cost_per_view'])	? 	res.locals.settings['Site.campaign_cost_per_view']:DEACTIVE;
				campaign.insertOne({
					name 						: 	campaignName,
					description 				: 	campaignDescription,
					interest_id 		        :	interestIdsTypeArray,
					age_type 		    		:	ageType,
					budget			            :	budget,
					duration_start_date 		: 	getUtcDate(durationStartDate),
					duration_end_date 			: 	getUtcDate(durationEndDate),
					website_url 				: 	websiteUrl,
					post_media					:	UploadedFiles,
					thumbnail_image				:	UploadedThumbailFiles,
					slug						:	(slugResponse && slugResponse.title)	?	slugResponse.title	:"",
					post_media_type				:	postMediaType	,
					campaign_type				:	campaignType,
					view_count					:	DEACTIVE,
					remaining_budget			:	budget,
					status						:   ACTIVE,
					allow_edit					:	ACTIVE,
					total_click					:	DEACTIVE,
					total_views					:	DEACTIVE,
					total_views					:	DEACTIVE,
					total_expense				:	DEACTIVE,
					total_kids_view				:	DEACTIVE,
					total_teen_view				:	DEACTIVE,
					total_adult_view			:	DEACTIVE,
					is_expired					:	DEACTIVE,
					cost_per_view				:	Number(costPerView),
					adult						:	adultCategoryIdsArray,
					teen						:	teenCategoryIdsArray,
					kid							:	kidCategoryIdsArray,
			
					created_by					:	ObjectId(SUPER_ADMIN_ID),
					modified 		            : 	getUtcDate(),
					created 		            : 	getUtcDate(),		   
				},(err,result)=>{
					if(err) return next(err);
					req.flash(STATUS_SUCCESS,res.__("admin.campaign_management.campaign_management_has_been_save_successfully"));
					res.send({
						status		: STATUS_SUCCESS,
						redirect_url: WEBSITE_ADMIN_URL+"campaigns",
						message		: res.__("admin.campaign_management.campaign_management_has_been_save_successfully"),
					});
				});
			});
			}).catch(next);
				
		}).catch(next);

		}else{


			let ageTypeOptionsKid = {age_type:"kid"};

			getRoleWiseInterest(req,res,ageTypeOptionsKid).then(responseKid=>{
			
			let ageTypeOptionsTeen = {age_type:"teen"};
			getRoleWiseInterest(req,res,ageTypeOptionsTeen).then(responseTeen=>{

			let ageTypeOptionsAdult = {age_type:"adult"};
			getRoleWiseInterest(req,res,ageTypeOptionsAdult).then(responseAdult=>{

			
					/** Render edit page **/
					req.breadcrumbs(BREADCRUMBS["admin/campaign_management/add"]);
					res.render("add",{	
						deduct_amount_value : 	deductAmountValue,
						kid_roles			:	responseKid,
						teen_roles			:	responseTeen,
						adult_roles			: 	responseAdult			
					});
		
			})
				
			})

			})




		// 	let options = {
		// 		collections : [
		// 			{
		// 				collection	: admin_roles,
		// 				columns		: ["dial_code","dial_code"],
		// 			},
		// 			{
		// 				collection 	: 	TABLE_COUNTRY,
		// 				columns 	: 	["_id","country_name"],
		// 				conditions	:	{ status :	ACTIVE }
		// 			}
		// 		]
		// 	};
		// 	getDropdownList(req,res,options).then(response=>{
		
		// 	req.breadcrumbs(BREADCRUMBS["admin/campaign_management/add"]);
		// 	res.render("add",{	
		// 		deduct_amount_value : deductAmountValue 			
		// 	});
		// });
		}	
	};//End addCampaign()
	
	
	
	/**
	 * Function for Campaign Detail
	 *
	 * @param req			As Request Data
	 * @param res 			As Response Data
	 *
	 * @return json
	 */
	let getCampaignDetails = (req,res)=>{
		return new Promise(resolve=>{
			let campaignId	=	(req.params.id)	?	req.params.id	:"";
		
			if(!campaignId || campaignId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				const campaign	= db.collection(TABLE_CAMPAIGN);

				let condition = {
					_id : ObjectId(campaignId),
					status : ACTIVE,
					is_expired		:	DEACTIVE,
				}
				
				campaign.aggregate([
					{
						$match : condition
					},
					{$lookup : {
						from 			: TABLE_CATEGORIES,
						localField 		: "interest_id",
						foreignField 	: "_id",
						as 				: "interest_details",
					}},
					{$lookup : {
						from 			: TABLE_USERS,
						localField 		: "created_by",
						foreignField 	: "_id",
						as 				: "user_details",
					}},
					{$project:{
						"_id"             		:1,
						"name"					:1,
						"description"			:1,
						"interest_id"			:1,
						"view_count"			:1,
						"budget"				:1,
						"age_type"				:1,
						"website_url"			:1,
						"duration_start_date"	:1,
						"duration_end_date"		:1,
						"created"				:1,
						"post_media_type"		:1,
						"campaign_type"			:1,
						"remaining_budget"		:1,
						"thumbnail_image"		:1,
						"post_media"			:1,	
						"kid"					:1,
						"teen"					:1,	
						"adult"					:1,
						"total_click"			:1,
						"total_views"			:1,
						"total_views"			:1,
						"total_expense"			:1,
						"total_kids_view"		:1,
						"total_teen_view"		:1,
						"total_adult_view"		:1,		
						"created_by"       		:1,
						"status"				:1,
					//	"categories_details"	:1,
						"created"				:1,
						"modified"				:1,
						"user_name"				:   { "$arrayElemAt" : ["$user_details.full_name",0] },
						"categories_details"		:   "$interest_details.name",
					}},
				]).toArray((err,result)=>{

					
						if(result){
							/** Set options for append image full path **/
							let options = {
								"file_url" 			: 	CAMPAIGN_URL,
								"file_path" 		: 	CAMPAIGN_FILE_PATH,
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
	};//End getCampaignDetails()

	
	
	/**
	 * Function for update Campaign Detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editCampaign = (req,res,next)=>{
		let deductAmountValue = res.locals.settings["Site.amount_deduct_on_ad_per_cliick"];
		if(isPost(req)){
			/** Sanitize Data **/
			req.body 						= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let id 							= 	(req.params.id)				? 	req.params.id					:	"";
			let campaignName 			    = (req.body.name) ? req.body.name : "";
			let campaignDescription			= (req.body.description) ? req.body.description : "";
			let interestIds			        = (req.body.interest_id) ? req.body.interest_id : [];
			let ageType			            = (req.body.age_type) ? req.body.age_type : [];
			let budget			            = (req.body.budget) ? parseFloat(req.body.budget) : "";
		   
			let campaignType			    = (req.body.campaign_type) ? req.body.campaign_type : "";
			let durationStartDate			= (req.body.duration_start_date) ? req.body.duration_start_date : "";
			let durationEndDate			    = (req.body.duration_end_date) ? req.body.duration_end_date : "";
			let websiteUrl			        = (req.body.website_url) ? req.body.website_url : "";
			let postMediaType			    = (req.body.post_media_type) ? req.body.post_media_type : "";
			let kidInterestIds				=	(req.body.kid_interest_id) 							? 	req.body.kid_interest_id			:[];
			let teenInterestIds				=	(req.body.teen_interest_id) 						? 	req.body.teen_interest_id			:[];
			let adultInterestIds			=	(req.body.adult_interest_id) 						? 	req.body.adult_interest_id			:[];
			

			if(typeof(interestIds) == "string"){
				consoleLog("Inside");
				interestIds = [interestIds]
			}
			consoleLog(typeof(interestIds));
			
			let interestIdsTypeArray = [];
			if(interestIds.length > 0){
				interestIds.map(listingTypeId=>{
					consoleLog(listingTypeId);
					interestIdsTypeArray.push(ObjectId(listingTypeId))
				})
			}
			
			let ageTypeArray = [];
			//set category role type
			if(typeof(kidInterestIds) == "string"){
				kidInterestIds = [kidInterestIds]
			}
			
			let kidCategoryIdsArray = [];
			if(kidInterestIds.length > 0){
				ageTypeArray.push("kid");
				kidInterestIds.map(listingTypeId=>{
					kidCategoryIdsArray.push(ObjectId(listingTypeId))
					
						interestIdsTypeArray.push(ObjectId(listingTypeId))
					
				})
			}
			
			if(typeof(teenInterestIds) == "string"){
				teenInterestIds = [teenInterestIds]
			}
			
			let teenCategoryIdsArray = [];
			if(teenInterestIds.length > 0){
				ageTypeArray.push("teen");
				teenInterestIds.map(listingTypeId=>{
					teenCategoryIdsArray.push(ObjectId(listingTypeId))
					
						interestIdsTypeArray.push(ObjectId(listingTypeId))
				
					
				})
			}
			
			
			if(typeof(adultInterestIds) == "string"){
				adultInterestIds = [adultInterestIds]
			}
			
			let adultCategoryIdsArray = [];
			if(adultInterestIds.length > 0){
				ageTypeArray.push("adult");
				adultInterestIds.map(listingTypeId=>{
					adultCategoryIdsArray.push(ObjectId(listingTypeId))
					
						interestIdsTypeArray.push(ObjectId(listingTypeId))
					
				})
			}




			let errors = [];

			// if(budget && budget <= 0){
			// 	errors.push({'param':'ad_budget','msg':res.__("admin.campaign_management.please_enter_value_greater_than_zero")});
			// }
			if(durationEndDate  < durationStartDate){
				errors.push({'param':'duration_end_date','msg':res.__("admin.campaign_management.end_date_should_be_greater_than_start_date")});
			}

			if(errors.length > 0){
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}	
			
			/** Configure banner unique conditions **/
			const campaign = db.collection(TABLE_CAMPAIGN);
			
				
				
				let errMessageArray =[];
				
					/** Set options for upload image **/ 
					let oldimage		= 	(req.body.old_image) ? req.body.old_image :"";
					let oldThumbimage		= 	(req.body.old_thumb_image) ? req.body.old_thumb_image :"";
					consoleLog(req.body);
					let image			= 	(req.files && req.files.image)	?	req.files.image	:"";
					let thumbnailImage	= 	(req.files && req.files.thumbnail_image)	?	req.files.thumbnail_image	:"";
					let options	=	{
						'image' 	:	image,
						'filePath' 	: 	CAMPAIGN_FILE_PATH,
						'oldPath' 	: 	oldimage
					};

					if(postMediaType == POST_TYPE_VIDEO)
					{
						options['allowedExtensions'] = ALLOWED_VIDEO_EXTENSIONS;
						options['allowedImageError'] = ALLOWED_VIDEO_ERROR_MESSAGE;
						options['allowedMimeTypes'] = ALLOWED_VIDEO_MIME_EXTENSIONS;
						options['allowedMimeError'] = ALLOWED_VIDEO_MIME_ERROR_MESSAGE;
					
					}


					
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
					
						let optionsFrthumbnail	=	{
							'image' 				:	thumbnailImage,
							'filePath' 				: 	CAMPAIGN_FILE_PATH,
							'oldPath' 				: 	oldThumbimage
						};
		
		
						moveUploadedFile(req, res,optionsFrthumbnail).then(thumbnailImageResponse=>{
						if(response.status == STATUS_ERROR){
							errMessageArray.push({'param':'thumbnail_image','msg':response.message});
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
						let UploadedFiles = [];
						
						UploadedFiles.push({ 'id':new ObjectId(), 'media': response.fileName });

						let UploadedThumbailFiles = [];
						UploadedThumbailFiles.push({ 'id':new ObjectId(), 'image': thumbnailImageResponse.fileName });

						var imageName =	[];
							var bannerImageName =	[];
							imageName 			= 	(response.fileName) ? UploadedFiles 	:oldimage;
							bannerImageName 	= 	(thumbnailImageResponse.fileName) ? UploadedThumbailFiles	:oldThumbimage;
						
						/** Set Update data */
						let updateData	=	{						
							name 						: 	campaignName,
							description 				: 	campaignDescription,
							interest_id 		        :	interestIdsTypeArray,
							age_type 		    		:	ageType,
						//	budget			            :	budget,
							duration_start_date 		: 	getUtcDate(durationStartDate),
							duration_end_date 			: 	getUtcDate(durationEndDate),
							website_url 				: 	websiteUrl,
							post_media					:	UploadedFiles,
							thumbnail_image				:	UploadedThumbailFiles,
							post_media_type				:	postMediaType	,
							campaign_type				:	campaignType,
							adult						:	adultCategoryIdsArray,
							teen						:	teenCategoryIdsArray,
							kid							:	kidCategoryIdsArray,
							modified	 				: 	getUtcDate(),
						};
						
						
						/** Update banner data **/
						campaign.updateOne({
							_id : ObjectId(id)
						},{$set : updateData},(updateErr,result)=>{
							if(updateErr) return next(updateErr);
							
							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.campaign_management.campaign_management_has_been_updated_successfully"));
							res.send({
								status		: STATUS_SUCCESS,
								redirect_url: WEBSITE_ADMIN_URL+"campaigns",
								message		: res.__("admin.banner.campaign_management_has_been_updated_successfully"),
							});
						});					
					}).catch(next);
				}).catch(next);
				
		}else{
			/** Get campaign details **/
			getCampaignDetails(req, res).then(response=>{
				if(response.status != STATUS_SUCCESS){
					/** Send error response **/
					req.flash(STATUS_ERROR,response.message);
					res.redirect(WEBSITE_ADMIN_URL+"campaigns");
					return;
				}				
				//consoleLog(response);
				let finalRes = (response.result) ? response.result :{};

				let ageTypeOptionsKid = {age_type:"kid"};

				getRoleWiseInterest(req,res,ageTypeOptionsKid).then(responseKid=>{
				
				let ageTypeOptionsTeen = {age_type:"teen"};
				getRoleWiseInterest(req,res,ageTypeOptionsTeen).then(responseTeen=>{
	
				let ageTypeOptionsAdult = {age_type:"adult"};
				getRoleWiseInterest(req,res,ageTypeOptionsAdult).then(responseAdult=>{

					/** Render edit page **/
					req.breadcrumbs(BREADCRUMBS["admin/campaign_management/edit"]);
					res.render("edit",{
						result : finalRes,
						deduct_amount_value : deductAmountValue ,
						kid_roles			:	responseKid,
						teen_roles			:	responseTeen,
						adult_roles			: 	responseAdult		
					});	


				});
				});
			});	
							
			}).catch(next);			
		}	
	};//End editCampaign()
	
	
	
		

	/**
	 * Function for delete Campaign
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.deleteCampaign = (req,res)=>{
		try{
			let adId		 = (req.params.id) ? req.params.id : "";
			if(adId){
				/** Delete user*/
				const campaign = db.collection(TABLE_CAMPAIGN);
				campaign.updateOne(
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
							req.flash(STATUS_SUCCESS,res.__("admin.campaign_management.ad_deleted_successfully"));
							res.redirect(WEBSITE_ADMIN_URL+"campaigns");
						}else{
							/** Send error response **/
							req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
							res.redirect(WEBSITE_ADMIN_URL+"campaigns");
						}
					}
				);
			}else{
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"campaigns");
			}
		}catch(e){
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
			res.redirect(WEBSITE_ADMIN_URL+"campaigns");
		}
	};//End deleteCampaign()
	
	
	
	
	
	/**
	 * Function for view Campaign 
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.viewDetail = (req,res)=>{
		/** Get promo code details **/
		getCampaignDetails(req, res).then(response=>{
		
			if(response.status != STATUS_SUCCESS){
				/** Send error response **/
				req.flash(STATUS_ERROR,response.message);
				res.redirect(WEBSITE_ADMIN_URL+"campaigns");
				return;
			}
			
			/** Render edit page **/
			req.breadcrumbs(BREADCRUMBS["admin/campaign_management/view"]);
			res.render("view",{
				result : (response.result[0]) ? response.result[0] :{},
			});
		});
	}

	/**
	 * Function for view Campaign report
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	 this.campaignReport = (req,res)=>{
		/** Get promo code details **/
		getCampaignDetails(req, res).then(response=>{
		
			if(response.status != STATUS_SUCCESS){
				/** Send error response **/
				req.flash(STATUS_ERROR,response.message);
				res.redirect(WEBSITE_ADMIN_URL+"campaigns");
				return;
			}
			
			/** Render edit page **/
			req.breadcrumbs(BREADCRUMBS["admin/campaign_management/view_campaign_report.html"]);
			res.render("view_campaign_report.html",{
				result : (response.result[0]) ? response.result[0] :{},
			});
		});
	}
	
	
	
	
	/**
	 * Function for update Campaign status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.updateCampaignStatus = (req,res)=>{
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
				
				//console.log(updateData);
				/** Update Campaign status*/
				const campaign = db.collection(TABLE_CAMPAIGN);
				campaign.updateOne({_id : ObjectId(adId)},{$set :updateData},(err,result)=>{
					if(!err){
						/** Send success response **/
						req.flash(STATUS_SUCCESS,res.__("admin.campaign_management.ads_status_has_been_updated_successfully"));
						res.redirect(WEBSITE_ADMIN_URL+"campaigns");
					}else{
						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"campaigns");
					}
				});
			}catch(e){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+"campaigns");
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"campaigns");
		}
	};//End updateCampaignStatus()
	
	
	
	
	
}
module.exports = new Campaigns();
