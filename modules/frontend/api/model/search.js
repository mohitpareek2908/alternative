function Search() {
	Search = this;
	
	
	/** Function for get all site users
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.getSiteUser = (req,res,next,callback)=>{
		
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let loginUserId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
		
		let finalResponse = {};
		const usersCollection = db.collection(TABLE_USERS);
		
		let	page 					= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit					= API_DEFAULT_LIMIT;
	
		let skip					=	(limit * page) - limit;
		limit						=	limit;
		
		let condition = {
			is_deleted : DEACTIVE
		};
		let searchKeyword = (req.body.search_keyword) ? req.body.search_keyword : "";
		
		if(searchKeyword != "")
		{
			//condition['full_name'] = { $regex: "^" + searchKeyword + "$", $options: "i" };
			condition['full_name'] = { $regex : new RegExp(searchKeyword, "i") };
		}
		const asyncParallel			= require('async/parallel');
		
		asyncParallel({
			user_list : (callback)=>{
				usersCollection.aggregate([
					{
						$match : condition
					},
					{
						$lookup:{
							from: TABLE_USERS_FOLLOWER_LIST,
							let: { userId: "$user_id" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$request_from_user_id", ObjectId(loginUserId)] },
												{ $eq: ["$request_to_user_id",  "$$userId"] },
											]
										},
									}
								},
								
								
							],
							as: "follow_user_details"
						}
					},
					{
						$project : {
							full_name : 1,
							profile_image : 1,
							slug :1,
							created :1,
							follow_user_details :1,
							is_follow	:	{ $cond: { if: { $gte: [{ "$arrayElemAt": ["$follow_user_details.request_to_user_id", 0] }, 0] }, then: { "$arrayElemAt": ["$follow_user_details.request_to_user_id", 0] }, else: 0 } },
						}
					}
				]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((userErr, userResult)=>{
					callback(userErr, userResult);
				})
			},
			user_count : (callback)=>{
				usersCollection.countDocuments(condition,(err,countResult)=>{
					callback(err, countResult);
				});
			}
		},(err, response)=>{
			var totalRecord	= (response['user_count']) ? response['user_count'] : 0;
			let userList		= (response['user_list']) ? response['user_list'] : [];
			
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					errors: "",
					result : userList,
					limit			: 	limit,
					page			: 	page,
					totalRecord		:	totalRecord,
					total_page		:	 Math.ceil(totalRecord/limit),
					user_image_url	: USERS_URL,
					loginUserId	: loginUserId,
				}
			};
			return returnApiResult(req,res,finalResponse);
			
		})
		
	}
	
	
	/** Function for get all post tags
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 **/
	this.getAllTags = (req,res,next,callback)=>{
		
		let finalResponse = {};
		const postsTagsCollection = db.collection(TABLE_POSTS_TAGS);
		
		let	page 					= (req.body.page)		? parseInt(req.body.page)	: 1;
		let limit					= API_DEFAULT_LIMIT;
	
		let skip					=	(limit * page) - limit;
		limit						=	limit;
		
		let condition = {
			is_deleted : DEACTIVE
		};
		let searchKeyword = (req.body.search_keyword) ? req.body.search_keyword : "";
		
		if(searchKeyword != "")
		{
			condition['tag'] = { $regex: "^" + searchKeyword + "$", $options: "i" };
		}
		const asyncParallel			= require('async/parallel');
		
		asyncParallel({
			tag_list : (callback)=>{
				postsTagsCollection.find(condition,{projection:{_id:1,tag:1,post_count:1}}).sort({post_count:SORT_DESC}).skip(skip).limit(limit).toArray((err, tagResult)=>{
					
					callback(err, tagResult);
				})
			},
			tag_count : (callback)=>{
				postsTagsCollection.countDocuments(condition,(err,countResult)=>{
					callback(err, countResult);
				});
			}
		},(err, response)=>{
			var totalRecord	= (response['tag_count']) ? response['tag_count'] : 0;
			let tagList		= (response['tag_list']) ? response['tag_list'] : [];
			console.log(response);
			finalResponse = {
				'data': {
					status: STATUS_SUCCESS,
					errors: "",
					result : tagList,
					limit			: 	limit,
					page			: 	page,
					totalRecord		:	totalRecord,
					total_page		:	 Math.ceil(totalRecord/limit)
				}
			};
			return returnApiResult(req,res,finalResponse);
			
		})
		
		
	}
}
module.exports = new Search();