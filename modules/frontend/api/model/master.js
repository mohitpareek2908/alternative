function Master() {

	Master = this;

    /**
	 * Function to get master list
	 *
	 * @param req	As Request Data
	 * @param res	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return json
	 */
	this.getMasterList = (req,res,next)=>{
		return new Promise(resolve=>{
			let type = (req.body.type) ? req.body.type :"";
				
			/** Send error response */	
			if(!type) return resolve({status : STATUS_ERROR, message : res.__("system.missing_parameters")});
			
			/** Set options **/
			let options ={type : [type]};
			
			/** Get master list **/
			getMasterList(req,res,options).then(response=>{
				if(response.status !== STATUS_SUCCESS) return resolve({status : STATUS_ERROR, message : res.__("system.something_going_wrong_please_try_again")});
				
				/** Send  susscess response */
				let finalResult = (response.result && response.result[type]) ? response.result[type] :[];
				resolve({status : STATUS_SUCCESS, result : finalResult});
			}).catch(next);
		});
	};//End getMasterList()

}
module.exports = new Master();
