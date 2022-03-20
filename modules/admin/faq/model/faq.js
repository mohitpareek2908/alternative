function Faq() {

	/**
	 * Function to get cms list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getFaqList = (req, res)=>{
		if(isPost(req)){
			let limit			= 	(req.body.length) 	?	parseInt(req.body.length)	:ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start)	? 	parseInt(req.body.start)	:DEFAULT_SKIP;
			let userType		= (req.body.user_type_search)	? req.body.user_type_search	: "";
			const collection	=	db.collection(TABLE_FAQS);
			const async			= 	require('async');
			
			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				
				if (userType != "") {
					
					dataTableConfig.conditions["user_type"] 		= userType;
					
				}
				
				async.parallel([
					(callback)=>{
						/** Get list of cms **/
						collection.find(dataTableConfig.conditions,{_id:1,question:1,answer:1,modified:1,is_active:1,user_type:1}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err,result)=>{ 
							callback(err, result);
						});
					},
					(callback)=>{
						/** Get total number of records in pages collection **/
						collection.find({}).count((err,countResult)=>{ 
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in pages **/
						collection.find(dataTableConfig.conditions).count((err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err, response)=>{
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
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS['admin/faq/list']);
			res.render('list');
		}
	};//End getCmsList()

	/**
	 * Function to get cms's detail
	 *
	 * @param req	As	Request Data
	 * @param res	As	Response Data
	 * @param next	As 	Callback argument to the middleware function
	 * 
	 * @return json
	 */
	let getFaqDetails = (req,res,next)=>{
		return new Promise(resolve=>{
			let cmsId = (req.params.id) ? req.params.id : "";
			/** Get Cms details **/
			const faqs = db.collection(TABLE_FAQS);
			faqs.findOne({
					_id : ObjectId(cmsId)
				},
				{
					_id:1,name:1,body:1,modified:1,pages_descriptions:1,question:1,is_active:1
				},(err, result)=>{
					if(err) return next(err);
					
					if(!result){
						/** Send success response **/
						let response = {
							status	: STATUS_ERROR,
							message	: res.__("admin.system.invalid_access")
						};
						return resolve(response);
					}
					
					/** Send success response **/
					let response = {
						status	: STATUS_SUCCESS,
						result	: result
					};
					resolve(response);
				}
			);
		});
	};// End getFaqDetails().

	/**
	 * Function to update cms's detail
	 *
	 * @param req 	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 * 
	 * @return render/json
	 */
	this.editFaq = (req, res,next)=>{
		if(isPost(req)){
			/** Sanitize Data **/
			req.body	= 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let id		=	(req.params.id) ? req.params.id :"";
			
			if(id == "" || typeof req.body.pages_descriptions === typeof undefined || (typeof req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] === typeof undefined || !req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] || req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == '')){
				/** Send error response **/
				return res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}
			
			const clone		= 	require('clone');
			let allData		=	req.body;
			req.body		=	clone(allData.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
			let answer		= 	(req.body.answer)	?	req.body.answer	:"";
			req.body.user_type	= 	(allData.user_type) ? 	allData.user_type 	:"";
			/** Check validation **/
			

			if(answer!= ""){
				req.body.answer =  answer.replace(new RegExp(/&nbsp;|<br \/\>/g),' ').trim();
			}

			/** Update faq details **/
			let userType = 	(req.body.user_type) ?  req.body.user_type : ""
			const faqs = db.collection(TABLE_FAQS);
			faqs.updateOne({
					_id : ObjectId(id)
				},
				{$set: {
					answer				: 	answer,
					user_type			:	userType,
					question			: 	(req.body.question)	?	req.body.question	:"",
					default_language_id	: 	DEFAULT_LANGUAGE_MONGO_ID,
					pages_descriptions	: 	(allData.pages_descriptions) ? allData.pages_descriptions :{},
					modified 			:	getUtcDate()
				}},(err,result)=>{
					if(err) return next(err);
					
					/** Send success response **/
					req.flash(STATUS_SUCCESS,res.__("admin.faq.faq_has_been_updated_successfully"));
					res.send({
						status			: STATUS_SUCCESS,
						redirect_url	: WEBSITE_ADMIN_URL+'faq',
						message			: res.__("admin.faq.faq_has_been_updated_successfully"),
					});
				}
			);
		}else{
			/** Get language list **/
			getLanguages().then(languageList=>{
				/** Get faq details **/
				getFaqDetails(req,res,next).then(response=>{
					if(response.status != STATUS_SUCCESS){
						/** Send error response **/
						req.flash('error',response.message);
						res.redirect(WEBSITE_ADMIN_URL+'faq');
						return;
					}
					
					/** Render edit page **/
					req.breadcrumbs(BREADCRUMBS['admin/faq/edit']);
					res.render('edit',{
						result			: 	response.result,
						language_list	:	languageList
					});
				}).catch(next);
			}).catch(next);
		}
	};//End editFaq()
	
	/**
	 * Function for add cms
	 *
	 * @param req 	As	Request Data
	 * @param res 	As	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 * 
	 * @return render/json
	 */
	this.addFaq = (req, res,next)=>{
		//const {body, validationResult } = require('express-validator');
		if(isPost(req)){
			/** Sanitize Data */
			req.body = 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);			
			if(req.body.pages_descriptions === undefined || req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] === undefined || req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == ''){
				/** Send error response */
				return res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			}
			//console.log("req.body");
			//console.log(req.body);
			
			/*body('question').notEmpty()
			.withMessage((value, { req, location, path }) => {
				return req.__('admin.faq.please_enter_faq_question', { value, location, path });  
			}),
			(req, res) => {
				const errors = validationResult(req);
				
				console.log("errors");
				console.log(errors);
			}
			
			return false;*/
			const clone		= 	require('clone');
			let allData		= 	req.body;
			req.body		=	clone(allData.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
			let answer		= 	(req.body.answer)	?	req.body.answer	:"";
			let question	= 	(req.body.question) ? 	req.body.question 	:"";
			req.body.user_type	= 	(allData.user_type) ? 	allData.user_type 	:"";
			
			
			
			if(answer!= ""){
				req.body.body =  answer.replace(new RegExp(/&nbsp;|<br \/\>/g),' ').trim();
			}
			

			
			/** Set options **/
			let options = {
				title 		:	question,	
				table_name 	: 	TABLE_FAQS,	
				slug_field 	: 	"slug"	
			};
			let userType = 	(req.body.user_type) ?  req.body.user_type : ""
			/** Make Slug */
			getDatabaseSlug(options).then(response=>{
				/** Save Cms details */
				const faqs = db.collection('faqs');
				faqs.insertOne({
					question			:	question,
					answer				: 	answer,
					user_type			: 	userType,
					slug				: 	(response && response.title)	?	response.title	:"",
					default_language_id	: 	DEFAULT_LANGUAGE_MONGO_ID,
					is_active	: 	ACTIVE,
					pages_descriptions	: 	(allData.pages_descriptions)	?	allData.pages_descriptions :{},
					created 			: 	getUtcDate(),
					modified 			: 	getUtcDate()
				},(err,result)=>{
					if(err) return next(err);
						
					/** Send success response */
					req.flash(STATUS_SUCCESS,res.__("admin.faq.faq_has_been_added_successfully"));
					res.send({
						status			: STATUS_SUCCESS,
						redirect_url	: WEBSITE_ADMIN_URL+'faq',
						message			: res.__("admin.faq.faq_has_been_added_successfully")
					});
				});
			},error=>{
				/** Send error response */
				res.send({
					status	: STATUS_ERROR,
					message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				});
			});
		}else{
			/** Get language list */
			getLanguages().then(languageList=>{
				req.breadcrumbs(BREADCRUMBS['admin/faq/add']);
				/**Render add cms page */
				res.render('add',{
					language_list	: languageList
				});
			}).catch(next);
		}
	};//End addFaq()
	
	/** 
	 *  * Function for delete faq
	 *
	 * @param req 	As	Request Data
	 * @param res 	As	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 * 
	 * @return render/json
	 * **/
	this.deleteFaq = (req,res,next)=>{
		var response	=	(req.body.data) ? 	req.body.data:"";
		var faqId		=	(req.params.id)	?	req.params.id		:	"";
		
		var faqs = db.collection(TABLE_FAQS);
		
		faqs.findOne({
			_id :	ObjectId(faqId),
		},{
			_id:1,
		},function(error,faqResult){
			if(faqResult != null)
			{
				faqs.deleteOne({
					_id : ObjectId(faqId),
				},{_id:1},
				(err,removeData)=>{
					
					if(err) return next(err);
					/** Send success response */
					/** Send success response **/
					req.flash(STATUS_SUCCESS,res.__("admin.faq.faq_deleted_successfully"));
					res.redirect(WEBSITE_ADMIN_URL+"faq");
					
				});
			}
			
		});
		 
	};
	
		/**
	 * Function for update faq's status
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As Callback argument to the middleware function
	 *
	 * @return null
	 */
	this.updateFaqStatus = (req, res, next)=>{
		let faqId		=	(req.params.id) 				?	req.params.id 	:"";
		let faqStatus	= 	(req.params.status == ACTIVE) 	? 	DEACTIVE 		:ACTIVE;
		
		/** Update Faq record **/
		const faqs = db.collection('faqs');
		faqs.updateOne({
				_id : ObjectId(faqId)
			},
			{$set : {
				is_active 	: faqStatus,
				modified	: getUtcDate()
			}},(err, result)=>{
				if(err) return next(err);

				/** Send success response **/
				req.flash(STATUS_SUCCESS,res.__("admin.faq.faq_status_has_been_updated_successfully"));
				res.redirect(WEBSITE_ADMIN_URL+"faq");
			}
		);
	};//End updateFaqStatus()
	
	/**
	 * Function for view faq's detail
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render
	 */
	this.viewFaqDetails = (req,res,next)=>{
		
		/** Get faq details **/
		getFaqDetails(req, res, next).then((response)=>{
			if(response.status != STATUS_SUCCESS){
				/** Send error response **/
				req.flash(STATUS_ERROR,response.message);
				res.redirect(WEBSITE_ADMIN_URL+"faq");
				return;
			}
			
			/** Render view page  **/
			req.breadcrumbs(BREADCRUMBS['admin/faq/view']);
			res.render('view',{
				result	:	(response.result) ? response.result	:{},
			});
		}).catch(next);
	};//End viewFaqDetails()
	
}
module.exports = new Faq();
