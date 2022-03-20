/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/email_log";
var modulePath	= 	"/"+ADMIN_NAME+"/email_logs/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
   req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get email logs list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var adminEmailLogs = require(modelPath);
	adminEmailLogs.list(req, res);
});

/** Routing is used to view email log details **/
app.all(modulePath+"view/:id",checkLoggedInAdmin,(req, res) => {
	var adminEmailLogs = require(modelPath);
	adminEmailLogs.viewDetials(req, res);
});
