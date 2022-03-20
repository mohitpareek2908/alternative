const crypto 	= require("crypto");
const async		= require("async");
var url 		= require('url');
const { ObjectId } = require("mongodb");


function Event() {

	Event 			= this;
	const bcrypt    	= require('bcrypt');
	const saltRounds 	= 10;
	/**
	 * Function for review rating list
	 *
	 * @param req	As Request Data
	 * @param res 	As Response Data
	 *
	 * @return json
	*/
	this.getReviewRating = (req,res,next)=>{
		let listingId 	 	= (req.params.listing_id) ? req.params.listing_id : "all";
		let userRoleId 	    = (req.session.user.user_role_id) ? req.session.user.user_role_id : "";
		let loginListingId  = (req.session.user.listing_id) ? req.session.user.listing_id : "";
		if(isPost(req)){
			let limit			= (req.body.length) 		? parseInt(req.body.length) 		: ADMIN_LISTING_LIMIT;
			let skip			= (req.body.start)  		? parseInt(req.body.start)  		: DEFAULT_SKIP;
			let fromDate 		= (req.body.fromDate) 	 	? req.body.fromDate 				: "";
			let listingid 		= (req.body.listing_id) 	 	? req.body.listing_id 				: "";
			let userId 			= (req.body.user_id) 	 	? req.body.user_id 				: "";
			let userType 		= (req.body.user_type) 	 	? req.body.user_type 				: "";
			let toDate 			= (req.body.toDate) 	 	? req.body.toDate 					: "";
		
			let statusSearch	= 	(req.body.status_search)		? 	parseInt(req.body.status_search)	:"";
			const collection	= db.collection(TABLE_REVIEW_RATING);
			/** Configure DataTable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Set conditions **/
				
				let commonConditions = {
					is_deleted		: 	NOT_DELETED,
				};
				if(listingId && listingId != "all"){
					
					commonConditions["listing_id"] = ObjectId(listingId);
					dataTableConfig.conditions["listing_id"] = ObjectId(listingId);
				}
				if(userRoleId == UNIVERSITY_ROLE_ID || userRoleId == SCHOOL_TYPE_ID || userRoleId == EXTRACURRICULAR_TYPE_ID || userRoleId == NURSERY_TYPE_ID || userRoleId == PROFESSIONAL_CERTIFICATE_TYPE_ID ){
					commonConditions["listing_id"] = ObjectId(loginListingId);
					dataTableConfig.conditions["listing_id"] = ObjectId(loginListingId);
				}
				if(userId){
					commonConditions["user_id"] = ObjectId(userId);
					dataTableConfig.conditions["user_id"] = ObjectId(userId);
				}
				if(listingid){
					commonConditions["listing_id"] = ObjectId(listingid);
					dataTableConfig.conditions["listing_id"] = ObjectId(listingid);
				}
				if(userType){
					commonConditions["user_type_id"] = ObjectId(userType);
					dataTableConfig.conditions["user_type_id"] = ObjectId(userType);
				}
				
				/** Conditions for date */
				if (fromDate != "" && toDate != "") {
					
					dataTableConfig.conditions["created"] = {
						$gte 	: newDate(fromDate),
						$lte 	: newDate(toDate),
					}
				}
				
				/** Conditions for search using status*/
				if (statusSearch != "") {
					switch(statusSearch){
						case SEARCHING_APPROVE:
							dataTableConfig.conditions["is_approved"] 		= ACTIVE;
						break;

						case SEARCHING_PENDING:
							dataTableConfig.conditions["is_approved"] 		= DEACTIVE;
						break;
					}
				}
				
				
				
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions);
			
				async.parallel([
					(callback)=>{
						collection.aggregate([
							{
								$match : commonConditions
							},
							{
								$lookup : {
									from			: TABLE_PRODUCTS,
									localField		: "listing_id",
									foreignField	: "_id",
									as				: "listing_detail"
								}
							},
							{
								$lookup : {
									from			: TABLE_USERS,
									localField		: "user_id",
									foreignField	: "_id",
									as				: "user_detail"
								}
							},
							{
								$lookup : {
									from			: TABLE_ADMIN_ROLE,
									localField		: "user_type_id",
									foreignField	: "_id",
									as				: "admin_role_detail"
								}
							},
							{
								$project : {
									"_id" :1,
									"title" :1,
									"remark":1,
									"user_type_id":1,
									"user_id":1,
									"image":1,
									"is_approved"   :1,
									"listing_id"   :1,
									"created":1,
									"university_name"	: 	{ "$arrayElemAt" : ["$listing_detail.name",0] },
									"user_name"	: 	{ "$arrayElemAt" : ["$user_detail.full_name",0] },
									"user_type"	: 	{ "$arrayElemAt" : ["$admin_role_detail.role_name",0] },
									
								}
							},
							{'$match':	dataTableConfig.conditions},
							{ '$sort': dataTableConfig.sort_conditions },
							
                            { '$skip': skip },
                            { '$limit': limit },
						]).toArray((err, result)=>{
							
							callback(err, result);
						})
					},
					(callback)=>{
						/** Get total number of records in  events collection **/
						collection.countDocuments(commonConditions,(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records couting in events **/
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
			let dropDownOptions = {
				collections : [
				{
					collection : TABLE_USERS,
					columns    : ["_id","full_name"],
					conditions:{
						active :ACTIVE,
						user_role_id	: NORMAL_RIDER_TYPE,
						is_deleted  : NOT_DELETED
					}
				},
				{
					collection : TABLE_PRODUCTS,
					columns    : ["_id","product_name"],
					conditions:{
						active 		  :  ACTIVE,
						is_deleted    :  NOT_DELETED
					}
				},
				{
					collection 	: 	TABLE_ADMIN_ROLE,
					columns 	: 	["_id","role_name"],
					conditions 	: 	{
						"_id" : {$nin:[ObjectId(SUPER_ADMIN_ROLE_ID)]} //ObjectId(DEFAULT_ROLE_ID)
					},
					
					sort_conditions:{
						"order_sequence" :SORT_DESC
					},
				},
				]
			};
			getDropdownList(req,res,dropDownOptions).then(dropDownResponse=>{
				
				req.breadcrumbs(BREADCRUMBS["admin/review_rating/list"]);
				/* Render add page page */
				res.render('list',{
					user_list 	: (dropDownResponse && dropDownResponse.final_html_data && dropDownResponse.final_html_data["0"]) ? dropDownResponse.final_html_data["0"] : "",
					listing_ids 	: (dropDownResponse && dropDownResponse.final_html_data && dropDownResponse.final_html_data["1"]) ? dropDownResponse.final_html_data["1"] : "",
					user_role_type    :(dropDownResponse && dropDownResponse.final_html_data && dropDownResponse.final_html_data["2"])	?	dropDownResponse.final_html_data["2"]:"",
					user_role_id	: userRoleId,
					listing_id      : listingId
				});
			});
		}
	};//End getReviewRating()
	

	/**
	 * Function for view review rating details
	 *
	 * @param req	As Request Data
	 * @param res 	As Response Data
	 *
	 * @return json
	*/
	this.viewReviewRating = (req, res, next) => {
		let eventId = (req.params.id) ? req.params.id: "";
		let listingId 	 = (req.params.listing_id) ? req.params.listing_id : "all";

		/**Call function for get review rating  details */
		getReviewRatingDetails(req, res,next).then(response=>{
			/**For check response */
			if(response.status != STATUS_SUCCESS){
				/** Send error response **/
				req.flash(STATUS_ERROR,response.message);
				return res.redirect(WEBSITE_ADMIN_URL+"review_rating");
			}
			let reviewRatingData = (response && response.result) ? response.result:"";
			let getlistingId   	 = (reviewRatingData && reviewRatingData.listing_id) ? reviewRatingData.listing_id : "";

			/**For get type  */
			
			const listing = db.collection(TABLE_PRODUCTS);
			listing.findOne({_id : ObjectId(getlistingId),status:ACTIVE,is_deleted:NOT_DELETED},{projection:{_id:1,type:1}},(listingErr,listingResult)=>{

				if(listingErr){
					/** Send error response **/
					req.flash(STATUS_ERROR,response.message);
					return res.redirect(WEBSITE_ADMIN_URL+"review_rating");
				}
				let typeName = (listingResult && listingResult.type) ? listingResult.type :"";
				/**Function call for master rating criteria */

				getMasterRatingCriteria(req,res,typeName).then((masterResponse)=>{
					/** Send error response **/
					if(masterResponse.status == STATUS_ERROR){
						/** Send error response **/
						req.flash(STATUS_ERROR,response.message);
						return res.redirect(WEBSITE_ADMIN_URL+"review_rating");
					}
					let masterArray = (masterResponse && masterResponse.result) ? masterResponse.result :[];
					
					/** Render view review rating  page **/
					req.breadcrumbs(BREADCRUMBS["admin/review_rating/view"]);
					res.render("view",{
						result 		  : (reviewRatingData)	?	reviewRatingData :{},
						master_criteria_array :masterArray,
						listing_id    : listingId,
						dynamic_variable : listingId,
						dynamic_url		 :listingId
					});
				});	
			});	
		}).catch(next);
	}//End viewReviewRating()


	


	/**
	 * Function for approve review rating 
	 *
	 * @param req	As Request Data
	 * @param res 	As Response Data
	 *
	 * @return json
	*/
	this.approveReviewRating = (req, res, next) => {
		let reviewRatingId = (req.params.id) ? req.params.id : "";
		let listingId = (req.params.listing_id) ? ObjectId(req.params.listing_id) : "";
		let userId  = (req.params.user_id) ? req.params.user_id : "";
		let userTypeId  = (req.params.user_type_id) ? req.params.user_type_id : "";
		let type = "";
		if(userTypeId == UNIVERSITY_ROLE_ID){
			type = UNIVERSITY;
		}
		if(userTypeId == SCHOOL_TYPE_ID){
			type = SCHOOL_TYPE;
		}
		if(userTypeId == NURSERY_TYPE_ID){
			type = NURSERY_TYPE;
		}
		if(userTypeId == EXTRACURRICULAR_TYPE_ID){
			type = EXTRACURRICULAR_TYPE;
		}
		if(userTypeId == PROFESSIONAL_CERTIFICATE_TYPE_ID){
			type = PROFESSIONAL_CERTIFICATE_TYPE;
		}
		
		const listing = db.collection(TABLE_PRODUCTS);

		/**For get user details */
		const users = db.collection(TABLE_USERS);
		users.findOne({_id : ObjectId(userId),is_deleted:NOT_DELETED},{projection:{_id:1,full_name:1,email:1}},(userErr,userResult)=>{
			if(userErr){
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"review_rating");
			}
			let fullName = (userResult && userResult.full_name) ? userResult.full_name : "";
			let email    = (userResult && userResult.email) ? userResult.email : "";
		

			/** update review rating  status **/
			const review_rating = db.collection(TABLE_REVIEW_RATING);
			review_rating.updateOne(
				{_id : ObjectId(reviewRatingId)},
				{$set : {
					is_approved 		: ACTIVE,
					modified	: getUtcDate()
				}},(err, result)=>{
					if(err) return next(err);

					/**For send email */
					let emailOptions	=	{
						to 			: email,
						action 		: "approve_review_rating_mail",
						rep_array 	: [fullName]
					};
					sendMail(req,res,emailOptions);
					
					getOverAllRating(req,res,listingId,type).then((response)=>{
						if(response.status == STATUS_ERROR){
							req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
							return res.redirect(WEBSITE_ADMIN_URL+"review_rating");
						}
						let overAllRating = (response && response.over_all_rating && response.over_all_rating.over_all_rating) ? response.over_all_rating.over_all_rating : 0;
					
						/**For  listing updateData */
						listing.updateOne({_id:listingId},{$set:{"over_all_rating":overAllRating}},(updateErr,updateReult)=>{

							if(updateErr){
								req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
								return res.redirect(WEBSITE_ADMIN_URL+"review_rating");
							}

							/** Send success response **/
							req.flash(STATUS_SUCCESS,res.__("admin.review_rating.review_status_updated_successfully"));
							res.redirect(WEBSITE_ADMIN_URL+"review_rating");
						});	
					});	
				}
			);
		});	
	}//End approveReviewRating()


	/**
	 * Function for get event Detail
	 *
	 * @param req	As Request Data
	 * @param res 	As Response Data
	 *
	 * @return json
	*/
	let getReviewRatingDetails = (req,res,next)=>{
		return new Promise(resolve=>{
			let reviewRatingId = (req.params.id) ? req.params.id : "";
			let conditions  = {
				_id 			: ObjectId(reviewRatingId),
				is_deleted		: NOT_DELETED,
			}
			const review_rating	= db.collection(TABLE_REVIEW_RATING);
			review_rating.aggregate([
				{
					$match : conditions
				},
				{
					$lookup : {
						from			: TABLE_PRODUCTS,
						localField		: "listing_id",
						foreignField	: "_id",
						as				: "listing_detail"
					}
				},
				{
					$lookup : {
						from			: TABLE_USERS,
						localField		: "user_id",
						foreignField	: "_id",
						as				: "user_detail"
					}
				},
				{
					$project : {
						"_id" :1,
						"title" :1,
						"remark":1,
						"user_id":1,
						"image":1,
						"is_approved"   :1,
						"star_rating_criteria":1,
						"listing_id"   :1,
						"created":1,
						"university_name"	: 	{ "$arrayElemAt" : ["$listing_detail.name",0] },
						"user_name"	: 	{ "$arrayElemAt" : ["$user_detail.full_name",0] },
						
					}
				},
			
			]).toArray((err, result)=>{
				if(result.length <=0){
					let response = {
						status	: STATUS_ERROR,
						message:res.__("admin.system.invalid_access")
					};
					return resolve(response);
				}
				
				/** Send success response **/
				let response = {
					status	: STATUS_SUCCESS,
					result	: result[0]
				};
				resolve(response);
				
			});
		});
	};//End getReviewRatingDetails()

	/**
	 * Function for get listing data according to user role type 
	 *
	 * @param req	As Request Data
	 * @param res 	As Response Data
	 *
	 * @return json
	*/
	this.getUserRoleData = (req, res, next) => {
		let roleId = (req.params.role_id) ? req.params.role_id : "";

		geUseroleDataType(req,res,roleId).then((response)=>{
			if(response.status == STATUS_ERROR){
				res.send({
					status : STATUS_ERROR,
					message : res.__("admin.system.invalid_access")
				})
			}

			/**Send success response */
			res.send({
				status : STATUS_SUCCESS,
				result : (response && response.result) ? response.result : []
			})
		});
	}//End getUserRoleData()

}
module.exports = new Event();
