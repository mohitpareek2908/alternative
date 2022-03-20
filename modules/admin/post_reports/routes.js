/** Model file path for current plugin **/
var modelPath   = 	__dirname+"/model/post_reports";
var modulePath	= 	"/"+ADMIN_NAME+"/post_reports/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get Referral transaction list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var admin  =require(modelPath);
	admin.getPostReportList(req, res);
});

/** Routing is used to export **/
app.all(modulePath+"view/:id",checkLoggedInAdmin,(req, res, next) => {
    var admin = require(modelPath);
    admin.viewPostReport(req,res, next);
});
