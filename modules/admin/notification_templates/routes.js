/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/notification_templates";
var modulePath	= 	"/"+ADMIN_NAME+"/notification_templates/";
const { editNotificationTemplateRules,validate } = require(__dirname+"/notification_template_validation/validator.js")

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
   	req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get notification template list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var adminTemplate = require(modelPath);
	adminTemplate.getTemplateList(req, res);
});

/** Routing is used to edit notification template **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editNotificationTemplateRules(),validate,(req, res) => {
	var adminTemplate = require(modelPath);
	adminTemplate.editNotificationTemplate(req,res);
});
