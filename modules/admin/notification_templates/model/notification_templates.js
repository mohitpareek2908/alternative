function NotificaionTemplates() {

	/**
	 * Function for get list of email templates
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getTemplateList = (req, res)=>{
		if(isPost(req)){
			let limit			= 	(req.body.length) 	? 	parseInt(req.body.length) 	:ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start) 	? 	parseInt(req.body.start) 	:DEFAULT_SKIP;
			const async			= 	require("async");
			const collection	= 	db.collection(TABLE_NOTIFICATION_TEMPLATES);

			configDatatable(req,res,null).then(dataTableConfig=>{
				async.parallel([
					(callback)=>{
						/** Get list of email templates **/
						collection.find(dataTableConfig.conditions,{projection: {_id:1,name:1,subject:1,modified:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err,result)=>{
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in email_templates collection **/
						collection.countDocuments({},(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records couting in notification_templates **/
						collection.countDocuments(dataTableConfig.conditions,(err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err, response)=>{
					/** Send response **/
					res.send({
						status			: 	(!err) 		? STATUS_SUCCESS : STATUS_ERROR,
						draw			:	dataTableConfig.result_draw,
						data			: 	(response[0]) ? response[0] : [],
						recordsFiltered	:  	(response[2]) ? response[2] : 0,
						recordsTotal	:	(response[1]) ? response[1] : 0
					});
				});
			});
		}else{
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS["admin/notification_templates/list"]);
			res.render('list');
		}
	}; //End getTemplateList()

	/**
	 * Function to get detail of email template
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 */
	let templateDetails = (req,res)=>{
		return new Promise(resolve=>{
			let templateId	 	= (req.params.id)	?	req.params.id	:"";
			if(!templateId || templateId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				try{
					/** Get email template details **/
					const notification_templates = db.collection(TABLE_NOTIFICATION_TEMPLATES);
					notification_templates.findOne({
							_id : ObjectId(templateId)
						},
						{projection: {
							_id:1,name:1,subject:1,action:1,body:1,modified:1,email_descriptions:1
						}},(err, result)=>{
							if(result){
								/** Send Success response */
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
						message	: res.__("admin.system.something_going_wrong_please_try_again")
					};
					resolve(response);
				}
			}
		});
	};//End templateDetails()

	/**
	 * Function for update notification template
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.editNotificationTemplate = (req, res,next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body 	= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let id 		= 	(req.params.id) ? req.params.id : "";

			consoleLog(req.body);

			if(id != "" && typeof req.body.email_descriptions !== typeof undefined && (typeof req.body.email_descriptions[DEFAULT_LANGUAGE_MONGO_ID] !== typeof undefined && req.body.email_descriptions[DEFAULT_LANGUAGE_MONGO_ID] && req.body.email_descriptions[DEFAULT_LANGUAGE_MONGO_ID] != "")){
				const clone		= 	require('clone');
				let allData		=	req.body;
				req.body		=	clone(allData.email_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
				req.body.name	=	(allData.name)	? allData.name 	:"";
				let pageBody 	= 	(req.body.body)	? req.body.body	:"";

				/** Check validation **/
			

				if(pageBody!= ""){
					req.body.body =  pageBody.replace(new RegExp(/&nbsp;|<br \/\>/g)," ").trim();
				}
				/** parse Validation array  **/
			
			
					try{
						let name	= 	(req.body.name) 		? 	req.body.name 		:"";
						let subject	=	(req.body.subject)		?	req.body.subject 	:"";
						let body	=	(req.body.body)			?	req.body.body 		:"";

						/** Update record **/
						const notification_templates = db.collection(TABLE_NOTIFICATION_TEMPLATES);
						notification_templates.updateOne({
								_id : ObjectId(id)
							},
							{$set: {
								name				:	name,
								subject				:	subject,
								body 				:	pageBody,
								email_descriptions	:	(allData.email_descriptions)	?	allData.email_descriptions	:{},
								modified			:	getUtcDate()
							}},(err,result)=>{
								if(!err){
									/** Send Success response **/
									req.flash(STATUS_SUCCESS,res.__("admin.notification_templates.notification_template_has_been_updated_successfully"));
									res.send({
										status: STATUS_SUCCESS,
										redirect_url : WEBSITE_ADMIN_URL+"notification_templates",
										message: res.__("admin.notification_templates.notification_template_has_been_updated_successfully"),
									});
								}else{
									/** Send error response **/
									res.send({
										status:STATUS_ERROR,
										message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
									});
								}
							}
						);
					}catch(e){
						/** Send error response **/
						res.send({
							status	:	STATUS_ERROR,
							message	: 	[{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
						});
					}
				
			}else{
				/** Send error response **/
				res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}
		}else{
			consoleLog("Inside Else");
			/** Get language list **/
			getLanguages(DEFAULT_LANGUAGE_MONGO_ID).then(languageList=>{
				/** Get email template details **/
				templateDetails(req, res).then((response)=>{
					consoleLog("Inside Else2");

					if(response.status == STATUS_SUCCESS){
						/** Render edit page*/
						req.breadcrumbs(BREADCRUMBS["admin/notification_templates/edit"]);
						res.render('edit',{
							result			: response.result,
							language_list	: languageList
						});
					}else{
						req.flash("error",response.message);
						res.redirect(WEBSITE_ADMIN_URL+"notification_templates");
					}
				});
			});
		}
	};//End editNotificationTemplate()
}
module.exports = new NotificaionTemplates();
