/** Model file path for current plugin **/
var modelPath   = 	__dirname+"/model/category";
var modulePath	= 	"/"+ADMIN_NAME+"/category/";
const { addCategoryValidationRules, editCategoryValidationRules,validate } = require(__dirname+"/category_validation/validator.js")

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get category list **/
app.all(modulePath,checkLoggedInAdmin,(req, res,next) => {
    var adminCms = require(modelPath);
    adminCms.getCategoryList(req, res,next);
});

/** Routing is used to add category **/
app.all(modulePath+"add",checkLoggedInAdmin,addCategoryValidationRules(),validate,(req,res,next) => {
    var adminCms = require(modelPath);
    adminCms.addCategory(req,res);
});

/** Routing is used to edit category **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,editCategoryValidationRules(),validate,(req,res,next) => {
    var adminCms = require(modelPath);
    adminCms.editCategory(req,res,next);
});
/** Routing is used to update status **/
app.all(modulePath+"update_category_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res, next) => {
    var adminCms = require(modelPath);
    adminCms.updateCategoryStatus(req,res, next);
});
