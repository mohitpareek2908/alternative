const fs		= require('fs');
function Campaign() {
	
	Campaign = this;
	
	 /** 
	  * Function for adding a Campaign
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
     this.addCampaign = (req,res,next,callback)=>{
		let slug 					 = (req.body.slug) ? req.body.slug : "";
		let loginUserData 	         =	(req.user_data) 		?	req.user_data 			:	"";
        let userId					 = (loginUserData._id)	?	loginUserData._id		:	"";	
		///let checkData = "06/11/2021";
		//console.log("check data "+getUtcDate(checkData));
		//return false;
		let finalResponse = {};
	
		if (slug == '' || userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again1")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const campaign            = db.collection(TABLE_CAMPAIGN);
		
        let campaignName 			    = (req.body.name) ? req.body.name : "";
        let campaignDescription			= (req.body.description) ? req.body.description : "";
        let interestIds			        = (req.body.interest_id) ? req.body.interest_id : [];
        let ageType			            = (req.body.age_type) ? req.body.age_type : "";
        let budget			            = (req.body.budget) ? parseFloat(req.body.budget) : "";
        let postMediaType			    = (req.body.post_media_type) ? req.body.post_media_type : "";
		let campaignType			    = (req.body.campaign_type) ? req.body.campaign_type : "";
		let durationStartDate			= (req.body.duration_start_date) ? req.body.duration_start_date : "";
		let durationEndDate			    = (req.body.duration_end_date) ? req.body.duration_end_date : "";
        let websiteUrl			        = (req.body.website_url) ? req.body.website_url : "";
		
		let kidInterestIds					=	(req.body.kid) 							? 	req.body.kid			:[];
		let teenInterestIds					=	(req.body.teen) 						? 	req.body.teen			:[];
		let adultInterestIds				=	(req.body.adult) 						? 	req.body.adult			:[];
					
		if(typeof(interestIds) == "string"){
			interestIds = [interestIds]
		}
		
		let interestIdsTypeArray = [];
		if(interestIds.length > 0){
			interestIds.map(listingTypeId=>{
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
			})
		}
					
		
		let errMessageArray = [];
		
	

			/** Set options for upload image **/	
			let fileName		= 	(req.files && req.files.post_media)			?	req.files.post_media		:"";
			let thumbnailImage	= 	(req.files && req.files.thumbnail_image)	?	req.files.thumbnail_image	:"";

			let options	=	{
				'image' 				:	fileName,
				'filePath' 				: 	CAMPAIGN_FILE_PATH,
			};

			if(postMediaType == POST_TYPE_VIDEO)
			{
				options['allowedExtensions'] = ALLOWED_VIDEO_EXTENSIONS;
				options['allowedImageError'] = ALLOWED_VIDEO_ERROR_MESSAGE;
				options['allowedMimeTypes'] = ALLOWED_VIDEO_MIME_EXTENSIONS;
				options['allowedMimeError'] = ALLOWED_VIDEO_MIME_ERROR_MESSAGE;
			
			}



				/** Upload user image **/
				moveUploadedFile(req, res,options).then(response=>{
					if(response.status == STATUS_ERROR){
						/** Send error response **/
						errMessageArray.push({ 'param': 'post_media', 'msg': response.message });
						if(errMessageArray.length > 0){
							finalResponse = {
								status: STATUS_ERROR_FORM_VALIDATION,
								errors: errMessageArray,
								message: "Errors",
							};
							return returnApiResult(req,res,finalResponse);
						}
					}

					
					let optionsFrthumbnail	=	{
						'image' 				:	thumbnailImage,
						'filePath' 				: 	CAMPAIGN_FILE_PATH,
					};


					moveUploadedFile(req, res,optionsFrthumbnail).then(thumbnailImageResponse=>{
						if(response.status == STATUS_ERROR){
							/** Send error response **/
							errMessageArray.push({ 'param': 'thumbnail_image', 'msg': response.message });
							if(errMessageArray.length > 0){
								finalResponse = {
									status: STATUS_ERROR_FORM_VALIDATION,
									errors: errMessageArray,
									message: "Errors",
								};
								return returnApiResult(req,res,finalResponse);
							}
						}
						let UploadedThumbailFiles = [];
	
						if(thumbnailImageResponse.fileName){
							
							UploadedThumbailFiles.push({ 'id':new ObjectId(), 'image': thumbnailImageResponse.fileName });
	
						}
							
	
						let UploadedFiles = [];
						
							UploadedFiles.push({ 'id':new ObjectId(), 'media': response.fileName });
		
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
									age_type 		    		:	ageTypeArray,
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
							
									created_by					:	ObjectId(userId),
									modified 		            : 	getUtcDate(),
									created 		            : 	getUtcDate(),
								},(insertErr,insertSuccess)=>{
									
									finalResponse = {
										'data': {
											status: STATUS_SUCCESS,
											result: {
												
											},
											message: res.__("users.user_campaign_added_successfully_message")
										}
									};
									return returnApiResult(req,res,finalResponse);
									
									
								})
							});	

				});
				
				});
		
	}


	/** 
	  * Function for adding a post as campaign
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
     this.addPostAsCampaign = (req,res,next,callback)=>{
		let async					=	require('async');
		let slug 					 = (req.body.slug) ? req.body.slug : "";
		let loginUserData 	         =	(req.user_data) 		?	req.user_data 			:	"";
        let userId					 = (loginUserData._id)	?	loginUserData._id		:	"";	
		let postSlug			        = (req.body.post_slug) ? req.body.post_slug : "";
       
		let finalResponse = {};
	
		if (slug == '' || userId == ''|| postSlug == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again1")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const campaign            = db.collection(TABLE_CAMPAIGN);
		
        let campaignName 			    = (req.body.name) ? req.body.name : "";
        let campaignDescription			= (req.body.description) ? req.body.description : "";
        let interestIds			        = (req.body.interest_id) ? req.body.interest_id : [];
        let ageType			            = (req.body.age_type) ? req.body.age_type : "";
        let budget			            = (req.body.budget) ? parseFloat(req.body.budget) : "";
       
		let campaignType			    = (req.body.campaign_type) ? req.body.campaign_type : "";
		let durationStartDate			= (req.body.duration_start_date) ? req.body.duration_start_date : "";
		let durationEndDate			    = (req.body.duration_end_date) ? req.body.duration_end_date : "";
        let websiteUrl			        = (req.body.website_url) ? req.body.website_url : "";
		


		if(typeof(interestIds) == "string"){
			interestIds = [interestIds]
		}
		
		let interestIdsTypeArray = [];
		if(interestIds.length > 0){
			interestIds.map(listingTypeId=>{
				interestIdsTypeArray.push(ObjectId(listingTypeId))
			})
		}
		
		let errMessageArray = [];
	
		getPostDataBySlug(req, res, postSlug).then(postResponse => {

			if (postResponse.status == STATUS_ERROR) {
				finalResponse = {
				   'data': {
					   status: STATUS_ERROR,
					   message: res.__("admin.system.something_going_wrong_please_try_again")
				   }
			   };
			   return returnApiResult(req,res,finalResponse);
		   }

		   let postMedia					    =	(postResponse.result.post_media)				? 	postResponse.result.post_media			:"";
		   let thumbnailImage					=	(postResponse.result.thumbnail_image)			? 	postResponse.result.thumbnail_image			:"";
		   let postMediaType			   		= 	(postResponse.result.post_type)					? 	postResponse.result.post_type			:"";
		  
		   let UploadedFiles 					= 	[];
		   let folderName						="";
		   let filename							="";
		   let thumbnailImageName				="";

		   console.log("First here ");
		  
		   async.waterfall([
			   /*  Create Folder */
		 (callback)=>{

				console.log("inside ceate folder  here ");
				postMedia = postMedia.map(function(obj) {

					if(postMediaType == POST_TYPE_VIDEO)
					{
						UploadedFiles.push({ 'id':new ObjectId(), 'media': obj.video });
						let tempName  = obj.video.split('/');
						folderName	 = tempName[0];
						filename =  obj.video;
					}else{
		
						UploadedFiles.push({ 'id':new ObjectId(), 'media': obj.image });
						let tempName  = obj.image.split('/');
						folderName	 = tempName[0];
						filename =  obj.image;
					}
		
				});
				   
				let fullPath=  CAMPAIGN_FILE_PATH+"/"+folderName;
				
				if(!fs.existsSync(fullPath)){
					
					fs.mkdirSync(fullPath);
					
				}
		
			
			callback(null, filename);
			
			},
			 /*  Copy Media FIles  */
			 (filename,callback)=>{

				console.log("media_file_copy ")+ filename;
			
				fs.copyFile(POSTS_FILE_PATH+"/"+filename, CAMPAIGN_FILE_PATH+"/"+filename, (err) => {

					if (err) throw err;
				});	
				
				callback(null, filename);
				
			},
			 /*  Copy Thumbanil FIles  */
			(filename,callback)=>{

				console.log("thumbnail_file_copy ")+ filename;
				if(postMediaType == POST_TYPE_VIDEO)
				{
					 thumbnailImageName				= thumbnailImage[0].image;

					fs.copyFile(POSTS_FILE_PATH+"/"+thumbnailImageName, CAMPAIGN_FILE_PATH+"/"+thumbnailImageName, (err) => {
						if (err) throw err;
					});	

				}
				
				callback(null, filename);
			
			},
			 /*  make post as campaign */
			(filename,callback)=>{
			
				console.log("thumbnail_file_copy ")+ filename;
				let UploadedThumbailFiles = [];
		
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
							thumbnail_image				:	thumbnailImage,
							slug						:	(slugResponse && slugResponse.title)	?	slugResponse.title	:"",
							post_slug					:	postSlug,
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
							created_by					:	ObjectId(userId),
							modified 		            : 	getUtcDate(),
							created 		            : 	getUtcDate(),
						},(insertErr,insertSuccess)=>{
							
							finalResponse = {
								'data': {
									status: STATUS_SUCCESS,
									result: {
										
									},
									message: res.__("users.user_campaign_added_successfully_message")
								}
							};
							
							callback(null, finalResponse);
							
						})
					});

			},

		],function (err, result){
			console.log("last time ");
console.log(result);
			return returnApiResult(req,res,result);

		});




		 //  console.log(thumbnailImage[0].image);
		   //return false;
	
	
	//	fs.copyFile(POSTS_FILE_PATH+"/"+filename, CAMPAIGN_FILE_PATH+"/"+filename, (err) => {
	//		if (err) throw err;

			
	//		fs.copyFile(POSTS_FILE_PATH+"/"+thumbnailImageName, CAMPAIGN_FILE_PATH+"/"+thumbnailImageName, (err) => {
	//			if (err) throw err;


		

						
						});	
		//			});	
		//		});
				
				
		
	}




	 /** 
	  * Function for editing a Campaign
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
	  this.editCampaign = (req,res,next,callback)=>{
		let slug 					 = (req.body.slug) ? req.body.slug : "";
		let campaignSlug 			 = (req.body.campaign_slug) ? req.body.campaign_slug : "";
		let loginUserData 	         =	(req.user_data) 		?	req.user_data 			:	"";
        let userId					 = (loginUserData._id)	?	loginUserData._id		:	"";	
       
		let finalResponse = {};
	
		if (slug == '' || userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again1")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const campaign            		= db.collection(TABLE_CAMPAIGN);
		
        let campaignName 			    = (req.body.name) ? req.body.name : "";
        let campaignDescription			= (req.body.description) ? req.body.description : "";
        let interestIds			        = (req.body.interest_id) ? req.body.interest_id : [];
        let ageType			            = (req.body.age_type) ? req.body.age_type : "";
        let budget			            = (req.body.budget) ? parseFloat(req.body.budget) : "";
		let postMediaType			    = (req.body.post_media_type) ? req.body.post_media_type : "";
		let campaignType			    = (req.body.campaign_type) ? req.body.campaign_type : "";
		let durationStartDate			= (req.body.duration_start_date) ? req.body.duration_start_date : "";
		let durationEndDate			    = (req.body.duration_end_date) ? req.body.duration_end_date : "";
        let websiteUrl			        = (req.body.website_url) ? req.body.website_url : "";

		if(typeof(interestIds) == "string"){
			interestIds = [interestIds]
		}
		
		let interestIdsTypeArray = [];
		if(interestIds.length > 0){
			interestIds.map(listingTypeId=>{
				interestIdsTypeArray.push(ObjectId(listingTypeId))
			})
		}
		
	
		
		campaign.findOne(
			{	
				"slug": campaignSlug,
				"created_by":ObjectId(userId),
				duration_start_date : { $gt : getUtcDate()},
				
			},{},(err,campaignResult)=>{
				
				if (campaignResult.length == 0) {
                
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: {},
							message: res.__("front.campaign.user_cannot_edit_campaign_now")
						}
					};
					return returnApiResult(req,res,finalResponse);
				}

				if (campaignResult.allow_edit == DEACTIVE) {
                
					finalResponse = {
						'data': {
							status: STATUS_ERROR,
							errors: {},
							message: res.__("front.campaign.user_cannot_edit_campaign_now")
						}
					};
					return returnApiResult(req,res,finalResponse);
				}
				
			let campaignId = 	campaignResult._id ? campaignResult._id  : "";
			let errMessageArray = [];


			/** Set options for upload image **/	
			let fileName		= 	(req.files && req.files.post_media)			?	req.files.post_media		:"";
			let thumbnailImage	= 	(req.files && req.files.thumbnail_image)	?	req.files.thumbnail_image	:"";

			let options	=	{
				'image' 				:	fileName,
				'filePath' 				: 	CAMPAIGN_FILE_PATH,
			};



				/** Upload user image **/
				moveUploadedFile(req, res,options).then(response=>{
					if(response.status == STATUS_ERROR){
						/** Send error response **/
						errMessageArray.push({ 'param': 'post_file', 'msg': response.message });
						if(errMessageArray.length > 0){
							finalResponse = {
								status: STATUS_ERROR_FORM_VALIDATION,
								errors: errMessageArray,
								message: "Errors",
							};
							return resolve(finalResponse);
						}
					}

					
					let optionsFrthumbnail	=	{
						'image' 				:	thumbnailImage,
						'filePath' 				: 	CAMPAIGN_FILE_PATH,
					};


					moveUploadedFile(req, res,optionsFrthumbnail).then(thumbnailImageResponse=>{
						if(response.status == STATUS_ERROR){
							/** Send error response **/
							errMessageArray.push({ 'param': 'post_file', 'msg': response.message });
							if(errMessageArray.length > 0){
								finalResponse = {
									status: STATUS_ERROR_FORM_VALIDATION,
									errors: errMessageArray,
									message: "Errors",
								};
								return resolve(finalResponse);
							}
						}
						let UploadedThumbailFiles = [];
	
						if(thumbnailImageResponse.fileName){
							
							UploadedThumbailFiles.push({ 'id':new ObjectId(), 'image': thumbnailImageResponse.fileName });
	
						}
							
	
						let UploadedFiles = [];
						
							UploadedFiles.push({ 'id':new ObjectId(), 'media': response.fileName });

							var imageName =	[];
							var bannerImageName =	[];
							imageName 			= 	(response.fileName) ? UploadedFiles 	:campaignResult.post_media;
							bannerImageName 	= 	(thumbnailImageResponse.fileName) ? UploadedThumbailFiles	:campaignResult.thumbnail_image;

		
							campaign.updateOne({_id: ObjectId(campaignId)},{$set:{
								
								name 						: 	campaignName,
								description 				: 	campaignDescription,
								interest_id 		        :	interestIdsTypeArray,
								age_type 		    		:	ageType,
								budget			            :	budget,
								duration_start_date 		: 	getUtcDate(durationStartDate),
								duration_end_date 			: 	getUtcDate(durationEndDate),
								website_url 				: 	websiteUrl,
								post_media					:	imageName,
								thumbnail_image				:	bannerImageName,
								post_media_type				:	postMediaType	,
								campaign_type				:	campaignType,
								status						:   ACTIVE,
								created_by					:	ObjectId(userId),
								modified 		            : 	getUtcDate(),
								
							
							
							}},(err,result)=>{
						
									 /**For check err */
									 if(err){
										finalResponse = {
											'data': {
												status: STATUS_ERROR,
												message: res.__("front.system.something_going_wrong_please_try_again")
							
											}
										};
										return returnApiResult(req,res,finalResponse);
									}
									/**Send success response */
									finalResponse = {
										'data': {
											status: STATUS_SUCCESS,
											message: res.__("users.user_campaign_updated_successfully_message")
										}
									};
									return returnApiResult(req,res,finalResponse);
									
									
								})

				});
				
				});

			})
		
	}
	
	
	 /** 
	 * Function for get Campaign list
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
    this.campaignList = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
        let searchStatus			    =	(req.body.search_status)		?	req.body.search_status		:	"";		
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const campaign            = db.collection(TABLE_CAMPAIGN);
		let	page 				  =  (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit				  =  API_DEFAULT_LIMIT;
		let skip				  =	(limit * page) - limit;
		limit					  =	limit;

		let condition = {
			created_by : ObjectId(userId),
			status : ACTIVE,
		}
		if(searchStatus == CAMPAIGN_EXPIRE){
			condition['is_expired'] = ACTIVE
		}else if(searchStatus == CAMPAIGN_RUNNING)
		{
			condition['is_expired'] = DEACTIVE
		}
	
			
		const asyncParallel			= require('async/parallel');
		asyncParallel({
			request_list : (callback)=>{
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
					{
						$project : {
							_id 						: 1,
							name 						: 1,
							description 				: 1,
							interest_id					: 1,
							age_type 					: 1,
							budget 						: 1,
							duration_start_date 		: 1,
							duration_end_date 			: 1,
							website_url					: 1,
							created 					: 1,
							post_media					: 1,
							thumbnail_image				: 1,
							status						: 1,
							slug						: 1,
							is_expired					: 1,
							interest_name				:"$interest_details.name",
							user_name					:	{$arrayElemAt : ["$user_details.full_name",0]},
							user_profile_image			:	{$arrayElemAt : ["$user_details.profile_image",0]},
						
							created_date	: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
							
						}
					},
					
				]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
					

					
					callback(err, result);
				})
			},
			total_count : (callback)=>{
				campaign.countDocuments(condition,(err,countResult)=>{
					callback(err, countResult);
				});
			},

		},(err, response)=>{
			var totalRecord	= (response['total_count']) ? response['total_count'] : 0;
			
			finalResponse = {
				'data': {
					status				: STATUS_SUCCESS,
					campaign_list		: (response['request_list']) ? response['request_list'] : [],
					recordsTotal		:	totalRecord,
					limit				: limit,
					page				: page,
					total_page			: Math.ceil(totalRecord/limit),
					campaign_media_url	: CAMPAIGN_URL,
					user_image_url		: USERS_URL,
				}
			}
			return returnApiResult(req,res,finalResponse);
		});
	}
	
	

	 /** 
	 * Function for get Campaign Report
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 * @return json
	 **/
	  this.campaignReport = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
		let campaignSlug 		=  (req.body.campaign_slug) ? req.body.campaign_slug : "";
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const campaign            = db.collection(TABLE_CAMPAIGN);
		let	page 				  =  (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit				  =  API_DEFAULT_LIMIT;
		let skip				  =	(limit * page) - limit;
		limit					  =	limit;
		

		let condition = {
			created_by : ObjectId(userId),
			slug	   : campaignSlug,
			status : ACTIVE,
		}
		
	
			
		const asyncParallel			= require('async/parallel');
		asyncParallel({
			request_list : (callback)=>{
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
					{
						$project : {
							_id 						: 1,
							name 						: 1,
							description 				: 1,
							//interest_id					: 1,
							//age_type 					: 1,
							budget 						: 1,
							duration_start_date 		: 1,
							duration_end_date 			: 1,
							website_url					: 1,
							created 					: 1,
							//post_media				: 1,
							//thumbnail_image			: 1,
							status						: 1,
							total_click					: 1,
							total_views					: 1,
							total_views					: 1,
							total_expense				: 1,
							cost_per_view				: 1,
							total_kids_view				: 1,
							total_teen_view				: 1,
							total_adult_view			: 1,
							remaining_budget			: 1,
							is_expired			: 1,
							//interest_name				: "$interest_details.name",
						
							created_date	: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
							
						}
					},
					
				]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
					

					
					callback(err, result);
				})
			},
			total_count : (callback)=>{
				campaign.countDocuments(condition,(err,countResult)=>{
					callback(err, countResult);
				});
			},
		
		},(err, response)=>{
			var totalRecord	= (response['total_count']) ? response['total_count'] : 0;
			let campaignDetail = (response['request_list']) ? response['request_list'] : [];
			finalResponse = {
				'data': {
					status			: STATUS_SUCCESS,
					campaign_list		: (campaignDetail) ? campaignDetail[0] : "",
					
					campaign_media_url	: CAMPAIGN_URL,
				}
			}
			return returnApiResult(req,res,finalResponse);
		});
	}
	
	
	this.clickOnCampaign = (req,res,next,callback)=>{
		let loginUserData 	    =	(req.user_data) 		?	req.user_data 			:	"";
        let userId			    =	(loginUserData._id)		?	loginUserData._id		:	"";		
        let userType			=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";		
		let campaignId 			=  (req.body.campaign_id) ? req.body.campaign_id : "";
		let finalResponse = {};
		if (userId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {
						
					},
					 message: res.__("front.system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const campaignClickLogs            = db.collection(TABLE_CAMPAIGN_CLICK_LOGS);
		const campaign            = db.collection(TABLE_CAMPAIGN);
		let insertData = {
			user_id 	:	ObjectId(userId),
			campaign_id :	ObjectId(campaignId),
			user_type 	:	userType,
			created 	:	getUtcDate(),
			modified 	:	getUtcDate(),
		}
		campaignClickLogs.insertOne(insertData,(insertErr,insertResult)=>{
			let incStat				= {"total_click":1};
			campaign.updateOne({
				_id: ObjectId(campaignId)
			},{ $inc: incStat },(err, result)=>{
				
				finalResponse = {
					'data': {
						status: STATUS_SUCCESS,
					}
				};
				return returnApiResult(req,res,finalResponse);
			
			})
		
		})
	}
	
	





}
module.exports = new Campaign();