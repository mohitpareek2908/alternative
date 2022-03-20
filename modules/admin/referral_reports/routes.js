/** Model file path for current plugin **/
var modelPath   = 	__dirname+"/model/referral_reports";
var modulePath	= 	"/"+ADMIN_NAME+"/referral_reports/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get Referral transaction list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var admin  =require(modelPath);
	admin.getReferralList(req, res);
});

/** Routing is used to export **/
app.all(modulePath+"export_data/:export_type",checkLoggedInAdmin,(req, res, next) => {
    var admin = require(modelPath);
    admin.exportData(req,res, next);
});
