/** Model file path for current plugin **/
var modelPath   =	__dirname+"/model/states";
var modulePath	= 	"/"+ADMIN_NAME+"/states/";
const { addStateValidationRules,editStateValidationRules,validate } = require(__dirname+"/state_validation/validator.js")

/** Set current view folder **/
app.use(modulePath,(req,res,next)=>{
   req.rendering.views	=	__dirname + "/views";
   next();
});

/** Routing is used to get states list **/
app.all(modulePath,checkLoggedInAdmin,(req, res)=>{
    var adminState	= require(modelPath);
    adminState.getStatesList(req, res);
});

/** Routing is used to add states **/
app.all(modulePath+"add",checkLoggedInAdmin,addStateValidationRules(),validate,(req,res,next) => {	
    var adminState = require(modelPath);
    adminState.addState(req,res,next);
});

/** Routing is used to edit states **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editStateValidationRules(),validate,(req,res,next)=>{
    var adminState	= require(modelPath);
    adminState.editState(req,res,next);
});

/** Routing is used to update states status **/
app.all(modulePath+"update_states_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res)=>{
    var adminState	= require(modelPath);
    adminState.updateStatesStatus(req, res);
});
