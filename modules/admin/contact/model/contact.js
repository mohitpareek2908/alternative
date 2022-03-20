function Contact() {

	/**
	 * Function to get contact list
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.getContactList = (req, res, next) => {
		if (isPost(req)) {
			let limit = (req.body.length) ? parseInt(req.body.length) : ADMIN_LISTING_LIMIT;
			let skip = (req.body.start) ? parseInt(req.body.start) : DEFAULT_SKIP;
			const collection = db.collection(TABLE_CONTACT_US);
			const async = require('async');

			/** Configure Datatable conditions **/
			configDatatable(req, res, null).then(dataTableConfig => {
				async.parallel([
					(callback) => {
						/** Get list of contact **/
						collection.find(dataTableConfig.conditions, {
							projection: {
								_id: 1,
								full_name: 1,
								name: 1,
								email: 1,
								subject: 1,
								message: 1,
								phone: 1,
								enquiry_type: 1,
								created: 1
							}
						})
							.collation(COLLATION_VALUE)
							.sort(dataTableConfig.sort_conditions)
							.limit(limit)
							.skip(skip)
							.toArray((err, result) => {
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
			req.breadcrumbs(BREADCRUMBS['admin/contact/list']);
			res.render('list');
		}
	}//End getContactList()

	/**
	 * Function for view contact details
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return json
	 */
	this.view = (req, res, next) => {
		let contactId = (req.params.id) ? req.params.id : "";
		/** Get contact details **/
		const contacts = db.collection(TABLE_CONTACT_US);
		if (isPost(req)) {
			
			req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			consoleLog(req.body );
			
			let reply		= 	(req.body.reply) 	? req.body.reply		: '';
			let userId		= 	(req.body.user_id) 	? req.body.user_id		: '';
			let user_name		= 	(req.body.user_name) 	? req.body.user_name		: '';
			let email		= 	(req.body.email) 	? req.body.email		: '';
			contacts.updateOne({
				_id : ObjectId(contactId)
			},{
				$set : {
					is_reply : ACTIVE,
					reply : reply
				}
			},(updateErr,updateSuccess)=>{
				
				
				
				
				
				if(email != "")
				{
					 /** Set options for send email ***/
					let emailOptions = {
						to: email,
						action: "contact_reply_by_admin",
						rep_array: [user_name,reply]
					};
					/** Send email **/
					sendMail(req, res, emailOptions);
				}
				let successMsg = res.__("Reply has been sent to user successfully.");
				/** Send success response **/
				req.flash("success",successMsg);
				res.send({
					status			: 	STATUS_SUCCESS,
					redirect_url	:	WEBSITE_ADMIN_URL+"contact",
					message			: 	successMsg,
				});
			})
			
		}else{
		
			
			
			contacts.find(
				{ 
					_id: ObjectId(contactId) 
				}).toArray((err, result) => {
				if (err) return next(err);
				if (!result) {
					req.flash(STATUS_ERROR, res.__("admin.system.invalid_access"));
					res.redirect(WEBSITE_ADMIN_URL + "contact");
					return;
				}
				/** Render view page **/
				req.breadcrumbs(BREADCRUMBS["admin/contact/view"]);
				res.render('view', {
					//result = (response && response)	?	response	:[];
					result: result[0],
				});
			})
		}


	};//End view()


	/**
	 * Function for reply contact details
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return json
	 */
	 this.reply = (req, res, next) => {
		let contactId = (req.params.id) ? req.params.id : "";
		const contacts = db.collection(TABLE_CONTACT_US);
		if (isPost(req)) {
			
			req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			
			let reply		= 	(req.body.reply) 	? req.body.reply		: '';
			let userId		= 	(req.body.user_id) 	? req.body.user_id		: '';
			let user_name		= 	(req.body.user_name) 	? req.body.user_name		: '';
			let email		= 	(req.body.email) 	? req.body.email		: '';
			contacts.updateOne({
				_id : ObjectId(contactId)
			},{
				$set : {
					is_reply : ACTIVE,
					reply : reply
				}
			},(updateErr,updateSuccess)=>{
				
				
			
				if(email != "")
				{
					 /** Set options for send email ***/
					let emailOptions = {
						to: email,
						action: "contact_reply_by_admin",
						rep_array: [user_name,reply]
					};
					/** Send email **/
					sendMail(req, res, emailOptions);
				}
				let successMsg = res.__("Reply has been sent to user successfully.");
				/** Send success response **/
				req.flash("success",successMsg);
				res.send({
					status			: 	STATUS_SUCCESS,
					redirect_url	:	WEBSITE_ADMIN_URL+"contact",
					message			: 	successMsg,
				});
			})
			
		}else{

				/** Get contact details **/
				const contacts = db.collection(TABLE_CONTACT_US);
				contacts.find(
					{ 
						_id: ObjectId(contactId) 
					}).toArray((err, result) => {
					if (err) return next(err);
					if (!result) {
						req.flash(STATUS_ERROR, res.__("admin.system.invalid_access"));
						res.redirect(WEBSITE_ADMIN_URL + "contact");
						return;
					}
					/** Render view page **/
					req.breadcrumbs(BREADCRUMBS["admin/contact/view"]);
					res.render('view', {
						//result = (response && response)	?	response	:[];
						result: result[0],
					});
				})

		}
	

	};//End view()


}
module.exports = new Contact();
