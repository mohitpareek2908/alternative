const {body, validationResult } = require('express-validator');

const TextSetting = this;


/**
 * Function for add text setting validation 
 * @param req As Request Data
 * @param res As Response Data
 * @return json
 */
const addTextSettingValidationRules = (req,res) => {
	/** Check validation **/
	
	return   [
	body('key')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.text_setting.please_enter_key', { value, location, path });
      })
	  .custom((value, { req, location, path  }) => {
		  consoleLog(value);
		  consoleLog(req.body);
		  consoleLog(location);
		  consoleLog(path);
		  return TextSetting.findKeyExist(value,req).then(user => {
			if (user.status == STATUS_SUCCESS) {
				return Promise.reject(req.__('admin.text_setting.whoops_you_have_entered_an_already_used', { value, location, path }));
			}
		  });
		}),
		body('text_settings_descriptions.'+DEFAULT_LANGUAGE_MONGO_ID+'.value').notEmpty()
		.withMessage((value, { req, location, path }) => {
			
			return req.__('admin.text_setting.please_enter_value', { value, location, path });
		})

  ]
}


TextSetting.findKeyExist = (value,req)=>{
	
	let keyId = (req.params.id) ? req.params.id : "";
	return new Promise(resolve=>{
		const textSetting = db.collection(TABLE_TEXT_SETTINGS);
		let response = {};
		
		let conditions = {};
		if(keyId !="")
		{
			conditions["_id"] 		= 	{$ne : ObjectId(keyId)};
			conditions["key"] 		= 	{$regex : "^"+value+"$",$options : "i"};
		}else{
			conditions["key"] 		= 	{$regex : "^"+value+"$",$options : "i"};
			
		}

		textSetting.findOne(conditions,{projection: {
			_id:1
		}},(err,keyResult)=>{
			keyResult = keyResult ? keyResult : {};
			/** Send response **/
			if(Object.keys(keyResult).length > 0){
				response = {
					status	: 	STATUS_SUCCESS,
					result:	keyResult,
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
 *
 * @param req As Request Data
 * @param res As Response Data
 *
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
  addTextSettingValidationRules,
  validate,
}