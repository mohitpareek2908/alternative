const {body, validationResult } = require('express-validator');
//const User = this;
const Banner = this;



/**
 * Function for add Banner validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addBannerValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body('display_order')
	.notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.slider.please_enter_display_order', { value, location, path });
      })
	.isNumeric() 
	.withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.slider.invalid_order_value', { value, location, path });
      })
	 .custom((value, { req, location, path  }) => {
		consoleLog(value);
		consoleLog(req.body);
		  return Banner.findBannerOrder(value,req).then(banner => {
			if (banner.status == STATUS_SUCCESS) {
				return Promise.reject(req.__('admin.slider.this_display_order_already_in_use', { value, location, path }));
			}
		  });
		})	,
	body('slider_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.description').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.slider.please_enter_description', { value, location, path });
      }),
  ]
}


/**
 * Function for edit Banner validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const editBannerValidationRules = (req,res) =>{

return   [
	body('page_name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.block.please_enter_page_name', { value, location, path });
      }),
	body('blocks_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.block_name').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.block.please_enter_block_name', { value, location, path });
      }),
	body('blocks_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.description').notEmpty()
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.block.please_enter_block_description', { value, location, path });
      }),
  ]
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

/**
 * Function for find Banner order
 *
 * @param value As name value
 * @param req As Request Data
 *
 * @return json
 */
Banner.findBannerOrder = (value,req)=>{

	let bannerId 	= (req.params.id) ? req.params.id : "";
	
	return new Promise(resolve=>{
		const mastersCollection = db.collection(TABLE_MASTERS);
		let response = {};
		let conditions = { 
			"display_order" : Number(value)
		 };
		if(bannerId !="")
		{
			conditions["_id"] 		= 	{$ne : ObjectId(masterId)};
		}
		mastersCollection.findOne( conditions,{
			
		},(err,bannerData)=>{
		
			bannerData = bannerData ? bannerData : {};
			/** Send response **/
			if(Object.keys(bannerData).length > 0){
				response = {
					status	: 	STATUS_SUCCESS,
					result:	bannerData,
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




module.exports = {
  editBannerValidationRules,
  addBannerValidationRules,
  validate,
}
