BREADCRUMBS = {

	/** DASHBOARD SECTION**/
	'admin/dashboard' : [{name:'Dashboard',url:'',icon:'dashboard'}],

	/**EDIT PROFILE SECTION**/
	'admin/user_profile/edit' : [{name:'Edit profile',url:'',icon:'mode_edit'}],

	/**USER MANAGEMENT SECTION**/
	'admin/users/list' 	: 	[{name:'dynamic_variable Management',url:'',icon:'person'}],
	'admin/users/edit' 	: 	[{name:'dynamic_variable Management',url:WEBSITE_ADMIN_URL+'users/{dynamic_variable}',icon:'person'},{name:'Edit dynamic_variable',url:'',icon:'mode_edit'}],
	'admin/users/add'	: 	[{name:'dynamic_variable Management',url:WEBSITE_ADMIN_URL+'users/{dynamic_variable}',icon:'person'},{name:'Add dynamic_variable',url:'',icon:'add'}],
	'admin/users/view' 	:	[{name:'dynamic_variable Management',url:WEBSITE_ADMIN_URL+'users/{dynamic_variable}',icon:'person'},{name:'View dynamic_variable',url:'',icon:'find_in_page'}],

	/**CMS SECTION**/
	'admin/cms/list' :	[{name:'CMS Management',url:'',icon:'picture_in_picture'}],
	'admin/cms/edit' : 	[{name:'CMS Management',url:WEBSITE_ADMIN_URL+'cms',icon:'picture_in_picture'},{name:'Edit CMS',url:'',icon:'mode_edit'}],
	'admin/cms/add'	 : 	[{name:'CMS Management',url:WEBSITE_ADMIN_URL+'cms',icon:'picture_in_picture'},{name:'Add CMS',url:'',icon:'add'}],

	/**BLOCK SECTION**/
	'admin/block/list' 	: [{name:'Block Management',url:'',icon:'chrome_reader_mode'}],
	'admin/block/edit' 	: [{name:'Block Management',url:WEBSITE_ADMIN_URL+'block',icon:'chrome_reader_mode'},{name:'Edit block',url:'',icon:'mode_edit'}],
	'admin/block/add' 	: [{name:'Block Management',url:WEBSITE_ADMIN_URL+'block',icon:'chrome_reader_mode'},{name:'Add block',url:'',icon:'add'}],

	/**TEXT SETTING SECTION**/
	'admin/text_setting/list' : [{name:'dynamic_variable',url:'',icon:'text_format'}],
	'admin/text_setting/edit' : [{name:'dynamic_variable',url:WEBSITE_ADMIN_URL+'text-setting/{dynamic_variable}',icon:'text_format'},{name:'Edit Text Setting',url:'',icon:'mode_edit'}],
	'admin/text_setting/add' : [{name:'dynamic_variable',url:WEBSITE_ADMIN_URL+'text-setting/{dynamic_variable}',icon:'text_format'},{name:'Add Text Setting',url:'',icon:'add'}],

	/**EMAIL MANAGEMENT SECTION**/
	'admin/email_template/list' : [{name:'Email Templates',url:'',icon:'contact_mail'}],
	'admin/email_template/edit' : [{name:'Email Templates',url:WEBSITE_ADMIN_URL+'email_template',icon:'contact_mail'},{name:'Edit email template',url:'',icon:'mode_edit'}],

	/**SETTING MANAGEMENT SECTION**/
	'admin/setting/list' 	: [{name:'Settings',url:'',icon:'settings'}],
	'admin/setting/add'  	: [{name:'Settings',url:WEBSITE_ADMIN_URL+'settings',icon:'settings'},{name:'Add Setting',url:'',icon:'add'}],
	'admin/setting/edit' 	: [{name:'Settings',url:WEBSITE_ADMIN_URL+'settings',icon:'settings'},{name:'Edit Setting',url:'',icon:'mode_edit'}],
	'admin/setting/prefix' 	: [{name:'dynamic_variable',url:'',icon:'settings'}],

	/**MASTER MANAGEMENT SECTION**/
	'admin/master/list' : [{name:'dynamic_variable',url:'',icon:'subject'}],
	'admin/master/add' 	: [{name:'dynamic_variable',url:WEBSITE_ADMIN_URL+'master/{dynamic_variable}',icon:'subject'},{name:'Add',url:'',icon:'add'}],
	'admin/master/edit' : [{name:'dynamic_variable',url:WEBSITE_ADMIN_URL+'master/{dynamic_variable}',icon:'subject'},{name:'Edit',url:'',icon:'mode_edit'}],
	'admin/master/view' : [{name:'dynamic_variable',url:WEBSITE_ADMIN_URL+'master/{dynamic_variable}',icon:'subject'},{name:'View',url:'',icon:'find_in_page'}],

	/**ADMIN ROLE SECTION**/
	'admin/admin_role/list' : [{name:'Manage Roles',url:'',icon:'security'}],
	'admin/admin_role/add'  : [{name:'Manage Roles',url:WEBSITE_ADMIN_URL+'admin_role',icon:'security'},{name:'Add Role',url:'',icon:'add'}],
	'admin/admin_role/edit' : [{name:'Manage Roles',url:WEBSITE_ADMIN_URL+'admin_role',icon:'security'},{name:'Edit Role',url:'',icon:'edit'}],

	/**ADMIN PERMISSIONS SECTION**/
	'admin/admin_permissions/list' : [{name:'Sub-admin',url:'',icon:'perm_data_setting'}],
	'admin/admin_permissions/add'  : [{name:'Sub-admin',url:WEBSITE_ADMIN_URL+'admin_permissions',icon:'perm_data_setting'},{name:'Add Sub-admin ',url:'',icon:'add'}],
	'admin/admin_permissions/edit' : [{name:'Sub-admin',url:WEBSITE_ADMIN_URL+'admin_permissions',icon:'perm_data_setting'},{name:'Edit Sub-admin ',url:'',icon:'edit'}],
	'admin/admin_permissions/view' : [{name:'Sub-admin',url:WEBSITE_ADMIN_URL+'admin_permissions',icon:'perm_data_setting'},{name:'View Sub-admin ',url:'',icon:'find_in_page'}],

	/** ADMIN MODULES SECTION**/
	'admin/admin_modules/list' : [{name:'Admin Modules',url:'',icon:'pages'}],
	'admin/admin_modules/add'  : [{name:'Admin Modules',url:WEBSITE_ADMIN_URL+'admin_modules',icon:'pages'},{name:'Add Admin Modules',url:'',icon:'add'}],
	'admin/admin_modules/edit' : [{name:'Admin Modules',url:WEBSITE_ADMIN_URL+'admin_modules',icon:'pages'},{name:'Edit Admin Modules',url:'',icon:'edit'}],

	/** PN LOGS SECTION**/
	'admin/sms_logs/list' : [{name:'Sms Logs',url:'',icon:'textsms'}],
	'admin/sms_logs/view' : [{name:'Sms Logs',url:WEBSITE_ADMIN_URL+'sms_logs',icon:'textsms'},{name:'Sms Log Details',url:'',icon:'find_in_page'}],
	
	/** Sms LOGS SECTION**/
	'admin/pn_logs/list' : [{name:'Pn Logs',url:'',icon:'view_agenda'}],
	'admin/pn_logs/view' : [{name:'Pn Logs',url:WEBSITE_ADMIN_URL+'pn_logs',icon:'view_agenda'},{name:'Pn Log Details',url:'',icon:'find_in_page'}],

	/** EMAIL LOGS SECTION**/
	'admin/email_logs/list' : [{name:'Email Logs',url:'',icon:'mail_outline'}],
	'admin/email_logs/view' : [{name:'Email Logs',url:WEBSITE_ADMIN_URL+'email_logs',icon:'mail_outline'},{name:'Email Logs Details',url:'',icon:'find_in_page'}],

	/** EMAIL ACTIONS SECTION**/
	'admin/email_actions/list' : [{name:'Email Actions',url:'',icon:'dvr'}],
	'admin/email_actions/add'  : [{name:'Email Actions',url:WEBSITE_ADMIN_URL+'email_actions',icon:'dvr'},{name:'Add Email Actions',url:'',icon:'add'}],
	'admin/email_actions/edit' : [{name:'Email Actions',url:WEBSITE_ADMIN_URL+'email_actions',icon:'dvr'},{name:'Edit Email Actions',url:'',icon:'edit'}],

	/** NOTIFICATION SECTION**/
	'admin/notification/list' : [{name:'Notification Management',url:'',icon:'notifications'}],
	
	/**PROMO CODE MANAGEMENT SECTION**/
	'admin/promo_code/list' :	[{name:'Promo Code Management',url:'',icon:'style'}],
	'admin/promo_code/edit' : 	[{name:'Promo Code Management',url:WEBSITE_ADMIN_URL+'promo_codes',icon:'style'},{name:'Edit Promo Code',url:'',icon:'mode_edit'}],
	'admin/promo_code/add'	: 	[{name:'Promo Code Management',url:WEBSITE_ADMIN_URL+'promo_codes',icon:'style'},{name:'Add Promo Code',url:'',icon:'add'}],
	'admin/promo_code/view'	:	[{name:'Promo Code Management',url:WEBSITE_ADMIN_URL+'promo_codes',icon:'style'},{name:'View Promo Code Details',url:'',icon:'find_in_page'}],

	
	/**BANNER SECTION**/
	'admin/banner/list' :	[{name:'Banner',url:'',icon:'picture_in_picture'}],
	'admin/banner/add'	: 	[{name:'Banner',url:WEBSITE_ADMIN_URL+'banner',icon:'picture_in_picture'},{name:'Add',url:'',icon:'add'}],
	'admin/banner/edit' :	[{name:'Banner',url:WEBSITE_ADMIN_URL+'banner',icon:'picture_in_picture'},{name:'Edit',url:'',icon:'mode_edit'}],	
	
	/** NEWSLETTER SUBSCRIBER SECTION **/
	'admin/newsletter_subscribers/list': [{ name: 'Newsletter Subscriber', url: '', icon: 'chrome_reader_mode' }],
	'admin/newsletter_subscribers/edit': [{ name: 'Newsletter Subscriber', url: WEBSITE_ADMIN_URL + 'newsletter_subscribers', icon: 'chrome_reader_mode' }, { name: 'Edit Newsletter Subscribers', url: '', icon: 'mode_edit' }],
	'admin/newsletter_subscribers/add': [{ name: 'Newsletter Subscriber', url: WEBSITE_ADMIN_URL + 'newsletter_subscribers', icon: 'chrome_reader_mode' }, { name: 'Add Newsletter Subscribers', url: '', icon: 'add' }],
	
	/** CONTACT SECTION**/
	'admin/contact/list': [{ name: 'Contact Management', url: '', icon: 'person' }],
	'admin/contact/view': [{ name: 'Contact Management', url: WEBSITE_ADMIN_URL + 'contact', icon: 'person' }, { name: 'View', url: '', icon: 'find_in_page' }],

	
	
	/**FAQ SECTION**/
	'admin/faq/list': [{ name: 'Faq Management', url: '', icon: 'question_answer' }],
	'admin/faq/edit': [{ name: 'Faq Management', url: WEBSITE_ADMIN_URL + 'faq', icon: 'question_answer' }, { name: 'Edit Faq', url: '', icon: 'mode_edit' }],
	'admin/faq/add': [{ name: 'Faq Management', url: WEBSITE_ADMIN_URL + 'faq', icon: 'question_answer' }, { name: 'Add Faq', url: '', icon: 'add' }],
	'admin/faq/view': [{ name: 'Faq Management', url: WEBSITE_ADMIN_URL + 'faq', icon: 'question_answer' }, { name: 'View Faq', url: '', icon: 'find_in_page' }],
	
	/**BANNER SECTION**/		
	'admin/splash_screens/list' 			:	[{name:'Splash Screens',url:'',icon:'fullscreen'}],
	'admin/splash_screens/add'				:	[{name:'Splash Screens',url:WEBSITE_ADMIN_URL+'splash_screens',icon:'fullscreen'},{name:'Add Screen',url:'',icon:'add'}],
	'admin/splash_screens/edit'				:	[{name:'Splash Screens',url:WEBSITE_ADMIN_URL+'splash_screens',icon:'fullscreen'},{name:'Edit Screen',url:'',icon:'mode_edit'}],
	'admin/splash_screens/view'				:	[{name:'Splash Screens',url:WEBSITE_ADMIN_URL+'splash_screens',icon:'fullscreen'},{name:'View Screen',url:'',icon:'find_in_page'}],
	
	
	/** REFERRAL REPORTS SECTION**/
	'admin/referral_reports/list': [{ name: 'Referral Reports', url: '', icon: 'account_balance_wallet' }],	

	/** CANCEL TRIP  REPORTS SECTION**/
	'admin/cancel_trip_reports/list': [{ name: 'Cancel Trip Reports', url: '', icon: 'account_balance_wallet' }],	

	/** CANCEL TRIP ACCEPPTANCE  REPORTS SECTION**/
	'admin/trip_acceptance_reports/list': [{ name: 'Trip Acceptance Reports', url: '', icon: 'account_balance_wallet' }],	

	/** Update profile requests**/
	'admin/update_profile_requests/list': [{ name: 'Update Profile Requests', url: '', icon: 'fullscreen' }],
	'admin/update_profile_requests/add': [{ name: 'Update Profile Requests', url: WEBSITE_ADMIN_URL + 'update_profile_requests', icon: 'fullscreen' },{ name: 'Add Update Profile Request', url: '', icon: 'add' }],
	'admin/update_profile_requests/view': [{ name: 'Update Profile Requests', url: WEBSITE_ADMIN_URL + 'update_profile_requests', icon: 'fullscreen' },{ name: 'View', url: '', icon: 'find_in_page' }],
	
	/**NOTIFICATION MANAGEMENT SECTION**/
	'admin/notification_templates/list' : [{name:'Notification Templates',url:'',icon:'contact_mail'}],
	'admin/notification_templates/edit' : [{name:'Notification Templates',url:WEBSITE_ADMIN_URL+'notification_templates',icon:'contact_mail'},{name:'Edit Notification Template',url:'',icon:'mode_edit'}],
	
	/** TRIPS SECTION**/
	'admin/trips/list': [{ name: 'Trips', url: '', icon: 'my_location' }],
	'admin/trips/view': [{ name: ' Trips', url: WEBSITE_ADMIN_URL + 'trips', icon: 'my_location' }, { name: 'View Details', url: '', icon: 'find_in_page' }],

	/** LOCATION MANAGEMENT**/
	'admin/locations/list'		: [{ name: 'Workable Locations', url: '', icon: 'fullscreen' }],
	'admin/locations/add'		: [{ name: 'Workable Locations', url: WEBSITE_ADMIN_URL + 'locations/workable_locations', icon: 'fullscreen' },{ name: 'Add', url: '', icon: 'add' }],
	'admin/locations/edit'		: [{ name: 'Workable Locations', url: WEBSITE_ADMIN_URL + 'locations/workable_locations', icon: 'picture_in_picture' }, { name: 'Edit', url: '', icon: 'edit' }],
	'admin/locations/view'		: [{ name: 'Workable Locations', url: WEBSITE_ADMIN_URL + 'locations/workable_locations', icon: 'fullscreen' },{ name: 'View', url: '', icon: 'find_in_page' }],
	
	
	
	/**ADS MANAGEMENT SECTION**/
	'admin/ad_managements/list' :	[{name:'ADS Management',url:'',icon:'picture_in_picture'}],
	'admin/ad_managements/add'	: 	[{name:'ADS Management',url:WEBSITE_ADMIN_URL+'ad_managements',icon:'picture_in_picture'},{name:'Add',url:'',icon:'add'}],
	'admin/ad_managements/edit' :	[{name:'ADS Management',url:WEBSITE_ADMIN_URL+'ad_managements',icon:'picture_in_picture'},{name:'Edit',url:'',icon:'mode_edit'}],	
	'admin/ad_managements/view' :	[{name:'ADS Management',url:WEBSITE_ADMIN_URL+'ad_managements',icon:'picture_in_picture'},{name:'View',url:'',icon:'find_in_page'}],	
	
	/**CAMPAIGN MANAGEMENT SECTION**/
	'admin/campaign_management/list' :	[{name:'Campaign Management',url:'',icon:'picture_in_picture'}],
	'admin/campaign_management/add'	: 	[{name:'Campaign Management',url:WEBSITE_ADMIN_URL+'campaigns',icon:'picture_in_picture'},{name:'Add',url:'',icon:'add'}],
	'admin/campaign_management/edit' :	[{name:'Campaign Management',url:WEBSITE_ADMIN_URL+'campaigns',icon:'picture_in_picture'},{name:'Edit',url:'',icon:'mode_edit'}],	
	'admin/campaign_management/view' :	[{name:'Campaign Management',url:WEBSITE_ADMIN_URL+'campaigns',icon:'picture_in_picture'},{name:'View',url:'',icon:'find_in_page'}],	
	'admin/campaign_management/view_campaign_report' :	[{name:'Campaign Management',url:WEBSITE_ADMIN_URL+'campaigns',icon:'picture_in_picture'},{name:'Report',url:'',icon:'find_in_page'}],	
	

	/**PUSH NOTIFICATION SECTION**/
	'admin/push_notification/list' :	[{name:'Broadcast',url:'',icon:'notifications'}],
	'admin/push_notification/add'	: 	[{name:'Broadcast',url:WEBSITE_ADMIN_URL+'push_notification',icon:'notifications'},{name:'Add',url:'',icon:'add'}],
	'admin/push_notification/edit' :	[{name:'Broadcast',url:WEBSITE_ADMIN_URL+'push_notification',icon:'notifications'},{name:'Edit',url:'',icon:'mode_edit'}],	
	
	
	/**Category SECTION**/
	'admin/category/list' 	: [{name:'Category Management',url:'',icon:'chrome_reader_mode'}],
	'admin/category/edit' 	: [{name:'Category Management',url:WEBSITE_ADMIN_URL+'category',icon:'chrome_reader_mode'},{name:'Edit Category',url:'',icon:'mode_edit'}],
	'admin/category/add' 	: [{name:'Category Management',url:WEBSITE_ADMIN_URL+'category',icon:'chrome_reader_mode'},{name:'Add Category',url:'',icon:'add'}],

	/** POST REPORTS SECTION**/
	'admin/post_reports/list': [{ name: 'Post Reports', url: '', icon: 'account_balance_wallet' }],
	'admin/post_reports/view' :	[{name:'Post Reports',url:WEBSITE_ADMIN_URL+'post_reports',icon:'account_balance_wallet'},{name:'View',url:'',icon:'find_in_page'}],	

	
	/** POSTS SECTION**/
	'admin/posts/list': [{ name: 'Posts', url: '', icon: 'play_lesson' }],
	'admin/posts/view' :	[{name:'Posts',url:WEBSITE_ADMIN_URL+'posts',icon:'play_lesson'},{name:'View',url:'',icon:'find_in_page'}],	
	
	/** PAYMENT TRANSACTION SECTION**/
	'admin/payment_transaction/list': [{ name: 'Payment Transaction', url: '', icon: 'account_balance_wallet' }],
	'admin/payment_transaction/view' :	[{name:'Payment Transaction',url:WEBSITE_ADMIN_URL+'payment_transaction',icon:'account_balance_wallet'},{name:'View',url:'',icon:'find_in_page'}],	
	
	/** WALLET TRANSACTION SECTION**/
	'admin/wallet_transaction/list': [{ name: 'Wallet Reports', url: '', icon: 'account_balance_wallet' }],	

	/**Testimonial SECTION**/
	'admin/testimonials/list' 	: [{name:'Testimonial Management',url:'',icon:'chrome_reader_mode'}],
	'admin/testimonials/edit' 	: [{name:'Testimonial Management',url:WEBSITE_ADMIN_URL+'testimonials',icon:'chrome_reader_mode'},{name:'Edit Testimonial',url:'',icon:'mode_edit'}],
	'admin/testimonials/add' 	: [{name:'Testimonial Management',url:WEBSITE_ADMIN_URL+'testimonials',icon:'chrome_reader_mode'},{name:'Add Testimonial',url:'',icon:'add'}],
	'admin/testimonials/view'	: [{name:'Testimonial Management',url:WEBSITE_ADMIN_URL+'testimonials',icon:'picture_in_picture'},{name:'View Testimonial',url:'',icon:'find_in_page'}],	

	/**Testimonial SECTION**/
	'admin/slider/list' 	: [{name:'Slider Management',url:'',icon:'chrome_reader_mode'}],
	'admin/slider/edit' 	: [{name:'Slider Management',url:WEBSITE_ADMIN_URL+'slider',icon:'chrome_reader_mode'},{name:'Edit Slider',url:'',icon:'mode_edit'}],
	'admin/slider/add' 	: [{name:'Slider Management',url:WEBSITE_ADMIN_URL+'slider',icon:'chrome_reader_mode'},{name:'Add Slider',url:'',icon:'add'}],
	'admin/slider/view'	: [{name:'Slider Management',url:WEBSITE_ADMIN_URL+'slider',icon:'picture_in_picture'},{name:'View Slider',url:'',icon:'find_in_page'}],	

};



