const crypto 	= 	require("crypto");
const async		= 	require("async");

function Country_state_city() {
	/**
	 *  Function for get states list for dropdown	 
	*/
	this.getStateListCountryWise	= 	(req,res)=>{
		var states					=	db.collection(TABLE_STATES);
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
		}).toArray(function (err, result) {
			if(!err){
				res.send({
					status:STATUS_SUCCESS,
					result:result
				});
			}else{
				res.send({
					status	:STATUS_ERROR,
					result	:[],
					message	:res.__("admin.system.something_going_wrong_please_try_again")
				});
			}
		});
	};// getStateListCountryWise


		/**
     * function for get interst on baisis of role
     *
     * param slug
     * */
		 this.getUserInterestRoleWise = function (req,res) {

			req.body 				= sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);
			let userId				=	(req.params.id)				? 	req.params.id				:"";
			let userType 			= 	(req.params.user_type) 		?	req.params.user_type		:"";
			let userTypeTitle		=	(FRONT_USER_TYPE[userType])	?	FRONT_USER_TYPE[userType] 	:"";
			let userRoleId 			= 	(req.body.age_type)					?	req.body.age_type		:	"";	;
	
			let finalResponse 		= {};
			consoleLog(req.body );
			
			consoleLog("User roles are here  ");
			consoleLog(userRoleId);
			
			
			var adminRoles = db.collection(TABLE_ADMIN_ROLE);
	
	
			let conditions = {
				user_type 			: { $in: (userRoleId) }
			}
			consoleLog(conditions);
			adminRoles.aggregate([
				{$match :conditions},
						
				{
					$lookup:{
	
						
							from: TABLE_CATEGORIES,
							localField: "category_ids",
							foreignField: "_id",
							as :"categoryDetail"
					}
				},
				
			
				{$project:
					{
						_id:0,
						categoryDetail: {
							_id: 1,
							name: 1,
						}
				}}	
			]).toArray((err,result)=>{
				
				
				consoleLog(result);
				let cateDetails = result;
	
				if (cateDetails.length > 0) {
	
					let categoryList = [];
				//	categoryList.push({"id":"","name":"Select Category*"});
					cateDetails.map((record)=>{  
	
					
						let catValues= record.categoryDetail;
	
						catValues.map((catRecords)=>{  
							
						categoryList.push(catRecords);
						
					})
						
					})
	
				var filteredArr=	 categoryList.filter(function (a) {
						return !this[a._id] && (this[a._id] = true);
					}, Object.create(null));
					 
					
	
					res.send({
						status:STATUS_SUCCESS,
						result:filteredArr
					});
				} else {
					res.send({
						status:STATUS_SUCCESS,
						result:filteredArr
					});
				}
			});
		};
	

	/**
	 *  Function for get states list for dropdown	 
	*/
	this.getCityListStateWise		= 	(req,res)=>{
		var cities					=	db.collection(TABLE_CITY);
		var state_id				=	(req.params.state_id) ? req.params.state_id : 0;		
		cities.find(
		{
			'status'		: 	ACTIVE,
			'state_id'		:	ObjectId(state_id)
		},
		{
			_id			:	1,
			city_name	:	1,			
		}).toArray(function (err, result) {
			if(!err){
				res.send({
					status:STATUS_SUCCESS,
					result:result
				});
			}else{
				res.send({
					status	:STATUS_ERROR,
					result	:[],
					message	:res.__("admin.system.something_going_wrong_please_try_again")
				});
			}
		});
	};// getStateListCountryWise
}
module.exports = new Country_state_city();
