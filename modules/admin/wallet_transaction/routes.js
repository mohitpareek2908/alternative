/** Model file path for current plugin **/
var modelPath   = 	__dirname+"/model/wallet_transaction";
var modulePath	= 	"/"+ADMIN_NAME+"/wallet_transaction/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get wallet transaction list **/
app.all(modulePath,checkLoggedInAdmin,(req, res) => {
	var admin  =require(modelPath);
	admin.getWalletTransaction(req, res);
});

/** Routing is used to export **/
app.all(modulePath+"export_data/:export_type",checkLoggedInAdmin,(req, res, next) => {
    var admin = require(modelPath);
    admin.exportData(req,res, next);
});
