/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/cities";
var modulePath	= 	"/"+ADMIN_NAME+"/cities/";

const { addCityValidationRules,editCityValidationRules,validate} = require(__dirname+"/cities_validation/validator.js")


/** Set current view folder **/
app.use(modulePath,(req,res,next)=>{
   req.rendering.views	=	__dirname + "/views";
   next();
});

/** Routing is used to get cities list **/
app.all(modulePath,checkLoggedInAdmin,(req, res)=>{
    var adminCity	= require(modelPath);
    adminCity.getCityList(req, res);
});

/** Routing is used to add city **/
app.all(modulePath+"add",checkLoggedInAdmin,addCityValidationRules(),validate,(req,res,next) => {	
    var adminCity = require(modelPath);
    consoleLog("Add city route reached ");
    adminCity.addCity(req,res,next);
});

/** Routing is used to edit city **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editCityValidationRules(),validate,(req,res,next)=>{
    var adminCity	= require(modelPath);
    adminCity.editcity(req,res,next);
});

/** Routing is used to update city status **/
app.all(modulePath+"update_city_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res)=>{
    var adminCity	= require(modelPath);
    adminCity.updateCityStatus(req, res);
});

/** Routing is used to get state list country wise **/
app.post(modulePath+"get_state_list_country_wise/:country_id",checkLoggedInAdmin,(req, res)=>{
    var adminCity	= require(modelPath);
    adminCity.getStateListCountryWise(req, res);
});
/** Routing is used to get city list state wise **/
app.post(modulePath+"get_district_list_state_wise/:state_id",checkLoggedInAdmin,(req, res)=>{
    var adminCity	= require(modelPath);
    adminCity.getDistrictListStateWise(req, res);
});


