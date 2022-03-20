/** Model file path for current plugin **/
var modelPath  	=	__dirname+"/model/notification";
var modulePath	= 	"/"+ADMIN_NAME+"/notifications/";

/** Set current view folder **/
app.use(modulePath,(req,res,next) => {
	req.rendering.views	=	__dirname + "/views";
    next();
});

/**Routing is used to show notification listing */
app.all(modulePath,checkLoggedInAdmin,(req,res) => {
	var notifications = require(modelPath);
	notifications.list(req,res);
});

/**Routing is used to get header notificaion */
app.post(modulePath+"get_header_notifications", function(req,res){
	var notifications = require(modelPath);
	notifications.getHeaderNotifications(req,res);
});

/**Routing is used to get header notification counter */
app.post(modulePath+"get_header_notifications_counter", function(req,res){
	var notifications = require(modelPath);
	notifications.getHeaderNotificationsCounter(req,res);
});



