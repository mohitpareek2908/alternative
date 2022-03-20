var async	=	require('async');
function Home() {
		
		/**
			* Function for home page details
		*/
		this.getHomePageDetails	=	function(req, res, next, callback) {
			var blockCollection=	db.collection(TABLE_BLOCK);
			async.parallel({
				/**function for first block data list * */
				first_block: (callback) => {
					blockCollection.findOne({ "page_slug": "first-block" },{projection : {page_name:1, block_name:1, description:1 }},(err, result)=>{					
						var finalResponse={'data':{
							status 		:	STATUS_SUCCESS,
							result		:	result,
							message		:	"",
						}};
						callback(null, finalResponse);
					});
				},
				/**function for second block data list * */
				second_block: (callback) => {
					blockCollection.findOne({ "page_slug": "second-block" },{projection : {page_name:1, block_name:1, description:1 }},(err, result)=>{					
						var finalResponse={'data':{
							status 		:	STATUS_SUCCESS,
							result		:	result,
							message		:	"",
						}};
						callback(null, finalResponse);
					});
				},
				/**function for first third data list * */
				third_block: (callback) => {
					blockCollection.findOne({ "page_slug": "third-block" },{projection : {page_name:1, block_name:1, description:1 }},(err, result)=>{					
						var finalResponse={'data':{
							status 		:	STATUS_SUCCESS,
							result		:	result,
							message		:	"",
						}};
						callback(null, finalResponse);
					});
				},
				/**function for fourth block data list * */
				fourth_block: (callback) => {
					blockCollection.findOne({ "page_slug": "fourth-block" },{projection : {page_name:1, block_name:1, description:1 }},(err, result)=>{					
						var finalResponse={'data':{
							status 		:	STATUS_SUCCESS,
							result		:	result,
							message		:	"",
						}};
						callback(null, finalResponse);
					});
				},
			}, (err, response)=>{
				if(!err){
					var finalResponse={'data':{
						status				:	STATUS_SUCCESS,
						result				:	{
													first_block		:	(response['first_block'].data.result)	?	response['first_block'].data.result		:	{},
													second_block	:	(response['second_block'].data.result)	?	response['second_block'].data.result	:	{},
													third_block		:	(response['third_block'].data.result)	?	response['third_block'].data.result		:	{},
													fourth_block	:	(response['fourth_block'].data.result)	?	response['fourth_block'].data.result	:	{},
												},
						message				:	"",
					}};
					callback(finalResponse);
				}else{
					var finalResponse={'data':{
						status		:	API_STATUS_ERROR,
						result		:	[],
						message		: 	res.__("admin.system.something_going_wrong_please_try_again")
					}};
					callback(finalResponse);
				}
			});
		};
		
		
		
		
		
		
		
		/**
			* Function for footer data
		*/
		this.getFooterDetails		=	function(req, res, next, callback) {
			var blockCollection		=	db.collection(TABLE_BLOCK);
			var settingsCollection	= 	db.collection(TABLE_SETTINGS);
			async.parallel({
				/**function for footer block data list * */
				block: (callback) => {
					blockCollection.findOne({ "page_slug": "footer" },{projection : {page_name:1, block_name:1, description:1 }},(err, result)=>{
						var finalResponse={'data':{
							status 		:	STATUS_SUCCESS,
							result		:	result,
							message		:	"",
						}};
						callback(null, finalResponse);
					});
				},
				/**function for social setting list * */
				settings: (callback) => {
					settingsCollection.find({
						"type": {$in : CONDITION_SETTING},
					}, { key_value: 1, value: 1 }).toArray(function (err, result) {
						var dataJson = {};
						for (var i = 0; i < result.length; i++) {
							dataJson[result[i]['key_value']] = result[i]['value']
						}

						var finalResponse = {
							'data': {
								status: STATUS_SUCCESS,
								result: dataJson,
								message: "",
							}
						};
						callback(null, finalResponse);
					});
				},
			}, (err, response)=>{
				if(!err){
					var finalResponse={'data':{
						status				:	STATUS_SUCCESS,
						slider_image_url	:	SLIDERS_URL,
						result				:	{													
													footer_block		:	(response['block'].data.result)		?	response['block'].data.result		:	{},
													settings_data		:	(response['settings'].data.result)	?	response['settings'].data.result	:	{},
												},
						message				:	"",
					}};
					callback(finalResponse);
				}else{
					var finalResponse={'data':{
						status		:	API_STATUS_ERROR,
						result		:	[],
						message		: 	res.__("admin.system.something_going_wrong_please_try_again")
					}};
					callback(finalResponse);
				}
			});
		};
}
module.exports = new Home();
