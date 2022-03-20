/** Model file path for current plugin **/

var universityModelPath = __dirname+"/model/review_rating";
var modulePath	        = 	"/"+ADMIN_NAME+"/review_rating/";

/** Set current view folder **/
app.use(modulePath,(req,res,next)=>{
   req.rendering.views	=	__dirname + "/views";
   next();
});

/** Routing is used to get review rating list **/
app.all(modulePath+":listing_id?",checkLoggedInAdmin,(req, res)=>{
    var adminUser	= require(universityModelPath);
    adminUser.getReviewRating(req, res);
});


/** Routing is used to view review_rating details **/
app.all(modulePath+"view_event/:id/:listing_id?", checkLoggedInAdmin, (req, res) => {
    var adminUser = require(universityModelPath);
    adminUser.viewReviewRating(req, res);
});


/** Routing is used to approve review raing status **/
app.all(modulePath+"approve_review_rating/:id/:user_id/:user_type_id/:listing_id?", checkLoggedInAdmin, (req, res) => {
    var adminUser = require(universityModelPath);
    adminUser.approveReviewRating(req, res);
});

