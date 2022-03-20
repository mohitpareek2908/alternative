/** Model file path for current plugin **/
var modelPath	=	__dirname+"/model/text_setting";
var modulePath	= 	"/"+ADMIN_NAME+"/text-setting/";
const { addTextSettingValidationRules,validate } = require(__dirname+"/validation/validator.js")
/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get text setting list **/
app.all(modulePath+":type",checkLoggedInAdmin,(req, res)=>{
    var adminTextSetting 	= require(modelPath);
    adminTextSetting.getTextSettingList(req, res);
});

/** Routing is used to add text setting **/
app.all(modulePath+":type/add",checkLoggedInAdmin,addTextSettingValidationRules(), validate,(req,res,next)=>{
    var adminTextSetting 	= require(modelPath);
    adminTextSetting.addTextSetting(req, res);
});

/** Routing is used to edit text setting **/
app.all(modulePath+":type/edit/:id",checkLoggedInAdmin,addTextSettingValidationRules(), validate, (req, res, next)=>{
    var adminTextSetting = require(modelPath);
    adminTextSetting.editTextSetting(req, res);
});
