const async = require("async");
const clone = require('clone');

function States() {

	StatesModel = this;
	var exportSortConditions = { _id: SORT_DESC };
	/**
	 * Function for get list of States
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getStatesList = (req, res) => {
		let statusType = (req.params.type) ? req.params.type : "";
		if (isPost(req)) {

			let limit = (req.body.length) ? parseInt(req.body.length) : ADMIN_LISTING_LIMIT;
			let skip = (req.body.start) ? parseInt(req.body.start) : DEFAULT_SKIP;
			
			let statusSearch = (req.body.status_search) ? parseInt(req.body.status_search) : "";
			let countrySearch = (req.body.country_search) ? ObjectId(req.body.country_search) : "";
			const collection = db.collection(TABLE_STATES);

			/** Configure DataTable conditions*/
			configDatatable(req, res, null).then(dataTableConfig => {

				/** Set conditions **/
				let commonConditions = {
					"is_deleted": NOT_DELETED
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

				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions, commonConditions);
				
				async.parallel([
					(callback) => {
						collection.aggregate([
							{ $match: dataTableConfig.conditions },
							{ $sort: dataTableConfig.sort_conditions },
							{ $skip: skip },
							{ $limit: limit },
							{
								$lookup: {
									"from": "countries",
									"localField": "country_id",
									"foreignField": "_id",
									"as": "country_detail"
								}
							},
							{
								$project: {
									_id: 1,
									state_name: 1,
									country_id: 1,
									status: 1,
									created_at: 1,
									country_name: { "$arrayElemAt": ["$country_detail.country_name", 0] }
								}
							},
						]).toArray((err, response) => {
							result = (response && response) ? response : [];
							
							callback(err, result);
						})
					},
					(callback) => {
						/** Get total number of records in banner collection **/
						collection.find(commonConditions).count((err, countResult) => {
							callback(err, countResult);
						});
					},
					(callback) => {
						/** Get filtered records couting in banner **/
						collection.find(dataTableConfig.conditions).count((err, filterContResult) => {
							callback(err, filterContResult);
						});
					}
				],
					(err, response) => {

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
				]
			};
			getDropdownList(req, res,dropdownOptions).then(dropdownResponse=>{
				/** render listing page **/
				req.breadcrumbs(BREADCRUMBS["admin/states/list"]);
				res.render("list", {
					country_list	: (dropdownResponse && dropdownResponse.final_html_data && dropdownResponse.final_html_data["0"])	?	dropdownResponse.final_html_data["0"]:"",
					status_type: statusType,
				});
			});
			
		}
	};//End getStateList()

	/**
	 * Function for State's Detail
	 *
	 * @param req			As Request Data
	 * @param res 			As Response Data
	 *
	 * @return json
	 */
	let getStateDetails = (req, res) => {
		return new Promise(resolve => {
			let stateId = (req.params.id) ? req.params.id : "";
			if (!stateId || stateId == "") {
				let response = {
					status: STATUS_ERROR,
					message: res.__("admin.system.invalid_access")
				};
				resolve(response);
			} else {
				try {
					const states = db.collection(TABLE_STATES);
					states.findOne(
						{
							_id: ObjectId(stateId),
						}, (err, result) => {
							if (result) {

								/** Send success response **/
								let response = {
									status: STATUS_SUCCESS,
									result: (result && result && result) ? result : {}
								};
								resolve(response);

							} else {
								/** Send error response **/
								let response = {
									status: STATUS_ERROR,
									message: res.__("admin.system.invalid_access")
								};
								resolve(response);
							}
						}
					);
				} catch (e) {
					/** Send error response **/
					let response = {
						status: STATUS_ERROR,
						message: res.__("admin.system.something_going_wrong_please_try_again")
					};
					resolve(response);
				}
			}
		});
	};//End getStateDetails()

	/**
	 * Function for edit State
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editState = (req, res, next) => {
		var id = (req.params.id) ? req.params.id : "";
		if (isPost(req)) {
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

				req.body.state_name			=	(allData.state_name)			?	allData.state_name			:"";
				let multilinualData = allData.pages_descriptions;

				

				/** Configure state unique conditions **/
				const state = db.collection(TABLE_STATES);
				
				var country_id = (req.body.country_id) ? req.body.country_id : "";
				var state_name = (req.body.state_name) ? req.body.state_name : "";
					
				state.findOne(
				{
					"_id"			:	{$ne: ObjectId(id)},
					"country_id" 	:	ObjectId(country_id),
					"state_name" 	: 	new RegExp(["^", state_name, "$"].join(""), "i")
				},{_id:1},function (err, result) {
					if(!result){
						if (err) return next(err);

						let errMessageArray = [];
						if (errMessageArray.length > 0) {
							/** Send error response **/
							return res.send({
								status: STATUS_ERROR,
								message: errMessageArray,
							});
						}
						
						/** Set Update data */
						let updateData = {
							country_id: ObjectId(country_id),
							state_name: state_name,
							// pages_descriptions: multilinualData,
							updated_at: getUtcDate(),
						};

						/** Update state data **/
						state.updateOne({
							_id: ObjectId(id)
						}, { $set: updateData }, (updateErr, result) => {
							let options = {
								state_id :	id,
								state_name :	state_name,
							};
							/** updateStateName*/
							updateStateName(options).then(response=>{
								if(response){
								
								/** Send success response **/
								req.flash(STATUS_SUCCESS, res.__("admin.states.states_details_has_been_updated_successfully"));
								res.send({
									status: STATUS_SUCCESS,
									redirect_url: WEBSITE_ADMIN_URL + "states",
									message: res.__("admin.states.states_details_has_been_updated_successfully"),
								});
								}
							});
							if (updateErr) return next(updateErr);

						});
					}else{
						let errorsData = [];
						errorsData.push({'param':'state_name','location':'body','msg':res.__("admin.states.you_have_already_state")});
						return res.send({
							status	: STATUS_ERROR,
							message	: errorsData,
						});
					}
				});
		} else {
			getLanguages().then(languageList=>{
				/** Get state details **/
				getStateDetails(req, res).then(response => {
					var country_id = response.result['country_id'];
					if (response.status != STATUS_SUCCESS) {
						/** Send error response **/
						req.flash(STATUS_ERROR, response.message);
						res.redirect(WEBSITE_ADMIN_URL + "states");
						return;
					}
					let options = {
						collections: [
							{
								collection: "countries",
								columns: ["_id", "country_name"],
								selected: [country_id],
								conditions: {
									status: ACTIVE
								}
							}
						]
					}
					/** Render edit page **/
					getDropdownList(req, res, options).then(country_response => {
						req.breadcrumbs(BREADCRUMBS["admin/states/edit"]);
						res.render("edit", {
							country_list: (country_response && country_response.final_html_data && country_response.final_html_data["0"]) ? country_response.final_html_data["0"] : "",
							result: (response.result) ? response.result : {},
							language_list	: languageList
						});
					});
				}).catch(next);
			});
		}
	};//End editstate()

	/**
	 * Function for add state
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addState = (req, res, next) => {
		if (isPost(req)) {
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

				req.body.state_name			=	(allData.state_name)			?	allData.state_name			:"";
				let multilinualData = allData.pages_descriptions;

				/** Configure state unique conditions **/
				const states = db.collection(TABLE_STATES);
	
				var country_id = (req.body.country_id) ? req.body.country_id : "";
				var state_name = (req.body.state_name) ? req.body.state_name : "";
				
				 
				states.findOne(
				{
					"country_id" : ObjectId(country_id),
					"state_name" : new RegExp(["^", state_name, "$"].join(""), "i")
				},{_id:1},
				function (err, result) {
					if(!result){
						states.insertOne({
							country_id: ObjectId(country_id),
							state_name: state_name,
							status: ACTIVE,
							is_default:ACTIVE,
							is_deleted: DEACTIVE,
							created_at: getUtcDate(),
							updated_at: getUtcDate(),
						}, (err, result) => {
							if (err) return next(err);
							req.flash(STATUS_SUCCESS, res.__("admin.states.states_details_has_been_save_successfully"));
							res.send({
								status: STATUS_SUCCESS,
								redirect_url: WEBSITE_ADMIN_URL + "states",
								message: res.__("admin.states.states_details_has_been_save_successfully"),
							});
						});
					}else{
						let errorsData = [];
						errorsData.push({'param':'state_name','location':'body','msg':res.__("admin.states.you_have_already_state")});
						return res.send({
							status	: STATUS_ERROR,
							message	: errorsData,
						});
					}
				});
		} else {
			getLanguages().then(languageList=>{
				/** Render edit page **/

				let options = {
					collections: [
						{
							collection: TABLE_COUNTRY,
							columns: ["_id", "country_name"],
							conditions: {
								status: ACTIVE
							}
						},
					]
				}
				getDropdownList(req, res, options).then(response => {
					req.breadcrumbs(BREADCRUMBS["admin/states/add"]);
					res.render("add", {
						country_list: (response && response.final_html_data && response.final_html_data["0"]) ? response.final_html_data["0"] : "",
						language_list	: languageList
					});
				});
			});
		}
	};//End addState()

	/**
	 * Function for update state's status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.updateStatesStatus = (req, res) => {
		let stateId = (req.params.id) ? req.params.id : "";
		let userStatus = (req.params.status) ? req.params.status : "";
		let statusType = (req.params.status_type) ? req.params.status_type : "";

		if (stateId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))) {
			try {
				let updateData = {
					modified: getUtcDate()
				};
				if (statusType == ACTIVE_INACTIVE_STATUS) {
					updateData["status"] = (userStatus == ACTIVE) ? DEACTIVE : ACTIVE;
				}

				/** Update status*/
				const state = db.collection(TABLE_STATES);
				state.updateOne({ _id: ObjectId(stateId) }, { $set: updateData }, (err, result) => {
					if (!err) {
						/** Send success response **/
						req.flash(STATUS_SUCCESS, res.__("admin.states.states_status_has_been_updated_successfully"));
						res.redirect(WEBSITE_ADMIN_URL + "states");
					} else {
						/** Send error response **/
						req.flash(STATUS_ERROR, res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL + "states");
					}
				});
			} catch (e) {
				/** Send error response **/
				req.flash(STATUS_ERROR, res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL + "states");
			}
		} else {
			/** Send error response **/
			req.flash(STATUS_ERROR, res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL + "states");
		}
	};//End updateStateStatus()

}
module.exports = new States();
