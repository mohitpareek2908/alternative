var modelPath       	=	__dirname+"/model/home";
var modelPathContact	=	__dirname+"/model/contact";
var modulePath			= 	FRONT_END_NAME;
const { addValidationRules, validate } = require(__dirname+"/validation/validator.js")

/** Set current view folder **/
app.use(modulePath,(req, res, next) => {
    req.rendering.views	=	__dirname + "/views";
    next();
});

/** Routing is used to get Product List page data*/
app.get(modulePath ,(req, res)=>{
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.productHomeData(req,res);		
});

/** Routing is used to get about page data*/
app.get(modulePath+"about",(req, res)=>{
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.aboutUsPage(req,res);	
});

/** Routing is used to get faq page data*/
app.all(modulePath+"faq",(req, res)=>{
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.faqPage(req,res);	
});

/** Routing is used to get faq-search page data*/
app.all(modulePath+"faq-search",(req, res)=>{
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.faqPageSearch(req,res);	
});


/** Routing is used to contact page  **/
app.all(FRONT_END_NAME+'contact',(req, res,next)=>{	

    var contactModel	= require(modelPathContact);
    contactModel.contactUs(req, res,next);
});

/** Routing is used to contact page  **/
app.all(FRONT_END_NAME+'contact-us',addValidationRules(),validate,(req, res,next)=>{	

    var contactModel	= require(modelPathContact);
    contactModel.contactUsSubmit(req, res,next);
});


/** Routing is used to newsletter page  **/
app.all(FRONT_END_NAME+'news_letter',(req, res,next)=>{	
	let homeModel 		= require(modelPath);
   req.rendering.views	=	__dirname + "/views";
	homeModel.newsletterSubscribe(req,res);	
});


/** Routing is used to CMS page  **/
app.all(modulePath+'pages/:slug',(req, res)=>{	
    var homeModel	= require(modelPath);
    homeModel.cmsDetail(req, res);
});


/** Routing is used to get product Listing data*/
app.all(modulePath+"products",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.productListData(req,res);	
});

/** Routing is used to get Platform Listing data*/
app.all(modulePath+"platforms",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.platformsListData(req,res);	
});

/** Routing is used to get Category Listing data*/
app.all(modulePath+"categories",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.categoriesListData(req,res);	
});

/** Routing is used to get Tags Listing data*/
app.all(modulePath+"tags",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.tagsListData(req,res);	
});

/** Routing is used to Features Listing page data*/
app.all(modulePath+"features",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.featuresListData(req,res);	
});


/** Routing is used to get Product Detail page data*/
app.all(modulePath+"product-details/:slug",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.productDetailsData(req,res);	
});

/** Routing is used to get Product Listing by taxonomy wise page data*/
app.all(modulePath+"product-list/:flag/:slug",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.productTaxonomyListData(req,res);	
});



/** Routing is used to get Product searching page*/
app.all(modulePath+"product-search",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.productCompleteSearch(req,res);	
});

/** Routing is used to get Product alternative page*/
app.all(modulePath+"product-alternative/:slug",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.productAlternativeData(req,res);	
});

/** Routing is used to get Product alternative page*/
app.all(modulePath+"add-review/:id",(req, res)=>{
	
	let homeModel 		= require(modelPath);
	req.rendering.views	=	__dirname + "/views";
	homeModel.addReviewrating(req,res);	
});