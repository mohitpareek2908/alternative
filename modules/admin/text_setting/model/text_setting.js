function TextSetting() {

	/**
	 * Function to get textsettings list
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.getTextSettingList = (req, res)=>{
		let textSettingType = (req.params.type) ? req.params.type : "";
		if(textSettingType && TEXT_SETTINGS_NAME[textSettingType]){
			let textSettingName	= TEXT_SETTINGS_NAME[textSettingType];
			
			if(isPost(req)){
				let limit			= 	(req.body.length) 	?	parseInt(req.body.length)	:ADMIN_LISTING_LIMIT;
				let skip			= 	(req.body.start)	? 	parseInt(req.body.start) 	:DEFAULT_SKIP;
				const collection	=	db.collection(TABLE_TEXT_SETTINGS);
				const async			= 	require("async");
				
				/** Configure Datatable conditions*/
				configDatatable(req,res,null).then((dataTableConfig)=>{
					let commonConditions = {
						type : textSettingType
					};
					dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);
					
					async.parallel([
						(callback)=>{
							/** Get list of text settings **/
							collection.find(dataTableConfig.conditions,{projection: {_id:1,key:1,value:1,modified:1}}).collation(COLLATION_VALUE).sort(dataTableConfig.sort_conditions).limit(limit).skip(skip).toArray((err,result)=>{
								callback(err, result);
							});
						},
						(callback)=>{
							/** Get total number of records in text_settings collection **/
							collection.countDocuments(commonConditions,(err,countResult)=>{ 
								callback(err, countResult);
							});
						},
						(callback)=>{
							/** Get filtered records couting in text settings **/
							collection.countDocuments(dataTableConfig.conditions,(err,filterContResult)=>{
								callback(err, filterContResult);
							});
						}
					],
					(err, response)=>{
						/** Send success response **/
						res.send({
							status			: (!err) ? STATUS_SUCCESS : STATUS_ERROR,
							draw			: dataTableConfig.result_draw,
							data			: (response[0]) ? response[0] : [],
							recordsFiltered	: (response[2]) ? response[2] : 0,
							recordsTotal	: (response[1]) ? response[1] : 0
						});
					});
				});
			}else{
				/** render listing page **/
				req.breadcrumbs(BREADCRUMBS["admin/text_setting/list"]);
				res.render("list",{
					type			: textSettingType,
					dynamic_variable: textSettingName+" "+res.__("admin.text_setting.management"),
					dynamic_url		: textSettingType
				});
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
		}
	};//End getTextSettingList()

	
	
	
	
	/**
	 * Function for get text setting's detail
	 *
	 * @param req		As Request Data
	 * @param res		As Response Data
	 *
	 * @return json
	 */
	let textSettingDetails = (req,res)=>{ 
		return new Promise(resolve=>{
			let textSettingId = (req.params.id) ? req.params.id : "";
			if(!textSettingId || textSettingId ==""){
				let response = {
					status	: STATUS_ERROR,
					message	: res.__("admin.system.invalid_access")
				};
				resolve(response);
			}else{
				try{
					/**Get text settings detials*/
					const textsettings = db.collection(TABLE_TEXT_SETTINGS);
					textsettings.findOne({
							_id : ObjectId(textSettingId)
						},
						{projection: {
							_id:1,key:1,value:1,modified:1,default_language_id:1,text_settings_descriptions:1
						}},(err, result)=>{
							if(result){
								/** Send success response **/
								let response = {
									status	: STATUS_SUCCESS,
									result	: result
								};
								resolve(response);
							}else{
								/** Send error response **/
								let response = {
									status	: STATUS_ERROR,
									message	: res.__("admin.system.invalid_access")
								};
								resolve(response);
							}
						}
					);
				}catch(e){
					/** Send error response */
					let response = {
						status	: STATUS_ERROR,
						message	: res.__("admin.system.something_going_wrong_please_try_again")
					};
					resolve(response);
				}
			}
		});
	};//End textSettingDetails()




	/**
	 * Function for update text setting's detail
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.editTextSetting = (req, res)=>{
		let textSettingType = (req.params.type) ? req.params.type : "";
		let id 		= (req.params.id) ? req.params.id : "";
		
		if(textSettingType && TEXT_SETTINGS_NAME[textSettingType]){
			
			let textSettingName	= TEXT_SETTINGS_NAME[textSettingType];
			if(isPost(req)){
				
				/** Sanitize Data **/
				req.body 	= sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
				
				if(id != "" && typeof req.body.text_settings_descriptions !== typeof undefined && (typeof req.body.text_settings_descriptions[DEFAULT_LANGUAGE_MONGO_ID] !== typeof undefined && req.body.text_settings_descriptions[DEFAULT_LANGUAGE_MONGO_ID] && req.body.text_settings_descriptions[DEFAULT_LANGUAGE_MONGO_ID] != "")){
					const clone		= 	require("clone");
					let allData		= 	req.body;
					req.body		= 	clone(allData.text_settings_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
					req.body.key	=	(allData.key) ? allData.key : "";
					consoleLog("allData.text_settings_descriptions");
					consoleLog(allData.text_settings_descriptions);
					//return false;
					try{
						let key		= 	(req.body.key)		? 	req.body.key	:"";
						let value 	=	(req.body.value)	?	req.body.value	:"";
					
						/** Update record*/
						const textsettings = db.collection(TABLE_TEXT_SETTINGS);
						textsettings.updateOne({
								_id : ObjectId(id)
							},
							{$set: {
								key							: key,
								value						: value,
								default_language_id			: DEFAULT_LANGUAGE_MONGO_ID,
								text_settings_descriptions	: (allData.text_settings_descriptions) ? allData.text_settings_descriptions :{},
								modified 					: getUtcDate()
							}},(err,result)=>{
								if(!err){
									writeTextSettingFile().then(response=>{	
										/** Send success response **/
										req.flash(STATUS_SUCCESS,res.__("admin.text_setting.text_setting_has_been_updated_successfully"));
										res.send({
											status			: STATUS_SUCCESS,
											redirect_url	: WEBSITE_ADMIN_URL+"text-setting/"+textSettingType,
											message			: res.__("admin.text_setting.text_setting_has_been_updated_successfully"),
										});
									});
								}else{
									/** Send error response **/
									res.send({
										status	: STATUS_ERROR,
										message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
									});
								}
							}
						);
					}catch(e){
						/** Send error response **/
						res.send({
							status:STATUS_ERROR,
							message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
						});
					}		
					
				}else{
					/** Send error response **/
					res.send({
						status	: STATUS_ERROR,
						message	: res.__("admin.system.something_going_wrong_please_try_again")
					});
				}
			}else{
				
				/** Get language list **/
				getLanguages().then((languageList)=>{
					/** Get text settings details **/
					textSettingDetails(req, res).then((response)=>{
						if(response.status == STATUS_SUCCESS){
							/** Render edit page **/
							req.breadcrumbs(BREADCRUMBS["admin/text_setting/edit"]);
							res.render("edit",{
								result			: response.result,
								language_list	: languageList,
								type			: textSettingType,
								dynamic_variable: textSettingName+" "+res.__("admin.text_setting.management"),
								dynamic_url		: textSettingType,
								textSettingId	: id,	
							});
						}else{
							/** Send error response **/
							req.flash(STATUS_ERROR,response.message);
							res.redirect(WEBSITE_ADMIN_URL+"text-setting/"+textSettingType);
						}
					});
				});
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
		}
	};//End editTextSetting()
	
	
	
	
	
	
	/**
	 * Function for add text settings
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.addTextSetting= (req, res)=>{
		let textSettingType = (req.params.type) ? req.params.type : "";
		if(textSettingType && TEXT_SETTINGS_NAME[textSettingType]){
			let textSettingName	= TEXT_SETTINGS_NAME[textSettingType];
			if(isPost(req)){
				console.log("here post");
				/** Sanitize Data **/
				req.body = sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
				if(req.body.text_settings_descriptions != undefined && req.body.text_settings_descriptions[DEFAULT_LANGUAGE_MONGO_ID] != undefined && req.body.text_settings_descriptions[DEFAULT_LANGUAGE_MONGO_ID] != ""){
					const clone		= 	require("clone");
					let allData		= 	req.body;
					req.body		=	clone(allData.text_settings_descriptions[DEFAULT_LANGUAGE_MONGO_ID]);
					req.body.key	=	(allData.key) ? allData.key : "";
					
						try{
							let key		= 	(req.body.key) 		? 	req.body.key 	:"";
							let value	=	(req.body.value) 	?	req.body.value 	:"";
							
							/** check for unique key*/
							const textsettings = db.collection(TABLE_TEXT_SETTINGS);
							/** Insert record*/
							textsettings.insertOne({
									key							: 	key,
									value						: 	value,
									type						: 	textSettingType,
									default_language_id			: 	DEFAULT_LANGUAGE_MONGO_ID,
									text_settings_descriptions	: 	(allData.text_settings_descriptions) ? allData.text_settings_descriptions :{},
									created 					:	getUtcDate(),
									modified 					: 	getUtcDate()
								},(err,result)=>{
									if(!err){
										writeTextSettingFile().then((response)=>{	
											/** Send success response **/
											req.flash(STATUS_SUCCESS,res.__("admin.text_setting.text_setting_has_been_added_successfully"));
											res.send({
												status:STATUS_SUCCESS,
												redirect_url: WEBSITE_ADMIN_URL+"text-setting/"+textSettingType+"/add",
												message:res.__("admin.text_setting.text_setting_has_been_added_successfully")
											});
										});
									}else{
										/** Send error response **/
										res.send({
											status:STATUS_ERROR,
											message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
										});
									}
								}
							);	
						}catch(e){
							/** Send error response **/
							res.send({
								status:STATUS_ERROR,
								message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
							});
						}		
					
				}else{
					/** Send error response **/
					res.send({
						status: STATUS_ERROR,
						message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
				}
			}else{
				/** Get language list **/
				getLanguages().then((languageList)=>{
					/** Render add page **/
					req.breadcrumbs(BREADCRUMBS["admin/text_setting/add"]);
					res.render("add",{
						language_list	: languageList,
						type			: textSettingType,
						dynamic_variable: textSettingName+" "+res.__("admin.text_setting.management"),
						dynamic_url		: textSettingType,
					});
				});
			}
		}else{
			/** Send error response **/
			req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
			res.redirect(WEBSITE_ADMIN_URL+"dashboard");
		}
	};//End addTextSetting()

	/**
	 * Function to write text setting file.
	 *
	 * @param null
	 *
	 * @return void
	 */
	let writeTextSettingFile = ()=>{	
		return new Promise(resolve=>{
			try{
				const text_settings 	= 	db.collection(TABLE_TEXT_SETTINGS);
				const languages 		= 	db.collection(TABLE_LANGUAGES);
				
				/** Get Active Languages List **/
				languages.find({
					active : ACTIVE
				},{projection: {_id:1,folder_code:1}}).toArray((languageErr, languageResult)=>{
					if(!languageErr && languageResult && languageResult.length>0){
						let languageObject 		= 	{};
						let textSettingsObject 	= 	{};
						const fs				=	require("fs");
				
						languageResult.forEach((languageRecord,languageIndex)=>{
							languageId 			=	(languageRecord["_id"]) 		? 	languageRecord["_id"] 			:"";
							languageFolderCode	= 	(languageRecord["folder_code"]) ?	languageRecord["folder_code"] 	:"";
							/** Create a Language Object With language id and folder code **/
							languageObject[languageId] 	= languageFolderCode;
							if(typeof textSettingsObject[languageFolderCode] === typeof undefined){
								textSettingsObject[languageFolderCode] = {};
							}
							if(languageResult.length-1 == languageIndex){
								if(Object.keys(languageObject).length > 0){
									/** Get All text settings **/
									text_settings.find({},{projection: {_id:1,key:1,value:1,text_settings_descriptions:1,modified:1}}).toArray((err, result)=>{
										if(!err){
											let textSettingsObject 	= {};
											result.forEach((record,arrayIndex)=>{
												let languageKey 	= (record.key)	 ? record.key 	: "";
												let languageValue 	= (record.value) ? record.value : "";

												/** Loop through Language Object and check that particular value is exist in this language or not, if not exist then use default langugae value **/
												Object.keys(languageObject).forEach((languageId,languageIndex)=>{
													folderCode = languageObject[languageId];
													/** Check Textsetting Folder code is undefined or not **/
													if(typeof textSettingsObject[folderCode] === typeof undefined){
														textSettingsObject[folderCode] = {};
													}

													/** Check Textsetting[Folder code][Text setting key] is undefined or not **/
													if(typeof textSettingsObject[folderCode][languageKey] === typeof undefined){
														textSettingsObject[folderCode][languageKey] = {};
													}

													/** Check if value is exist in a particular language or not **/
													if( typeof record["text_settings_descriptions"] !== typeof undefined && typeof record["text_settings_descriptions"][languageId] !== typeof undefined && typeof record["text_settings_descriptions"][languageId]["value"] !== typeof undefined && record["text_settings_descriptions"][languageId]["value"]!=""){
														textSettingsObject[folderCode][languageKey] = record["text_settings_descriptions"][languageId]["value"];
													}else{
														textSettingsObject[folderCode][languageKey] = languageValue;
													}

													/** check If result.length-1 == arrayIndex, means textsettings loop is on the last index then write file **/
													if(result.length-1 == arrayIndex){
														fs.writeFile(WEBSITE_ROOT_PATH+"locales/"+folderCode+".json", JSON.stringify(textSettingsObject[folderCode]), "utf8",()=>{});
														if(Object.keys(languageObject).length-1 == languageIndex){
															resolve();
														}
													}
												});
											});
										}else{
											resolve();
										}
									});
								}else{
									resolve();
								}
							}
						});
					}else{
						resolve();
					}
				});
			}catch(e){
				resolve();
			}	
		});
	};//End writeTextSettingFile()
}

module.exports = new TextSetting();
