const async		= 	require("async");
const clone		= 	require('clone');

const asyncParallel = require("async/parallel");
function Cities() {

	CitiesModel 	= 	this;

	/** Use in export data **/
	var exportFilterConditions 	=	{};
	var exportSortConditions	= 	{_id:SORT_DESC};


	/**
	 * Function for get list of city
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.getCityList = (req, res)=>{
		let statusType	=	(req.params.type)	?	req.params.type	:"";
		if(isPost(req)){
			let limit			= 	(req.body.length) 			? 	parseInt(req.body.length) 			:ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start)  			?	parseInt(req.body.start)  			:DEFAULT_SKIP;
			let statusSearch	= 	(req.body.status_search)	? 	parseInt(req.body.status_search)	:"";
			let countrySearch 	= 	(req.body.country_search) 	?	ObjectId(req.body.country_search) 	:"";
			let stateSearch 	= 	(req.body.state_search) 	?	ObjectId(req.body.state_search) 	:"";
			const collection	= 	db.collection(TABLE_CITY);

			/** Configure DataTable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Set conditions **/
				let commonConditions = {
					//status		: 	ACTIVE,
				};
				if(statusSearch == ACTIVE || statusSearch == SEARCHING_DEACTIVE){
					if(statusSearch == SEARCHING_DEACTIVE){
						statusSearch = DEACTIVE
					}
					commonConditions.status = statusSearch;
				}
				if(countrySearch != ""){
					commonConditions.country_id = countrySearch;
				}
				if(stateSearch != ""){
					commonConditions.state_id = stateSearch;
				}

				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);

				asyncParallel([
					(callback)=>{
						collection.aggregate([
							{$match : dataTableConfig.conditions},
							{$sort : dataTableConfig.sort_conditions},
							{$skip  : skip},
							{$limit : limit},
							{ $lookup:{
									"from"			:	TABLE_COUNTRY,
									"localField"	:	"country_id",
									"foreignField"	:	"_id",
									"as"			:	"country_detail"
							}},
							{
								$lookup:{
									"from"			:	TABLE_STATES,
									"localField"	:	"state_id",
									"foreignField"	:	"_id",
									"as"			:	"states_detail"
								}
							},
							{
								$project	:	{
									_id				:	1,
									city_name		:	1,
									country_id		:	1,
									state_id		:	1,
									status			:	1,
									created_at		:	1,
									country_name	: 	{ "$arrayElemAt" : ["$country_detail.country_name",0] },
									state_name		: 	{ "$arrayElemAt" : ["$states_detail.state_name",0] }
								}
							},
						]).toArray((err,response)=>{
							result = (response && response)	?	response	:[];
							callback(err, result);
						})
					},
					(callback)=>{
						/** Get total number of records in city collection **/
						collection.find(commonConditions).count((err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records couting in city collection **/
						collection.find(dataTableConfig.conditions).count((err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err,response)=>{
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
			/***** Set dropdown options ******/
			let dropdownOptions = {
				collections : [
					{
						collection 	: 	TABLE_COUNTRY,
						columns 	: 	["_id","country_name"],
						conditions 	: 	{
							status		:	 ACTIVE,
						},
					},
					{
						collection 	: 	TABLE_STATES,
						columns 	: 	["_id","state_name"],
						conditions 	: 	{
							status		:	 ACTIVE,
						},
					},
				]
			};
			getDropdownList(req, res,dropdownOptions).then(dropdownResponse=>{
				/** render listing page **/
				req.breadcrumbs(BREADCRUMBS["admin/cities/list"]);
				res.render("list", {
					country_list	: (dropdownResponse && dropdownResponse.final_html_data && dropdownResponse.final_html_data["0"])	?	dropdownResponse.final_html_data["0"]:"",
					state_list	: (dropdownResponse && dropdownResponse.final_html_data && dropdownResponse.final_html_data["1"])	?	dropdownResponse.final_html_data["1"]:"",
					status_type: statusType,
				});
			});
		}
	};//End getCityList()


	/**
	 * Function for city's Detail
	 *
	 * @param req			As Request Data
	 * @param res 			As Response Data
	 *
	 * @return json
	 */
	let getCityDetails = (req,res)=>{
		return new Promise(resolve=>{
			let cityId	=	(req.params.id)	?	req.params.id	:"";
			if(!cityId || cityId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				try{
					const cities	= db.collection(TABLE_CITY);
					cities.findOne(
						{
							_id 			: 	ObjectId(cityId),
						},(err, result)=>{
							if(result){
								/** Send success response **/
								let response = {
									status	: STATUS_SUCCESS,
									result	: (result && result && result)	?	result	:{}
								};
								resolve(response);

							}else{
								/** Send error response **/
								let response = {
									status	: STATUS_ERROR,
									message	: res.__("admin.system.invalid_access")
								};
								resolve(response);
							}
						}
					);
				}catch(e){
					/** Send error response **/
					let response = {
						status	: STATUS_ERROR,
						message	: res.__("admin.system.something_going_wrong_please_try_again")
					};
					resolve(response);
				}
			}
		});
	};//End getCityDetails()



	/**
	 * Function for edit city
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editcity = (req,res,next)=>{
		if(isPost(req)){
			let id 		= 	(req.params.id)		? 	req.params.id	:"";
				/** Sanitize Data */
				req.body = 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
				// if(typeof req.body.pages_descriptions == typeof undefined && (typeof req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == typeof undefined && req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] && req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == "")){
				// 	return res.send({
				// 		status	: STATUS_ERROR,
				// 		message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				// 	});
				// }
				
				var allData				= 	JSON.parse(JSON.stringify(req.body));
				req.body				=	clone(allData);

				req.body.city_name			=	(allData.city_name)			?	allData.city_name			:"";
				let multilinualData = allData.pages_descriptions;
	
				/** Configure banner unique conditions **/
				const cities	=	db.collection(TABLE_CITY);
	
				var country_id 	=	(req.body.country_id)	?	req.body.country_id	:	"";
				var state_id	=	(req.body.state_id) 	? 	req.body.state_id	:	"";
				var city_name	=	(req.body.city_name) 	? 	req.body.city_name	:	"";
				
				
				cities.findOne(
				{
					"_id"			:	{$ne: ObjectId(id)},
					"country_id"	:	ObjectId(country_id),
					"state_id" 		:	ObjectId(state_id),
					"city_name" 	: 	new RegExp(["^", city_name, "$"].join(""), "i")
				},{_id:1},
				function (err, result) {
					if(!result){
						if(err) return next(err);
		
						let errMessageArray =[];
		
						if(errMessageArray.length > 0){
							/** Send error response **/
							return res.send({
								status	: STATUS_ERROR,
								message	: errMessageArray,
							});
						}
						var country_id 	=	(req.body.country_id)	?	req.body.country_id	:	"";
						var state_id	=	(req.body.state_id) 	? req.body.state_id		:	"";
						var city_name	=	(req.body.city_name) 	? req.body.city_name	:	"";
		
						/** Set Update data */
						let updateData	=	{
							country_id			: 	ObjectId(country_id),
							state_id			: 	ObjectId(state_id),
							// pages_descriptions	:	multilinualData,
							city_name 			: 	city_name,
							updated_at 			: 	getUtcDate(),
						};
		
		
						/** Update city data **/
						cities.updateOne({
							_id : ObjectId(id)
						},{$set : updateData},(updateErr,result)=>{
							let options = {
								city_id :	id,
								city_name :	city_name,
							};
							/** updateCityName*/
							updateCityName(options).then(response=>{
								if(response){
									/** Send success response **/
									req.flash(STATUS_SUCCESS,res.__("admin.city.city_details_has_been_updated_successfully"));
									res.send({
										status		: STATUS_SUCCESS,
										redirect_url: WEBSITE_ADMIN_URL+"cities",
										message		: res.__("admin.city.city_details_has_been_updated_successfully"),
									});
								}
							});
							if(updateErr) return next(updateErr);
						});
					}else{
						let errorsData = [];
						errorsData.push({'param':'city_name','location':'body','msg':res.__("admin.city.you_have_already_city")});
						return res.send({
							status	: STATUS_ERROR,
							message	: errorsData,
						});
					}	
				});
		}else{
			/** Get language list **/
			getLanguages().then(languageList=>{
				/** Get city details **/
				getCityDetails(req, res).then(response=>{
					var country_id 	= response.result['country_id'];
					var state_id	= response.result['state_id'];
					consoleLog(response);
					if(response.status != STATUS_SUCCESS){
						/** Send error response **/
						req.flash(STATUS_ERROR,response.message);
						res.redirect(WEBSITE_ADMIN_URL+"cities");
						return;
					}
					let options = {
						collections :[
							{
								collection	:	"countries",
								columns		:	["_id","country_name"],
								selected	:	[country_id],
								conditions:{
									status :	ACTIVE
								}
							},
							{
								collection	:	"states",
								columns		:	["_id","state_name"],
								selected	:	[state_id],
								conditions:{
										status :	ACTIVE
									}
							},
						]

					}
					/** Render edit page **/
					getDropdownList(req,res,options).then(country_response=> {
						req.breadcrumbs(BREADCRUMBS["admin/cities/edit"]);
						res.render("edit",{
							country_list	:	(country_response && country_response.final_html_data && country_response.final_html_data["0"])	?	country_response.final_html_data["0"]:"",
							states_list		:	(country_response && country_response.final_html_data && country_response.final_html_data["1"])	?	country_response.final_html_data["1"]:"",
							language_list	:	languageList,
							result 			: (response.result) ? response.result :{}
						});
					});
				}).catch(next);
			})
		}
	};//End editcity()



	/**
	 * Function for add city
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addCity = (req,res,next)=>{
		
		if(isPost(req)){
				/** Sanitize Data */
				req.body = 	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
				// if(typeof req.body.pages_descriptions == typeof undefined && (typeof req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == typeof undefined && req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] && req.body.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == "")){
				// 	return res.send({
				// 		status	: STATUS_ERROR,
				// 		message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
				// 	});
				// }
				
				var allData				= 	JSON.parse(JSON.stringify(req.body));
				req.body				=	clone(allData);

				req.body.city_name			=	(allData.city_name)			?	allData.city_name			:"";
				let multilinualData = allData.pages_descriptions;
				
	
				/** Configure banner unique conditions **/
				const cities	=	db.collection(TABLE_CITY);
	
				var country_id 	=	(req.body.country_id)	?	req.body.country_id	:	"";
				var state_id	=	(req.body.state_id) 	? 	req.body.state_id	:	"";
				var city_name	=	(req.body.city_name) 	? 	req.body.city_name	:	"";
				
				cities.findOne(
				{
					"country_id"	: ObjectId(country_id),
					"state_id" 		: ObjectId(state_id),
					"city_name" 	: 	new RegExp(["^", city_name, "$"].join(""), "i")
				},{_id:1},
				(err, result) =>  {

					
					if(!result){
						consoleLog("Add city FUNCTIOn reached  AAAaa10101");
						cities.insertOne({
							country_id			: 	ObjectId(country_id),
							state_id			: 	ObjectId(state_id),
							city_name 			: 	city_name,
							// pages_descriptions 	: 	multilinualData,
							status				: 	ACTIVE,
							is_deleted			: 	DEACTIVE,
							created_at 			: 	getUtcDate(),
							updated_at 			: 	getUtcDate(),
						},(err,result)=>{
							if(err) return next(err);
							req.flash(STATUS_SUCCESS,res.__("admin.city.city_details_has_been_save_successfully"));
							res.send({
								status		: STATUS_SUCCESS,
								redirect_url: WEBSITE_ADMIN_URL+"cities",
								message		: res.__("admin.city.city_details_has_been_save_successfully"),
							});
						});
					}else{
						 let errorsData = [];
						errorsData.push({'param':'city_name','location':'body','msg':res.__("admin.city.you_have_already_city")});
						return res.send({
							status	: STATUS_ERROR,
							 message	: errorsData,
						});
					}
				});
		}else{
			
			const citiesDb	=	db.collection(TABLE_CITY);
			
			getLanguages().then(languageList=>{
			/** Render edit page **/

				let options = {
					collections:[
						{
							collection:	"countries",
							columns	:	["_id","country_name"],
							conditions:{
									status :	ACTIVE
								}
						},
						{
							collection:	"states",
							columns	:	["_id","state_name"],
							conditions:{
									status :	ACTIVE
								}
						},
					]
				}
				getDropdownList(req,res,options).then(response=> {

					req.breadcrumbs(BREADCRUMBS["admin/cities/add"]);
					res.render("add",{
						country_list	:	(response && response.final_html_data && response.final_html_data["0"])	?	response.final_html_data["0"]:"",
						states_list		:	(response && response.final_html_data && response.final_html_data["1"])	?	response.final_html_data["1"]:"",
						language_list	: 	languageList
					});
				});
			});
		}
	};//End addCity()


	/**
	 * Function for update cities status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.updateCityStatus = (req,res)=>{
		let stateId		 = 	(req.params.id) 			?	req.params.id 			:"";
		let userStatus	 =	(req.params.status) 		? 	req.params.status	 	:"";
		let statusType	 =	(req.params.status_type) 	? 	req.params.status_type	:"";

		if(stateId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))){
			try{
				let updateData = {
					modified 	:	getUtcDate()
				};
				if(statusType == ACTIVE_INACTIVE_STATUS){
					updateData["status"]			=	(userStatus==ACTIVE) ? DEACTIVE :ACTIVE;
				}

				/** Update city status*/
				const cities = db.collection(TABLE_CITY);
				cities.updateOne({_id : ObjectId(stateId)},{$set :updateData},(err,result)=>{
					if(!err){
						/** Send success response **/
						req.flash(STATUS_SUCCESS,res.__("admin.city.city_status_has_been_updated_successfully"));
						res.redirect(WEBSITE_ADMIN_URL+"cities");
					}else{
						/** Send error response **/
						req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL+"cities");
					}
				});
			}catch(e){
				/** Send error response **/
				req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL+"cities");
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"states");
		}
	};//End updateCityStatus()


	/**
	 *  Function for get states list for dropdown
	 */
	this.getStateListCountryWise	= 	(req,res)=>{
		var states					=	db.collection('states');
		var country_id				=	(req.params.country_id) ? req.params.country_id : 0;
		states.find(
		{
			'is_deleted' 	: 	NOT_DELETED,
			'status'		: 	ACTIVE,
			'country_id'	:	ObjectId(country_id)
		},
		{
			_id			:	1,
			state_name	:	1,
			country_id	:	1
		}).sort({state_name:1}).toArray(function (err, result) {
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
	};// getStateListCountryWise

	/**
	 *  Function for get states list for dropdown
	 */
	this.getDistrictListStateWise	= 	(req,res)=>{
		var districts				=	db.collection('districts');
		var state_id				=	(req.params.state_id) ? req.params.state_id : 0;
		districts.find(
		{
			'is_deleted' 	: 	NOT_DELETED,
			'status'		: 	ACTIVE,
			'state_id'		:	ObjectId(state_id)
		},
		{
			_id				:	1,
			district_name	:	1,
			state_id		:	1
		}).sort({district_name:1}).toArray(function (err, result) {
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
	};// getDistrictListStateWise

}
module.exports = new Cities();
