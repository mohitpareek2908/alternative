/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/email_template";
var modulePath	= 	"/"+ADMIN_NAME+"/email_template/";
const { editEmailTemplateRules,validate } = require(__dirname+"/email_template_validation/validator.js")

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
   	req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get email template list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var adminEmailTemplate = require(modelPath);
	adminEmailTemplate.getTemplateList(req, res);
});

/** Routing is used to edit email template **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editEmailTemplateRules(),validate,(req,res,next) => {
	var adminEmailTemplate = require(modelPath);
	adminEmailTemplate.editEmailTemplate(req,res);
});
