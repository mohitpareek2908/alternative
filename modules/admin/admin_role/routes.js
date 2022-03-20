/** Model file path for current plugin **/
var modelPath  	= __dirname+"/model/admin_role";
var modulePath	= "/"+ADMIN_NAME+"/admin_role/";
const { addRoleValidationRules,editRoleValidationRules, assignCategoryToRole, validate } = require(__dirname+"/role_validation/validator.js")


/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/**Routing is used to show list of roles */
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var adminRole = require(modelPath);
	adminRole.list(req, res);
});

/**Routing is used to add roles */
app.all(modulePath+"add",checkLoggedInAdmin,addRoleValidationRules(),validate,(req, res) => {
	var adminRole = require(modelPath);
	adminRole.add(req, res);
});

/**Routing is used to edit roles */
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editRoleValidationRules(),validate,(req, res) => {
	var adminRole = require(modelPath);
	adminRole.edit(req, res);
});

/**Routing is used to delete roles */
app.all(modulePath+"delete/:id",checkLoggedInAdmin,(req, res) => {
	var adminRole = require(modelPath);
	adminRole.delete(req, res);
});

/**Routing is used to delete roles */
app.post(modulePath+"get_category_list",checkLoggedInAdmin,(req, res) => {
	var adminRole = require(modelPath);
	adminRole.getCategoryList(req, res);
});

/**Routing is used to delete roles */
app.all(modulePath+"assign_category",checkLoggedInAdmin,assignCategoryToRole(),validate, (req, res) => {
	var adminRole = require(modelPath);
	adminRole.assignCategory(req, res);
});
