/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/banner";
var modulePath	= 	"/"+ADMIN_NAME+"/banner/";
const { addBannerValidationRules, editBannerValidationRules,validate } = require(__dirname+"/banner_validation/validator.js")


/** Set current view folder **/
app.use(modulePath,(req,res,next)=>{
   req.rendering.views	=	__dirname + "/views";
   next();
});

/** Routing is used to get banner list **/
//~ app.all(modulePath+":type?",checkLoggedInAdmin,(req, res)=>{
app.all(modulePath,checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.getBannerList(req, res);
});

/** Routing is used to add banner image **/
app.all(modulePath+"add",checkLoggedInAdmin,addBannerValidationRules(),validate,(req,res,next) => {	
    var adminUser = require(modelPath);
    adminUser.addBanner(req,res,next);
});

/** Routing is used to edit banner image **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,(req,res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.editBannerImage(req,res,next);
});

/** Routing is used to delete baner details **/
app.get(modulePath+"delete/:id",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.deleteBanner(req, res);
});

/** Routing is used to update banner status **/
app.all(modulePath+"update_baner_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.updateBannerStatus(req, res);
});



/** Routing is used to export orders pdf **/
app.all(modulePath+"export_pdf/:id",(req, res,next)=>{
    var adminOrder	= require(modelPath);
    adminOrder.exportDataPDFOrder(req, res,next);
}); 
/** Routing is used to export orders pdf **/
app.all(modulePath+"download_pdf/:id",(req, res,next)=>{
    var adminOrder	= require(modelPath);
    adminOrder.downloadOrderPdf(req, res,next);
});
