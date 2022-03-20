var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto');
const asyncParallel = require("async/parallel");
const moment = require('moment');
function PostService() {

	/** curent date get*/
	var currentDate = String(getDateMoment().date());
	const saltRounds= BCRYPT_PASSWORD_SALT_ROUNDS;
	/** curent month get*/
	var now = getUtcDate();


	/**
	* function to add a post
	*
	* param null
	* */
	this.addPost = (req, res, next, callback) => {
		return new Promise(resolve=>{
			/** Sanitize Data **/
			let finalResponse = {};
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
			let userType		=	(loginUserData.user_type) 		? 	loginUserData.user_type	:"";			
			if(userType == "" || !FRONT_USER_TYPE[userType]){
				/** Send error response **/
				finalResponse = {
					status: STATUS_ERROR_INVALID_ACCESS,
					result: {},
					message: res.__("Invalid user type.")
					
				};
				return resolve(finalResponse);	
			}
			
		
			
			/** Set options for upload image **/
			
			let fileName		= 	(req.files && req.files.post_media)			?	req.files.post_media		:"";
			let thumbnailImage	= 	(req.files && req.files.thumbnail_image)	?	req.files.thumbnail_image	:"";
			
		
			/** Configure user unique conditions **/
			const posts = db.collection(TABLE_POSTS);
		
				let errMessageArray = [];

				
				let options	=	{
					'image' 				:	fileName,
					'filePath' 				: 	POSTS_FILE_PATH,
				};

				let postType					=	(req.body.post_type) 					? 	req.body.post_type				:"";
				
				if(postType == POST_TYPE_VIDEO)
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
						'filePath' 				: 	POSTS_FILE_PATH,
					};
	

					/** Upload user image **/
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
					if(postType == POST_TYPE_VIDEO)
					{
						UploadedFiles.push({ 'id':new ObjectId(), 'video': response.fileName });
					
					}else{

						UploadedFiles.push({ 'id':new ObjectId(), 'image': response.fileName });
					}

					

					

					let postTitle					=	(req.body.title)						? 	req.body.title					:"";			
					let postDescription				=	(req.body.description) 					? 	req.body.description			:"";		
					let postTags					=	(req.body.post_tags) 					? 	req.body.post_tags				:"";	  
					let privacy						=	(req.body.privacy) 						? 	req.body.privacy				:"";
					let ageType						=	(req.body.age_type) 					? 	req.body.age_type				:[];
					let interestIds					=	(req.body.interest_id) 					? 	req.body.interest_id			:[];
					let postViewCount				=	(req.body.post_view_count) 				? 	req.body.post_view_count		:DEACTIVE;
					let postCommentCount			=	(req.body.post_comment_count) 			? 	req.body.post_comment_count		:DEACTIVE;
					let postLikesCount				=	(req.body.post_likes_count) 			? 	req.body.post_likes_count		:DEACTIVE;	
					let lastHourViews				=	(req.body.last_hour_views) 				? 	req.body.last_hour_views		:DEACTIVE;								
					let duration					=	(req.body.duration) 				? 	req.body.duration		:DEACTIVE;								
					let userId						=	(loginUserData._id) 					? 	ObjectId(loginUserData._id)		:ObjectId();	
					
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
					
					
					var postTagsName = postTags.split(',');
					let postTagArray = [];
					
					if(postTagsName.length > 0){
						postTagsName.map(record=>{
							record = record.trim();
							postTagArray.push("#"+record)
						})
					}
					let saveWithHashTag = postTagArray.toString();
					
						/** Set update data **/	
						let insertData = {
							title	 			: 	postTitle,
							description	 		: 	postDescription,
							post_tags	 		: 	postTags,
							post_hashtags 		: 	saveWithHashTag,
							post_type			:	postType,
							privacy				:	privacy,
							age_type			:	ageTypeArray,
							interest_ids		:	interestIdsTypeArray,
							adult				:	adultCategoryIdsArray,
							teen				:	teenCategoryIdsArray,
							kid					:	kidCategoryIdsArray,
							post_media			:	UploadedFiles,
							thumbnail_image		:	UploadedThumbailFiles,
							user_id				:	userId,
							post_view_count 	: 	postViewCount,	
							post_comment_count	:	postCommentCount,
							post_likes_count	:	postLikesCount,
							last_hour_views		:   lastHourViews,
							duration			:   duration,
							is_deleted			:  	DEACTIVE,
							status				:	ACTIVE,
							send_follower_pn	:	DEACTIVE,
							created				: 	getUtcDate(),					
							modified 			: 	getUtcDate()						
						};	
					
						consoleLog(insertData);
										
						/** Set options for get user slug **/
						let slugOptions = {
							title 		:	postTitle,
							table_name 	: 	TABLE_POSTS,
							slug_field 	: 	"slug"
						};
								
						getDatabaseSlug(slugOptions).then(slugResponse=>{
									
								
							insertData['slug'] = 	(slugResponse && slugResponse.title)	?	slugResponse.title	:"";
							
							consoleLog(insertData);
						
							
							posts.insertOne(insertData,
							(err, result) => {
							
								if (err) {
									finalResponse = {
										status: STATUS_ERROR_INVALID_ACCESS,
										result: {},
										message: res.__("front.system.something_going_wrong_please_try_again")
										
									};
									return resolve(finalResponse);
								}
								var lastInsertId	= result.insertedId;
								
								
								
								/***Notification Start
								let notificationMessageParams	= [fullName];
								let notificationOptions 		= {
									notification_data : {
										notification_type	: NOTIFICATION_NEW_POST_BY_USER,
										message_params		: notificationMessageParams,
										parent_table_id		: req.params.id,
										user_id				: req.params.id,
										user_role_id		: SUPER_ADMIN_ROLE_ID,
										user_ids			: [req.params.id],
										role_id				: SUPER_ADMIN_ROLE_ID,
										extra_parameters	: {
											user_id	: ObjectId(req.params.id),
										}
									}
								};
								insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
									if(notificationResponse){
										let options = {
											user_id : req.params.id,
											pn_body : notificationResponse.notificationMessage,
											pn_title : notificationResponse.notificationTitle,
											device_type : 'android',
											device_token : 'android',
										};
										pushNotification(res,req,options).then(response=>{});
									}	
								});

								/** Configure user unique conditions **/
								const postsTagsCollection = db.collection(TABLE_POSTS_TAGS);


								let postTagsArray = postTags.split(","); 


								//console.log("postTagsArray");
								//console.log(postTagsArray);
								for (const tag of postTagsArray) {  

									let updateData={
										modified 			: 	getUtcDate()						
									};	
									
									let userTag 			= "#"+tag;	
									let insertData={
										tag					: userTag,
										//post_count			:  Number(1),
										is_deleted			:  	DEACTIVE,
										status				:	ACTIVE,
										created				: 	getUtcDate()						
									};			
										
									consoleLog(insertData);
									let incStat = {"post_count":1}
									postsTagsCollection.findOneAndUpdate({
										 tag: { $regex: "^" + userTag + "$", $options: "i" } ,
										
									},{
										$inc: incStat,
										$set		: updateData,
										$setOnInsert: insertData
									},{upsert: true,new:true},
									(err, result) => {

												
									});	


								  }
								let optionObj = {
									user_id 			:	ObjectId(userId),
									counter_val 		:	ACTIVE
								}
								updateUserPostCount(req,res,optionObj).then(updateResponse=>{})
								consoleLog("value of lastInsertId is "+lastInsertId);
								/** Send success response **/
								let userTypeTitle	=	(FRONT_USER_TYPE[userType])	?	FRONT_USER_TYPE[userType] 	:"";
								finalResponse = {
									status: STATUS_SUCCESS,
									result: {
										userTypeTitle 	: 	userTypeTitle,
										lastInsertId	:	lastInsertId,
									},
									message: STATUS_SUCCESS,
								};
								return resolve(finalResponse);
								
							});
						});		
					});
			});
			
		}).catch(next);
	};
	
	
	
	
	/**
	* function for edit  Post
	*
	* param null
	* */
	this.editPost = (req, res, next, callback) => {
	
		return new Promise(resolve=>{
			/** Sanitize Data **/
			let finalResponse 	= {};
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
			let postSlug 		= (req.body.post_slug) ? req.body.post_slug : "";
			let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			let userType		=	(loginUserData.user_type) 		? 	loginUserData.user_type	:"";			
			if(userType == "" || !FRONT_USER_TYPE[userType]){
				/** Send error response **/
				finalResponse = {
					status: STATUS_ERROR_INVALID_ACCESS,
					result: {},
					message: res.__("Invalid user type.")
					
				};
				return resolve(finalResponse);	
			}

			var match = {
				slug: postSlug,	
				user_id : ObjectId(userId),
			}
			

				/** Get post details **/
				const posts = db.collection(TABLE_POSTS);
		
				posts.findOne(match,{},(err,result)=>{

					if(err){
						/** Send error response **/
						let response = {
							status	:	STATUS_ERROR,
							options	: 	options,
							message	: 	res.__("front.system.post_not_found")
						};
						return resolve(response);
					}
				

					consoleLog("Final Result is");

					consoleLog(result);
					consoleLog(result.post_media);




		
			/** Set options for upload image **/
			
			let fileName		= 	(req.files && req.files.post_media)			?	req.files.post_media		:"";
			let thumbnailImage	= 	(req.files && req.files.thumbnail_image)	?	req.files.thumbnail_image	:"";
			
		
			/** Configure user unique conditions **/
		
				let errMessageArray = [];

				
				let options	=	{
					'image' 				:	fileName,
					'filePath' 				: 	POSTS_FILE_PATH,
				};

				let postType					=	(req.body.post_type) 					? 	req.body.post_type				:"";
				
				if(postType == POST_TYPE_VIDEO)
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
						'filePath' 				: 	POSTS_FILE_PATH,
					};
	

					/** Upload user image **/
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

					let UploadedFiles = [];
					var imageName =	[];
					var bannerImageName =	[];
					if(postType == POST_TYPE_VIDEO)
					{
						UploadedFiles.push({ 'id':new ObjectId(), 'video': response.fileName })
						UploadedThumbailFiles.push({ 'id':new ObjectId(), 'image': thumbnailImageResponse.fileName })

						 imageName 			= 	(response.fileName) ? UploadedFiles 	:result.post_media;
						 bannerImageName 	= 	(thumbnailImageResponse.fileName) ? UploadedThumbailFiles	:result.thumbnail_image;


						
					
					}else{

						UploadedFiles.push({ 'id':new ObjectId(), 'image': response.fileName }) 
						UploadedThumbailFiles.push({ 'id':new ObjectId(), 'image': thumbnailImageResponse.fileName })

						 imageName 			= 	(response.fileName) ? UploadedFiles	:result.post_media;
						 bannerImageName 	= 	(thumbnailImageResponse.fileName) ? UploadedThumbailFiles	:result.thumbnail_image;


						
					}

					
				

					

					let postTitle					=	(req.body.title)						? 	req.body.title					:"";			
					let postDescription				=	(req.body.description) 					? 	req.body.description			:"";		
					let postTags					=	(req.body.post_tags) 					? 	req.body.post_tags				:"";	  
					let privacy						=	(req.body.privacy) 						? 	req.body.privacy				:"";
					let ageType						=	(req.body.age_type) 					? 	req.body.age_type				:[];
					let interestIds					=	(req.body.interest_id) 					? 	req.body.interest_id			:[];
					let postViewCount				=	(req.body.post_view_count) 				? 	req.body.post_view_count		:DEACTIVE;
					let postCommentCount			=	(req.body.post_comment_count) 			? 	req.body.post_comment_count		:DEACTIVE;
					let postLikesCount				=	(req.body.post_likes_count) 			? 	req.body.post_likes_count		:DEACTIVE;	
					let lastHourViews				=	(req.body.last_hour_views) 				? 	req.body.last_hour_views		:DEACTIVE;								
					let userId						=	(loginUserData._id) 					? 	ObjectId(loginUserData._id)		:ObjectId();	

					if(typeof(interestIds) == "string"){
						interestIds = [interestIds]
					}
					
					let interestIdsTypeArray = [];
					if(interestIds.length > 0){
						interestIds.map(listingTypeId=>{
							interestIdsTypeArray.push(ObjectId(listingTypeId))
						})
					}


						
						/** Set update data **/	
						let updateData = {
							title	 			: 	postTitle,
							description	 		: 	postDescription,
							post_tags	 		: 	postTags,
							post_hashtags 		: 	'',
							post_type			:	postType,
							privacy				:	privacy,
							age_type			:	ageType,
							interest_ids		:	interestIdsTypeArray,
							post_media			:	imageName,
							thumbnail_image		:	bannerImageName,
							user_id				:	userId,
							post_view_count 	: 	postViewCount,	
							post_comment_count	:	postCommentCount,
							post_likes_count	:	postLikesCount,
							last_hour_views		:   lastHourViews,
							is_deleted			:  	DEACTIVE,
							status				:	ACTIVE,
							created				: 	getUtcDate(),					
							modified 			: 	getUtcDate()						
						};	
					
					
							
						consoleLog("Update data is -------");
							consoleLog(updateData);

							consoleLog("IMAGES  data is -------");
							consoleLog(imageName);

							consoleLog(bannerImageName);

						


							posts.updateOne(match,
							{$set	: updateData	},(updateErr,updateResult)=>{

							
							
						
								if (updateErr) {
									finalResponse = {
										status: STATUS_ERROR_INVALID_ACCESS,
										result: {},
										message: res.__("front.system.something_going_wrong_please_try_again")
										
									};
									return resolve(finalResponse);
								}
								var lastInsertId	= result.insertedId;
								
								// if(result.lastErrorObject.updatedExisting){
								// 	lastInsertId = (result.value._id) ? result.value._id : "";
								// }else{
								// 	lastInsertId = (result.lastErrorObject.upserted) ?  result.lastErrorObject.upserted : "";	
								// }

								
								/***Notification Start
								let notificationMessageParams	= [fullName];
								let notificationOptions 		= {
									notification_data : {
										notification_type	: NOTIFICATION_NEW_POST_BY_USER,
										message_params		: notificationMessageParams,
										parent_table_id		: req.params.id,
										user_id				: req.params.id,
										user_role_id		: SUPER_ADMIN_ROLE_ID,
										user_ids			: [req.params.id],
										role_id				: SUPER_ADMIN_ROLE_ID,
										extra_parameters	: {
											user_id	: ObjectId(req.params.id),
										}
									}
								};
								insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
									if(notificationResponse){
										let options = {
											user_id : req.params.id,
											pn_body : notificationResponse.notificationMessage,
											pn_title : notificationResponse.notificationTitle,
											device_type : 'android',
											device_token : 'android',
										};
										pushNotification(res,req,options).then(response=>{});
									}	
								});








								/** Configure user unique conditions **/
								const postsTagsCollection = db.collection(TABLE_POSTS_TAGS);


								let postTagsArray = postTags.split(","); 


								consoleLog(postTagsArray);
								for (const tag of postTagsArray) {  

									let updateData={
										modified 			: 	getUtcDate()						
									};	
									
									let userTag 			= "#"+tag;	
									let insertData={
										tag					: userTag,
										post_count			:  Number(1),
										is_deleted			:  	DEACTIVE,
										status				:	ACTIVE,
										created				: 	getUtcDate()						
									};			
										
									consoleLog(insertData);
									
									postsTagsCollection.findOneAndUpdate({
										 tag: { $regex: "^" + userTag + "$", $options: "i" } ,
										
									},{
										$set		: updateData,
										$setOnInsert: insertData
									},{upsert: true,new:true},
									(err, result) => {

												consoleLog("Check Post");
												consoleLog(result);
												consoleLog(err);
												consoleLog(result);
									});	


								  }
								

								  	consoleLog("value of lastInsertId is "+lastInsertId);
								/** Send success response **/
								let userTypeTitle	=	(FRONT_USER_TYPE[userType])	?	FRONT_USER_TYPE[userType] 	:"";
								finalResponse = {
									status: STATUS_SUCCESS,
									result: {
										userTypeTitle 	: 	userTypeTitle,
										lastInsertId	:	lastInsertId,
									},
									message: STATUS_SUCCESS,
								};
								return resolve(finalResponse);
								
							});
							
					});
			});
			









					



				});


		}).catch(next);

	};

	

	

	

	
	
	
	
	
	
}
module.exports = new PostService();
