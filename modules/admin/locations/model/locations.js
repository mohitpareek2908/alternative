const vehicleService = require(WEBSITE_SERVICES_FOLDER_PATH+'vehicle_service');
const async			 = require('async');
const asyncParallel  = require("async").parallel;
function Locations() {

	/**
	 * Function to  get workable cities 
	 *
	 * @param req 	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.list = (req, res,next)=>{
		if(isPost(req)){

			let limit			= (req.body.length) 		? parseInt(req.body.length) 		: ADMIN_LISTING_LIMIT;
			let skip			= (req.body.start)  		? parseInt(req.body.start)  		: DEFAULT_SKIP;
			const collection	= db.collection("cities");

			/** Configure DataTable conditions*/
			configDatatable(req,res,null).then(dataTableConfig=>{
				/** Set conditions **/
				let commonConditions = {
					is_workable		: 	ACTIVE,
				};

				dataTableConfig.conditions = Object.assign(dataTableConfig.conditions);
				async.parallel([
					(callback)=>{
						collection.aggregate([
							{
								$match : commonConditions
							},
							{
								$lookup : {
									from			: TABLE_COUNTRY,
									localField		: "country_id",
									foreignField	: "_id",
									as				: "countryDetail"
								}
							},
							{
								$project : {
									
									"city_name":1,
									"status":1,
									"created_at":1,
									"location_at":1,
									"country_name": { $arrayElemAt:["$countryDetail.country_name",0] }
								}
							},
							{$match	: dataTableConfig.conditions},
							{$sort  : dataTableConfig.sort_conditions},
							{$skip 	: skip},
							{$limit : limit},
						]).toArray((err, result)=>{
							callback(err, result);
						})
					},
					(callback)=>{
						/** Get total number of records in cities collection **/
						collection.countDocuments(commonConditions,(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records couting in cities **/
						collection.countDocuments(commonConditions,(err,filterContResult)=>{
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
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS['admin/locations/list']);
			res.render('list');
		}
	};//End list()
	
	
	/**
	 * Function for add Location
	  *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.addLocation = (req,res,next)=>{
		if(isPost(req)){
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let slugArray		=	(req.body.slug)	?	req.body.slug	:	[];
			let countryId		=	(req.body.country_id)	?	req.body.country_id	:	[];
			let tLatitude		=	(req.body.tLatitude)	?	req.body.tLatitude	:	[];
			let tLongitude		=	(req.body.tLongitude)	?	req.body.tLongitude	:	[];
			let city_id			=	(req.body.city_id)	?	req.body.city_id	:	[];
			
			/** Check validation **/
			req.checkBody({
				"tLatitude": {
					notEmpty: true,
					errorMessage: res.__("admin.locations.please_select_location")
				},
				"tLongitude": {
					notEmpty: true,
					errorMessage: res.__("admin.locations.please_select_location")
				},
				"country_id": {
					notEmpty: true,
					errorMessage: res.__("admin.locations.please_select_country")
				},
				"city_id": {
					notEmpty: true,
					errorMessage: res.__("admin.locations.please_select_city_id")
				},
			});
			
			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			
			/** Send error response **/
			if(errors==false){
				errors = [];	
			}
			var newData 			=	[];
			var vehicleFareArray 	=	{};
			var requiredMsg			=	res.__("admin.locations.this_field_is_required");
			
			slugArray.map((records,index)=>{				
				var basic_fare_name 				= "basic_fare_"+records;
				var waitng_fare_name 				= "waitng_fare_"+records;
				var price_per_km 					= "price_per_km_"+records;
				var price_per_minute 				= "price_per_minute_"+records;
				var minimum_fare 					= "minimum_fare_"+records;
				var commission						= "commission_"+records;
				var night_charges 					= "night_charges_"+records;
				
				// basic_fare validaion
				if(req.body[basic_fare_name]==''){
					errors.push({'location':'body','param':'basic_fare_'+records,'msg':requiredMsg,'value':req.body[basic_fare_name]});
				}
				
				// waitng_fare_name validaion
				if(req.body[waitng_fare_name]==''){
					errors.push({'param':'waitng_fare_'+records,'msg':requiredMsg,'value':req.body[waitng_fare_name]});
				}
				
				// price_per_km validaion
				if(req.body[price_per_km]==''){
					errors.push({'param':'price_per_km_'+records,'msg':requiredMsg,'value':req.body[price_per_km]});
				}
				
				// price_per_minute validaion
				if(req.body[price_per_minute]==''){
					errors.push({'param':'price_per_minute_'+records,'msg':requiredMsg,'value':req.body[price_per_minute]});
				}
				
				// minimum_fare validaion
				if(req.body[minimum_fare]==''){
					errors.push({'param':'minimum_fare_'+records,'msg':requiredMsg,'value':req.body[minimum_fare]});
				}
				
				// commission validaion
				if(req.body[commission]==''){
					errors.push({'param':'commission_'+records,'msg':requiredMsg,'value':req.body[commission]});
				}
				
				// night_charges validaion
				if(req.body[night_charges]==''){
					errors.push({'param':'night_charges_'+records,'msg':requiredMsg,'value':req.body[night_charges]});
				}
				
				var fareDataNew = {};
				fareDataNew = {
					basic_fare 							: Number(req.body[basic_fare_name]),
					waitng_fare 						: Number(req.body[waitng_fare_name]),
					price_per_km 						: Number(req.body[price_per_km]),
					price_per_minute					: Number(req.body[price_per_minute]),
					minimum_fare						: Number(req.body[minimum_fare]),
					commission							: Number(req.body[commission]),
					night_charges						: Number(req.body[night_charges]),
				}
				if(typeof vehicleFareArray[records] == 'undefined'){
					vehicleFareArray[records] = fareDataNew;
				}else{
					vehicleFareArray[records].push(fareDataNew);
				}
			});
			
			/** Send error response **/
			if(errors.length>0){
				return res.send({status : STATUS_ERROR, message	: errors});
			}
			let coordinatesArr = [];
			let latVal 	= req.body.tLatitude.split(',');
			let longVal = req.body.tLongitude.split(',');
			let firstIndex = [];
			latVal.map((latRecord,index)=>{
				var latNumber = Number(latRecord);
				if(index == 0){
					firstIndex.push(Number(latVal[index]),Number(longVal[index]))
				}
				if(latNumber != 0){
					coordinatesArr.push([Number(latRecord),Number(longVal[index])]);
				}
			});
			coordinatesArr.push(firstIndex);
			var polygonsObj = {
				"type": "Polygon",
				"coordinates": [
					coordinatesArr,
				]
			}
			/*let updateData = {
				updated_at 		:	getUtcDate(),
				polygons 		: 	polygonsObj,
				vehicles_fare	: 	vehicleFareArray,
				tLatitude		:	tLatitude,
				tLongitude		:	tLongitude,
			}
			let cityInsertData = {
				city_name 	:	location_name,
				country_id 	:	ObjectId(countryId),
				status		: 	ACTIVE,
				is_workable	:	ACTIVE,
				created_at	:	getUtcDate(),
			}*/
			/**Add Location in city*/
			const cities	= 	db.collection(TABLE_CITY);
			
			//var cityRegex 		= 	new RegExp(["^", location_name, "$"].join(""), "i"); //case-insensitive query?
			
			cities.updateOne({
				_id : ObjectId(city_id)
			},{
				$set : {
					"polygons":
					  {"type":"Polygon",
						 coordinates:
						  [
							coordinatesArr
						  ]
					  }
					,is_workable	:	ACTIVE,
					vehicles_fare	: 	vehicleFareArray,
					tLatitude		:	tLatitude,
					tLongitude		:	tLongitude,
					location_at		:	getUtcDate(),
				}
			 },(insertErr,insertSuccess)=>{
				/** Success Return**/
					req.flash(STATUS_SUCCESS,res.__("admin.location.location_has_been_added_successfully"));
					
					res.send({
						status		: STATUS_SUCCESS,
						redirect_url: WEBSITE_ADMIN_URL+"locations/workable_locations",
						message		: res.__("admin.location.location_has_been_added_successfully"),
					});
			});
		}else{
			const vechicleType	= 	db.collection(TABLE_VEHICLE_TYPE);
			const cities		= 	db.collection(TABLE_CITY);
			vechicleType.find({is_deleted:NOT_DELETED,status:ACTIVE},{projection	:{vehicle_type:1,slug:1}}).toArray((errVechicle,resultVechicle)=>{
				
				/** already add city find*/
				cities.distinct("_id", {is_workable:ACTIVE},(errCity,alreadyAddWorkableCityIds)=>{
				
					/** Get country data*/
					let options = {
						collections :[ {
							collection	:	TABLE_COUNTRY,
							columns		:	["_id","country_name"],
							selected	:	[DEFAULT_COUNTRY_ID],
							conditions:{
								status 	:	ACTIVE,
								_id		:	ObjectId(DEFAULT_COUNTRY_ID)
							}
						},
						{
							collection 	: TABLE_CITY,
							columns 	: ["_id","city_name"],
							conditions 	: {
								status		:	ACTIVE,
								is_deleted	:	DEACTIVE,
								_id			:	{$nin:alreadyAddWorkableCityIds},
								country_id 	:	ObjectId(DEFAULT_COUNTRY_ID)
							},
						}
						]
					}
					
					/** Render edit page **/
					getDropdownList(req,res,options).then(country_response=> {
						/** Render add page **/
						req.breadcrumbs(BREADCRUMBS["admin/locations/add"]);
						res.render("add",{
							vechicle_data	:	resultVechicle,
							country_list	:	(country_response && country_response.final_html_data && country_response.final_html_data["0"])	?	country_response.final_html_data["0"]:"",
							city_list	:	(country_response && country_response.final_html_data && country_response.final_html_data["1"])	?	country_response.final_html_data["1"]:"",
						});
					}).catch(next);
				});
			});
		}
	};//End addLocation()

	
	/**
	 * Function for  edit location workable
	 *
	 * @param req 	As 	Request Data
     * @param res 	As 	Response Data
     * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return render/json
	 */
	this.editLocationWorkable = (req,res,next)=>{
		let cityId	=	(req.params.id)	?	req.params.id	:	req.params.id;	
		if(isPost(req)){
			req.body 			=	sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
			let slugArray		=	(req.body.slug)			?	req.body.slug		:	[];
			let tLatitude		=	(req.body.tLatitude)	?	req.body.tLatitude	:	[];
			let tLongitude		=	(req.body.tLongitude)	?	req.body.tLongitude	:	[];
			
			/** Check validation **/
			req.checkBody({
				"tLatitude": {
					notEmpty: true,
					errorMessage: res.__("admin.locations.please_select_location")
				},
				"tLongitude": {
					notEmpty: true,
					errorMessage: res.__("admin.locations.please_select_location")
				},
				/**"country_id": {
					notEmpty: true,
					errorMessage: res.__("admin.locations.please_select_country")
				},
				"city_id": {
					notEmpty: true,
					errorMessage: res.__("admin.locations.please_select_city_id")
				},*/
			});
			
			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			
			/** Send error response **/
			if(errors==false){
				errors = [];	
			}
			
			var newData 			= 	[];
			var vehicleFareArray 	= 	{};
			var requiredMsg			=	res.__("admin.locations.this_field_is_required");
			
			slugArray.map((records,index)=>{
				
				var basic_fare_name 				= "basic_fare_"+records;
				var waitng_fare_name 				= "waitng_fare_"+records;
				var price_per_km 					= "price_per_km_"+records;
				var price_per_minute 				= "price_per_minute_"+records;
				var minimum_fare 					= "minimum_fare_"+records;
				var commission						= "commission_"+records;
				var night_charges 					= "night_charges_"+records;
				
				// basic_fare validaion
				if(req.body[basic_fare_name]==''){
					errors.push({'location':'body','param':'basic_fare_'+records,'msg':requiredMsg,'value':req.body[basic_fare_name]});
				}
				
				// waitng_fare_name validaion
				if(req.body[waitng_fare_name]==''){
					errors.push({'param':'waitng_fare_'+records,'msg':requiredMsg,'value':req.body[waitng_fare_name]});
				}
				
				// price_per_km validaion
				if(req.body[price_per_km]==''){
					errors.push({'param':'price_per_km_'+records,'msg':requiredMsg,'value':req.body[price_per_km]});
				}
				
				// price_per_minute validaion
				if(req.body[price_per_minute]==''){
					errors.push({'param':'price_per_minute_'+records,'msg':requiredMsg,'value':req.body[price_per_minute]});
				}
				
				// minimum_fare validaion
				if(req.body[minimum_fare]==''){
					errors.push({'param':'minimum_fare_'+records,'msg':requiredMsg,'value':req.body[minimum_fare]});
				}
				
				// commission validaion
				if(req.body[commission]==''){
					errors.push({'param':'commission_'+records,'msg':requiredMsg,'value':req.body[commission]});
				}
				
				// night_charges validaion
				if(req.body[night_charges]==''){
					errors.push({'param':'night_charges_'+records,'msg':requiredMsg,'value':req.body[night_charges]});
				}
				
				
				var fareDataNew = {};
				fareDataNew = {
					basic_fare 							: Number(req.body[basic_fare_name]),
					waitng_fare 						: Number(req.body[waitng_fare_name]),
					price_per_km 						: Number(req.body[price_per_km]),
					price_per_minute					: Number(req.body[price_per_minute]),
					minimum_fare						: Number(req.body[minimum_fare]),
					commission							: Number(req.body[commission]),
					night_charges						: Number(req.body[night_charges]),
				}
				if(typeof vehicleFareArray[records] == 'undefined'){
					vehicleFareArray[records] = fareDataNew;
				}else{
					vehicleFareArray[records].push(fareDataNew);
				}
				
			});
			
			/** Send error response **/
			if(errors.length>0){
				return res.send({status : STATUS_ERROR, message	: errors});
			}
			let coordinatesArr = [];
			let latVal 	= req.body.tLatitude.split(',');
			let longVal = req.body.tLongitude.split(',');
			let firstIndex = [];
			latVal.map((latRecord,index)=>{
				var latNumber = Number(latRecord);
				if(index == 0){
					firstIndex.push(Number(latVal[index]),Number(longVal[index]))
				}
				if(latNumber != 0){
					coordinatesArr.push([Number(latRecord),Number(longVal[index])]);
				}
			});
			coordinatesArr.push(firstIndex);
			var polygonsObj = {
				"type": "Polygon",
				"coordinates": [
					coordinatesArr,
				]
			}
			/*let updateData = {
				updated_at 		:	getUtcDate(),
				polygons 		: 	polygonsObj,
				vehicles_fare	: 	vehicleFareArray,
				tLatitude		:	tLatitude,
				tLongitude		:	tLongitude,
			}
			let cityInsertData = {
				city_name 	:	location_name,
				country_id 	:	ObjectId(countryId),
				status		: 	ACTIVE,
				is_workable	:	ACTIVE,
				created_at	:	getUtcDate(),
			}*/
			/**Add Location in city*/
			const cities	= 	db.collection(TABLE_CITY);
			
			//var cityRegex 		= 	new RegExp(["^", location_name, "$"].join(""), "i"); //case-insensitive query?
			
			cities.updateOne({
				_id : ObjectId(cityId)
			},{ $set : {
				"polygons":
				  {"type":"Polygon",
					 coordinates:
					  [
						coordinatesArr
					  ]
				  },
				is_workable		:	ACTIVE,
				vehicles_fare	: 	vehicleFareArray,
				tLatitude		:	tLatitude,
				tLongitude		:	tLongitude,
				location_at		:	getUtcDate(),
			}},(insertErr,insertSuccess)=>{
				/** Success Return**/
				req.flash(STATUS_SUCCESS,res.__("admin.location.location_has_been_updated_successfully"));
				res.send({
					status		: STATUS_SUCCESS,
					redirect_url: WEBSITE_ADMIN_URL+"locations/workable_locations",
					message		: res.__("admin.location.location_has_been_updated_successfully"),
				});
			});
		}else{
			/** Get location details **/
			getLocationDetails(req, res,next).then(response=>{
				if(response.status != STATUS_SUCCESS){
					/** Send error response **/
					req.flash(STATUS_ERROR,response.message);
					res.redirect(WEBSITE_ADMIN_URL+"locations/workable_locations");
					return;
				}
				const vechicleType	= 	db.collection(TABLE_VEHICLE_TYPE);
				vechicleType.find({is_deleted:NOT_DELETED,status:ACTIVE},{projection	:{vehicle_type:1,slug:1}}).toArray((errVechicle,resultVechicle)=>{
					
					/** Get country data*/
					let options = {
						collections :[
							{
								collection	:	TABLE_COUNTRY,
								columns		:	["_id","country_name"],
								selected	:	[DEFAULT_COUNTRY_ID],
								conditions:{
									status 	:	ACTIVE,
									_id		:	ObjectId(DEFAULT_COUNTRY_ID)
								}
							},
							{
								collection 	: TABLE_CITY,
								columns 	: ["_id","city_name"],
								selected	: [cityId],
								conditions 	: {status:ACTIVE,is_deleted:DEACTIVE,country_id : ObjectId(DEFAULT_COUNTRY_ID)},
							}
						]
					}
					
					/** Render edit page **/
					getDropdownList(req,res,options).then(country_response=> {
						/** Render add page **/
						req.breadcrumbs(BREADCRUMBS["admin/locations/edit"]);
						res.render("edit",{
							result 			: 	(response.result) ? response.result :{},
							vechicle_data	:	resultVechicle,
							country_list	:	(country_response && country_response.final_html_data && country_response.final_html_data["0"])	?	country_response.final_html_data["0"]:"",
							city_list		:	(country_response && country_response.final_html_data && country_response.final_html_data["1"])	?	country_response.final_html_data["1"]:"",
						});
					}).catch(next);
				});		
			});	
		
			
		}
	};//End editLocationWorkable()
	
	
	/**
	 * Function to get location detail
	 *
	 * @param req 	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 * 
	 * @return json
	 */
	let	getLocationDetails = (req,res,next)=>{
		return new Promise(resolve=>{
			let locationId = (req.params.id) ? req.params.id :"";
			
			/** Get vehicle details **/
			const collection	=	db.collection(TABLE_CITY);
			collection.findOne({
					_id : ObjectId(locationId)
				},(err, result)=>{
					if(err) return next(err);
					
					if(!result){
						/** Send error response */
						return resolve({
							status	: STATUS_ERROR,
							message	: res.__("admin.system.invalid_access")
						});
					}
					
					/** Send success response **/
					resolve({
						status	: STATUS_SUCCESS,
						result	: result
					});
				}
			);
		});
	};// End getVehicleTypeDetails()

	/**
	 * Function to view location detail
	 *
	 * @param req 	As 	Request Data
	 * @param res 	As 	Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 * 
	 * @return json
	*/
	this.viewLocation = (req,res,next)=>{
		let locationId = (req.params.id) ? req.params.id : "";
		getLocationDetails(req,res,next).then((response)=>{
			
			if(response.status != STATUS_SUCCESS){
				/** Send error response **/
				req.flash(STATUS_ERROR,response.message);
				return res.redirect(WEBSITE_ADMIN_URL+"dashboard");
			}
			const vechicleType	= 	db.collection(TABLE_VEHICLE_TYPE);
			vechicleType.find({is_deleted:NOT_DELETED},{projection	:{vehicle_type:1,slug:1}}).toArray((errVechicle,resultVechicle)=>{
				/** For render view page */
				req.breadcrumbs(BREADCRUMBS["admin/locations/view"]);
				res.render("view",{
					result 			: (response.result) ? response.result :{},
					vechicle_data	: resultVechicle,
				});
			});	
		}).catch(next);
	};// End view Location

	/**
	 * Function for update location status
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next 	As 	Callback argument to the middleware function
	 *
	 * @return null
	*/
	this.updateLocationStatus = (req,res,next)=>{
		let locationId		 = (req.params.id) 		? ObjectId(req.params.id) : "";
		let locationStatus   = (req.params.status)  ? req.params.status  : "";
		
		/** Set update data **/
		let updateData = {
			modified  : getUtcDate(),
			status	  : (locationStatus == ACTIVE) ? DEACTIVE :ACTIVE
		};
		/** Update location status*/
		const cities	=	db.collection(TABLE_CITY);
		cities.updateOne({_id : locationId},{$set :updateData},(updateErr)=>{
			if(updateErr) return next(updateErr);
			/** Send success response **/
			req.flash(STATUS_SUCCESS,res.__("admin.locations.location_status_has_been_updated_successfully"));
			res.redirect(WEBSITE_ADMIN_URL+"locations/workable_locations");
		});
	};//End updateLocationStatus()
}
module.exports = new Locations();
