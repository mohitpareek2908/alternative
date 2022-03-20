/** Model file path for current plugin **/
var modelPath = __dirname+"/model/admin_permissions";
var modulePath	= 	"/"+ADMIN_NAME+"/admin_permissions/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
	req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used for listing page **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var adminPermissions = require(modelPath);
	adminPermissions.list(req, res);
});

/** Routing is used to add permission **/
app.all(modulePath+"add",checkLoggedInAdmin,(req, res) => {
	var adminPermissions = require(modelPath);
	adminPermissions.add(req, res);
});

/** Routing is used to edit permission **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,(req, res) => {
	var adminPermissions = require(modelPath);
	adminPermissions.edit(req, res);
});

/** Routing is used to delete permission **/
app.all(modulePath+"delete/:id",checkLoggedInAdmin,(req, res) => {
	var adminPermissions = require(modelPath);
	adminPermissions.delete(req, res);
});

/** Routing is used to view permission **/
app.get(modulePath+"view/:id",checkLoggedInAdmin,(req, res)=>{
    var adminPermissions = require(modelPath);
    adminPermissions.viewDetials(req, res);
});

/** Routing is used to get allowed modules of a role **/
app.post(modulePath+"get_role_modules",checkLoggedInAdmin,(req, res)=>{
    var adminPermissions = require(modelPath);
    adminPermissions.getAdminRoleModulesData(req, res);
});

/** Routing is used to update status**/
app.all(modulePath+"update-status/:id/:status",checkLoggedInAdmin,(req, res) => {
	var adminPermissions = require(modelPath);
	adminPermissions.updateStatus(req, res);
});

/** Routing is used to send login credentials **/
app.get(modulePath+"send_login_credentials/:id",checkLoggedInAdmin,(req, res)=>{
    var adminPermissions	= require(modelPath);
    adminPermissions.sendLoginCredentials(req, res);
});
