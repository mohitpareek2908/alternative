var async = require('async');
var request = require('request');
function Contact() {
	/**
	 * Function for getting contact page data
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 * @param next	As Callback argument to the middleware function
	 *
	 * @return render/json
	*/

	this.contactUs = (req, res, next) => {
		let languageCode = DEFAULT_LANGUAGE_MONGO_ID;
		consoleLog("Constc us Reched");
		if (isPost(req)) {
			consoleLog("Contact Reached for sure");
			/** Sanitize Data */
			req.body = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);

			/** Check validation */
			req.checkBody({
				'full_name': {
					notEmpty: true,
					errorMessage: res.__("front.contactus.please_enter_name")
				},
				"email": {
					notEmpty: true,
					errorMessage: res.__("front.contactus.please_enter_email"),
					isEmail: {
						errorMessage: res.__("front.contactus.please_enter_valid_email_address")
					},
				},
				"phone": {
					notEmpty: true,
					errorMessage: res.__("front.contactus.please_enter_phone"),
					isNumeric: {
						errorMessage: res.__("front.contactus.please_enter_valid_phone_number")
					},
				},
				'inquiry_type': {
					notEmpty: true,
					errorMessage: res.__("front.contactus.please_select_inquiry_type")
				},
				'message': {
					notEmpty: true,
					errorMessage: res.__("front.contactus.please_enter_message")
				},
			});

			/** parse Validation array  */
			let errors = parseValidation(req.validationErrors(), req);

			if( (typeof req.body['g-recaptcha-response'] == typeof undefined) || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null ){
				if(!errors){
					errors = [];
				}
				errors.push({"param":"recaptcha","msg":res.__("front.contactus.please_select_captcha")});
			}
			else{
				var secretKey = res.locals.settings["Site.captcha_secret_key"];
				var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

				// Hitting GET request to the URL, Google will respond with success or error scenario.
				request(verificationUrl,function(error,response,body) {
					body = JSON.parse(body);
					// Success will be true or false depending upon captcha validation.
					if(body.success !== undefined && !body.success) {
						if(!errors){
							errors = [];
						}
						errors.push({"param":"recaptcha","msg":res.__("front.contactus.failed_captcha_verification")});
					}
				});
			}

			if (errors) {
				/** Send error response */
				return res.send({
					status: STATUS_ERROR,
					message: errors,
				});
			}

			let fullName    	= (req.body.full_name) 		? req.body.full_name 				: "";
			let email 			= (req.body.email) 			? req.body.email 					: "";
			let phoneNumber 	= (req.body.phone) 			? req.body.phone 					: "";
			let message 		= (req.body.message) 		? req.body.message 					: "";
			let inquiry_type 	= (req.body.inquiry_type) 	? ObjectId(req.body.inquiry_type)	: "";
		 
			/** Save review details */
			const feedback = db.collection(TABLE_CONTACT_US);
			feedback.insertOne({
				name			: fullName,
				email			: email.toLowerCase(),
				phone 			: phoneNumber,
				message			: message,
				is_active		: ACTIVE,
				reason			: inquiry_type,
				api_type		: "front",
				user_type		: "other",
				is_deleted		: NOT_DELETED,
				created			: getUtcDate(),
				modified		: getUtcDate()
			}, (err) => {
				if(err) return next(err);

				var reasion = "";
				let options = {
					collections : [
						{
							collection 	: TABLE_MASTERS,
							columns 	: ["_id","name"],
							conditions 	: {status:ACTIVE,dropdown_type:"inquiry_type",_id:inquiry_type},
						}
					]
				};
				/** Get Inquiry Type list **/
				getDropdownList(req, res,options).then(listResponse=>{
					if( listResponse.status == "success" ){
						let html_data = listResponse.final_html_data["0"];
   						reasion =  html_data.replace(/<[^>]+>/g, '');
					}
					
					/** Set options for send email ***/
					let emailOptions = {
						to: res.locals.settings["Site.admin_email"],
						action: "contact_us",
						rep_array: [fullName, reasion, message],
					};

					/** Send email **/
					sendMail(req, res, emailOptions);
					
					/** Send success response */
					req.flash(STATUS_SUCCESS, res.__("front.contact.contact_has_been_send_successfully"));
					res.send({
						status: STATUS_SUCCESS,
						redirect_url: 'pages/thank-you',
						message: res.__("front.contact.contact_has_been_send_successfully")
					});
				}).catch(next);
			});
		} else {

			let options = {
				collections : [
					{
						collection 	: TABLE_MASTERS,
						columns 	: ["_id","name"],
						conditions 	: {status:ACTIVE,dropdown_type:"contact_reason"},
					}
				]
			};
			/** Get Inquiry Type list **/
			getDropdownList(req, res,options).then(listResponse=>{
				if(listResponse.status != STATUS_SUCCESS) return callback(listResponse.status,"");
				return res.render("contact",{
					inquiryType	: (listResponse && listResponse.final_html_data && listResponse.final_html_data["0"])	?	listResponse.final_html_data["0"] : "",
					pageName 	: 'contact',
				});
			}).catch(next);
		}
	};//End contactUs()
	
	
	
	
	this.contactUsSubmit = (req, res, next) => {
		let languageCode = DEFAULT_LANGUAGE_MONGO_ID;
		
		if (isPost(req)) {
			
			/** Sanitize Data */
			req.body = sanitizeData(req.body, NOT_ALLOWED_TAGS_XSS);



			/** parse Validation array  */
			let errors = [];

			if( (typeof req.body['g-recaptcha-response'] == typeof undefined) || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null ){
				if(!errors){
					errors = [];
				}
				errors.push({"param":"recaptcha","msg":res.__("front.contactus.please_select_captcha")});
			}
			else{
				//var secretKey = res.locals.settings["Site.captcha_secret_key"];
				 var secretKey = "6LfGQ1YdAAAAAHn37bjkslaDBMVQY7W50cITjw7k";
				 var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

				// Hitting GET request to the URL, Google will respond with success or error scenario.
				request(verificationUrl,function(error,response,body) {
					body = JSON.parse(body);
					// Success will be true or false depending upon captcha validation.
					if(body.success !== undefined && !body.success) {
						if(!errors){
							errors = [];
						}
						errors.push({"param":"recaptcha","msg":res.__("front.contactus.failed_captcha_verification")});
					}
				});
			}

			if (errors.length>0) {
				/** Send error response */
				return res.send({
					status: STATUS_ERROR,
					message: errors,
				});
			}

			let fullName    	= (req.body.full_name) 		? req.body.full_name 				: "";
			let email 			= (req.body.email) 			? req.body.email 					: "";
			let phoneNumber 	= (req.body.phone) 			? req.body.phone 					: "";
			let message 		= (req.body.message) 		? req.body.message 					: "";
			let subject 		= (req.body.subject) 		? req.body.subject					: "";
		
			/** Save review details */
			const feedback = db.collection(TABLE_CONTACT_US);
			feedback.insertOne({
				name			: fullName,
				email			: email.toLowerCase(),
				phone 			: phoneNumber,
				message			: message,
				is_active		: ACTIVE,
				subject			: subject,
				api_type		: "front",
				user_type		: "other",
				is_deleted		: NOT_DELETED,
				created			: getUtcDate(),
				modified		: getUtcDate()
			}, (err) => {
				consoleLog("error i s");
				consoleLog(err);
				if(err) return next(err);


					
					/** Set options for send email ***/
					let emailOptions = {
						to: res.locals.settings["Site.admin_email"],
						action: "contact_us",
						rep_array: [fullName, subject, message],
					};
						
					/** Send email **/
					sendMail(req, res, emailOptions);
					
					/** Send success response */
					req.flash(STATUS_SUCCESS, res.__("front.contact.contact_has_been_send_successfully"));
					res.send({
						status: STATUS_SUCCESS,
						redirect_url: 'pages/thank-you',
						message: res.__("front.contact.contact_has_been_send_successfully")
					});
				
			});
		} else {

			let options = {
				collections : [
					{
						collection 	: TABLE_MASTERS,
						columns 	: ["_id","name"],
						conditions 	: {status:ACTIVE,dropdown_type:"contact_reason"},
					}
				]
			};
			/** Get Inquiry Type list **/
			getDropdownList(req, res,options).then(listResponse=>{
				if(listResponse.status != STATUS_SUCCESS) return callback(listResponse.status,"");
				return res.render("contact",{
					inquiryType	: (listResponse && listResponse.final_html_data && listResponse.final_html_data["0"])	?	listResponse.final_html_data["0"] : "",
					pageName 	: 'contact',
				});
			}).catch(next);
		}
	};//End contactUs()
	
	
	
	
}
module.exports = new Contact();
