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
	body('email')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('admin.user.please_enter_email', { value, location, path });
      })
      .matches(
          EMAIL_AND_MOBILE_REGULAR_EXPRESSION
        )
	  .withMessage((value, { req, location, path }) => {
        return req.__('user.please_enter_valid_email_mobile_number', { value, location, path });
      }),	
	  
	
	body('password')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_password', { value, location, path });
      })
	  
		
  ]
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
		  consoleLog("Foregt password validation reached. ");
        return req.__('admin.user.please_enter_email', { value, location, path });
      })
	  .isEmail()
	  .withMessage((value, { req, location, path }) => {
        return req.__('admin.user.please_enter_valid_email_address', { value, location, path });
      })
	
  ]
}


/**
 * Function for login validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
 const updateEmailAddressValidationRules = (req,res) => {
	/** Check validation **/
	
  return [
	body('new_email')
	.notEmpty()
	.withMessage((value, { req, location, path }) => {
	return req.__('admin.user.please_enter_email', { value, location, path });
	})
	.isEmail()
	.withMessage((value, { req, location, path }) => {
	return req.__('admin.user.please_enter_valid_email_address', { value, location, path });
	})

	.custom((value, { req, location, path  }) => {
		console.log(value);
		return User.findUserByEmail(value,req).then(user => {
		if (user.status == STATUS_SUCCESS) {
			return Promise.reject(req.__('admin.user.your_email_id_is_already_exist', { value, location, path }));
		}
		});
	}),
	  
		
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
		   consoleLog("Macthuinf failed");
		   consoleLog("req.body is ");
		   consoleLog(req.body);
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
 * Function for Reset password  validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
 const changePasswordValidationRules = (req,res) => {
	/** Check validation **/	
	return   [
		
		body('old_password')
		.notEmpty()
		.withMessage((value, { req, location, path }) => {
		  return req.__('admin.user.please_enter_old_password', { value, location, path });
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
		   consoleLog("Macthuinf failed");
		   consoleLog("req.body is ");
		   consoleLog(req.body);
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
 * Function for login validation 
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
const verifyOtpValidationRules = (req,res) => {
	/** Check validation **/
	
  return [
	body('otp')
	  .notEmpty()
	  .withMessage((value, { req, location, path }) => {
		
        return req.__('front.user.please_enter_otp', { value, location, path });
      })
	  
		
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
		body('mobile_number')
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
				  return Promise.reject('Whoops! You have entered an already used mobile number. Please try something different.');
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

			let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
			let frontUserType 	=  loginUserData.user_type;
		
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
		body('mobile_number')
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
			let frontUserType = req.body.user_type;
	
			if(frontUserType =="kids" && value == "" )
			{
				throw new Error();
			}else if (frontUserType =="kids" ) {
			
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
			let frontUserType = req.body.user_type;
			if (frontUserType =="kids" && value == "") {
				throw new Error();
			  }
			  return true;
			})
			.withMessage((value, { req, location, path }) => {
			return req.__('admin.user.please_select_country', { value, location, path });
		  }),
		body('state_id')
		  .custom((value, { req }) => {
			let frontUserType = req.body.user_type;
			if (frontUserType =="kids" && value == "") {
				throw new Error();
			  }
			  return true;
			})
			.withMessage((value, { req, location, path }) => {
			return req.__('admin.user.please_select_state', { value, location, path });
		  }),
		
		body('city_id')
		  .custom((value, { req }) => {
			let frontUserType = req.body.user_type;
			if (frontUserType =="kids" && value == "") {
				throw new Error();
			  }
			  return true;
			})
			.withMessage((value, { req, location, path }) => {
			return req.__('admin.user.please_select_city', { value, location, path });
		  }),
		
		body('postal_code')
		  .custom((value, { req }) => {
			let frontUserType = req.body.user_type;
			if (frontUserType =="kids" && value == "") {
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
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
		
		let frontUserType = (req.body.user_type) ? req.body.user_type : '';
		
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

		
		  

		if( userAge < minimumAllowedAge || userAge > maximumAllowedAge) 
		{
		
			
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
 * Function for find user by email
 *
 * @param value As email value
 * @param req As Request Data
 *
 * @return json
 */
User.findUserByEmail = (value,req)=>{

	let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
	
	
		console.log("loginUserData");
		console.log(loginUserData);
	let userId = (loginUserData._id) ? loginUserData._id : "";
	
	return new Promise(resolve=>{
		const user = db.collection(TABLE_USERS);
		let response = {};
		let conditions = { 
			is_deleted 	: 	NOT_DELETED,
			$or: [
				{ email:value },
				{ temp_email: value },
				//{ email: { $regex: "^" + value + "$", $options: "i" } },
				//{ temp_email: { $regex: "^" + value + "$", $options: "i" } },
			]
		 };
		if(userId !="")
		{
			conditions["_id"] 		= 	{$ne : ObjectId(userId)};
		}
			console.log("conditions");
		console.log(conditions);
		user.findOne( conditions,{
			
		},(err,emailData)=>{

			
			console.log(emailData);
			//return false;
			emailData = emailData ? emailData : {};
			/** Send response **/
			if(emailData != "null" && Object.keys(emailData).length > 0){
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

	let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
	
	let userId = (loginUserData._id) ? loginUserData._id : "";
	
	return new Promise(resolve=>{
		let countryCode = (req.body.country_code) ? req.body.country_code : "";
		let mobileNumber = value;
		
		let conditions = { 
			is_deleted 	: 	NOT_DELETED,
			$or: [
					{ mobile_number: mobileNumber },
					{ temp_mobile_number: mobileNumber },
				]
		};

		consoleLog();
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



module.exports = {
  loginValidationRules,
  addUserValidationRules,
  editUserValidationRules,
  forgetPasswordValidationRules,
  resetPasswordValidationRules,
  verifyOtpValidationRules,
  changePasswordValidationRules,
  updateEmailAddressValidationRules,
}
