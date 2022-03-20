/** Model file path for current plugin **/
var modelPath  = __dirname+"/model/email_action";
var modulePath	= 	"/"+ADMIN_NAME+"/email_actions/";
const { addEmailActionValidationRules, editEmailActionValidationRules,validate } = require(__dirname+"/validation/validator.js")

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get email actions list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var emailActions = require(modelPath);
	emailActions.list(req, res);
});

/** Routing is used to add email actions **/
app.all(modulePath+"add",checkLoggedInAdmin,addEmailActionValidationRules(), validate,(req, res,next) => {
	var emailActions = require(modelPath);
	emailActions.add(req, res,next);
});

/** Routing is used to edit email actions **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editEmailActionValidationRules(), validate,(req, res,next) => {
	var emailActions = require(modelPath);
	emailActions.edit(req, res,next);
});

/** Routing is used to delete email actions **/
app.all(modulePath+"delete/:id",checkLoggedInAdmin,(req, res,next) => {
	var emailActions = require(modelPath);
	emailActions.delete(req, res,next);
});

/** Routing is used to show hidden urls **/
app.get("/"+ADMIN_NAME+"/hidden_urls",checkLoggedInAdmin,(req, res) => {
	/** Set current view folder **/
    req.rendering.views	=	__dirname + "/views";
	res.render('hidden_urls');
});
