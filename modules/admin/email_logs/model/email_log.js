function EmailLog() {
	
	/**
	 * Function to email logs list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.list = (req, res)=>{
		if(isPost(req)){
			let fromDate 		= 	(req.body.fromDate)	? 	req.body.fromDate 			:"";
			let toDate 			= 	(req.body.toDate) 	? 	req.body.toDate				:"";
			let limit			= 	(req.body.length)	? 	parseInt(req.body.length)	:ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start)	?	parseInt(req.body.start)	:DEFAULT_SKIP;
			const async			= 	require('async');
			const collection	=	db.collection('email_logs');
			
			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				if(fromDate != "" && toDate != ""){
					dataTableConfig.conditions['created']={
						$gte 	: newDate(fromDate),
						$lte 	: newDate(toDate),
					}
				}
				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions);
				async.parallel([
					(callback)=>{
						/** Get list of email logs **/
						collection.find(dataTableConfig.conditions,{projection: {_id:1,from:1,to:1,subject:1,created:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err,result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in email logs collection **/
						collection.countDocuments({},(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in  email logs **/
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
						data			: (response[0]) ? response[0]	: [],
						recordsTotal	: (response[1]) ? response[1]	: 0,
						recordsFiltered	: (response[2]) ? response[2]	: 0,
					});
				});
			});
		}else{
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS['admin/email_logs/list']);
			res.render('list');
		}
	};//End list()

	/**
	 * Function for view email logs Detail
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render
	 */
	this.viewDetials = (req, res)=>{
		let emailLogId	= (req.params.id)	? req.params.id	: "";
		if(emailLogId){
			try{
				/** Get email logs details **/
				getEmailLogDetails(req, res).then((response)=>{
					if(response.status == STATUS_SUCCESS){
						req.breadcrumbs(BREADCRUMBS['admin/email_logs/view']);
						/** Render view page*/
						res.render('view',{
							result	: response.result,
						});
					}else{
						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"email_logs");
					}
				});
			}catch(e){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+"email_logs");
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"email_logs");
		}
	};//End viewDetials()

	/**
	 * Function to get email logs detail
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return json
	 */
	let	getEmailLogDetails = (req,res)=>{
		return new Promise(resolve=>{
			let emailLogId = (req.params.id) ? req.params.id : "";
			if(!emailLogId || emailLogId ==''){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				try{
					/** Get email logs details **/
					const email_logs	=	db.collection("email_logs");
					email_logs.findOne({
							_id : ObjectId(emailLogId)
						},
						{projection: {
							id:1,from:1,to:1,subject:1,created:1,html:1,
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
									message	: res.__("admin.system.something_going_wrong_please_try_again")
								};
								resolve(response);
							}
						}
					);
				}catch(e){
					/** Send error response */
					let response = {
						status	: STATUS_ERROR,
						message	: res.__("admin.system.something_going_wrong_please_try_again")
					};
					resolve(response);
				}
			}
		});
	};// End getEmailLogDetails()
}

module.exports = new EmailLog();
