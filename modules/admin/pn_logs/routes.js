/** Model file path for current plugin **/
var modelPath	=	__dirname+"/model/pn_logs";
var modulePath	= 	"/"+ADMIN_NAME+"/pn_logs/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
   req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get pn logs list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var adminPnLogs = require(modelPath);
	adminPnLogs.list(req, res);
});

/** Routing is used to view pn logs details  **/
app.all(modulePath+"view/:id",checkLoggedInAdmin,(req, res) => {
	var adminPnLogs = require(modelPath);
	adminPnLogs.viewDetials(req, res);
});
