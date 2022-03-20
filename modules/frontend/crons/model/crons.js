
function Crons() {
	
	const async	 	= require('async');
	
	//localhost:21091/frontend/crons/getProductUrls -- for product URLS
	
	
	/**
	 * Function for use to broadcast send message
	 
	 * @return render/json
	 */
	this.broadcastSendMessage = (req, res)=>{ 
		const broadcast = db.collection(TABLE_PUSH_NOTIFICATIONS);
		
		broadcast.find({is_send : DEACTIVE,is_active:ACTIVE},{message:1,user_ids:1,user_type:1}).toArray((errBrodcase, resultBroadcast)=>{
			if(resultBroadcast.length>0){
				resultBroadcast.map(recordsBroadcast=>{
					
					/**All user send message*/
					var userIds	=	(recordsBroadcast.user_ids)	?	recordsBroadcast.user_ids	:	[];
					var message	=	(recordsBroadcast.message)	?	recordsBroadcast.message	:	"";
					
					userIds.forEach(function(userId,resultUserDataIndex){
						
						// PushNotificationCommonFunction(req,res,userId,{pn_title:pnTitle,pn_body:(message)});
						 
						/***Start Send Notification user**/
						let notificationMessageParams	= [message];
						let notificationOptions 		= {
							notification_data : {
								notification_type	: NOTIFICATION_BROADCAST,
								message_params		: notificationMessageParams,
								parent_table_id		: ADMIN_ID,
								user_id				: userId,
								user_ids			: [userId],
								user_role_id		: SUPER_ADMIN_ROLE_ID,
								role_id				: SUPER_ADMIN_ROLE_ID,
								created_by			: SUPER_ADMIN_ROLE_ID,
								pn_type				: PN_TYPE_CONFIG.broadcast,
								notification_action	: PN_TYPE_CONFIG.broadcast,
								
							}
						};
						insertNotifications(req,res,notificationOptions).then(notificationResponse=>{});
						/***End Send Notification**/
						
						
					});
					
					/** Send notification after status change**/
					broadcast.updateOne({
						"_id" : ObjectId(recordsBroadcast._id)
					},{
						$set:{
							"is_send" : ACTIVE
						}
					},function(updateErr, updateReslt){
					});
					
				});				
				res.end("Processing............");
			}else{
				res.end("No records found.");
			}
		});
	}//End broadcastSendMessage()
	
	
	/**
	 * Function for use to send post notification to followers
	 
	 * @return render/json
	 */
	this.sendPostNotificationToFollowers = (req, res)=>{ 
		const posts = db.collection(TABLE_POSTS);
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		let conditions = {
			user_id : ObjectId("609a1dbf9630806d8deb5c83"),
			is_deleted : DEACTIVE,
			send_follower_pn : DEACTIVE,
			status : ACTIVE
		}
		posts.aggregate([
			{
				$match: conditions
			},
			{ $lookup: {
				from: TABLE_USERS,
				let: { userId: "$user_id" },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ["$_id", "$$userId"] },
								]
							},
						}
					},
					{ $project: { "_id": 1, "full_name": 1,} }
				],
				as: "user_detail"
			}},
			{
				$project : {
					_id : 1,
					user_id : 1,
					user_name: { $arrayElemAt: ["$user_detail.full_name", 0] },
				}
			}
		]).sort({"created":SORT_DESC}).limit(2).toArray((err,result)=>{
		
			if(result && result.length > 0)
			{
				
				let postIdArr = [];
				async.eachSeries(result, function iteratee(record, callback) {
					let postId = (record._id) ? record._id : "";
					let fullName = (record.user_name) ? record.user_name : "";
					let createdUserId = (record.user_id) ? record.user_id : "";
					let postSlug = (record.slug) ? record.slug : "";
					usersFollower.distinct('followed_by',{"user_id":ObjectId(createdUserId),"is_approved":ACTIVE},(err,followersUser)=>{
						if(followersUser && followersUser.length > 0)
						{
							async.eachSeries(followersUser, function iteratee(followerUserId, secondCallback) {
								
								//send like comment pn and notification message to post owner user
								let notificationMessageParams	= [fullName];
								let notificationOptions 		= {
									notification_data : {
										notification_type	: NOTIFICATION_NEW_POST_BY_USER,
										message_params		: notificationMessageParams,
										parent_table_id		: followerUserId,
										user_id				: ObjectId(followerUserId),
										user_ids			: [followerUserId],
										user_role			: followerUserId,
										user_role_id		: followerUserId,
										created_by			: followerUserId,
										request_status		: DEACTIVE,
										pn_type				: PN_TYPE_CONFIG.new_post,
										notification_action	: PN_TYPE_CONFIG.new_post,
										extra_parameters	: {
											slug	: postSlug,
										}
									}
								};
								console.log("followerUserId");
								console.log(followerUserId);
							
								insertNotifications(req,res,notificationOptions).then(notificationResponse=>{
								});
								console.log("second callback")
								secondCallback(null);
							}, function done() {
								console.log("parent callback");
								postIdArr.push(ObjectId(postId));
								callback(null);
								//res.end(res.__("Processing.........."));
							});
						}else{
							postIdArr.push(ObjectId(postId));
							callback(null);
						}
						
					})
					
				}, function done() {
					if(postIdArr && postIdArr.length > 0)
					{
						posts.updateMany({
							_id : {$in : postIdArr}
						},{
							$set : {
								send_follower_pn : ACTIVE
							}
						},(err,updateResult)=>{
							console.log("postIdArr "+postIdArr);
							res.end(res.__("Processing.........."));
							
						})
					}else{
						res.end(res.__("Processing.........."));
					}
					
				});
			}
		})
		
	}
	
	
	
	this.cronSetting = (req,res)=>{
		consoleLog("cronSetting function was called at "+currentTimeStamp());
		consoleLog("======================== ");
		const scrapperPlatformCollection 	= db.collection(TABLE_SCRAPPER_PRODUCTS_SCRAPS);
		scrapperPlatformCollection.findOne(
		{
			//"product_table_processed"	:NOT_DELETED,
			"status"					:ACTIVE,
		//	"product_slug"				:"itshidden-vpn"
		},(err, result)=>{	
		consoleLog(result)
		if(err) return next(err);
			if(result._id)
			{
				consoleLog("id is "+result._id)
				 
				setTimeout(function() {
					this.cronSetting;
						consoleLog("cron hit time in every EVEN min  "+currentTimeStamp()+"--");
				}, 3000);
		
				
			}else{
				
				consoleLog("end of file.")
			}
					
		})
		//getDataReverse();
		// setInterval(function() {
				// getDataReverse();
				// consoleLog("cron hit time in every EVEN min  "+currentTimeStamp()+"--");
		// }, 17000); // 60 * 1000 milsec
		
	}
	
	this.cronSetting2 = (req,res)=>{
		consoleLog(req.query)
		
		getAlternativeDataForward(req,res);
		// setInterval(function() {
				// getDataForward(req,res);
				// consoleLog("cron hit time in every EVEN min  "+currentTimeStamp()+"--");
		// }, 15000); // 60 * 1000 milsec
	}
	
	
	
/**
 * Function use to save product about data in scrapper table 
 
 * @return render/json
 */	
let getAlternativeDataForward = (req,res)=>{
		consoleLog("req query in ain function is ");
		consoleLog(req.query)
		
		 var start= req.query.start ? req.query.start : 0;
		 var end= req.query.end ? req.query.end : 10000;
		 consoleLog("start is "+start)
		 consoleLog("end is "+end)
	//	 return false;
		var tableName="scrapper_products_scraps"; 
		// switch(true) {
		  // case end>=0 && end<=70000:
			// tableName = "scrapper_products_scraps_6";
			
			// break;
		  // case  end>0 && end<=0000:
			// tableName = "scrapper_products_scraps_5";
			// consoleLog("table  is 1 ")
			// break;
		  // case  end>30001 && end<=40000:
			// tableName = "scrapper_products_scraps_6";
			
			// break;
		  // case  end>40001 && end<=68000:
			// tableName = "scrapper_products_scraps_3";
			
			// break;
		  // case  end>60001 && end<=65000:
			// tableName = "scrapper_products_scraps_5";
			
			// break;
		  // case  end>55001 && end<=60000:
			// tableName = "scrapper_products_scraps_6";
			
			// break; 		
		//  default:
		//  tableName = "scrapper_products_scraps";
		 
			// code block
	//	}
		
		consoleLog("table name is "+tableName)
		//return false;
		
		const productsUrlScraps		= 	db.collection(TABLE_SCRAPPER_PRODUCTS_URLS);
		const productsScraps		= 	db.collection(tableName);
		let limit					= 	1;
		let conditionQuery = {
			is_processed							: 	NOT_DELETED,
			product_alternative_table_processed	:	NOT_DELETED,
			is_alternative_skipped					:	NOT_DELETED,
			sequence_number						:	{$gte:parseInt(start),$lte:parseInt(end)}
		}

		consoleLog(conditionQuery)
			
	productsScraps.findOne(conditionQuery,{sort: { _id: -1 }},(err, result)=>{
		if(err) return next(err);
		
		if(result){
			
			consoleLog("Product url data In Data Forward is ");
			consoleLog(result.product_name);
						
				var productId				=	(result._id) 							? 	(result._id) 			:"";
				var productName				=	(result.product_name) 					? 	(result.product_name) 			:"";	
				var productType				=	(result.product_type) 					? 	(result.product_type) 			:"";
				var productSlug				=	(result.product_slug) 					? 	(result.product_slug) 			:"";
				var productACount			=	(result.product_alternative_count) 		? 	(result.product_alternative_count) 			:"";
				var loopCount = Math.ceil(productACount/10);
			consoleLog(productName);
			consoleLog(productSlug);
			consoleLog(productACount);
			consoleLog(productACount);
			var loopCountArray =  Array.from({length:loopCount},(v,k)=>k+1)
		consoleLog(loopCountArray);
				var productAlternatives = [];
		async.eachSeries(loopCountArray, function iteratee(item, callback) 
		{ consoleLog("first Item is "+item)
			var aboutGotoUrl ="";
			if(item>=2){	
				aboutGotoUrl ="https://alternativeto.net/_next/data/z0huIHf3FXzzPBGKSlEGY/software/"+productSlug+".json?p="+item+"&urlName="+productSlug
			}else{
				aboutGotoUrl ="https://alternativeto.net/_next/data/z0huIHf3FXzzPBGKSlEGY/software/"+productSlug+".json?urlName="+productSlug
			}
			
			const puppeteer = require('puppeteer');
			consoleLog('Scrap Start---->');
			consoleLog('productName is--  '+productName);
			consoleLog('productSlug is --  '+productSlug);
			consoleLog("URL USED IS ");
			consoleLog(aboutGotoUrl);
			consoleLog('=============Scrap Start===================');
			var browser="";
			var pageOne="";
			(async () => {
				try{
					consoleLog('=============Launching Browser===================');

					 browser = await puppeteer.launch( {
						headless: false,  //change to true in prod!
						    args: [
								'--no-sandbox',
								'--disable-gpu',
								'--disable-dev-shm-usage',
								'--disable-setuid-sandbox',
								'--disable-extensions',
								'--disable-dev-shm-usage',
								'--disable-blink-features=AutomationControlled',
								'--lang=en-US,en',
								'--no-first-run',
								'--no-zygote',
								
								"--proxy-server='direct://'",
								'--proxy-bypass-list=*'
							  ],
							timeout: 0,
							ignoreDefaultArgs: ['--enable-automation'],
							executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
					}); 
					
					
					let randomAgent= 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582';
					consoleLog('=============Page Opening iN Browser===================');
					consoleLog((await browser.pages()).length)
					 pageOne = await browser.newPage(); 
					 consoleLog('=============HIT URL  iN Browser===================');
					
					
					await pageOne.setUserAgent(randomAgent); // like this
					await pageOne.goto(aboutGotoUrl,{waitUntil: 'networkidle2'});
					const cookies = [{name: 'test', value: 'foo'}, {name: 'test2', value: 'foo'}]; // just as example, use real cookies here;
					await pageOne.setCookie(...cookies);
					//await pageOne.waitFor(5000); 
					
					consoleLog('=============WWAIT FOR RESULT===================');
					
					await pageOne.waitForSelector('body',{visible: true,})
					let pageOneElement = await pageOne.$('body')
					 
					 aboutScrapped = await pageOne.evaluate(el => el.textContent, pageOneElement)
					 consoleLog('=============DATA FOUND===================');
					
				consoleLog("About Product Data");
			//	consoleLog(aboutScrapped);
				consoleLog(typeof aboutScrapped)
				var json_verify = "YES";
				try {
						object = JSON.parse(aboutScrapped);
					} catch (error) {
						is_json = false;
						json_verify = "No";
					}
				consoleLog(json_verify)
				if(json_verify == "YES")
				{
			
				var aboutdata  = JSON.parse(aboutScrapped);
				aboutdata 	=	aboutdata.pageProps
				//consoleLog(aboutdata);
				//return false;
				if((aboutdata) && (aboutdata.items) && (Object.keys(aboutdata.items).length >0))
				{
				//	currentPageNumber 
				var alternatietemp = aboutdata.items ? aboutdata.items : "";
				consoleLog("type  of  alternatietemp is "+typeof(alternatietemp));
				consoleLog("lenth of  alternatietemp is "+alternatietemp.length);
				consoleLog("lenth of  alternatietemp is "+alternatietemp.length);
				
				async.eachSeries(alternatietemp, function iteratee(itemNew, callback) 
					{
						consoleLog("Item new is "+itemNew);
						var alternativeName = itemNew.name ? itemNew.name : "";
						var alternativeSlug = itemNew.urlName ? itemNew.urlName : "";
						var obje = {
								"name":alternativeName.toLowerCase(),
								"slug":alternativeSlug.toLowerCase()
						}
						consoleLog(obje)
						productAlternatives.push(obje);
						callback(null);
						
					}, function done() {
						consoleLog("Finally Done Inner Loop is called")
						consoleLog(productAlternatives)
						
					});
					
					//consoleLog(aboutdata.items);
					//productAlternatives.push()	
			
				}
				else{
					consoleLog("DATA key mainitem no found ");
		productsScraps.updateOne({"_id" :ObjectId(productId) },
			{$set:{"is_alternative_skipped":ACTIVE}},
			(err,result)=>{
									
								});
								
								
				
				}
				}else{
					consoleLog("json verify said no");
					productsScraps.updateOne({"_id" :ObjectId(productId) },
			{$set:{"is_alternative_skipped":ACTIVE}},
			(err,result)=>{
									
								});
			
				}
				}catch(err){
					consoleLog(err);
					
				}finally{
				
				 await pageOne.close();
				  await browser.close();
				callback(null)
				}
				})();
	
			
			
			
		
		}, function done() {
			consoleLog("Finally Done is called")
			consoleLog(productAlternatives)
			
	productsScraps.updateOne({"_id" :ObjectId(productId) },
			{$set:{"product_alternative":productAlternatives,
			"product_alternative_table_processed":ACTIVE,"product_alternative_ids_processed":DEACTIVE}},
			(err,result)=>{
				setTimeout(function () {
                getAlternativeDataForward();
            }, 5000);
							
						
								});
			
		});
			
		}else{
			consoleLog("Data not found");
			
		}			
		
		});
					
					
					
				
		
	}// end getDataForward
	

	
	
	
	
	
/**
 * Function use to save product about data in scrapper table 
 
 * @return render/json
 */	
let getDataForward = (req,res)=>{
		consoleLog("req query in ain function is ");
		consoleLog(req.query)
		var start= req.query.start ? req.query.start : 0;
		var end= req.query.end ? req.query.end : 10000;
		consoleLog("end is "+end)
		var tableName=""; 
		switch(true) {
		  case end>=0 && end<=70000:
			tableName = "scrapper_products_scraps_6";
			
			break;
		  // case  end>0 && end<=0000:
			// tableName = "scrapper_products_scraps_5";
			// consoleLog("table  is 1 ")
			// break;
		  // case  end>30001 && end<=40000:
			// tableName = "scrapper_products_scraps_6";
			
			// break;
		  // case  end>40001 && end<=68000:
			// tableName = "scrapper_products_scraps_3";
			
			// break;
		  // case  end>60001 && end<=65000:
			// tableName = "scrapper_products_scraps_5";
			
			// break;
		  // case  end>55001 && end<=60000:
			// tableName = "scrapper_products_scraps_6";
			
			// break; 		
		  default:
		  tableName = "scrapper_products_scraps";
		 
			// code block
		}
		
		consoleLog("table name is "+tableName)
		//return false;
		
		const productsUrlScraps		= 	db.collection(TABLE_SCRAPPER_PRODUCTS_URLS);
		const productsScraps		= 	db.collection(tableName);
		let limit					= 	1;
			
	productsUrlScraps.findOne(
			{
				 is_processed					: 	NOT_DELETED,
				 is_about_data_processed		:	NOT_DELETED,
				 is_skipped						:	NOT_DELETED,
				 sequence_number				:	{$gte:parseInt(start),$lte:parseInt(end)},
			//	"product_slug"	:	"passwdsafe"
			},{sort: { _id: -1 }},(err, result)=>{
		if(err) return next(err);
		
		if(result){
			
			consoleLog("Product url data In Data Forward is ");
			consoleLog(result.product_name);
						
				var productId				=	(result._id) 				? 	(result._id) 			:"";
				var productName				=	(result.product_name) 		? 	(result.product_name) 			:"";	
				var productType				=	(result.product_type) 		? 	(result.product_type) 			:"";
				var productSlug				=	(result.product_slug) 		? 	(result.product_slug) 			:"";
			consoleLog(result._id);
			
				var aboutGotoUrl			=	"https://alternativeto.net/_next/data/orggwikVCnzgUHZGvMxC7/"+productType+"/"+productSlug+"/about.json?urlName="+productSlug+"";
			//	var alternativeGotoUrl		=	"https://alternativeto.net/_next/data/AbzYSg-kgFYPBPabQyKE8/"+productType+"/"+productSlug+".json?urlName="+productSlug+"";
				var aboutScrapped;
				var alternativeScrapped;
			//	var aboutGotoUrl = "https://alternativeto.net/_next/data/iakbIMKYC3XV2nl9gQSAl/software/passwdsafe/about.json?urlName=passwdsafe";
			
				const puppeteer = require('puppeteer');
				consoleLog('Scrap Start---->');
				consoleLog('productName is--  '+productName);
				consoleLog('productSlug is --  '+productSlug);
				consoleLog("URL USED IS ");
				consoleLog(aboutGotoUrl);
				consoleLog('=============Scrap Start===================');
				var browser="";
				var pageOne="";
				(async () => {
				try{
					consoleLog('=============Launching Browser===================');

					 browser = await puppeteer.launch( {
						headless: false,  //change to true in prod!
						    args: [
								'--no-sandbox',
								'--disable-gpu',
								'--disable-dev-shm-usage',
								'--disable-setuid-sandbox',
								'--disable-extensions',
								'--disable-dev-shm-usage',
								'--disable-blink-features=AutomationControlled',
								'--lang=en-US,en',
								'--no-first-run',
								'--no-zygote',
								
								"--proxy-server='direct://'",
								'--proxy-bypass-list=*'
							  ],
							timeout: 0,
							ignoreDefaultArgs: ['--enable-automation'],
							executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
					}); 
					
					
					let randomAgent= 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582';
					consoleLog('=============Page Opening iN Browser===================');
					consoleLog((await browser.pages()).length)
					 pageOne = await browser.newPage(); 
					 consoleLog('=============HIT URL  iN Browser===================');
					
					
					await pageOne.setUserAgent(randomAgent); // like this
					await pageOne.goto(aboutGotoUrl,{waitUntil: 'networkidle2'});
					const cookies = [{name: 'test', value: 'foo'}, {name: 'test2', value: 'foo'}]; // just as example, use real cookies here;
					await pageOne.setCookie(...cookies);
					//await pageOne.waitFor(5000); 
					
					consoleLog('=============WWAIT FOR RESULT===================');
					
					await pageOne.waitForSelector('body',{visible: true,})
					let pageOneElement = await pageOne.$('body')
					 
					 aboutScrapped = await pageOne.evaluate(el => el.textContent, pageOneElement)
					 consoleLog('=============DATA FOUND===================');
					
				consoleLog("About Product Data");
			//	consoleLog(aboutScrapped);
				consoleLog(typeof aboutScrapped)
				var json_verify = "YES";
				try {
						object = JSON.parse(aboutScrapped);
					} catch (error) {
						is_json = false;
						json_verify = "No";
					}
				consoleLog(json_verify)
				if(json_verify == "YES")
				{
			
				var aboutdata  = JSON.parse(aboutScrapped);
				aboutdata 	=	aboutdata.pageProps
				//consoleLog(aboutdata);
				//return false;
				if((aboutdata) && (aboutdata.mainItem) && (Object.keys(aboutdata.mainItem).length >0)){
				
				var ObjToInsert = {
					product_name				:   (productName) ? (productName) : "" ,	
					product_type				:	productType ? productType : "",
					product_slug				:	productSlug ? productSlug : "",
					url_id						:	productId	? ObjectId(productId) : "",
					url_used_for_scrpping		:	aboutGotoUrl ? aboutGotoUrl : "",	
					product_description			:	aboutdata.mainItem.description ? aboutdata.mainItem.description : "",
					product_tag_line			:	aboutdata.mainItem.tagLine ? aboutdata.mainItem.tagLine :"",
					product_short_description	:	aboutdata.mainItem.shortDescriptionOrTagLine ? aboutdata.mainItem.shortDescriptionOrTagLine : "",
					product_build_platform		:	aboutdata.mainItem.platformsWithNote ? aboutdata.mainItem.platformsWithNote : [],
					product_creator				:	aboutdata.mainItem.creator  ?  aboutdata.mainItem.creator : "",
					product_creator_URL			:	aboutdata.mainItem.creatorUrl ? aboutdata.mainItem.creatorUrl : "",      
					product_features			:	aboutdata.mainItem.features ? aboutdata.mainItem.features : [],					
					product_categories			:	aboutdata.mainItem.categories ? aboutdata.mainItem.categories : [], 
					product_tags				:	aboutdata.mainItem.tags ? aboutdata.mainItem.tags : [],
					product_external_links		:	aboutdata.mainItem.externalLinks ? aboutdata.mainItem.externalLinks : [],
					product_liscence_cost		:	aboutdata.mainItem.licenseCost ? aboutdata.mainItem.licenseCost : "" ,
					product_liscence_model		:	aboutdata.mainItem.licenseModel ? aboutdata.mainItem.licenseModel : "",
					product_alternative_count	:	aboutdata.mainItem.alternatives ? aboutdata.mainItem.alternatives : "",
					product_app_type			:	aboutdata.mainItem.appTypes ? aboutdata.mainItem.appTypes : [], 
					product_top_alternatives	:	aboutdata.mainItem.topAlternatives ? aboutdata.mainItem.topAlternatives : [], 
					product_pricing				:	aboutdata.mainItem.pricing ? aboutdata.mainItem.pricing : {},
					product_rating				:	aboutdata.mainItem.rating ? aboutdata.mainItem.rating : {},
					complete_json				:	aboutdata ? aboutdata : {},
					created 					: 	getUtcDate(),
					modified 					: 	getUtcDate(),
					is_processed				:	NOT_DELETED,
					is_url_active				:	ACTIVE,
					error_msg					:	'',	
					status						: 	ACTIVE,
					is_deleted					: 	NOT_DELETED,
					is_features_processed 		: 	NOT_DELETED,
					is_platforms_processed 		: 	NOT_DELETED,
					is_tags_processed 			: 	NOT_DELETED,
					tags_master 				: 	[],
					feature_master 				: 	[],
					platform_master 			: 	[]	
				};
				
			productsScraps.findOneAndUpdate(
											{"url_id":ObjectId(productId)},
											{$setOnInsert: ObjToInsert},
											{ upsert: true, new: true, runValidators: true },
											(err,result)=>{
					
					if(err) return next(err);
					//consoleLog(result);
					consoleLog("insertedId is====");
					consoleLog(result.lastErrorObject.upserted);
					// if(result.lastErrorObject.updatedExisting){
					// recorId = (result.value._id) ? result.value._id : "";
				// }else{
					// recorId = (result.lastErrorObject.upserted) ?  result.lastErrorObject.upserted : "";	
				// }
					if(result.lastErrorObject.upserted){
								productsUrlScraps.updateOne(
								{
									_id : ObjectId(productId)
								},{
									
									$set : {
										is_about_data_processed : ACTIVE,
										product_about_scrpped_id : ObjectId(result.insertedId),
										collection_name:tableName
									}
								},
								(err,result)=>{
									
								});
						
					}
				
					
				});
				}
				else{
					consoleLog("DATA key mainitem no found ");
					productsUrlScraps.updateOne(
											{
												_id : ObjectId(productId)
											},
											{
									
												$set : {
													is_skipped : ACTIVE,
													
												}
											},
											
											(err,result)=>{
												
												
											});
				}
				}else{
					consoleLog("json verify said no");
					productsUrlScraps.updateOne(
											{
												_id : ObjectId(productId)
											},
											{
									
												$set : {
													is_skipped : ACTIVE,
													
												}
											},
											
											(err,result)=>{
												
												
											});
				}
				}catch(err){
					consoleLog(err);
					
				}finally{
				
					await pageOne.close();
				  await browser.close();
			
				}
				})();	
				
				
				
				
			
			
		}else{
			consoleLog("Data not found");
			
		}			
		
		});
					
					
					
				
		
	}// end getDataForward
	


	

	
	/**
	 * Function for use to get the sitemap urls
	 
	 * @return render/json
	 */
	this.getSitemapXmls = (req,res) =>{
		
		const request = require('request');
		const cheerio = require('cheerio'); 
 
		const extractLinks = $ => [ 
			...new Set( 
				$('loc') 
					.map((_, a) => $(a).text()) // Extract the href (url) from each link 
					.toArray() // Convert cheerio object to array 
			), 
		]; 


		var headers = {
				'Accept': '*/*',
				'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
				'Connection': 'keep-alive',
				'Content-Type': 'application/x-www-form-urlencoded',
				'DNT': '1',
				'Origin': 'https://www.netflix.com',
				'Referer': 'https://www.netflix.com/browse/my-list',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
				'X-Netflix.browserName': 'Chrome',
				'X-Netflix.browserVersion': '75',
				'X-Netflix.clientType': 'akira',
				'X-Netflix.esnPrefix': 'NFCDCH-02-',
				'X-Netflix.osFullName': 'Windows 10',
				'X-Netflix.osName': 'Windows',
				'X-Netflix.osVersion': '10.0',
				'X-Netflix.playerThroughput': '58194',
				'X-Netflix.uiVersion': 'v73fa49e3',
				'cache-control': 'no-cache',
				'Cookie': ''}

				//var dataString = ';
				var options = {
				json: true,
				//url: 'https://alternativeto.net/sitemaps-ssl/sitemap-map.xml',
				url: 'https://api.proxycrawl.com/?token=_9ZPQy2qXAtWT8gXKCWvMA&url=https://alternativeto.net/sitemaps-ssl/sitemap-map.xml',
				method: 'GET',
				headers: headers,

				};





				request(options, function (error, response, body) {
					console.log('error:', error); // Print the error if one occurred
					console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
				
					consoleLog(response.body);
					const $ = cheerio.load(response.body); // Initialize cheerio 
					const links = extractLinks($); 
					consoleLog("final links are ");
					consoleLog(links);
	
	const ads = db.collection(TABLE_SCRAPPER_SITEMAP_XML_URLS);
	links.forEach(function (item, index) {
		
		  console.log(item, index);
		  	ads.insertOne({
					url					:	item,
					created 			: 	getUtcDate(),
					modified 			: 	getUtcDate(),
					is_processed		:	NOT_DELETED,
					is_url_active		:	ACTIVE,
					error_msg			:	'',	
					status				: 	ACTIVE,
					is_deleted			: 	NOT_DELETED						   
				},(err,result)=>{
					
					if(err) return next(err);
					
				});
		  
				});
				
				// console.log('body:', body); // Print the HTML for the Google homepage.
				});

				return false;
		
	}
	
	
	
	
	/**
	 * Function for use to get the get categories and insert them in scrapper table.
	 * used only once i.e. static url is used. 
	 * @return render/json
	 */
	this.getProductPlatformUrls = (req,res) =>{
		
		const request 		= require('request');
		const cheerio 		= require('cheerio'); 
		const siteMapXml 	= db.collection(TABLE_SCRAPPER_SITEMAP_XML_URLS);
		const productsScrps	= db.collection(TABLE_SCRAPPER_TAXONOMY_PLATFORM);
		let limit			= 	(req.body.length) 				? 	parseInt(req.body.length) 			:1;
			

		
						
		var sitemapUrl  = "https://alternativeto.net/sitemaps-ssl/startpage-map.xml";
		var sitemapId	= ObjectId("61d985b3187fba359c2af743");
			consoleLog("sitemapUrl is "+sitemapUrl);
			consoleLog("sitemapId is "+sitemapId);
							
		const extractLinks = $ => [ 
						...new Set( 
							$('loc') 
								.map((_, a) => $(a).text()) // Extract the href (url) from each link 
								.toArray() // Convert cheerio object to array 
						), 
					];
			var headers = {
				'Accept': '*/*',
				'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
				'Connection': 'keep-alive',
				'Content-Type': 'application/x-www-form-urlencoded',
				'DNT': '1',
				'Origin': 'https://www.netflix.com',
				'Referer': 'https://www.netflix.com/browse/my-list',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
				'X-Netflix.browserName': 'Chrome',
				'X-Netflix.browserVersion': '75',
				'X-Netflix.clientType': 'akira',
				'X-Netflix.esnPrefix': 'NFCDCH-02-',
				'X-Netflix.osFullName': 'Windows 10',
				'X-Netflix.osName': 'Windows',
				'X-Netflix.osVersion': '10.0',
				'X-Netflix.playerThroughput': '58194',
				'X-Netflix.uiVersion': 'v73fa49e3',
				'cache-control': 'no-cache',
				'Cookie': ''}

				//var dataString = ';
				var options = {
				json: true,
				//url: 'https://alternativeto.net/sitemaps-ssl/sitemap-map.xml',
				url: 'https://api.proxycrawl.com/?token=_9ZPQy2qXAtWT8gXKCWvMA&url='+sitemapUrl+'',
				method: 'GET',
				headers: headers,

				};
				
				request(options, function (error, response, body) {
					console.log('error:', error); // Print the error if one occurred
					console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
				
					
					const $ = cheerio.load(response.body); // Initialize cheerio 
					const links = extractLinks($); 
					consoleLog(links)

		if(links.length>0)
		{	
				
			siteMapXml.updateOne(
					{
						_id : ObjectId(sitemapId)
					},{
						
						$set : {
							is_processed : ACTIVE
						}
					},
					(err,result)=>{
						if(!err){
		links.forEach(function (item, index) {
		
		var productUrl 			= item;
		
		productUrl 				= productUrl.replace(/\/$/, "")
		var spliatedProductUrl  = productUrl.split("/");
		var arrayLengthUrl  	= spliatedProductUrl.length;
		var categorySlug ;
		var categoryName ;
		var categoryType;
		var parentCategory;
		
		if(arrayLengthUrl==5)
		{
			categorySlug 		= spliatedProductUrl[spliatedProductUrl.length-1];
			categoryName 		= toTitleCase(categorySlug.replace(/\-/g, ' '));
			categoryType 		= spliatedProductUrl[spliatedProductUrl.length-2];
			parentCategory		= DEACTIVE;
			
		}
		if(arrayLengthUrl==6)
		{
		 categorySlug 		= spliatedProductUrl[spliatedProductUrl.length-1];
		 categoryName 		= toTitleCase(categorySlug.replace(/\-/g, ' '));
		 categoryType 		= spliatedProductUrl[spliatedProductUrl.length-3];
		 parentCategory		= spliatedProductUrl[spliatedProductUrl.length-2];
			
		}
		
		
		consoleLog("categorySlug is "+categorySlug)
		consoleLog("categoryName is "+categoryName)
		consoleLog("categoryType is "+categoryType)
		consoleLog("parentCategory is "+parentCategory)
		consoleLog(spliatedProductUrl.length)
		//return false;
		
		
		
		

		  console.log(item, index);
		  	productsScrps.insertOne({
					scraper_url			:	item,
					platform_name		:	categoryName,
					platform_type		:	categoryType,
					platform_slug		:	categorySlug,
					sitemap_id			:	ObjectId(sitemapId),
					created 			: 	getUtcDate(),
					modified 			: 	getUtcDate(),
					is_processed		:	NOT_DELETED,
					is_url_active		:	ACTIVE,
					error_msg			:	'',	
					status				: 	ACTIVE,
					is_deleted			: 	NOT_DELETED						   
				},(err,result)=>{
					
					if(err) return next(err);
					
				});
		  
				});
						}
					
					
				});	
			

			
		}			
	
				});
			
			
			


	
	
	 


		return false;






				return false;
		
	}
	
	
	
	
	
	
	
	
	/**
	 * Function for use to get the get categories and insert them in scrapper table.
	 * used only once i.e. static url is used. 
	 * @return render/json
	 */
	this.getProductCategoriesUrls = (req,res) =>{
		
		const request 		= require('request');
		const cheerio 		= require('cheerio'); 
		const siteMapXml 	= db.collection(TABLE_SCRAPPER_SITEMAP_XML_URLS);
		const productsScrps	= db.collection(TABLE_SCRAPPER_CATEGORIES);
		let limit			= 	(req.body.length) 				? 	parseInt(req.body.length) 			:1;
			

		
						
		var sitemapUrl  = "https://alternativeto.net/sitemaps-ssl/categories.xml";
		var sitemapId	= ObjectId("61d985b3187fba359c2af744");
			consoleLog("sitemapUrl is "+sitemapUrl);
			consoleLog("sitemapId is "+sitemapId);
							
		const extractLinks = $ => [ 
						...new Set( 
							$('loc') 
								.map((_, a) => $(a).text()) // Extract the href (url) from each link 
								.toArray() // Convert cheerio object to array 
						), 
					];
			var headers = {
				'Accept': '*/*',
				'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
				'Connection': 'keep-alive',
				'Content-Type': 'application/x-www-form-urlencoded',
				'DNT': '1',
				'Origin': 'https://www.netflix.com',
				'Referer': 'https://www.netflix.com/browse/my-list',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
				'X-Netflix.browserName': 'Chrome',
				'X-Netflix.browserVersion': '75',
				'X-Netflix.clientType': 'akira',
				'X-Netflix.esnPrefix': 'NFCDCH-02-',
				'X-Netflix.osFullName': 'Windows 10',
				'X-Netflix.osName': 'Windows',
				'X-Netflix.osVersion': '10.0',
				'X-Netflix.playerThroughput': '58194',
				'X-Netflix.uiVersion': 'v73fa49e3',
				'cache-control': 'no-cache',
				'Cookie': ''}

				//var dataString = ';
				var options = {
				json: true,
				//url: 'https://alternativeto.net/sitemaps-ssl/sitemap-map.xml',
				url: 'https://api.proxycrawl.com/?token=_9ZPQy2qXAtWT8gXKCWvMA&url='+sitemapUrl+'',
				method: 'GET',
				headers: headers,

				};
				
				request(options, function (error, response, body) {
					console.log('error:', error); // Print the error if one occurred
					console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
				
					
					const $ = cheerio.load(response.body); // Initialize cheerio 
					const links = extractLinks($); 
					consoleLog(links)

		if(links.length>0)
		{	
				
			siteMapXml.updateOne(
					{
						_id : ObjectId(sitemapId)
					},{
						
						$set : {
							is_processed : ACTIVE
						}
					},
					(err,result)=>{
						if(!err){
		links.forEach(function (item, index) {
		
		var productUrl 			= item;
		
		productUrl 				= productUrl.replace(/\/$/, "")
		var spliatedProductUrl  = productUrl.split("/");
		var arrayLengthUrl  	= spliatedProductUrl.length;
		var categorySlug ;
		var categoryName ;
		var categoryType;
		var parentCategory;
		
		if(arrayLengthUrl==5)
		{
			categorySlug 		= spliatedProductUrl[spliatedProductUrl.length-1];
			categoryName 		= toTitleCase(categorySlug.replace(/\-/g, ' '));
			categoryType 		= spliatedProductUrl[spliatedProductUrl.length-2];
			parentCategory		= DEACTIVE;
			
		}
		if(arrayLengthUrl==6)
		{
		 categorySlug 		= spliatedProductUrl[spliatedProductUrl.length-1];
		 categoryName 		= toTitleCase(categorySlug.replace(/\-/g, ' '));
		 categoryType 		= spliatedProductUrl[spliatedProductUrl.length-3];
		 parentCategory		= spliatedProductUrl[spliatedProductUrl.length-2];
			
		}
		
		
		consoleLog("categorySlug is "+categorySlug)
		consoleLog("categoryName is "+categoryName)
		consoleLog("categoryType is "+categoryType)
		consoleLog("parentCategory is "+parentCategory)
		consoleLog(spliatedProductUrl.length)
		//return false;
		
		
		
		

		  console.log(item, index);
		  	productsScrps.insertOne({
					scraper_url			:	item,
					category_name		:	categoryName,
					category_type		:	categoryType,
					category_slug		:	categorySlug,
					parent_category		:	parentCategory,
					sitemap_id			:	ObjectId(sitemapId),
					created 			: 	getUtcDate(),
					modified 			: 	getUtcDate(),
					is_processed		:	NOT_DELETED,
					is_url_active		:	ACTIVE,
					error_msg			:	'',	
					status				: 	ACTIVE,
					is_deleted			: 	NOT_DELETED						   
				},(err,result)=>{
					
					if(err) return next(err);
					
				});
		  
				});
						}
					
					
				});	
			

			
		}			
	
				});
			
			
			


	
	
	 


		return false;






				return false;
		
	}
	
	
	
	
	
	/**
	 * Function for use to get the sitemap urls
	 
	 * @return render/json
	 */
	this.getProductUrls = (req,res) =>{
		
		const request 		= require('request');
		const cheerio 		= require('cheerio'); 
		const siteMapXml 	= db.collection(TABLE_SCRAPPER_SITEMAP_XML_URLS);
		const productsScrps	= db.collection(TABLE_SCRAPPER_PRODUCTS_URLS);
		let limit			= 	(req.body.length) 				? 	parseInt(req.body.length) 			:1;
			
		siteMapXml.find(
						{
							"is_processed":NOT_DELETED,
							"status":ACTIVE
						},
						{
							projection:{
											_id					:1,
											url					:1,
											created 			:1,
											modified 			:1,
											is_processed		:1,
											is_url_active		:1,
											error_msg			:1,	
											status				:1,
											is_deleted			:1			
										}
						}).collation(COLLATION_VALUE).limit(limit).toArray((err, result)=>{
		var productUrl 			= 'https://alternativeto.net/category/gaming-software/game-library-management/';
		productUrl 				= productUrl.replace(/\/$/, "")
		var spliatedProductUrl  = productUrl.split("/");
		
		var productSlug 		= spliatedProductUrl[spliatedProductUrl.length-1];
		var productName 		= toTitleCase(productSlug.replace('-', ' '));
		var productType 		= spliatedProductUrl[spliatedProductUrl.length-2];
		
		consoleLog(productSlug)
		consoleLog(productType)
		consoleLog(spliatedProductUrl.length)
		return false;
						
						//var sitemapUrl  = (result[0].url) 	 		? 	result[0].url				:"";
						var sitemapId	= (result[0]._id) 	 		? 	result[0]._id				:"";
							consoleLog("sitemapUrl is "+sitemapUrl);
							consoleLog("sitemapId is "+sitemapId);
							
		const extractLinks = $ => [ 
						...new Set( 
							$('loc') 
								.map((_, a) => $(a).text()) // Extract the href (url) from each link 
								.toArray() // Convert cheerio object to array 
						), 
					];
			var headers = {
				'Accept': '*/*',
				'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
				'Connection': 'keep-alive',
				'Content-Type': 'application/x-www-form-urlencoded',
				'DNT': '1',
				'Origin': 'https://www.netflix.com',
				'Referer': 'https://www.netflix.com/browse/my-list',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
				'X-Netflix.browserName': 'Chrome',
				'X-Netflix.browserVersion': '75',
				'X-Netflix.clientType': 'akira',
				'X-Netflix.esnPrefix': 'NFCDCH-02-',
				'X-Netflix.osFullName': 'Windows 10',
				'X-Netflix.osName': 'Windows',
				'X-Netflix.osVersion': '10.0',
				'X-Netflix.playerThroughput': '58194',
				'X-Netflix.uiVersion': 'v73fa49e3',
				'cache-control': 'no-cache',
				'Cookie': ''}

				//var dataString = ';
				var options = {
				json: true,
				//url: 'https://alternativeto.net/sitemaps-ssl/sitemap-map.xml',
				url: 'https://api.proxycrawl.com/?token=_9ZPQy2qXAtWT8gXKCWvMA&url='+sitemapUrl+'',
				method: 'GET',
				headers: headers,

				};
				
				request(options, function (error, response, body) {
					console.log('error:', error); // Print the error if one occurred
					console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
				
					
					const $ = cheerio.load(response.body); // Initialize cheerio 
					const links = extractLinks($); 
					consoleLog(links)

		if(links.length>0)
		{	
				
			siteMapXml.updateOne(
					{
						_id : ObjectId(sitemapId)
					},{
						
						$set : {
							is_processed : ACTIVE
						}
					},
					(err,result)=>{
						if(!err){
		links.forEach(function (item, index) {
		
		var productUrl 			= item;
		productUrl 				= productUrl.replace(/\/$/, "")
		var spliatedProductUrl  = productUrl.split("/");
		var productSlug 		= spliatedProductUrl[spliatedProductUrl.length-1];
		var productName 		= toTitleCase(productSlug.replace('-', ' '));
		var productType 		= spliatedProductUrl[spliatedProductUrl.length-2];

		  console.log(item, index);
		  	productsScrps.insertOne({
					scraper_url			:	item,
					product_name		:	productName,
					product_type		:	productType,
					product_slug		:	productSlug,
					sitemap_id			:	ObjectId(sitemapId),
					created 			: 	getUtcDate(),
					modified 			: 	getUtcDate(),
					is_processed		:	NOT_DELETED,
					is_url_active		:	ACTIVE,
					error_msg			:	'',	
					status				: 	ACTIVE,
					is_deleted			: 	NOT_DELETED						   
				},(err,result)=>{
					
					if(err) return next(err);
					
				});
		  
				});
						}
					
					
				});	
			

			
		}			
	
				});
			
			
			
		});

	
	
	 


		return false;






				return false;
		
	}
	





	/**
	 * Function for use to get move categories from category scrapper to main category table.
	 * @return render/json
	 */
	this.getCategories = (req,res) =>{
		
		const scrapperCategoryCollection 	= db.collection(TABLE_SCRAPPER_CATEGORIES);
		const categoryCollection			= db.collection(TABLE_PRODUCT_CATEGORIES);
		let limit							= 	(req.body.length) 				? 	parseInt(req.body.length) 			:1000;
			
		scrapperCategoryCollection.find(
						{
							"is_processed":NOT_DELETED,
							"status":ACTIVE,
						//	"parent_category":	DEACTIVE,		// for getting parent category data only.
						},
						{
							projection:{
											_id					:1,
											category_name		:1,
											category_type		:1,
											category_slug		:1,
											parent_category		:1,
											created 			:1,
											modified 			:1,
											is_processed		:1,
											is_url_active		:1,
											error_msg			:1,	
											status				:1,
											is_deleted			:1			
										}
						}).collation(COLLATION_VALUE).limit(limit).toArray((err, result)=>{
							
							
							/**For result data */
			async.each(result,(records, parentCallback)=>{
				
				consoleLog(result);
				var scrapperCategoryId		= (records._id)		?	records._id	:	"";
				var categorySlug 		= (records.category_slug)		?	records.category_slug	:	"";
				var parentCategoryFlag 	= (records.parent_category)		?	records.parent_category	:	"";
				var categoryName	 	= (records.category_name)		?	records.category_name	:	"";
				var categoryType	 	= (records.category_type)		?	records.category_type	:	"";
				
				var ObjToInsert			={
					category_name	:	toTitleCase(categoryName),
					category_type	:	categoryType.toLowerCase,
					slug			:	(categorySlug).toLowerCase(),
					status			:	ACTIVE,
					is_deleted		:	DEACTIVE,
					created 		: 	getUtcDate(),
					modified 		: 	getUtcDate(),
				}				
				
				if(parentCategoryFlag == DEACTIVE)
				{
					ObjToInsert['parent_id']	=	DEACTIVE;
					categoryCollection.insertOne(ObjToInsert,(err,result)=>{
					
					if(err) return next(err);
					
					if(result.insertedId){
							consoleLog("Insert id is "+result.insertedId);
								scrapperCategoryCollection.updateOne(
									{
										_id : ObjectId(scrapperCategoryId)
									},{
										
										$set : {
											is_processed : ACTIVE
										}
									},
									(err,result)=>{
										
										
									});
						}
						
						
						
					
				})
				}else{
				
					
					categoryCollection.findOne(
					{
						 slug								: 	parentCategoryFlag,
					},(err, parentCatResult)=>{
						ObjToInsert['parent_id']	=	ObjectId(parentCatResult._id);
						categoryCollection.insertOne(ObjToInsert,(err,result)=>{
					
								if(err) return next(err);
								
						if(result.insertedId){
							consoleLog("Insert id is "+result.insertedId);
								scrapperCategoryCollection.updateOne(
									{
										_id : ObjectId(scrapperCategoryId)
									},{
										
										$set : {
											is_processed : ACTIVE
										}
									},
									(err,result)=>{
										
										
									});
						}	
								
							})
						
					})
						
				}
				

		
				
				
			})
			return false;

			
		});

	
	
	 


		return false;






				return false;
		
	}
	
	
	
	
	
	/**
	 * Function for use to get move platforms from platforms scrapper to main platforms table.
	 * @return render/json
	 */
	this.getPlatforms = (req,res) =>{
		
		const scrapperPlatformCollection 	= db.collection(TABLE_SCRAPPER_TAXONOMY_PLATFORM);
		const platformCollection			= db.collection(TABLE_PRODUCT_PLATFORM);
		let limit							= 	(req.body.length) 				? 	parseInt(req.body.length) 			:1000;
			
		scrapperPlatformCollection.find(
						{
							"is_processed":NOT_DELETED,
							"status":ACTIVE,
						
						},
						{}).collation(COLLATION_VALUE).limit(limit).toArray((err, result)=>{
							
							consoleLog(result);
							//return false;
							/**For result data */
			async.each(result,(records, parentCallback)=>{
				
				consoleLog(result);
				var scrapperlatformId	= (records._id)		?	records._id	:	"";
				var platformSlug 		= (records.platform_slug)		?	records.platform_slug	:	"";
				var platformName	 	= (records.platform_name)		?	records.platform_name	:	"";
				var platformType	 	= (records.platform_type)		?	records.platform_type	:	"";
				
				var ObjToInsert			={
					platform_name	:	toTitleCase(platformName),
					platform_type	:	platformType.toLowerCase,
					slug			:	(platformSlug).toLowerCase(),
					status			:	ACTIVE,
					is_deleted		:	DEACTIVE,
					created 		: 	getUtcDate(),
					modified 		: 	getUtcDate(),
				}				
				

					
					platformCollection.insertOne(ObjToInsert,(err,result)=>{
					
					if(err) return next(err);
					
					if(result.insertedId){
							consoleLog("Insert id is "+result.insertedId);
								scrapperPlatformCollection.updateOne(
									{
										_id : ObjectId(scrapperlatformId)
									},{
										
										$set : {
											is_processed : ACTIVE
										}
									},
									(err,result)=>{
										
										
									});
						}
						
						
						
					
				})
				
				
			})
			return false;

			
		});

	
	
	 


		return false;






				return false;
		
	}
	
	
	
	
	
	this.cronSanitizeSetting = (req,res)=>{
		consoleLog("========================================== ");
		consoleLog("outside set interval ");
		getSantizedAlternativeData();
		//getSantizedData();
		// setInterval(function() {
		// 	getSantizedAlternativeData();
		// 		consoleLog("cron hit time in every EVEN min  "+currentTimeStamp()+"--");
		// }, 15000); // 60 * 1000 milsec
		
	}



	/**
	 * Function for use to get alternative product ids and update in product table 
	 * @return render/json
	 */
	let getSantizedAlternativeData = (req,res,next) =>{
		
		const scrapperPlatformCollection 	= db.collection("scrapper_products_scraps");
		const productsCollection 			= db.collection(TABLE_PRODUCTS);
		const tagsCollection 				= db.collection(TABLE_TAGS);
		const featuresCollection 			= db.collection(TABLE_FEATURES);
		const platformCollection			= db.collection(TABLE_PRODUCT_PLATFORM);
		
		let limit							= 	1;
		scrapperPlatformCollection.find(
		{
			"product_alternative_ids_processed"		:DEACTIVE,
			"product_alternative_table_processed"	:ACTIVE,
			"status"								:ACTIVE,
		//	"product_slug"							:"taskfully"
		},{limit:1}).toArray((err, scrapperResult)=>{	

			
		if(scrapperResult){
					
			async.eachSeries(scrapperResult, function iteratee(item, callback) 
			{
				var result = item;
								
				var scrapperAlternatives  	= 	result.product_alternative 	? result.product_alternative 	: [];	
				var scrapperProductId		=	result._id 					? result._id 	  				: [];	
				var productTableId			=	result.product_table_id 	? result.product_table_id 	  	: [];	
				var scrapperProductSlug 	=	result.product_slug 		? result.product_slug 			: {};	
				consoleLog("Product slug is "+scrapperProductSlug);
				
				var alternativeProductArray = [];
				var notAvailableDataSlugs = [];
				var responseData = {};
				
				/**For get more than one data */
		async.series([

		/* First callback for tags */
			(callback)=>{
				var alternativesLength = scrapperAlternatives.length;
				consoleLog(alternativesLength);
				if(alternativesLength>0){
							
				async.eachSeries(scrapperAlternatives, function iteratee(item, callback) 
				{
					consoleLog(item)
					let tagOptions = {"collection":"scrapper_products_scraps","name":item.slug,"column_name":"product_slug"}
					getProductIdBySlug(req,res,tagOptions).then((typeResponse)=>{
					var alernateproductId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result.product_table_id) : "";
					consoleLog("alernate product Id is "+alernateproductId);	
					if(alernateproductId == ""){
						notAvailableDataSlugs.push(item.slug);
					}else{
						alternativeProductArray.push(alernateproductId);
					}		
					
					callback(null);
					});	
					
				
				}, function done() {
					responseData["not_available_slugs"] = notAvailableDataSlugs;
					responseData["alternative_ids"] = alternativeProductArray;
					
					callback(null,responseData);
				});
						
				
				}else{
					
					callback(null);
				}	
				

			}

		],(err,response)=>{
			
		
			var alternativeproductsIdArray 	= (response && response[0] && response[0]) ? response[0].alternative_ids : [];
			var slugsNotAvailable		 	= (response && response[0] && response[0]) ? response[0].not_available_slugs : [];
			consoleLog(slugsNotAvailable)
			consoleLog(alternativeproductsIdArray)

			async.eachSeries(slugsNotAvailable, function iteratee(item, callback) 
			{  
				consoleLog(item)
				var scrapperProductUrlObj = {
				
					"scraper_url" : "https://alternativeto.net/software/"+item,
					"product_name" : toTitleCase(item),
					"product_type" : "software",
					"product_slug" : item,
					"sitemap_id" : "",
					"created" : getUtcDate(),
					"modified" : getUtcDate(),
					"is_processed" : DEACTIVE,
					"is_url_active" : ACTIVE,
					"error_msg" : "",
					"status" : ACTIVE,
					"is_deleted" : DEACTIVE,
					"is_about_data_processed" : DEACTIVE,
					"is_alternate_data_processed" : DEACTIVE,
					"product_about_scrpped_id" : "",
					"is_skipped" : DEACTIVE,
					"sequence_number" : ""
				}

				const productsUrlScraps		= 	db.collection(TABLE_SCRAPPER_PRODUCTS_URLS);
				productsUrlScraps.insertOne(scrapperProductUrlObj,(err,result)=>{
					if(err) return next(err);
					consoleLog("Product Url entry Done ")
					 callback(null);
				})
				
			
			}, function done() {
				consoleLog("Done functio called ")
				var alternativesCount = alternativeproductsIdArray.length;
				productsCollection.updateOne({"_id":ObjectId(productTableId)},{$set:{"product_alternative":alternativeproductsIdArray,"product_alternative_count":parseInt(alternativesCount)}},(err,updateResult)=>{
					if(err) return next(err);


					
					scrapperPlatformCollection.updateOne({"_id":ObjectId(scrapperProductId)},{$set:{"product_alternative_ids_processed":ACTIVE}},(err,updateResult)=>{
						if(err) return next(err);
						consoleLog("Product Url entry Done and Product alternatives entry done ")
						
						consoleLog("here for first callback")
						callback(null);

					});
					
				});
				
				
			});
			
			
		});
		
			
			}, function done() {
				consoleLog("All Records Inserted successfully. ");
				setTimeout(function () {
					getSantizedAlternativeData()
				}, 5000);
			});
		
		
			}else{
				
				consoleLog("No records found")
			}
			
			
		});
		return false;
		
	}
	







	
	/**
	 * Function for use to get move Products, add tags, features in main collections.
	 * @return render/json
	 */
	let getSantizedData = (req,res,next) =>{
		
		const scrapperPlatformCollection 	= db.collection("scrapper_products_scraps");
		const productsCollection 			= db.collection(TABLE_PRODUCTS);
		const tagsCollection 				= db.collection(TABLE_TAGS);
		const featuresCollection 			= db.collection(TABLE_FEATURES);
		const platformCollection			= db.collection(TABLE_PRODUCT_PLATFORM);
		
		let limit							= 	1;
		scrapperPlatformCollection.find(
		{
			"product_table_processed"	:NOT_DELETED,
			"status"					:ACTIVE,
			//	"product_slug"				:"taskfullyTEST"
		},{limit:50}).toArray((err, scrapperResult)=>{	
		
		if(scrapperResult){
					
			async.eachSeries(scrapperResult, function iteratee(item, callback) 
			{
				var result = item;
				
			
			
			
				//consoleLog(result)		
//return false;				
				var scrapperTags   		= 	result.product_tags 		? result.product_tags 	  : [];	
				var scrapperProductId	=	result._id 					? result._id 	  			: [];	
				var scrapperfeatures   	= 	result.product_features 	? result.product_features : [];		
				var scrapperCategories 	= 	result.product_categories 	? result.product_categories : [];	
				var scrapperPlatforms  	= 	result.complete_json.mainItem.platforms 	? result.complete_json.mainItem.platforms : [];	
				
				var	productScrapperId			=	result._id ? result._id 		: "" ;	
				var	productName					=   result.product_name ? result.product_name : "" ;	
				var productAlias			  	= 	result.complete_json.mainItem.nameAliases 	? result.complete_json.mainItem.nameAliases : [];	
				var productLikes			  	= 	result.complete_json.mainItem.likes 		? result.complete_json.mainItem.likes : 0;	
				
				var	productType					=   result.product_type ? result.product_type : "";
				
				var	productDescription			=	result.product_description ? result.product_description : "";
				var	productTagLine				=	result.product_tag_line ? result.product_tag_line :"";
				var	productShortDescription		=	result.product_short_description ? result.product_short_description : "";
				var	productBuildPlatform		=	result.product_build_platform ? result.product_build_platform : [];
				var	productCreator				=	result.product_creator  ?  result.product_creator : "";
				var	productCreatorURL			=	result.product_creator_URL ? result.product_creator_URL : "";      
				
				var	productExternalLinks		=	result.product_external_links ? result.product_external_links : [];
				var	productLiscenceCost			=	result.product_liscence_cost ? result.product_liscence_cost : "" ;
				var	productLiscenceModel		=	result.product_liscence_model ? result.product_liscence_model : "";
				var	productAlternativeCount		=	result.product_alternative_count ? result.product_alternative_count : "";
				var	productAppType				=	result.product_app_type ? result.product_app_type : []; 
				var	productTopAlternatives		=	result.product_top_alternatives ? result.product_top_alternatives : []; 
				var	productPricing				=	result.product_pricing ? result.product_pricing : {};
				var	productRating				=	result.product_rating ? result.product_rating : {};
				var scrapperProductSlug 		=	result.product_slug ? result.product_slug : {};	
				consoleLog("Product slug is "+scrapperProductSlug);
				// consoleLog("============scrapperTags=============")
				// consoleLog(scrapperTags);
				// consoleLog("============scrapperfeatures=============")
				// consoleLog(scrapperfeatures);
				// consoleLog("============scrapperCategories=============")
				// consoleLog(scrapperCategories);
			//	 consoleLog("============scrapperPlatforms=============")
			//	 consoleLog(scrapperPlatforms);
			//	 return false;
				var tagsArray = [];
				var featuresArray = [];
				var categoryArray = [];
				var platformArray = [];
				/**For get more than one data */
		async.series([
		/* First callback for tags */
			(callback)=>{
				var tagsLength = scrapperTags.length;
				consoleLog(tagsLength);
				if(tagsLength>0){
					
			async.eachSeries(scrapperTags, function iteratee(item, callback) 
			{
				consoleLog(item)
				let tagOptions = {"tags_data":item}
				insertTags(req,res,next,tagOptions).then((typeResponse)=>{
				 var tagsId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result) : "";
				 consoleLog("Tag id is "+tagsId);			
				 tagsArray.push(tagsId);
				 callback(null);
				});	
				
			
			}, function done() {
				callback(null,tagsArray);
			});
					
				return false;	
			// scrapperTags.map((typeRecords,index)=>{
			
			// let tagOptions = {"tags_data":typeRecords}
			// insertTags(req,res,next,tagOptions).then((typeResponse)=>{
				// var tagsId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result) : "";
							
							// tagsArray.push(tagsId);
							// consoleLog(tagsArray)
							
					// if((index+1) == tagsLength){
							// callback(null,tagsArray);
						// }			
						// })
								
				// });
				}else{
					callback(null,tagsArray);
				}	
				

			},
			/* Second callback for Features */
			(callback)=>{
			var featureLength = scrapperfeatures.length;
			if(featureLength>0){
			
			async.eachSeries(scrapperfeatures, function iteratee(item, callback) 
			{
				consoleLog(item)
				let featuresOptions = {"features_data":item}
				insertFeatures(req,res,next,featuresOptions).then((typeResponse)=>{
				 var featureId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result) : "";
				 consoleLog("Feature id is "+featureId);			
				 featuresArray.push(featureId);
				 callback(null);
				});	
				
			
			}, function done() {
				callback(null,featuresArray);
			});
				
				
			// scrapperfeatures.map((typeRecords,index)=>{
			
			// let featuresOptions = {"features_data":typeRecords}
			// insertFeatures(req,res,next,featuresOptions).then((typeResponse)=>{
							// var tagsId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result) : "";
							
							// featuresArray.push(tagsId);
							// consoleLog(featuresArray)
							
					// if((index+1) == featureLength){
							// callback(null,featuresArray);
						// }			
						// })
								
				// });
			}else{
				callback(null,featuresArray);
			}
				
			},
			/* third callback for categories */
			(callback)=>{
			var categoryLength = scrapperCategories.length;
			if(categoryLength>0){
			
			async.eachSeries(scrapperCategories, function iteratee(item, callback) 
			{
				consoleLog(item)
				let categoriesOptions = {"category_data":item}
				insertCategories(req,res,next,categoriesOptions).then((typeResponse)=>{
				 var categoryId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result) : "";
				 consoleLog("Category id is "+categoryId);			
				 categoryArray.push(categoryId);
				 callback(null);
				});	
				
			
			}, function done() {
				callback(null,categoryArray);
			});
				
			// scrapperCategories.map((typeRecords,index)=>{
			
			// let categoriesOptions = {"category_data":typeRecords}
			// insertCategories(req,res,next,categoriesOptions).then((typeResponse)=>{
							// var tagsId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result) : "";
							
							// categoryArray.push(tagsId);
							// consoleLog(categoryArray)
							
					// if((index+1) == categoryLength){
							// callback(null,categoryArray);
						// }			
						// })
								
				// });
			}else{
				callback(null,categoryArray);
				
			}
				
			},
			/* third callback for platforms */
			(callback)=>{
			var platformLength = scrapperPlatforms.length;
			if(platformLength>0){
				
			async.eachSeries(scrapperPlatforms, function iteratee(item, callback) 
			{
				consoleLog(item)
				let platformOptions = {"platform_data":item}
				insertPlatforms(req,res,next,platformOptions).then((typeResponse)=>{
				 var platformId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result) : "";
				 consoleLog("Platform id is "+platformId);			
				 platformArray.push(platformId);
				 callback(null);
				});	
				
			
			}, function done() {
				callback(null,platformArray);
			});
			
			// scrapperPlatforms.map((typeRecords,index)=>{
			
			// let platformOptions = {"platform_data":typeRecords}
			// insertPlatforms(req,res,next,platformOptions).then((typeResponse)=>{
							// var tagsId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result) : "";
							
							// platformArray.push(tagsId);
							// consoleLog(platformArray)
							
					// if((index+1) == platformLength){
							// callback(null,platformArray);
						// }			
						// })
								
				// });
			}else{
				callback(null,platformArray);
				
			}
				
			}

		],(err,response)=>{
			
			var tagsIdArray 	= (response && response[0] && response[0]) ? response[0] : [];
			var featureIdArray 	= (response && response[1] && response[1]) ? response[1] : [];
			var categoryIdArray = (response && response[2] && response[2]) ? response[2] : [];
			var platformIdArray = (response && response[3] && response[3]) ? response[3] : [];
			var sanitizedProductName = productName.replace(/\-/g," ");
			consoleLog("tagsIdArray is ")
			consoleLog(tagsIdArray)
			let slugOptions = {
									title 		:	sanitizedProductName,
									table_name 	: 	TABLE_PRODUCTS,
									slug_field 	: 	"product_slug"
								};
								
			getDatabaseSlug(slugOptions).then((slugResponse)=>{
				var productSlug = 	(slugResponse && slugResponse.title)	?	slugResponse.title	:"";					
							
			var productObjectToInsert = {	
					product_scrapper_id			:	productScrapperId,	
					product_name				:   productName ,	
					product_alias				:	productAlias,
					product_likes				:	productLikes,
					product_type				:   productType,
					product_slug				:  (slugResponse && slugResponse.title)	?	slugResponse.title	:"",
					product_description			:	productDescription,
					product_tag_line			:	productTagLine,
					product_short_description	:	productShortDescription,
					product_build_platform		:	productBuildPlatform,
					product_creator				:	productCreator,
					product_creator_URL			:	productCreatorURL,      
					product_features			:	featureIdArray,					
					product_categories			:	categoryIdArray, 
					product_tags				:	tagsIdArray,
					product_platform			:	platformIdArray,
					product_external_links		:	productExternalLinks,
					product_liscence_cost		:	productLiscenceCost,
					product_liscence_model		:	productLiscenceModel,
					product_alternative_count	:	productAlternativeCount,
					product_app_type			:	productAppType, 
					product_top_alternatives	:	productTopAlternatives, 
					product_pricing				:	productPricing,
					product_rating				:	productRating,
					created 					: 	getUtcDate(),
					modified 					: 	getUtcDate(),
					is_processed				:	NOT_DELETED,
					is_url_active				:	ACTIVE,
					error_msg					:	'',	
					status						: 	ACTIVE,
					is_deleted					: 	NOT_DELETED			
				}
				
		productsCollection.findOneAndUpdate(
						{"product_slug":scrapperProductSlug},
						{$setOnInsert: productObjectToInsert},
						{ upsert: true, new: true, runValidators: true },
					(err,productResult)=>{
					consoleLog(productResult)
					//return false;
					if(err) return next(err);
					var productInsertedId = "";
					if(productResult.lastErrorObject.updatedExisting){
					productInsertedId = (productResult.value._id) ? productResult.value._id : "";
					
					scrapperPlatformCollection.updateOne({_id : productScrapperId },{$set:{is_duplicate:ACTIVE}},(err,result)=>{
						
						consoleLog("===============XXXXXXXXXXXXXXXXXXXXX=========================== ");
					if(err) return next(err);
					
					});
					}else{
						productInsertedId = (productResult.lastErrorObject.upserted) ?  productResult.lastErrorObject.upserted : "";	
					}
					
					scrapperPlatformCollection.updateOne({_id : productScrapperId },{$set:{product_table_processed:ACTIVE,product_table_id:ObjectId(productInsertedId) }},(err,result)=>{
						
						consoleLog("===============XXXXXXXXXXXXXXXXXXXXX=========================== ");
					if(err) return next(err);
					
					});
					
				});				
						
						
						});
			
			
			
			
		});
				consoleLog("scrapper Product Id is "+item._id)	
				callback(null);
			
			}, function done() {
				consoleLog("All Records Inserted successfully. ");
			});
		
		
			}else{
				
				consoleLog("No records found")
			}
			
			
		});
		return false;
		
	}
	
	

		
	this.cronMergeDataSetting = (req,res)=>{
		consoleLog("========================================== ");
		consoleLog("outside set interval ");
		mergeCollections();
		//getSantizedData();
		// setInterval(function() {
		// 	getSantizedAlternativeData();
		// 		consoleLog("cron hit time in every EVEN min  "+currentTimeStamp()+"--");
		// }, 15000); // 60 * 1000 milsec
		
	}


	
	
let mergeCollections = (req,res)=>{
		consoleLog("mergeCollections function was called at "+currentTimeStamp());
		consoleLog("======================== ");
		const scrapperProductUrlCollection 	= db.collection(TABLE_SCRAPPER_PRODUCTS_URLS);
		const scrapperProductCollection 	= db.collection("scrapper_products_scraps_2");
		const productCollection 			= db.collection("scrapper_products_scraps");
		
		scrapperProductCollection.find({"data_merged":DEACTIVE}).limit(500).toArray((err,result)=>{
			if(err) return next(err);
			
		async.eachSeries(result, function iteratee(item, callback) 
		{	
			consoleLog("Product Name is "+item.product_name)
			var productId = item._id;
			
			delete item._id;
			
			productCollection.insertOne(item,(err,result)=>{
				if(err) return next(err);
				scrapperProductCollection.updateOne({"_id":ObjectId(productId)},{$set:{"data_merged":ACTIVE}},(err,updateResult)=>{
					if(err) return next(err);


					callback(null)
					
				});
				
			});
			
				
		}, function done() {
			consoleLog("Collection merged successfully.")
			setTimeout(function () {
                mergeCollections();
            }, 5000);

		});
			
		})
				
	}



	
	
this.addSequenceNumber = (req,res)=>{
		consoleLog("addSequenceNumber function was called at "+currentTimeStamp());
		consoleLog("======================== ");
		const scrapperProductUrlCollection 	= db.collection(TABLE_SCRAPPER_PRODUCTS_URLS);
		const scrapperProductCollection 	= db.collection(TABLE_SCRAPPER_PRODUCTS_SCRAPS);
		const productCollection 			= db.collection("scrapper_products_scraps");
		
		productCollection.find({"sequence_number":DEACTIVE}).limit(5000).toArray((err,result)=>{
			if(err) return next(err);
			
			var i = 1;
		async.eachSeries(result, function iteratee(item, callback) 
		{	
		consoleLog("Product Id is "+item._id)
		consoleLog("Value of I "+i)
			productCollection.updateOne({
				_id : ObjectId(item._id)
			},{$set:{
				sequence_number : parseInt(i)
				
			}},(err,updateResult)=>{
				i++;
				callback(null)
				// setTimeout(function () {
				// 	callback(null)
				// }, 2000);

				
				
			})
		
		}, function done() {
			consoleLog("Sequence added in all records")
		});
			
		})
				
	}
	
	
	
	

this.testTags= (req,res,next)=>{

var item =  { "type" : "Regular",
					"likes" : 0,
					"appTypePopularity" : 0,
					"titleOption" : 0,
					"urlName" : "online-c++-compiler"
				}
let tagOptions = {"tags_data":item}
consoleLog(tagOptions)	
insertTags(req,res,next,tagOptions).then((typeResponse)=>{
 var tagsId = (typeResponse && typeResponse.result && typeResponse.result) ? (typeResponse.result) : "";
 consoleLog("Tag id is "+tagsId);			
 tagsArray.push(tagsId);
 callback(null);
});
				
				
}	
	
	
	
	
this.test= (req,res,next)=>{
	consoleLog("test alled");
	const puppeteer = require('puppeteer');
	
	var aboutGotoUrl = "https://www.google.com/search?q=pupeeter+not+pening+broswer";
	var browser="";
	var pageOne="";
	consoleLog("GOT URL");
	
	(async () => {
				try{
					consoleLog('=============Launching Browser===================');

					 browser = await puppeteer.launch( {
						headless: false,  //change to true in prod!
						    args: [
								'--no-sandbox',
								'--disable-gpu',
								'--disable-dev-shm-usage',
								'--disable-setuid-sandbox',
								'--no-first-run',
								'--no-zygote',
								'--single-process',
								"--proxy-server='direct://'",
								'--proxy-bypass-list=*'
							  ],
							timeout: 0,
					}); 
					
					consoleLog('=============Page Opening iN Browser===================');
					consoleLog((await browser.pages()).length)
					 pageOne = await browser.newPage(); 
					 consoleLog('=============HIT URL  iN Browser===================');
					await pageOne.goto(aboutGotoUrl,{'timeout': 25000});
					
					 
					 consoleLog('=============WWAIT FOR RESULT===================');
				//	await pageOne.waitForSelector('body',{visible: true,})
					//await pageOne.click(".iDjcJe.IX9Lgd.wwB5gf")
					const selectors = await pageOne.$$('.iDjcJe.IX9Lgd.wwB5gf')
					await selectors[1].click()
					await selectors[2].click()
					
					//await pageOne.click(".iDjcJe.IX9Lgd.wwB5gf:nth-child(2)")
					 consoleLog('=============HIT Anchor tag   iN Browser===================');
					   await pageOne.waitForSelector('div.iDjcJe.IX9Lgd.wwB5gf span')
						await pageOne.waitFor(5000); 
					  var linkTextsQuestions = await pageOne.$$eval("div.iDjcJe.IX9Lgd.wwB5gf span",
                elements=> elements.map(item=>item.textContent))
					 var linkTextsAnswers = await pageOne.$$eval("div.MBtdbb",
                elements=> elements.map(item=>item.textContent))
					
					 consoleLog('=============DATA FOUND===================');
					
				consoleLog("About Product Data");
				consoleLog(linkTextsQuestions);
				consoleLog(linkTextsAnswers);
				var aboutdata  = JSON.parse(linkTextsQuestions);
				var aboutdata1  = JSON.parse(linkTextsAnswers);
				consoleLog(aboutdata);
				consoleLog(aboutdata1);
		//		aboutdata 	=	aboutdata.pageProps
		//		consoleLog(aboutdata);
				return false;
				
					await pageOne.close();
				  await browser.close();
				  
				  
				}catch(e)
				{
					consoleLog(e)
				}
				
				
		})()	;		

	
}
	
	
	
}
module.exports = new Crons();




