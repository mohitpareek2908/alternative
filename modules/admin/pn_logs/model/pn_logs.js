function PnLog() {

	/**
	 * Function to  Pn logs list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.list = (req, res)=>{
		if(isPost(req)){
			let limit			= 	(req.body.length)				?	parseInt(req.body.length)	: ADMIN_LISTING_LIMIT;
			let skip			=	(req.body.start) 				? 	parseInt(req.body.start)	: DEFAULT_SKIP;
			let deviceSearch 	= 	(req.body.device_type_search)	? (req.body.device_type_search)	: "";
			const collection	= 	db.collection('pn_logs');
			const async			= 	require('async');

			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				if (deviceSearch != "") {
					dataTableConfig.conditions['device_type'] = {$regex : new RegExp(deviceSearch, "i")};
				}
				async.parallel([
					(callback)=>{
						/** Get list of Pn logs  **/
						collection.find(dataTableConfig.conditions,{projection: {_id:1,device_type:1,device_token:1,body:1,response:1,created:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err,result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in Pn logs  collection **/
						collection.countDocuments({},(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in Pn logs  **/
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
			req.breadcrumbs(BREADCRUMBS['admin/pn_logs/list']);
			res.render('list');
		}
	};//End list()

	/**
	 * Function for view Pn logs  Detail
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render
	 */
	this.viewDetials = (req, res)=>{
		let id	=	(req.params.id)	?	req.params.id	: "";
		if(id){
			try{
				/** Get  Pn logs details **/
				getPnLogsDetails(req, res).then((response)=>{
					if(response.status == STATUS_SUCCESS){
						req.breadcrumbs(BREADCRUMBS['admin/pn_logs/view']);
						/** Render view page*/
						res.render('view',{
							result	: 	response.result,
						});
					}else{
						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"pn_logs");
					}
				});
			}catch(e){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+"pn_logs");
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"pn_logs");
		}
	};//End viewDetials()

	/**
	 * Function to get pn logs detail
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 */
	let	getPnLogsDetails = (req,res)=>{
		return new Promise(resolve=>{
			let id = (req.params.id) ? req.params.id : "";
			if(!id || id ==''){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				try{
					/** Get Pn logs details **/
					const pn_logs 	= 	db.collection("pn_logs");
					pn_logs.findOne({
							_id : ObjectId(id)
						},
						{projection: {
							_id:1,device_type:1,device_token:1,body:1,created:1,response:1,request:1,
						}},(err, result)=>{
							if(result){
								/** Send success response **/
								let response = {
									status	: STATUS_SUCCESS,
									result	: result
								};
								resolve(response);
							}else{
								/** Send error response */
								let response = {
									status	: STATUS_ERROR,
									message	: res.__("admin.system.invalid_access")
								};
								resolve(response);
							}
						}
					);
				}catch(e){
					/** Send error response */
					let response = {
						status	: STATUS_ERROR,
						message	: res.__("admin.system.invalid_access")
					};
					resolve(response);
				}
			}
		});
	};// End getPnLogsDetails()
}

module.exports = new PnLog();
