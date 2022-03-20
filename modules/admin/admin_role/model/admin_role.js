function Role() {

	/**
	 * Function for get admin role list
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
	this.list = (req, res)=>{
		if(isPost(req)){
			let limit			= 	(req.body.length)	?	parseInt(req.body.length)	:ADMIN_LISTING_LIMIT;
			let skip			= 	(req.body.start) 	? 	parseInt(req.body.start)	:DEFAULT_SKIP;
            const collection	= 	db.collection("admin_roles");

			/** Configure Datatable conditions*/
			configDatatable(req,res,null).then((dataTableConfig)=>{
                let commonConditions = {
                    is_shown : SHOWN,
                };
                dataTableConfig.conditions = Object.assign(dataTableConfig.conditions,commonConditions);

                const async	= require("async");
				async.parallel([
					(callback)=>{

						/** Get list of user month wise **/
						collection.aggregate([
							{$match	: dataTableConfig.conditions},
							{
								$lookup : {
									from			: TABLE_CATEGORIES,
									let				: { cat_id: "$category_ids" },
									pipeline: [
										{ $match:
											{ $expr:
												{ $and:
													[
													{ $in: ["$_id","$$cat_id"] },
													]
												},
											}
										},
										{ $project: { "_id": 1, "name": 1} }
									],
									as: "category_detail",
								}
							},
							{
								$project : {
									"_id" 						:1,
									"role_name" 				:1,
									"category_ids"				:1,
									"not_deletable"				:1,
									"modified" 					:1,
									"active"   					:1,
									"created"					:1,
									//"category_detail"					:1,
									"category_name"				: 	"$category_detail.name"
									
								}
							},
							{$sort: dataTableConfig.sort_conditions},
							{ $skip: skip },
							{ $limit: limit },
						]).toArray((err, result)=>{
							callback(null, result);
						});
					},
					(callback)=>{
						/** Get total number of roles in admin_roles collection  **/
						collection.countDocuments(commonConditions,(err,countResult)=>{
							callback(err, countResult);
						});
					},
					(callback)=>{
						/** Get filtered records counting in admin_roles **/
						collection.countDocuments(dataTableConfig.conditions,(err,filterContResult)=>{
							callback(err, filterContResult);
						});
					}
				],
				(err, response)=>{
					consoleLog(response);
					/** Send response **/
					res.send({
						status			: (!err) ? STATUS_SUCCESS : STATUS_ERROR,
						draw			: dataTableConfig.result_draw,
						data			: (response[0]) ? response[0] :[],
						recordsTotal	: (response[1]) ? response[1] :0,
						recordsFiltered	: (response[2]) ? response[2] :0,
					});
				});
			});
		}else{
			
		
			/** render listing page **/
			req.breadcrumbs(BREADCRUMBS["admin/admin_role/list"]);
			res.render('list');
				
		}
    };//End list()

    /**
	 * Function for add role
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.add = (req, res)=>{
		if(isPost(req)){
			/** Sanitize Data **/
            req.body = sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
            let roleName  = (req.body.role)		    ? req.body.role	 		: "";
            let modules   = (req.body.module_ids)	? req.body.module_ids	: "";

		
				try{
                    /** Include admin modules Module **/
                    let adminModule = require(WEBSITE_ADMIN_MODULES_PATH+"admin_modules/model/admin_module");
                    adminModule.formatModuleIdsArray(req, res).then((moduleArray)=>{
                        const admin_roles	= db.collection(TABLE_ADMIN_ROLE);
                        admin_roles.insertOne({
                                role_name 	: roleName,
                                module_ids 	: moduleArray,
                                is_shown    : SHOWN,
                                assign_modules 	: modules,
                                created 	: getUtcDate(),
                                modified 	: getUtcDate()
                            },(error,result)=>{
                                if(!error){
                                    /** Send success response **/
                                    req.flash(STATUS_SUCCESS,res.__("admin.admin_role.role_has_been_added_successfully"));
                                    res.send({
                                        status		: STATUS_SUCCESS,
                                        redirect_url: WEBSITE_ADMIN_URL+"admin_role",
                                        message		: res.__("admin.admin_role.role_has_been_added_successfully")
                                    });
                                }else{
                                    /** Send error response **/
                                    res.send({
                                        status : STATUS_ERROR,
                                        message: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}],
                                    });
                                }
                            }
                        );
                    });
				}catch(e){
					/** Send error response **/
					res.send({
						status	: STATUS_ERROR,
						message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
				}

		}else{
            /** Include admin modules Module **/
            let adminModule = require(WEBSITE_ADMIN_MODULES_PATH+"admin_modules/model/admin_module");
            adminModule.getAdminModulesTree(req, res).then((response)=>{
                /** Render view file **/
                req.breadcrumbs(BREADCRUMBS['admin/admin_role/add']);
                res.render('add',{
                    admin_modules : response.result
                });
            });
		}
    };//End add()

    
	
	/**
	 * Function for edit role
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.edit = (req, res)=>{
        let roleId	= (req.params.id) ? req.params.id : "";
      
		if(roleId){
            if(isPost(req)){
                /** Sanitize Data **/
                req.body 	  = sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
                let roleName  = (req.body.role)	        ? req.body.role	        : "";
                let modules   = (req.body.module_ids)	? req.body.module_ids	: "";

                    try{
						
					
                        /** Include admin modules Module **/
                        let adminModule = require(WEBSITE_ADMIN_MODULES_PATH+"admin_modules/model/admin_module");
                        adminModule.formatModuleIdsArray(req, res).then((moduleArray)=>{
                            const admin_roles	= db.collection("admin_roles");
                            admin_roles.updateOne({
                                    _id : ObjectId(roleId)
                                },
                                {$set: {
                                    role_name 	: roleName,
                                    module_ids 	: moduleArray,
                                    assign_modules 	: modules,
                                    modified 	: getUtcDate()
                                }},(err,result)=>{
                                    if(!err){
										const usertable	= db.collection(TABLE_USERS);
										
										usertable.find({
											user_role_id 		: roleId,
											is_admin_approved 	: ACTIVE,
										},{projection: {
											_id : 1,company_name:1
										}}).toArray((usererr,userresult)=>{
											
											if(userresult.length > 0){
												const async 		= require('async');
												async.forEachOf(userresult,(records,index,eachCallback)=>{
													let userId = (records._id) ? records._id : MONGO_ID;
													
													usertable.updateMany({
														_id : ObjectId(userId),
													},{
														$set : {
															 module_ids 	: moduleArray,
														}
													},(updateerr,updateResult)=>{
														eachCallback(null);
													});
													
													
												}, (parentErr) => {
													
													/** Send success response **/
													req.flash(STATUS_SUCCESS,res.__("admin.admin_role.role_details_updated_successfully"));
													res.send({
														status		: STATUS_SUCCESS,
														redirect_url: WEBSITE_ADMIN_URL+"admin_role",
														message		: res.__("admin.admin_role.role_details_updated_successfully")
													});
												})
											}else{
												/** Send success response **/
												req.flash(STATUS_SUCCESS,res.__("admin.admin_role.role_details_updated_successfully"));
												res.send({
													status		: STATUS_SUCCESS,
													redirect_url: WEBSITE_ADMIN_URL+"admin_role",
													message		: res.__("admin.admin_role.role_details_updated_successfully")
												});
											}
										
										});
                                    }else{
                                        /** Send error response **/
                                        res.send({
                                            status : STATUS_ERROR,
                                            message: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}],
                                        });
                                    }
                                }
                            );
                        });
                    }catch(e){
                        /** Send error response **/
                        res.send({
                            status	: STATUS_ERROR,
                            message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
                        });
                    }
              
            }else{
                try{
                    const admin_roles	= db.collection(TABLE_ADMIN_ROLE);
                    admin_roles.findOne({
						_id : ObjectId(roleId)
					},
					{projection: {
						_id : 1,role_name :1,module_ids:1
					}},(err,result)=>{
						if(!err && result){
							/** Include admin modules Module **/
							let adminModule = require(WEBSITE_ADMIN_MODULES_PATH+"admin_modules/model/admin_module");
							adminModule.getAdminModulesTree(req, res).then((response)=>{
								/** Render view file **/
								req.breadcrumbs(BREADCRUMBS['admin/admin_role/edit']);
								res.render('edit',{
									result          : result,
									admin_modules   : response.result
								});
							});
						}else{
							/** Send error response **/
							req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
							res.redirect(WEBSITE_ADMIN_URL+"admin_role")
						}
					});
                }catch(e){
                    /** Send error response **/
                    req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
                    res.redirect(WEBSITE_ADMIN_URL+"admin_role");
                }
            }
        }else{
            /** Send error response **/
            req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
            res.redirect(WEBSITE_ADMIN_URL+"admin_role");
        }
    };//End edit()


    /**
	 * Function for delete role
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.delete = (req, res)=>{
        let roleId	= (req.params.id) ? req.params.id : "";
		if(roleId){
            try{
                const admin_roles	= db.collection("admin_roles");
                admin_roles.deleteOne({_id: ObjectId(roleId)},(err, result) => {
                    if (!err) {
                        /** Send success response **/
                        req.flash(STATUS_SUCCESS, res.__("admin.admin_role.deleted_successfully"));
                        res.redirect(WEBSITE_ADMIN_URL + 'admin_role');
                    } else {
                        /** Send error response **/
                        req.flash(STATUS_ERROR, res.__("admin.system.something_going_wrong_please_try_again"));
                        res.redirect(WEBSITE_ADMIN_URL + 'admin_role');
                    }
                });
            }catch(e){
                /** Send error response **/
                req.flash(STATUS_ERROR,res.__("admin.system.something_going_wrong_please_try_again"));
                res.redirect(WEBSITE_ADMIN_URL+"admin_role");
            }
        }else{
            /** Send error response **/
            req.flash(STATUS_ERROR,res.__("admin.system.invalid_access"));
            res.redirect(WEBSITE_ADMIN_URL+"admin_role");
        }
	};//End delete()
	
	
	
	 /**
	 * Function for add role
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return render/json
	 */
    this.addTag = (req, res)=>{
		if(isPost(req)){
			/** Sanitize Data **/
            req.body = sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
            let roleName  = (req.body.role)		    ? req.body.role	 		: "";
            let modules   = (req.body.module_ids)	? req.body.module_ids	: "";

			/** Check validation **/
			req.checkBody({
				"role": {
					notEmpty: true,
					errorMessage: res.__("admin.admin_role.please_enter_role")
				},
				"module_ids": {
					notEmpty: true,
					errorMessage: res.__("admin.admin_role.please_select_modules")
				}
            });

			/** parse Validation array  **/
			let errors = parseValidation(req.validationErrors(),req);
			if (!errors) {
				try{
                    /** Include admin modules Module **/
                    let adminModule = require(WEBSITE_ADMIN_MODULES_PATH+"admin_modules/model/admin_module");
                    adminModule.formatModuleIdsArray(req, res).then((moduleArray)=>{
                        const admin_roles	= db.collection("admin_roles");
                        admin_roles.insertOne({
                                role_name 	: roleName,
                                module_ids 	: moduleArray,
                                is_shown    : SHOWN,
                                assign_modules 	: modules,
                                created 	: getUtcDate(),
                                modified 	: getUtcDate()
                            },(error,result)=>{
                                if(!error){
                                    /** Send success response **/
                                    req.flash(STATUS_SUCCESS,res.__("admin.admin_role.role_has_been_added_successfully"));
                                    res.send({
                                        status		: STATUS_SUCCESS,
                                        redirect_url: WEBSITE_ADMIN_URL+"admin_role",
                                        message		: res.__("admin.admin_role.role_has_been_added_successfully")
                                    });
                                }else{
                                    /** Send error response **/
                                    res.send({
                                        status : STATUS_ERROR,
                                        message: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}],
                                    });
                                }
                            }
                        );
                    });
				}catch(e){
					/** Send error response **/
					res.send({
						status	: STATUS_ERROR,
						message	: [{param:ADMIN_GLOBAL_ERROR,msg:res.__("admin.system.something_going_wrong_please_try_again")}]
					});
				}
			}else{
				/** Send error response **/
				res.send({
					status	: STATUS_ERROR,
					message	: errors,
				});
			}
		}else{
            /** Include admin modules Module **/
            let adminModule = require(WEBSITE_ADMIN_MODULES_PATH+"admin_modules/model/admin_module");
            adminModule.getAdminModulesTree(req, res).then((response)=>{
                /** Render view file **/
                req.breadcrumbs(BREADCRUMBS['admin/admin_role/add']);
                res.render('tag',{
                    admin_modules : response.result
                });
            });
		}
	};//End add()
	

	/**
	 * Function for assign category
	 *
	 * @param req As Request Data
	 * @param res As Response Data
	 *
	 * @return null
	 */
	this.assignCategory = (req, res)=>{
		const admin_roles	= db.collection("admin_roles");
		/** Sanitize Data */
		req.body =  sanitizeData(req.body,NOT_ALLOWED_TAGS_XSS);
		let roleId	= (req.body.role_id) ? req.body.role_id : "";
		/** Check validation */
	
		
		let categoryIdArray	     = (req.body.category) ? req.body.category : [];
		if(typeof(categoryIdArray) == "string"){
			categoryIdArray = [categoryIdArray]
		}
		
		let categoryIdTypeArray = [];
		if(categoryIdArray.length > 0){
			categoryIdArray.map(listingTypeId=>{
				categoryIdTypeArray.push(ObjectId(listingTypeId))
			})
		}
		/**For update role data */
		admin_roles.updateOne({_id:ObjectId(roleId)},{$set:{category_ids:categoryIdTypeArray}},(err,result)=>{
			if(err) return next(err);

			/**For send success response */
			req.flash(STATUS_SUCCESS,res.__("admin.admin_role.categort_assign_successfully"));
			res.send({
				status		: STATUS_SUCCESS,
				redirect_url: WEBSITE_ADMIN_URL+"admin_role",
				message		: res.__("admin.admin_role.categort_assign_successfully")
			});

		});
		
	};//End assignCategory()


	/**
	 * Function for get category data
	 *
	 * @param req	As Request Data
	 * @param res 	As Response Data
	 *
	 * @return json
	*/
	this.getCategoryList = (req, res, next) => {
		/**For get category data */
		const category = db.collection(TABLE_CATEGORIES);
		category.find({status:ACTIVE,parent_id : DEACTIVE},{projection:{_id:1,name:1}}).toArray((err,result)=>{
			if(err) return next(err);

			/**Foe check category result */
			if(result.lenght == 0){
				res.send({
					status : STATUS_ERROR,
					message : res.__("admin.system.invalid_access")
				})
			}
			/**Send success response */
			res.send({
				status : STATUS_SUCCESS,
				result : (result) ? result : []
			})
		});
	}//End getCategoryList()
}
module.exports = new Role();
