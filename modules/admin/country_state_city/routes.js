/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/country_state_city";
var modulePath	= 	"/"+ADMIN_NAME+"/country_state_city/";


/** Routing is used to get state list country wise **/
app.all(modulePath+"get_state_list_country_wise/:country_id",checkLoggedInAdmin,(req, res)=>{    
    var adminUser = require(modelPath);
    adminUser.getStateListCountryWise(req, res);
});

app.all(modulePath+"get_age_role_wise_interest/:country_id",checkLoggedInAdmin,(req, res)=>{    
    consoleLog("User roles getUserInterestRoleWise  ");
    var adminUser = require(modelPath);
    adminUser.getUserInterestRoleWise(req, res);
});

/** Routing is used to get city list stste wise **/
app.post(modulePath+"get_city_list_state_wise/:state_id",checkLoggedInAdmin,(req, res)=>{
    var adminUser = require(modelPath);
    adminUser.getCityListStateWise(req, res);
});