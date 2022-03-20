/** Model file path for current plugin **/
var modelPath	=	__dirname+"/model/locations";
var modulePath	= 	"/"+ADMIN_NAME+"/locations/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
   req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get promo code list **/
app.all(modulePath+"workable_locations",checkLoggedInAdmin,(req, res,next) => {
	var adminVehicles = require(modelPath);
	adminVehicles.list(req,res,next);
});

/** Routing is used to add promo code details  **/
app.all(modulePath+"add",checkLoggedInAdmin,(req, res,next) => {
	var adminVehicles = require(modelPath);
	adminVehicles.addLocation(req, res,next);
});

/** Routing is used to update promo code details  **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,(req, res,next) => {
	var adminVehicles = require(modelPath);
	adminVehicles.editLocationWorkable(req, res,next);
});

/** Routing is used to view location details  **/
app.get(modulePath+"view/:id",checkLoggedInAdmin,(req, res,next) => {
	var adminVehicles = require(modelPath);
	adminVehicles.viewLocation(req, res,next);
});

/** Routing is used to update location status  **/
app.get(modulePath+"update_status/:id/:status",checkLoggedInAdmin,(req, res,next) => {
	var adminVehicles = require(modelPath);
	adminVehicles.updateLocationStatus(req, res,next);
});
