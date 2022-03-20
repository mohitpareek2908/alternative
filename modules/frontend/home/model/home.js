var async = require('async');
const userService = require(WEBSITE_SERVICES_FOLDER_PATH+'user_service');
function Home() {
	
	
	/**
	 * Function for use about us page
	 
	 * @return render/json
	 */
	this.aboutUsPage = (req, res) => {
		
		var languageCode =  DEFAULT_LANGUAGE_MONGO_ID;
		let limit			= 	ADMIN_LISTING_LIMIT;
		try {
			async.parallel({
				
				'about_us_intro_data': function(callback) {
					const collection = db.collection(TABLE_BLOCK);
					collection.findOne({block_slug:'about-us-intro'},{projection:{block_name:1,description:1,blocks_descriptions:1}},(errBannerData, resultBannerData)=>{
						if (resultBannerData && Object.keys(resultBannerData).length > 0) {
							resultBannerData['block_name'] = (resultBannerData.blocks_descriptions[languageCode].block_name) ? resultBannerData.blocks_descriptions[languageCode].block_name : resultBannerData.block_name;
							resultBannerData['description'] = (resultBannerData.blocks_descriptions[languageCode].description) ? resultBannerData.blocks_descriptions[languageCode].description : resultBannerData.description;
						}	
						callback(errBannerData, resultBannerData);
					});
				},
				'about_us_know_this_first_data': function(callback) {
					const collection = db.collection(TABLE_BLOCK);
					collection.findOne({block_slug:'about-us-know-this-first'},{projection:{block_name:1,description:1,blocks_descriptions:1}},(errBannerData, resultBannerData)=>{
						if (resultBannerData && Object.keys(resultBannerData).length > 0) {
							resultBannerData['block_name'] = (resultBannerData.blocks_descriptions[languageCode].block_name) ? resultBannerData.blocks_descriptions[languageCode].block_name : resultBannerData.block_name;
							resultBannerData['description'] = (resultBannerData.blocks_descriptions[languageCode].description) ? resultBannerData.blocks_descriptions[languageCode].description : resultBannerData.description;
						}	
						callback(errBannerData, resultBannerData);
					});
				},
				'about_us_vision_data': function(callback) {
					const collection = db.collection(TABLE_BLOCK);
					collection.findOne({block_slug:'about-us-vision'},{projection:{block_name:1,description:1,blocks_descriptions:1}},(errBannerData, resultBannerData)=>{
						if (resultBannerData && Object.keys(resultBannerData).length > 0) {
							resultBannerData['block_name'] = (resultBannerData.blocks_descriptions[languageCode].block_name) ? resultBannerData.blocks_descriptions[languageCode].block_name : resultBannerData.block_name;
							resultBannerData['description'] = (resultBannerData.blocks_descriptions[languageCode].description) ? resultBannerData.blocks_descriptions[languageCode].description : resultBannerData.description;
						}	
						callback(errBannerData, resultBannerData);
					});
				},
				'about_us_mission_data': function(callback) {
					const collection = db.collection(TABLE_BLOCK);
					collection.findOne({block_slug:'about-us-mission'},{projection:{block_name:1,description:1,blocks_descriptions:1}},(errBannerData, resultBannerData)=>{
						if (resultBannerData && Object.keys(resultBannerData).length > 0) {
							resultBannerData['block_name'] = (resultBannerData.blocks_descriptions[languageCode].block_name) ? resultBannerData.blocks_descriptions[languageCode].block_name : resultBannerData.block_name;
							resultBannerData['description'] = (resultBannerData.blocks_descriptions[languageCode].description) ? resultBannerData.blocks_descriptions[languageCode].description : resultBannerData.description;
						}	
						callback(errBannerData, resultBannerData);
					});
				},
				'testimonial_data': function(callback) {
					const collection = db.collection(TABLE_TESTIMONIALS);
					collection.find({is_active:ACTIVE},{projection:{name:1,description:1,image:1,pages_descriptions:1}}).limit(limit).toArray((errBannerData, resultBannerData)=>{
							
						callback(errBannerData, resultBannerData);
					});
				},
				'about_us_team_data': function(callback) {
					const collection = db.collection(TABLE_BLOCK);
					collection.findOne({block_slug:'about-us-team'},{projection:{block_name:1,description:1,blocks_descriptions:1}},(errBannerData, resultBannerData)=>{
						if (resultBannerData && Object.keys(resultBannerData).length > 0) {
							resultBannerData['block_name'] = (resultBannerData.blocks_descriptions[languageCode].block_name) ? resultBannerData.blocks_descriptions[languageCode].block_name : resultBannerData.block_name;
							resultBannerData['description'] = (resultBannerData.blocks_descriptions[languageCode].description) ? resultBannerData.blocks_descriptions[languageCode].description : resultBannerData.description;
						}	
						callback(errBannerData, resultBannerData);
					});
				},
				
	
				
				/** Get the Download App Now data  **/
				'uzube-download-app': function(callback) {
					const collection = db.collection(TABLE_BLOCK);
					collection.findOne({block_slug:'uzube-download-app'},{projection:{block_name:1,description:1,blocks_descriptions:1}},(errDownloadTheAppNow, resultDownloadTheAppNow)=>{
						if (resultDownloadTheAppNow && Object.keys(resultDownloadTheAppNow).length > 0) {
							resultDownloadTheAppNow['block_name'] = (resultDownloadTheAppNow.blocks_descriptions[languageCode].block_name) ? resultDownloadTheAppNow.blocks_descriptions[languageCode].block_name : resultDownloadTheAppNow.block_name;
							resultDownloadTheAppNow['description'] = (resultDownloadTheAppNow.blocks_descriptions[languageCode].description) ? resultDownloadTheAppNow.blocks_descriptions[languageCode].description : resultDownloadTheAppNow.description;
						}	
						callback(errDownloadTheAppNow, resultDownloadTheAppNow);
					});
				},
			},function (err, response) {
			//	consoleLog( response['uzube-download-app']);
				if (!err) {
					/** render on home page **/
					res.render("about", {	
						about_us_intro						: (response['about_us_intro_data']) 				? response['about_us_intro_data'] 				: {},
						about_us_know_this_first			: (response['about_us_know_this_first_data']) 		? response['about_us_know_this_first_data'] 	: {},
						about_us_vision						: (response['about_us_vision_data']) 		? response['about_us_vision_data'] 	: {},
						about_us_mission					: (response['about_us_mission_data']) 		? response['about_us_mission_data'] 	: {},
						testimonial							: (response['testimonial_data']) 		? response['testimonial_data'] 	: {},
						about_us_team						: (response['about_us_team_data']) 		? response['about_us_team_data'] 	: {},
						download_app						: (response['uzube-download-app']) 		? response['uzube-download-app'] 	: {},
						pageName				: 'About',					
					});
				} else {
					res.render("about", { 
						about_us_intro				:	{},
						about_us_know_this_first	:	{},
						about_us_vision				:	{},
						about_us_mission			:	{},
						testimonial					:	{},
						about_us_team				:	{},
						pageName					: 	'About',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
	};//End aboutUsPage()


	/**
	 * Function for use FAQ Search result page
	 
	 * @return render/json
	 */
	this.faqPageSearch = (req, res) => {
		
		consoleLog("FAQ function called in model");
		if(isPost(req)){
			
			let skip		 =	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			let title		 =	(req.body.title) 	?	(req.body.title)			: "";
			var languageCode =  DEFAULT_LANGUAGE_MONGO_ID;
			let limit			= 	FAQ_LIMIT;
			let commonConditions = {is_active:ACTIVE};
			if(title !="")
			{
				//"/" + title + "/i"
				commonConditions['question']= { $regex : new RegExp(title, "i") };
			}
			
			
		const collection = db.collection(TABLE_FAQS);
		try {
			async.parallel({
				'faq_data': function(callback) {
					
					collection.find(commonConditions,{projection:{question:1,answer:1}}).toArray((errBannerData, resultBannerData)=>{
							
						callback(errBannerData, resultBannerData);
					});
				},
				'total_records': function(callback) {
						collection.countDocuments(commonConditions,(err,countResult)=>{
							callback(err, countResult);
						});
					},
			},function (err, response) {
				 
				if (!err) {
					/** render on home page **/
					res.render("faq", {	
						faq_data						: (response['faq_data']) 				? response['faq_data'] 				: {},
						totalRecords					: (response['total_records']) 	? response['total_records'] : 0,
						totalRecodsShown				:	(response['total_records']) 	? response['total_records'] : 0,
						title							:	title,
						pageName						: 'FAQ',					
					});
				} else {
					res.render("faq", { 
						faq_data					:	{},
						pageName					: 	'FAQ',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
			
			
			
			
			
			
			
			
			
		}else{
				
		var languageCode =  DEFAULT_LANGUAGE_MONGO_ID;
		let limit			= 	FAQ_LIMIT;
		const collection = db.collection(TABLE_FAQS);
		try {
			async.parallel({
				'faq_data': function(callback) {
					
					collection.find({is_active:ACTIVE},{projection:{question:1,answer:1}}).limit(limit).toArray((errBannerData, resultBannerData)=>{
							
						callback(errBannerData, resultBannerData);
					});
				},
				'total_records': function(callback) {
						collection.countDocuments({is_active:ACTIVE},(err,countResult)=>{
							callback(err, countResult);
						});
					},
			},function (err, response) {
				 
				if (!err) {
					/** render on home page **/
					res.render("faq", {	
						faq_data						: (response['faq_data']) 				? response['faq_data'] 				: {},
						totalRecords					: (response['total_records']) 	? response['total_records'] : 0,
						totalRecodsShown				:	limit,
						pageName						: 'FAQ',					
					});
				} else {
					res.render("faq", { 
						faq_data					:	{},
						pageName					: 	'FAQ',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
		
		
		
		}			
		
	};//End aboutUsPage()



	/**
	 * Function for use FAQ page
	 * @return render/json
	 */
	this.faqPage = (req, res) => {
		
		let title		 =	(req.body.title) 	?	(req.body.title)			: "";
		if(isPost(req)){
			let limit		 = 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
			let skip		 =	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			
			let commonConditions = {is_active:ACTIVE};
			if(title !="")
			{
				//"/" + title + "/i"
				commonConditions['question']= { $regex : new RegExp(title, "i") };
			}
			consoleLog(req.body);
			consoleLog(commonConditions);
			const collection = db.collection(TABLE_FAQS);
			try {
			async.parallel({
				'faq_data': function(callback) {
				
					collection.find(commonConditions,{projection:{question:1,answer:1}}).skip(skip).limit(limit).toArray((errBannerData, resultBannerData)=>{
					consoleLog(resultBannerData);
					var resHtml = '';
						resultBannerData.map(resultBannerData => {
							var question = (resultBannerData.question) ? resultBannerData.question 	: "";
							var answer = (resultBannerData.answer) ? resultBannerData.answer 	: "";
							
							resHtml += '<div class="accrodion ">'+
										'<div class="accrodion-inner">'+
											'<div class="accrodion-title">'+
												'<h4>'+question+'</h4>'+
											'</div>'+
											'<div class="accrodion-content">'+
												'<div class="inner">'+
													'<p>'+answer+'</p>'+
												'</div>'+
											'</div>'+
										'</div>'+
									'</div>';
					
							
						});
						
							
							
						callback(errBannerData, resHtml);
					});
				},
				'total_records': function(callback) {
						collection.countDocuments({is_active:ACTIVE},(err,countResult)=>{
							callback(err, countResult);
						});
					},
			},function (err, response) {
				 
				if (!err) {
					/** render on home page **/
					res.send({	
						status							: (!err) 						? STATUS_SUCCESS 			: STATUS_ERROR,
						faq_data						: (response['faq_data']) 		? response['faq_data'] 		: {},
						totalRecords					: (response['total_records']) 	? response['total_records'] : 0,
						totalRecodsShown				:	limit+skip,
						title							: title,
						pageName						: 'FAQ',					
					});
				} else {
					res.render("faq", { 
						faq_data					:	{},
						pageName					: 	'FAQ',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
		
		
		
			
			
		}else{
				
		var languageCode =  DEFAULT_LANGUAGE_MONGO_ID;
		let limit			= 	FAQ_LIMIT;
		const collection = db.collection(TABLE_FAQS);
		try {
			async.parallel({
				'faq_data': function(callback) {
					
					collection.find({is_active:ACTIVE},{projection:{question:1,answer:1}}).limit(limit).toArray((errBannerData, resultBannerData)=>{
							
						callback(errBannerData, resultBannerData);
					});
				},
				'total_records': function(callback) {
						collection.countDocuments({is_active:ACTIVE},(err,countResult)=>{
							callback(err, countResult);
						});
					},
			},function (err, response) {
				 
				if (!err) {
					/** render on home page **/
					res.render("faq", {	
						faq_data						: (response['faq_data']) 				? response['faq_data'] 				: {},
						totalRecords					: (response['total_records']) 	? response['total_records'] : 0,
						totalRecodsShown				:	limit,
						title							: title,
						pageName						: 'FAQ',					
					});
				} else {
					res.render("faq", { 
						faq_data					:	{},
						pageName					: 	'FAQ',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
		
		
		
		}			
		
	};//End aboutUsPage()




	/**
	 * Function for getting cms page data
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.cmsDetail = (req, res, next) => {
		//return res.render("pages", { result: {} });
		let slug = (req.params.slug) ? req.params.slug : "";
		var languageCode =  DEFAULT_LANGUAGE_MONGO_ID;
		let limit			= 	ADMIN_LISTING_LIMIT;
		
		
		if (!slug) {
			return res.render("404");
		}
		try {
			const pages = db.collection(TABLE_PAGES);
			pages.findOne({ slug: slug }, {}, (err, result) => {
				const collection = db.collection(TABLE_BLOCK);

				
						
					
					if (result && Object.keys(result).length > 0) {
					result['name'] = (result.name) ? result.name : result.name;
					result['body'] = (result.body) ? result.body : result.body;
					
					consoleLog(result);
					//return false;
					return res.render("pages", { result: result,
					pageName					: 	slug,
						
					});
				} else {
					req.rendering.views		=	WEBSITE_LAYOUT_PATH;

							/**Render 404 page*/
							res.render("404",{
								layout : false
							});
				}
				
				
					
					

		
					
					
				
			});
		} catch (e) {
			return res.render("404");
		}
	};//End cmsDetail()
	
	
	/** 
 	* Function to submit Newsletter Subscribe
 	* **/
	this.newsletterSubscribe = (req,res,next,callback)=>{
		let email = (req.body.email) ? (req.body.email) :"";
		const collection = db.collection(TABLE_NEWSLETTER_SUBSCRIBERS);
		if(email){
			collection.find({
				is_deleted 	: 	NOT_DELETED,
				status		:	ACTIVE,
				$or			: [
					{ email: { $regex: "^" + email + "$", $options: "i" } }
				]
			},{
				projection : { _id: 1, email: 1} 
			}).toArray((resultErr,resultSuccess)=>{
				if (resultErr) {
					return res.send({
						status	: STATUS_ERROR_INVALID_ACCESS,
						message	: res.__("front.system.something_going_wrong_please_try_again1")
					});
				}
				
				if(resultSuccess.length >0){
					// console.log(resultSuccess);
					let resultMail 	 	= (resultSuccess[0].email) 			? resultSuccess[0].email.toLowerCase()	: "";
					let enteredMail  	= email.toLowerCase();
					if (resultMail == enteredMail) {
						return res.send({
							status	: STATUS_ERROR,
							message	: res.__("admin.newsletter.your_email_id_is_already_exist"),
						});
					}
				}else{
					consoleLog("entered email address is "+email);
					const unirest			=	require('unirest');
					const mailchimpApiKey	=	res.locals.settings["Mailchimp.API_KEY"];
					const mailchimpInstance	=	res.locals.settings["Mailchimp.INSTANCE"];
					const mailchimpListId	=	res.locals.settings["Mailchimp.UNIQUE_LIST_ID"];
					const mailchimpUrl		=	'https://'+mailchimpInstance+'.api.mailchimp.com/3.0/lists/'+mailchimpListId+'/members/';
					const encodedApiKey 	=	Buffer.from('any:' +mailchimpApiKey, 'binary').toString('base64');
					let reqMailchimp = unirest('POST', mailchimpUrl)
					.headers({
						'Content-Type': 'application/json;charset=utf-8',
						'Authorization':'Basic '+ encodedApiKey
					})
					.send({
						"email_address":email,
						"status":"subscribed"
					})
					.end(function (response) {
						console.log("mailchimpApiKey "+mailchimpApiKey);
						console.log(response.error);
						if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
							
							let insertData = {
								email		: email,
								is_deleted	: NOT_DELETED,
								status		: ACTIVE,
								created 	: getUtcDate(),
								modified 	: getUtcDate()
							}
							
							collection.insertOne(insertData,(err,result)=>{
								if (err) {
									// Send error response
									return res.send({
										status	: STATUS_ERROR,
										message	: res.__("system.something_going_wrong_please_try_again"),
									});
								}

								res.send({
									status 		: STATUS_SUCCESS,
									message 	: res.__("front.newsletter.subscribes_successfully"),
								});
							})
						} else {
							return res.send({
								status	: STATUS_ERROR,
								message	: res.__("system.something_going_wrong_please_try_again"),
							});
						}		
					});
					/**/
				}
			})
		}else{
			return res.send({
				status	: STATUS_ERROR,
				message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("system.something_going_wrong_please_try_again")}]
			});
		}
		
	} // End newsletterSubscribe()
	
	/**
	 * Function for adding review request 
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	 this.addReviewrating = (req, res, next) => {
		let languageCode = DEFAULT_LANGUAGE_MONGO_ID;
		consoleLog("add review rating function ");
		consoleLog(req.body);
		consoleLog(req.params);

		if (isPost(req)) {

			/** Sanitize Data */
			req.body = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
			/** parse Validation array  */
			let errors = [];


			if (errors.length>0) {
				/** Send error response */
				return res.send({
					status: STATUS_ERROR,
					message: errors,
				});
			}
			
			let productId    	= (req.params.id) 			? req.params.id			 			: "";
			let fullName    	= (req.body.full_name) 		? req.body.full_name 				: "";
			let email 			= (req.body.email) 			? req.body.email 					: "";
			let message 		= (req.body.message) 		? req.body.message 					: "";
			let rating 			= (req.body.rating) 		? req.body.rating					: "";
		
			/** Save review details */
			const revewRating = db.collection(TABLE_REVIEW_RATING);
			var insertTobe = {
				name			: fullName.toLowerCase(),
				email			: email.toLowerCase(),
				message			: message,
				rating			: rating,
				product_id		: ObjectId(productId),	
				type			: REVIEW_TYPE_NEW,		
				status			: ACTIVE,
				is_approved		: DEACTIVE,
				api_type		: "front",
				user_type		: "other",
				is_deleted		: NOT_DELETED,
				created			: getUtcDate(),
				modified		: getUtcDate()
			};


			revewRating.insertOne(insertTobe, (err) => {
				consoleLog("error i s");
				consoleLog(err);
				if(err) return next(err);
					
				// /** Set options for send email ***/
				// let emailOptions = {
				// 	to: res.locals.settings["Site.admin_email"],
				// 	action: "contact_us",
				// 	rep_array: [fullName, subject, message],
				// };
					
				// /** Send email **/
				// sendMail(req, res, emailOptions);
				
				/** Send success response */
				req.flash(STATUS_SUCCESS, res.__("front.review.review_has_been_added_successfully_wating_for_admin_approval"));
			return	res.send({
					status: STATUS_SUCCESS,
					redirect_url: 'pages/thank-you',
					message: res.__("front.review.review_has_been_added_successfully_wating_for_admin_approval")
				});
				
			});
		} 
	};//End contactUs()




	/**
	 * Function for getting product detail page data
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.productDetailsData = (req, res) => {

		var languageCode = (typeof res.locals.default_language !== typeof undefined) ? res.locals.default_language : DEFAULT_LANGUAGE_MONGO_ID;
		let limit		 = 	3;
		const collection =  db.collection(TABLE_PRODUCTS);
		let slug		 =	(req.params.slug) 	?	(req.params.slug)			: "";
		//var slug 		 = "netflix";

		if(isPost(req)){
			let limit		 = 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
			let skip		 =	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			let totalRecordsShown = limit+skip;
			consoleLog("value of skip is "+skip)
			
		try {
			async.parallel({
				
					/** Get home banner data **/
				'demo_data': function(callback) {
					
					collection.aggregate([
						{
							$match : {product_slug:slug}
						},
						{$lookup : {
							from 			: TABLE_REVIEW_RATING,
							localField 		: "_id",
							foreignField 	: "product_id",
							as 				: "review_details",
						}},
						{$project:{
							"product_reviews"		: {
								"$slice": ["$review_details",skip, 5]
							},
							"product_review_details"		: "$review_details",
						}},
					]).toArray((errDemoReviewData,resultDemoReviewData)=>{

						var reviewData = resultDemoReviewData[0].product_reviews;
						var toalReviews = resultDemoReviewData[0].product_review_details;
						var resHtml = '';
						reviewData.map(resultProductData => {
						var reviewerName = (resultProductData.name) ? resultProductData.name 	: "";
						var reviewMessage = (resultProductData.message) ? resultProductData.message 	: "";
						var reviewRating=	(resultProductData.rating) ? resultProductData.rating 	: "";
				
					



						resHtml += '<div class="bg-white p-3 rounded mt-2"><div class="row">'+
							'<div class="col-md-9 border-right">'+
								'<div class="lisproduct_external_linksting-title">'+
									'<h2>'+reviewerName+'</h2>'+
								'</div>'+
								'<div class="description">'+
									'<p>'+reviewMessage+'</p>'+
								'</div>'+
							 '</div>'+
							'<div class="d-flex col-md-3">'+
								'<div class="d-flex flex-column justify-content-start user-profile w-100">'+
									'<div class="progresses" ><span><i class="bi bi-star-fill text-success"></i>'+reviewRating+'</span>'+
										'<div class="progress mt-1" style="height: 5px;">'+
											'<div class="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>'+
										'</div>'+
									'</div>'+
									'<div class="progresses"><span><i class="bi bi-calendar3 text-success"></i> 27 Aug 2022 </span>'+
										'<div class="progress mt-1" style="height: 5px;">'+
											'<div class="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>'+
										'</div>'+
									'</div>'+
									'<div class="progresses"><span><i class="bi bi-hand-thumbs-up-fill text-success"></i> 24</span>'+
										'<div class="progress mt-1" style="height: 5px;">'+
											'<div class="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>'+
										'</div>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>'+
					'</div>';
									
											
										});


						var responseData = {"reviews_string":resHtml,"total_reviews":toalReviews,"total_reviews_shown":reviewData}
							
						
							callback(errDemoReviewData, responseData);
						});
				},
				
			}, function (err, response) {
				
			
				var totalReviewsShown	 					= (response.demo_data) ? (response.demo_data.total_reviews_shown).length	: [];	
				var totalReviewsExists	 					= (response.demo_data) ? (response.demo_data.total_reviews).length 	: [];	

				if (!err) {
					/** render on home page **/ 
					res.send({
						status							: (!err) 						? STATUS_SUCCESS 			: STATUS_ERROR,
						demo_reviews_data							: (response.demo_data.reviews_string) 				? response.demo_data.reviews_string 				: [],
						total_reviews_on_products				: totalReviewsExists,
						total_reviews_on_products_shown			: totalRecordsShown,
						pageName							: 'Product Details',
					});
				} else {
					/** render on home page **/
					res.render("demo", {
						demo_reviews_data							:	[],
						total_reviews_on_products				: [],
						total_reviews_on_products_shown			: [],
						pageName							: 	'Product Details',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
	}else{

		try {
			async.parallel([
				
				/** Get home banner data **/
				(callback)=>{
					
					collection.aggregate([
					{
						$match : {product_slug:slug}
					},
					{$lookup : {
						from 			: TABLE_TAGS,
						localField 		: "product_tags",
						foreignField 	: "_id",
						as 				: "tags_details",
					}},
					{$lookup : {
						from 			: TABLE_FEATURES,
						localField 		: "product_features",
						foreignField 	: "_id",
						as 				: "feature_details",
					}},
					{$lookup : {
						from 			: TABLE_PRODUCT_PLATFORM,
						localField 		: "product_platform",
						foreignField 	: "_id",
						as 				: "platform_details",
					}},
					{$lookup : {
						from 			: TABLE_PRODUCT_CATEGORIES,
						localField 		: "product_categories",
						foreignField 	: "_id",
						as 				: "category_details",
					}},
					{$lookup : {
						from 			: TABLE_REVIEW_RATING,
						localField 		: "_id",
						foreignField 	: "product_id",
						as 				: "review_details",
					}},
					{$lookup : {
						from 			: TABLE_PRODUCTS,
						localField 		: "product_alternative",
						foreignField 	: "_id",
						as 				: "product_alternative_details",
					}},
					{$sort: {"product_alternative_details.product_alternative_count": -1}},
					{$project:{
						"_id"             			:1,
						"product_name"				:1,
						"product_tag_line"			:1,
						"product_description"		:1,
						"product_alternative_count"	:1,
						"product_creator"			:1,
						"product_liscence_cost"		:1,
						"product_type"				:1,
						"product_external_links"	:1,
						"product_slug"				:1,
						"is_deleted"       			:1,
						"status"					:1,
						"is_processed"				:1,
						"is_url_active"				:1,
						"created"					:1,
						"modified"					:1,
						"product_features"			: "$feature_details",
						"product_tags"				: "$tags_details",
						"product_platforms"			: "$platform_details",
						"product_category"			: "$category_details",
					//	"review_details"			: "$review_details",
						"product_alternative"		: {
							"$slice": ["$product_alternative_details", 10]
						},
						"product_review_details"		: {
							"$slice": ["$review_details", 5]
						},
					}},
				]).toArray((errDemoData,resultDemoData)=>{
						
				//	consoleLog(resultDemoData)
						callback(errDemoData, resultDemoData);
					});
				},

				(callback)=>{
					
					collection.aggregate([
					{
						$match : {product_slug:slug}
					},
					{$lookup : {
						from 			: TABLE_REVIEW_RATING,
						localField 		: "_id",
						foreignField 	: "product_id",
						as 				: "review_details",
					}},
					{$project:{
						"product_review_details"		: "$review_details",
					}},
				]).toArray((errDemoReviewData,resultDemoReviewData)=>{
						
					
						callback(errDemoReviewData, resultDemoReviewData);
					});
				},
				
			], (err, response)=>{
			
		
				var totalReviewsShown	 					= (response[0][0]) ? (response[0][0].product_review_details).length	: [];	
				var totalReviewsExists	 					= (response[1][0]) ? (response[1][0].product_review_details).length 	: [];	
				
				if (!err) {
					/** render on home page **/ 
					res.render("demo", {
						demo_data								: (response[0][0]) 				? response[0][0]				: [],
						total_reviews_on_products				: totalReviewsExists,
						total_reviews_on_products_shown			: totalReviewsShown,
						pageName								: 'Product Details',
					});
				} else {
					/** render on home page **/
					res.render("demo", {
						demo_data							:	[],
						pageName							: 	'Product Details',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}


	}


	};//End productDetailsData()
	
	
	
	
	/**
	 * Function for getting prodct tags category and features data for home page 
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.productHomeData = (req, res) => {

		var languageCode = (typeof res.locals.default_language !== typeof undefined) ? res.locals.default_language : DEFAULT_LANGUAGE_MONGO_ID;
		let limit			= 	3;
		const collection 			=  db.collection(TABLE_PRODUCTS);
		const collectionFeatures 	= db.collection(TABLE_FEATURES);
		const collectionPlatforms 	= db.collection(TABLE_PRODUCT_PLATFORM);
		const collectionTags 		= db.collection(TABLE_TAGS);
		const collectionCategories	= db.collection(TABLE_PRODUCT_CATEGORIES);
		
		var slug = "netflix";
		//console.log("languageCode "+languageCode);
		try {
			async.parallel({
				
					/** Get home banner data **/
				'popular_products': function(callback) {
				collection.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).limit(16).sort({"product_alternative_count":-1}).toArray((errDemoData, resultDemoData)=>{
					
					
						callback(errDemoData, resultDemoData);
					});
				},
				
				'popular_platforms': function(callback) {
					collectionPlatforms.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).limit(16).toArray((errProductPlatformData, resultProductPlatformData)=>{
						callback(errProductPlatformData, resultProductPlatformData);
					});
				},
				
				'popular_features': function(callback) {
					collectionFeatures.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).limit(16).toArray((errProductFeaturesData, resultProductFeaturesData)=>{
						callback(errProductFeaturesData, resultProductFeaturesData);
					});
				},
				
				'popular_tags': function(callback) {
					collectionTags.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).limit(16).toArray((errProductTagsData, resultProductTagsData)=>{
						callback(errProductTagsData, resultProductTagsData);
					});
				},
				
				'popular_categories': function(callback) {
					
					collectionCategories.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE,
							"parent_id":DEACTIVE
						},
						{}).limit(16).toArray((errProductCategoryData, resultProductCategoryData)=>{
							
						callback(errProductCategoryData, resultProductCategoryData);
					});
				},
				
				
				'faq_data': function(callback) {
					const collection = db.collection(TABLE_FAQS);
					collection.find({is_active:ACTIVE},{projection:{question:1,answer:1}}).limit(limit).toArray((errBannerData, resultBannerData)=>{
							
						callback(errBannerData, resultBannerData);
					});
				},
				
			}, function (err, response) {
				// consoleLog(response.popular_categories)
				//return false;
				
				if (!err) {
					/** render on home page **/ 
					res.render("demo-home", {
						demo_data							: (response['popular_products']) 				? response['popular_products'] 				: {},
						demo_popular_platform_data			: (response['popular_platforms']) 				? response['popular_platforms'] 	: {},
						demo_popular_category_data			: (response['popular_categories']) 				? response['popular_categories'] 	: {},
						demo_popular_features_data			: (response['popular_features']) 				? response['popular_features'] 		: {},
						demo_popular_tags_data				: (response['popular_tags']) 					? response['popular_tags'] 	: {},
						home_faq_data						: (response['faq_data']) 						? response['faq_data'] 		: {},
						pageName							: 'home',
					});
				} else {
					/** render on home page **/
					res.render("demo-home", {
						demo_data							:	{},
						demo_popular_platform_data			:	{},
						demo_popular_category_data			:	{},
						demo_popular_features_data			:	{},
						demo_popular_tags_data				:	{},
						home_faq_data						:	{},
						pageName							: 	'home',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
	};//End productHomeData()
	
	
	
	/**
	 * Function for getting product listing data 
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.productListData = (req, res) => {

		var languageCode = (typeof res.locals.default_language !== typeof undefined) ? res.locals.default_language : DEFAULT_LANGUAGE_MONGO_ID;
		let limit			= 	21;
		const collection 			=  db.collection(TABLE_PRODUCTS);
		const collectionFeatures 	= db.collection(TABLE_BLOCK);
		const collectionPlatforms 	= db.collection(TABLE_PRODUCT_PLATFORM);
		const collectionTags 		= db.collection(TABLE_BLOCK);
		const collectionCategories	= db.collection(TABLE_PRODUCT_CATEGORIES);
		
		
		if(isPost(req)){
			let limit		 = 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
			let skip		 =	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			let title		 =	(req.body.product_title) 	?	(req.body.product_title)			: "";
			let totalRecordsShown = limit+skip;
			let commonConditions = {is_deleted:DEACTIVE,status:ACTIVE};
				if(title !="")
				{
					//"/" + title + "/i"
					commonConditions['product_name']= { $regex : new RegExp(title, "i") };
				}
		
				try {
				async.parallel({
					
				'products': function(callback) {
					collection.find(
							commonConditions,
							{}).sort({product_alternative_count:-1}).skip(skip).limit(limit).toArray((errDemoData, resultDemoData)=>{
								consoleLog("demo data on load more ");
								consoleLog(resultDemoData)
								var resHtml = '';
									resultDemoData.map(resultProductData => {
					var productName = (resultProductData.product_name) ? resultProductData.product_name 	: "";
					var productShortDescription = (resultProductData.product_tag_line) ? resultProductData.product_tag_line 	: "";
					var productAlternateCount=	(resultProductData.product_alternative_count) ? resultProductData.product_alternative_count 	: "";
					var productIconLetter	=	productName.charAt(0);
					var productDetailUrl= WEBSITE_URL+"product-details/"+resultProductData.product_slug;
										
					resHtml += '<div class="col-md-4">'+
					'<a href="'+productDetailUrl+'">'+
					   '<div class="card p-3">'+
							'<div class="d-flex justify-content-between align-items-center">'+
							'<div class="numberCircle">'+productIconLetter+'</div>'+
							'<button class="btn-alternate-count btn-sm ">'+
							'Available Alternatives: '+productAlternateCount+'</button>'+
							
							 '</div>'+ 
							'<span class="google mt-3"><h2 class="text-dark" >'+productName+'</h2></span>'+ 
							'<span class="text mt-2 text-secondary">'+productShortDescription+'</span>'+
						'</div>'+
					'</a>'+
					'</div>';
		
								
										
									});
						
							callback(errDemoData, resHtml);
						});
					},
					'total_products': function(callback) {
							collection.countDocuments(commonConditions,(err,countResult)=>{
								callback(err, countResult);
							});
						},
				},function (err, response) {
					
					if (!err) {
						/** render on home page **/
						res.send({	
							status							: (!err) 						? STATUS_SUCCESS 			: STATUS_ERROR,
							total_products					: (response['total_products']) 					? response['total_products'] 		: {},
							demo_products_data				: (response['products']) 						? response['products'] 				: {},
							total_recods_shown				:	totalRecordsShown,
							pageName						: 'Products List',		
						});
					} else {
						res.render("faq", { 
						total_products						:	{},
						total_recods_shown					:	{},
						demo_products_data					:	{},
						demo_popular_platform_data			:	{},
						demo_popular_category_data			:	{},
						pageName							: 	'Products List',
						});
					}
				});
			} catch (e) {
				console.log(e)
				return res.render("404", { result: "" })
			}
		
		
		}else{
							try {
			async.parallel({
				
				/** Get home banner data **/
				'products': function(callback) {
				collection.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).sort({product_alternative_count:-1}).limit(limit).toArray((errDemoData, resultDemoData)=>{
					
					
						callback(errDemoData, resultDemoData);
					});
				},
				'total_products': function(callback) {
						collection.countDocuments({"is_deleted":NOT_DELETED,"status":ACTIVE},(err,countResult)=>{
							callback(err, countResult);
						});
					},
				'popular_platforms': function(callback) {
					collectionPlatforms.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).limit(limit).toArray((errProductPlatformData, resultProductPlatformData)=>{
						callback(errProductPlatformData, resultProductPlatformData);
					});
				},
				
				'popular_features': function(callback) {
					collectionFeatures.findOne({block_slug:'home-best-application'},{projection:{block_name:1,description:1,blocks_descriptions:1}},(errBannerData, resultBannerData)=>{
						if (resultBannerData && Object.keys(resultBannerData).length > 0) {
							resultBannerData['block_name'] = (resultBannerData.blocks_descriptions[languageCode].block_name) ? resultBannerData.blocks_descriptions[languageCode].block_name : resultBannerData.block_name;
							resultBannerData['description'] = (resultBannerData.blocks_descriptions[languageCode].description) ? resultBannerData.blocks_descriptions[languageCode].description : resultBannerData.description;
						}	
						callback(errBannerData, resultBannerData);
					});
				},
				
				'popular_tags': function(callback) {
					collectionTags.findOne({block_slug:'home-gift-rewards'},{projection:{block_name:1,description:1,blocks_descriptions:1}},(errBannerData, resultBannerData)=>{
						if (resultBannerData && Object.keys(resultBannerData).length > 0) {
							resultBannerData['block_name'] = (resultBannerData.blocks_descriptions[languageCode].block_name) ? resultBannerData.blocks_descriptions[languageCode].block_name : resultBannerData.block_name;
							resultBannerData['description'] = (resultBannerData.blocks_descriptions[languageCode].description) ? resultBannerData.blocks_descriptions[languageCode].description : resultBannerData.description;
						}	
						callback(errBannerData, resultBannerData);
					});
				},
				
				'popular_categories': function(callback) {
					
					collectionCategories.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE,
							"parent_id":DEACTIVE
						},
						{}).limit(16).toArray((errProductCategoryData, resultProductCategoryData)=>{
							
						callback(errProductCategoryData, resultProductCategoryData);
					});
				},
				
			}, function (err, response) {
			
				consoleLog(response);
				if (!err) {
					/** render on home page **/ 
					res.render("demo-products-list", {
						total_products						: (response['total_products']) 					? response['total_products'] 		: {},
						demo_products_data					: (response['products']) 						? response['products'] 				: {},
						demo_popular_platform_data			: (response['popular_platforms']) 				? response['popular_platforms'] 	: {},
						demo_popular_category_data			: (response['popular_categories']) 				? response['popular_categories'] 	: {},
						total_recods_shown					:	limit,
						pageName							: 'Products List',
					});
				} else {
					/** render on home page **/
					res.render("demo-products-list", {
						total_products						:	{},
						total_recods_shown					:	{},
						demo_products_data					:	{},
						demo_popular_platform_data			:	{},
						demo_popular_category_data			:	{},
						pageName							: 	'Products List',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
			
		}	

	};//End productListData()
	
	
	
	/**
	 * Function for getting platform list data  
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.platformsListData = (req, res) => {

		var languageCode 			= (typeof res.locals.default_language !== typeof undefined) ? res.locals.default_language : DEFAULT_LANGUAGE_MONGO_ID;
		let limit					= 	21;
		const collection 			=  db.collection(TABLE_PRODUCTS);
		const collectionFeatures 	= db.collection(TABLE_BLOCK);
		const collectionPlatforms 	= db.collection(TABLE_PRODUCT_PLATFORM);
		const collectionTags 		= db.collection(TABLE_BLOCK);
		const collectionCategories	= db.collection(TABLE_PRODUCT_CATEGORIES);
		
			if(isPost(req)){
			let limit		 = 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
			let skip		 =	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			let title		 =	(req.body.product_platform) 	?	(req.body.product_platform)			: "";
			let totalRecordsShown = limit+skip;
			let commonConditions = {is_deleted:DEACTIVE,status:ACTIVE};
				if(title !="")
				{
					//"/" + title + "/i"
					commonConditions['platform_name']= { $regex : new RegExp(title, "i") };
				}
			
				
				try {
				async.parallel({
					
				'platforms': function(callback) {
					collectionPlatforms.find(
							commonConditions,
							{}).sort({product_count:-1}).skip(skip).limit(limit).toArray((errDemoData, resultDemoData)=>{
								consoleLog("demo data on load more ");
								consoleLog(resultDemoData)
								var resHtml = '';
					resultDemoData.map(resultPlatformData => {
					var platformName 			= (resultPlatformData.platform_name) ? resultPlatformData.platform_name 	: "";
					
					var platformProductCount	=	(resultPlatformData.product_count) ? resultPlatformData.product_count 	: 0;
					var platformIconLetter		=	platformName.charAt(0);
					var platformProductListUrl		= WEBSITE_URL+"product-list/"+TAXONOMY_TYPE_PLATFORM+"/"+resultPlatformData.slug;
								
					resHtml +='<div class="col-md-4">'+
					'<a href="'+platformProductListUrl+'">'+
						'<div class="card p-3">'+
							'<div class="d-flex justify-content-between align-items-center"> '+
							'<div class="numberCircle">'+platformIconLetter+'</div>'+
							'<button class="btn-alternate-count btn-sm ">'+
							'Products Count: '+platformProductCount+'</button> '+
							 '</div>'+ 
							'<span class="google mt-2"><h2 class="text-dark">'+platformName+'</h2></span>'+ 
					   '</div>'+
					'</a>'+
				   ' </div>';
	
									});
						
							callback(errDemoData, resHtml);
						});
					},
					'total_platforms': function(callback) {
							collectionPlatforms.countDocuments(commonConditions,(err,countResult)=>{
								callback(err, countResult);
							});
						},
				},function (err, response) {
					
					if (!err) {
						/** render on home page **/
						res.send({	
							status							: (!err) 						? STATUS_SUCCESS 			: STATUS_ERROR,
							total_platforms					: (response['total_platforms']) 					? response['total_platforms'] 		: {},
							demo_platforms_data				: (response['platforms']) 						? response['platforms'] 				: {},
							total_recods_shown				:	totalRecordsShown,
							pageName						: 'Platform List',		
						});
					} else {
						res.render("demo-platform-list", { 
						total_products						:	{},
						total_recods_shown					:	{},
						demo_platforms_data					:	{},
						pageName							: 	'Platform List',
						});
					}
				});
			} catch (e) {
				console.log(e)
				return res.render("404", { result: "" })
			}
		
		
		}else{
			try {
			async.parallel({
				
				/** Get home banner data **/
				'platforms': function(callback) {
				collectionPlatforms.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).sort({product_count:-1}).limit(limit).toArray((errDemoData, resultDemoData)=>{
					
					
						callback(errDemoData, resultDemoData);
					});
				},
				'total_platforms': function(callback) {
						collectionPlatforms.countDocuments({"is_deleted":NOT_DELETED,"status":ACTIVE},(err,countResult)=>{
							callback(err, countResult);
						});
					},
				
				
				
				
			}, function (err, response) {
				
				
				if (!err) {
					/** render on home page **/ 
					res.render("demo-platform-list", {
						total_platforms						: (response['total_platforms']) 				? response['total_platforms'] 		: {},
						demo_platforms_data					: (response['platforms']) 						? response['platforms'] 				: {},
						total_recods_shown					:	limit,
						pageName							: 'Platform List',
					});
				} else {
					/** render on home page **/
					res.render("demo-platform-list", {
						total_platforms						:	{},
						total_recods_shown					:	{},
						demo_platforms_data					:	{},
						pageName							: 	'Platform List',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
			
		}	

	};//End platformsListData()
	
	
	
	
	
	/**
	 * Function for getting category Listin data 
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.categoriesListData = (req, res) => {

		var languageCode = (typeof res.locals.default_language !== typeof undefined) ? res.locals.default_language : DEFAULT_LANGUAGE_MONGO_ID;
		let limit			= 	21;
		const collection 			=  db.collection(TABLE_PRODUCTS);
		const collectionFeatures 	= db.collection(TABLE_BLOCK);
		const collectionPlatforms 	= db.collection(TABLE_PRODUCT_PLATFORM);
		const collectionTags 		= db.collection(TABLE_BLOCK);
		const collectionCategories	= db.collection(TABLE_PRODUCT_CATEGORIES);
		
		if(isPost(req)){
			let limit		 = 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
			let skip		 =	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			let title		 =	(req.body.product_category) 	?	(req.body.product_category)			: "";
			let totalRecordsShown = limit+skip;
			let commonConditions = {is_deleted:DEACTIVE,status:ACTIVE};
				if(title !="")
				{
					//"/" + title + "/i"
					commonConditions['category_name']= { $regex : new RegExp(title, "i") };
				}
				consoleLog(req.body);
				consoleLog(commonConditions);
				
				try {
				async.parallel({
					
				'categories': function(callback) {
					collectionCategories.find(
							commonConditions,
							{}).sort({product_count:-1}).skip(skip).limit(limit).toArray((errDemoData, resultDemoData)=>{
								consoleLog("demo data on load more ");
								consoleLog(resultDemoData)
								var resHtml = '';
					resultDemoData.map(resultCategoryData => {
					var categoryName 			= (resultCategoryData.category_name) ? resultCategoryData.category_name 	: "";
					
					var categoryProductCount	=	(resultCategoryData.product_count) ? resultCategoryData.product_count 	: 0;
					var categoryIconLetter		=	categoryName.charAt(0);
					var categoryProductListUrl		= WEBSITE_URL+"product-list/"+TAXONOMY_TYPE_CATEGORY+'/'+resultCategoryData.slug;
						
					resHtml +='<div class="col-md-4">'+
					'<a href="'+categoryProductListUrl+'">'+
						'<div class="card p-3">'+
							'<div class="d-flex justify-content-between align-items-center"> '+
							'<div class="numberCircle">'+categoryIconLetter+'</div>'+
							'<button class="btn-alternate-count btn-sm ">'+
							'Products Count: '+categoryProductCount+'</button> '+
							 '</div>'+ 
							'<span class="google mt-2"><h2 class="text-dark">'+categoryName+'</h2></span>'+ 
					   '</div>'+
					'</a>'+
				   ' </div>';
	
									});
						
							callback(errDemoData, resHtml);
						});
					},
					'total_categories': function(callback) {
							collectionCategories.countDocuments(commonConditions,(err,countResult)=>{
								callback(err, countResult);
							});
						},
				},function (err, response) {
					 consoleLog("response on load more ");
					 consoleLog(response);
					if (!err) {
						/** render on home page **/
						res.send({	
							status							: (!err) 						? STATUS_SUCCESS 			: STATUS_ERROR,
							total_categories				: (response['total_categories']) 					? response['total_categories'] 		: {},
							demo_category_data				: (response['categories']) 						? response['categories'] 				: {},
							total_recods_shown				:	totalRecordsShown,
							pageName						: 'Category List',		
						});
					} else {
						res.render("demo-category-list", { 
						total_products						:	{},
						total_recods_shown					:	{},
						demo_category_data					:	{},
						demo_popular_platform_data			:	{},
						demo_popular_category_data			:	{},
						pageName							: 	'Products List',
						});
					}
				});
			} catch (e) {
				console.log(e)
				return res.render("404", { result: "" })
			}
		
		
		}else{
		try {
			async.parallel({
				
				/** Get home banner data **/
				'categories': function(callback) {
				collectionCategories.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).sort({product_count:-1}).limit(limit).toArray((errDemoData, resultDemoData)=>{
					
					
						callback(errDemoData, resultDemoData);
					});
				},
				'total_categories': function(callback) {
						collectionCategories.countDocuments({"is_deleted":NOT_DELETED,"status":ACTIVE},(err,countResult)=>{
							callback(err, countResult);
						});
					},
				'popular_platforms': function(callback) {
					collectionPlatforms.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).limit(limit).toArray((errProductPlatformData, resultProductPlatformData)=>{
						callback(errProductPlatformData, resultProductPlatformData);
					});
				},
				
				
			}, function (err, response) {
				// consoleLog(response.popular_categories)
				//return false;
				
				if (!err) {
					/** render on home page **/ 
					res.render("demo-category-list", {
						total_categories					: (response['total_categories']) 				? response['total_categories'] 		: {},
						demo_category_data					: (response['categories']) 						? response['categories'] 				: {},
						total_recods_shown					:	limit,
						pageName							: 'Category List',
					});
				} else {
					/** render on home page **/
					res.render("demo-category-list", {
						total_categories					:	{},
						demo_category_data					:	{},
						total_recods_shown					:	{},
						pageName							: 	'Category List',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
			
		}	

	};//End categoriesListData()
	
	
	
	
	/**
	 * Function for getting tags list data  
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.tagsListData = (req, res) => {

		var languageCode = (typeof res.locals.default_language !== typeof undefined) ? res.locals.default_language : DEFAULT_LANGUAGE_MONGO_ID;
		let limit			= 	21;
		const collection 			=  db.collection(TABLE_PRODUCTS);
		const collectionFeatures 	= db.collection(TABLE_BLOCK);
		const collectionPlatforms 	= db.collection(TABLE_PRODUCT_PLATFORM);
		const collectionTags 		= db.collection(TABLE_TAGS);
		const collectionCategories	= db.collection(TABLE_PRODUCT_CATEGORIES);
		
			if(isPost(req)){
			let limit		 = 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
			let skip		 =	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			let title		 =	(req.body.product_tag) 	?	(req.body.product_tag)			: "";
			let totalRecordsShown = limit+skip;
			let commonConditions = {status:ACTIVE,is_deleted:NOT_DELETED};
				if(title !="")
				{
					//"/" + title + "/i"
					commonConditions['tag_name']= { $regex : new RegExp(title, "i") };
				}
				
				
				try {
				async.parallel({
					
				'tags': function(callback) {
					collectionTags.find(
							commonConditions,
							{}).sort({product_count:-1}).skip(skip).limit(limit).toArray((errDemoData, resultDemoData)=>{
								consoleLog("demo data on load more ");
								consoleLog(resultDemoData)
								var resHtml = '';
					resultDemoData.map(resultTagsData => {
					var tagName 			= (resultTagsData.tag_name) ? resultTagsData.tag_name 	: "";
					
					var tagProductCount	=	(resultTagsData.product_count) ? resultTagsData.product_count 	: 0;
					var tagIconLetter		=	tagName.charAt(0);
					var tagProductListUrl		= WEBSITE_URL+"product-list/"+TAXONOMY_TYPE_TAGS+'/'+resultTagsData.tag_slug;
										
					resHtml +='<div class="col-md-4">'+
					'<a href="'+tagProductListUrl+'">'+
						'<div class="card p-3">'+
							'<div class="d-flex justify-content-between align-items-center"> '+
							'<div class="numberCircle">'+tagIconLetter+'</div>'+
							'<button class="btn-alternate-count btn-sm ">'+
							'Products Count: '+tagProductCount+'</button> '+
							 '</div>'+ 
							'<span class="google mt-2"><h2 class="text-dark">'+tagName+'</h2></span>'+ 
					   '</div>'+
					'</a>'+
				   ' </div>';
	
									});
						
							callback(errDemoData, resHtml);
						});
					},
					'total_tags': function(callback) {
							collectionTags.countDocuments(commonConditions,(err,countResult)=>{
								callback(err, countResult);
							});
						},
				},function (err, response) {
					
					if (!err) {
						/** render on home page **/
						res.send({	
							status							: (!err) 						? STATUS_SUCCESS 			: STATUS_ERROR,
							total_tags						: (response['total_tags']) 					? response['total_tags'] 		: {},
							demo_tags_data					: (response['tags']) 						? response['tags'] 				: {},
							total_recods_shown				: totalRecordsShown,
							pageName						: 'Tags List',		
						});
					} else {
						res.render("demo-tags-list", { 
						total_tags						:	{},
						total_recods_shown					:	{},
						demo_tags_data					:	{},
						pageName							: 	'Tags List',
						});
					}
				});
			} catch (e) {
				console.log(e)
				return res.render("404", { result: "" })
			}
		
		
		}else{
			try {
			async.parallel({
				
				/** Get home banner data **/
				'tags': function(callback) {
				collectionTags.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).sort({product_count:-1}).limit(limit).toArray((errDemoData, resultDemoData)=>{
					
					
						callback(errDemoData, resultDemoData);
					});
				},
				'total_tags': function(callback) {
						collectionTags.countDocuments({"is_deleted":NOT_DELETED,"status":ACTIVE},(err,countResult)=>{
							callback(err, countResult);
						});
					},
				
				
				
				
			}, function (err, response) {
			
				
				if (!err) {
					/** render on home page **/ 
					res.render("demo-tags-list", {
						total_tags							: (response['total_tags']) 				? response['total_tags'] 		: {},
						demo_tags_data						: (response['tags']) 						? response['tags'] 				: {},
						total_recods_shown					:	limit,
						pageName							: 'Tags List',
					});
				} else {
					/** render on home page **/
					res.render("demo-tags-list", {
						total_tags							:	{},
						total_recods_shown					:	{},
						demo_tags_data						:	{},
						pageName							: 	'Tags List',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
			
		}	

	};//End tagsListData()
	
	
	
	
	/**
	 * Function for getting feature listing data  
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.featuresListData = (req, res) => {

		var languageCode = (typeof res.locals.default_language !== typeof undefined) ? res.locals.default_language : DEFAULT_LANGUAGE_MONGO_ID;
		let limit			= 	21;
		const collection 			=  db.collection(TABLE_PRODUCTS);
		const collectionFeatures 	= db.collection(TABLE_FEATURES);
		const collectionPlatforms 	= db.collection(TABLE_PRODUCT_PLATFORM);
		const collectionTags 		= db.collection(TABLE_TAGS);
		const collectionCategories	= db.collection(TABLE_PRODUCT_CATEGORIES);
		
			if(isPost(req)){
			let limit		 = 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
			let skip		 =	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			let title		 =	(req.body.product_feature) 	?	(req.body.product_feature)			: "";
			let totalRecordsShown = limit+skip;
			let commonConditions = {is_deleted:DEACTIVE,status:ACTIVE};
				if(title !="")
				{
					//"/" + title + "/i"
					commonConditions['feature_name']= { $regex : new RegExp(title, "i") };
				}
				
				
				try {
				async.parallel({
					
				'features': function(callback) {
					collectionFeatures.find(
							commonConditions,
							{}).sort({product_count:-1}).skip(skip).limit(limit).toArray((errDemoData, resultDemoData)=>{
								consoleLog("demo data on load more ");
								consoleLog(resultDemoData)
								var resHtml = '';
					resultDemoData.map(resultFeaturesData => {
					var featureName 			= (resultFeaturesData.feature_name) ? resultFeaturesData.feature_name 	: "";
					
					var featureProductCount		=	(resultFeaturesData.product_count) ? resultFeaturesData.product_count 	: 0;
					var featureIconLetter		=	featureName.charAt(0);
					var featureProductListUrl	= WEBSITE_URL+"product-list/"+TAXONOMY_TYPE_FEATURES+'/'+resultFeaturesData.feature_slug;
							
					resHtml +='<div class="col-md-4">'+
					'<a href="'+featureProductListUrl+'">'+
						'<div class="card p-3">'+
							'<div class="d-flex justify-content-between align-items-center"> '+
							'<div class="numberCircle">'+featureIconLetter+'</div>'+
							'<button class="btn-alternate-count btn-sm ">'+
							'Products Count: '+featureProductCount+'</button> '+
							 '</div>'+ 
							'<span class="google mt-2"><h2 class="text-dark">'+featureName+'</h2></span>'+ 
					   '</div>'+
					'</a>'+
				   ' </div>';
	
									});
						
							callback(errDemoData, resHtml);
						});
					},
					'total_features': function(callback) {
							collectionFeatures.countDocuments(commonConditions,(err,countResult)=>{
								callback(err, countResult);
							});
						},
				},function (err, response) {
					
					if (!err) {
						/** render on home page **/
						res.send({	
							status								: (!err) 						? STATUS_SUCCESS 			: STATUS_ERROR,
							total_features						: (response['total_features']) 					? response['total_features'] 		: {},
							demo_features_data					: (response['features']) 						? response['features'] 				: {},
							total_recods_shown					:	totalRecordsShown,
							pageName							: 'Features List',		
						});
					} else {
						res.render("demo-feature-list", { 
						total_features						:	{},
						total_recods_shown					:	{},
						demo_tags_data						:	{},
						pageName							: 	'Features List',
						});
					}
				});
			} catch (e) {
				console.log(e)
				return res.render("404", { result: "" })
			}
		
		
		}else{
			try {
			async.parallel({
				
				/** Get home banner data **/
				'features': function(callback) {
				collectionFeatures.find(
						{
							"is_deleted":NOT_DELETED,
							"status":ACTIVE
						},
						{}).sort({product_count:-1}).limit(limit).toArray((errDemoData, resultDemoData)=>{
					
					
						callback(errDemoData, resultDemoData);
					});
				},
				'total_features': function(callback) {
						collectionFeatures.countDocuments({"is_deleted":NOT_DELETED,"status":ACTIVE},(err,countResult)=>{
							callback(err, countResult);
						});
					},
				
				
				
				
			}, function (err, response) {
			
				
				if (!err) {
					/** render on home page **/ 
					res.render("demo-feature-list", {
						total_features							: (response['total_features']) 				? response['total_features'] 		: {},
						demo_features_data						: (response['features']) 						? response['features'] 				: {},
						total_recods_shown						:	limit,
						pageName								: 'Features List',
					});
				} else {
					/** render on home page **/
					res.render("demo-feature-list", {
						total_features							:	{},
						total_recods_shown						:	{},
						demo_features_data						:	{},
						pageName								: 	'Features List',
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
			
		}	

	};//End featuresListData()
	
	
	
	
	/**
	 * Function for Getting product list for taxonomy (tag,features,category,platform)  
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.productTaxonomyListData = (req, res) => {

		var languageCode 		= (typeof res.locals.default_language !== typeof undefined) ? res.locals.default_language : DEFAULT_LANGUAGE_MONGO_ID;
		let limit				= 	21;
		const collection 			=  db.collection(TABLE_PRODUCTS);
		const collectionFeatures 	= db.collection(TABLE_FEATURES);
		const collectionPlatforms 	= db.collection(TABLE_PRODUCT_PLATFORM);
		const collectionTags 		= db.collection(TABLE_TAGS);
		const collectionCategories	= db.collection(TABLE_PRODUCT_CATEGORIES);
		var taxonomyFlag = (req.params.flag) 	? 	(req.params.flag) 	: ""; 
		let taxonomySlug = (req.params.slug) 	? 	(req.params.slug) 	: ""; 
		
		let taxonomyIdOptions = {
										name	   		   :  taxonomySlug,
									};
		var taxonomyColumn = "";								
		if(taxonomyFlag == TAXONOMY_TYPE_PLATFORM){
			taxonomyIdOptions["collection"] = TABLE_PRODUCT_PLATFORM;
			taxonomyIdOptions["column_name"] = "slug";
			taxonomyColumn	=	"product_platform";
			
		}else if(taxonomyFlag == TAXONOMY_TYPE_CATEGORY){
			taxonomyIdOptions["collection"] = TABLE_PRODUCT_CATEGORIES;
				taxonomyIdOptions["column_name"] = "slug";
			taxonomyColumn	=	"product_categories";
			
		}else if(taxonomyFlag == TAXONOMY_TYPE_FEATURES){
			taxonomyIdOptions["collection"] = TABLE_FEATURES;  
			taxonomyIdOptions["column_name"] = "feature_slug";
			taxonomyColumn	=	"product_features";
			
		}else if(taxonomyFlag == TAXONOMY_TYPE_TAGS){
			taxonomyIdOptions["collection"] = TABLE_TAGS;
			taxonomyIdOptions["column_name"] = "tag_slug";
			taxonomyColumn	=	"product_tags";
			
		}
			
		getIdBySlug(req,res,taxonomyIdOptions).then((taxonomyResponse)=>{

		var taxonomyId = (taxonomyResponse.result._id) 	? (taxonomyResponse.result._id) 	: ""; 
		
		var commonConditions = {status:ACTIVE,is_deleted:NOT_DELETED};
		 commonConditions[taxonomyColumn] = {$in:[ObjectId(taxonomyId)]}

		//return false;
		if(isPost(req)){
			let limit		 		= 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
			let skip		 		=	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			let title		 		=	(req.body.title) 	?	(req.body.title)			: "";
			let totalRecordsShown 	= 	limit+skip;
			
			
				if(title !="")
				{
					//"/" + title + "/i"
					commonConditions['question']= { $regex : new RegExp(title, "i") };
				}

				
				try {
				async.parallel({
					
				'products': function(callback) {
					collection.find(
							commonConditions,
							{}).sort({product_alternative_count:-1}).skip(skip).limit(limit).toArray((errDemoData, resultDemoData)=>{
								consoleLog("demo data on load more ");
								consoleLog(resultDemoData)
								var resHtml = '';
									resultDemoData.map(resultProductData => {
					var productName = (resultProductData.product_name) ? resultProductData.product_name 	: "";
					var productShortDescription = (resultProductData.product_tag_line) ? resultProductData.product_tag_line 	: "";
					var productAlternateCount=	(resultProductData.product_alternative_count) ? resultProductData.product_alternative_count 	: "";
					var productIconLetter	=	productName.charAt(0);
					var productDetailUrl= WEBSITE_URL+"product-details/"+resultProductData.product_slug;
					
				
										
					resHtml += '<div class="col-md-4">'+
					'<a href="'+productDetailUrl+'">'+
					   '<div class="card p-3">'+
							'<div class="d-flex justify-content-between align-items-center">'+
							'<div class="numberCircle">'+productIconLetter+'</div>'+
							'<button class="btn-alternate-count btn-sm ">'+
							'Available Alternatives: '+productAlternateCount+'</button>'+
							
							 '</div>'+ 
							'<span class="google mt-3"><h2 class="text-dark" >'+productName+'</h2></span>'+ 
							'<span class="text mt-2 text-secondary">'+productShortDescription+'</span>'+
						'</div>'+
					'</a>'+
					'</div>';
		
								
										
									});
						
							callback(errDemoData, resHtml);
						});
					},
					'total_products': function(callback) {
							collection.countDocuments({"is_deleted":NOT_DELETED,"status":ACTIVE},(err,countResult)=>{
								callback(err, countResult);
							});
						},
				},function (err, response) {
					 
					if (!err) {
						/** render on home page **/
						res.send({	
							status							: (!err) 						? STATUS_SUCCESS 			: STATUS_ERROR,
							total_products					: (response['total_products']) 					? response['total_products'] 		: {},
							demo_products_data				: (response['products']) 						? response['products'] 				: {},
							total_recods_shown				:	totalRecordsShown,
							taxonomy_flag					:	taxonomyFlag,
							taxonomy_slug					:	taxonomySlug,
							pageName						: 'Products For '+toTitleCase(taxonomySlug)+' '+toTitleCase(taxonomyFlag),		
						});
					} else {
						res.render("demo-products-taxonomy-list", { 
						total_products						:	{},
						total_recods_shown					:	{},
						demo_products_data					:	{},
						demo_popular_platform_data			:	{},
						demo_popular_category_data			:	{},
						taxonomy_flag						:	taxonomyFlag,
						taxonomy_slug						:	taxonomySlug,
						pageName							: 	'Products For '+toTitleCase(taxonomySlug)+' '+toTitleCase(taxonomyFlag),
						});
					}
				});
			} catch (e) {
				console.log(e)
				return res.render("404", { result: "" })
			}
		
		
		}else{
		try {
			async.parallel({
				
				/** Get home banner data **/
				'products': function(callback) {
				collection.find(
						commonConditions,
						{}).sort({product_alternative_count:-1}).limit(limit).toArray((errDemoData, resultDemoData)=>{
					
					
						callback(errDemoData, resultDemoData);
					});
				},
				'total_products': function(callback) {
						collection.countDocuments(commonConditions,(err,countResult)=>{
							callback(err, countResult);
						});
					},


				
			}, function (err, response) {
			
				if (!err) {
					/** render on home page **/ 
					res.render("demo-products-taxonomy-list", {
						total_products						: (response['total_products']) 					? response['total_products'] 		: {},
						demo_products_data					: (response['products']) 						? response['products'] 				: {},
						total_recods_shown					:	limit,
						taxonomy_flag						:	taxonomyFlag,
						taxonomy_slug						:	taxonomySlug,
						pageName							: 'Products For '+toTitleCase(taxonomySlug)+' '+toTitleCase(taxonomyFlag),
					});
				} else {
					/** render on home page **/
					res.render("demo-products-list", {
						total_products						:	{},
						total_recods_shown					:	{},
						demo_products_data					:	{},
						taxonomy_flag						:	taxonomyFlag,
						taxonomy_slug						:	taxonomySlug,
						pageName							: 	'Products For '+toTitleCase(taxonomySlug)+' '+toTitleCase(taxonomyFlag),
					});
				}
			});
		} catch (e) {
			console.log(e)
			return res.render("404", { result: "" })
		}
			
		}	
	});
	};//End productTaxonomyListData()
	
	
	
	/**
	 * Function for searching product on tag,features,category and platform basis  
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/jsonproductAlternativeData
	 */
	this.productCompleteSearch = (req, res)=>{
		let limit		 		= 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
		let skip		 		=	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
		let title		 		=	(req.body.title) 	?	(req.body.title)			: "";
		let totalRecordsShown 	= 	limit+skip;
			
		
		res.render("demo-complete-product-search", {
						total_products						:	{},
						total_recods_shown					:	{},
						demo_products_data					:	{},
						taxonomy_flag						:	'',
						taxonomy_slug						:	'',
						pageName							: 	'Products Result',
					});
		
	}
	
	
	/**
	 * Function for showing alternatives of a product  
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json 
	 */
	this.productAlternativeData = (req, res)=>{
		let productSlug		 	= 	(req.params.slug) 	? 	(req.params.slug) 	: ""; 
		let limit				= 	21;
		let skip		 		=	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
		let title		 		=	(req.body.title) 	?	(req.body.title)			: "";
		let totalRecordsShown 	= 	limit+skip;
		const collection 		=  db.collection(TABLE_PRODUCTS);
		var commonConditions 	= {	status:ACTIVE,is_deleted:NOT_DELETED,product_slug:productSlug};


		if(isPost(req)){
			let limit		 = 	(req.body.length) 	? 	parseInt(req.body.length) 	: DEFAULT_LIMIT_FRONT; 
			let skip		 =	(req.body.start) 	?	parseInt(req.body.start)	: DEFAULT_SKIP;
			let totalRecordsShown = limit+skip;
			
		
				try {


					async.parallel({

						'products': function(callback) {
								
							collection.aggregate([
							{
								$match : commonConditions
							},
							{$lookup : {
								from 			: TABLE_PRODUCTS,
								localField 		: "product_alternative",
								foreignField 	: "_id",
								as 				: "product_alternative_details",
							}},
							{$project:{
								"_id"             			:1,
								"product_name"				:1,
								"product_tag_line"			:1,
								"product_description"		:1,
								"product_alternative_count"	:1,
								"product_creator"			:1,
								"product_liscence_cost"		:1,
								"product_type"				:1,
								"product_external_links"	:1,
								"product_slug"				:1,
								"is_deleted"       			:1,
								"status"					:1,
								"is_processed"				:1,
								"is_url_active"				:1,
								"created"					:1,
								"modified"					:1,
								"product_alternative"		: {
									"$slice": ["$product_alternative_details",skip, limit]
								},
							}},
						]).toArray((errDemoData,resultDemoData)=>{
						
						var alternativesProdcust = resultDemoData[0].product_alternative;	
						
							var resHtml = '';
				alternativesProdcust.map(resultProductData => {

				
					
					var productName 			= (resultProductData.product_name) ? resultProductData.product_name 	: "";
					var productShortDescription = (resultProductData.product_short_description) ? resultProductData.product_short_description 	: "";
					var productCreator			=(resultProductData.product_creator) ? resultProductData.product_creator 	: "";	
					var productLiscenceCost		=(resultProductData.product_liscence_cost) ? resultProductData.product_liscence_cost 	: "";	
					var productLikesCount		=(resultProductData.product_likes) ? resultProductData.product_likes 	: "";	
					var productFeaturesCount		=(resultProductData.product_features) ? (resultProductData.product_features).length 	: "";
					var productTagsCount		=(resultProductData.product_tags) ? (resultProductData.product_tags).length 	: "";	
					var productFirstChar		=(resultProductData.product_name) ? (resultProductData.product_name.charAt(0)) 	: "";	
					var productDetailUrl	= WEBSITE_URL+"product-details/"+resultProductData.product_slug;



		resHtml += '<div class="bg-white p-3 rounded mt-2">'+
                '<div class="row">'+
                    '<div class="col-md-3">'+
                       '<div class="d-flex flex-column justify-content-center align-items-center icon-container bg-custom-green text-white mb-2">'+
						'<span class="mt-4 display-1">'+
              '<a class="anchorGreen" href="'+productDetailUrl+'">'+
							'<h1 class="display-1"><strong>'+productFirstChar+'</strong></h1></a>'+
						'</span>'+
						'<span class="mb-4 mx-1 my-1 text-center font-weight-bold">'+ 
						'<a class="anchorGreen" href="'+productDetailUrl+'">'+productName+'</a></span>'+
						'</div>'+
                   '</div>'+
                    '<div class="col-md-6 border-right">'+
                        '<div class="listing-title">'+
                          '<a href="'+productDetailUrl+'">'+
                            '<h2>'+productName+'</h2>'+
                          '</a>'+
                        '</div>'+
                        '<div class="description">'+
                            '<p>'+productShortDescription+'</p>'+
                        '</div>'+
                    '</div>'+
                    '<div class="d-flex col-md-3">'+
                        '<div class="d-flex flex-column justify-content-start user-profile w-100">'+
                            '<div class="progresses"><span><i class="bi bi-file-code text-success"></i> '+productCreator+'</span> '+
                                '<div class="progress mt-1" style="height: 5px;" >'+
                                    '<div class="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="progresses"><span><i class="bi bi-coin text-success"></i> '+productLiscenceCost+'</span>'+
                                '<div class="progress mt-1" style="height: 5px;" >'+
                                    '<div class="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>'+
                                '</div>'+
                            '</div>'+
                           '<div class="progresses"><span><i class="bi bi-hand-thumbs-up-fill text-success"></i> '+productLikesCount+' Likes</span>'+
                                '<div class="progress mt-1" style="height: 5px;" >'+
                                    '<div class="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="progresses"><span><i class="bi bi-card-checklist text-success"></i> '+productFeaturesCount+' Features</span>'+
                              '<div class="progress mt-1" style="height: 5px;" >'+
                                  '<div class="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>'+
                              '</div>'+
                            '</div>'+
                            '<div class="progresses"><span><i class="bi bi-tag-fill text-success"></i> '+productTagsCount+' Tags</span>'+
                              '<div class="progress mt-1" style="height: 5px;" >'+
                                  '<div class="progress-bar bg-success" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>'+
                              '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>';
										
									});
			var responseData = {"products":resHtml, resultDemoData}									
							
								callback(errDemoData, responseData);
							});
						},	
						},function (err, response) {
						
							var totalProducts	 					= (response.products.resultDemoData[0]) ? response.products.resultDemoData[0].product_alternative_count 	: [];	
							var productName 						 =(response.products.resultDemoData[0]) ? response.products.resultDemoData[0].product_name : "";	
							var productData = {};
							productData.product_name 				=  (response.products.resultDemoData[0]) ? response.products.resultDemoData[0].product_name 	: "";
							productData.product_tag_line 			=  (response.products.resultDemoData[0]) ? response.products.resultDemoData[0].product_tag_line 	: "";
							productData.product_alternative_count 	=  (response.products.resultDemoData[0]) ? response.products.resultDemoData[0].product_alternative_count 	: "";
							productData.product_type 				=  (response.products.resultDemoData[0]) ? response.products.resultDemoData[0].product_type 				: "";
							productData.product_creator 			=  (response.products.resultDemoData[0]) ? response.products.resultDemoData[0].product_creator 			: "";
							productData.product_liscence_cost 		=  (response.products.resultDemoData[0]) ? response.products.resultDemoData[0].roduct_liscence_cost 		: "";
			

					if (!err) {
						/** render on home page **/
						res.send({	
							status							: (!err) 						? STATUS_SUCCESS 			: STATUS_ERROR,
							total_products					: totalProducts,
							product_alternative_data		: (response.products) 				? response.products.products 				: {},
							product_data					:	productData,
							total_recods_shown				:	totalRecordsShown,
							pageName						: 	'Products Alternative For '+toTitleCase(productName),
						});
					} else {
						res.render("demo-product-alternative", { 
						total_products						:	{},
						total_recods_shown					:	{},
						product_alternative_data			:	{},
						product_data						:	{},
						pageName							: 	'Products Alternative For '+toTitleCase(productName),
						});
					}
				});
			} catch (e) {
				console.log(e)
				return res.render("404", { result: "" })
			}
		
		
		}else{

			async.parallel({

				'products': function(callback) {
						
					collection.aggregate([
					{
						$match : commonConditions
					},
					{$lookup : {
						from 			: TABLE_PRODUCTS,
						localField 		: "product_alternative",
						foreignField 	: "_id",
						as 				: "product_alternative_details",
					}},
					{$project:{
						"_id"             			:1,
						"product_name"				:1,
						"product_tag_line"			:1,
						"product_description"		:1,
						"product_alternative_count"	:1,
						"product_creator"			:1,
						"product_liscence_cost"		:1,
						"product_type"				:1,
						"product_external_links"	:1,
						"product_slug"				:1,
						"is_deleted"       			:1,
						"status"					:1,
						"is_processed"				:1,
						"is_url_active"				:1,
						"created"					:1,
						"modified"					:1,
						"product_alternative"		: {
							"$slice": ["$product_alternative_details", limit]
						},
					}},
				]).toArray((errDemoData,resultDemoData)=>{
					
						callback(errDemoData, resultDemoData);
					});
				},	
				},function (err, response) {
	
					
			var result  							= response.products[0] ? response.products[0] : "";		
						
			var alternativeData 					= (result) ? result.product_alternative 		: [];	
			var totalProducts	 					= (result) ? result.product_alternative_count 	: [];				
			var productData = {};
			productData.product_name 				=  (result) ? result.product_name 	: "";
			productData.product_tag_line 			=  (result) ? result.product_tag_line 	: "";
			productData.product_alternative_count 	=  (result) ? result.product_alternative_count 	: "";
			productData.product_type 				=  (result) ? result.product_type 				: "";
			productData.product_creator 			=  (result) ? result.product_creator 			: "";
			productData.product_liscence_cost 		=  (result) ? result.product_liscence_cost 		: "";
			
			var productName =(result) ? result.product_name : "";				
			
			res.render("demo-product-alternative", {
							total_products						:	totalProducts,
							total_recods_shown					:	limit,
							product_data						: 	productData,
							product_alternative_data			:	alternativeData,
							pageName							: 	'Products Alternative For '+toTitleCase(productName),
						});
			})




		}


	}
	
	
	
}
module.exports = new Home();
