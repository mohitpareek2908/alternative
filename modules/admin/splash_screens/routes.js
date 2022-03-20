/** Model file path for current plugin **/
var modelPath   = 	__dirname+"/model/splash_screens";
var modulePath	= 	"/"+ADMIN_NAME+"/splash_screens/";
const { addSplashValidationRules, editSplashValidationRules,validate } = require(__dirname+"/splash_validation/validator.js")


/** Set current view folder **/
app.use(modulePath,(req,res,next)=>{
    req.rendering.views	=	__dirname + "/views";
    next();
 });

/** Routing is used to get splash screen list **/
app.all(modulePath,checkLoggedInAdmin,(req, res)=>{
    var splashScreensItems	= require(modelPath);
    splashScreensItems.getScreensItemList(req, res);
});

/** Routing is used to add splash screen **/
app.all(modulePath+"add",checkLoggedInAdmin,convertMultipartReqBody,addSplashValidationRules(),validate,(req,res,next) => {	
    var splashScreensItems	= require(modelPath);
    splashScreensItems.addScreen(req,res,next);
});

/** Routing is used to edit splash screen **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,convertMultipartReqBody,editSplashValidationRules(),validate,(req,res,next) => {	
    var splashScreensItems	= require(modelPath);
    splashScreensItems.editSplashScreen(req,res,next);
});

/** Routing is used to delete splash screen **/
app.all(modulePath+"delete/:id",checkLoggedInAdmin,(req,res,next) => {	
    var splashScreensItems	= require(modelPath);
    splashScreensItems.deleteScreen(req,res,next);
});

/** Routing is used to add splash screen status **/
app.all(modulePath+"update_splash_screen_status/:id/:status/:status_type",checkLoggedInAdmin,(req,res,next) => {	
    var splashScreensItems	= require(modelPath);
    splashScreensItems.updateSplashScreen(req,res,next);
});
