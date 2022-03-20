const {body, validationResult } = require('express-validator');
//const User = this;
const Category = this;



/**
 * Function for add category validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addCategoryValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.category.please_enter_name', { value, location, path });
      })
	  .custom((value, { req, location, path  }) => {
		 
		  return Category.findCatgeoryByName(value,req).then(role => {
			if (role.status == STATUS_SUCCESS) {
				return Promise.reject(req.__('admin.user.this_category_already_exist', { value, location, path }));
			}
		  });
		}),

  ]
}


/**
 * Function for edit category validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editCategoryValidationRules = (req,res) =>{

	return   [
	body('pages_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.category.please_enter_name', { value, location, path });
      })
	  .custom((value, { req, location, path  }) => {
		 
		  return Category.findCatgeoryByName(value,req).then(role => {
			if (role.status == STATUS_SUCCESS) {
				return Promise.reject(req.__('admin.user.this_category_already_exist', { value, location, path }));
			}
		  });
		}),

  ]
}


/**
 * Function for checking category name uniqueness  
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
Category.findCatgeoryByName = (value,req)=>{
		let categoryId	= 	(req.params.id)	?	req.params.id	:"";
	
	
	return new Promise(resolve=>{
		const categoryCollection = db.collection(TABLE_CATEGORIES);
		let response = {};
		let conditions = { 
							is_deleted 	: 	NOT_DELETED,
							$or: [
								{ name: { $regex: "^" + value + "$", $options: "i" } },
							]
						 };
		if(categoryId !="")
		{
			
			conditions["_id"] 		= 	{$ne : ObjectId(categoryId)};
		}
		
		
		categoryCollection.findOne( conditions,{
			
		},(err,categoryData)=>{
			//consoleLog(emailData);
			categoryData = categoryData ? categoryData : {};
			/** Send response **/
			if(Object.keys(categoryData).length > 0){
				response = {
					status	: 	STATUS_SUCCESS,
					result:	categoryData,
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
  editCategoryValidationRules,
  addCategoryValidationRules,
  validate,
}
