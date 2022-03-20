const {body, validationResult } = require('express-validator');
//const User = this;
const Master = this;



/**
 * Function for add Block validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addMasterValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	
	body('master_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.master.please_enter_name', { value, location, path });
      })
	 .custom((value, { req, location, path  }) => {
		
		  return Master.findMasterByName(value,req).then(master => {
			if (master.status == STATUS_SUCCESS) {
				return Promise.reject(req.__('admin.master.entered_name_already_exists', { value, location, path }));
			}
		  });
		}),
	body('parent_id')  
	 .custom((value, { req }) => {
		let masterType	=	(req.params.type)	?	req.params.type	: "";
		
		if (masterType =="car" && value == "" ) {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.master.please_select_brand', { value, location, path });
      }), 
	
  ]
}


/**
 * Function for edit Block validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editMasterValidationRules = (req,res) =>{

	return   [
	
	body('master_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.master.please_enter_name', { value, location, path });
      })
	 .custom((value, { req, location, path  }) => {
		consoleLog(value)
		consoleLog(req.body)
		consoleLog(location)
		consoleLog(path)
		  return Master.findMasterByName(value,req).then(master => {
			if (master.status == STATUS_SUCCESS) {
				return Promise.reject(req.__('admin.master.entered_name_already_exists', { value, location, path }));
			}
		  });
		}),
	body('parent_id')  
	 .custom((value, { req }) => {
		let masterType	=	(req.params.type)	?	req.params.type	: "";
		
		if (masterType =="car" && value == "" ) {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.master.please_select_brand', { value, location, path });
      }), 
	
  ]
}



/**
 * Function for find master by name
 *
 * @param value As name value
 * @param req As Request Data
 *
 * @return json
 */
Master.findMasterByName = (value,req)=>{

	let masterId 	= (req.params.id) ? req.params.id : "";
	let masterType	=	(req.params.type)	?	req.params.type	: "";
	
	return new Promise(resolve=>{
		const mastersCollection = db.collection(TABLE_MASTERS);
		let response = {};
		let conditions = { 
			dropdown_type	:	masterType,
			$or: [
				{ name: { $regex: "^" + value + "$", $options: "i" } },
			]
		 };
		if(masterId !="")
		{
			conditions["_id"] 		= 	{$ne : ObjectId(masterId)};
		}
		mastersCollection.findOne( conditions,{
			
		},(err,mastersData)=>{
		
			mastersData = mastersData ? mastersData : {};
			/** Send response **/
			if(Object.keys(mastersData).length > 0){
				response = {
					status	: 	STATUS_SUCCESS,
					result:	mastersData,
				};
				resolve(response);
				
			}else{
				response = {
					status	: 	STATUS_ERROR,
					result:	{},
				};
				resolve(response);
			}

		})
	});
}



/**
 * Function for validate error and return
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const validate = (req, res, next) => {
	if(isPost(req)){
		const allErrors = validationResult(req)
		if (allErrors.isEmpty()) {
			return next()
		}
		let formErrors = parseValidation(allErrors.errors);	
		
		return res.send({
			status : STATUS_ERROR,
			message : formErrors
		});
	}else{
		return next()
	}
}

module.exports = {
  editMasterValidationRules,
  addMasterValidationRules,
  validate,
}
