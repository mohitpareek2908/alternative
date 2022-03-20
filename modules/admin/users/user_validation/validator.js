const {body, validationResult } = require('express-validator');

const User = this;

/**
 * Function for login validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const loginValidationRules = (req,res) => {
	/** Check validation **/
  return [
	body('username')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_email', { value, location, path });
      })
	  .isEmail()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_valid_email_address', { value, location, path });
      }),
	
	body('password')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_password', { value, location, path });
      })
	  
		
  ]
}



/**
 * Function for edit profile validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
 const editUserProfileValidationRules = (req,res) => {

	/** Check validation **/
  return [
	body('full_name')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_full_name', { value, location, path });
      }),


	  body('old_password')
	  .if((value, { req }) => req.body.old_password)
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
	
        return req.__('admin.user.please_enter_your_old_password', { value, location, path });
      })
	
	  .isLength({ min: PASSWORD_MIN_LENGTH })
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_length_should_be_minimum_6_character', { value, location, path });
		 })
	.matches(
          PASSWORD_VALIDATION_REGULAR_EXPRESSION
        )
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_must_be_alphanumeric', { value, location, path });
      }),	



	  body('password')
	  .custom((value, { req, location, path }) => {
		if(req.body.old_password !="" && req.body.password == "")
		{
			throw new Error();
		}
		return true;
  
	})
	.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_password', { value, location, path });
      })

	  .if((value, { req }) => req.body.password)
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
	
        return req.__('admin.user.please_enter_password', { value, location, path });
      })
	 
	
	  .isLength({ min: PASSWORD_MIN_LENGTH })
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_length_should_be_minimum_6_character', { value, location, path });
		 })
	.matches(
          PASSWORD_VALIDATION_REGULAR_EXPRESSION
        )
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_must_be_alphanumeric', { value, location, path });
      }),	
	  
	
	body('confirm_password')
	.custom((value, { req, location, path }) => {
		if(req.body.old_password !="" && req.body.confirm_password == "")
		{
			throw new Error();
		}
		return true;
  
	})
	.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_confirm_password', { value, location, path });
      })

	.if((value, { req }) => req.body.confirm_password)
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_confirm_password', { value, location, path });
      })
	
	  .isLength({ min: PASSWORD_MIN_LENGTH })
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_length_should_be_minimum_6_character', { value, location, path });
      })
	.matches(
          PASSWORD_VALIDATION_REGULAR_EXPRESSION
        )
	 .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_must_be_alphanumeric', { value, location, path });
      })	
		
	  .custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.confirm_password_should_be_same_as_password', { value, location, path });
      }),
	  	
  ]
}





/**
 * Function for edit user validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const editUserValidationRules = (req,res) =>{

return   [
	body('full_name')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_full_name', { value, location, path });
      }),
	  
	body('email')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_email', { value, location, path });
      })
	  .isEmail()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_valid_email_address', { value, location, path });
      })
	
	  .custom((value, { req, location, path  }) => {
		 
		  return User.findUserByEmail(value,req).then(user => {
			if (user.status == STATUS_SUCCESS) {
				return Promise.reject(req.__('admin.user.your_email_id_is_already_exist', { value, location, path }));
			}
		  });
		}),
	body('phone_number')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_phone_number', { value, location, path });
      })
	
	  .isNumeric()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.invalid_phone_number', { value, location, path });
      })
	
	  .custom((value, { req }) => {
		
		  return User.findUserByMobile(value,req).then(user => {
			if (user.status == STATUS_SUCCESS) {
			  return Promise.reject('Whoops, You have entered an already used mobile number. Please try something different.');
			}
		  });
		}),
	
	body('password')
	  .if((value, { req }) => req.body.password)
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_password', { value, location, path });
      })
	
	  .isLength({ min: PASSWORD_MIN_LENGTH })
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_length_should_be_minimum_6_character', { value, location, path });
		 })
	.matches(
          PASSWORD_VALIDATION_REGULAR_EXPRESSION
        )
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_must_be_alphanumeric', { value, location, path });
      }),	
	  
	
	body('confirm_password')
	.if((value, { req }) => req.body.confirm_password)
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_confirm_password', { value, location, path });
      })
	
	  .isLength({ min: PASSWORD_MIN_LENGTH })
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_length_should_be_minimum_6_character', { value, location, path });
      })
	.matches(
          PASSWORD_VALIDATION_REGULAR_EXPRESSION
        )
	 .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_must_be_alphanumeric', { value, location, path });
      })	
		
	  .custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.confirm_password_should_be_same_as_password', { value, location, path });
      }),
	
	body('date_of_birth')
	  .custom((value, { req, location, path  }) => {
		let frontUserType = req.params.user_type;
	
		if(value == "" )
		{
			throw new Error();
		}else{

				
			return User.checkUserAge(value,req).then(user => {
				
				if (user.status == STATUS_ERROR) {
					return Promise.reject(req.__(''+user.msg+'', { value, location, path }));
				}
				});


		}
		
		return true;
		  
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_select_date_of_birth', { value, location, path });
	  })
	 ,
	

	 body('country_id')
	   .notEmpty()
	   .withMessage((value, { req, location, path }) => {
	   return req.__('admin.user.please_select_country', { value, location, path });
	 }),
   body('state_id')
   .notEmpty()
	   .withMessage((value, { req, location, path }) => {
	   return req.__('admin.user.please_select_state', { value, location, path });
	 }),
   
   body('city_id')
   .notEmpty()
	   .withMessage((value, { req, location, path }) => {
	   return req.__('admin.user.please_select_city', { value, location, path });
	 }),
   
   body('postal_code')
   .notEmpty()
	   .withMessage((value, { req, location, path }) => {
	   return req.__('admin.user.please_enter_postal_code', { value, location, path });
	 }),




  ]
	
	
}

/**
 * Function for add user validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const addUserValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	body('full_name')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_full_name', { value, location, path });
      }),

	  
	body('email')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_email', { value, location, path });
      })
	  .isEmail()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_valid_email_address', { value, location, path });
      })
	
	  .custom((value, { req, location, path  }) => {
		
		  return User.findUserByEmail(value,req).then(user => {
			if (user.status == STATUS_SUCCESS) {
				return Promise.reject(req.__('admin.user.your_email_id_is_already_exist', { value, location, path }));
			}
		  });
		}),
	body('phone_number')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_phone_number', { value, location, path });
      })
	
	  .isNumeric()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.invalid_phone_number', { value, location, path });
      })
	
	  .custom((value, { req, location, path }) => {
		
		  return User.findUserByMobile(value,req).then(user => {
			if (user.status == STATUS_SUCCESS) {
				return Promise.reject(req.__('admin.user.your_mobile_number_is_already_exist', { value, location, path }));
			}
		  });
		}),
	
	body('password')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_password', { value, location, path });
      })
	
	  .isLength({ min: PASSWORD_MIN_LENGTH })
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_length_should_be_minimum_6_character', { value, location, path });
      })

	 .matches(
          PASSWORD_VALIDATION_REGULAR_EXPRESSION
        )
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.user.password_must_be_alphanumeric', { value, location, path });
      }),	

	
	body('confirm_password')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_confirm_password', { value, location, path });
      })
	
	  .isLength({ min: PASSWORD_MIN_LENGTH })
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_length_should_be_minimum_6_character', { value, location, path });
      })
	
	 .matches(
          PASSWORD_VALIDATION_REGULAR_EXPRESSION
        )
	 .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_must_be_alphanumeric', { value, location, path });
      })	
	
	  .custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.confirm_password_should_be_same_as_password', { value, location, path });
      }),
	

	  body('date_of_birth')
	  .custom((value, { req, location, path  }) => {
		let frontUserType = req.params.user_type;

		if(frontUserType =="kid" && value == "" )
		{
			throw new Error();
		}else if (frontUserType =="kid" ) {
		
			return User.checkUserAge(value,req).then(user => {
				if (user.status == STATUS_ERROR) {
					return Promise.reject(req.__('admin.user.user_age_not_correct', { value, location, path }));
				}
				});


		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
			return req.__('admin.user.please_select_date_of_birth', { value, location, path });
		  }),



	
	body('country_id')
	  .custom((value, { req }) => {
		let frontUserType = req.body.front_user_type;
		consoleLog(frontUserType);
		if (frontUserType =="kid" && value == "") {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_select_country', { value, location, path });
      }),
	body('state_id')
	  .custom((value, { req }) => {
		let frontUserType = req.body.front_user_type;
		if (frontUserType =="kid" && value == "") {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_select_state', { value, location, path });
      }),
	
	body('city_id')
	  .custom((value, { req }) => {
		let frontUserType = req.body.front_user_type;
		if (frontUserType =="kid" && value == "") {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_select_city', { value, location, path });
      }),
	
	body('postal_code')
	  .custom((value, { req }) => {
		let frontUserType = req.body.front_user_type;
		if (frontUserType =="kid" && value == "") {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_postal_code', { value, location, path });
      }),
  ]
}



/**
 * Function for checking user age
 *
 * @param value As email value
 * @param req As Request Data
 *
 * @return json
 */
User.checkUserAge = (value,req)=>{


	return new Promise(resolve=>{

		let userAge = calculateAge(value);
		let frontUserType = (req.body.front_user_type) ? req.body.front_user_type : '';
		
		let response = {};
	
		let minimumAllowedAge ;
		let maximumAllowedAge ;
		let errMsg ; 

		switch(frontUserType) {
			case KIDS_USER_TYPE:
				minimumAllowedAge = KIDS_USER_MINIMUM_ALLOWED_AGE;
				maximumAllowedAge = KIDS_USER_MAXIMUM_ALLOWED_AGE;
				errMsg			="admin.user.kid_age_not_correct";
			  break;
			case TEENS_USER_TYPE:
				minimumAllowedAge = TEENS_USER_MINIMUM_ALLOWED_AGE;
				maximumAllowedAge = TEENS_USER_MAXIMUM_ALLOWED_AGE;
				errMsg			="admin.user.teen_age_not_correct";
			  break;
			case ADULTS_USER_TYPE:
				minimumAllowedAge = ADULTS_USER_MINIMUM_ALLOWED_AGE;
				maximumAllowedAge = ADULTS_USER_MAXIMUM_ALLOWED_AGE;
				errMsg			="admin.user.adult_age_not_correct";
				break;
		  }

		  consoleLog("User AGE is --->"+userAge);
		  consoleLog("Minimum Age is --->"+minimumAllowedAge);
		  consoleLog("Maximum AGE is --->"+maximumAllowedAge);
		  

		if( userAge < minimumAllowedAge || userAge > maximumAllowedAge) 
		{
			consoleLog("Inside if means error");
			
			response = {
				status	: 	STATUS_ERROR,
				msg 	: errMsg,
				result:	{},
			};
			resolve(response);
		}
		else{

			response = {
				status	: 	STATUS_SUCCESS,
				result:	{},
			};
			resolve(response);
		}


	});

}




/**
 * Function for forget password  validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const forgetPasswordValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	  
	body('email')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_email', { value, location, path });
      })
	  .isEmail()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_valid_email_address', { value, location, path });
      })
	
  ]
}




/**
 * Function for Reset password  validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const resetPasswordValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
	  
		body('password')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_password', { value, location, path });
      })
	
	  .isLength({ min: PASSWORD_MIN_LENGTH })
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_length_should_be_minimum_6_character', { value, location, path });
      })

	 .matches(
          PASSWORD_VALIDATION_REGULAR_EXPRESSION
        )
	  .withMessage((value, { req, location, path }) => {
		 
        return req.__('admin.user.password_must_be_alphanumeric', { value, location, path });
      }),	

	
	body('confirm_password')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_confirm_password', { value, location, path });
      })
	
	  .isLength({ min: PASSWORD_MIN_LENGTH })
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_length_should_be_minimum_6_character', { value, location, path });
      })
	
	 .matches(
          PASSWORD_VALIDATION_REGULAR_EXPRESSION
        )
	 .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.password_must_be_alphanumeric', { value, location, path });
      })	
	
	  .custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error();
		  }
		  return true;
		})
		.withMessage((value, { req, location, path }) => {
        return req.__('admin.user.confirm_password_should_be_same_as_password', { value, location, path });
      }),
	
	
  ]
}





/**
 * Function for find user by email
 *
 * @param value As email value
 * @param req As Request Data
 *
 * @return json
 */
User.findUserByEmail = (value,req)=>{

	let userId = (req.params.id) ? req.params.id : "";
	
	return new Promise(resolve=>{
		const user = db.collection(TABLE_USERS);
		let response = {};
		let conditions = { 
			is_deleted 	: 	NOT_DELETED,
			$or: [
				{ email: { $regex: "^" + value + "$", $options: "i" } },
				{ temp_email: { $regex: "^" + value + "$", $options: "i" } },
			]
		 };
		if(userId !="")
		{
			conditions["_id"] 		= 	{$ne : ObjectId(userId)};
		}
		user.findOne( conditions,{
			
		},(err,emailData)=>{
		
			emailData = emailData ? emailData : {};
			/** Send response **/
			if(Object.keys(emailData).length > 0){
				response = {
					status	: 	STATUS_SUCCESS,
					result:	emailData,
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
 * Function for find user by mobile number
 *
 * @param value As mobile number
 * @param req As Request Data
 *
 * @return json
 */
User.findUserByMobile = (value,req)=>{
	
	let userId = (req.params.id) ? req.params.id : "";
	
	return new Promise(resolve=>{
		let countryCode = (req.body.country_code) ? req.body.country_code : "";
		let mobileNumber = countryCode+value;
		
		let conditions = { 
			is_deleted 	: 	NOT_DELETED,
			$or: [
					{ mobile_number: mobileNumber },
					{ temp_mobile_number: mobileNumber },
				]
		};
		if(userId !="")
		{
			
			conditions["_id"] 		= 	{$ne : ObjectId(userId)};
		}
	
		const user = db.collection(TABLE_USERS);
		let response = {};
		user.findOne(conditions,{
			
		},(err,mobileData)=>{
			mobileData = mobileData ? mobileData : {};
			/** Send response **/
			if(Object.keys(mobileData).length > 0){
				response = {
					status	: 	STATUS_SUCCESS,
					result:	mobileData,
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
	//	consoleLog(allErrors);
		if (allErrors.isEmpty()) {
			return next()
		}
		let formErrors = parseValidation(allErrors.errors);	
		//let formErrors = allErrors.errors;	
		
		return res.send({
			status : STATUS_ERROR,
			message : formErrors
		});
	}else{
		return next()
	}
}

module.exports = {
  loginValidationRules,
  addUserValidationRules,
  editUserValidationRules,
  forgetPasswordValidationRules,
  resetPasswordValidationRules,
  editUserProfileValidationRules,
  validate,
}
