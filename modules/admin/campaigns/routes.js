/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/campaigns";
var modulePath	= 	"/"+ADMIN_NAME+"/campaigns/";
const { addValidationRules,editValidationRules, validate } = require(__dirname+"/validation/validator.js")
/** Set current view folder **/
app.use(modulePath,(req,res,next)=>{
   req.rendering.views	=	__dirname + "/views";
   next();
});

/** Routing is used to get ads list **/
app.all(modulePath,checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.getCampaignList(req, res);
});

/** Routing is used to add banner image **/
app.all(modulePath+"add",checkLoggedInAdmin,addValidationRules(),validate,(req,res,next) => {	
    var adminUser = require(modelPath);
    adminUser.addCampaign(req,res,next);
});

/** Routing is used to edit banner image **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editValidationRules(),validate,(req,res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.editCampaign(req,res,next);
});

/** Routing is used to delete baner details **/
app.get(modulePath+"delete/:id",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.deleteCampaign(req, res);
});
/** Routing is used to view ad details **/
app.get(modulePath+"view/:id",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.viewDetail(req, res);
});

/** Routing is used to view ad report **/
app.get(modulePath+"campaign-report/:id",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.campaignReport(req, res);
});


/** Routing is used to update banner status **/
app.all(modulePath+"update_ad_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.updateCampaignStatus(req, res);
});
