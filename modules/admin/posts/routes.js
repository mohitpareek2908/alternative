/** Model file path for current plugin **/
var modelPath   = 	__dirname+"/model/posts";
var modulePath	= 	"/"+ADMIN_NAME+"/posts/";

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
app.get(modulePath+"user-posts/:id",checkLoggedInAdmin,(req, res, next) => {
    consoleLog("Rouet is found");
    var admin = require(modelPath);
    admin.getPostReportList(req,res, next);
});


/** Routing is used to export **/
app.all(modulePath+"view/:id",checkLoggedInAdmin,(req, res, next) => {
    var admin = require(modelPath);
    admin.viewPostDetail(req,res, next);
});

/** Routing is used to update status **/
app.all(modulePath+"update_post_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.updatePostStatus(req, res);
});

