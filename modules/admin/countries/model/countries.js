const async = require("async");
const clone		= 	require('clone');

function Countries() {

	CountryModel = this;

	/**
	 * Function for get list of country
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getCountryList = (req, res) => {
		let statusType = (req.params.type) ? req.params.type : "";
		if (isPost(req)) {

			let limit = (req.body.length) ? parseInt(req.body.length) : ADMIN_LISTING_LIMIT;
			let skip = (req.body.start) ? parseInt(req.body.start) : DEFAULT_SKIP;
			let statusSearch = (req.body.status_search) ? parseInt(req.body.status_search) : "";
			const collection = db.collection(TABLE_COUNTRY);

			/** Configure DataTable conditions*/
			
			configDatatable(req, res, null).then(dataTableConfig => {
				/** Set conditions **/
				let commonConditions = {
					//is_default: ACTIVE,
				};
				if(statusSearch == ACTIVE || statusSearch == SEARCHING_DEACTIVE){
					if(statusSearch == SEARCHING_DEACTIVE){
						statusSearch = DEACTIVE
					}
					commonConditions.status = statusSearch;
				}

				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions, commonConditions);

				async.parallel([

					(callback) => {
						/** Get list of country's **/
						collection.find(dataTableConfig.conditions, { _id: 1, country_name: 1, country_iso_code: 1, country_code:1,status: 1,updated_at:1,dial_code:1 }).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err, response) => {
							result = (response && response) ? response : [];
							callback(err, result);
						});
					},
					(callback) => {
						/** Get total number of records in country collection **/
						collection.find(commonConditions).count((err, countResult) => {
							callback(err, countResult);
						});
					},
					(callback) => {
						/** Get filtered records couting in country **/
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
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS["admin/countries/list"]);
			res.render("list", {
				status_type: statusType,
			});
		}
	};//End getCountryList()

	/**
	 * Function for country's Detail
	 *
	 * @param req			As Request Data
	 * @param res 			As Response Data
	 *
	 * @return json
	 */
	let getCountryDetails = (req, res) => {
		return new Promise(resolve => {
			let countryId = (req.params.id) ? req.params.id : "";
			if (!countryId || countryId == "") {
				let response = {
					status: STATUS_ERROR,
					message: res.__("admin.system.invalid_access")
				};
				resolve(response);
			} else {
				try {
					const countries = db.collection(TABLE_COUNTRY);
					countries.findOne(
						{
							_id: ObjectId(countryId),
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
	};//End getCountryDetails()



	/**
	 * Function for edit country
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editCountry = (async (req, res, next) => {
		let id  = req.params.id ? req.params.id : "";
		if (isPost(req) && id != "") {
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

				req.body.country_name			=	(allData.country_name)			?	allData.country_name		:"";
				let multilinualData = allData.pages_descriptions;

				

				const countries			= db.collection(TABLE_COUNTRY);
				var country_name		= (req.body.country_name) 		? req.body.country_name 	: "";
				var country_iso_code	= (req.body.country_iso_code)	? req.body.country_iso_code : "";
				var country_code		= (req.body.country_code)		? req.body.country_code 	: "";
				let dial_code 			=	(country_code) ? "+"+country_code : "";
				/** Configure user unique conditions **/
				countries.findOne({
					_id			: {$ne:ObjectId(id)},
					$or			: [
						{country_name 		: {$regex : "^"+country_name+"$",$options:"i"}},
						{country_iso_code 	: {$regex : "^"+country_iso_code+"$",$options:"i"}},
						{country_code 	: parseInt(country_code)},
					]
				},(err,resultCountry)=>{
					if(err) return next(err);
					let errMessageArray = [];
					if(resultCountry){
						/** Send error response **/
						let resultCountryName 	 	= (resultCountry.country_name) 			? resultCountry.country_name.toLowerCase()		: "";
						let resultCountryISOCode	= (resultCountry.country_iso_code) 		? resultCountry.country_iso_code.toLowerCase()	: "";
						let resultCountryCode	= (resultCountry.country_code) 		? parseInt(resultCountry.country_code)	: "";
						
						let enteredCountryName  	= country_name.toLowerCase();
						let enteredCountryISOCode  	= country_iso_code.toLowerCase();
						let enteredCountryCode  	= parseInt(country_code);
						
						/** Push error message in array if email or mobile already exists*/
						if(resultCountryName == enteredCountryName){
							errMessageArray.push({'param':'country_name','msg':res.__("admin.country.your_country_is_already_exist")});
						}
						if(resultCountryISOCode == enteredCountryISOCode){
							errMessageArray.push({'param':'country_iso_code','msg':res.__("admin.country.your_country_iso_code_is_already_exist")});
						}
						if(resultCountryCode == enteredCountryCode){
							errMessageArray.push({'param':'country_code','msg':res.__("admin.country.your_country_code_is_already_exist")});
						}
						
						return res.send({status	: STATUS_ERROR, message	: errMessageArray});
					}else{
						
						/** Set Update data */
						let updateData = {
							country_name: country_name,
							country_iso_code: country_iso_code,
							country_code: parseInt(country_code),
							// pages_descriptions: multilinualData,
							dial_code: dial_code,
							updated_at: getUtcDate(),
						};

						/** Update country data **/
						countries.updateOne({
							_id: ObjectId(id)
						}, { $set: updateData }, (updateErr, result) => {
							let options = {
								country_id :	id,
								country_name :	country_name,
							};
							/** updateCountryName*/
							updateCountryName(options).then(response=>{
								if(response){
									/** Send success response **/
									req.flash(STATUS_SUCCESS, res.__("admin.country.country_details_has_been_updated_successfully"));
									res.send({
										status: STATUS_SUCCESS,
										redirect_url: WEBSITE_ADMIN_URL + "countries",
										message: res.__("admin.country.country_details_has_been_updated_successfully"),
									});
								}
							});
							if (updateErr) return next(updateErr);
						});
					}
				});
		} else {
			/** Get language list **/
			getLanguages().then(languageList=>{
				/** Get country details **/
				getCountryDetails(req, res).then(response => {
					if (response.status != STATUS_SUCCESS) {
						/** Send error response **/
						req.flash(STATUS_ERROR, response.message);
						res.redirect(WEBSITE_ADMIN_URL + "countries");
						return;
					}

					/** Render edit page **/
					req.breadcrumbs(BREADCRUMBS["admin/countries/edit"]);
					res.render("edit", {
						language_list	:	languageList,
						result: (response.result) ? response.result : {}
					});
				}).catch(next);
			})
		}
	});//End editCountry()

	/**
	 * Function for add country
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addCountry = (req, res, next) => {
		if (isPost(req)) {
				/** Sanitize Data */
				req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
				if(req.body.blocks_descriptions == undefined || req.body.blocks_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == undefined || req.body.blocks_descriptions[DEFAULT_LANGUAGE_MONGO_ID] == ''){
					/** Send error response */
					return res.send({
						status	: STATUS_ERROR,
						message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
				}

				const clone			= require('clone');
				let allData			= req.body;
				req.body			= clone(allData.pages_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
				req.body.country_name	= (allData.country_name) 	? allData.country_name 	: "";
				var country_name		= (req.body.country_name) 		? req.body.country_name : "";
				var country_iso_code	= (req.body.country_iso_code)	? req.body.country_iso_code : "";
				var country_code		= (req.body.country_code)		? req.body.country_code : "";
				let dial_code 			=	(country_code) ? "+"+country_code : "";
				
				// var allData				= 	JSON.parse(JSON.stringify(req.body));
				// req.body				=	clone(allData);

				// req.body.country_name			=	(allData.country_name)			?	allData.country_name			:"";
				// let multilinualData = allData.pages_descriptions;

	
				/** Configure addCountry unique conditions **/
				const countries = db.collection(TABLE_COUNTRY);
	
				// var country_name		= (req.body.country_name) 		? req.body.country_name : "";
				// var country_iso_code	= (req.body.country_iso_code)	? req.body.country_iso_code : "";
				// var country_code		= (req.body.country_code)		? req.body.country_code : "";
				// let dial_code 			=	(country_code) ? "+"+country_code : "";
				
				/** Configure user unique conditions **/
				countries.findOne({
					$or			: [
						{country_name 		: {$regex : "^"+country_name+"$",$options:"i"}},
						{country_iso_code 	: {$regex : "^"+country_iso_code+"$",$options:"i"}},
						{country_code 	: parseInt(country_code)},
					]
				},(err,resultCountry)=>{
					if(err) return next(err);
					let errMessageArray = [];
					if(resultCountry){
						/** Send error response **/
						let resultCountryName 	 	= (resultCountry.country_name) 			? resultCountry.country_name.toLowerCase()		: "";
						let resultCountryISOCode	= (resultCountry.country_iso_code) 		? resultCountry.country_iso_code.toLowerCase()	: "";
						let resultCountryCode	= (resultCountry.country_code) 		? parseInt(resultCountry.country_code)	: "";
						
						let enteredCountryName  	= country_name.toLowerCase();
						let enteredCountryISOCode  	= country_iso_code.toLowerCase();
						let enteredCountryCode  	= parseInt(country_code);
						
						/** Push error message in array if email or mobile already exists*/
						if(resultCountryName == enteredCountryName){
							errMessageArray.push({'param':'country_name','msg':res.__("admin.country.your_country_is_already_exist")});
						}
						if(resultCountryISOCode == enteredCountryISOCode){
							errMessageArray.push({'param':'country_iso_code','msg':res.__("admin.country.your_country_iso_code_is_already_exist")});
						}
						if(resultCountryCode == enteredCountryCode){
							errMessageArray.push({'param':'country_code','msg':res.__("admin.country.your_country_code_is_already_exist")});
						}
						
						return res.send({status	: STATUS_ERROR, message	: errMessageArray});
					}else{	
					
						countries.insertOne({
							country_name: country_name,
							country_iso_code: country_iso_code,
							country_code: parseInt(country_code),
							// pages_descriptions: multilinualData,
							country_descriptions	: (allData.country_descriptions) ? allData.country_descriptions :{},
							dial_code: dial_code,
							status: ACTIVE,
							created_at: getUtcDate(),
							updated_at: getUtcDate(),
						}, (err, result) => {
							if (err) return next(err);
							req.flash(STATUS_SUCCESS, res.__("admin.country.country_details_has_been_save_successfully"));
							res.send({
								status: STATUS_SUCCESS,
								redirect_url: WEBSITE_ADMIN_URL + "countries",
								message: res.__("admin.country.country_details_has_been_save_successfully"),
							});
						});
					}
				});
		} else {
			getLanguages().then(languageList=>{
				/** Render edit page **/
				req.breadcrumbs(BREADCRUMBS["admin/countries/add"]);
				res.render("add", {
					language_list	: languageList
				});
			})
		}
	};//End addCountry()

	/**
	 * Function for update country's status
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.updateCountryStatus = (req, res) => {
		let bannnerId = (req.params.id) ? req.params.id : "";
		let userStatus = (req.params.status) ? req.params.status : "";
		let statusType = (req.params.status_type) ? req.params.status_type : "";

		if (bannnerId && (statusType && (statusType == ACTIVE_INACTIVE_STATUS))) {
			try {
				let updateData = {
					modified: getUtcDate()
				};
				if (statusType == ACTIVE_INACTIVE_STATUS) {
					updateData["status"] = (userStatus == ACTIVE) ? DEACTIVE : ACTIVE;
				}

				/** Update user status*/
				const countries = db.collection(TABLE_COUNTRY);
				countries.updateOne({ _id: ObjectId(bannnerId) }, { $set: updateData }, (err, result) => {
					if (!err) {
						/** Send success response **/
						req.flash(STATUS_SUCCESS, res.__("admin.country.country_status_has_been_updated_successfully"));
						res.redirect(WEBSITE_ADMIN_URL + "countries");
					} else {
						/** Send error response **/
						req.flash(STATUS_ERROR, res.__("admin.system.something_going_wrong_please_try_again"));
						res.redirect(WEBSITE_ADMIN_URL + "banner");
					}
				});
			} catch (e) {
				/** Send error response **/
				req.flash(STATUS_ERROR, res.__("admin.system.something_going_wrong_please_try_again"));
				res.redirect(WEBSITE_ADMIN_URL + "banner");
			}
		} else {
			/** Send error response **/
			req.flash(STATUS_ERROR, res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL + "banner");
		}
	};//End updateCountryStatus()

}
module.exports = new Countries();
