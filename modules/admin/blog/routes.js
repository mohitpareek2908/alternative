/** Model file path for current plugin **/
var modelPath   		=	__dirname+"/model/blog";
var modelCategoryPath   =	__dirname+"/model/category";
var modelTagPath  		=	__dirname+"/model/tag";
var modelCommentPath  	=	__dirname+"/model/comments";
var modulePath			=	"/"+ADMIN_NAME+"/blog/";

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get block list **/
app.all(modulePath+'list',checkLoggedInAdmin,(req, res) => {
    var adminBlock = require(modelPath);
    adminBlock.getBlogList(req, res);
});

/** Routing is used to get block list **/
app.all(modulePath+'delete/:id',checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelPath);
    adminBlock.deleteBlog(req, res, next);
});

/** Routing is used to change blog trending status **/
app.all(modulePath+"update_trending_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelPath);
    adminBlock.updateBlogTrendingStatus(req,res, next);
});

/** Routing is used to change blog featured status **/
app.all(modulePath+"update_featured_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelPath);
    adminBlock.updateBlogFeaturedStatus(req,res, next);
});

/** Routing is used to change blog publish status **/
app.all(modulePath+"update_publish_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelPath);
    adminBlock.updateBlogPublishStatus(req,res, next);
});

/** Routing is used to get tags list **/
app.all(modulePath+'tags_list',checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelPath);
    adminBlock.getBlogTagsList(req, res, next);
});

/** Routing is used to add block **/
app.all(modulePath+"add",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelPath);
    adminBlock.addBlog(req,res, next);
});

/** Routing is used to edit block **/
app.all(modulePath+"edit/:id",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelPath);
    adminBlock.editBlog(req,res, next);
});

/** Routing is used to catgory list **/
app.all(modulePath+"categories/",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelCategoryPath);
    adminBlock.getCategoryList(req,res, next);
});

/** Routing is used to add category **/
app.all(modulePath+"categories/add",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelCategoryPath);
    adminBlock.addCategory(req,res, next);
});

/** Routing is used to edit category **/
app.all(modulePath+"categories/edit/:id",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelCategoryPath);
    adminBlock.editCategory(req,res, next);
});

/** Routing is used to change category status **/
app.all(modulePath+"categories/update_category_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelCategoryPath);
    adminBlock.updateCategoryStatus(req,res, next);
});


/** Routing is used to catgory list **/
app.all(modulePath+"tags/",checkLoggedInAdmin,(req, res, next) => {
    
    var adminBlock = require(modelTagPath);
    adminBlock.getTagsList(req,res, next);
});

/** Routing is used to add category **/
app.all(modulePath+"tags/add",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelTagPath);
    adminBlock.addTag(req,res, next);
});

/** Routing is used to edit category **/
app.all(modulePath+"tags/edit/:id",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelTagPath);
    adminBlock.editTag(req,res, next);
});


/** Routing is used to change category status **/
app.all(modulePath+"tags/update_tag_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelTagPath);
    adminBlock.updateTagStatus(req,res, next);
});

/** Routing is used to get comments list **/
app.all(modulePath+"comments",checkLoggedInAdmin,(req, res, next) => {   
    var adminBlock = require(modelCommentPath);
    adminBlock.getBlogComments(req,res, next);
});

/** Routing is used to add comments **/
app.all(modulePath+"comments/add",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelCommentPath);
    adminBlock.addComment(req,res, next);
});

/** Routing is used to edit category **/
app.all(modulePath+"comments/edit/:id",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelCommentPath);
    adminBlock.editComment(req,res, next);
});

/** Routing is used to reply on user comment **/
app.all(modulePath+"comments/replied_on_comment",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelCommentPath);
    adminBlock.repliedOnUserComment(req,res, next);
});

/** Routing is used to change category status **/
app.all(modulePath+"comments/update_comment_status/:id/:status/:status_type",checkLoggedInAdmin,(req, res, next) => {
    var adminBlock = require(modelCommentPath);
    adminBlock.updateCommentStatus(req,res, next);
});

app.all(modulePath+"generate_blog_site_map",checkLoggedInAdmin,(req, res) => {
    var adminBrand = require(modelPath);
    adminBrand.updateBlogSitemap(req,res);
});
app.all(modulePath+"generate_read_site_map",checkLoggedInAdmin,(req, res) => {
    var adminBrand = require(modelPath);
    adminBrand.updateReadSitemap(req,res);
});

