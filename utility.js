const fs		= require('fs');
const ObjectId 	= require('mongodb').ObjectID;
const util		= require('util');
const crypto 	= require('crypto');
const bcrypt	= require("bcrypt");
const jwt 		= require('jsonwebtoken');	

/** 
 * Function for parse validation
 *
 * @param validationErrors  As validationErrors Array
 * @param req				As Request Data
 *
 * @return array
 */
parseValidation = (validationErrors,req)=>{
	let usedFields 		= [];
	let newValidations 	= [];
	if(Array.isArray(validationErrors)){
		validationErrors.map((item)=>{
			if(usedFields.indexOf(item.param) == -1){
				usedFields.push(item.param);
				newValidations.push(item);
			}
		});
		return newValidations;
	}else{
		return false;
	}
}
//End parseValidation();


/**
 * Function to parse validation front api
**/
parseValidationFrontApi = (validationErrors, req) => {
	var usedFields = [];
	var newValidations = [];
	if (Array.isArray(validationErrors)) {
		validationErrors.forEach(function (item) {
			if (usedFields.indexOf(item.param) == -1) {
				usedFields.push(item.param);
				newValidations[item.param] = [];
				newValidations[item.param].push(item.msg);
			}
		});
		let obj = {};
		for (var key in newValidations) {
			obj[key] = newValidations[key]
		}
		return obj;
	} else {
		return false;
	}
}

/**
 *Function to send errors
 *  */
sendErrors = (validationErrors, req) => {
	let response = {};
	return new Promise(resolve=>{
		response = {
			'data': {
				status: STATUS_ERROR,
				errors: validationErrors,
				message: "",
			}
		};
		return resolve(response);
		
	});
}
 
 
/**
 * Function to send Email
 *
 * @param to		As Recipient Email Address
 * @param repArray  As Response Array
 * @param action  	As Email Action
 *
 * @return array
 */
sendMail = (req,res,options)=>{
	const ejs = require("ejs");

	try{
		let to				=	(options && options.to)			?	options.to			:"";
		let repArray		=	(options && options.rep_array)	?	options.rep_array	:"";
		let action			=	(options && options.action)		?	options.action		:"";
		let attachments		=	(options && options.attachments)?	options.attachments	:"";
		let subject			=	(options && options.subject)	?	options.subject		:"";

		let userEmail		=	res.locals.settings["Email.user_email"];
		let emailHost		=	res.locals.settings["Email.host"];
		let emailPassword	=	res.locals.settings["Email.password"];
		let emailUserName	=	res.locals.settings["Email.user_name"];
		let emailPort		=	res.locals.settings["Email.port"];
		const nodemailer	=	require("nodemailer");

		const transporter 	= 	nodemailer.createTransport({
			host	: 	emailHost,
			port	: 	emailPort,
			secure	: 	(emailPort == 465) ? true : false, // true for 465, false for other ports
			auth	: 	{
				user: userEmail, // generated ethereal user
				pass: emailPassword // generated ethereal password
			},
			tls: {
				rejectUnauthorized: true
			}
		});

		const email_templates	=	db.collection(TABLE_EMAIL_TEMPLATES);
		const email_actions		= 	db.collection(TABLE_EMAIL_ACTIONS);

		/** Get Email template details **/
		email_templates.findOne({
			action : action
		},{projection:{_id:1,name:1,subject:1,body:1}},(err, result)=>{
			if(!err && result){

				let emailTemplateResult	= result;

				/** Get Email action details **/
				email_actions.findOne({
					action : action
				},
				{projection:{_id:1,options:1}},(emailErr, emailResult)=>{
					if(!emailErr && emailResult){

						let actionData 		= 	emailResult;
						let actionOptions 	= 	actionData.options.toString().split(",");
						let body			= 	emailTemplateResult.body;
						subject				= 	(subject) ? subject : emailTemplateResult.subject;
						actionOptions.forEach((value,key)=>{
							body = body.replace(RegExp('{'+value+'}','g'),repArray[key]);
						});

						/** get email layout **/
						ejs.renderFile(WEBSITE_LAYOUT_PATH + 'email.html',{settings:res.locals.settings},'',(err, html)=>{
							html 		= html.replace(RegExp('{{MESSAGE_BODY}}','g'),body);
							let mailOptions = {
								from	: 	emailUserName,
								to		: 	to,
								subject	: 	subject,
								html	: 	html
							};

							/** Send  attachment **/
							if(attachments){
								mailOptions["attachments"]	=	{
									path :	attachments
								};
							}

							/**Send email*/
							transporter.sendMail(mailOptions,(error, info)=>{
								if(error){
									console.log('error');
									return console.log(error);
								}else{
									let email_logs = db.collection(TABLE_EMAIL_LOGS);
									mailOptions.created = getUtcDate();
									email_logs.insertOne(mailOptions);
								}
							});
						});
					}else{
						return console.log('Error in email action');
					}
				})
			}else{
				return console.log('Error in email template');
			}
		})
	}catch(e){
		console.log("email error in sendMail function")
		console.log(e)
	}
}//end sendMail();

/**
 * Function for socket request from any where
 *
 * @param req		As Request Data
 * @param res		As Response Data
 * @param options	As options
 *
 * @return null
 */
socketRequest = (req,res,options)=>{
	if(typeof options.room_id !== typeof undefined && typeof options.emit_function !== typeof undefined){
		const clientSideSocket = require('socket.io-client')(WEBSITE_SOCKET_URL);
		clientSideSocket.emit('socketRequest', options);
	}else{
		return res.__("system.missing_parameters");
	}
}//end socketRequest()

/**
 * Function to get date in any format with utc format
 *
 * @param date 		as	Date object
 * @param format 	as 	Date format
 *
 * @reference Site : https://www.npmjs.com/package/dateformat
 *
 * @return date string
 */
 getUtcDate = (date,format)=>{
	const moment = require('moment');
	//console.log(moment().toObject());
	if(date){
		var now =  moment(date, moment.defaultFormat).toDate();
	}else{
		var now = moment().toDate();
	}
	return now;
	
}//end getUtcDate();


/**
 * Function to get date in any format with utc format
 *
 * @param date 		as	Date object
 * @param format 	as 	Date format
 *
 * @reference Site : https://www.npmjs.com/package/dateformat
 *
 * @return date string
 */
 getDateMoment = ()=>{

	const moment = require('moment');
	return moment();
	
}//end getUtcDate();

getUtcDate_old = (date,format)=>{
	
	const time = require('time');
	if(date){
		var now = new time.Date(date);
	}else{
		var now = new time.Date();
	}
	let changedDate = 	now.setTimezone("UTC");
	if(format){
		let dateFormat = require('dateformat');
		return dateFormat(now, format);
	}else{
		return now;
	}
}//end getUtcDate();

/**
 * Function to get date in any format
 *
 * @param date 		as	Date object
 * @param format 	as 	Date format
 *
 * @return date string
 */
newDate = (date,format)=>{
	if(date){
		var now 			= new Date(date);
	}else{
		var now 			= new Date();
	}
	if(format){
		let dateFormat = require('dateformat');
		return dateFormat(now, format);
	}else{
		return now;
	}
}//end newDate();

/**
 * Function for change file name
 *
 * @param fileName AS File Name
 *
 * @return filename
 */
changeFileName = (fileName)=>{
	let fileData		=	(fileName) ? fileName.split('.') : [];
	let extension		=	(fileData) ? fileData.pop() : '';
	fileName			=	fileName.replace('.'+extension,'');
	fileName			= 	fileName.replace(RegExp('[^0-9a-zA-Z\.]+','g'),'');
	fileName			= 	fileName.replace('.','');
	return fileName+'.'+extension;
}//end changeFileName();

/**
 * Function for make string to title case
 *
 * @param str AS String
 *
 * @return string
 */
toTitleCase = (str)=>{
	return str.replace(/\w\S*/g,(txt)=>{return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}//end toTitleCase();

/**
 * Function to get data base slug
 *
 * @param tableName AS Table Name
 * @param title AS Title
 * @param slugField AS Slug Field Name in database
 *
 * @return string
 */
getDatabaseSlug = (options)=>{
	return new Promise(resolve=>{
		let tableName 	= (options && options.table_name)	?	options.table_name	:"";
		let title		= (options && options.title)		?	options.title		:"";
		let slugField	= (options && options.slug_field)	?	options.slug_field	:"";
		const slug 		= require('slug');

		if(title=='' || tableName == "") return resolve({title : "", options	: options});

		let convertTitleIntoSlug 	=	slug(title).toLowerCase();
		let collectionName  		= 	db.collection(String(tableName));

		/** Set conditions **/
		let conditions 			= 	{};
		conditions[slugField] 	=  	{$regex : new RegExp(convertTitleIntoSlug, "i")};

		/** Get count from table **/
		collectionName.countDocuments(conditions,(err,count)=>{
			/** Send response **/
			resolve({
				title 	: (count > 0) ? convertTitleIntoSlug+'-'+count :convertTitleIntoSlug,
				options : options
			});
		});

	});
}//end getDatabaseSlug();

/**
 * Function for sanitize form data
 *
 * @param data				As Request Body
 * @param notAllowedTags	As Array of not allowed tags
 *
 * @return json
 */
sanitizeData = (data,notAllowedTags)=>{
	let sanitized = arrayStripTags(data,notAllowedTags);
	return sanitized;
}//End sanitizeData()

/**
 * Function to strip not allowed tags from array
 *
 * @param array				As Data Array
 * @param notAllowedTags	As Tags to be removed
 *
 * @return array
 */
arrayStripTags = (array,notAllowedTags)=>{
	if (array.constructor === Object){
		var result = {};
	}else{
		var result = [];
	}
	for(let key in array){
		value = (array[key] != null) ? array[key] : '';
		if(value.constructor === Array || value.constructor === Object) {
			result[key] = arrayStripTags(value,notAllowedTags);
		}else{
			result[key] = stripHtml(value.toString().trim(),notAllowedTags);
		}
	}
	return result;
}//End arrayStripTags()

/**
 * Function to Remove Unwanted tags from html
 *
 * @param html				As Html Code
 * @param notAllowedTags	As Tags to be removed
 *
 * @return html
 */
stripHtml = (html,notAllowedTags)=>{
	let unwantedTags= notAllowedTags;
	for(let j = 0;j < unwantedTags.length;j++){
		html = html.replace(unwantedTags[j],'');
	}
	return html;
}//end stripHtml();

/**
 * Function to upload image
 *
 * @param options	As data in Object
 *
 * @return json
 */
moveUploadedFile = (req,res,options)=>{
	return new Promise(resolve=>{
		
		let image 				=	(options && options.image)				?	options.image				:"";
		let filePath 			=	(options && options.filePath)			?	options.filePath			:"";
		let oldPath 			=	(options && options.oldPath)			?	options.oldPath				:"";
		let allowedExtensions 	=	(options && options.allowedExtensions)	?	options.allowedExtensions	:ALLOWED_IMAGE_EXTENSIONS;
		let allowedImageError 	=	(options && options.allowedImageError)	?	options.allowedImageError	:ALLOWED_IMAGE_ERROR_MESSAGE;
		let allowedMimeTypes 	=	(options && options.allowedMimeTypes)	?	options.allowedMimeTypes	:ALLOWED_IMAGE_MIME_EXTENSIONS;
		let allowedMimeError 	=	(options && options.allowedMimeError)	?	options.allowedMimeError	:ALLOWED_IMAGE_MIME_ERROR_MESSAGE;

		if(image == ''){
			/** Send success response **/
			let response = {
				status	: 	STATUS_SUCCESS,
				fileName:	oldPath,
				options	:	options
			};
			resolve(response);
		}else{
			let fileData	= (image.name)	? image.name.split('.') : [];
			let imageName	= (image.name)	? image.name : '';
			let extension	= (fileData)	? fileData.pop().toLowerCase() : '';
			if (allowedExtensions.indexOf(extension) == -1){
				/** Send error response **/
				let response = {
					status	: 	STATUS_ERROR,
					message	:	allowedImageError,
					options	:	options
				};
				resolve(response);
			}else{
				/** Create new folder of this month **/
				let newFolder	= 	(newDate("","mmm")+ newDate("","yyyy")).toUpperCase()+'/';
				createFolder(filePath+newFolder);

				let newFileName 	= newFolder + Date.now()+ '-' +changeFileName(imageName);
				let uploadedFile	= filePath+newFileName;

				/** move image to folder*/
				image.mv(uploadedFile,(err)=>{
					console.log("here error");
						//console.log(err);
						//return false;
					if (err){
						
						
						/** Send error response **/
						let response = {
							status	: 	STATUS_ERROR,
							message	:	"admin.system.something_going_wrong_please_try_again",
							options	:	options
						};
						resolve(response);
					}else{
						/** check mime type*/
						const child_process = require('child_process');
						child_process.exec('file --mime-type -b '+uploadedFile,(err, out, code)=>{
							if (allowedMimeTypes.indexOf(out.trim()) == -1){
								fs.unlink(uploadedFile,(err)=>{
									if (err){
										/** Send error response **/
										let response = {
											status	: 	STATUS_ERROR,
											message	:	__res("admin.system.something_going_wrong_please_try_again"),
											options	:	options
										};
										resolve(response);
									}else{
										/** Send error response **/
										let response = {
											status	: 	STATUS_ERROR,
											message	:	allowedMimeError,
											options	:	options
										};
										resolve(response);
									}
								});
							}else{
								if(oldPath != ''){
									let imagesData = {
										file_path : filePath+oldPath
									}
									/** remove old images*/
									removeFile(imagesData).then((imageResponse)=>{
										/** Send success response **/
										let response = {
											status	: 	STATUS_SUCCESS,
											fileName:	newFileName,
											options	:	options
										};
										resolve(response);
									});
								}else{
									/** Send success response **/
									let response = {
										status	: 	STATUS_SUCCESS,
										fileName:	newFileName,
										options	:	options
									};
									resolve(response);
								}
							}
						});
					}
				});
			}
		}
	});
}//End moveUploadedFile()

/**
 * Function for remove file from root path
 *
 * @param options As data in file root path
 *
 * @return json
 */
removeFile = (options)=>{
	return new Promise(resolve=>{
		var filePath	=	(options.file_path)	?	options.file_path	:"";
		let response = {
			status	: 	STATUS_SUCCESS,
			options	:	options
		};

		if(filePath !=""){
			/** remove file **/
			fs.unlink(filePath,(err)=>{
				if(!err){
					/** Send success response **/
					resolve(response);
				}else{
					/** Send error response **/
					response.status = STATUS_ERROR;
					resolve(response);
				}
			});
		}else{
			/** Send error response **/
			response.status = STATUS_ERROR;
			resolve(response);
		}
	})
}//end removeFile()

/**
 * Function to Make full image path and check file is exist or not
 *
 * @param options As data in Object format (like :-  file url,file path,result,database field name)
 *
 * @return json
 */
appendFileExistData = (options)=>{
	return new Promise(resolve=>{
		var fileUrl 			= 	(options.file_url)		?	options.file_url			:"";
		var filePath 			= 	(options.file_path)		?	options.file_path			:"";
		var result 				= 	(options.result)			?	options.result			:"";
		var databaseField 		= 	(options.database_field)	?	options.database_field	:"";
		var image_placeholder 	= 	(options.image_placeholder)	?	options.image_placeholder	:IMAGE_FIELD_NAME;
		var noImageAvailable	=	(options.no_image_available)?	options.no_image_available	:NO_IMAGE_AVAILABLE;

		if(result.length > 0){
			let index = 0;
			result.forEach((record,recordIndex)=>{
				var file = (record[databaseField] != '' && record[databaseField]!=undefined) ? filePath+record[databaseField] : '';
				result[recordIndex][image_placeholder] = noImageAvailable;
				/** Set check file data **/
				let checkFileData = {
					"file" 			: 	file,
					"file_url" 		: 	fileUrl,
					"image_name" 	: 	record[databaseField],
					"record_index" 	: 	recordIndex,
					"no_image_available" 	: 	noImageAvailable
				}

				checkFileExist(checkFileData).then((fileResponse)=>{
					let recordIndexResponse = 	(typeof fileResponse.record_index !== typeof undefined)	?	fileResponse.record_index	:"";
					let imageResponse		=	(fileResponse.file_url)		?	fileResponse.file_url		:"";
					result[recordIndexResponse][image_placeholder] = imageResponse;

					if(result.length-1 == index){
						/** Send response **/
						let response = {
							result	: 	result,
							options	:	options
						};
						resolve(response);
					}
					index++;
				});
			});
		}else{
			/** Send response **/
			let response = {
				result	: 	result,
				options	:	options
			};
			resolve(response);
		}
	});
}//End appendFileExistData()

/**
 * Function to check a file is exist in folder or not
 *
 * @param options As data in Object format (like :-  file,file url,image name,index)
 *
 * @return  json
 */
checkFileExist = (options)=>{
	return new Promise(resolve=>{
		var file 				= 	(options.file) ?	options.file :"";
		var fileUrl 			=	(options.file_url) ? options.file_url :"";
		var imageName 			= 	(options.image_name) ?	options.image_name	:"";
		var recordIndex			= 	(typeof options.record_index !== typeof undefined)	?	options.record_index :"";
		var noImageAvailable 	= 	(options.no_image_available) ? options.no_image_available :"";

		fs.stat(file,(err, stat)=>{
			if(!err) {
				/** Send response **/
				let response = {
					file_url		: 	fileUrl+imageName,
					record_index	:	recordIndex,
					options			:	options
				};
				resolve(response);
			}else{
				/** Send response **/
				let response = {
					file_url		: 	(noImageAvailable) ? noImageAvailable : NO_IMAGE_AVAILABLE,
					record_index	:	recordIndex,
					options			:	options
				};
				resolve(response);
			}
		});
	})
}//end checkFileExist()

/**
 * Function to send SMS
 *
 * @param req		As 	Request Data
 * @param res		As 	Response Data
 * @param options	As	Data object
 *
 * @return message
 */
sendSMS = (req,res,options)=>{
	return new Promise(resolve=>{
		let mobileNumber	=	(options && options.mobile_number)	?	options.mobile_number		:"";
		let userId			=	(options && options.user_id)		?	ObjectId(options.user_id)	:"";

		/** Send error response **/
		if(!mobileNumber) return resolve({status : STATUS_ERROR, options : options, message : res.__("system.something_going_wrong_please_try_again")});

		let msgBody			= 	(options && options.sms_template) 	? 	options.sms_template 	:"";
		let accountSid		= 	res.locals.settings['Twilio.account_sid'];
		let authToken		= 	res.locals.settings['Twilio.auth_token'];
		let twilioNumber	= 	res.locals.settings['Twilio.phone_number'];
		let client 			=	require('twilio')(accountSid, authToken);

		/** Save sms logs data **/
		let saveData 				= 	{};
		saveData["user_id"] 		= 	(options.user_id)	?	ObjectId(options.user_id) :"";
		saveData["mobile_number"] 	= 	mobileNumber;
		saveData["message"] 		= 	msgBody;
		saveData["created"] 		= 	getUtcDate();
		saveData["status"]			= 	SENT;
		saveData["response"]		=	msgBody;//JSON.stringify(message);
		saveSmsLogs(saveData);
		
		resolve({
			status	:	STATUS_SUCCESS,
			message	: 	"",
			options	:	""
		});
		
		/** Send SMS **
		client.messages.create({
				body	: 	msgBody,
				to		: 	mobileNumber,
				from	:	twilioNumber
			},(err,message)=>{
				if(err){
					/********** Save sms logs ************
						saveData["status"] 		= 	NOT_SENT;
						saveData["response"] 	= 	err;

						saveSmsLogs(saveData);
					/********** Save sms logs ************

					/** Send error response **
					return resolve({
						status	:	STATUS_ERROR,
						message	: 	err,
						options	:	options
					});
				}
				/********** Save sms logs ************
					saveData["status"]	= 	SENT;
					saveData["response"]=	JSON.stringify(message);

					saveSmsLogs(saveData);
				/********** Save sms logs ************

				/** Send success response **
				resolve({
					status	:	STATUS_SUCCESS,
					message	: 	message,
					options	:	options
				});
			}
		);*/
	});
}//sendSMS()

/**
 * Function to save sms logs
 *
 * @param options As Data object
 *
 * @return null
 */
saveSmsLogs = (options)=>{
	/** Save sms logs **/
	const sms_logs = db.collection(TABLE_SMS_LOGS);
	sms_logs.insertOne(options,(err,result)=>{});
	return;
}//End saveSmsLogs();

/**
 * Function to check mobile number is valid or not
 *
 * @param req		As 	Request Data
 * @param res		As 	Response Data
 * @param options	As	Data object
 *
 * @return message
 */
checkMobileNumber = (req,res,options)=>{
	return new Promise(resolve=>{
		let accountSid	= 	res.locals.settings['Twilio.account_sid'];
		let authToken	= 	res.locals.settings['Twilio.auth_token'];
		let client 		= 	require('twilio')(accountSid, authToken);
		let mobileNumber=	(options && options.mobile_number)	?	options.mobile_number	:"";

		/** Check mobile number*/
		try{
			client.lookups.phoneNumbers(mobileNumber).fetch({type: 'carrier'}).then(response=>{
				if(typeof response.carrier !== typeof undefined && typeof response.carrier.type !== typeof undefined && response.carrier.type =="mobile"){
					/** Send success response **/
					let response = {
						status	:	STATUS_SUCCESS,
						options	:	options
					};
					resolve(response);
				}else{
					/** Send error response **/
					let response = {
						status	:	STATUS_ERROR,
						options	:	options
					};
					resolve(response);
				}
			}).catch((e) => {
				/** Send error response **/
				let response = {
					status	:	STATUS_ERROR,
					options	:	options
				};
				resolve(response);
			}).done();
		}catch(e){
			/** Send error response **/
			let response = {
				status	:	STATUS_ERROR,
				options	:	options
			};
			resolve(response);
		}
	});
}//checkMobileNumber()

/**
 * Function to Check request is called from mobile of web
 *
 * @param req	As Request Data
 * @param res	As Response Data
 *
 * @return boolean
 */
isMobileApi = (req,res)=>{
	if(typeof req.headers !== typeof undefined && typeof req.headers.authkey !== undefined &&  req.headers.authkey == WEBSITE_HEADER_AUTH_KEY && typeof req.route !== typeof undefined && typeof req.route.path !== typeof undefined && req.route.path == '/mobile_api'){
		return true;
	}else{
		return false;
	}
}//End isMobileApi()

/**
 * Datatable configuration
 *
 * @param req		As	Request Data
 * @param res		As 	Response Data
 * @param options	As Object of data have multiple values
 *
 * @return json
 */
configDatatable = (req,res,options)=>{
	return new Promise(resolve=>{
		consoleLog("req.body in config funtion");
		consoleLog(req.body);
		var resultDraw		= 	(req.body.draw)	? req.body.draw : 1;
		var sortIndex	 	= 	(req.body.order && req.body.order[0]['column']) 	? 	req.body.order[0]['column']		: '' ;
		var sortOrder	 	= 	(req.body.order && req.body.order[0]['dir'] && (req.body.order[0]['dir'] == 'asc')) ? SORT_ASC :SORT_DESC;

		/** Searching  **/
		var conditions 		=	{};
		var searchData 		=	(req.body.columns) ? req.body.columns :[];
		if(searchData.length > 0){
			searchData.forEach((record,index)=>{
				let fieldName 	= ((record.field_name) ? record.field_name : ((record.data) ? record.data : ''));
				let searchValue	= (record.search && record.search.value) ? record.search.value.trim() : '';
				let fieldType	= (record.field_type) ? record.field_type : '';
				if(searchValue && fieldName){
					switch(fieldType){
						case NUMERIC_FIELD:
							conditions[fieldName] = parseInt(searchValue);
						break;
						case OBJECT_ID_FIELD:
							conditions[fieldName] = ObjectId(searchValue);
						break;
						case EXACT_FIELD:
							conditions[fieldName] = searchValue;
						break;
						default:
							try{
								searchValue 			= cleanRegex(searchValue);
								conditions[fieldName] 	= new RegExp(searchValue, "i");
							}catch(e){
								conditions[fieldName] 	= searchValue;
							}
						break;
					}
				}
			});
		}

		/** Sorting **/
		var sortConditions = {};
		if(sortIndex !=''){
			if(searchData[sortIndex]){
				if(searchData[sortIndex].field_name){
					sortConditions[searchData[sortIndex].field_name] = sortOrder;
				}else if(searchData[sortIndex].data){
					sortConditions[searchData[sortIndex].data] = sortOrder;
				}
			}
		}else{
			sortConditions['_id'] = sortOrder;
		}
		resolve({
			sort_conditions : sortConditions,
			conditions 		: conditions,
			result_draw 	: resultDraw,
			options 		: options,
		});
	});
}//End configDatatable()

/**
 * Function to genrate random otp
 *
 * @param null
 *
 * @return OTP
 */
getRandomOTP = ()=> {
	var random = require("node-random");
	return new Promise(resolve=>{
		 //~ resolve(Math.floor(100000 + Math.random() * 900000));
		resolve(1234);
	});
}//end getRandomOTP();

/**
 * Function to convert multipart form data
 *
 * @param req As Request Data
 * @param res As Response Data
 *
 * @return json
 */
convertMultipartFormData = (req,res) =>{
	return new Promise(resolve=>{
		if(req.body && Object.keys(req.body).length >0){
			Object.keys(req.body).forEach((key)=>{
				try{
					req.body[key] = JSON.parse(req.body[key]);
				}catch(e){
					req.body[key] = req.body[key];
				}
			});
		}
		if(req.files && Object.keys(req.files).length >0){
			Object.keys(req.files).forEach((key)=>{
				try{
					key = JSON.parse(key);
				}catch(e){
					key = key;
				}
				try{
					req.files[key] = JSON.parse(req.files[key]);
				}catch(e){
					req.files[key] = req.files[key];
				}
			});
		}
		resolve();
	});
}//end convertMultipartFormData();

/**
 *  Function to Round the number
 *
 * @param value		As Number To be round
 * @param precision As Precision
 *
 * @return number
 */
round = (value, precision)=>{
	try{
		if(!value || isNaN(value)){
			return value;
		}else{
			precision = (typeof precision != typeof undefined && precision) ? precision :ROUND_PRECISION;
			var multiplier = Math.pow(10, precision || 0);
			return Math.round(value * multiplier) / multiplier;
		}
	}catch(e){
		return value;
	}
}// end round()

/**
 * Function for get languages list
 *
 * @param defaultLanguage	As Default Language
 *
 * @return json
 */
getLanguages = (defaultLanguage) =>{
	return new Promise(resolve=>{
		try{
			/** Set  Conditios **/
			if(!defaultLanguage){
				var conditions	=	{active : ACTIVE};
			}else{
				var conditions	=	{'_id' : ObjectId(defaultLanguage), active : ACTIVE };
			}

			/** Get Language List **/
			var languages = db.collection(TABLE_LANGUAGES);
			languages.find(
				conditions
			).toArray((err,result)=>{
				if(result){
					/** Send success response **/
					resolve(result);
				}else{
					/** Send blank response **/
					resolve([]);
				}
			});
		}catch(e){
			/** Send blank response **/
			resolve([]);
		}
	});
}//End getLanguages()

/**
 * Function to get master list
 *
 * @param to		As	Recipient Email Address
 * @param repArray  As 	Response Array
 * @param options  	As 	data as json format
 *
 * @return json
 */
getMasterList = (req,res,options)=>{
	return new Promise(resolve=>{
		try{
			if(typeof options!== typeof undefined && typeof options["type"] !== typeof undefined && options["type"].constructor === Array && options["type"].length >0){
				/** Get master List **/
				var masters = db.collection(TABLE_MASTERS);
				masters.aggregate(
				[
					{$match 	: 	{
						status			:	ACTIVE,
						dropdown_type	:	{$in : options["type"]},
					}},
					{$sort : {name : SORT_ASC}},
					{$group	:	{
						_id		:	"$dropdown_type",
						data	:	{$push : {
										id 		: "$_id",
										name 	: "$name"
									}}
					}},
				]).toArray((err, result)=>{
					if(!err){
						let finalResult = {};
						if(result && result.length >0){
							result.map((item,index)=>{
								let masterType =	(item._id)	?	item._id	:"";
								let masterData =	(item.data)	?	item.data	:[];

								if(masterType !=""){
									finalResult[masterType] = masterData;
								}
							});
						}

						/** Send success response **/
						let resolveResponse = {
							status 	: 	STATUS_SUCCESS,
							result 	: 	finalResult,
							options :	options
						}
						resolve(resolveResponse);
					}else{
						/** Send error response **/
						let resolveResponse = {
							status 	: 	STATUS_ERROR,
							options	:	options,
							message : 	res.__("admin.system.something_going_wrong_please_try_again")
						}
						resolve(resolveResponse);
					}
				});
			}else{
				/** Send error response **/
				let resolveResponse = {
					status 		: 	STATUS_ERROR,
					options 	:	options,
					message 	: 	res.__("admin.system.something_going_wrong_please_try_again")
				}
				resolve(resolveResponse);
			}
		}catch(e){
			/** Send error response **/
			let resolveResponse = {
				status 		: 	STATUS_ERROR,
				options 	:	options,
				message 	: 	res.__("admin.system.something_going_wrong_please_try_again")
			}
			resolve(resolveResponse);
		}
	});
}// end getMasterList()

/**
 * Function to add days in given date
 *
 * @param addDay AS Number Of Hours to be added
 *
 * @return date string
 */
addDate = (hours)=>{
	var	addDayTimestamp = hours * 60 * 60 * 1000;
	now	= new Date(Date.now() + addDayTimestamp);
	return now;
}//end addDate();

/**
 * Function to subtract days in given date
 *
 * @param Hours AS Number Of Days to be subtracted
 *
 * @return date string
 */
subtractDate = (Hours)=>{
	var subtractHoursTimestamp = Hours * 60 * 60 * 1000;
	now 	= new Date(Date.now() - subtractHoursTimestamp);
	return now;
}//end subtractDate();

/**
 * Function to subtract minute in current date time
 *
 * @param minute AS minute to be subtracted
 *
 * @return date string
 */
subtractMinute = (minute)=>{
	var subtractMinuteTimestamp = minute * 60 * 1000;
	now 	= new Date(Date.now() - subtractMinuteTimestamp);
	return now;
}//end subtractMinute();

/*
How to call Function :
let notificationOptions = {
	notification_data : {
		user_id 			: {{userId}},
		notification_type	: {{notificationType}},
		parent_table_id		: {{parentTableId}}, // Optional
		message				: {{notificationMessage}}, // optional either message or message params
		message_params		: {{notificationMessageParams}}, // optional either message or message params
		url					: {{notificationUrl}} eg. /brand/brands/view, // Optional
		extra_parameters	: {} // Optional
		created_by			: {{createdBy}}, // Optional
		created_role_id		: {{createdRoleId}}, // Optional
	}
}
insertNotifications(req,res,notificationOptions);
*/


/**
 *  Function to get notifications template
 *
 * @param req 			As Request Data
 * @param res 			As Response Data
 * @param options		As options
 *
 * @return array
 */
getNotificationsTemplates = (req,res,options) =>{
	return new Promise(resolve=>{
		let notificationType	=	(options && options.notification_type)	?	parseInt(options.notification_type)	:"";
		let messageParams		=	(options && options.messageParams)		?	options.messageParams	:"";

		notificationDataByType = db.collection(TABLE_NOTIFICATION_TEMPLATES).findOne({notification_type:notificationType},function(errorsTemplate,resultTemplate){
			if(resultTemplate){
				/** Get message from message param parameters **/
				let constants 			= resultTemplate.constants;
				notificationMessage 	= resultTemplate.body;
				notificationTitle 		= resultTemplate.subject;
				for(let i = 0;i<constants.length;i++){
					notificationMessage = notificationMessage.replace(RegExp(constants[i],'g'),messageParams[i]);
				}
				let resolveResponse = {
					notificationMessage	:	notificationMessage ? notificationMessage 	: "",
					notificationTitle	:	notificationTitle 	? notificationTitle 	: "",
				};
				resolve(resolveResponse);
			}else{
				let resolveResponse = {
					notificationMessage	:	"",
					notificationTitle	:	"",
				};
				resolve(resolveResponse);
			}
		})
	});
}// end getNotificationsTemplates()


/**
 *  Function to insert notification
 *
 * @param req 			As Request Data
 * @param res 			As Response Data
 * @param options		As options
 *
 * @return array
 */
insertNotifications	= async(req,res,options) =>{
	consoleLog("insertNotifications");
	let notificationData	= 	(options['notification_data']) 	? 	options['notification_data'] 		:"";
	let notificationType	= 	(notificationData['notification_type']) ? 	parseInt(notificationData['notification_type'])	:"";
	let messageParams		= 	(notificationData['message_params']) 	? 	notificationData['message_params'] 		:"";
	let notificationMessage =	"";
	let notificationTitle 	=	"";
	if(messageParams){
		/** Set save notification options **/
		var getOptions	=	{
			notification_type	:	notificationType,
			messageParams		:	messageParams,
		};

		/** get notification data **/
		await getNotificationsTemplates(req,res,getOptions).then(getTemplate=>{
			notificationMessage = getTemplate.notificationMessage;
			notificationTitle 	= getTemplate.notificationTitle;
		})
			
	}else{
		notificationMessage = (notificationData['message'])	? notificationData['message'] :"";
	}
	//consoleLog(" notificationMessage is");
	//consoleLog(notificationMessage);
	//consoleLog(" notificationTitle is");
	//consoleLog(notificationTitle);
	return new Promise(resolve=>{
		consoleLog("HI 123456789");
		
		let userId			=	(notificationData['user_id'])			?	notificationData['user_id']				: ((req.session.user._id) ? req.session.user._id :"");
		let createdByRoleId		=	(notificationData['user_role_id'])		?	notificationData['user_role_id']		: ((req.session.user.user_role_id) ? req.session.user.user_role_id :"");
		let parentTableId		= 	(notificationData['parent_table_id']) 	? 	notificationData['parent_table_id'] 	:"";
		let url					=	(notificationData["parent_url"]) 	?	notificationData["parent_url"]	:"javascript:void(0);";
		let notificationAction	=	(notificationData["notification_action"]) 	?	notificationData["notification_action"]	:"";
		let pnType				=	(notificationData["pn_type"]) 	?	notificationData["pn_type"]	:"";
		let requestStatus		=	(notificationData["request_status"]) 	?	notificationData["request_status"]	:DEACTIVE;
		let createdBy			=	(notificationData['created_by'])			?	notificationData['created_by']				: "";

		let saveNotificationData= {
			user_id				: "",
			user_role_id		: "",
			created_by			: ObjectId(createdBy),
			created_role_id		: createdByRoleId,
			title				: notificationTitle,
			message				: notificationMessage,
			parent_table_id		: ObjectId(parentTableId),
			extra_parameters	: (notificationData['extra_parameters']) ? notificationData['extra_parameters']:{},
			notification_type	: notificationType,
			notification_action	: notificationAction,
			pn_type				: pnType,
			request_status		: requestStatus,
			is_seen				: NOT_SEEN,
			is_read				: NOT_READ,
			created				: getUtcDate(),
			modified			: getUtcDate()
		};
		consoleLog(saveNotificationData);

		let userRoleId 		= (notificationData['role_id']) 	? notificationData['role_id'] 	: ADULTS_USER_ROLE_ID;
		let selectedUserIds	= (notificationData["user_ids"]) 	? notificationData["user_ids"] 	: [];
	
		
		/** Set save notification options **/
		var saveOptions	=	{
			user_ids			:	selectedUserIds,
			notification_data	:	saveNotificationData,
			notification_type	:	notificationType,
			user_role_id		:	userRoleId
		};
		consoleLog(saveOptions);
		/** Save notification data **/
		saveNotifications(req,res,saveOptions).then(saveDataStatus=>{
			let resolveResponse = {
				status 					: 	saveDataStatus.status,
				user_list				:	(saveDataStatus.user_list)	?	saveDataStatus.user_list	:[],
				message					:	(saveDataStatus.message)	?	saveDataStatus.message		:"",
				options 				:	options,
				notificationMessage 	:	notificationMessage,
				notificationTitle 		:	notificationTitle,
			};
			resolve(resolveResponse);
		});
	});
}// end insertNotification()




/**
 *  Function to save notifications
 *
 * @param req 			As Request Data
 * @param res 			As Response Data
 * @param options		As options
 *
 * @return array
 */
saveNotifications = (req,res,options) =>{
	return new Promise(resolve=>{
		let userIds				=	(options && options.user_ids)			?	options.user_ids			:[];
		let notificationType	=	(options && options.notification_type)	?	options.notification_type	:"";

		if(userIds.length>0 && notificationType){
			consoleLog("here insert noti");
			const clone					= 	require("clone");
			let saveNotificationData	=	(options && options.notification_data)	?	options.notification_data	:[];
			let notificationUserRoleId	=	(options && options.user_role_id)		?	options.user_role_id		:"";

			/** Set insertable data **/
			let notificationsList 	= 	userIds.map(records=>{
				let tempNotificationData	 		 = 	clone(saveNotificationData);
				tempNotificationData['user_id'] 	 = 	ObjectId(records);
				tempNotificationData['user_role_id'] = 	notificationUserRoleId;
				return tempNotificationData;
			});

			//console.log("check save notuy");
			//console.log(saveNotificationData);

			/** Insert in notification table **/
			const notifications	= 	db.collection(TABLE_NOTIFICATIONS);
			notifications.insertMany(notificationsList,{forceServerObjectId:true},(notificationErr,notificationResult)=>{
				
				if(!notificationErr){
					/** Send push notification**/
					notificationsList.map(notificationUserId=>{
						let extraParams = (saveNotificationData["extra_parameters"]) ? saveNotificationData["extra_parameters"] : {};
						let pn_type = (saveNotificationData["pn_type"]) ? saveNotificationData["pn_type"] : {};
						let slug = "";
						if(Object.keys(extraParams).length > 0){
							slug = (extraParams.slug) ? extraParams.slug : "";
						}
						//console.log("here hirdesh pushNotification");
						pushNotification(req,res,{
							pn_body:saveNotificationData["message"],user_id:String(notificationUserId["user_id"]),slug:slug,pn_type:pn_type
						}).then(pnResponse=>{});

						let socketRequestData = {
							room_id 		: String(notificationUserId["user_id"]),
							emit_function	: "notification_received",
							message			: saveNotificationData["message"]
						};
						socketRequest(req,res,socketRequestData);
					});

					/** Set insertable data **/
					let resolveResponse = {
						status 		: 	STATUS_SUCCESS,
						user_list 	: 	notificationsList,
						options 	:	options
					};
					resolve(resolveResponse);
				}else{
					let resolveResponse = {
						status 		: 	STATUS_ERROR,
						user_list 	: 	[],
						message		:	res.__("admin.system.something_going_wrong_please_try_again"),
						options 	:	options
					};
					resolve(resolveResponse);
				}
			});
		}else{
			/** Send error response **/
			let resolveResponse = {
				status 		: 	STATUS_ERROR,
				user_list 	: 	[],
				message		:	res.__('admin.users.no_user_selected'),
				options 	:	options
			};
			resolve(resolveResponse);
		}
	});
}// end saveNotifications()


/**
 * To check request method is post or get
 *
 * @param req	As Request Data
 * @param res	As Response Data
 *
 * @return boolean
 */
isPost = (req)=>{
	if(typeof req.body !== typeof undefined && Object.keys(req.body).length != 0){
		return true;
	}else{
		return false;
	}
}//End isPost()


/**
 * Function for push notification
 *
 * @param req 		As 	Request Data
 * @param res 		As 	Response Data
 * @param options	As	Object data
 *
 * @return null
 
 */
pushNotification = (req,res,options)=>{
	return new Promise(resolve=>{
		let body		= (options)				 ? options				: {};
		let userId		= (options.user_id)		 ? options.user_id		: "";
		let pnBody		= (options.pn_body)		 ? options.pn_body		: "Test Message";
		let pnTitle		= (options.pn_title)	 ? options.pn_title		: "Uzube";
		
		let slug		= (options.slug) 	? options.slug	:"";
		let pnType		= (options.pn_type) 	? options.pn_type	:"";
		
		let pnImage		= (options.image)		 ? options.image	: "";

		body["badge"] 	= 0;
		body["url"] 	= MOBILE_URL;
		body["image"] 	= pnImage;

			/** Set conditions **/
			let conditions	=	{
				
				is_deleted		:	NOT_DELETED,
				_id				:  ObjectId(userId)
			};

			/** Set options data for get user details **/
			let userOptions = {
				conditions	:	conditions,
				fields		:	{pn_allowed :1,google_id:0,linkedin_id:0,otp:0,is_deleted:0,created:0,device_details:0,modified:0}
			};

			/** Get user details **/
		getUserDetail(req, res, userOptions).then(userResponse => {
		
			//console.log("User details push notification function");
			//console.log(userResponse);

			var pnAllowedByUser = (userResponse.result.pn_allowed) 	? userResponse.result.pn_allowed	:[]; 
			
		//var checkTest = 	pnAllowedByUser.includes(pnType);
		
		pnAllowedByUser.push("new_post");
		if (Object.values(pnAllowedByUser).indexOf(pnType) > -1) {

			
		const async	 	= require('async');
		const FCM		= require('fcm-push');
		const apn 		= require("apn");
		//let serverKey 	= WEBSITE_PN_ANDROID_SERVER_KEY;
		//let fcm 		= new FCM(serverKey);

		let responseData = [];
		/** Get user details **/
		const users	=	db.collection(TABLE_USERS);
		users.findOne({
			_id	:	ObjectId(userId),
		},{  projection: { _id: 1, email: 1,full_name:1,device_id:1,device_token:1,device_type:1} },(err,userResult)=>{
			userResult = userResult ? userResult : {};
			console.log("userResult")
		//console.log(userResult)
			if(Object.keys(userResult).length == 0){
				/** Send error response **/
				return resolve({
					status 	: STATUS_ERROR,
					result	: result
				});
			}
			let deviceType	= (userResult.device_type) 			? 	userResult.device_type			:"";
			let deviceToken	= (userResult.device_token)	?	userResult.device_token	:"";
			
			switch(pnType){
				case PN_TYPE_CONFIG.ride_request:
					pnTitle = res.__("Ride Request");
				break;
				
				default :
					pnTitle	= (options.pn_title) ? options.pn_title	:"Trixxie";
				break;
			}
			
			
			//return false;
			async.parallel([
				asyncCallback=>{
					/** Send push notification **/
					if(deviceType == "android" || deviceType == "Android"){
						
						var token = deviceToken;//'dPNa4F0tpjU:APA91bFWbCoWaUF4Sy4Zaruy07amcrT97tIizExHOS1Z0lM70tJwAFVDBpVBPkPiBHuAf-NJtq1ODnLP7P3j9gO3Ovy2-4HZTsiub4Ldbogqd2VF5drgaWKSUHM-tTBOoUGB7Sta2Sru';//deviceToken;
						
						let serverKey 	= 	WEBSITE_PN_ANDROID_SERVER_KEY;
						let fcm 		=	new FCM(serverKey);
						
						if(token){
							var message = {
								to: token,
								collapse_key: 'your_collapse_key',
								notification: {},
								data: body
							};
							fcm.send(message,(err, response)=>{
								let tempResponse = (response) ? JSON.parse(response) :{};
								let sentStatus	 = (tempResponse && tempResponse.success) ? parseInt(tempResponse.success) :NOT_SENT;

								/** Save log request **/
								let saveLogsData = {
									title 			: pnTitle,
									body 			: pnBody,
									user_id			: (userId) ? ObjectId(userId) :"",
									slug			: slug,
									pn_type			: pnType,
									device_type 	: deviceType,
									device_token	: token,
									request			: message,
									response		: response,
									sentStatus		: sentStatus,
									error			: err,
									created			: getUtcDate()
								};
								savePNRequest(saveLogsData); //call function to save
								responseData.push(response);
								asyncCallback(null);
							});
						}else{
							asyncCallback(null);
						}
							
						
						
					}else{
						asyncCallback(null);
					}
				},
				asyncCallback=>{
					if(deviceType == "iphone"){
						let service =   new apn.Provider({
											//cert		: WEBSITE_ROOT_PATH+"cert/cert.pem",
											//key			: WEBSITE_ROOT_PATH+"cert/key.pem",
											//production	: false
											token: {
												key:  WEBSITE_ROOT_PATH+"cert/AuthKey_82FBB56236.p8", //"path/to/APNsAuthKey_XXXXXXXXXX.p8",
												keyId: "82FBB56236",
												teamId: "SFA9GUN7NY"
											},
											production: false
										});

						let pnTempNotificationData = {
							alert	: pnTitle,
							data	: pnBody,
							payload : {data : body},
							aps 	: {
								"alert"				: pnBody,
								"image" 			: pnImage,
								"title"				: pnTitle,
								"message"			: pnBody,
								'mutable-content' 	: 1,
								"data"				: body
							}
						};

						let note = new apn.Notification(pnTempNotificationData);
						service.send(note,deviceToken).then(iphoneResult =>{
							let sentStatus	 = (iphoneResult && iphoneResult.sent && iphoneResult.sent.length ==1) ? SENT :NOT_SENT;

							/**Save log request **/
							let saveLogsData 	= {
								title 			: 	pnTitle,
								body 			: 	pnBody,
								user_id			: 	(userId) ? ObjectId(userId) :"",
								ride_id			: 	rideId,
								pn_type			: 	pnType,
								device_type 	: 	deviceType,
								device_token	:	deviceToken,
								request			: 	pnTempNotificationData,
								response		: 	iphoneResult,
								sentStatus		: 	sentStatus,
								created			:	getUtcDate()
							};
							savePNRequest(saveLogsData); //call function to save
							service.shutdown();
							responseData.push(iphoneResult);
							asyncCallback(null);
						});
					}else{
						asyncCallback(null);
					}
				}
			],(asyncErr)=>{
				resolve({
					status 	: STATUS_SUCCESS,
					result	: responseData
				});
			});
		});
	}else{
		console.log("here in else");
		resolve({
			status 	: STATUS_SUCCESS,
			result	: ""
		});
	}
	});
	
	});
}//End pushNotification()



/**Function to save pn log */
savePNRequest = (options)=>{
	const pn_logs	= 	db.collection(TABLE_PN_LOGS);
	pn_logs.insertOne(options,(err,result)=>{});
	return;
}//End savePNRequest();

/*
How to call Function :
let options = {
    collections : [
        {
            collection  : "users",
            columns     : {{columnsData}},  eg. ["_id","full_name"],
            conditions  : {{conditions}},   eg. {is_deleted:NOT_DELETED}
        },
        {
            collection  : "masters",
            columns     : {{columnsData}},  eg. ["_id","title"],
            conditions  : {{conditions}},   eg. {is_deleted:NOT_DELETED}
        },
    ]
}
getDropdownList(req,res,options);
*/

/**
 *  Function to get dropdown list with html
 *
 * @param req 				As Request Data
 * @param res 				As Response Data
 * @param options			As options
 *
 * @return object
 */
getDropdownList = (req,res,options)=>{
	return new Promise(resolve=>{
        var collections	    = (options.collections) ? options.collections :{};
        var responseSend    = false;
        var finalHtmlData   = {};
		if(collections && collections.length >0){
            let index = 0;
            collections.map((collectionRecords,j)=>{
				let collection  	= (collectionRecords["collection"]) ? collectionRecords["collection"] 	: "";
				let selectedValues 	= (collectionRecords["selected"]) 	? collectionRecords["selected"] 	: [];
                let columns			= (collectionRecords.columns)	    ? collectionRecords.columns 		: [];
                let columnKey		= (columns[0]) ? columns[0] : "";
                let columnValue		= (columns[1]) ? columns[1] : "";
                let conditions		= (collectionRecords.conditions) ? collectionRecords.conditions :{};// First parameter should be key, and second should be value
                let finalHtml	= "";
                if(columnKey && columnValue && conditions){
					let sortConditions 			= 	{};
					sortConditions[columnValue]	= 	SORT_ASC;

					if(collectionRecords["sort_conditions"]){
						sortConditions	= collectionRecords["sort_conditions"];
					}

                    let finalColumns= {};
                    finalColumns[columnKey] 	= 1;
                    finalColumns[columnValue] 	= 1;
					
					if(collection==TABLE_USERS){
						finalColumns['mobile_number'] 	= 1;
					}

                    var collectionObject = db.collection(collection);
                    collectionObject.find(
                        conditions,
                        finalColumns
                    ).collation(COLLATION_VALUE).sort(sortConditions).toArray((err,result)=>{
                        if(!err){
                            for(let i=0;i<result.length;i++){
								let records 		= (result[i]) ? result[i] : "";
								let selectedHtml 	= "";
								for(let i = 0;i<selectedValues.length;i++){
									if(String(selectedValues[i]) == String(records[columnKey])){
										selectedHtml = 'selected="selected"';
									}
								}
								
								if(collection==TABLE_USERS){
									finalHtml 	+= '<option value="'+records[columnKey]+'" '+selectedHtml+'>'+records[columnValue]+'</option>';
								}else{
									finalHtml 	+= '<option value="'+records[columnKey]+'" '+selectedHtml+'>'+records[columnValue]+'</option>';
								}
                            }
                            finalHtmlData[j] = finalHtml;
                            if(Object.keys(collections).length-1 == index){
                                if(!responseSend){
                                    let resolveResponse = {
                                        status 			: 	STATUS_SUCCESS,
                                        final_html_data	: 	finalHtmlData,
                                        options 		:	options
                                    }
                                    resolve(resolveResponse);
                                }
                            }
                        }else{
                            if(!responseSend){
                                let resolveResponse = {
                                    status 		: 	STATUS_ERROR,
                                    message		:	res.__("admin.system.something_going_wrong_please_try_again"),
                                    options 	:	options
                                }
                                resolve(resolveResponse);
                            }
                        }
                        index++;
                    });
                }else{
                    if(!responseSend){
                        let resolveResponse = {
                            status 		: 	STATUS_ERROR,
                            message		:	res.__("admin.system.missing_parameters"),
                            options 	:	options
                        }
                        resolve(resolveResponse);
                    }
                    index++;
                }
			});
		}else{
			let resolveResponse = {
				status 		: 	STATUS_ERROR,
				message		:	res.__("admin.system.missing_parameters"),
				options 	:	options
			}
			resolve(resolveResponse);
		}
	});
}//End getDropdownList()

/**
 *  Function to generate a random sting
 *
 * @param req 		As Request Data
 * @param res 		As Response Data
 * @param options	As options
 *
 * @return string
 */
getRandomString = (req,res,options)=>{
	return new Promise(resolve=>{
		let random 			= require("node-random");
		let srtingLength	= (options && options.srting_length) ? parseInt(options.srting_length) : 8;
		/**Generate random string **/
		var randomstring = require("randomstring");
		let unique = randomstring.generate({
			length			: srtingLength,
			charset			: 'alphanumeric',
			capitalization	: 'uppercase'
		});
		return resolve({
			status 	: 	STATUS_SUCCESS,
			result	:	unique,
			options :	options
		});

		random.strings({
			"length":	1,
			"number": 	srtingLength,
			"upper"	: 	true,
			"lower" : 	false,
			"digits": 	true
		},(error, data)=>{
			if (error){
				/** Send error response **/
				return resolve({
					status 	: 	STATUS_ERROR,
					message	:	res.__("admin.system.something_going_wrong_please_try_again"),
					options :	options
				});
			}

			/** Send success response **/
			resolve({
				status 	: 	STATUS_SUCCESS,
				result	:	data.join(''),
				options :	options
			});
		});
    });
}//End getRandomString()

/**
 *  Function to create a new folder
 *
 * @param path	As	folder path
 *
 * @return Object
 */
createFolder = (path)=>{
	return new Promise(resolve=>{
		const async			= require('async');
		let filePathData 	= path.split('/');
		let fullPath 		= "/";
		if(filePathData.length>0){
			async.each(filePathData,(folderName, asyncCallback)=>{
				if(folderName!=""){
					fullPath += folderName+"/";
				}
				if(!fs.existsSync(fullPath)){
					fs.mkdirSync(fullPath);
				}
				asyncCallback(null);
			},asyncErr=>{
				/** Send success response **/
				resolve({status	: STATUS_SUCCESS});
			});
		}else{
			/** Send success response **/
			resolve({status	: STATUS_SUCCESS});
		}
	});
}// end createFolder()

/**
 * to replace /n with <br> tag
 *
 * @param html	As Html
 *
 * @return html
 */
nl2br = (html)=>{
	if(html){
		return html.replace(/\n/g, "<br />");
	}else{
		return html;
	}
}//end nl2br

/**
 * function is used to clear regular expression string
 *
 * @param regex	As Regular expression
 *
 * @return regular expression
 */
cleanRegex = (regex)=>{
	if(NOT_ALLOWED_CHARACTERS_FOR_REGEX && NOT_ALLOWED_CHARACTERS_FOR_REGEX.length>0){
		for(let i in NOT_ALLOWED_CHARACTERS_FOR_REGEX){
			regex = regex.split(NOT_ALLOWED_CHARACTERS_FOR_REGEX[i]).join('\\'+NOT_ALLOWED_CHARACTERS_FOR_REGEX[i]);
		}
		return regex;
	}else{
		return regex;
	}
}//end cleanRegex

/**
 * function is used to update user wise module flag
 *
 * @param userId as User Id
 * @param data as Data to be updated
 * @param type as update Type : delete/add/get
 *
 * @return regular expression
 */
userModuleFlagAction = (userId,data,type)=>{
	var adminModulesList = myCache.get( "admin_modules_list" );
	if(typeof adminModulesList === typeof undefined){
		adminModulesList = {};
	}
	if(type == "add"){
		adminModulesList[userId] 			= data;
		myCache.set( "admin_modules_list", adminModulesList , 0 );
		return true;
	}else if(type == "delete"){
		delete adminModulesList[userId];
		myCache.set( "admin_modules_list", adminModulesList , 0 );
		return true;
	}else if(type == "get"){
		return adminModulesList[userId];
	}
}//end userModuleFlagAction

/**
 * Function to Remove html tags from string
 *
 * @param string As text string
 *
 * @return html
 */
stripTag = (string)=>{
	return string.replace(/(<([^>]+)>)/ig," ");
}//end stripTag();

/**
 *  Function is used to get condition wise counting from collection
 *
 * @param req 		As Request Data
 * @param res 		As Response Data
 * @param options	As options
 * Sample Data : options = {
		collection:"product_accepted_requests",
		conditions : {
			all : {
				status:PRODUCT_ACCEPT,
				user_id:ObjectId("5b59d1f9d6b72b0d5c7d6fc1"),
			},
			accepted : {
				status:PRODUCT_ACCEPT,
				user_id:ObjectId("5b59d1f9d6b72b0d5c7d6fc1"),
			},
			rejected : {
				status:PRODUCT_REJECT,
				user_id:ObjectId("5b59d1f9d6b72b0d5c7d6fc1"),
			},
			pending : {
				status:PRODUCT_REQUEST_SENT,
				user_id:ObjectId("5b59d1f9d6b72b0d5c7d6fc1"),
			},
		}
	};
 *
 * @return object
 *
 **/
multipleCounts = (req, res, next, options)=>{
	return new Promise(resolve=>{
		let collectionName 	= (options["collection"]) ? options["collection"] : "";
		let conditions 		= (options["conditions"]) ? options["conditions"] : {};
		let countResponse 	= {};
		const collection	= db.collection(collectionName);
		const async			= require("async");

		async.forEachOf(conditions,(condition, keyName, asyncCallback)=>{
			getCount(req,res,{collection:collectionName,condition:condition}).then(count=>{
				countResponse[keyName] = count;
				asyncCallback();
			}).catch(next);
		},asyncErr=>{
			if(asyncErr) resolve({status:STATUS_ERRROR,message:countErr});
			resolve({status:STATUS_SUCCESS,count_result:countResponse});
		});
	});
}// end multipleCounts()

/**
 *  get count of records
 *
 * @param req 		As Request Data
 * @param res 		As Response Data
 * @param options	As options
 *
 * @return object
 */
getCount = (req, res, options)=>{
	return new Promise(resolve=>{
		let collectionName 	= (options["collection"]) ? options["collection"] : "";
		let condition 		= (options["condition"]) ? options["condition"] : {};
		const collection	= db.collection(collectionName);
		collection.countDocuments(condition,(countErr,count)=>{
			/** Send 0 if error */
			if(countErr) return resolve(0);

			resolve(count);
		});
	});
}//end getCount()


/**
 * Function to get current timestamp
 *
 * @param null
 *
 * @return timestamp
 */
currentTimeStamp = ()=>{
	return new Date().getTime();
};//end currentTimeStamp();

/**
 * Function to sort array according to order
 *
 * @param array as requested array
 * @param order as Order
 *
 * @return sorted Array
 */
sortArray = (array, order)=>{
	let newData = {};
	//loop through order to find a matching id
	order.forEach((value,key)=>{
		newData[value] = [];
		array.forEach((arrayValue,arrayKey)=>{
			if (arrayValue['_id'] === value){
				newData[value].push(arrayValue);
			}
		});
	});
	return newData;
}// end sortArray()

	/**
	 *  Function is genrate notification url
	 *
	 * @param req As request Data
	 *
	 * @return Json
	 */
	generateNotificationUrl = (req,res,options)=>{
		return new Promise(resolve=>{
			let notificationList = [];
			let notificationData = (options.result) ? options.result : [];
			if(!notificationData || notificationData.length < 1){
				return resolve({data : [],options:options});
			}

			notificationData.map((notification)=>{
				let type 		= (notification.notification_type) ? notification.notification_type : "";
				let extraParams = (notification.extra_parameters)  ? notification.extra_parameters  : "";

				switch(type) {
					case NOTIFICATION_USER_REGISTER:
						if(extraParams.user_id && extraParams.user_type){
							notification["url"] = WEBSITE_ADMIN_URL+"users/"+extraParams.user_type+"/view/"+extraParams.user_id;
						}else{
							notification["url"] = "javascript:void(0);";
						}
					break;
					default:
						notification["url"] = "javascript:void(0);";
				}
				notificationList.push(notification);
			});
			resolve({data : notificationList,options:options});
		});
	};//End generateNotificationUrl()

	/**
	 *  Function is used to export data in excel file
	 *
	 * @param value as a numeric value
	 *
	 * @return numeric value after convert format
	 */
	exportToExcel = (req,res,options)=>{

		let fileName = "Untitled";
		if(options.file_name){
			fileName = (options.file_name) ? options.file_name : "";
		}else if(options.file_prefix){
			fileName = options.file_prefix+"_"+newDate("",DATABASE_DATE_FORMAT);
		}

		const XLSX			= require("xlsx");
		let wb 				= XLSX.utils.book_new();
		let headingColumns 	= (options.heading_columns) ? options.heading_columns : [];
		let exportData 		= (options.export_data) ? options.export_data : [];
		let finalArray 	 	= [];
		finalArray.push(headingColumns);
		let ws = XLSX.utils.aoa_to_sheet(finalArray.concat(exportData));

		/** Add the worksheet to the workbook **/
		XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
		let wbbuf = XLSX.write(wb, {
			type: "base64",
		});

		let finalFileName	=	"attachment; filename="+fileName+".xlsx";
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		res.setHeader("Content-Disposition",finalFileName);
		res.end( new Buffer(wbbuf, "base64") );
	}// end exportToExcel()

	/**
	 *  Function to download file
	 *
	 * @param req 		As	Request Data
	 * @param res 		As	Response Data
	 * @param options	As 	Object Data
	 *
	 * @return object
	 */
	downloadFile = (req,res,options)=>{
		return new Promise(resolve=>{
			let source		=	(options && options.source)			?	options.source		:"";
			let destination	=	(options && options.destination)	?	options.destination	:"";

			if(source == ""){
				/** Send success response **/
				return resolve({status : STATUS_SUCCESS, file_name:""});
			}

			/** Download file **/
			const download	=	require('image-downloader')
			let data 	=	{
				url	:	source,
				dest: 	destination
			}
			download.image(data).then(({filename, image})=>{
				/** Send success response **/
				resolve({
					status 		: 	STATUS_SUCCESS,
					file_name	:	filename
				});
			}).catch(err=>{
				/** Send error response **/
				resolve({
					status 		: 	STATUS_ERROR,
					file_name	:	"",
					message		:	res.__("system.something_going_wrong_please_try_again")
				});
			});
		});
	}// end downloadFile()

	/**
	 * Function to get difference in two dates
	 *
	 * @param startDate AS start date
	 * @param endDate 	AS end date
	 *
	 * @return difference between two days in minutes
	 */
	getDifferenceBetweenTwoDatesInMinute = (startDate,endDate)=>{
			startDate 		= 	new Date(startDate);
			endDate 		=	new Date(endDate);
		let timeDiff 		= 	Math.abs(endDate.getTime() - startDate.getTime());
		let diffInMinute 	=	(timeDiff /MILLISECONDS_IN_A_SECOND)/SECONDS_IN_A_MINUTE;
		return diffInMinute;
	}//end getDifferenceBetweenTwoDatesInMinute();



	/**
	 *  Function to get cms page data
	 *
	 * @param pageSlug as cms page slug
	 *
	 * @return array
	 */
	getCmsPageData = (req, res, pageSlug) => {
		return new Promise(resolve => {
			if (!pageSlug || pageSlug == "") {
				let response = {
					status: STATUS_ERROR,
					message: res.__("admin.system.invalid_access")
				};
				return resolve(response);
			}
			else {
				try {
					/** Get details **/
					const cms = db.collection(TABLE_PAGES);
					cms.findOne({ slug: pageSlug }, {}, (err, pageData) => {
						if (err) {
							/** Send error response **/
							let response = {
								status: STATUS_ERROR,
								message: res.__("admin.system.invalid_access")
							};
							return resolve(response);
						} else {
							if (pageData) {

								
								
									let response = {
										status: STATUS_SUCCESS,
										result: (pageData) ? pageData : {}
									};
									resolve(response);
								
							} else {
								let response = {
									status: STATUS_ERROR,
									message: res.__("admin.system.invalid_access")
								};
								return resolve(response);
							}


						}
					});
				}
				catch (e) {
					/** Send error response **/
					let response = {
						status: STATUS_ERROR,
						message: res.__("admin.system.something_going_wrong_please_try_again")
					};
					resolve(response);
				}
			}
		});
	}


	/**
	 *  Function to get user detail
	 *
	 * @param req 				As Request Data
	 * @param res 				As Response Data
	 * @param productData		As requested Data
	 *
	 * @return string
	 */
	getUserDetail = (req, res, options) => {
		return new Promise(resolve => {
			let conditions	=	(options.conditions)	?	options.conditions	:{};
			var async = require('async');
			try {
				const users = db.collection(TABLE_USERS);
				async.waterfall([
					(callback) => {
						users.aggregate([
							{
								$match: conditions
							},
							{
								$project: {
									first_name: 1,
									last_name: 1,
									email: 1,
									full_name: 1,
									mobile_number: 1,
									gender: 1,
									profile_image: 1,
									slug: 1,
									current_role: 1,
									user_role_id: 1,
									pn_allowed:1,
									is_mobile_verified: 1,
									is_email_verified: 1,
									is_verified: 1,
									date_of_birth: 1,
									user_type: 1,
									
								}

							}
						]).toArray((err, userresponse) => {

							if (err) {
								/** Send error response **/
								let response = {
									status: STATUS_ERROR,
									result: {},
									message: res.__("admin.system.something_going_wrong_please_try_again")
								};
								resolve(response);
							} else {
								callback(null, userresponse[0], 'two');
							}
						});
					},
					
				], function (err, result) {

					let response = {
						status: STATUS_SUCCESS,
						//image_url: USERS_URL,
						result: (result) ? result : {},
						message: ''
					};
					return resolve(response);
					// result now equals 'done'
				});

			} catch (e) {
				console.log(e);
				/** Send error response **/
				let response = {
					status: STATUS_ERROR,
					result: {},
					message: res.__("admin.system.something_going_wrong_please_try_again")
				};
				resolve(response);
			}
		});
	}// end getUserDetail()


	/**
	* function for genrate Rendom Referral Code
	*
	* param slug
	* */
	genrateRendomReferralCode = (req, res, userOption) => {

		return new Promise(resolve => {
			let lenght = (userOption.lenght) ? userOption.lenght : '';
			try {
				var length = (lenght) ? (lenght) : (8);
				var string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; //to upper
				var numeric = '0123456789';
				//var punctuation = '!@#$%';
				var password = "";
				var character = "";
				var crunch = true;
				while (password.length < length) {
					entity1 = Math.ceil(string.length * Math.random() * Math.random());
					entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
					hold = string.charAt(entity1);
					hold = (password.length % 2 == 0) ? (hold.toUpperCase()) : (hold);
					character += hold;
					character += numeric.charAt(entity2);
					password = character;
				}
				password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');

				let response = {
					status: STATUS_SUCCESS,
					result: password.substr(0, length),
					message: ''
				};
				return resolve(response);
			} catch (e) {
				console.log(e);
				/** Send error response **/
				let response = {
					status: STATUS_ERROR,
					result: {},
					message: res.__("admin.system.something_going_wrong_please_try_again")
				};
				resolve(response);
			}
		});
	}// end genrateRendomReferralCode()



	/**
	 * String convert in array message in mobile API
	 * **/
	stringValidationFromMobile = (validationErrors,req)=>{
		let usedFields 		= [];
		let newValidations 	= [];
		if(Array.isArray(validationErrors)){
			validationErrors.map((item)=>{
				if(usedFields.indexOf(item.param) == -1){
					usedFields.push(item.param);
					newValidations.push(item);
				}
			});
			
			let newStringValidation = [];
			newValidations.map(records=>{
				newStringValidation.push(records.msg);
			});
			
			return newStringValidation.toString();
			
		}else{
			return false;
		}
	}//End stringValidationFromMobile();

	
	/**
	 *  Function to check Referral code is valid or not
	 *
	 * @param req,res,userOption
	 *
	 * @return user data
	 */

	getUserReferralCode = (req, res, userOption) => {
		return new Promise(resolve => {
			let referralCode	=	(userOption.referral_code) ? userOption.referral_code : "";
			
			if(referralCode == ""){
				let response = {
					status: STATUS_SUCCESS,
					result: "",
					message: ''
				};
				return resolve(response);
			}else{
				const users = db.collection(TABLE_USERS);
				users.findOne({
					referral_code : referralCode,
					is_mobile_verified : ACTIVE,
					is_email_verified : ACTIVE,
					active : ACTIVE,
					is_deleted : DEACTIVE,
				}, { projection: { _id: 1 } }, (err, result) => {
					if(err){
						let response = {
							status: STATUS_ERROR,
							result: "",
							message: res.__("admin.system.something_going_wrong_please_try_again")
						};
						resolve(response);
					}
					result = (result) ? result : {};
					if (Object.keys(result).length > 0) {
						let response = {
							status: STATUS_SUCCESS,
							result: result,
							message: ''
						};
						return resolve(response);
					}else{
						let response = {
							status: STATUS_ERROR,
							result: {},
							message: res.__("Invalid referral code")
						};
						resolve(response);
					}
				})
			}
		});
	} //end getUserReferralCode
	
	
	/**
	 *  Function to get user role modules
	 *
	 * @param req,res,modulesOptions
	 *
	 * @return user modules
	 */
	getUserRoleModules = (req, res, modulesOptions) => {
		return new Promise(resolve => {
			let userRoleId	=	(modulesOptions.user_role_id) ? modulesOptions.user_role_id : "";
			
			if(userRoleId == ""){
				let response = {
					status: STATUS_SUCCESS,
					result: "",
					message: ''
				};
				return resolve(response);
			}else{
				
				const admin_roles	= 	db.collection(TABLE_ADMIN_ROLE);
				
				admin_roles.findOne({
					_id : ObjectId(userRoleId)
				},{},(err,result)=>{
					
					let modules   = (result.assign_modules)	? result.assign_modules	: {};
					
					 let selectedModuleObjectIds = Object.keys(modules).map(records=>{
                        return (records) ? ObjectId(records) : "";
                    });
					
					const admin_modules = db.collection(TABLE_ADMIN_MODULES);
					admin_modules.aggregate([
						{$match:{ _id : {$in : selectedModuleObjectIds}}},
						{$lookup : {
							"from" 			: "admin_modules",
							"localField"	: "_id",
							"foreignField"	: "parent_id",
							"as" 			: "child_detail"
						}},
						{$project 	: {
							_id:1, group_path:1, parent_id:1,
							childs: {"$size" : ["$child_detail"]}
						}},
					]).toArray((err, result)=>{
						if(!err && result){
							resolve(result);
						}else{
							resolve([]);
						}
					});
					
					
				})
				
				
			}
		});
	} //end getUserRoleModules
	
	/**
	 *  Function to convert currency format
	 *
	 * @param amount as currency value
	 *
	 * @return amount after convert currency format
	 */
	currencyFormatOnDashboard = (amount) => {
		if (!amount || isNaN(amount)) {
			return amount;
		} else {
			
			amount = round(amount, ROUND_PRECISION);
			amount = amount.toString();
			var afterPoint = '';

			if (amount.indexOf('.') > 0) afterPoint = amount.substring(amount.indexOf('.'), amount.length);
			amount = Math.floor(amount);
			amount = amount.toString();
			var lastThree = amount.substring(amount.length - 3);
			var otherNumbers = amount.substring(0, amount.length - 3);
			if (otherNumbers != '') lastThree = ',' + lastThree;
			var finalAmount = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
			
			return  finalAmount;
		}
	}// end currencyFormat()
	
	/**
	 *  Function to convert currency format
	 *
	 * @param amount as currency value
	 *
	 * @return amount after convert currency format
	 */
	currencyFormat = (amount) => {
		//console.log("utils")
		if (!amount || isNaN(amount)) {
			return CURRENCY_SYMBOL+" "+amount;
		} else {
			
			amount = round(amount, ROUND_PRECISION);
			amount = amount.toString();
			var afterPoint = '';

			if (amount.indexOf('.') > 0) afterPoint = amount.substring(amount.indexOf('.'), amount.length);
			amount = Math.floor(amount);
			amount = amount.toString();
			var lastThree = amount.substring(amount.length - 3);
			var otherNumbers = amount.substring(0, amount.length - 3);
			if (otherNumbers != '') lastThree = ',' + lastThree;
			var finalAmount = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
			
			return  CURRENCY_SYMBOL+" "+finalAmount;
		}
	}// end currencyFormat()
	
	
	
	
	/**
	 * Function to upload excel file
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 * @param data		As file
	 * @param filePath	As Path of Destination Directory
	 * @param oldPath	As Old file name
	 * @param callback	As CallBack Function
	 *
	 * @return json
	 */
	uploadedExcelFile = function (req, res, file, filePath, oldPath, callback) {
		if (file == '') {
			callback(STATUS_SUCCESS, { fileName: oldPath });
		} else {
			var fileData = (file.name) ? file.name.split('.') : [];
			var uploadFileName = (file.name) ? file.name : '';
			var extension = (fileData) ? fileData.pop().toLowerCase() : '';
			if (ALLOWED_EXCEL_EXTENSIONS.indexOf(extension) == -1) {
				callback(STATUS_ERROR, ALLOWED_EXCEL_ERROR_MESSAGE);
			} else {
				var newFileName = Date.now() + '-' + this.changeFileName(uploadFileName);
				var uploadedFile = filePath + newFileName;
				/** move file to folder*/
				file.mv(uploadedFile, function (err) {
					if (err) {
						callback(STATUS_ERROR, res.__("admin.system.something_going_wrong_please_try_again"));
					} else {
						var response = { fileName: newFileName };
						callback(STATUS_SUCCESS, response);
					}
				});
			}
		}
	};//End uploadedExcelFile()
	
	
	/**
	 * Function to get user data by slug
	 *
	 * @param req		As	Request Data
	 * @param res		As 	Response Data
	 * @param options	As  object of data
	 *
	 * @return json
	 **/
	getUserDetailBySlug = (req,res,options) =>{
		return new Promise(resolve=>{
			let conditions	=	(options.conditions)	?	options.conditions	:{};
			let fields		=	(options.fields)		?	options.fields		:{};

		
			
			if(Object.keys(conditions).length === 0){
				/** Send error response **/
				return resolve({
					status	:	STATUS_ERROR,
					options	: 	options,
					message	: 	res.__("system.something_going_wrong_please_try_again")
				});
			}	

			/** Get user details **/
			const users	=	db.collection(TABLE_USERS);
			users.aggregate([
				{
					$match: conditions
				},
			
				{
					$project: {
						first_name: 1,
						last_name: 1,
						email: 1,
						full_name: 1,
						country_code_dial_code:1,
						mobile_number: 1,
						phone_country_code: 1,
						phone_number: 1,
						gender: 1,
						country_id:1,
						state_id:1,
						city_id:1,
						postal_code:1,
						profile_image: 1,
						banner_image:1,
						date_of_birth:1,
						slug: 1,
						user_role_id: 1,
						user_type:1,
						interested_category_id:1,
						profile_description : 1,
						pn_allowed:1,
						active:1,
						wallet_balance:1,
						is_mobile_verified:1,
						is_email_verified:1,
						is_admin_approved:1,
						is_profile_complete:1,
						age_type:1,
						age_type:1,
						user_address:1,
						bank_details:1,
						question_id:1,
						answer:1,
						password:1,
						referral_code:1,
						created:1,
						company_name:1,
						validate_string:1,
						login_validate_string:1,
						language:1,
						driving_experience:1,
						operational_city:1,
						is_online:1,
						is_on_ride:1,
						device_details : 1,
						on_off_status : 1,
						total_followers : 1,
						total_following : 1,
						total_post : 1,
					
					}
				
				}
			]).toArray((err, result) => {
				
				if(err){
					/** Send error response **/
					let response = {
						status	:	STATUS_ERROR,
						options	: 	options,
						message	: 	res.__("system.something_going_wrong_please_try_again")
					};
					return resolve(response);
				}
				if(!result){
					/** Send success response **/
					return resolve({
						status	:	STATUS_ERROR,
						result 	: 	false,
						options	: 	options,
					});
				}
				/** Send success response **/
				
				
				if(result){
					/** Send success response **/
					return resolve({
						status	:	STATUS_SUCCESS,
						result 	: 	result[0],
						options	: 	options,
					});
				}else{
					/** Send success response **/
					return resolve({
						status	:	STATUS_ERROR,
						result 	: 	false,
						options	: 	options,
					});
				}
			});
		});
	}// end getUserDetailBySlug()
	


/**
 *  Function to update wallet balance
 *
 * @param req 		As	Request Data
 * @param res 		As	Response Data
 * @param options	As 	Object Data
 *
 * @return object
 */
updateWalletBalance = (req,res,options)=>{
	return new Promise(resolve=>{
		
		let walletBalance		= 	(options && options.wallet_balance) 	? Number(options.wallet_balance)	: '';
		let reason				= 	(options && options.reason) 			? options.reason			: '';
		let userId				= 	(options && options.user_id)			? options.user_id			: '';
		let tranactionType		= 	(options && options.tranaction_type) 	? options.tranaction_type 	: '';
		let creditedBy			= 	(options && options.credited_by) 		? options.credited_by 	: '';
			
		/**Find user last wallet balance*/
		const users				= db.collection(TABLE_USERS);
		const walletTransaction	= db.collection(TABLE_WALLET_TRANSACTION);
		
		users.findOne({
			_id 		:	ObjectId(userId),
			is_deleted 	:	NOT_DELETED
		},{projection :{wallet_balance:1}},(userErr,userResult)=>{
			if(userResult && userResult!='' ){
				let lastWalletBalance	=	(userResult.wallet_balance)	?	Number(userResult.wallet_balance)	:	0;
				let totalAmount			=	Number(lastWalletBalance+walletBalance);
				let lessAmount			=	Number(lastWalletBalance-walletBalance);
				
				/**Condition for use to wallet credit amount*/
				if(tranactionType==CREDIT){
					/**update user wallet balance*/
					users.updateOne({
							_id			:	ObjectId(userId),	
						},{$set:{
							wallet_balance	:	Number(totalAmount),	
							reason			:	reason,
							modified		:	getUtcDate()
						}}
					);
					
					/**insert wallet tranaction balance*/
					walletTransaction.insertOne({
						amount			:	Number(walletBalance),
						reason			:	reason,	
						user_id			:	ObjectId(userId),	
						tranaction_type	:	tranactionType,	
						credited_by		: 	ObjectId(creditedBy),
						is_actice		: 	ACTIVE,
						is_deleted		: 	NOT_DELETED,
						created			:	getUtcDate(),
						modified		:	getUtcDate()
					});
					
					/** Send error response **/
					let response = { status:STATUS_SUCCESS,	message:res.__("admin.user.wallet_balance_updated_successfully")};
					return resolve(response);
				
				/**Condition for use to wallet debit amount*/	
				}else if(tranactionType==DEBIT){
					if(Number(lastWalletBalance<walletBalance)){
						/** Send error response **/
						let response = { status:STATUS_ERROR,	message:res.__("system.out_of_wallet_amount")};
						return resolve(response);
					}else{
						/**update user wallet balance*/
						users.updateOne({
								_id			:	ObjectId(userId),	
							},{$set:{
								wallet_balance	:	Number(lessAmount),	
								reason			:	reason,
								modified		:	getUtcDate()
							}}
						);
						
						/**insert wallet tranaction balance*/
						walletTransaction.insertOne({
							amount			:	Number(walletBalance),
							reason			:	reason,	
							user_id			:	ObjectId(userId),	
							tranaction_type	:	tranactionType,	
							credited_by		: 	ObjectId(creditedBy),
							is_actice		: 	ACTIVE,
							is_deleted		: 	NOT_DELETED,
							created			:	getUtcDate(),
							modified		:	getUtcDate()
						});
						
						/** Send error response **/
						let response = { status:STATUS_SUCCESS,	message:res.__("admin.user.wallet_balance_updated_successfully")};
						return resolve(response);
					}
				}else{
					/** Send error response **/
					let response = { status:STATUS_ERROR,	message:res.__("system.something_going_wrong_please_try_again")};
					return resolve(response);
				}
			}else{
				/** Send error response **/
				let response = { status:STATUS_ERROR,	message:res.__("system.something_going_wrong_please_try_again")};
				return resolve(response);
			}
		});
	});
}// end updateWalletBalance()




/**
 *  Function to get wallet balance
 *
 * @param req 		As	Request Data
 * @param res 		As	Response Data
 * @param options	As 	Object Data
 *
 * @return object
 */
getWalletBalance = (req,res,options)=>{
	return new Promise(resolve=>{
		let userId				= 	(options && options.user_id)			? options.user_id			: '';
			
			
		/**Find user last wallet balance*/
		const users				= db.collection(TABLE_USERS);
		
		users.aggregate([
		{ $match: {
			_id 		:	ObjectId(userId),
			is_deleted 	:	NOT_DELETED
		}},
		
		{ $lookup: {
			from: TABLE_WALLET_TRANSACTION,
			let: { userId: "$_id" },
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ["$user_id", "$$userId"] },
							]
						},
					}
				},
				{ $project: { "_id": 1, "amount": 1,"reason":1,"tranaction_type":1,"credited_by":1,"created":1,} }
			],
			as: "wallet_tranaction"
		}},
		{ $project: {
			//~ email: 1,
			//~ full_name: 1,
			//~ mobile_number: 1,
			//~ slug: 1,
			wallet_balance		: 	{ $cond: { if: "$wallet_balance", then: "$wallet_balance", else: 0 } },
			wallet_tranaction	:1,
		}},
		]).toArray((err, result) => {
			if(result.length>0){
				let response = { status:STATUS_SUCCESS,	result:result[0]};
				return resolve(response);
			}else{
				let response = { status:STATUS_ERROR,	result:[]};
				return resolve(response);
			}
		});
	});
}// end getWalletBalance()

	/**
	 *  Function to get ride detail
	 *
	 * @param req 			As Request Data
	 * @param res 			As Response Data
	 * @param jwtOption		As requested Data
	 *
	 * @return json
	 */
	 
	getRideDetail = (req, res, rideOption) => {
		return new Promise(resolve => {
			let userId		=	(rideOption.user_id) ? rideOption.user_id : "";
			let rideId		=	(rideOption.ride_id) ? rideOption.ride_id : "";
			let userType	=	(rideOption.user_type) ? rideOption.user_type : "";
			const trips		=	db.collection(TABLE_TRIPS);
			
			let matchConditions = {
				_id : ObjectId(rideId),
			}
			trips.aggregate([
				{
					$match : matchConditions
				},
				{
					$lookup: {
						from: TABLE_USERS,
						let: { userId: "$user_id" },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $eq: ["$_id", "$$userId"] },
										]
									},
								}
							},
							{ $project: { "_id": 1, "full_name": 1,"mobile_number":1} }
						],
						as: "user_details"
					}
				},
				{
					$project: {
						pickup_latitude : 1,
						pickup_longitude : 1,
						destination_latitude : 1,
						destination_longitude : 1,
						pickup_location_name : 1,
						destination_location_name : 1,
						total_amount : 1,
						paid_amount : 1,
						discount_amount : 1,
						distance_in_km : 1,
						duration_in_minutes : 1,
						ride_status : 1,
						payment_type : 1,
						booking_number : 1,
						user_id : 1,
						ride_status_logs : 1,
						rider_name: { $arrayElemAt: ["$user_details.full_name", 0] },
						rider_mobile_no: { $arrayElemAt: ["$user_details.mobile_number", 0] },

					}
				
				}
			]).toArray((err,rideDetail)=>{
				if (err) {
					/** Send error response **/
					let response = {
						status: STATUS_ERROR,
						result: {},
						message: res.__("system.something_going_wrong_please_try_again")
					};
					return resolve(response);
				}else{
					
					/** Send success response **/
					let response = {
						status: STATUS_SUCCESS,
						result: (rideDetail) ? rideDetail[0] : {},
						message: 'Ride Detail'
					};
					return resolve(response);
				}
				
				
			});
			
		});
	}
	
	
	/**
	 *  Function to jwt authentication (middleware)
	 *
	 * @param req 			As Request Data
	 * @param res 			As Response Data
	 * @param jwtOption		As requested Data
	 *
	 * @return json
	 */
	JWTAuthentication = (req, res, jwtOption) => {
		return new Promise(resolve => {
			let token		= (jwtOption && jwtOption.token)		? jwtOption.token : '';
			let secretKey	= (jwtOption && jwtOption.secretKey)	? jwtOption.secretKey : '';
			let slug		= (jwtOption && jwtOption.slug)	? jwtOption.slug : '';
			
			if(slug != "")
			{
				/** Send success response **/
				let response = {
					status: STATUS_SUCCESS,
					result: {},
					message: 'slug not required'
				};
				return resolve(response);
				try {
					const jwt = require('jsonwebtoken');
					if (token) {
						
						token=decryptJwtToken(token);
						
						/** verifies secret and checks exp **/
						jwt.verify(token, secretKey, function (err, decoded) {
							if (err) {
								/** Send error response **/
								let response = {
									status: STATUS_ERROR,
									result: {},
									message: res.__("admin.system.invalid_signature")
								};
								return resolve(response);
							} else {
								
								/** Send success response **/
								let response = {
									status: STATUS_SUCCESS,
									result: decoded,
									message: 'hello'
								};
								return resolve(response);
							}
						});
					} else {
						/** Send error response **/
						let response = {
							status: STATUS_ERROR,
							result: {},
							message: res.__("admin.system.something_going_wrong_please_try_again")
						};
						resolve(response);
					}

				} catch (e) {

					/** Send error response **/
					let response = {
						status: STATUS_ERROR,
						result: {},
						message: res.__("admin.system.something_going_wrong_please_try_again")
					};
					resolve(response);
				}
			}else{
				/** Send success response **/
				let response = {
					status: STATUS_SUCCESS,
					result: {},
					message: 'slug not required'
				};
				return resolve(response);
			}
		});
	}// end JWTAuthentication()
	
	/**
 *This function is used to string to encrypt crypto convert
 */
encryptJwtToken = (encryptData)=>{
	let mykeyEncrypt = crypto.createCipher('aes-128-cbc', JWT_ENCRYPT_DECRYPT_API_KEY);
	let myStrEncrypt = mykeyEncrypt.update(encryptData, 'utf8', 'hex')
	return myStrEncrypt += mykeyEncrypt.final('hex');
}

/** 
 *This function is used to encrypt to string convert
 */
decryptJwtToken = (decryptData)=>{
	let myKeyDecrypt = crypto.createDecipher('aes-128-cbc', JWT_ENCRYPT_DECRYPT_API_KEY);
	let myStrDecrypt = myKeyDecrypt.update(decryptData, 'hex', 'utf8')
	return myStrDecrypt += myKeyDecrypt.final('utf8');
}

/**
 * Function to generate Jwt token
 */
jwtTokenGenerate = (req, res, jwtUser) => {
	return new Promise(resolve => {
		const token			= jwt.sign(jwtUser, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.tokenLife });
		const refreshToken 	= jwt.sign(jwtUser, JWT_CONFIG.refreshTokenSecret, { expiresIn: JWT_CONFIG.refreshTokenLife });
		return resolve({
			token			: encryptJwtToken(token),
			refresh_token	: encryptJwtToken(refreshToken),
			token_life		: JWT_CONFIG.tokenLife,
		});
	});
}


/**
 * Function for push notification
 *
 * @param userId	As user id
 * @param body		As Body Of Push notification
 *
 * @return null
 */
PushNotificationCommonFunction = (req, res, userId, body) => {

	var pnType = (body.type) ? body.type : "";
	var pnData = (body.data) ? body.data : {};
	
	/** Get user details for pn **/
	var users = db.collection(TABLE_USERS);
	var pnlog = db.collection(TABLE_PN_LOGS);
	users.find(
		{
			_id			: ObjectId(userId),
			active 				:	ACTIVE,
			is_admin_approved	:	ACTIVE,
			is_email_verified	:	ACTIVE,
			is_mobile_verified	:	ACTIVE,
			is_deleted			:	NOT_DELETED,
		},
		{
			device_type: 1,
			device_token: 1,
			device_id: 1,
		}
	).toArray(function (err, result) {

		var deviceType = (result && result[0] && result[0].device_type) ? result[0].device_type : "";
		var deviceToken = (result && result[0] && result[0].device_token) ? result[0].device_token : "";
		var deviceId = (result && result[0] && result[0].device_id) ? result[0].device_id : "";

		var pnTitle = body.pn_title;
		var pnBody = body.pn_body;
		

		// if (deviceType == "Android" || deviceType == "android") {

			
			var FCM = require('fcm-push');
			var serverKey = WEBSITE_PN_ANDROID_SERVER_KEY;
			var fcm = new FCM(serverKey);
			var message = {
				to: deviceToken,
				data: {
					title: pnTitle,
					body: pnBody,					
				}
			};


			fcm.send(message, function (err, response) {
				//use to save pn logs
				if (response) {
					pnlog.insert(
						{
							"user_id": ObjectId(userId),
							"pn_title": pnTitle,
							"pn_body": pnBody,
							'deviceType': 'android',
							"success": ACTIVE,
							"pn_response": response,
							"created": new Date(),
						});
				} else if (err) {
					pnlog.insert(
						{
							"user_id": ObjectId(userId),
							"pn_title": pnTitle,
							"pn_body": pnBody,
							'deviceType': 'android',
							"success": 0,
							"pn_response": err,
							"created": new Date(),
						});
				}
				//use to save pn logs
			});
		// }
	});
};//End PushNotificationCommonFunction()



/**
 * Function to get date in any format with utc format
 *
 * @param date 		as	Date object
 * @param format 	as 	Date format
 *
 *
 *
 * @return date string
 */
getTimeAgo = (dateString) => {
	var rightNow = new Date();
	var then = new Date(dateString);
	
	var diff = rightNow - then;

	var second = 1000,
		minute = second * 60,
		hour = minute * 60,
		day = hour * 24,
		week = day * 7;

	if (isNaN(diff) || diff < 0) {
		return ""; // return blank string if unknown
	}

	if (diff < second * 2) {
		// within 2 seconds
		return "right now";
	}

	if (diff < minute) {
		return Math.floor(diff / second) + " seconds ago";
	}

	if (diff < minute * 2) {
		return "1 minute ago";
	}

	if (diff < hour) {
		return Math.floor(diff / minute) + " minutes ago";
	}

	if (diff < hour * 2) {
		return "1 hour ago";
	}

	if (diff < day) { return Math.floor(diff / hour) + " hours ago"; } if (diff > day && diff < day * 2) {
		return "yesterday";
	}

	if (diff < day * 365) {
		return Math.floor(diff / day) + " days ago";
	}

	else {
		return "over a year ago";
	}
}

	/**
	 *  Function to generate a booking Number
	 *
	 * @param req 	As Request Data
	 * @param res 	As Response Data
	 *
	 * @return string
	 */
	generateBookingNumber = (req, res) => {
		return new Promise(resolve => {
			let collection	=	db.collection(TABLE_INCREMENTALS);
			collection.updateOne({slug : 'booking_number'},{'$inc':{number:1 }},(err,result)=>{
				collection.findOne({slug : 'booking_number'},{number:1, prefix:1},(error,response)=>{
					let number	=	(response && response.number)	?	response.number	:'';
					let prefix	=	(response && response.prefix)	?	response.prefix	:'';
					return resolve(prefix+number);
				});
			});
		});
	}// end generateOrderNumber()

/**
 * Function Replace end of HTML text with a few dots
 *
 * @param str AS String
 *
 * @return string
 */
replaceStringFewStar = (stringData,lengthData)=>{
	 return (stringData.length>lengthData)	?	(stringData.substring(0, lengthData) + '...') : stringData;
}//end replaceStringFewStar();


/**
Function for use to calculate age of year	
**/
calculateAge = (dateofbirth)=>{
	
	var array = new Array();
	//split string and store it into array
	array = dateofbirth.split('-');
	
	let birth_month	=	array[1];
	let birth_day	=	array[0];
	let birth_year	=	array[2];
					
					
	today_date = new Date();
	today_year = today_date.getFullYear();
	today_month = today_date.getMonth();
	today_day = today_date.getDate();
	age = today_year - birth_year;

	if (today_month < (birth_month - 1))
	{
		age--;
	}
	if (((birth_month - 1) == today_month) && (today_day < birth_day))
	{
		age--;
	}
	return age;
}

consoleLog = (valueconsole) => {
	console.log(util.inspect(valueconsole, false, null, true /* enable colors */))
}

/**
 * Function to upload image  work
 *
 * @param options	As data in Object
 *
 * @return json
 */
uploadFileCheck = (req,res,options)=>{
	return new Promise(resolve=>{
		
		let image 				=	(options && options.image)				?	options.image				:"";
		let filePath 			=	(options && options.filePath)			?	options.filePath			:"";
		let oldPath 			=	(options && options.oldPath)			?	options.oldPath				:"";
		let allowedExtensions 	=	(options && options.allowedExtensions)	?	options.allowedExtensions	:"";//ALLOWED_IMAGE_EXTENSIONS;
		let allowedImageError 	=	(options && options.allowedImageError)	?	options.allowedImageError	:"";//ALLOWED_IMAGE_ERROR_MESSAGE;
		let allowedMimeTypes 	=	(options && options.allowedMimeTypes)	?	options.allowedMimeTypes	:"";//ALLOWED_IMAGE_MIME_EXTENSIONS;
		let allowedMimeError 	=	(options && options.allowedMimeError)	?	options.allowedMimeError	:"";//ALLOWED_IMAGE_MIME_ERROR_MESSAGE;
		let allowedHeight 		=	(options && options.height)	?	Number(options.height)	:490;
		let allowedWidth 		=	(options && options.width)	?	Number(options.width)	:1920;
		
		if(image == ''){
			
			/** Send success response **/
			let response = {
				status	: 	STATUS_SUCCESS,
				fileName:	oldPath,
				options	:	options
			};
			resolve(response);
		}else{
			
			let fileData	= (image.name)	? image.name.split('.') : [];
			let imageName	= (image.name)	? image.name : '';
			let extension	= (fileData)	? fileData.pop().toLowerCase() : '';
			
			if (allowedExtensions.indexOf(extension) == -1){
				consoleLog("Direct extension check.");
				/** Send error response **/
				let response = {
					status	: 	STATUS_ERROR,
					message	:	allowedImageError,
					options	:	options
				};
				resolve(response);
			}
			
		consoleLog("extension is Good NOW MIME TYPE CHECK");
		
		let newFolder		= 	(newDate("","mmm")+ newDate("","yyyy")).toUpperCase()+'/';
		createFolder(filePath+newFolder);
		let newFileName 	= 	newFolder + Date.now()+ '-' +changeFileName(imageName);
		let uploadedFile	= 	filePath+newFileName;
		consoleLog(uploadedFile);
		image.mv(uploadedFile,(err)=>{
		/** check mime type*/
		const child_process = require('child_process');
		child_process.exec('file --mime-type -b '+uploadedFile,(err, out, code)=>{
			consoleLog("out value is ")
			consoleLog(out)
		fs.unlink(uploadedFile,(err)=>{	
			if (allowedMimeTypes.indexOf(out.trim()) == -1){
				consoleLog("extension is Good BUT MIME TYPE ERROR found");
				/** Send error response **/
				let response = {
					status	: 	STATUS_ERROR,
					message	:	allowedMimeError,
					options	:	options
				};
				resolve(response);
					
				
			}else{
				
				/** Send success response **/
				let response = {
					status	: 	STATUS_SUCCESS,
					fileName:	newFileName,
					options	:	options
				};
				resolve(response);
			}	
		});
		});
		});
		}
	});
}


/**
 * Function used to generate bcrypt password. 
 *
 * @param options	As data in Object
 *
 * @return json
 */
bcryptPasswordGenerate = (passwordString)=>{
	return new Promise(resolve=>{
		const saltRounds = 10;
		if(passwordString != ""){
			bcrypt.hash(passwordString, saltRounds).then(function(bcryptPassword) {
				return resolve(bcryptPassword);
			});
		}else{
			return resolve('');
		}
	});
}

/**
 * Function used to compare bcrypt password. 
 *
 * @param options	As data in Object
 *
 * @return json
 */
bcryptCheckPasswordCompare = (userEnterPassword, DbPassword)=>{
	return new Promise(resolve=>{
		if(userEnterPassword != "" && DbPassword != ""){
			bcrypt.compare(userEnterPassword,DbPassword).then(function(passwordMatched) {
				if(!passwordMatched){
					return resolve(false);
				}else{
					return resolve(true);
				}
			});
		}else{
			return resolve(false);
		}
	});
}

/**
 * Function used to convert 
 *
 * @param options	As data in Object
 *
 * @return json
 */
convertMultipartReqBody = function(req, res, next) {
	convertMultipartFormData(req,res).then(()=>{
			consoleLog("convertReqBody")
			//consoleLog(req.body);
			return next();
			//return req;
	})
}

/**
 *This function is used to string to encrypt crypto convert
 */
encryptCrypto = (textString)=>{
	try {
		const cipher = crypto.createCipheriv("aes-256-ctr", CRYPTO_ENCRYPT_DECRYPT_API_KEY, CRYPTO_ENCRYPT_DECRYPT_API_IV);
		let crypted = cipher.update(textString,'utf8','hex');
		crypted += cipher.final('hex');
		return crypted;
	} catch (error) {
		console.error("encryptUsingNodeCrypto: An error occurred: ", error);
		throw error;
	}
}

/**
 *This function is used to encrypt to string convert
 */
decryptCrypto = (textString)=>{
	try {
		const decipher = crypto.createDecipheriv("aes-256-ctr", CRYPTO_ENCRYPT_DECRYPT_API_KEY, CRYPTO_ENCRYPT_DECRYPT_API_IV);
		let deciphed = decipher.update(textString,'hex','utf8');
		deciphed += decipher.final('utf8');
		return deciphed;
	} catch (error) {
		console.error("decryptUsingNodeCrypto: An error occurred: ", error);
		throw error;
	}
}



/**
 *This function is used to string to encrypt crypto convert
 */
encryptCryptoMobile = (textString)=>{
	try {
		const cipher = crypto.createCipheriv("aes-256-cbc", CRYPTO_ENCRYPT_DECRYPT_API_KEY, CRYPTO_ENCRYPT_DECRYPT_API_IV);
		let crypted = cipher.update(textString,'utf8','hex');
		crypted += cipher.final('hex');
		return crypted;
	} catch (error) {
		console.error("encryptUsingNodeCrypto: An error occurred: ", error);
		throw error;
	}
}

/**
 *This function is used to encrypt to string convert
 */
decryptCryptoMobile = (textString)=>{
	try {
		const decipher = crypto.createDecipheriv("aes-256-cbc", CRYPTO_ENCRYPT_DECRYPT_API_KEY, CRYPTO_ENCRYPT_DECRYPT_API_IV);
		let deciphed = decipher.update(textString,'hex','utf8');
		deciphed += decipher.final('utf8');
		return deciphed;
	} catch (error) {
		console.error("decryptUsingNodeCrypto: An error occurred: ", error);
		throw error;
	}
}



/**
 * Function used to return api result 
 *
 * @param response	As data in Object
 *
 * @return json
 */
returnApiResult = (req,res,response)=>{
	var result = JSON.stringify(response.data);
	
	var utf8 = require('utf8');
	var myJSON = utf8.encode(result);				
	let debugJsonView = (req.body.debugJsonView) 	? req.body.debugJsonView : DEACTIVE;
	let apiType = (req.body.api_type) 	? req.body.api_type : "mobile";
	let isCrypto = (req.body.is_crypto) 	? req.body.is_crypto : ACTIVE;

	
	if (debugJsonView == 0) {
		if(apiType == MOBILE_API_TYPE){
			//console.log("apiType "+apiType);
			let convertBtoA		=	btoa(myJSON);
			let convertEncrypt	=	encryptCryptoMobile(convertBtoA);
			
			return res.send(
				
				(isCrypto==ACTIVE) ? convertEncrypt : convertBtoA
			);
			
		}else{
			return res.send(
				btoa(myJSON)
			);
		}
	} else {
	
		return res.send({
			response : JSON.parse(myJSON)
		});
		
	}
}





/**
 *  Function to get post data by slug
 *
 * @param postslug as cms page slug
 *
 * @return array
 */
	getPostDataBySlug = (req, res, postSlug) => {
	return new Promise(resolve => {
		let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
        let loginUserId			=	(loginUserData._id)		?	loginUserData._id		:	"";		

		
		
		if (!postSlug || postSlug == "") {
			let response = {
				status: STATUS_ERROR,
				message: res.__("admin.system.invalid_access")
			};
			return resolve(response);
		}
		else {
			try {
				/** Get details **/
				const postCollection = db.collection(TABLE_POSTS);
				let condition = {
					slug: postSlug,
					is_deleted: DEACTIVE
				};
				console.log(condition);
				
				postCollection.aggregate([
					{
						$match : {
							slug: postSlug,
							is_deleted: DEACTIVE
						}
					},
					{
						$lookup:{
							from: TABLE_USERS,
							let: { userId: "$user_id" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$_id", "$$userId"] },
												{ $eq: ["$active", ACTIVE] },
											]
										},
									}
								},
								//{ $project: { "_id": 1, "full_name": 1,"profile_image":1} }
								
							],
							as: "user_details"
						}
					},
					{
						$lookup: {	/** Get user like post or not   **/
							from: TABLE_USER_LIKE_POSTS,
							let: { postId: "$_id" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$post_id", "$$postId"] },
												{ $eq: ['$post_liked_by', ObjectId(loginUserId)] },
											]
										},
									}
								},
							],
							as: 'user_post_like'
						}
					},
					{
						$lookup: {	/** Get user save post or not   **/
							from: TABLE_USER_SAVED_POSTS,
							let: { postId: "$_id" },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $eq: ["$post_id", "$$postId"] },
												{ $eq: ['$post_saved_by', ObjectId(loginUserId)] },
											]
										},
									}
								},
							],
							as: 'user_post_save'
						}
					},
					{$project : {
						title : 1,
						description : 1,
						post_tags : 1,
						post_hashtags : 1,
						post_type : 1,
						privacy : 1,
						age_type : 1,
						interest_ids : 1,
						post_media : 1,
						thumbnail_image : 1,
						user_id : 1,
						post_view_count : 1,
						post_comment_count : 1,
						post_likes_count : 1,
						last_hour_views : 1,
						is_deleted : 1,
						duration : 1,
						status : 1,
						created : 1,
						slug : 1,
						user_name	:	{$arrayElemAt : ["$user_details.full_name",0]},
						user_profile_image	:	{$arrayElemAt : ["$user_details.profile_image",0]},
						user_slug	:	{$arrayElemAt : ["$user_details.slug",0]},
						
						
						user_total_followers	:	{ $cond: { if: { $gte: [{ "$arrayElemAt": ["$user_details.total_followers", 0] }, 0] }, then: { "$arrayElemAt": ["$user_details.total_followers", 0] }, else: 0 } },
						user_total_following	:	{ $cond: { if: { $gte: [{ "$arrayElemAt": ["$user_details.total_following", 0] }, 0] }, then: { "$arrayElemAt": ["$user_details.total_following", 0] }, else: 0 } },
						
						is_liked	:	{ $cond: { if: { $gte: [{ "$arrayElemAt": ["$user_post_like.status", 0] }, 0] }, then: { "$arrayElemAt": ["$user_post_like.status", 0] }, else: 0 } },
						is_saved	:	{ $cond: { if: { $gte: [{ "$arrayElemAt": ["$user_post_save.status", 0] }, 0] }, then: { "$arrayElemAt": ["$user_post_save.status", 0] }, else: 0 } },
					}}
				]).toArray((postErr,postResult)=>{
					
					if(postResult && postResult.length > 0)
					{
						let response = {
							status: STATUS_SUCCESS,
							result: (postResult) ? postResult[0] : {}
						};
						resolve(response);
						
					}else{
						let response = {
							status: STATUS_ERROR,
							message: res.__("admin.system.invalid_access")
						};
						return resolve(response);
					}
				});
				return false;
				
				/*postCollection.findOne({ slug: postSlug }, {}, (err, postData) => {
					if (err) {
						/** Send error response **
						let response = {
							status: STATUS_ERROR,
							message: res.__("admin.system.invalid_access")
						};
						return resolve(response);
					} else {
						if (postData) {

								let response = {
									status: STATUS_SUCCESS,
									result: (postData) ? postData : {}
								};
								resolve(response);
							
						} else {
							let response = {
								status: STATUS_ERROR,
								message: res.__("admin.system.invalid_access")
							};
							return resolve(response);
						}


					}
				});*/
			}
			catch (e) {
				/** Send error response **/
				let response = {
					status: STATUS_ERROR,
					message: res.__("admin.system.something_going_wrong_please_try_again")
				};
				resolve(response);
			}
		}
	});
}


/**
 * Function to update Like Counter in post collection
 * @param postid		As Post Id
 * @param likeUnlike   increase/decrease like  counter
 * @return array
 */
 updateLikeCounter = (req,res,options)=>{
  const postsCollection       = db.collection(TABLE_POSTS);

	try{
		let postId				=	(options && options.post_id)		?	options.post_id			:"";
		let counterStat			=	(options && options.counter_stat)	?	options.counter_stat	:"";
		let incStat				= 	(counterStat == ACTIVE) ? {"post_likes_count":1} : {"post_likes_count":-1} ;

		postsCollection.updateOne({
			_id: ObjectId(postId)
		},{ $inc: incStat },(err, result)=>{

		});
	}catch(e){
		console.log("Error in updating like counter of post")
		console.log(e)
	}
}//end updateLikeCounter();



/**
 * Function to update post comment Like Counter in post comment collection
 * @param postid		As Post Id
 * @param likeUnlike   increase/decrease like  counter
 * @return array
 */
 updatePostCommentLikeCounter = (req,res,options)=>{
  const postsCommentCollection       = db.collection(TABLE_POST_COMMENT);

	try{
		let postId				=	(options && options.post_id)		?	options.post_id			:"";
		let commentId			=	(options && options.comment_id)		?	options.comment_id			:"";
		let counterStat			=	(options && options.counter_stat)	?	options.counter_stat	:"";
		let incStat				= 	(counterStat == ACTIVE) ? {"likes_count":1} : {"likes_count":-1} ;

		postsCommentCollection.updateOne({
			_id: ObjectId(commentId),
			post_id: ObjectId(postId),
		},{ $inc: incStat },(err, result)=>{

		//	consoleLog("You are inside callbnack final");
		//	consoleLog(err);
		//		consoleLog(result);

		});
	}catch(e){
		console.log("Error in updating like counter of post")
		console.log(e)
	}
}//end updateLikeCounter();



/**
 * Function to update Like Counter in post collection
 * @param userid		As User Id
 * @return array
 */
 updateUserProfileViewCounter = (req,res,options)=>{
	const usersCollection       = db.collection(TABLE_USERS);
  
	  try{
		  let userId				=	(options && options.user_id)		?	options.user_id			:"";
		  let incStat				= 	(options && options.profile_view_count)		?	{"profile_view_count":1} 		:"";
  
		  usersCollection.updateOne({
			  _id: ObjectId(userId)
		  },{ $inc: incStat },(err, result)=>{
  
			  consoleLog("You are inside callbnack final");
			  consoleLog(err);
				  consoleLog(result);
  
		  });
	  }catch(e){
		  console.log("Error in updating like counter of post")
		  console.log(e)
	  }
  }//end updateViewCounter();





/**
 * Function to update Like Counter in post collection
 * @param postid		As Post Id
 * @param likeUnlike   increase/decrease like  counter
 * @return array
 */
 updateViewCounter = (req,res,options)=>{
	const postsCollection       = db.collection(TABLE_POSTS);
  
	  try{
		  let postId				=	(options && options.post_id)		?	options.post_id			:"";
		  let counterStat			=	(options && options.counter_stat)	?	options.counter_stat	:"";
		  let incStat				= 	(counterStat == ACTIVE) ? {"post_view_count":1} : {"post_view_count":-1} ;
  
		  postsCollection.updateOne({
			  _id: ObjectId(postId)
		  },{ $inc: incStat },(err, result)=>{
  
			  consoleLog("You are inside callbnack final");
			  consoleLog(err);
				  consoleLog(result);
  
		  });
	  }catch(e){
		  console.log("Error in updating like counter of post")
		  console.log(e)
	  }
  }//end updateViewCounter();



  /**
 * Function to update Like Counter in post collection
 * @param postid		As Post Id
 * @param likeUnlike   increase/decrease like  counter
 * @return array
 */
 updateCommentCounter = (req,res,options)=>{
	const postsCollection       = db.collection(TABLE_POSTS);
  
	  try{
		  let postId				=	(options && options.post_id)		?	options.post_id			:"";
		  let counterStat			=	(options && options.counter_stat)	?	options.counter_stat	:"";
		  let incStat				= 	(counterStat == ACTIVE) ? {"post_comment_count":1} : {"post_comment_count":-1} ;
  
		  postsCollection.updateOne({
			  _id: ObjectId(postId)
		  },{ $inc: incStat },(err, result)=>{
  
			  consoleLog("You are inside callbnack final");
			  consoleLog(err);
				  consoleLog(result);
  
		  });
	  }catch(e){
		  console.log("Error in updating like counter of post")
		  console.log(e)
	  }
  }//end updateCommentCounter();




  /**
 * Function to update post view log
 * @param slug		As user slug
 * @return array
 */
 updatePostViewlog = (req,res,options)=>{
	const postsViewCollection       = db.collection(TABLE_POST_VIEW_LOG);
  
	  try{
		  let postId				=	(options && options.post_id)		?	options.post_id			:"";
		  let userId				=	(options && options.user_id)	?	options.user_id	:"";
		  let counterStat			=	(options && options.counter_stat)	?	options.counter_stat	:"";
		  let incStat				= 	(counterStat == ACTIVE) ? {"post_vew_counter":1} : {"post_vew_counter":-1} ;
  
		  postsViewCollection.updateOne({
			post_id: ObjectId(postId),user_id:ObjectId(userId)
		  },{ $inc: incStat,$set:{ modified 	: 	getUtcDate()} },(err, result)=>{
  
			  consoleLog("You are inside callbnack final");
			  consoleLog(err);
				  consoleLog(result);
  
		  });

	  }catch(e){
		  console.log("Error in updating like counter of post")
		  console.log(e)
	  }
  }//end updatePostViewlog();


/**
 * Function to add post view log
 * @param slug		As user slug
 * @return array
 */
 addPostViewlog = (req,res,options)=>{
	const postsViewCollection       = db.collection(TABLE_POST_VIEW_LOG);
  
	  try{
		  let postId				=	(options && options.post_id)		?	options.post_id			:"";
		  let userId				=	(options && options.user_id)	?	options.user_id	:"";

		  let insertData = {
			  post_id				: 	ObjectId(postId),
			  user_id				: 	ObjectId(userId),
			  post_vew_counter		: 	ACTIVE,
			  status				:	 ACTIVE,
			  created 				: 	getUtcDate(),
			  
		  };

		  postsViewCollection.insertOne(insertData,
			(err, result) => {

				consoleLog("You are inside callbnack final");
				consoleLog(err);
					consoleLog(result);

			});
	  }catch(e){
		  console.log("Error in updating like counter of post")
		  console.log(e)
	  }
  }//end addPostViewlog();



 /**
 * Function to user view log
 * @param slug		As user slug
 * @return array
 */
  addUserViewlog = (req,res,options)=>{
	const userViewLog  = db.collection(TABLE_USER_VIEW_LOG); 

  
	  try{
		 
		  let userId				=	(options && options.user_id)	?	options.user_id	:"";
		 let other_user_id				=	(options && options.other_user_id)		?	options.other_user_id			:"";
		  let insertData = {
			  
			  user_id				: 	ObjectId(userId),
			  other_user_id				: 	ObjectId(other_user_id),
			  profile_view_counter	: 	ACTIVE,
			  status				:	 ACTIVE,
			  created 				: 	getUtcDate(),
		  };

		  userViewLog.insertOne(insertData,
			(err, result) => {

				consoleLog("You are inside callbnack final");
				consoleLog(err);
			//		consoleLog(result);

			});
	  }catch(e){
		  console.log("Error in updating like counter of post")
		  console.log(e)
	  }
  }//end addUserViewlog(); 


/**
 * Function to update user view log
 * @param slug		As user slug
 * @return array
 */
 updateUserViewlog = (req,res,options)=>{
	const userViewLog  = db.collection(TABLE_USER_VIEW_LOG); 
	
  
	  try{
			let viewerId			=	(options && options.viewer_id)		?	options.viewer_id			:"";
			let userId				=	(options && options.user_id)	?	options.user_id	:"";
		  	let counterStat			=	(options && options.counter_stat)	?	options.counter_stat	:"";
		 	let incStat				= 	(counterStat == ACTIVE) ? {"profile_view_counter":1} : {"profile_view_counter":-1} ;
  
		  userViewLog.updateOne({
			viewer_id: ObjectId(viewerId),user_id:ObjectId(userId)
		  },{ $inc: incStat },(err, result)=>{
  
			  consoleLog("You are inside callbnack final");
			  consoleLog(err);
			//	  consoleLog(result);
  
		  });

	  }catch(e){
		  console.log("Error in updating like counter of post")
		  console.log(e)
	  }
  }//end updateUserViewlog();


  /**
 * Function to update user profile view counter in user collection
 * @param userid		As user Id
 * @param likeUnlike   increase/decrease like  counter
 * @return array
 */
 updateUserViewCounter = (req,res,options)=>{
	const usersCollection       = db.collection(TABLE_USERS);	return new Promise(resolve => {
		if (!postSlug || postSlug == "") {
			let response = {
				status: STATUS_ERROR,
				message: res.__("admin.system.invalid_access")
			};
			return resolve(response);
		}
		else {
			try {
				/** Get details **/
				const postCollection = db.collection(TABLE_POSTS);
				postCollection.findOne({ slug: postSlug }, {}, (err, postData) => {
					if (err) {
						/** Send error response **/
						let response = {
							status: STATUS_ERROR,
							message: res.__("admin.system.invalid_access")
						};
						return resolve(response);
					} else {
						if (postData) {

								let response = {
									status: STATUS_SUCCESS,
									result: (postData) ? postData : {}
								};
								resolve(response);
							
						} else {
							let response = {
								status: STATUS_ERROR,
								message: res.__("admin.system.invalid_access")
							};
							return resolve(response);
						}


					}
				});
			}
			catch (e) {
				/** Send error response **/
				let response = {
					status: STATUS_ERROR,
					message: res.__("admin.system.something_going_wrong_please_try_again")
				};
				resolve(response);
			}
		}
	});
			//	  consoleLog(result);
  
	
  }//end updateUserViewCounter();




/**
 * Function to get post list according to the cionditions passed
 * @return array
 */
	getPostsList = (req,res,options)=>{

				
		const asyncParallel			= require('async/parallel');
		const postsCollection       = db.collection(TABLE_POSTS);
	  
		return new Promise (resolve => {
			let loginUserData 			=	(req.user_data) 		?	req.user_data 			:	"";
			let userRoleType			=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";
			let userId					=	(options && options.user_id)	?	options.user_id	:"";
			let loginUserId					=	(options && options.user_id)	?	options.user_id	:"";

			let	page 					= (req.body.page)		? parseInt(req.body.page)	: 1;
			let limit					= API_DEFAULT_LIMIT;
		
			let skip					=	(limit * page) - limit;
			limit						=	limit;

			let postCondition			=	(options && options.condition)	?	options.condition	:"";
			let searchData				=	(options && options.searchData)	?	options.searchData	:"";
			let post_type				=	(options && options.post_type)	?	options.post_type	:"";
			
			let userInterestedCategoryId =  (options.categoryIds) ? options.categoryIds : [];
			
			if (!userId || userId == "") {
				let response = {
					status: STATUS_ERROR,
					message: res.__("admin.system.invalid_access")
				};
				return resolve(response);
			}
			
			else {
				
				try {

			asyncParallel({
			
				post_list : (callback)=>{
					
					postsCollection.aggregate([
						{
							$match : postCondition
						},
						{
							$lookup:{
								from: TABLE_USERS,
								let: { userId: "$user_id" },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [
													{ $eq: ["$_id", "$$userId"] },
													{ $eq: ["$active", ACTIVE] },
												]
											},
										}
									},
									{ $project: { "_id": 1, "full_name": 1,"profile_image":1,"slug":1} }
									
								],
								as: "user_details"
							}
						},
						
						
						{
							$project : {
								
								title 				:	1,
								description 		: 	1,
								post_type			:	1,
								privacy 			:	1,
								post_view_count 	:	1,
								post_comment_count	:	1,
								post_likes_count	:	1,
								post_media			:	1,
								thumbnail_image		:	1,
								slug				:	1,			
								created				:	1,
								post_hashtags		:	1,
								post_tags		:	1,
								interest_ids		:	1,
								duration			:	1,
								age_type			:	1,
								created_date: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
								user_full_name: { $arrayElemAt: ["$user_details.full_name", 0] },
								user_profile_image: { $arrayElemAt: ["$user_details.profile_image", 0] },
								user_slug: { $arrayElemAt: ["$user_details.slug", 0] },
								
							
							}
							
						},
						{
							$match: {
								user_full_name: { $exists: true }
							}
						}
						
					]).sort({created:SORT_DESC}).skip(skip).limit(limit).toArray((err, result)=>{
						
						callback(null, result);
					})
					
				},
				post_count : (callback)=>{
					/** Get total number of records  in post collection base on this Condition **/
					postsCollection.countDocuments(postCondition,(err,countResult)=>{
						callback(err, countResult);
					});
				},
				user_like_post_id : (callback)=>{
					/** Get post id there are like by this user **/
					const postsLikeCollection       = db.collection(TABLE_USER_LIKE_POSTS);
					postsLikeCollection.distinct('post_id',{"post_liked_by":ObjectId(loginUserId)},(err,result)=>{
						callback(err, result);
					})

				},
				user_save_post_id : (callback)=>{
					/** Get post id there are save by this user **/
					const postsSaveCollection       = db.collection(TABLE_USER_SAVED_POSTS);
					postsSaveCollection.distinct('post_id',{"post_saved_by":ObjectId(loginUserId)},(err,result)=>{
						callback(err, result);
					})

				},
				user_interested_category : (callback)=>{
					/** Get post id there are save by this user **/
					const categories       = db.collection(TABLE_CATEGORIES);
					const adminRoles       = db.collection(TABLE_ADMIN_ROLE);
					let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
					let interestedCategoryId = (loginUserData.interested_category_id) ? loginUserData.interested_category_id : [];
					let userRoleId = (loginUserData.user_role_id) ? loginUserData.user_role_id : [];
					var categoryListArr = [];
					
					if(interestedCategoryId.length > 0){
						
						categories.find({
							_id : { $in: interestedCategoryId }
						},{}).toArray((err,result)=>{
							
							if(result.length > 0){
								result.map(record => {
									categoryListArr.push({ "id": record._id, "name": record.name });
								})
							}
							
							callback(err, categoryListArr);
						})
					}else{
						adminRoles.findOne({
							_id : ObjectId(userRoleId)
						},{},(err,result)=>{
							
							let category_ids = (result.category_ids) ? result.category_ids : [];
							
							categories.find({
								_id : { $in: category_ids }
							},{}).toArray((err,result)=>{
								
								if(result.length > 0){
									result.map(record => {
										categoryListArr.push({ "id": record._id, "name": record.name });
									})
								}
								
								callback(err, categoryListArr);
							})
							
						});
						
						
					}
					
				},

			},async(err, response)=>{
				
				let finalResult = [];
				var totalRecord	= (response['post_count']) ? response['post_count'] : 0;
				var userLikePostId	= (response['user_like_post_id']) ? response['user_like_post_id'] : {};
				var userSavePostId	= (response['user_save_post_id']) ? response['user_save_post_id'] : {};
				var user_interested_category	= (response['user_interested_category']) ? response['user_interested_category'] : {};
				
				if(totalRecord > 0)
				{	let postList		= (response['post_list']) ? response['post_list'] : [];
					finalResult = postList.map(records => {
						
						records['day_ago'] = getTimeAgo(records.created);
						
						
						return records;
					});
					
				}
				let sendPostlenght =  (finalResult.length) ? finalResult.length : "";
				let campaignLen = sendPostlenght / CAMPAIGN_SHOW_AFTER_POST;
				console.log("sendPostlenght "+sendPostlenght)
				console.log("campaignLen "+campaignLen)
				let optionObj = {
					post_type : post_type,
					campaign_limit : campaignLen,
					user_interested_category_id : userInterestedCategoryId,
					user_role_type : userRoleType
				}
				let campaignData = await getCampaignList(req,res,optionObj);
				
				var campaigns_list	= (campaignData) ? campaignData : {};
				finalResponse = {
					'data': {
						status			: STATUS_SUCCESS,
						post_list		: finalResult,//(response['post_list']) ? response['post_list'] : [],
						recordsTotal	: (response['post_count']) ? response['post_count'] : 0,
						liked_post_id	: userLikePostId,
						save_post_id	: userSavePostId,
						campaigns_list	: campaigns_list,
						user_interested_category	: user_interested_category,
						limit			: limit,
						page			: page,
						image_url		: POSTS_URL,
						user_image_url	: USERS_URL,
						campaign_url	: CAMPAIGN_URL,
						message		 	: "",
						android_app_link : (res.locals.settings["Site.android_app_link"]) ? res.locals.settings["Site.android_app_link"] : "",
						apple_app_store : (res.locals.settings["Site.apple_app_store"]) ? res.locals.settings["Site.apple_app_store"] : "",
						total_page		: Math.ceil(totalRecord/limit),
						//final_length   : finalResult.lenght(), 
					}
				};

				return resolve(finalResponse);
				
				
				
			})

				}
				catch (e) {
					/** Send error response **/
					let response = {
						status: STATUS_ERROR,
						message: res.__("admin.system.something_going_wrong_please_try_again")
					};
					return resolve(response);
				}
			}
		});

	  }//end updateUserViewCounter(); 

/*
Function for get user all liked post id
*/	  
userLikedPostId = (req,res,options)=>{
	return new Promise(resolve => {
		let loginUserId = (options.login_user_id) ? options.login_user_id : "";
		const postsLikeCollection       = db.collection(TABLE_USER_LIKE_POSTS);
		postsLikeCollection.distinct('post_id',{"post_liked_by":ObjectId(loginUserId)},(err,result)=>{
			/** Send success response **/
			let response = {
				status: STATUS_SUCCESS,
				result: result,
				message: ''
			};
			return resolve(response);
		})
	})	  
}

/*
Function for get user all saved post id
*/	  
userSavedPostId = (req,res,options)=>{
	return new Promise(resolve => {
		let loginUserId = (options.login_user_id) ? options.login_user_id : "";
		const postsSaveCollection       = db.collection(TABLE_USER_SAVED_POSTS);
		postsSaveCollection.distinct('post_id',{"post_saved_by":ObjectId(loginUserId)},(err,result)=>{
			/** Send success response **/
			let response = {
				status: STATUS_SUCCESS,
				result: result,
				message: ''
			};
			return resolve(response);
		})
	})	  
}

/*
Function for update user post count ni post table
*/	
updateUserPostCount = (req,res,options)=>{
	return new Promise(resolve => {
		const usersCollection = db.collection(TABLE_USERS);
		let userId				=	(options && options.user_id)	?	options.user_id	:"";
		let counterVal			=	(options && options.counter_val)	?	options.counter_val	:"";
		let incStat				= 	(counterVal == ACTIVE) ? {"total_post":1} : {"total_post":-1} ;
		usersCollection.updateOne({
			_id: ObjectId(userId)
		},{ $inc: incStat },(err, result)=>{

		  let response = {
			  status: STATUS_SUCCESS,
		  }
			return resolve(response);
		});
		
	})
}

/*
Function for get pending follow request
*/	
getLoginUserFollowRequestPending = (req,res,options)=>{
	return new Promise(resolve => {
		let userId	=	(options.user_id) ? options.user_id : "";
		const usersFollower            = db.collection(TABLE_USERS_FOLLOWER_LIST);
		let followRequestPendingCondition = {
			followed_by : ObjectId(userId),
			is_approved : DEACTIVE,
			action_type : FOLLOW_ACTION_TYPE,
		}
		usersFollower.distinct('user_id',followRequestPendingCondition,(err,result)=>{
			let response = {
			  status: STATUS_SUCCESS,
			 result	: result 
			}
			return resolve(response);
		});
		
	})
	
}
	
/*
Function for update follow notification status
*/	
updateNotificationRequestStatus = (req,res,options)=>{
	return new Promise(resolve => {
		let user_id	=	(options.user_id) ? options.user_id : MONGO_ID;
		let followed_by_user_id	=	(options.followed_by_user_id) ? options.followed_by_user_id : MONGO_ID;
		const notifications = db.collection(TABLE_NOTIFICATIONS);
		notifications.updateOne({
			user_id : ObjectId(user_id),
			created_by : ObjectId(followed_by_user_id),
			notification_action : PN_TYPE_CONFIG.follow_request,
		},{
			$set : {
				
				request_status : ACTIVE,
			}
		},(err,result)=>{
			let response = {
			  status: STATUS_SUCCESS,
			
			}
			return resolve(response);
		})
	})
}

/*
Function for get open tok session id
*/		
getOpenTokSessionID = (req,res,optionObj)=>{
	
	return new Promise(resolve=>{
		
		let fromUserId	=	(optionObj.from_user_id) ? optionObj.from_user_id : MONGO_ID;
		let toUserId	=	(optionObj.to_user_id) ? optionObj.to_user_id : MONGO_ID;
		let opentokApiKey			= 	"47188134";//(res.locals.settings['Site.opentok_api_key'])			? 	res.locals.settings['Site.opentok_api_key']			:DEACTIVE;
		const messageToken		= 	db.collection(TABLE_MESSAGE_TOKEN);
		
		let matchCondition = {
			
			$and:[
                {$or:[
                     {"from_user_id" :ObjectId(fromUserId)}, 
                     {"to_user_id" : ObjectId(fromUserId)}
                ]},
               {$or:[
                    {"from_user_id" :ObjectId(toUserId)}, 
                     {"to_user_id" : ObjectId(toUserId)}
                ]},
			]
		};
		
		//let andCon = [];
		//andCon.push({from_user_id:ObjectId(fromUserId)},{to_user_id : ObjectId(toUserId)})
		//matchCondition['$or']= [{ from_user_id: ObjectId(toUserId) }, { to_user_id : ObjectId(fromUserId) },{"$and":andCon}];
		
		
		
		messageToken.findOne(matchCondition,{},(err,messageTokenData)=>{
			
			messageTokenData = messageTokenData ? messageTokenData : {};
			if(Object.keys(messageTokenData).length == 0){
				
				createOpenTokSessionID(req,res).then(messageTokenRes =>{
					let openTokData = (messageTokenRes.result) ? messageTokenRes.result : {};
					messageToken.insertOne({
						from_user_id : ObjectId(fromUserId),
						to_user_id : ObjectId(toUserId),
						open_tok_sesson_id : (openTokData.session_id) ? openTokData.session_id : "",
						open_tok_token : (openTokData.token_id) ? openTokData.token_id : "",
						created : getUtcDate(),
						modified : getUtcDate(),
					},(err,result)=>{
						var lastInsertId	=	(result.insertedId) ? result.insertedId : "";
						return resolve({
							status			:	STATUS_SUCCESS,
							result			:	{
								open_tok_sesson_id 	: (openTokData.session_id) ? openTokData.session_id : "",
								open_tok_token 	: (openTokData.token_id) ? openTokData.token_id :"",
								open_tok_api_key 	: (openTokData.open_tok_api_key) ? openTokData.open_tok_api_key :"",
								message_token_id : lastInsertId,
							},
						});	
						
						
					})
				})
				
				
			}else{
				return resolve({
					status			:	STATUS_SUCCESS,
					result			:	{
						open_tok_sesson_id 	: (messageTokenData.open_tok_sesson_id) ? messageTokenData.open_tok_sesson_id : "",
						open_tok_token 	: (messageTokenData.open_tok_token) ? messageTokenData.open_tok_token :"",
						open_tok_api_key 	: opentokApiKey,
						message_token_id : (messageTokenData._id) ? messageTokenData._id : "",
					},
				});	
				
			}
		})
		
	});
	
}

createOpenTokSessionID = (req,res)=>{
	return new Promise(resolve=>{
	const OpenTok 	= require("opentok");
	let opentokApiKey			= 	"47188134";//(res.locals.settings['Site.opentok_api_key'])			? 	res.locals.settings['Site.opentok_api_key']			:DEACTIVE;
	let opentokApiSecretKey		= 	"53e35f4c1e2520f1d96ece3a8daf0c1662b178c4";//(res.locals.settings['Site.opentok_api_secret_key'])			? 	res.locals.settings['Site.opentok_api_secret_key']			:DEACTIVE;
	var opentok = new OpenTok(opentokApiKey, opentokApiSecretKey);
	let sessionId = "";
	opentok.createSession({mediaMode:"routed"}, function(error, session) {
		if (error) {
			return resolve({
				status			:	STATUS_SUCCESS,
				result			:	{
					session_id 	: "",
					token_id 	: "",
					open_tok_api_key : opentokApiKey ,
					check : "not" 
				},
			});	
			 
		}else{
			sessionId = session.sessionId;
			let  tokenId = opentok.generateToken(sessionId);
		
			return resolve({
				status			:	STATUS_SUCCESS,
				result			:	{
					session_id 	: sessionId,
					token_id 	: tokenId,
					open_tok_api_key : opentokApiKey 
				},
			});	
			
		}
		
		
	})
	});
}
	

/**
 *  This function use to savem payment response
 *
 * @param req 		As Request Data
 * @param res 		As Response Data
 * @param options	As options
 *
 * @return object
 */
savePaymentResponse = (req,res,paymentOption)=>{
	return new Promise(resolve=>{
		const paymentTransactions = db.collection(TABLE_PAYMENT_TRANSACTIONS);
		let  transactionId	=	(paymentOption.transaction_id) ? paymentOption.transaction_id : "";
		let  currency		=	(paymentOption.currency) ? paymentOption.currency : "";
		let  user_id		=	(paymentOption.user_id) ? paymentOption.user_id : "";
		let  amount			=	(paymentOption.amount) ? paymentOption.amount : "";
		let  status			=	(paymentOption.status) ? paymentOption.status : "";
		let  payment_type	=	(paymentOption.payment_type) ? paymentOption.payment_type : "";
		let  payment_for	=	(paymentOption.payment_for) ? paymentOption.payment_for : "";
		
		let updateToData = {
			transaction_id 	: transactionId,
			currency 		: currency,
			user_id 		: ObjectId(user_id),
			amount 			: Number(amount),
			status 			: status,
			payment_type 	: payment_type,
			payment_for 	: payment_for,
			created 		: getUtcDate(),	
			modified 		: getUtcDate()	
		}
		paymentTransactions.insertOne(updateToData,(insertErr,insertResult)=>{
			
			return resolve({
				status			:	STATUS_SUCCESS,
				result	:	{},
			});	
			
		})
		
	})
}

/*
Function for update user followers count ni user table
*/	
updateUserFollowersCount = (req,res,options)=>{
	return new Promise(resolve => {
		const usersCollection = db.collection(TABLE_USERS);
		let userId				=	(options && options.user_id)	?	options.user_id	:"";
		let counterVal			=	(options && options.counter_val)	?	options.counter_val	:"";
		let incStat				= 	(counterVal == ACTIVE) ? {"total_followers":1} : {"total_followers":-1} ;
		usersCollection.updateOne({
			_id: ObjectId(userId)
		},{ $inc: incStat },(err, result)=>{

		  let response = {
			  status: STATUS_SUCCESS,
		  }
			return resolve(response);
		});
		
	})
}
	 

/*
Function for update user following count ni user table
*/	
updateUserFollowingCount = (req,res,options)=>{
	return new Promise(resolve => {
		const usersCollection = db.collection(TABLE_USERS);
		let userId				=	(options && options.user_id)	?	options.user_id	:"";
		let counterVal			=	(options && options.counter_val)	?	options.counter_val	:"";
		let incStat				= 	(counterVal == ACTIVE) ? {"total_following":1} : {"total_following":-1} ;
		usersCollection.updateOne({
			_id: ObjectId(userId)
		},{ $inc: incStat },(err, result)=>{

		  let response = {
			  status: STATUS_SUCCESS,
		  }
			return resolve(response);
		});
		
	})
}

/*
Function for get campaign list
*/
getCampaignList = (req,res,optionObj)=>{
	return new Promise(resolve => {
		const campaigns      			= db.collection(TABLE_CAMPAIGN);
		let post_type 					= (optionObj.post_type) ? optionObj.post_type : "";
		let campaign_limit 				= (optionObj.campaign_limit) ? optionObj.campaign_limit : "";
		let userInterestedCategoryId 	= (optionObj.user_interested_category_id) ? optionObj.user_interested_category_id : "";
		let user_role_type 				= (optionObj.user_role_type) ? optionObj.user_role_type : "";
		
		
		let matchCondition = {
			post_media_type : post_type,
			status : ACTIVE,
			remaining_budget : {$gt : DEACTIVE},
			duration_start_date : { $lte : getUtcDate()},
			duration_end_date  : { $gte : getUtcDate()},
		}
		matchCondition[user_role_type] = {$in :userInterestedCategoryId }
		
		//console.log("campaign matchCondition");
		//console.log(matchCondition);
		
		if(user_role_type == KIDS_USER_TYPE){
			
		}else if(user_role_type == TEENS_USER_TYPE){
			
		}else if(user_role_type == ADULTS_USER_TYPE){
			
		}
		
		campaigns.aggregate([
			{
				$match: {
					
				}
			},
			{ $sample: { size: campaign_limit } },
			  {$lookup : {
				from 			: TABLE_USERS,
				localField 		: "created_by",
				foreignField 	: "_id",
				as 				: "user_details",
			}},
			
			{
				$project : {
					
					name 				:	1,
					description 		: 	1,
					budget				:	1,
					website_url 		:	1,
					post_media		 	:	1,
					thumbnail_image		:	1,
					duration_start_date	:	1,
					duration_end_date	:	1,
					post_media_type		:	1,
					campaign_type		:	1,
					cost_per_view		:	1,
					slug				:	1,			
					post_slug			:	1,			
					created				:	1,
					view_count			:	1,
					allow_edit			:	1,
					remaining_budget	:	1,
					total_expense		:	1,
					interest_ids		:	1,
					duration			:	1,
					age_type			:	1,
					total_views			:	1,
					created_date		: { $dateToString: { format: API_LOOKUP_DATE_FORMAT, date: "$created" } },
					user_name			: { $arrayElemAt: ["$user_details.full_name", 0] },
					user_profile_image	: { $arrayElemAt: ["$user_details.profile_image", 0] },
					user_slug			: { $arrayElemAt: ["$user_details.slug", 0] },
					
				
				}
				
			},
		
		]).sort({created:SORT_DESC}).toArray((err,result)=>{
			
			updateCampaignViewData(req,res,result).then(viewResponse =>{
				
				let response = {
				  status: STATUS_SUCCESS,
				  result : result
				}
				return resolve(response);
				
			})

		});
	});
}

/**
 *  Function to get data for import sheet
 *
 * @param req 				As Request Data
 * @param res 				As Response Data
 * @param userData		As requested Data
 *
 * @return string
 */
getIdByName = (req, res, data) => {
return new Promise(resolve=>{
		let collection 			= (data && data.collection) ? data.collection : '';
		let valueName 			= (data && data.name) ? data.name : '';
		let fieldName 			= (data && data.column_name) ? data.column_name : '';
		
		valueName = valueName.replace(/\(/g,"\\(").replace(/\)/g,"\\)");
						
		valueName = valueName.replace('\\','');
		valueName = valueName.replace('\\','');
		
		var valueRegex = new RegExp(["^", valueName, "$"].join(""), "i");
		
		
		if (!collection) {
			/** Send error response **/
			let response = {
				status: STATUS_ERROR,
				result: {},
				message: res.__("admin.system.something_going_wrong_please_try_again")
			};
			return resolve(response);
		}
		try {
			const collectionName = db.collection(collection);
			let findObj = {};
			findObj[fieldName] =  valueRegex ;
			consoleLog(findObj);
			collectionName.findOne(
						findObj,
					(err, result) => {
						
						/** Send error response **/
						let response = {
							status: STATUS_SUCCESS,
							result: result,
							message: ''
						};
						return resolve(response);
					

				}
			);
		} catch (e) {
			/** Send error response **/
			let response = {
				status: STATUS_ERROR,
				result: {},
				message: res.__("admin.system.something_going_wrong_please_try_again")
			};
			 resolve(response);
		}
	});
}// end getIdByName()


	/**
	 * Function to get user data
	 *
	 * @param req		As	Request Data
	 * @param res		As 	Response Data
	 * @param options	As  object of data
	 *
	 * @return json
	 **/
 getMasterData = (req,res,next,options) =>{
		return new Promise(resolve=>{
			let conditions	= (options.conditions)	? options.conditions	:{};
			let fields		= (options.fields)		? options.fields		:{};
			
			var name 		=  (conditions.name)	? conditions.name	: "" ;
			
			name 			= name.replace(/\(/g,"\\(").replace(/\)/g,"\\)");
						
			name 			= name.replace('\\','');
			name 			= name.replace('\\','');
			
			conditions.name 			= new RegExp(["^", name, "$"].join(""), "i");
						

			if(!conditions){
				/** Send error response **/
				return resolve({
					status	: STATUS_ERROR,
					message	: res.__("system.something_going_wrong_please_try_again")
				});
			}

			/** Get user details **/
			const masters	= db.collection("masters");
		
			masters.findOne(conditions,{projection: fields},(err,result)=>{
			
				if(err){
					/** Send error response **/
					let response = {
						status	: STATUS_ERROR,
						message	: res.__("system.something_going_wrong_please_try_again")
					};
					return resolve(response);
				}
				/** Send success response **/
				if(!result) return resolve({status : STATUS_SUCCESS,result : false});
				/** Send success response **/
				resolve({
					status	: STATUS_SUCCESS,
					result 	: result	
				});
			});
		}).catch(next);
	};// end getMasterData()
	
	
	


/*
Function is use to update campaign view data
*/
updateCampaignViewData = (req,res,result)=>{
	return new Promise(resolve => {
		const campaignViewLogs            = db.collection(TABLE_CAMPAIGN_VIEW_LOGS);
		const campaign            = db.collection(TABLE_CAMPAIGN);
		const async	 	= require('async');
		const asyncParallel =	require('async/parallel');
		async.eachSeries(result, function iteratee(record, callback) {
			let campaignId = (record._id) ? record._id : "";
			console.log("campaignId")
			console.log(campaignId)
			let cost_per_view 		= (record.cost_per_view) ? record.cost_per_view : "";
			let loginUserData 	=	(req.user_data) 		?	req.user_data 			:	"";
			let userId			=	(loginUserData._id)		?	loginUserData._id		:	"";		
			let userType		=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";		
			asyncParallel({	
				insert_view_logs : (callback)=>{
					campaignViewLogs.insertOne({
						user_id : ObjectId(userId),
						campaign_id : ObjectId(campaignId),
						user_type 	:	userType,
						cost_per_view 	:	Number(cost_per_view),
						created 	:	getUtcDate(),
						modified 	:	getUtcDate(),
					},(err,result)=>{
						callback(null, result);
					})
				},
				update_view_count : (callback)=>{
					let incStat				= {"total_views":1};
					
					let incUserType = {};
					if(userType == KIDS_USER_TYPE){
						incUserType = {"total_kids_view":1};
					}else if(userType == TEENS_USER_TYPE){
						incUserType = {"total_teen_view":1};
					}else if(userType == ADULTS_USER_TYPE){
						incUserType = {"total_adult_view":1};
					}
					campaign.updateOne({
						_id: ObjectId(campaignId)
					},{ $inc: incStat },(err, result)=>{
						
						campaign.updateOne({
							_id: ObjectId(campaignId)
						},{ $inc: incUserType },(err, newresult)=>{
							
							callback(null, newresult);
						})
						
						
					})
					
				},
				update_budget : (callback)=>{
					
					let budget 	= (record.budget) ? record.budget : "";
					let remaining_budget 	= (record.remaining_budget) ? record.remaining_budget : "";
					let total_expense 		= (record.total_expense) ? record.total_expense : "";
					
					let incStat				= {"total_expense":cost_per_view};
					if(remaining_budget < cost_per_view)
					{
						let finalAmount = remaining_budget;
						remaining_budget =  DEACTIVE;
						incStat				= {"total_expense":finalAmount};
					}else{
						remaining_budget =  (remaining_budget - cost_per_view)
					}
					let updateData = {
						remaining_budget : remaining_budget
					}
					campaign.updateOne({
						_id: ObjectId(campaignId)
					},{ $inc: incStat,$set:updateData },(err, result)=>{
						
						callback(null, result);
					})
				}
			},(asyncErr,asyncResponse)=>{
				callback(null);
			})	
			
		}, function done() {
			let response = {
			  status: STATUS_SUCCESS,
			}
			return resolve(response);
		});
	});
}

getUserCategoryBaseOnRole = (req,res,loginUserData)=>{
	return new Promise(resolve => {
		var adminRoles = db.collection(TABLE_ADMIN_ROLE);
		let userRoleType 			= (loginUserData.user_type)		?	loginUserData.user_type		:	"";	
		let userRoleId 				= (loginUserData.user_role_id)		?	loginUserData.user_role_id		:	"";	;
	console.log("userRoleId "+userRoleId);
		adminRoles.findOne({
			_id 			: ObjectId(userRoleId)
		},{},(err,result)=>{
			result = result ? result : {};
			let category_ids = [];
			if(Object.keys(result).length > 0){
				category_ids = (result.category_ids) ? result.category_ids : "";
			}
			return resolve(category_ids);
			
		})
			
		
	});
}



getLoginUserCategoryId = async(req,res,loginUserData)=>{
	return new Promise (resolve => {
		
		let userId					=	(loginUserData._id)		?	loginUserData._id		:	"";
		let userRoleType			=	(loginUserData.user_type)		?	loginUserData.user_type		:	"";
		
		
		let userInterestedCategoryId	=	(loginUserData.interested_category_id)		?	loginUserData.interested_category_id		:	[];
		
		// categoryIds base on user role
		//let roleCategotyId  = await getUserCategoryBaseOnRole(res,res,loginUserData);
		getUserCategoryBaseOnRole(req,res,loginUserData).then(roleCategotyId=>{
			
			
			// if login user Interested Category id is blank then user role assign category id will push in this variable
			if(userInterestedCategoryId.length == 0)
			{
				userInterestedCategoryId = roleCategotyId;
			}
			
			//make interest category id as objectid
			let categoryIds         = [];
			if(userInterestedCategoryId.length > 0)
			{
				userInterestedCategoryId.map((records)=>{
					categoryIds.push(ObjectId(records));
				})
			}
			return resolve(categoryIds);
		
			
		})
		
		
		
	})
	
}

getRoleWiseInterest 	=  (req,res,ageTypeOptions)=>{

	return new Promise(resolve => {

		var adminRoles 				= 	db.collection(TABLE_ADMIN_ROLE);
		let userRoleId 				= 	(ageTypeOptions.age_type)					?	ageTypeOptions.age_type		:	"";	;

		let conditions = {
			user_type 			: { $in: [userRoleId] }
		}

		adminRoles.aggregate([
			{$match :conditions},
					
			{
				$lookup:{

					
						from: TABLE_CATEGORIES,
						localField: "category_ids",
						foreignField: "_id",
						as :"categoryDetail"
				}
			},
			
		
			{$project:
				{
					_id:0,
					categoryDetail: {
						_id: 1,
						name: 1,
					}
			}}	
		]).toArray((err,result)=>{


				let cateDetails = result;
	
				if (cateDetails.length > 0) {
	
					let categoryList = [];
				//	categoryList.push({"id":"","name":"Select Category*"});
					cateDetails.map((record)=>{  
	
					
						let catValues= record.categoryDetail;
	
						catValues.map((catRecords)=>{  
							
						categoryList.push(catRecords);
						
					})
						
					})
	
				var filteredArr=	 categoryList.filter(function (a) {
						return !this[a._id] && (this[a._id] = true);
					}, Object.create(null));
					 
					
					return resolve(filteredArr);
				
				} 




		});	
		
	});
}


/**
 *  Function to update wallet balance
 *
 * @param req 		As	Request Data
 * @param res 		As	Response Data
 * @param options	As 	Object Data
 *
 * @return object
 */
insertTags = (req,res,next,options)=>{
	return new Promise(resolve=>{
		
		const tagsCollection 	= 	 db.collection(TABLE_TAGS);
		const users				= db.collection(TABLE_USERS);
		const walletTransaction	= db.collection(TABLE_WALLET_TRANSACTION);
		let scrapperTags		= 	(options && options.tags_data) 	?   options.tags_data	: [];
		let tagsArray			=	[];
		var tagsId				=	[];
		consoleLog("Insert Tags function called ");
		//consoleLog(scrapperTags);
	
			
			let conditions				=	{};
			var tagName = scrapperTags.urlName.replace(/\-/g," ");
			var tagSlug = scrapperTags.urlName;
			conditions.tag_slug 			= new RegExp(["^", tagSlug, "$"].join(""), "i");
			var insertOnSet = {
				tag_name			:	toTitleCase(tagName),
				tag_slug			:	scrapperTags.urlName.toLowerCase(),
				tag_type			:	scrapperTags.type,
				is_url_active		:	ACTIVE,
				error_msg			:	'',	
				status				: 	ACTIVE,
				is_deleted			: 	NOT_DELETED		
				
			};
			tagsCollection.findOneAndUpdate(
								conditions, 
								{$set:insertOnSet,
								$inc:{product_count:1}},
								{ upsert : true,new: true},(err,result)=>{
									
						if(err){
									/** Send error response **/
									let response = {
										status	: STATUS_ERROR,
										message	: res.__("system.something_going_wrong_please_try_again")
									};
									return resolve(response);
								}
						if(result.value != null )
						{
							 tagsId = (result.value._id) ? (result.value._id) : "";
						}else{
							 tagsId = (result.lastErrorObject.upserted) ? (result.lastErrorObject.upserted) : "";
						}	
						tagsArray.push(tagsId);
						//consoleLog("tagsArray 2112131313131");
					//	consoleLog(tagsId);		

							/** Send error response **/
							let response = {
								status	: STATUS_SUCCESS,
								result	: tagsId,
							//	message	: res.__("system.something_going_wrong_please_try_again")
							};
							return resolve(response);
					})	
		
		
		
	}).catch(next);
}// end updateWalletBalance()


/**
 *  Function to update wallet balance
 *
 * @param req 		As	Request Data
 * @param res 		As	Response Data
 * @param options	As 	Object Data
 *
 * @return object
 */
insertFeatures = (req,res,next,options)=>{
	return new Promise(resolve=>{
		
		const featuresCollection 		= 	 db.collection(TABLE_FEATURES);
		const users					= 	db.collection(TABLE_USERS);
		const walletTransaction		= 	db.collection(TABLE_WALLET_TRANSACTION);
		let scrapperFeatures		= 	(options && options.features_data) 	?   options.features_data	: [];
		let tagsArray				=	[];
		var tagsId					=	[];
		consoleLog("Insert Tags function called ");
		//consoleLog(scrapperTags);
	
			
			let conditions				=	{};
			var featureName = scrapperFeatures.urlName.replace(/\-/g," ");
			var featureSlug = scrapperFeatures.urlName;
			conditions.feature_slug 			= new RegExp(["^", featureSlug, "$"].join(""), "i");
			var insertOnSet = {
				feature_name			:	toTitleCase(featureName),
				feature_slug			:	scrapperFeatures.urlName ?scrapperFeatures.urlName.toLowerCase() : "",
				feature_type			:	scrapperFeatures.type ? scrapperFeatures.type  : "",
				feature_popularity		:	scrapperFeatures.appTypePopularity ? scrapperFeatures.appTypePopularity : "",
				feature_title_suffix	:	scrapperFeatures.titleSuffix ? scrapperFeatures.titleSuffix : "",
				is_url_active			:	ACTIVE,
				error_msg				:	'',	
				status					: 	ACTIVE,
				is_deleted				: 	NOT_DELETED		
				
			};
			featuresCollection.findOneAndUpdate(
								conditions, 
								{$set:insertOnSet,
								$inc:{product_count:1}},
								{ upsert : true,new: true},(err,result)=>{
									
						if(err){
									/** Send error response **/
									let response = {
										status	: STATUS_ERROR,
										message	: res.__("system.something_going_wrong_please_try_again")
									};
									return resolve(response);
								}
						if(result.value != null )
						{
							 tagsId = (result.value._id) ? (result.value._id) : "";
						}else{
							 tagsId = (result.lastErrorObject.upserted) ? (result.lastErrorObject.upserted) : "";
						}	
						tagsArray.push(tagsId);
						//consoleLog("tagsArray 2112131313131");
					//	consoleLog(tagsId);		

							/** Send error response **/
							let response = {
								status	: STATUS_SUCCESS,
								result	: tagsId,
							//	message	: res.__("system.something_going_wrong_please_try_again")
							};
							return resolve(response);
					})	
		
		
		
	}).catch(next);
}// end updateWalletBalance()


/**
 *  Function to update wallet balance
 *
 * @param req 		As	Request Data
 * @param res 		As	Response Data
 * @param options	As 	Object Data
 *
 * @return object
 */
insertCategories = (req,res,next,options)=>{
	return new Promise(resolve=>{
		
		const categoryCollection 	= 	 db.collection(TABLE_PRODUCT_CATEGORIES);
		const users					= 	db.collection(TABLE_USERS);
		const walletTransaction		= 	db.collection(TABLE_WALLET_TRANSACTION);
		let scrapperCategory		= 	(options && options.category_data) 	?   options.category_data	: [];
		let tagsArray				=	[];
		var tagsId					=	[];
		let conditions				=	{};
		consoleLog("Insert Tags function called ");
		//consoleLog(scrapperTags);
	
			var categoryName = scrapperCategory.urlName.replace(/\-/g," ");
			var categorySlug = scrapperCategory.urlName;
		
			var insertOnSet = {
				category_name			:	toTitleCase(categoryName),
				slug					:	scrapperCategory.urlName ? scrapperCategory.urlName.toLowerCase() : "",
				parent_id				:	DEACTIVE,
				is_url_active			:	ACTIVE,
				error_msg				:	'',	
				status					: 	ACTIVE,
				is_deleted				: 	NOT_DELETED		
				
			};
				conditions.slug 			= new RegExp(["^", categorySlug, "$"].join(""), "i");
				consoleLog("conditions for catgeory");

			categoryCollection.findOneAndUpdate(
								conditions, 
								{$set:insertOnSet,
								$inc:{product_count:1}},
								{ upsert : true,new: true},(err,result)=>{
									
						if(err){
									/** Send error response **/
									let response = {
										status	: STATUS_ERROR,
										message	: res.__("system.something_going_wrong_please_try_again")
									};
									return resolve(response);
								}
						if(result.value != null )
						{
							 tagsId = (result.value._id) ? (result.value._id) : "";
						}else{
							 tagsId = (result.lastErrorObject.upserted) ? (result.lastErrorObject.upserted) : "";
						}	
						tagsArray.push(tagsId);
						//consoleLog("tagsArray 2112131313131");
					//	consoleLog(tagsId);		

							/** Send error response **/
							let response = {
								status	: STATUS_SUCCESS,
								result	: tagsId,
							//	message	: res.__("system.something_going_wrong_please_try_again")
							};
							return resolve(response);
					})	
		
		
		
	}).catch(next);
}// end updateWalletBalance()


/**
 *  Function to update wallet balance
 *
 * @param req 		As	Request Data
 * @param res 		As	Response Data
 * @param options	As 	Object Data
 *
 * @return object
 */
insertPlatforms = (req,res,next,options)=>{
	return new Promise(resolve=>{
		
		const platformCollection 	= 	 db.collection(TABLE_PRODUCT_PLATFORM);
		const users					= 	db.collection(TABLE_USERS);
		const walletTransaction		= 	db.collection(TABLE_WALLET_TRANSACTION);
		let scrapperPlatform		= 	(options && options.platform_data) 	?   options.platform_data	: [];
		let tagsArray				=	[];
		var tagsId					=	[];
		let conditions				=	{};
		consoleLog("Insert Tags function called ");
		//consoleLog(scrapperTags);
	
			var platformName = scrapperPlatform.urlName.replace(/\-/g," ");
			var platformSlug = scrapperPlatform.urlName;
		
			var insertOnSet = { 
				platform_name			:	toTitleCase(platformName),
				slug					:	scrapperPlatform.urlName ? scrapperPlatform.urlName.toLowerCase() : "",
				platform_type			:	scrapperPlatform.platformType ? scrapperPlatform.platformType : "",
				is_url_active			:	ACTIVE,
				error_msg				:	'',	
				status					: 	ACTIVE,
				is_deleted				: 	NOT_DELETED		
				
			};
				conditions.slug 			= new RegExp(["^", platformSlug, "$"].join(""), "i");
			platformCollection.findOneAndUpdate(
								conditions, 
								{$set:insertOnSet,
								$inc:{product_count:1}},
								{ upsert : true,new: true},(err,result)=>{
									
						if(err){
									/** Send error response **/
									let response = {
										status	: STATUS_ERROR,
										message	: res.__("system.something_going_wrong_please_try_again")
									};
									return resolve(response);
								}
						if(result.value != null )
						{
							 tagsId = (result.value._id) ? (result.value._id) : "";
						}else{
							 tagsId = (result.lastErrorObject.upserted) ? (result.lastErrorObject.upserted) : "";
						}	
						tagsArray.push(tagsId);
						//consoleLog("tagsArray 2112131313131");
					//	consoleLog(tagsId);		

							/** Send error response **/
							let response = {
								status	: STATUS_SUCCESS,
								result	: tagsId,
							//	message	: res.__("system.something_going_wrong_please_try_again")
							};
							return resolve(response);
					})	
		
		
		
	}).catch(next);
}// end updateWalletBalance()



/**
 *  Function to get data for import sheet
 *
 * @param req 				As Request Data
 * @param res 				As Response Data
 * @param userData		As requested Data
 *
 * @return string
 */
getIdBySlug = (req, res, data) => {
return new Promise(resolve=>{
		let collection 			= (data && data.collection) ? data.collection : '';
		let valueName 			= (data && data.name) ? data.name : '';
		let fieldName 			= (data && data.column_name) ? data.column_name : '';
		
		
		if (!collection) {
			/** Send error response **/
			let response = {
				status: STATUS_ERROR,
				result: {},
				message: res.__("admin.system.something_going_wrong_please_try_again")
			};
			return resolve(response);
		}
		try {
			const collectionName = db.collection(collection);
			let findObj = {};
			findObj[fieldName] =  valueName ;
			consoleLog(findObj);
			collectionName.findOne(
						findObj,
					(err, result) => {
						
						/** Send error response **/
						let response = {
							status: STATUS_SUCCESS,
							result: result,
							message: ''
						};
						return resolve(response);
					

				}
			);
		} catch (e) {
			/** Send error response **/
			let response = {
				status: STATUS_ERROR,
				result: {},
				message: res.__("admin.system.something_going_wrong_please_try_again")
			};
			 resolve(response);
		}
	});
}// end getIdByName()



/**
 *  Function to get data for import sheet
 *
 * @param req 				As Request Data
 * @param res 				As Response Data
 * @param userData		As requested Data
 *
 * @return string
 */
 getProductIdBySlug = (req, res, data) => {
	return new Promise(resolve=>{
			let collection 			= (data && data.collection) ? data.collection : '';
			let valueName 			= (data && data.name) ? data.name : '';
			let fieldName 			= (data && data.column_name) ? data.column_name : '';
			
			
			if (!collection) {
				/** Send error response **/
				let response = {
					status: STATUS_ERROR,
					result: {},
					message: res.__("admin.system.something_going_wrong_please_try_again")
				};
				return resolve(response);
			}
			try {
				const collectionName = db.collection(collection);
				let findObj = {};
				findObj[fieldName] =  valueName ;
				//consoleLog(findObj);
				collectionName.findOne(
							findObj,
						(err, result) => {
							
							/** Send error response **/
							let response = {
								status: STATUS_SUCCESS,
								result: result,
								message: ''
							};
							return resolve(response);
						
	
					}
				);
			} catch (e) {
				/** Send error response **/
				let response = {
					status: STATUS_ERROR,
					result: {},
					message: res.__("admin.system.something_going_wrong_please_try_again")
				};
				 resolve(response);
			}
		});
	}// end getIdByName()