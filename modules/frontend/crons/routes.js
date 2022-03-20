/** Model file path for current plugin **/
var modelPath   		= 	__dirname+"/model/crons";
var modulePath			= 	"/"+FRONT_END_FOLDER_NAME+"/crons/";

/** Routing is used to expired vehicle documents  **/
app.get(modulePath+"expire_vehicle_document",(req, res)=>{
    var model	= require(modelPath);
    model.expireVehicleDocument(req,res,next);
});

/**  */
/** Routing is used to send broadcast send message   **/
app.get(modulePath+"broadcast_send_message",(req, res)=>{
    var model	= require(modelPath);
    model.broadcastSendMessage(req,res);
}); 

app.get(modulePath+"sendPostNotificationToFollowers",(req, res)=>{ 
    var model	= require(modelPath);
    model.sendPostNotificationToFollowers(req,res);
}); 


// app.get(modulePath+"getDataReverse",(req, res)=>{ 
    // var model	= require(modelPath);
    // model.getDataReverse(req,res); 
// }); 

app.get(modulePath+"getAlternateDataReverse",(req, res)=>{ 
    var model	= require(modelPath);
    model.getAlternateDataReverse(req,res); 
}); 

app.get(modulePath+"getDataForward",(req, res)=>{ 
    var model	= require(modelPath);
    model.getDataForward(req,res); 
}); 


app.get(modulePath+"getSitemapXmls",(req, res)=>{ 
    var model	= require(modelPath);
    model.getSitemapXmls(req,res);
}); 

app.get(modulePath+"getProductUrls",(req, res)=>{ 
    var model	= require(modelPath);
    model.getProductUrls(req,res); 
}); 

app.get(modulePath+"getProductCategoriesUrls",(req, res)=>{ 
    var model	= require(modelPath);
    model.getProductCategoriesUrls(req,res); 
});

app.get(modulePath+"getProductPlatformUrls",(req, res)=>{ 
    var model	= require(modelPath);
    model.getProductPlatformUrls(req,res); 
});

app.get(modulePath+"cronsettng",(req, res)=>{ 
    var model	= require(modelPath);
    model.cronSetting(req,res);
}); 

app.get(modulePath+"cronsettng2",(req, res)=>{ 
    var model	= require(modelPath);
    model.cronSetting2(req,res);
}); 

app.get(modulePath+"getCategories",(req, res)=>{ 
    var model	= require(modelPath);
    model.getCategories(req,res);
}); 

app.get(modulePath+"getPlatforms",(req, res)=>{ 
    var model	= require(modelPath);
    model.getPlatforms(req,res);
}); 

app.get(modulePath+"cronSanitizeSetting",(req, res)=>{ 
    var model	= require(modelPath);
    model.cronSanitizeSetting(req,res);
}); 

app.get(modulePath+"testTags",(req, res)=>{ 
    var model	= require(modelPath);
    model.testTags(req,res);
}); 

app.get(modulePath+"test",(req, res,next)=>{ 
    var model	= require(modelPath);
    model.test(req,res,next);
}); 

app.get(modulePath+"addSequenceNumber",(req, res)=>{ 
    var model	= require(modelPath);
    model.addSequenceNumber(req,res);
}); 

app.get(modulePath+"cronMergeDataSetting",(req, res)=>{ 
    var model	= require(modelPath);
    model.cronMergeDataSetting(req,res);
}); 