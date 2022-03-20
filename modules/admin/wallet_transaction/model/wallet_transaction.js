function Wallet() {
	
	/** Use in export data **/
	var exportFilterConditions 	=	{};
	var exportCommonConditions 	=	{};
	var exportSortConditions	= 	{created:SORT_DESC};
	
	/**
	 * Function to get wallet transaction list
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.getWalletTransaction = (req, res, next) => {
		let currentDate = newDate();

		if (isPost(req)) {
			let limit 		 	= (req.body.length) ? parseInt(req.body.length) : ADMIN_LISTING_LIMIT;
			let skip 			= (req.body.start) ? parseInt(req.body.start) : DEFAULT_SKIP;
			let monthNumber  	= (req.body.month) ? req.body.month : "";
			let fromDate 		= 	(req.body.fromDate) 	 		? 	req.body.fromDate				:"";
			let toDate 			= 	(req.body.toDate) 	 			? 	req.body.toDate					:"";
			const collection 	= db.collection(TABLE_WALLET_TRANSACTION);
			const async 	 	= require('async');

			/**for get before date */
			let date = newDate();
			date.toLocaleDateString();
			date.setMonth(date.getMonth() - monthNumber);
			date.toLocaleDateString();



			/** Configure Datatable conditions **/
			configDatatable(req, res, null).then(dataTableConfig => {
				consoleLog(dataTableConfig);
				/** Set conditions for export report **/
				exportCommonConditions	=	dataTableConfig.conditions;
				exportFilterConditions 	=	dataTableConfig.conditions;
				exportSortConditions	=	dataTableConfig.sort_conditions;


				if (fromDate != "" && toDate != "") {
					dataTableConfig.conditions["$and"]=[
						{ "created": { $gte 	: newDate(fromDate)} },
						{ "created": { $lt 	: newDate(toDate)} },
					]
				}


				
				/**Check for month number */
				if(monthNumber){
					dataTableConfig.conditions["created"]={
						$lte : currentDate,
						$gte : date
					}
				}
				async.parallel([
					(callback) => {
						/** Get list of contact **/
						collection.aggregate([
						//~ { $match: dataTableConfig.conditions},
						{
							$lookup: {
								from: TABLE_USERS,
								let: { userId: "$user_id" },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ["$_id", "$$userId"] },
												]
											}
										}
									},
									{$project : { "full_name" : 1,"email":1,"wallet_balance":1}},
								],
								as: "userDetail"
							}
						},
						{$addFields:{
							full_name		:	{$arrayElemAt:["$userDetail.full_name",0]},
							email			:	{$arrayElemAt:["$userDetail.email",0]},
							wallet_balance	:	{$arrayElemAt:["$userDetail.wallet_balance",0]},
						}},
						{ $match: dataTableConfig.conditions},
						{$sort:dataTableConfig.sort_conditions},
						{$skip:skip},
						{$limit:limit},
						]).toArray((err,result)=>{
							callback(err, result);
						});
					},
					(callback) => {
						/** Get total number of records in contacts collection **/
						collection.countDocuments({}, (err, countResult) => {
							callback(err, countResult);
						});
					},
					(callback) => {
						/** Get filtered records counting in contacts **/
						collection.countDocuments(dataTableConfig.conditions, (err, filterContResult) => {
							callback(err, filterContResult);
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
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS['admin/wallet_transaction/list']);
			res.render('list');
		}
	}//End getWalletTransaction()
	
	
	/**
	*  Function for export stones
	*
	* @param req As Request Data
	* @param res As Response Data
	*
	* @return null
    */
    this.exportData = (req,res,next)=>{
		let exportType	=	(req.params.export_type)		?	req.params.export_type	:	"";
		let conditions	=	exportCommonConditions;

		/** Get stones **/
		const collection	=	db.collection(TABLE_WALLET_TRANSACTION);
		collection.aggregate([
		//~ { $match: dataTableConfig.conditions},
		{
			$lookup: {
				from: TABLE_USERS,
				let: { userId: "$user_id" },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ["$_id", "$$userId"] },
								]
							}
						}
					},
					{$project : { "full_name" : 1,"email":1,"wallet_balance":1}},
				],
				as: "userDetail"
			}
		},
		{$addFields:{
			full_name		:	{$arrayElemAt:["$userDetail.full_name",0]},
			email			:	{$arrayElemAt:["$userDetail.email",0]},
			wallet_balance	:	{$arrayElemAt:["$userDetail.wallet_balance",0]},
		}},
		{ $match: conditions},
		{$sort : exportSortConditions}
		]).toArray((err,result)=>{
						
			if(err) return next(err);
			
			let temp		=	[];		
			let commonColls	= 	[];

			/** Define excel heading label **/
			commonColls		= 	[
				res.__("admin.wallet_transaction.name"),
				res.__("admin.wallet_transaction.email"),
				res.__("admin.wallet_transaction.amount"),
				res.__("admin.wallet_transaction.wallet_balance"),
				res.__("admin.wallet_transaction.tranaction_type"),
				res.__("admin.wallet_transaction.reason"),
				res.__("admin.system.created"),
			];
			
			/** Get result of stones **/
			if(result.length > 0){
				result.map((records, index)=>{
					let buffer =	[
						(records.full_name)			?	records.full_name 																	:	"",
						(records.email)				?	records.email 																		:	"",
						(records.amount)			?	records.amount 																		:	0,
						(records.wallet_balance)	?	records.wallet_balance 																: 	0, 
						(records.tranaction_type)	?	records.tranaction_type.charAt(0).toUpperCase() + records.tranaction_type.slice(1) 	:	"",
						(records.reason)			?	records.reason																	 	:	"",
						(records.created)			?	getUtcDate(records.created,AM_PM_FORMAT_WITH_DATE) 	:	""
					];
					temp.push(buffer);
				});
			}
			
			/**  Function to export data in excel format **/
			exportToExcel(req,res,{
				file_prefix 		: "wallet_",
				heading_columns		: commonColls,
				export_data			: temp
			});
		});
	};// end exportData()
}
module.exports = new Wallet();
