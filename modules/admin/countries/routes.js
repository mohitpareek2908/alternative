/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/countries";
var modulePath	= 	"/"+ADMIN_NAME+"/countries/";
const { addCountryValidationRules,editCountryValidationRules,validate } = require(__dirname+"/countries_validation/validator.js")

/** Set current view folder **/
app.use(modulePath,(req,res,next)=>{
   req.rendering.views	=	__dirname + "/views";
   next();
});

/** Routing is used to get countries list **/
app.all(modulePath,checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.getCountryList(req, res);
});

/** Routing is used to add country **/
app.all(modulePath+"add",checkLoggedInAdmin,addCountryValidationRules(),validate,(req,res,next) => {	
    var adminUser = require(modelPath);
    adminUser.addCountry(req,res,next);
});

/** Routing is used to edit country **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editCountryValidationRules(),validate,(req,res,next)=>{
    var adminUser	= require(modelPath);
    adminUser.editCountry(req,res,next);
});

/** Routing is used to update country status **/
app.all(modulePath+"update_country_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(modelPath);
    adminUser.updateCountryStatus(req, res);
});
