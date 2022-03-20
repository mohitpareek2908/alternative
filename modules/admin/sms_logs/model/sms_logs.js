function smsLog() {

	/**
	 * Function to sms logs list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.list = (req, res)=>{
		if(isPost(req)){
			let limit			= 	(req.body.length)	?	parseInt(req.body.length)	: ADMIN_LISTING_LIMIT;
			let skip			=	(req.body.start)	? 	parseInt(req.body.start)	: DEFAULT_SKIP;
			const collection	= 	db.collection('sms_logs');
			const async			= 	require('async');

			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				async.parallel([
					(callback)=>{
						/** Get list of sms logs  **/
						collection.find(dataTableConfig.conditions,{projection: {_id:1,mobile_number:1,message:1,status:1,created:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err,result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in sms logs  collection **/
						collection.countDocuments({},(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in sms logs  **/
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
			req.breadcrumbs(BREADCRUMBS['admin/sms_logs/list']);
			res.render('list');
		}
	};//End list()

	/**
	 * Function for view sms logs detail
	 *
	 * @param req	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next	As 	Callback argument to the middleware function
	 * 
	 * @return render
	 */
	this.viewDetials = (req, res,next)=>{
		let smsLogId	=	(req.params.id)	?	req.params.id	:"";
		
		/** Get sms logs details **/
		const sms_logs 	= 	db.collection("sms_logs");
		sms_logs.aggregate(
		[
			{$match 	: 	{
				_id : ObjectId(smsLogId)
			}},
			{$lookup : {
				"from" 			: 	"users",
				"localField" 	:	"user_id",
				"foreignField" 	: 	"_id",
				"as" 			: 	"user_detail"
			}},		
			{$project :	{
				_id:1,mobile_number:1,message:1,status:1,created:1,
				user_name	: {$arrayElemAt : ["$user_detail.full_name",0]},
			}},
		]).toArray((err, result)=>{
			if(err) return next(err);
			
			if(!result || result.length ==0){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
				res.redirect(WEBSITE_ADMIN_URL+"sms_logs");
				return;
			}
			
			/** Render view page*/
			req.breadcrumbs(BREADCRUMBS['admin/sms_logs/view']);
			res.render('view',{
				result	: (result[0]) ? result[0]:{}
			});
		});
	};//End viewDetials()
	
	/**
	 * Function for view sms logs detail
	 *
	 * @param req	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next	As 	Callback argument to the middleware function
	 * 
	 * @return render
	 */
	this.getAllSms = (req, res,next)=>{
		res.render('all_msg');
	}
	this.getMsgData = (req, res,next)=>{
		var pageP	=	"/home/trixxie/web/trixxie.dev2.gipl.inet/public_html/dev/modules/admin/sms_logs/views";
		res.send({
			status			:  STATUS_SUCCESS,
			data : pageP + '/new_data.html',
		});
	}
}
module.exports = new smsLog();
