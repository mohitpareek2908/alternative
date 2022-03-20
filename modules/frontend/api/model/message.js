function Messages() {
	Messages = this;
	const asyncParallel 		= 	require("async/parallel");
	/** Function for get chat message
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json ajay-sharma teen-user
	 **/
	this.getMessages = (req,res,next,callback)=>{
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let loginUserId			=	(loginUserData._id)		?	loginUserData._id		:	"";	
		
		let finalResponse = {};
		if (loginUserId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {},
					message: res.__("system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		let toUserSlug				=	(req.body.to_user_slug) 		? 	req.body.to_user_slug : '';
		const users					= 	db.collection(TABLE_USERS);
		const messageCollection		= 	db.collection(TABLE_MESSAGE);
		let messageCondition		=	{
			
		}
		asyncParallel({
			get_to_user_id:(callback)=>{
				users.findOne({
					slug : toUserSlug
				},{projection:{_id:1,slug:1,profile_image:1,full_name:1}},(err, toUserResult)=>{
					toUserResult = toUserResult ? toUserResult : {};
					if(Object.keys(toUserResult).length > 0){
						callback(null,toUserResult);
						
					}else{
						callback(null,toUserResult);
					}
					
				});
			},
			
			
		},(err,response)=>{
			var toUserId		= (response.get_to_user_id._id) ? response.get_to_user_id._id 	: MONGO_ID;
			var toUserData		= (response.get_to_user_id) 	? response.get_to_user_id 		: {};
			var fromUserId	= loginUserId;
			let optionObj = {
				from_user_id : fromUserId,
				to_user_id : toUserId,
			}
			
			let matchCondition = {};
			let andConditionObj = [];
			andConditionObj.push({from_user_id:ObjectId(fromUserId)},{to_user_id : ObjectId(toUserId)})
			matchCondition['$or']= [{ from_user_id: ObjectId(toUserId) }, { to_user_id : ObjectId(fromUserId) },{"$and":andConditionObj}];
			
			getOpenTokSessionID(req,res,optionObj).then(openTokresponse=>{
				console.log("response");
				let openTokData = (openTokresponse.result) ? openTokresponse.result : {};
				let message_token_id = (openTokData.message_token_id) ? openTokData.message_token_id : "";
				messageCollection.aggregate([
					{
						$match : {
							message_token_id : ObjectId(message_token_id)
						}
					},
					{
						$lookup: {
							from: 'users',
							let: { toUserId: '$to_user_id' },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$_id", "$$toUserId"] },
											]
										},
									}
								},
								{ $project: { "_id": 1, "full_name": 1,"slug":1,"profile_image":1} }
							],
							as: "to_user_details"
						}
					},{
						$project: {
							from_user_id : 1,
							to_user_id : 1,
							message : 1,
							created : 1,
							file_name : 1,
							type : 1,
							to_user_full_name: { $arrayElemAt: ["$to_user_details.full_name", 0] },
							to_user_slug: { $arrayElemAt: ["$to_user_details.slug", 0] },
							to_user_profile_image: { $arrayElemAt: ["$to_user_details.profile_image", 0] },
							created_date : { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
							//created_time : { $dateToString: { format: API_LOOKUP_TIME_FORMAT, date: "$created" } }
							//created_time			: newDate(getUtcDate(),DATATABLE_DATE_FORMAT)
							//created_date			: newDate(getUtcDate(),DATATABLE_DATE_FORMAT)
						}
					}
				]).sort({"created":SORT_ASC}).toArray((err,messageDetail)=>{
					
					let finalResult = [];
					if(messageDetail.length > 0){
					
						finalResult = messageDetail.map(records => {
							records['created_time'] = newDate(records.created,"hh:MM TT")
							return records;
						})
					}
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							result : finalResult,
							open_tok_data : openTokData,
							toUserData : toUserData,
							user_image_url	: USERS_URL,
							file_url	: MESSAGE_FILE_URL,
						}
					}
					return returnApiResult(req,res,finalResponse);
					
				})
				
				
			})
		})
		
	}
	
	
	/** Function for save chat message
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.saveMessage = (req,res,next,callback)=>{
		
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let loginUserId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
        let fullName			=	(loginUserData.full_name)		?	loginUserData.full_name		:	"";		
        let fromUserSlug			=	(loginUserData.slug)		?	loginUserData.slug		:	"";		
		
		let finalResponse = {};
		if (loginUserId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {},
					message: res.__("system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const users					= 	db.collection(TABLE_USERS);
		const messageCollection		= 	db.collection(TABLE_MESSAGE);
		const messageToken		= 	db.collection(TABLE_MESSAGE_TOKEN);
		
		let toUserSlug				=	(req.body.to_user_slug) 		? 	req.body.to_user_slug : '';
		let message					=	(req.body.message) 				? 	req.body.message : '';
		let messageTokenId			=	(req.body.message_token_id) 	? 	req.body.message_token_id : MONGO_ID;
		let messageFile 			= (req.files && req.files.file_name)	? req.files.file_name 		: "";
		asyncParallel({
			get_to_user_id:(callback)=>{
				users.findOne({
					slug : toUserSlug
				},{projection:{_id:1,slug:1}},(err, toUserResult)=>{
					toUserResult = toUserResult ? toUserResult : {};
					if(Object.keys(toUserResult).length > 0){
						callback(null,toUserResult);
						
					}else{
						callback(null,toUserResult);
					}
					
				});
			},
			upload_file:(callback)=>{
				let imageName = "";
				if(messageFile != ""){
					let imageOptions = {
						'image' 			:	messageFile,
						'filePath' 			: 	MESSAGE_FILE_PATH,
					};
					moveUploadedFile(req, res,imageOptions).then(imageResponse=>{
						if(imageResponse.status == STATUS_ERROR){
							callback(null,imageName);
						}
						let imageName			=	(imageResponse.fileName) ? imageResponse.fileName :"";
						callback(null,imageName);
					})
				}else{
					callback(null,imageName);
				}
			}
			
		},(err,response)=>{
			var to_user_id		= (response.get_to_user_id._id) ? response.get_to_user_id._id : MONGO_ID;
			var msgFileName		= (response.upload_file) ? response.upload_file : "";
			let messageType = "text";
			if(message == "")
			{
				messageType = "file";
			}
			let insertData = {
				from_user_id  		: ObjectId(loginUserId),
				to_user_id  		: ObjectId(to_user_id),
				message_token_id  	: ObjectId(messageTokenId),
				message 			: message,
				type  				: messageType,
				file_name  			: msgFileName,
				is_seen  			: DEACTIVE,
				created  			: getUtcDate(),
				modified  			: getUtcDate(),
			}
			messageCollection.insertOne(insertData,(messageErr,messageResult)=>{
				
				var lastInsertId	=	(messageResult.insertedId) ? messageResult.insertedId : "";
				messageToken.updateOne({
					_id : ObjectId(messageTokenId),
				},{
					$set : {
						last_message_time : getUtcDate(),
						last_message_id : ObjectId(lastInsertId)
					}
				},(updateErr,updateResult)=>{
					
					//send like comment pn and notification message to post owner user
					let notificationMessageParams	= [fullName];
					let notificationOptions 		= {
						notification_data : {
							notification_type	: NOTIFICATION_NEW_CHAT_MESSAGE,
							message_params		: notificationMessageParams,
							parent_table_id		: to_user_id,
							user_id				: ObjectId(to_user_id),
							user_ids			: [to_user_id],
							user_role			: to_user_id,
							user_role_id		: to_user_id,
							created_by			: to_user_id,
							request_status		: DEACTIVE,
							pn_type				: PN_TYPE_CONFIG.chat_msg_recevied,
							notification_action	: PN_TYPE_CONFIG.chat_msg_recevied,
							extra_parameters	: {
								slug	: fromUserSlug,
							}
						}
					};
					let pnMessage = fullName+" send message";
					pushNotification(req,res,{
						pn_body:pnMessage,user_id:String(to_user_id),slug:fromUserSlug,pn_type:PN_TYPE_CONFIG.chat_msg_recevied
					}).then(pnResponse=>{});
					//insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
					
						
					//});

					
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							last_message: {
								from_user_id  	: ObjectId(loginUserId),
								to_user_id  	: ObjectId(to_user_id),
								message 		: message,
								type  			: messageType,
								is_seen  		: DEACTIVE,
								file_name		: msgFileName,
								to_user_slug	: toUserSlug,
								created_time			: newDate(getUtcDate(),"hh:MM TT"),
								created_date			: newDate(getUtcDate(),DATE_FORMAT_EXPORT)
							},
							file_url : MESSAGE_FILE_URL,
							message: res.__("Message has been sent")
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				})
				
					
			})
		})
	}
	
	
	
	/** Function for save file in  message
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.saveFileMessage = (req,res,next,callback)=>{
		
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let loginUserId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
		const async		= 	require("async");
		//console.log("req.files");
		//console.log(req.files);
		//return false;
		
		let finalResponse = {};
		if (loginUserId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {},
					message: res.__("system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		const users					= 	db.collection(TABLE_USERS);
		const messageCollection		= 	db.collection(TABLE_MESSAGE);
		const messageToken		= 	db.collection(TABLE_MESSAGE_TOKEN);
		
		let toUserSlug				=	(req.body.to_user_slug) 		? 	req.body.to_user_slug : '';
		let message					=	(req.body.message) 				? 	req.body.message : '';
		let messageTokenId			=	(req.body.message_token_id) 	? 	req.body.message_token_id : MONGO_ID;
		let type					=	(req.body.type) 	? 	req.body.type : MONGO_ID;
		let messageFile 			= 	(req.files && req.files.file_name)	? req.files.file_name 		: "";
		
		let objImageArray = [];
		selectFiles = req.files && req.files.file_name ? req.files.file_name : [];
		if(req.files && typeof req.files.file_name.length != "undefined"){
			objImageArray = req.files.file_name;
		}else{
			if(req.files)
			{
				objImageArray.push(req.files.file_name);
			}
		}
		
		asyncParallel({
			get_to_user_id:(callback)=>{
				users.findOne({
					slug : toUserSlug
				},{projection:{_id:1,slug:1}},(err, toUserResult)=>{
					toUserResult = toUserResult ? toUserResult : {};
					if(Object.keys(toUserResult).length > 0){
						callback(null,toUserResult);
						
					}else{
						callback(null,toUserResult);
					}
					
				});
			},
			upload_file:(callback)=>{
				let insertArray = [];
				let errors			= [];
				if(objImageArray.length > 0){
					
					async.eachSeries(objImageArray, function iteratee(message_file, callbackAsync) {

						message_file = message_file;
						let options	=	{
							'image' 	:	message_file,
							'filePath' 	: 	MESSAGE_FILE_PATH,
							allowedExtensions : ALLOWED_MESSAGE_FILE_EXTENSIONS,
							allowedImageError : ALLOWED_MESSAGE_FILE_ERROR_MESSAGE,
							allowedMimeTypes : ALLOWED_MESSAGE_FILE_MIME_EXTENSIONS,
							allowedImageError	: ALLOWED_MESSAGE_FILE_ERROR_MESSAGE
						};

						moveUploadedFile(req, res,options).then(response=>{
							if(response.status == STATUS_ERROR){
								errors.push({ 'param': 'file_name', 'msg': response.message });
							}else{
								let imageName 	= 	(response.fileName) ? response.fileName 	:"";
								insertArray.push({ 'id':new ObjectId(), 'file_name': imageName });
								
							}
							callbackAsync(null)
						})
					}, function done() {
						if(errors.length > 0){
							callback(null,errors);
						}else{
							callback(null,insertArray);
							
						}
					});
					
				}else{
					callback(null,insertArray);
				}
			}
			
		},(err,response)=>{
			var to_user_id		= (response.get_to_user_id._id) ? response.get_to_user_id._id : MONGO_ID;
			var msgFileName		= (response.upload_file) ? response.upload_file : "";
			//console.log("msgFileName");
			//console.log(msgFileName);
			//return false;
			if(msgFileName && msgFileName.length > 0)
			{	
				let returnMessageArray = [];
				async.eachSeries(msgFileName, function iteratee(records, callbackSecond) {
					let insertData = {
						from_user_id  		: ObjectId(loginUserId),
						to_user_id  		: ObjectId(to_user_id),
						message_token_id  	: ObjectId(messageTokenId),
						message 			: message,
						type  				: type,
						file_name  			: (records.file_name) ? records.file_name : "",
						is_seen  			: DEACTIVE,
						created  			: getUtcDate(),
						modified  			: getUtcDate(),
					}
					messageCollection.insertOne(insertData,(messageErr,messageResult)=>{
						var lastInsertId	=	(messageResult.insertedId) ? messageResult.insertedId : "";
						messageToken.updateOne({
							_id : ObjectId(messageTokenId),
						},{
							$set : {
								last_message_time : getUtcDate(),
								last_message_id : ObjectId(lastInsertId)
							}
						},(updateErr,updateResult)=>{
							returnMessageArray.push({
								from_user_id  	: ObjectId(loginUserId),
								to_user_id  	: ObjectId(to_user_id),
								message 		: message,
								type  			: type,
								is_seen  		: DEACTIVE,
								file_name		: (records.file_name) ? records.file_name : "",
								to_user_slug	: toUserSlug,
								created_time	: newDate(getUtcDate(),"hh:MM TT"),
								created_date	: newDate(getUtcDate(),DATE_FORMAT_EXPORT)
							});
							callbackSecond(null)
						})
					});
					
				}, function done() {
					//console.log("returnMessageArray");
					//console.log(returnMessageArray);
					
					finalResponse = {
						'data': {
							status: STATUS_SUCCESS,
							last_message: returnMessageArray,
							file_url : MESSAGE_FILE_URL,
							message: res.__("Message has been sent")
						}
					};
					return returnApiResult(req,res,finalResponse);
					
				});
				
				/*let insertData = {
					from_user_id  		: ObjectId(loginUserId),
					to_user_id  		: ObjectId(to_user_id),
					message_token_id  	: ObjectId(messageTokenId),
					message 			: message,
					type  				: type,
					file_name  			: msgFileName,
					is_seen  			: DEACTIVE,
					created  			: getUtcDate(),
					modified  			: getUtcDate(),
				}
				messageCollection.insertOne(insertData,(messageErr,messageResult)=>{
					
					var lastInsertId	=	(messageResult.insertedId) ? messageResult.insertedId : "";
					messageToken.updateOne({
						_id : ObjectId(messageTokenId),
					},{
						$set : {
							last_message_time : getUtcDate(),
							last_message_id : ObjectId(lastInsertId)
						}
					},(updateErr,updateResult)=>{
						
						finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								last_message: {
									from_user_id  	: ObjectId(loginUserId),
									to_user_id  	: ObjectId(to_user_id),
									message 		: message,
									type  			: type,
									is_seen  		: DEACTIVE,
									file_name		: msgFileName,
									to_user_slug	: toUserSlug,
									created_time	: newDate(getUtcDate(),"hh:MM TT"),
									created_date	: newDate(getUtcDate(),DATE_FORMAT_EXPORT)
								},
								file_url : MESSAGE_FILE_URL,
								message: res.__("Message has been sent")
							}
						};
						return returnApiResult(req,res,finalResponse);
						
					})
					
						
				});*/
			}else{
				finalResponse = {
					'data': {
						status: STATUS_ERROR,
						result: {},
						message: res.__("system.something_going_wrong_please_try_again")
					}
				};
				return returnApiResult(req,res,finalResponse);
			}
		})
	}
	
	this.getMessageUserList = (req,res,next,callback)=>{
		
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let loginUserId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
		
		let finalResponse = {};
		if (loginUserId == '') {
			finalResponse = {
				'data': {
					status: STATUS_ERROR,
					result: {},
					message: res.__("system.something_going_wrong_please_try_again")
				}
			};
			return returnApiResult(req,res,finalResponse);
		}
		console.log("here now");
		let fromUserId = loginUserId;
		//let matchCondition = {};
		//let andConditionObj = [];
		//andConditionObj.push({to_user_id:ObjectId(fromUserId)})
		//matchCondition['$or']= [{ from_user_id: ObjectId(fromUserId) },{"$and":andConditionObj}];
		
		const messageToken		= 	db.collection(TABLE_MESSAGE_TOKEN);
		
		
		const messageCollection		= 	db.collection(TABLE_MESSAGE);
		
		/*let matchCondition = {
			
			$and:[
                {$or:[
                     {"from_user_id" :ObjectId(fromUserId)}, 
                     {"to_user_id" : ObjectId(fromUserId)}
                ]},
               {$or:[
                    {"from_user_id" :ObjectId(toUserId)}, 
                     {"to_user_id" : ObjectId(toUserId)}
                ]},
			]
		};*/
		
		messageToken.aggregate([
			{
				$match: {
					$or: [
						{
						  "from_user_id": ObjectId(fromUserId)
						},
						{
						  "to_user_id":  ObjectId(fromUserId)
						}
					 ]
					
				}
			},
			{
				$lookup: {
					from: 'users',
					let: { toUserId: '$to_user_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$_id", "$$toUserId"] },
									]
								},
							}
						},
						{ $project: { "_id": 1, "full_name": 1,"slug":1,"profile_image":1} }
					],
					as: "to_user_details"
				}
			},
			{
				$lookup: {
					from: 'users',
					let: { fromUserId: '$from_user_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$_id", "$$fromUserId"] },
									]
								},
							}
						},
						{ $project: { "_id": 1, "full_name": 1,"slug":1,"profile_image":1} }
					],
					as: "from_user_details"
				}
			},
			{
				$lookup: {
					from: TABLE_MESSAGE,
					let: { last_message: '$last_message_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$_id", "$$last_message"] },
									]
								},
							}
						},
						{ $project: { "_id": 1, "message": 1} }
					],
					as: "message_details"
				}
			},
			{
				$project : {
					last_message_time : 1,
					last_message : 1,
					from_user_id : 1,
					to_user_id : 1,
					to_user_name: { $arrayElemAt: ["$to_user_details.full_name", 0] },
					to_user_profile_image: { $arrayElemAt: ["$to_user_details.profile_image", 0] },
					to_user_slug: { $arrayElemAt: ["$to_user_details.slug", 0] },
					
					from_user_name: { $arrayElemAt: ["$from_user_details.full_name", 0] },
					from_user_profile_image: { $arrayElemAt: ["$from_user_details.profile_image", 0] },
					from_user_slug: { $arrayElemAt: ["$from_user_details.slug", 0] },
					
					last_message: { $arrayElemAt: ["$message_details.message", 0] },
				}
			}
		]).sort({"last_message_time":SORT_DESC}).toArray((err,newmessageResult)=>{
			
			
			
			let finalResult = [];
			if(newmessageResult.length > 0){
			
				finalResult = newmessageResult.map(records => {
					let fromUserId =  (records.from_user_id) ? records.from_user_id : "";
					let toUserId =  (records.to_user_id) ? records.to_user_id : "";
					console.log("fromUserId "+fromUserId)
					console.log("loginUserId "+loginUserId)
					if(String(fromUserId) == String(loginUserId)){
						
						//records['created_time'] = newDate(records.created,"hh:MM TT")
						records['user_image'] = (records.to_user_profile_image) ? records.to_user_profile_image : "";
						records['user_name'] = (records.to_user_name) ? records.to_user_name : "";
						records['user_slug'] = (records.to_user_slug) ? records.to_user_slug : "";
						//return records;
					}else{
						
						records['user_image'] = (records.from_user_profile_image) ? records.from_user_profile_image : "";
						records['user_name'] = (records.from_user_name) ? records.from_user_name : "";
						records['user_slug'] = (records.from_user_slug) ? records.from_user_slug : "";
						
					}
					
					return records;
				})
			}
			
			console.log("finalResult");
			console.log(finalResult);
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					//result: messageResult,
					finalResult: finalResult,
					user_image_url	: USERS_URL, 
				}
			};
			return returnApiResult(req,res,finalResponse);
			
		})
		
		return false;
		
		let matchCondition = {
			to_user_id : ObjectId(fromUserId)
		}
		matchCondition["$or"] = [{ from_user_id: ObjectId(fromUserId) }];
		
		console.log(matchCondition);
		
		messageCollection.aggregate([
			{
				$match: {
					$or: [
						{
						  "from_user_id": ObjectId(fromUserId)
						},
						{
						  "to_user_id":  ObjectId(fromUserId)
						}
					 ]
					
				}
			},
			//{ $addFields: { 'from_user_id': { $last : "$from_user_id" } } },
			//{ $addFields: { 'to_user_id': { $last : "$to_user_id" } } },
			{
				$lookup: {
					from: 'users',
					let: { toUserId: '$to_user_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$_id", "$$toUserId"] },
									]
								},
							}
						},
						{ $project: { "_id": 1, "full_name": 1,"slug":1,"profile_image":1} }
					],
					as: "to_user_details"
				}
			},
			{
				$lookup: {
					from: 'users',
					let: { fromUserId: '$from_user_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$_id", "$$fromUserId"] },
									]
								},
							}
						},
						{ $project: { "_id": 1, "full_name": 1,"slug":1,"profile_image":1} }
					],
					as: "from_user_details"
				}
			},
			{$group : {
				_id : "$message_token_id",
				message: { $last : "$message" },
				created: { $last : "$created" },
				from_user_id: { $last : "$from_user_id" },
				to_user_id: { $last : "$to_user_id" },
				"to_user_slug"	: {$first : {$arrayElemAt:["$to_user_details.slug",0]}},
				"to_user_full_name"	: {$first : {$arrayElemAt:["$to_user_details.full_name",0]}},
				"to_user_profile_image"	: {$first : {$arrayElemAt:["$to_user_details.profile_image",0]}},
				
				"from_user_slug"	: {$first : {$arrayElemAt:["$from_user_details.slug",0]}},
				"from_user_full_name"	: {$first : {$arrayElemAt:["$from_user_details.full_name",0]}},
				"from_user_profile_image"	: {$first : {$arrayElemAt:["$from_user_details.profile_image",0]}},
				
			}}
		]).sort({"created":SORT_DESC}).toArray((err,messageResult)=>{
			
			console.log("messageResult");
			console.log(messageResult);
			return false;
			let finalResult = [];
			if(messageResult.length > 0){
			
				finalResult = messageResult.map(records => {
					let fromUserId =  (records.from_user_id) ? records.from_user_id : "";
					let toUserId =  (records.to_user_id) ? records.to_user_id : "";
					console.log("fromUserId "+fromUserId)
					console.log("loginUserId "+loginUserId)
					if(String(fromUserId) == String(loginUserId)){
						
						//records['created_time'] = newDate(records.created,"hh:MM TT")
						records['user_image'] = (records.to_user_profile_image) ? records.to_user_profile_image : "";
						records['user_name'] = (records.to_user_full_name) ? records.to_user_full_name : "";
						records['user_slug'] = (records.to_user_slug) ? records.to_user_slug : "";
						//return records;
					}else{
						
						records['user_image'] = (records.from_user_profile_image) ? records.from_user_profile_image : "";
						records['user_name'] = (records.from_user_full_name) ? records.from_user_full_name : "";
						records['user_slug'] = (records.from_user_slug) ? records.from_user_slug : "";
						
					}
					
					return records;
				})
			}
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					//result: messageResult,
					finalResult: finalResult,
					user_image_url	: USERS_URL, 
				}
			};
			return returnApiResult(req,res,finalResponse);
		})
		
		
	}
	
}
module.exports = new Messages();