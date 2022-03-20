/** Model file path for current plugin **/
var modelPath   = 	__dirname+"/model/contact";
var modulePath	= 	"/"+ADMIN_NAME+"/contact/";
const { replyValidationRules,validate } = require(__dirname+"/validation/validator.js")


/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to view contact details **/
app.all(modulePath+"view/:id",checkLoggedInAdmin,(req,res,next) => {

	var adminContact  = require(modelPath);
	adminContact.view(req,res,next);
});

/** Routing is used to view contact details **/
app.post(modulePath+"reply/:id",checkLoggedInAdmin,replyValidationRules(),validate,(req,res,next) => {
	consoleLog("reached");
	consoleLog(modulePath+"view/:id");
	var adminContact  = require(modelPath);
	adminContact.reply(req,res,next);
});

/** Routing is used to get contact list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var adminContact  =require(modelPath);
	adminContact.getContactList(req, res);
});
