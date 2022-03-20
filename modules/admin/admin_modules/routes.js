/** Model file path for current plugin **/
var modelPath 	= __dirname+"/model/admin_module";
var modulePath	= "/"+ADMIN_NAME+"/admin_modules/";
const { addModuleValidationRules, validate } = require(__dirname+"/validation/validator.js")
/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
	req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used for list page **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var adminModules = require(modelPath);
	adminModules.list(req, res);
});

/** Routing is used add admin module **/
app.all(modulePath+"add",checkLoggedInAdmin,addModuleValidationRules(),validate,(req, res) => {
	var adminModules = require(modelPath);
	adminModules.add(req, res);
});

/** Routing is used to edit admin module **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,addModuleValidationRules(),validate,(req, res) => {
	var adminModules = require(modelPath);
	adminModules.edit(req, res);
});

/** Routing is used to update status**/
app.all(modulePath+"update-status/:id/:status",checkLoggedInAdmin,(req, res) => {
	var adminModules = require(modelPath);
	adminModules.updateAdminModuleStatus(req, res);
});

/** Routing is used to delete **/
app.all(modulePath+"delete/:id",checkLoggedInAdmin,(req, res) => {
	var adminModules = require(modelPath);
	adminModules.delete(req, res);
});

/** Routing is used to change order of module **/
app.all(modulePath+"change_order",checkLoggedInAdmin,(req, res) => {
	var adminModules = require(modelPath);
	adminModules.changeOrderValue(req, res);
});

