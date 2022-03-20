class User {
	
	
	getUzubeUser = (req,res,options) =>{
		return new Promise(resolve=>{
			const users	=	db.collection(TABLE_USERS);
			
			users.find({
				is_deleted : DEACTIVE
			},{
				
			}).toArray((err,result)=>{
				
				/** Send success response **/
				return resolve({
					status	:	STATUS_SUCCESS,
					result 	: 	result,
					//options	: 	options,
				});
					
			})
			
		})
	}
}
let userObj = new User();

module.exports = userObj

