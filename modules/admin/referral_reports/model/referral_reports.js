function Contact() {
		
	/** Use in export data **/
	var exportFilterConditions 	=	{};
	var exportCommonConditions 	=	{};
	var exportSortConditions	= 	{_id:SORT_ASC};
	
	/**
	 * Function to get referral reports list
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.getReferralList = (req, res, next) => {
		if (isPost(req)) {
			let limit = (req.body.length) ? parseInt(req.body.length) : ADMIN_LISTING_LIMIT;
			let skip = (req.body.start) ? parseInt(req.body.start) : DEFAULT_SKIP;
			const collection = db.collection(TABLE_USERS);
			const async = require('async');
				
			/** Set conditions **/
			let commonConditions = {
				is_deleted	: 	NOT_DELETED,
				_id			:  { $nin: [ ObjectId(ADMIN_ID) ] },
				referred_by	:  { $nin: [ ObjectId(MONGO_ID), ObjectId(ADMIN_ID) ] }
			};
				
			/** Configure Datatable conditions **/
			configDatatable(req, res, null).then(dataTableConfig => {
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
				
				/** Set conditions for export report **/
				//~ exportCommonConditions	=	commonConditions;
				exportCommonConditions	=	dataTableConfig.conditions;
				exportFilterConditions 	=	dataTableConfig.conditions;
				exportSortConditions	=	dataTableConfig.sort_conditions;
				
				async.parallel([
					(callback) => {
						/** Get list of contact **/
						collection.aggregate([
						{ $match: dataTableConfig.conditions},
						{ $lookup: {
							from: TABLE_USERS,
							let: { userId: "$_id" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$referred_by", "$$userId"] },
											]
										}
									}
								},
								{$project : { _id:1}},
							],
							as: "referredDetail"
						}},
						{$project:{
							full_name		:	1,
							email			:	1,
							created			:	1,
							referredDetail			:	1,
							total_referral	: 	{ $cond: { if: { $isArray: "$referredDetail" }, then: { $size: "$referredDetail" }, else: "0"} },
						}},
						{$sort:dataTableConfig.sort_conditions},
						{$skip:skip},
						{$limit:limit},
						]).toArray((err,result)=>{
							callback(err, result);
						});
					},
					(callback) => {
						/** Get total number of records in contacts collection **/
						collection.countDocuments(commonConditions, (err, countResult) => {
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
			req.breadcrumbs(BREADCRUMBS['admin/referral_reports/list']);
			res.render('list');
		}
	}//End getReferralList()
	
	
	
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
		//~ let conditions	= 	(exportType == EXPORT_FILTERED) ? exportFilterConditions  	: 	exportCommonConditions;
		let conditions	=	exportCommonConditions;

		/** Get stones **/
		const collection	=	db.collection(TABLE_USERS);
		collection.aggregate([
		{ $match: conditions},
		{ $lookup: {
			from: TABLE_USERS,
			let: { userId: "$_id" },
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ["$referred_by", "$$userId"] },
							]
						}
					}
				},
				{$project : { _id:1}},
			],
			as: "referredDetail"
		}},
		{$project:{
			full_name		:	1,
			email			:	1,
			created			:	1,
			referredDetail			:	1,
			total_referral	: 	{ $cond: { if: { $isArray: "$referredDetail" }, then: { $size: "$referredDetail" }, else: "0"} },
		}},
		{$sort : exportSortConditions}
		]).toArray((err,result)=>{
						
			if(err) return next(err);
			
			let temp		=	[];		
			let commonColls	= 	[];

			/** Define excel heading label **/
			commonColls		= 	[
				res.__("admin.user.name"),
				res.__("admin.user.email"),
				res.__("admin.user.referal"),
				res.__("admin.system.created"),
			];
			
			/** Get result of stones **/
			if(result.length > 0){
				result.map((records, index)=>{
					let buffer =	[
						(records.full_name)			?	records.full_name 									:	"",
						(records.email)				?	records.email 										:	"",
						(records.total_referral)	?	records.total_referral 								:	0,
						(records.created)			?	getUtcDate(records.created,AM_PM_FORMAT_WITH_DATE) 	:	""
					];
					temp.push(buffer);
				});
			}
			
			/**  Function to export data in excel format **/
			exportToExcel(req,res,{
				file_prefix 		: "referral_",
				heading_columns		: commonColls,
				export_data			: temp
			});
		});
	};// end exportData()
}
module.exports = new Contact();
