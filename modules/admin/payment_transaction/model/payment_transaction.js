function PaymentTransaction() {
		
	/** Use in export data **/
	var exportFilterConditions 	=	{};
	var exportCommonConditions 	=	{};
	var exportSortConditions	= 	{_id:SORT_ASC};
	
	/**
	 * Function to get Payment reports list
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.getpaymentTransactionList = (req, res, next) => {
		if (isPost(req)) {
			let limit 			= (req.body.length) ? parseInt(req.body.length) : ADMIN_LISTING_LIMIT;
			let skip 			= (req.body.start) ? parseInt(req.body.start) : DEFAULT_SKIP;
			let fromDate 		= 	(req.body.fromDate) 	 		? 	req.body.fromDate				:"";
			let toDate 			= 	(req.body.toDate) 	 			? 	req.body.toDate					:"";
			let statusSearch	= 	(req.body.status_search)		? 	parseInt(req.body.status_search)	:"";
			let issueId			= 	(req.body.issue_id)		? 	req.body.issue_id	:"";
			const collection 	= db.collection(TABLE_PAYMENT_TRANSACTIONS);
			const async 		= require('async');

			/** Configure Datatable conditions **/
			configDatatable(req, res, null).then(dataTableConfig => {
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
				}
				if(issueId){
					commonConditions["issue_id"] 				= ObjectId(issueId);
					dataTableConfig.conditions["issue_id"] 		= ObjectId(issueId);
				}

				if (fromDate != "" && toDate != "") {
					dataTableConfig.conditions["$and"]=[
						{ "created": { $gte 	: newDate(fromDate)} },
						{ "created": { $lt 	: newDate(toDate)} },
					]
				}


				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				
				/** Set conditions for export report **/
				exportCommonConditions	=	commonConditions;
				exportCommonConditions	=	dataTableConfig.conditions;
				exportFilterConditions 	=	dataTableConfig.conditions;
				exportSortConditions	=	dataTableConfig.sort_conditions;

				consoleLog(commonConditions);
				async.parallel([
					(callback)=>{
						/** Get list of enquiry comments  **/
						collection.aggregate([
							{
								$match : commonConditions
							},
						
							
							{
								$lookup : {
									from			: TABLE_USERS,
									localField		: "user_id",
									foreignField	: "_id",
									as				: "user_detail"
								}
							},
							{$project:{
								"_id"             		:1,
								"created"				:1,
								"transaction_id"		:1,
								"user_id"       		:1,
								"currency"      		:1,
								"amount"      			:1,
								"payment_type"      	:1,
								"payment_for"      		:1,
								"status"				:1,
								"user_name"				:{ "$arrayElemAt" : ["$user_detail.full_name",0] },
							}},
							 {'$match':	dataTableConfig.conditions},
							{ '$sort': dataTableConfig.sort_conditions },
							{ '$skip': skip },
							{ '$limit': limit },
						]).toArray((err, result)=>{
							
							callback(err, result);
						})
					},
					(callback) => {
						/** Get total number of records in contacts collection **/
						collection.countDocuments(commonConditions, (err, countResult) => {
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records couting in univercities **/
						collection.aggregate([
							{$match	: commonConditions},

							{
								$lookup : {
									from			: TABLE_USERS,
									localField		: "user_id",
									foreignField	: "_id",
									as				: "user_detail"
								}
							},
							{$project:{
								"_id"             		:1,
								"created"				:1,
								"transaction_id"		:1,
								"user_id"       		:1,
								"currency"      		:1,
								"amount"      			:1,
								"payment_type"      	:1,
								"payment_for"      		:1,
								"status"				:1,
								"user_name"				:{ "$arrayElemAt" : ["$user_detail.full_name",0] },
							}},
							{$match	: dataTableConfig.conditions},
							{$count : "count"},
						]).toArray((err, filterContResult)=>{

							filterContResult	=	(filterContResult && filterContResult[0] && filterContResult[0].count)	?	filterContResult[0].count	:0;
							callback(err,filterContResult);
						});
						
					}
					
				], (err, response) => {
					
					/** Send response **/
					res.send({
						status: (!err) ? STATUS_SUCCESS : STATUS_ERROR,
						draw: dataTableConfig.result_draw,
						data: (response[0]) ? response[0] : [],
						recordsFiltered: (response[2]) ? response[2] : 0,
						recordsTotal: (response[1]) ? response[1] : 0
					});
				});
			});
		} else {
			let dropDownOptions = {
				collections : [
				{
					collection : TABLE_MASTERS,
					columns    : ["_id","name"],
					conditions:{
						status :ACTIVE,
						dropdown_type:"issue"
					}
				},
				]
			};
			getDropdownList(req,res,dropDownOptions).then(dropDownResponse=>{
				/** render listing page **/
				req.breadcrumbs(BREADCRUMBS['admin/payment_transaction/list']);
				res.render('list',{
					issue_list    :(dropDownResponse && dropDownResponse.final_html_data && dropDownResponse.final_html_data["0"])	?	dropDownResponse.final_html_data["0"]:"",
					
				});
			});	
		}
	}//End getPostReportList()
	
	
	
	/**
	*  Function for view post reports
	*
	* @param req As Request Data
	* @param res As Response Data
	*
	* @return null
    */
    this.viewPaymentTransactionReport = (req,res,next)=>{
		let reportPostId	=	(req.params.id)		?	req.params.id	:	"";
		if(!reportPostId){
			/** Send success response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"payment_transaction");
		}
		let commonConditions = {
			_id: ObjectId(reportPostId)
		};
		const post_reports=db.collection(TABLE_PAYMENT_TRANSACTIONS);
		/**For get post report data */
		post_reports.aggregate([
			{$match:commonConditions},
			
			
			{
				$lookup : {
					from			: TABLE_USERS,
					localField		: "user_id",
					foreignField	: "_id",
					as				: "user_detail"
				}
			},
			{$project:{
								"_id"             		:1,
								"created"				:1,
								"transaction_id"		:1,
								"user_id"       		:1,
								"currency"      		:1,
								"amount"      			:1,
								"payment_type"      	:1,
								"payment_for"      		:1,
								"status"				:1,
								"user_name"				:{ "$arrayElemAt" : ["$user_detail.full_name",0] },
			}},
		]).toArray((err,result)=>{
			if(err) return next(err);
				consoleLog(result)
			/**For check result */
			if(result.length == 0){
				
				/** Send success response **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"payment_transaction");
			}
			/**For render */
			req.breadcrumbs(BREADCRUMBS['admin/payment_transaction/view']);
			res.render('view',{
				result : (result && result.length > 0) ? result[0] : {}
				
			});
		});
	};// end viewPostReport()
}
module.exports = new PaymentTransaction();
