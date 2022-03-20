function PromoCode() {
	let exportFilterConditions 	=	{};
	let exportCommonConditions 	=	{};
	let exportSortConditions	= 	{_id:SORT_ASC};
	/**
	 * Function to  promo code list
	 *
	 * @param req 	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.list = (req, res,next)=>{
		
		
		if(isPost(req)){
			let limit			= 	(req.body.length)	?	parseInt(req.body.length)	: ADMIN_LISTING_LIMIT;
			let skip			=	(req.body.start)	? 	parseInt(req.body.start)	: DEFAULT_SKIP;
			const collection	= 	db.collection('promo_codes');
			const async			= 	require('async');
			let fromDate 		= 	(req.body.fromDate) 	 	? req.body.fromDate 				: "";
			let toDate 			= 	(req.body.toDate) 	 	? req.body.toDate 					: "";
			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Conditions for date */
				if (fromDate != "" && toDate != "") {
					dataTableConfig.conditions["code_valid_from"] = {
						$gt 	: newDate(fromDate),
						//$lte 	: newDate(toDate),
					}
					dataTableConfig.conditions["code_valid_to"] = {
						
						$lt 	: newDate(toDate),
					}
				}
				dataTableConfig.conditions["is_deleted"] 		= NOT_DELETED;
				
				exportCommonConditions	=	dataTableConfig.conditions;
				exportFilterConditions 	=	dataTableConfig.conditions;
				exportSortConditions	=	dataTableConfig.sort_conditions;
				
				async.parallel([
					(callback)=>{
						/** Get list of promo code  **/
						collection.find(dataTableConfig.conditions,{projection:{_id:1,code_description:1,code_valid_from:1,code_valid_to:1,coupons_count:1,discount_type:1,discount_value:1,promo_code:1,validity_type:1,modified:1,status:1,coupons_used:1,created:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err,result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in promo code  collection **/
						collection.countDocuments(dataTableConfig.conditions,(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in promo code  **/
						collection.countDocuments(dataTableConfig.conditions,(err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err, response)=>{
					/** Send response **/
					res.send({
						status			: (!err) ? STATUS_SUCCESS 		: STATUS_ERROR,
						draw			: dataTableConfig.result_draw,
						data			: (response[0]) ? response[0] 	: [],
						recordsFiltered	: (response[2]) ? response[2]	: 0,
						recordsTotal	: (response[1]) ? response[1] 	: 0
					});
				});
			});
		}else{
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS['admin/promo_code/list']);
			res.render('list');
		}
	};//End list()
	
	/**
	 * Function for add or edit promo code's detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addEditPromoCode = (req,res,next)=>{
		let isEditable	=	(req.params.id)			?	true :false;		
		if(isPost(req)){
			/** Sanitize Data **/
			req.body 				=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let promoCodeId			=	(req.params.id)					?	ObjectId(req.params.id)					:ObjectId();
			let promoCode  			= 	(req.body.promo_code) 			?	req.body.promo_code 					:"";
			var discountType		=	(req.body.discount_type)		? 	req.body.discount_type					:"";
			var discountValue		= 	(req.body.discount_value)		? 	req.body.discount_value					:"";
			var couponsValidFrom	= 	(req.body.code_valid_from)		? 	getUtcDate(req.body.code_valid_from)	:"";
			var couponsValidTo		= 	(req.body.code_valid_to)		? 	getUtcDate(req.body.code_valid_to)		:"";
			var couponsCount		= 	(req.body.coupons_count)		? 	req.body.coupons_count					:0;			
			var validityType		= 	(req.body.validity_type)		? 	req.body.validity_type					:"";			
			var userType			= 	(req.body.user_type)			? 	req.body.user_type						:"";			
			var selectedUserIds		= 	(req.body.selected_user_ids)	? 	req.body.selected_user_ids				:[];			
			
			
			/** select user ids mongo id convert */ 
			var selectedUserIdsArray = [];
			if(userType==PROMO_CODE_SELECTED_USER){
				if(selectedUserIds.length>0){
					if(selectedUserIds.constructor === Array){
						selectedUserIdsArray = selectedUserIds.map(function(records){
							return (records) ? ObjectId(records) :"";
						});
					}else{
						selectedUserIdsArray.push(ObjectId(selectedUserIds));
					}	
				}
			}
			/** Check validation **/
			req.checkBody({
				"promo_code": {
					notEmpty: true,
					errorMessage: res.__("admin.promo_code.please_enter_code")
				},
				"code_description": {
					notEmpty: true,
					errorMessage: res.__("admin.promo_code.please_enter_code_description")
				},
				"coupons_count": {
					notEmpty: true,
					isNumeric:{
						errorMessage: res.__("admin.promo_code.invalid_uses_limit")
					},
					errorMessage: res.__("admin.promo_code.please_enter_uses_limit")
				},
				"discount_type": {
					notEmpty: true,
					errorMessage: res.__("admin.promo_code.please_select_discount_type")
				},
				"discount_value": {
					notEmpty: true,
					isFloat:{
						errorMessage: res.__("admin.promo_code.enter_valid_discount_value"),
					},
					errorMessage: res.__("admin.promo_code.enter_discount_value")
				},
				"code_valid_from": {
					notEmpty: true,
					errorMessage: res.__("admin.promo_code.select_code_valid_from_date")
				},
				"code_valid_to": {
					notEmpty: true,
					errorMessage: res.__("admin.promo_code.select_code_valid_to_date")
				},
				"user_type": {
					notEmpty: true,
					errorMessage: res.__("admin.promo_code.select_user_type")
				}
			});
			

			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			
			/** Check discount value  validation **/
			if(discountType == PERCENT_OF_AMOUNT && discountValue && (discountValue <= 0 || discountValue >= 100)){
				if(!errors) errors	=	[];
				errors.push({'param':'discount_value','msg':res.__("admin.promo_code.enter_value_in_range")});
			}else if(discountType == FLAT_AMOUNT && discountValue && discountValue <= 0){
				if(!errors) errors	=	[];
				errors.push({'param':'discount_value','msg':res.__("admin.promo_code.enter_value_greater_then_0")});
			}
			
			/** validate for coupon count **/
			if (couponsCount && couponsCount <= 0) {
				if(!errors) errors	=	[];
				errors.push({'param':'coupons_count','msg':res.__("admin.promo_code.coupon_count_should_be greate_then_0")});
			}
			
			if(couponsValidFrom  && couponsValidTo){
				if(couponsValidFrom >= couponsValidTo){
					if(!errors) errors	=	[];
					errors.push({"param":"code_valid_to","msg":res.__("admin.promo_code.coupon_valid_to_date_should_be_greater_than_coupon_valid_from_date")});
				}
			}
					
			if(userType==PROMO_CODE_SELECTED_USER){
				if(selectedUserIdsArray.length==0){
					if(!errors) errors	=	[];
					errors.push({"param":"selected_user_ids","msg":res.__("admin.promo_code.please_select_user")});
				}
			}
			
			/** Send error response **/
			if(errors)return res.send({status : STATUS_ERROR, message	: errors});
			
			/** Configure promo code unique conditions **/
			const promo_codes = db.collection("promo_codes");
			promo_codes.findOne({
				_id 		: 	{$ne 	: promoCodeId},
				promo_code 	: 	{$regex : '^'+promoCode+'$',$options : 'i'},
				is_deleted	:	NOT_DELETED,
			},{projection: {_id:1}},(err,result)=>{
				if(err) return next(err);
				
				if(result){
					/** Send error response **/
					return res.send({
						status	: STATUS_ERROR, 
						message	: [{'param':'promo_code','msg':res.__("admin.promo_code.promo_code_already_exists")}]});
				}
				
				/** Set update data **/	
				let authUserId 	=	(req.session.user) ? req.session.user._id :"";
				let updateData 	= 	{
					promo_code	 		: 	promoCode,
					code_valid_from		: 	couponsValidFrom,
					code_valid_to		: 	couponsValidTo,
					selected_user_ids	: 	selectedUserIdsArray,
					user_type			:	userType,
					code_description	: 	(req.body.code_description)	?	req.body.code_description 			:"",
					coupons_count		: 	(req.body.coupons_count)	?	parseInt(req.body.coupons_count)	:0,					
					discount_type		: 	(req.body.discount_type)	?	req.body.discount_type				:"",
					discount_value		: 	(req.body.discount_value)	?	parseFloat(req.body.discount_value)	:0,
					modified 			: 	getUtcDate()
				};	
				
				/** Set insert data **/	
				let insertData = {
					created_by 		: 	ObjectId(authUserId),
					status 			: 	PROMO_CODE_PUBLISHED,
					coupons_used 	: 	NO_COUPONS_USED,
					is_deleted		:	NOT_DELETED,
					created 		: 	getUtcDate()
				};
				
				/** Save and update promo code data **/
				promo_codes.updateOne({
					_id: promoCodeId
				},
				{
					$set		: updateData,
					$setOnInsert: insertData
				},{upsert: true},
				(err, result) => {
					if(err) return next(err);
					
					/** Send success response **/
					let message			=	(!isEditable) ?  res.__("admin.promo_code.promo_code_has_been_added_successfully") :res.__("admin.promo_code.promo_code_details_has_been_updated_successfully");
					req.flash(STATUS_SUCCESS,message);
					res.send({
						status		: STATUS_SUCCESS,
						redirect_url: WEBSITE_ADMIN_URL+"promo_codes",
						message		: message,
					});
				});
			});
		}else{
			if(!isEditable){
				/** Render add page **/
				req.breadcrumbs(BREADCRUMBS["admin/promo_code/add"]);
				res.render("add_edit");	
			}else{
				/** Get promo code details **/
				getPromoCodeDetails(req, res,next).then(response=>{
					if(response.status != STATUS_SUCCESS){
						/** Send error response **/
						req.flash(STATUS_ERROR,response.message);
						res.redirect(WEBSITE_ADMIN_URL+"promo_codes");
						return;
					}
					
					var selectedUserIds	=	(response.result.selected_user_ids)	?	response.result.selected_user_ids	:	[];
					/** Render edit page **/
					let options = {
						collections : [
							{
								collection	: TABLE_USERS,
								columns		: ["_id", "full_name"],
								selected	: selectedUserIds,
								conditions: {
									active 				:	ACTIVE,
									is_admin_approved	:	ACTIVE,
									is_deleted			:	NOT_DELETED,
									user_role_id		:	RIDER_USER_ROLE_ID,
									_id					:	{$in :selectedUserIds}
								}
							},
						]
					};
					
					/** Render edit page **/
					getDropdownList(req,res,options).then(responseData=>{
						req.breadcrumbs(BREADCRUMBS["admin/promo_code/edit"]);
						res.render("add_edit",{
							result 		: 	(response.result) ? response.result :{},
							user_list	:	(responseData 	&& responseData.final_html_data && responseData.final_html_data["0"])	?	responseData.final_html_data["0"]	:"",
							is_editable	: 	isEditable,
						});
					});
				}).catch(next);
			}
		}
	};//End addEditPromoCode()

	/**
	 * Function to get promo code detail
	 *
	 * @param req 	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 * 
	 * @return json
	 */
	let	getPromoCodeDetails = (req,res,next)=>{
		return new Promise(resolve=>{
			let promocodeId = (req.params.id) ? req.params.id :"";
			
			/** Get promo code details **/
			const promo_codes 	= 	db.collection("promo_codes");
			promo_codes.findOne({
					_id : ObjectId(promocodeId)
				},(err, result)=>{
					if(err) return next(err);
					
					if(!result){
						/** Send error response */
						return resolve({
							status	: STATUS_ERROR,
							message	: res.__("admin.system.invalid_access")
						});
					}
					
					/** Send success response **/
					resolve({
						status	: STATUS_SUCCESS,
						result	: result
					});
				}
			);
		});
	};// End getPromoCodeDetails()
	
	/**
	 * Function for view promo code's detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.view = (req,res,next)=>{
		/** Get promo code details **/
		getPromoCodeDetails(req, res,next).then(response=>{
			if(response.status != STATUS_SUCCESS){
				/** Send error response **/
				req.flash(STATUS_ERROR,response.message);
				res.redirect(WEBSITE_ADMIN_URL+"promo_codes");
				return;
			}
			
			/** Render edit page **/
			req.breadcrumbs(BREADCRUMBS["admin/promo_code/view"]);
			res.render("view",{
				result : (response.result) ? response.result :{},
			});
		}).catch(next);
	};//End view()
	
	/**
	 * Function for update promo code status
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return null
	 */
	this.updatePromoCodeStatus = function(req,res,next) {
		var promoId		=	req.params.id;
		var promoStatus	=	(req.params.status==PROMO_CODE_PUBLISHED) ? PROMO_CODE_UNPUBLISHED : PROMO_CODE_PUBLISHED;
		
		/** Update status **/
		var promo_codes = db.collection('promo_codes');
		promo_codes.updateOne(
			{
				_id : ObjectId(promoId)
			},
			{$set : {
				status 		: promoStatus,
				modified	: getUtcDate()
			}},(err,result)=>{
				if(err) return next(err);
				
				/** Send success response **/
				req.flash('success',res.__("admin.promo_code.status_updated_successfully"));
				res.redirect(WEBSITE_ADMIN_URL+'promo_codes');
			}
		);
	};//End updatePromoCodeStatus()

	/**
	 * Function for delete promo code
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return null
	 */
	this.deletePromoCode = function(req, res,next) {
		var promoId	= req.params.id;
		
		/** Delete promo code **/
		var promo_codes = db.collection('promo_codes');
		promo_codes.updateOne({
			_id : ObjectId(promoId)
		},{
			$set : {
				is_deleted : DELETED
			}
		},(updateErr,updateSuccess)=>{
			if(updateErr) return next(updateErr);
			/** Send success response */
			req.flash('success',res.__("admin.promo_code.promo_code_deleted_successfully"));
			res.redirect(WEBSITE_ADMIN_URL+'promo_codes');
		})
		
	};//End deletePromoCode()
	
	/**
	 * Function for update offer status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.updateMultipleStatus = (req, res,next) => {
		let codeId = (req.body.ids) ? req.body.ids : [];
		let statusType = (req.body.type) ? req.body.type : "";
		
		if (codeId.length > 0 && statusType) {
			codeId.map(records => {
				codeId.push(ObjectId(records));
			});
			try {
				let updateData = {
					modified: getUtcDate()
				};
				if(statusType == ACTIVE || statusType == DEACTIVE){
					updateData["status"] = (statusType == ACTIVE) ? ACTIVE : DEACTIVE;
				}else if(statusType == 2){
					updateData["is_deleted"] = ACTIVE;
				}
				var promo_codes = db.collection('promo_codes');
				promo_codes.updateMany({ _id: { $in: codeId } }, { $set: updateData }, (err, result) => {
					if (!err) {
						/** Send success response **/
						req.flash(STATUS_SUCCESS, res.__("admin.promo_code.status_updated_successfully"));
						res.redirect(WEBSITE_ADMIN_URL+'promo_codes');
					} else {
						/** Send error response **/
						req.flash(STATUS_ERROR, res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+'promo_codes');
					}
				});
			} catch (e) {
				/** Send error response **/
				req.flash(STATUS_ERROR, res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+'promo_codes');
			}
		}
	}
	
	/**
	 *  Function for export payment transactions details
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return null
    */
    this.exportData 	= (req,res,next)=>{
		let conditions	=	exportCommonConditions;
		
		/** Get users details **/
		const promo_codes	= db.collection("promo_codes");
		promo_codes.find(conditions,{projection:{_id:1,code_description:1,code_valid_from:1,code_valid_to:1,coupons_count:1,discount_type:1,discount_value:1,promo_code:1,validity_type:1,modified:1,status:1,coupons_used:1}}).sort(exportSortConditions).toArray((err,result)=>{
			if(err) return next(err);

			/**Set variable for export */
			let temp = [];

			/** Define excel heading label **/
			let commonColls	= [
				res.__("admin.promo_code.code"),
				res.__("admin.promo_code.promo_discount_type"),
				res.__("admin.promo_code.discount_value"),
				res.__("admin.promo_code.usage_limit_used"),
				res.__("admin.promo_code.coupons_valid_from"),
				res.__("admin.promo_code.coupons_valid_to"),
				res.__("admin.system.status"),
				res.__("admin.system.modified"),
			];

			if(result && result.length > 0){
				result.map(records=>{
					var discountType		=	(records.discount_type)		?	records.discount_type	:"";
					var discountValue		=	(records.discount_value)	?	records.discount_value	:"";
					var disVal 				= 	(discountType == PERCENT_OF_AMOUNT ) ? discountValue+"%" : currencyFormat(discountValue);
					var couponsUsed			=	(records.coupons_used)	?	records.coupons_used	:0;
					var couponsCount		=	(records.coupons_count)	?	records.coupons_count:0;
					var couponsUsedLebel	=	couponsUsed+'/'+couponsCount;		
					let buffer = [
						(records.promo_code)		  				  ? records.promo_code :"",
						(records.discount_type)			 			? PROMO_DISCOUNT_TYPE[records.discount_type]	 :"",
						(disVal)	  				  ? disVal : 0,
						(couponsUsedLebel)  				  ? couponsUsedLebel :0,
						(records.code_valid_from)		  ? newDate(records.code_valid_from,DATE_TIME_FORMAT_EXPORT) :"",
						(records.code_valid_to)		  ? newDate(records.code_valid_to,DATE_TIME_FORMAT_EXPORT) :"",
						
						(records.status == ACTIVE) 				  ? res.__("Published")    :res.__("Unpublished"),
						//(records.is_email_verified == VERIFIED)   ? res.__("admin.user.user_email_verified")    : res.__("admin.user.user_email_not_verified"),
						//(records.is_mobile_verified ==VERIFIED )  ? res.__("admin.user.user_mobile_verified")     : res.__("admin.user.user_mobile_not_verified"),
						(records.modified)		  ? newDate(records.modified,DATE_TIME_FORMAT_EXPORT) :""
					];
					temp.push(buffer);
				});
			}

			/**  Function to export data in excel format **/
			exportToExcel(req,res,{
				file_prefix 	: currentTimeStamp()+"coupons_Report",
				heading_columns	: commonColls,
				export_data		: temp
			});
		});
	};// end exportData()
	
	
	
	/**
	 *  Function for get user list for
	 */
	this.getUserListUserTypeWise	= 	(req,res)=>{
		var collection				=	db.collection(TABLE_USERS);
		var userType				=	(req.body.user_type) ? req.body.user_type : "";		
		var mobileNumber				= 	(req.body.q) ? req.body.q : ((req.query.q) ? req.query.q : 0);
		
		var conditions	=	{
			active 				:	ACTIVE,
			is_admin_approved	:	ACTIVE,
			is_deleted			:	NOT_DELETED,
			user_role_id		:	RIDER_USER_ROLE_ID,
			mobile_number		: 	{ "$regex": new RegExp(mobileNumber, "i") }
		};
		
		
		collection.find(conditions,{_id:1, full_name:1,email:1,mobile_number:1}).toArray(function (err, result) {
			if(!err){
				res.send({
					status:STATUS_SUCCESS,
					result:result
				});
			}else{
				res.send({
					status:STATUS_ERROR,
					message:text_settings["admin.system.something_going_wrong_please_try_again"]
				});
			}
		});
	};// getUserListUserTypeWise
}
module.exports = new PromoCode();
