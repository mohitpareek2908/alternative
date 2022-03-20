/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/user";
var modulePath	= 	"/"+ADMIN_NAME+"/users/:user_type/";
const { loginValidationRules, addUserValidationRules,editUserValidationRules,forgetPasswordValidationRules,editUserProfileValidationRules, resetPasswordValidationRules,validate } = require(__dirname+"/user_validation/validator.js")

/** Before login routings **/

/** Routing is used to render html and submit login form **/
app.all(["/"+ADMIN_NAME+"/login","/"+ADMIN_NAME],isLoggedIn,loginValidationRules(), validate, (req, res,next) => {
    /** Set current view folder **/
    req.rendering.views     = __dirname + "/views";

    /** Set layout  **/
    req.rendering.layout  = WEBSITE_ADMIN_LAYOUT_PATH+"before_login";

    var adminUser	= require(modelPath);
    adminUser.login(req, res,next);
});

/** Routing is used to render html and submit forgot password form **/
app.all("/"+ADMIN_NAME+"/forgot-password",forgetPasswordValidationRules(), validate,(req, res)=>{
    /** Set current view folder **/
    req.rendering.views	=	__dirname + "/views";

    /** Set layout  **/
	req.rendering.layout    = WEBSITE_ADMIN_LAYOUT_PATH+"before_login";

    var adminUser	= require(modelPath);
    adminUser.forgotPassword(req, res);
});

/** Routing is used to render html and submit reset password form **/
app.all("/"+ADMIN_NAME+"/reset-password",resetPasswordValidationRules(),validate,(req, res)=>{
    /** Set current view folder **/
   req.rendering.views	=	__dirname + "/views";

	/** Set layout  **/
	req.rendering.layout    = WEBSITE_ADMIN_LAYOUT_PATH+"before_login";

    var adminUser	= require(modelPath);
    adminUser.resetPassword(req, res);
});

/** Before login routings end **/

/** Routing is used to update auth user details **/
// app.all("/"+ADMIN_NAME+"/edit_profile",checkLoggedInAdmin,editUserProfileValidationRules(), validate,(req, res)=>{
//     consoleLog("Route Reached");
//     consoleLog(modulePath+"edit_profile/");

//     // "/"+ADMIN_NAME+"edit_profile"

//     /** Set current view folder **/
//     req.rendering.views = __dirname + "/views";

//     var adminUser	= require(modelPath);
//     adminUser.editProfile(req, res);
// });

/** Routing is used to render dashboard html */
app.get("/"+ADMIN_NAME+"/dashboard",checkLoggedInAdmin,(req, res, next)=>{
	
    /** Set current view folder **/
    req.rendering.views	=	__dirname + "/views";

    var adminUser = require(modelPath);
    adminUser.dashboard(req, res, next);
});




/** Routing is used to send_to_admin_approve **/
app.all("/"+ADMIN_NAME+"/send_to_admin_approve/:id",(req, res, next)=>{
    /** Set current view folder **/
 
    var adminUser = require(modelPath);
    adminUser.requestSendToAdminApprove(req, res, next);
});




/** Routing is used to render fleet layout html */
app.all("/"+ADMIN_NAME+"/login_user/:validate_string",(req, res, next)=>{
    /** Set current view folder **/
    req.rendering.views	=	__dirname + "/views";

    var adminUser = require(modelPath);
    adminUser.loginSubAdmin(req, res, next);
});

/** Set current view folder **/
app.use(modulePath,(req,res,next)=>{
   req.rendering.views	=	__dirname + "/views";
   next();
});

/** Routing is used to delete user details **/
app.get(modulePath+"get_cms_detail",checkLoggedInAdmin,(req,res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.getCmsDetails(req,res,next);
});

/** Routing is used to edit user **/
app.all("/"+ADMIN_NAME+"/edit_profile",checkLoggedInAdmin,editUserProfileValidationRules(), validate,(req,res,next)=>{
    consoleLog("Route Reacjhed");
    req.rendering.views = __dirname + "/views";
    var adminUser	= require(modelPath);
    adminUser.editProfile(req,res,next);
});



/** Routing is used to add user **/
app.all(modulePath+"add",checkLoggedInAdmin,addUserValidationRules(), validate,(req,res,next)=>{
//app.all(modulePath+"add",checkLoggedInAdmin,(req,res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.addUser(req,res,next);
});

/** Routing is used to edit user **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editUserValidationRules(), validate,(req,res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.editUser(req,res,next);
});

/** Routing is used to view user details **/
app.get(modulePath+"view/:id",checkLoggedInAdmin,(req, res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.viewUserDetails(req, res,next);
});

/** Routing is used to update user status **/
app.all(modulePath+"update_user_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.updateUserStatus(req,res,next);
});

/** Routing is used to varify email and mobile **/
app.all(modulePath+"verify_email_or_mobile_status/:id/:verify_type",checkLoggedInAdmin,(req, res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.verifyEmailOrMObile(req,res,next);
});


/** Routing is used to delete user details **/
app.get(modulePath+"delete/:id",checkLoggedInAdmin,(req,res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.deleteUser(req,res,next);
});





/** Routing is used to update  export user details **/
app.all(modulePath+"export_data/:export_type",checkLoggedInAdmin,(req, res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.exportData(req,res,next);
});

/** Routing is used to send login credentials **/
app.get(modulePath+"send_login_credentials/:id",checkLoggedInAdmin,(req, res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.sendLoginCredentials(req, res,next);
});

/** Routing is used to update wallet balance **/
app.all(modulePath+"update_wallet_balance",checkLoggedInAdmin,(req,res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.updateWalletBalance(req,res,next);
});

/** Routing is used to update  export user details **/
app.get(modulePath+"export_data/:export_type",checkLoggedInAdmin,(req, res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.exportData(req,res,next);
});



/** Routing is used to get user list **/
app.all(modulePath+":type?",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.getUserList(req, res);
});


/** Routing is used for admin logout */
app.get("/"+ADMIN_NAME+"/logout",(req, res)=>{
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");

    /** Delete user Modules list Flag **/
    let userId  = (req.session && req.session.user && req.session.user._id) ? req.session.user._id : "";
    userModuleFlagAction(userId,"","delete");

    req.session = null;
    res.clearCookie("adminLoggedIn");
    res.redirect(WEBSITE_ADMIN_URL+"login");
});




