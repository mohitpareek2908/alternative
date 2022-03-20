/** Model file path for current plugin **/
var modelPath	=	__dirname+"/model/sms_logs";
var modulePath	= 	"/"+ADMIN_NAME+"/sms_logs/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
   req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get sms logs list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var adminSmsLogs = require(modelPath);
	adminSmsLogs.list(req, res);
});

/** Routing is used to get sms logs list **/
app.all(modulePath+"get_all_sms",checkLoggedInAdmin,(req, res) => {
	var adminSmsLogs = require(modelPath);
	adminSmsLogs.getAllSms(req, res);
});
/** Routing is used to get sms logs list **/
app.all(modulePath+"getMsgData",checkLoggedInAdmin,(req, res) => {
	console.log("in rouste");
	var adminSmsLogs = require(modelPath);
	adminSmsLogs.getMsgData(req, res);
});

/** Routing is used to view sms logs details  **/
app.all(modulePath+"view/:id",checkLoggedInAdmin,(req, res,next) => {
	var adminSmsLogs = require(modelPath);
	adminSmsLogs.viewDetials(req, res,next);
});
