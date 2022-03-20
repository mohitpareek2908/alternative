/** Model file path for current plugin **/
var modelPath	=	__dirname+"/model/promo_code";
var modulePath	= 	"/"+ADMIN_NAME+"/promo_codes/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
   req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get promo code list **/
app.all(modulePath,checkLoggedInAdmin,(req, res,next) => {
	var adminPromoCode = require(modelPath);
	adminPromoCode.list(req, res);
});

/** Routing is used to add promo code details  **/
app.all(modulePath+"add",checkLoggedInAdmin,(req, res,next) => {
	var adminPromoCode = require(modelPath);
	adminPromoCode.addEditPromoCode(req, res,next);
});

/** Routing is used to update promo code details  **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,(req, res,next) => {
	var adminPromoCode = require(modelPath);
	adminPromoCode.addEditPromoCode(req, res,next);
});

/** Routing is used to view promo code details  **/
app.all(modulePath+"view/:id",checkLoggedInAdmin,(req, res,next) => {
	var adminPromoCode = require(modelPath);
	adminPromoCode.view(req, res,next);
});

/** Routing is used to update promo code status  **/
app.all(modulePath+"update-status/:id/:status",checkLoggedInAdmin,(req, res,next) => {
	var adminPromoCode = require(modelPath);
	adminPromoCode.updatePromoCodeStatus(req, res,next);
});

/** Routing is used to update  export user details **/
app.all(modulePath+"export_data/:export_type",checkLoggedInAdmin,(req, res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.exportData(req,res,next);
});
/** Routing is used to update  export user details **/
app.all(modulePath+"update_multiple_status",checkLoggedInAdmin,(req, res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.updateMultipleStatus(req,res,next);
});

/** Routing is used to delete promo code details  **/
app.all(modulePath+"delete/:id",checkLoggedInAdmin,(req, res,next) => {
	var adminPromoCode = require(modelPath);
	adminPromoCode.deletePromoCode(req, res,next);
});

/** Routing is used to get user list  **/
app.all(modulePath+"get_user_list",checkLoggedInAdmin,(req,res,next)=>{
	var adminPromoCode = require(modelPath);
	adminPromoCode.getUserListUserTypeWise(req, res,next);
});
