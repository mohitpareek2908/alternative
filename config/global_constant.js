require("./database_tables");
/** Website root directory path */
//WEBSITE_ROOT_PATH	=	process.env.PWD + "/";
WEBSITE_ROOT_PATH	=	process.cwd() + "/"; 
//WEBSITE_FRONT_URL	=	process.env.FRONT_URL + "/";

/** Website Push notification server key for Android devices */
WEBSITE_PN_ANDROID_SERVER_KEY =	process.env.ANDROID_SERVER_KEY;
/** Website Header Auth Key for mobile api */
WEBSITE_HEADER_AUTH_KEY	= 	process.env.API_HEADER_AUTH_KEY;

/** Website/Socket Url*/

/** Website/Socket Url*/
WEBSITE_URL = process.env.WEBSITE_URL ? process.env.WEBSITE_URL : (process.env.URL + ":" + process.env.PORT + "/");
WEBSITE_SOCKET_URL = process.env.WEBSITE_SOCKET_URL ? process.env.WEBSITE_SOCKET_URL : (process.env.URL + ":" + process.env.PORT);
FRONT_SITE_URL = process.env.FRONT_SITE_URL ? process.env.FRONT_SITE_URL : "http://klubba.dev2.gipl.inet:21049";
FRONT_LOGIN_AS_USER_URL = process.env.FRONT_LOGIN_AS_USER_URL ? process.env.FRONT_LOGIN_AS_USER_URL : (FRONT_SITE_URL + '/user/login_as_user/');



//WEBSITE_URL			=	process.env.URL+":"+process.env.PORT+"/";
//WEBSITE_URL			=	process.env.URL+"/";
//WEBSITE_FRONT_URL	=	process.env.URL+":"+process.env.FRONT_PORT+"/";
WEBSITE_FRONT_URL	=	process.env.URL+"/";
//WEBSITE_SOCKET_URL	=  	process.env.URL+":"+process.env.PORT;
MOBILE_URL			=  	process.env.MOBILE_URL;
/** Front end name **/
FRONT_END_NAME          = "/";
/** Admin name **/
ADMIN_NAME              = "admin";
/** Front end folder name */
FRONT_END_FOLDER_NAME   = "frontend";
/** Admin folder name */
ADMIN_FOLDER_NAME       = "admin";

/** Services folder name */
SERVICES_FOLDER_NAME       = "services"; 

/** Classes folder name */
CLASS_FOLDER_NAME       = "class"; 

/** Validation folder name */
VALIDATION_FOLDER_NAME       = "validation"; 

/** Website public directory path */
WEBSITE_PUBLIC_PATH 			= 	WEBSITE_URL + "public/";
/** Website public folder path of front end*/
WEBSITE_FILES_URL				= 	WEBSITE_URL + FRONT_END_FOLDER_NAME+"/";
/** Js file path for front pages of website */
WEBSITE_JS_PATH 				= 	WEBSITE_FILES_URL + "js/";
/** Css file path for front pages of website*/
WEBSITE_CSS_PATH 				= 	WEBSITE_FILES_URL + "css/";
/** Website images directory url */
WEBSITE_IMG_URL 				= 	WEBSITE_FILES_URL + "images/";
/** Website public images directory url */
WEBSITE_PUBLIC_IMG_URL			= 	WEBSITE_PUBLIC_PATH + FRONT_END_FOLDER_NAME +"/images/";
/** Website Modules root path */
WEBSITE_MODULES_PATH		    = 	WEBSITE_ROOT_PATH + "modules/"+FRONT_END_FOLDER_NAME+"/";
/** Front layout root path */
WEBSITE_LAYOUT_PATH				= 	WEBSITE_ROOT_PATH + "modules/"+FRONT_END_FOLDER_NAME+"/layouts/";

/** Services root path */
WEBSITE_SERVICES_FOLDER_PATH		    = 	WEBSITE_ROOT_PATH + "modules/"+SERVICES_FOLDER_NAME+"/";


WEBSITE_CLASSES_FOLDER_PATH		    	= 	WEBSITE_ROOT_PATH + "/"+CLASS_FOLDER_NAME+"/";

/** Validation root path */
WEBSITE_VALIDATION_FOLDER_PATH		    = 	WEBSITE_ROOT_PATH + "modules/"+VALIDATION_FOLDER_NAME+"/";


/** Website Admin site Url */
WEBSITE_ADMIN_URL				= 	WEBSITE_URL+ADMIN_NAME+"/";
/** Website public folder path of Admin panel*/
WEBSITE_ADMIN_FILES_URL			= 	WEBSITE_URL + ADMIN_FOLDER_NAME+"/";
/** Js file path for admin pages of website */
WEBSITE_ADMIN_JS_PATH 			= 	WEBSITE_ADMIN_FILES_URL + "js/";
/** Js Path for specific pages */
WEBSITE_ADMIN_JS_PAGE_PATH		= 	WEBSITE_ADMIN_JS_PATH + "pages/";
/** Css file path for admin pages of website*/
WEBSITE_ADMIN_CSS_PATH 			= 	WEBSITE_ADMIN_FILES_URL + "css/";
/** Website images directory url for admin */
WEBSITE_ADMIN_IMG_URL 			= 	WEBSITE_ADMIN_FILES_URL + "images/";
/**Js plugin directory path */
WEBSITE_ADMIN_JS_PLUGIN_PATH	= 	WEBSITE_ADMIN_FILES_URL + "plugins/";
/** Admin Modules root path */
WEBSITE_ADMIN_MODULES_PATH		= 	WEBSITE_ROOT_PATH + "modules/"+ADMIN_FOLDER_NAME+"/";
/** Admin layout root path */
WEBSITE_ADMIN_LAYOUT_PATH		= 	WEBSITE_ROOT_PATH + "modules/"+ADMIN_FOLDER_NAME+"/layouts/";

/** Website public uploads directory path */
WEBSITE_PUBLIC_UPLOADS_PATH 	=	WEBSITE_PUBLIC_PATH + FRONT_END_FOLDER_NAME+"/uploads/";

/** Website upload directory root path */
WEBSITE_UPLOADS_ROOT_PATH		= 	WEBSITE_ROOT_PATH + "public/"+FRONT_END_FOLDER_NAME+"/uploads/";

WEBSITE_PUBLIC_CSV_FILE_FORMATS_UPLOADS_PATH	=	WEBSITE_PUBLIC_PATH + FRONT_END_FOLDER_NAME+"/uploads/csv_formats/";

/** For User images file directory path and url*/
USERS_FILE_PATH		=	WEBSITE_UPLOADS_ROOT_PATH+"user/";
USERS_URL			=	WEBSITE_PUBLIC_UPLOADS_PATH+"user/";

/** For Post images and videos file directory path and url*/
POSTS_FILE_PATH		=	WEBSITE_UPLOADS_ROOT_PATH+"post/";
POSTS_URL			=	WEBSITE_PUBLIC_UPLOADS_PATH+"post/";

/** For driver personal document file directory path and url*/
DRIVER_PERSONAL_DOCUMENT_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/personal_document/";
DRIVER_PERSONAL_DOCUMENT_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/personal_document/";

/** For driver police verification record file directory path and url*/
DRIVER_POLICE_VERIFICATION_RECORD_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/police_verification_record/";
DRIVER_POLICE_VERIFICATION_RECORD_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/police_verification_record/";

/** For driver clean driving record file directory path and url*/
DRIVER_CLEAN_DRIVING_RECORD_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/clean_driving_record/";
DRIVER_CLEAN_DRIVING_RECORD_URL		=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/clean_driving_record/";

/** For driver vehicle document file directory path and url*/
DRIVER_VEHICLE_DOCUMENT_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/vehicle_document/";
DRIVER_VEHICLE_DOCUMENT_URL		=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/vehicle_document/";

/** For driver roadworthy certificate file directory path and url*/
DRIVER_ROADWORTHY_CERTIFICATE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/roadworthy_certificate/";
DRIVER_ROADWORTHY_CERTIFICATE_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/roadworthy_certificate/";

/** For driver third party insurance file directory path and url*/
DRIVER_THIRD_PARTY_INSURANCE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/third_party_insurance/";
DRIVER_THIRD_PARTY_INSURANCE_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/third_party_insurance/";

/** For Master images file directory path and url*/
MASTER_FILE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"masters/";
MASTER_FILE_URL		=	WEBSITE_PUBLIC_UPLOADS_PATH+"masters/";

/** For slider file directory path and url*/
SLIDER_FILE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"sliders/";
SLIDERS_URL			=	WEBSITE_PUBLIC_UPLOADS_PATH+"sliders/";

/** For driver driving_license record file directory path and url*/
DRIVER_LICENSE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/driving_license/";
DRIVER_LICENSE_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/driving_license/";

/** For driver insurance record file directory path and url*/
DRIVER_INSURANCE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/insurance/";
DRIVER_INSURANCE_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/insurance/";

/** For driver taxi_passing  file directory path and url*/
DRIVER_TAXI_PASSING_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/taxi_passing/";
DRIVER_TAXI_PASSING_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/taxi_passing/";

/** For driver vehicle insurance  file directory path and url*/
DRIVER_VEHICLE_INSURANCE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/vehicle_insurance/";
DRIVER_VEHICLE_INSURANCE_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/vehicle_insurance/";


/** For driver vehicle permit  file directory path and url*/
DRIVER_VEHICLE_PERMIT_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"driver_document/vehicle_permit/";
DRIVER_VEHICLE_PERMIT_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/vehicle_permit/";

/** For ads file directory path and url*/
ADS_FILE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"ads/";
ADS_URL			=	WEBSITE_PUBLIC_UPLOADS_PATH+"ads/";

EMPLOYEE_CSV_FILE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"employee_import_csv/";

DRIVING_LICENSE_DOCUMENT_FOLDER 	= "driving_license";
DRIVER_INSURANCE_FOLDER 			= "insurance";

DRIVER_TAXI_PASSING_FOLDER 			= "taxi_passing";
DRIVER_VEHICLE_INSURANCE_FOLDER 	= "vehicle_insurance";
DRIVER_VEHICLE_PERMIT_FOLDER 		= "vehicle_permit";

DRIVER_DOCUMENT_FOLDER_PATH = WEBSITE_UPLOADS_ROOT_PATH+"driver_document/";
DRIVER_DOCUMENT_FOLDER_URL = WEBSITE_PUBLIC_UPLOADS_PATH+"driver_document/";

/** ------------------------------CORPORATE-----------------------------------*/

CORPORATE_LICENSE_DOCUMENT_FOLDER 	= "license";
CORPORATE_INSURANCE_FOLDER 			= "insurance";


/** For corporate insurance record file directory path and url*/
CORPORATE_INSURANCE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"corporate_document/insurance/";
CORPORATE_INSURANCE_URL		=	WEBSITE_PUBLIC_UPLOADS_PATH+"corporate_document/insurance/";

/** For corporate license record file directory path and url*/
CORPORATE_LICENSE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"corporate_document/license/";
CORPORATE_LICENSE_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"corporate_document/license/";


CORPORATE_DOCUMENT_FOLDER_PATH = WEBSITE_UPLOADS_ROOT_PATH+"corporate_document/";
CORPORATE_DOCUMENT_FOLDER_URL = WEBSITE_PUBLIC_UPLOADS_PATH+"corporate_document/";


CORPORATE_LICENSE_RECORD 	= "license",
CORPORATE_INSURANCE_RECORD 	= "insurance"

/** ------------------------------CORPORATE-----------------------------------*/

/** ------------------------------FLEET -----------------------------------*/

FLEET_LICENSE_DOCUMENT_FOLDER 	= "license";
FLEET_INSURANCE_FOLDER 			= "insurance";


/** For fleet insurance record file directory path and url*/
FLEET_INSURANCE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"fleet_document/insurance/";
FLEET_INSURANCE_URL		=	WEBSITE_PUBLIC_UPLOADS_PATH+"fleet_document/insurance/";

/** For fleet license record file directory path and url*/
FLEET_LICENSE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"fleet_document/license/";
FLEET_LICENSE_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"fleet_document/license/";


FLEET_DOCUMENT_FOLDER_PATH = WEBSITE_UPLOADS_ROOT_PATH+"fleet_document/";
FLEET_DOCUMENT_FOLDER_URL = WEBSITE_PUBLIC_UPLOADS_PATH+"fleet_document/";


FLEET_LICENSE_RECORD 	= "license",
FLEET_INSURANCE_RECORD 	= "insurance"


/** For driver driving_license record file directory path and url*/
BLOG_FILE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"blog/";
BLOG_URL	=	WEBSITE_PUBLIC_UPLOADS_PATH+"blog/";

/** For Message images file directory path and url*/
MESSAGE_FILE_PATH	=	WEBSITE_UPLOADS_ROOT_PATH+"message/";
MESSAGE_FILE_URL		=	WEBSITE_PUBLIC_UPLOADS_PATH+"message/";


/** Upload fleet documents configurations*/
ALLOWED_FLEET_DOCUMENT_EXTENSIONS 		=	["jpg","jpeg","png"];
ALLOWED_FLEET_DOCUMENT_ERROR_MESSAGE	= 	"Please select valid file, Valid file extensions are "+ALLOWED_FLEET_DOCUMENT_EXTENSIONS.join(", ")+".";

ALLOWED_FLEET_DOCUMENT_MIME_EXTENSIONS 	= 	["image/jpg","image/jpeg","image/png"];
ALLOWED_FLEET_DOCUMENT_MIME_ERROR_MESSAGE	= 	"Please select valid mime type, Valid mime types are "+ALLOWED_FLEET_DOCUMENT_MIME_EXTENSIONS.join(", ")+".";

/** ------------------------------FLEET-----------------------------------*/


/** For splash screens images file directory path and url*/
SPLASH_SCREENS_FILE_PATH	= 	WEBSITE_UPLOADS_ROOT_PATH+"splash_screens/";
SPLASH_SCREENS_IMG_URL		= 	WEBSITE_PUBLIC_UPLOADS_PATH+"splash_screens/";


/** Define upload image size **/
UPLOAD_FILE_SIZE	=	2;

/** Website Admin tooltip images Url */
WEBSITE_ADMIN_TOOLTIP_IMAGE_URL	= 	WEBSITE_PUBLIC_PATH+"admin/images/";

/** Urls of commonly used images */
NO_IMAGE_AVAILABLE		=	WEBSITE_PUBLIC_UPLOADS_PATH + "no-image.png";
ADD_PROFILE_IMAGE_ICON	= 	WEBSITE_PUBLIC_UPLOADS_PATH+'user-no-image.png';
DATATABLE_LOADER_IMAGE	= 	WEBSITE_PUBLIC_IMG_URL +"Loading_icon.gif";
IMAGE_FIELD_NAME 		= 	"full_image_path";

/** User role ids */
SUPER_ADMIN_ROLE_ID		= 	"5b6bc8111dd6a1219e632b03";
RIDER_USER_ROLE_ID		= 	"5e12d66e22241b0bfc6e3bf7";
DRIVER_USER_ROLE_ID		= 	"5e12d67d22241b0bfc6e3c03";
FLEET_USER_ROLE_ID		= 	"5e12d69722241b0bfc6e3c1b";
CORPORATE_USER_ROLE_ID	= 	"5e12d68b22241b0bfc6e3c0f";
SUPER_ADMIN_ID			= 	"5f7c0fbdced1c84625f4c52b";

/** User Type **/
RIDER_USER_TYPE		=	"rider";
DRIVER_USER_TYPE	=	"driver";
FLEET_USER_TYPE		=	"fleet";
CORPORATE_USER_TYPE	=	"corporate";
CORPORATE_RIDER_TYPE =	"corporate_rider";
NORMAL_RIDER_TYPE	=	"normal_rider";


ADULTS_USER_ROLE_ID		= 	"5e12d67d22241b0bfc6e3c03";
TEENS_USER_ROLE_ID		= 	"5e12d69722241b0bfc6e3c1b";
KIDS_USER_ROLE_ID		= 	"5e12d68b22241b0bfc6e3c0f";

KIDS_USER_TYPE     	= "kid";
TEENS_USER_TYPE     = "teen";
ADULTS_USER_TYPE    = "adult";

/** User Type Object **/
FRONT_USER_TYPE 					= {};
FRONT_USER_TYPE[KIDS_USER_TYPE] 	= "Kid";
FRONT_USER_TYPE[TEENS_USER_TYPE] 	= "Teen";
FRONT_USER_TYPE[ADULTS_USER_TYPE] 	= "Adult";

FRONT_USER_ROLE_IDS 					= {};
FRONT_USER_ROLE_IDS[ADULTS_USER_TYPE] 	= ADULTS_USER_ROLE_ID;
FRONT_USER_ROLE_IDS[TEENS_USER_TYPE] 	= TEENS_USER_ROLE_ID;
FRONT_USER_ROLE_IDS[KIDS_USER_TYPE] 	= KIDS_USER_ROLE_ID;

/** Text Setting types*/
TEXT_SETTINGS_ADMIN	= "admin";
TEXT_SETTINGS_FRONT	= "front";

/** Name of text setting types*/
TEXT_SETTINGS_NAME						=	{};
TEXT_SETTINGS_NAME[TEXT_SETTINGS_ADMIN]	=	"Admin Text Settings";
TEXT_SETTINGS_NAME[TEXT_SETTINGS_FRONT]	=	"Front Text Settings";

/** Time Configurations */
DAYS_IN_A_WEEK				= 	7;
HOURS_IN_A_DAY				= 	24;
MINUTES_IN_A_HOUR 			= 	60;
SECONDS_IN_A_MINUTE 		= 	60;
MILLISECONDS_IN_A_SECOND	=	1000;
SECONDS_IN_A_HOUR			= 	3600;
DAY_IN_A_MONTH				= 	30;
HOURS_IN_A_YEAR				= 	HOURS_IN_A_DAY*365;



/** Time stamp of one day*/
ONE_DAY_TIMESTAMP = HOURS_IN_A_DAY*MINUTES_IN_A_HOUR*SECONDS_IN_A_MINUTE*MILLISECONDS_IN_A_SECOND;

/** Commonly used status **/
ACTIVE 			=	1;
DEACTIVE 		= 	0;
VERIFIED 		= 	1;
NOT_VERIFIED	= 	0;
DELETED			= 	1;
NOT_DELETED		= 	0;
NOT_SEEN		= 	0;
SEEN			= 	1;
NOT_READ		= 	0;
READ			= 	1;
SENT			=	1;
NOT_SENT		=	0;
SHOWN    		= 	1;
NOT_SHOWN   	= 	0;
NOT_REGISTER	= 	0;
REGISTER 	 	= 	1;
NOT_VISIBLE   	= 	0;
VISIBLE   		= 	1;
NOT_AVAILABLE   = 	0;
AVAILABLE   	= 	1;
REJECTED		=	2;
OFFLINE   		= 	0;
ONLINE			=	1;
IS_ON_RIDE		=	1;
IS_OFF_RIDE		=	0;

/** Gender type*/
MALE	=	"Male";
FEMALE	= 	"Female";

GENDER_DROPDOWN 		= 	{};
GENDER_DROPDOWN[MALE] 	= 	"Male";
GENDER_DROPDOWN[FEMALE] =	"Female";

GENDER_TYPE_DROP_DOWN = [
  {
    status_id: MALE,
    status_name: "Male",
    status_type: MALE
  },
  {
    status_id: FEMALE,
    status_name: "Female",
    status_type: FEMALE
  },
];

/** "Stay Signed In" Expire time for admin  */
ADMIN_LOGGED_IN_COOKIE_EXPIRE_TIME = 14 * ONE_DAY_TIMESTAMP;

/** Type of Flash messages */
STATUS_SUCCESS 	= "success";
STATUS_ERROR 	= "error";
STATUS_ERROR_FORM_VALIDATION 	= "form_validation_error";
STATUS_ERROR_INVALID_ACCESS 	= "invalid_access_error";
STATUS_SUCCESS_EMP_DETAIL	= "employee_detail_success";
TOKEN_STATUS_ERROR	= 	"token_status_error";
/** Show / Hide "Stay Signed In" Option in admin */
ALLOWED_ADMIN_TO_SET_COOKIE	=	DEACTIVE;

/** Default number of records to be shown in admin */
ADMIN_LISTING_LIMIT		=	10;
FRONT_LISTING_LIMIT		=	10;

/** On submit loading text */
ADMIN_LOADING_TEXT	= 'data-loading-text=\'<i class="material-icons font-14">save</i> Loading...\'';

/** Default language configurations */
DEFAULT_LANGUAGE_FOLDER_CODE	= "en";
DEFAULT_LANGUAGE_CODE			= "en";
DEFAULT_LANGUAGE_MONGO_ID		= "5a3a13238481824b077b23ca";

ALLOWED_VIDEO_EXTENSIONS 			=	["mp4","mov"];
ALLOWED_VIDEO_ERROR_MESSAGE			= 	"Please select valid file, Valid file extensions are "+ALLOWED_VIDEO_EXTENSIONS.join(", ")+".";
ALLOWED_VIDEO_MIME_EXTENSIONS 		= 	["video/mp4","video/quicktime","application/octet-stream"];
ALLOWED_VIDEO_MIME_ERROR_MESSAGE	= 	"Please select valid mime type, Valid mime types are "+ALLOWED_VIDEO_MIME_EXTENSIONS.join(", ")+".";

/** Upload image configurations*/
ALLOWED_IMAGE_EXTENSIONS 			=	["jpg","jpeg","png"];
ALLOWED_IMAGE_ERROR_MESSAGE			= 	"Please select valid file, Valid file extensions are "+ALLOWED_IMAGE_EXTENSIONS.join(", ")+".";

ALLOWED_IMAGE_MIME_EXTENSIONS 		= 	["image/jpg","image/jpeg","image/png"];
ALLOWED_IMAGE_MIME_ERROR_MESSAGE	= 	"Please select valid mime type, Valid mime types are "+ALLOWED_IMAGE_MIME_EXTENSIONS.join(", ")+".";
IMAGE_RESOLUTION		 			=	"1202*424";

ALLOWED_MESSAGE_FILE_EXTENSIONS		=	["pdf","doc","docx","jpg","jpeg","png","gif","txt","mp4","mov","avi","xlsx","xls"];
ALLOWED_MESSAGE_FILE_MIME_EXTENSIONS 		= 	["video/mp4","video/quicktime","video/x-sgi-movie","video/x-msvideo","image/jpg","image/jpeg","image/png","image/gif","application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/msword","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","	application/vnd.ms-excel","text/plain",""];
ALLOWED_MESSAGE_FILE_ERROR_MESSAGE  = "Please select valid file."

SLIDER_IMAGE_EXTENSIONS				=	"jpg, jpeg, png with dimension 1900X621 and size 2MB."
AD_IMAGE_EXTENSIONS				=	"jpg, jpeg, png with size 2MB."
/** Not allowed html tags list*/
NOT_ALLOWED_TAGS_XSS = [/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi];

/** Allow iframe in add/edit product (Youtube embedded code) **/
NOT_ALLOWED_TAGS_XSS_WITHOUT_IFRAME = [/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi];

ALLOWED_EXCEL_EXTENSIONS 			= ['csv'];
ALLOWED_EXCEL_ERROR_MESSAGE			= 	"Please select valid file, Valid file extensions are "+ALLOWED_EXCEL_EXTENSIONS.join(", ")+".";
/** Date Formats **/
DATABASE_DATE_TIME_FORMAT				= 	"yyyy-mm-dd HH:MM:ss";	// 2018-01-01 00:00:00
DATABASE_DATE_FORMAT					= 	"yyyy-mm-dd"; 			// 2018-01-01
DATATABLE_DATE_TIME_FORMAT				=	"DD/MM/YYYY hh:mm a";
DATATABLE_DATE_FORMAT					=	"DD/MM/YYYY";
DATE_FORMAT_HTML						=	"DD/MM/YYYY";
DATE_FORMAT_EXPORT 						=	"dd/mm/yyyy";
FRONT_DATE_FORMAT					 	= 	"DD/MM/YYYY hh:MM A"; 			// 31/01/2018 00:00 PM
DATE_OF_BIRTH_FORMAT					= 	"yyyy-mm-dd"; 			// 2018-01-01
AM_PM_FORMAT_WITH_DATE 					= 	"yyyy-mm-dd hh:MM TT"; 	// 2018-01-01 12:00 AM
DATE_TIME_FORMAT_EXPORT 				=	"dd/mm/yyyy hh:MM TT"; // 01/01/2019 11:00 AM
START_DATE								=	" 00:00:00";
END_DATE								=	" 23:59:59";
/**Date formats used in datetange picker	 */
DATEPICKER_DATE_FORMAT					=	"DD/MM/YYYY";
DATEPICKER_START_DATE_FORMAT			=	"YYYY-MM-DD 00:00:00";
DATEPICKER_END_DATE_FORMAT				=	"YYYY-MM-DD 23:59:59";

DATE_FORMAT					 			= 	"DD-MM-YYYY"; 			// 31-01-2018

DATE_RANGE_DISPLAY_FORMAT_FOR_START_DATE=	"YYYY-MM-DD HH:mm:00";
DATE_RANGE_DISPLAY_FORMAT_FOR_END_DATE 	=	"YYYY-MM-DD HH:mm:59";
DATE_RANGE_DATE_FORMAT				 	=	"YYYY-MM-DD";
DATE_TIME_FORMAT					 	= 	"YYYY-MM-DD hh:mm a"; 

TIME_FORMAT_FOR_POST_HISTORY			= 	"%H:%M:%S";

API_LOOKUP_DATE_FORMAT					 	= 	"%d/%m/%Y"; 
API_LOOKUP_TIME_FORMAT					 	= 	"%H:%M:%T"; 
/** Date picker date example*/
DATEPICKER_DATE_EXAMPLE		=	"Ex: 2019-03-24 23:59";

/** Time zone used in html **/
DEFAULT_TIME_ZONE	= process.env.TZ;

/** To show error message on top of page **/
ADMIN_GLOBAL_ERROR 	= "invalid-access";
FRONT_GLOBAL_ERROR 	= "invalid-access";

/** Datatable configurations **/
SORT_DESC	 		= 	-1;
SORT_ASC	 		= 	1;
DEFAULT_SKIP		=	0;
DEFAULT_LIMIT		=	10;
API_DEFAULT_LIMIT	=	10;

/** Loading button text, default is loading.. **/
LOADING_BUTTON_TEXT = 'data-loading-text=\'<i class="fa fa-save"></i> Loading...\'';
LOADING_SPINNER = '<div class=\'ld ld-ring ld-spin\'></div>';

/** Default country code */
DEFAULT_COUNTRY_CODE	=	"+44";
DEFAULT_COUNTRY_ID		=	"5c0f9e1f2681e11c7acb47d9";

/** Allowed Mobile number length configuration **/
MOBILE_NUMBER_MIN_LENGTH		= 	10;
MOBILE_NUMBER_MAX_LENGTH		= 	10;
MOBILE_LENGTH_VALIDATION		=	{};
MOBILE_LENGTH_VALIDATION["min"]	=	MOBILE_NUMBER_MIN_LENGTH;
MOBILE_LENGTH_VALIDATION["max"]	=	MOBILE_NUMBER_MAX_LENGTH;
MOBILE_NUMBER_LENGTH			=	[MOBILE_LENGTH_VALIDATION];

/** Password length configuration **/
PASSWORD_MIN_LENGTH					= 	8;
PASSWORD_LENGTH_VALIDATION			=	{};
PASSWORD_LENGTH_VALIDATION["min"]	=	PASSWORD_MIN_LENGTH;
PASSWORD_LENGTH						=	[PASSWORD_LENGTH_VALIDATION];

/** Allowed zip code length configuration **/
ZIPCODE_MIN_LENGTH					= 	5;
ZIPCODE_MAX_LENGTH					= 	6;
ZIPCODE_LENGTH_VALIDATION			=	{};
ZIPCODE_LENGTH_VALIDATION["min"]	=	ZIPCODE_MIN_LENGTH;
ZIPCODE_LENGTH_VALIDATION["max"]	=	ZIPCODE_MAX_LENGTH;
ZIPCODE_NUMBER_LENGTH				=	[ZIPCODE_LENGTH_VALIDATION];

/** Email and Mobile validation regular expression (use in login function for front) **/
/** Email and 10 digit mobile number validation */
EMAIL_AND_MOBILE_REGULAR_EXPRESSION	= /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})|([0-9]{10})+$/;

/** settings input value required and editable status **/
REQUIRED 	=	1;
EDITABLE 	=	1;

/** Contact us reply status **/
ANSWERED	=	1;

/** Round precision (default number of decimal digits to round to) **/
ROUND_PRECISION = 2;

/** to ignore Case sensitive searching/sorting in mongo collections  **/
COLLATION_VALUE		=	{ locale: "en_US", caseLevel: true};

/** Dashboard redirect type **/
TYPE_ACTIVE		=	"active";
TYPE_DEACTIVE 	= 	"deactive";
TYPE_REJECT     =   "Rejected"

/**Search Status for users **/
SEARCHING_ACTIVE 				= 1;
SEARCHING_DEACTIVE 				= 2;
SEARCHING_VERIFIED 				= 3;
SEARCHING_NOT_VERIFIED			= 4;
MOBILE_SEARCHING_VERIFIED 		= 5;
MOBILE_SEARCHING_NOT_VERIFIED	= 6;
ADMIN_REJECT_PROFILE			= 7;

POST_TYPE_IMAGE  = "image";
POST_TYPE_VIDEO  = "video";

/** Search status for customer **/
USER_STATUS_SEARCH_DROPDOWN = [
	{
		status_id	: SEARCHING_ACTIVE,
		status_name	: "Active",
		status_type	: TYPE_ACTIVE
	},
	{
		status_id	: SEARCHING_DEACTIVE,
		status_name	: "Deactive",
		status_type	: TYPE_DEACTIVE
	},
	{
		status_id	: SEARCHING_VERIFIED,
		status_name	: "Email Verified"
	},
	{
		status_id	: SEARCHING_NOT_VERIFIED,
		status_name	: "Email Not Verified"
	},
	{
		status_id	: MOBILE_SEARCHING_VERIFIED,
		status_name	: "Mobile Verified"
	},
	{
		status_id	: MOBILE_SEARCHING_NOT_VERIFIED,
		status_name	: "Mobile Not Verified"
	},
	{
		status_id	: ADMIN_REJECT_PROFILE,
		status_name	: "Profile Rejected",
		status_type	: TYPE_REJECT
	},
];

/** Search status **/
NEW_STATUS_SEARCH_DROPDOWN = [
	{
		status_id	: SEARCHING_ACTIVE,
		status_name	: "Active",
		status_type	: TYPE_ACTIVE
	},
	{
		status_id	: SEARCHING_DEACTIVE,
		status_name	: "Deactive",
		status_type	: TYPE_DEACTIVE
	},
	{
		status_id	: SEARCHING_VERIFIED,
		status_name	: "Email Verified"
	},
	{
		status_id	: SEARCHING_NOT_VERIFIED,
		status_name	: "Email Not Verified"
	},
	{
		status_id	: MOBILE_SEARCHING_VERIFIED,
		status_name	: "Mobile Verified"
	},
	{
		status_id	: MOBILE_SEARCHING_NOT_VERIFIED,
		status_name	: "Mobile Not Verified"
	},
	{
		status_id	: ADMIN_REJECT_PROFILE,
		status_name	: "Admin Rejected Profiles"
	}
];


/** Search status **/
ACTIVE_DEACTIVE_STATUS_SEARCH_DROPDOWN = [
	{
		status_id	: SEARCHING_ACTIVE,
		status_name	: "Active",
		status_type	: TYPE_ACTIVE
	},
	{
		status_id	: SEARCHING_DEACTIVE,
		status_name	: "Deactive",
		status_type	: TYPE_DEACTIVE
	},
	
];



/** Search post type **/
POST_TYPE_DROPDOWN = [
	{
		status_id	: POST_TYPE_IMAGE,
		status_name	: "Image",
		status_type	: TYPE_ACTIVE
	},
	{
		status_id	: POST_TYPE_VIDEO,
		status_name	: "Video",
		status_type	: TYPE_DEACTIVE
	},
	
];



/** Type Of Export Records **/
EXPORT_ALL		= "export_all";
EXPORT_FILTERED	= "export_filtered";

/** Search status for global section **/
GLOBAL_STATUS_SEARCH_DROPDOWN			=	{};
GLOBAL_STATUS_SEARCH_DROPDOWN[ACTIVE]	=	{
	status_name	:	"Active",
	status_type	: 	TYPE_ACTIVE,
	label_class	: 	"label-success"
};
GLOBAL_STATUS_SEARCH_DROPDOWN[DEACTIVE]	=	{
	status_name	:	"Deactive",
	status_type	: 	TYPE_DEACTIVE,
	label_class	: 	"label-danger"
};

/** For data table data types **/
NUMERIC_FIELD 	= 'numeric';
OBJECT_ID_FIELD = 'objectId';
EXACT_FIELD		= 'exact';

/** For status use in redirect page with status (user listing) **/
ACTIVE_INACTIVE_STATUS	=	"active_inactive";
VERIFIED_STATUS			=	"verified_user";
ADMIN_DRIVER_VERIFIED_STATUS	=	"admin_driver_verified_user";

/** Setting validate type dropdown **/
SETTINGS_VALIDATE_TYPE_DROPDOWN = [
	{
		input_id	: "number",
		input_name	: "Number"
	},
	{
		input_id	: "float",
		input_name	: "Float"
	},
	{
		input_id	: "start_time",
		input_name	: "Start time"
	},
	{
		input_id	: "end_time",
		input_name	: "End time"
	},
	{
		input_id	: "percentage",
		input_name	: "Percentage"
	},
];

/** Setting input type dropdown **/
SETTING_INPUT_TYPE_DROPDOWN = [
	{
		input_id	: "text",
		input_name	: "Text"
	},
	{
		input_id	: "textarea",
		input_name	: "Textarea"
	},
	{
		input_id	: "checkbox",
		input_name	: "Checkbox"
	},
	{
		input_id	: "time",
		input_name	: "Time Picker"
	},	
];

/** Search Status for pn logs **/
SEARCHING_SENT 		= 1;
SEARCHING_FAILED	= 0;

/** Search status for pn logs **/
PN_LOGS_STATUS_SEARCH_DROPDOWN = [
	{
		status_id	: SENT,
		status_name	: "Sent"
	},
	{
		status_id	: NOT_SENT,
		status_name	: "Failed"
	},
];

/**Search Status for pn logs **/
SEARCHING_ANDROID	= "Android";
SEARCHING_IPHONE	= "iPhone";

/** Search status for pn logs **/
PN_LOGS_DEVICE_TYPE_SEARCH_DROPDOWN = [
	{
		device_id	: SEARCHING_ANDROID,
		device_name	: "Android"
	},
	{
		device_id	: SEARCHING_IPHONE,
		device_name	: "iPhone"
	},
];

/** Not allowed characters in regular expresssion **/
NOT_ALLOWED_CHARACTERS_FOR_REGEX = ['(',')','+','*','?','[',']'];

/**Character limit in push notification message textarea */
PUSH_NOTIFICATION_TEXT_LIMIT = 80;

/**Not deletable role */
NOT_DELETABLE_ROLE	= 1;

/** Two show only subadmin */
IS_SUBADMIN	= 1;

/**Notificaiton dispaly limit in admin header */
ADMIN_HEADER_NOTIFICATION_DISPLAY_LIMIT = 5;

/**  NOTIFICATION TYPE */
NOTIFICATION_USER_REGISTER 						= 1;
NOTIFICATION_VERIFY_DOCUMENT 					= 2;
NOTIFICATION_WALLET_BALLENCE 					= 3;
NOTIFICATION_REJECT_DOCUMENT 					= 4;
NOTIFICATION_DRIVER_ACCOUNT_APPROVAL_REQUEST 	= 5;
NOTIFICATION_DRIVER_PERSONAL_DOCUMENT_REQUEST 	= 6;
NOTIFICATION_VEHICLE_DOCUMENT_REQUEST 			= 7;
NOTIFICATION_ADMIN_RIDER_USER_REGISTER			= 8;
NOTIFICATION_RIDER_ACCOUNT_ACTIVE_DEACTIVE_ADMIN= 9;
NOTIFICATION_FRONT_PENDING_APPROVE_DRIVER		= 10;
NOTIFICATION_FRONT_PENDING_APPROVE_VEHICLES		= 11;
NOTIFICATION_PROFILE_UPDATE_REQUEST				= 12;
NOTIFICATION_FLEET_VECHICLE_ADD_REQUEST			= 13;

NOTIFICATION_NEW_POST_BY_USER					= 14;
NOTIFICATION_POST_LIKED_BY_USER					= 15;
NOTIFICATION_COMMENT_ADDED_REQUEST				= 16;
NOTIFICATION_FOLLOW_REQUEST						= 17;
NOTIFICATION_FOLLOW_REQUEST_ACTION				= 18;
NOTIFICATION_COMMENT_SUBMIT						= 19;
NOTIFICATION_SHARE_POST_TO_FOLLOWERS			= 20;
NOTIFICATION_FOLLOW_REQUEST_ACCEPT				= 21;
NOTIFICATION_LIKE_POST_COMMENT					= 22;
NOTIFICATION_NEW_CHAT_MESSAGE					= 23;
NOTIFICATION_BROADCAST							= 24;
NOTIFICATION_WALLET_GIFT_RECEVIED				= 25;

NOTIFICATION_MESSAGES ={};
NOTIFICATION_MESSAGES[NOTIFICATION_USER_REGISTER] = {
	'title' 	: 'A new user registered with us.',
	'constants'	: ['{USER_NAME}','{USER_TYPE}'],
	'icon_class': 'bg-light-green',
	'icon'		: 'notifications_active'
};


PN_TYPE_CONFIG	=	{
	"follow_request"				: "follow_request",
	"follow_request_accept_reject"	: "follow_request_accept_reject",
	"like_post"						: "like_post",
	"comment_on_post"				:"comment_on_post",
	"reply_on_comment"				:"reply_on_comment",
	"like_comment_on_post"			: "like_comment_on_post",
	"chat_msg_recevied"				:"chat_msg_recevied",
	"reply_on_chat_msg"				:"reply_on_chat_msg",
	"broadcast"						: "broadcast",
	"wallet_gift_recevied"			: "wallet_gift_recevied",
	"message"						: "message",
	"add_wallet_balance"			: "add_wallet_balance",
	"new_post"			: "new_post",
}



/** Used for wallet transaction type  **/
CREDIT	= 'credited';
DEBIT	= 'debited';

TRANSACTION_TYPE = {};
TRANSACTION_TYPE[CREDIT] = "Credited";
TRANSACTION_TYPE[DEBIT]  = "Debited";

/**Number of coupons used */
NO_COUPONS_USED =	0;

/** Promo code status*/
PROMO_CODE_UNPUBLISHED 		=	0;
PROMO_CODE_PUBLISHED 		=	1;
PROMO_CODE_EXPIRED 	 		=	2;
PROMO_CODE_EXHAUSTED 		=	3;

/** Promo code publish Object **/
PROMO_CODE_STATUS_DROPDOWN							= {};
PROMO_CODE_STATUS_DROPDOWN[PROMO_CODE_PUBLISHED]	= {
	"title" 		: "Published",
	"label_class" 	: "label-success",
};
PROMO_CODE_STATUS_DROPDOWN[PROMO_CODE_UNPUBLISHED]	= {
	"title" 		: "Unpublished",
	"label_class" 	: "label-warning",
};
/*PROMO_CODE_STATUS_DROPDOWN[PROMO_CODE_EXPIRED]		= {
	"title" 		: "Expired",
	"label_class" 	: "label-danger",
};
PROMO_CODE_STATUS_DROPDOWN[PROMO_CODE_EXHAUSTED]	= {
	"title" 		: "Exhausted",
	"label_class" 	: "label-danger",
};*/


/** Types of promocode*/
PERCENT_OF_AMOUNT	=	"percentage";
FLAT_AMOUNT 		=	"flat_amount";

/** Promocode discount type*/
PROMO_DISCOUNT_TYPE 					= {};
PROMO_DISCOUNT_TYPE[PERCENT_OF_AMOUNT] 	= "Percentage";
PROMO_DISCOUNT_TYPE[FLAT_AMOUNT] 		= "Fixed Amount";


PROMO_DISCOUNT_TYPE_DROPDOWN = [
	{
		id		: PERCENT_OF_AMOUNT,
		name	: "Percentage",
	},{
		id		: FLAT_AMOUNT,
		name	: "Fixed Amount",
	},
]

/** Promocode Validity Type**/
PROMO_PERMANENT_VALIDITY_TYPE	=	"permanent";
PROMO_CUSTOM_VALIDITY_TYPE		=	"custom";

/** Promocode Validity type*/
PROMO_VALIDITY_TYPE 					= {};
PROMO_VALIDITY_TYPE[PROMO_PERMANENT_VALIDITY_TYPE] 	= "Permanent";
PROMO_VALIDITY_TYPE[PROMO_CUSTOM_VALIDITY_TYPE] 	= "Custom";

/** Google key **/
GOOGLE_API_KEY = "AIzaSyAWRLyLBht0KOjpCEExUvn33PjA4iESzWw";

/** Google configuration for get Distance */
GOOGLE_DISTANCE_SENSOR = true; // For development Mode

/*** How many time function would be hit when google respond with blank reponse */
GOOGLE_RESPOND_REPEATED_COUNT = 3;
DRIVER_RIDE_REQUEST_REPEATED_COUNT 	= 3;
GEO_DRIVER_SEARCH_DISTANCE 	= 3;

/** Ride Status **/





RIDE_REQUEST_PENDING 					= "pending";
RIDE_REQUEST_CANCEL 					= "cancel";
RIDE_REQUEST_ACCEPTED 					= "accept";
RIDE_REQUEST_REJECTED 					= "reject";
RIDE_REQUEST_TIMEOUT 					= "timeout";
RIDE_REQUEST_ACCEPTED_BY_OTHER_DRIVER	= "accepted_by_other_driver";

/** Ride Assignment Status **/
RIDE_PLACED				= "placed";
RIDE_CANCELLED			= "cancel";
RIDE_ASSIGNED			= "assign";
RIDE_ACCEPTED			= "accept";
RIDE_PASSED				= "pass";
RIDE_REJECTED			= "reject";
RIDE_INPROCESS			= "on_going";
RIDE_COMPLETED			= "completed";

/** This array used to search in trips**/
RIDE_DROPDOWN_STATUS= [
	{
		id		: RIDE_PLACED,
		name	: "Placed",
	},{
		id		: RIDE_CANCELLED,
		name	: "Cancel",
	},{
		id		: RIDE_ASSIGNED,
		name	: "Assign",
	},{
		id		: RIDE_ACCEPTED,
		name	: "Accept",
	},{
		id		: RIDE_PASSED,
		name	: "Pass",
	},{
		id		: RIDE_REJECTED,
		name	: "Reject",
	},{
		id		: RIDE_INPROCESS,
		name	: "On Going",
	},{
		id		: RIDE_COMPLETED,
		name	: "Completed",
	},
]


/** One mile value in meter **/
ONE_MILE_IN_METER 	=	1609.344;
METERS_IN_1_KM		= 	1000;

/** Upload driver documents configurations*/
ALLOWED_DRIVER_DOCUMENT_EXTENSIONS 		=	["jpg","jpeg","png"];
ALLOWED_DRIVER_DOCUMENT_ERROR_MESSAGE	= 	"Please select valid file, Valid file extensions are "+ALLOWED_DRIVER_DOCUMENT_EXTENSIONS.join(", ")+".";

ALLOWED_DRIVER_DOCUMENT_MIME_EXTENSIONS 	= 	["image/jpg","image/jpeg","image/png"];
ALLOWED_DRIVER_DOCUMENT_MIME_ERROR_MESSAGE	= 	"Please select valid mime type, Valid mime types are "+ALLOWED_DRIVER_DOCUMENT_MIME_EXTENSIONS.join(", ")+".";


ALLOWED_VEHICLE_DOCUMENT_EXTENSIONS 		=	["jpg","jpeg","png"];
ALLOWED_VEHICLE_DOCUMENT_ERROR_MESSAGE 		=	"Please select valid file, Valid file extensions are "+ALLOWED_VEHICLE_DOCUMENT_EXTENSIONS.join(", ")+".";

ALLOWED_VEHICLE_DOCUMENT_MIME_EXTENSIONS 	= 	["image/jpg","image/jpeg","image/png"];
ALLOWED_VEHICLE_DOCUMENT_MIME_ERROR_MESSAGE	= 	"Please select valid mime type, Valid mime types are "+ALLOWED_VEHICLE_DOCUMENT_MIME_EXTENSIONS.join(", ")+".";

//PASSWORD_VALIDATION_REGULAR_EXPRESSION = [
///^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$@$!%*#?&]{6,}$/
  ///^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
  ///^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$@$!%*#?&]{6,}$/
//];
//PASSWORD_VALIDATION_REGULAR_EXPRESSION			=	[/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$@$!%*#?&]{6,}$/];
PASSWORD_VALIDATION_REGULAR_EXPRESSION			= /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/	;
//  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/
//   /^(?=.*\d)(?=.*[a-z])[a-zA-Z\d@$.!%*#?&]/
/** Common error message for required fields in both languages **/
BOTH_LANGUAGE_REQUIRED					=	"Please fill all required fields in both languages.";

MONGO_ID 			= 	"5dad3d84af37c90e342c450b";
ADMIN_ID 			= 	"5e609f56ced1c8a561ad6ce7";
REQUEST_FROM_ADMIN	=	"admin";
REQUEST_FROM_API	=	"api";


WEP_API_TYPE		=	"web";
MOBILE_API_TYPE		=	"mobile";
ADMIN_API_TYPE		=	"admin";

FORGOT_EMAIL_OPTION		=	"email";
FORGOT_MOBILE_OPTION 	=	"mobile";

OTP_FOR_MOBILE					= "mobile";	
OTP_FOR_EMAIL					= "email";	

/**status Drop Down **/
STATUS_ACTIVE 		= 1;
STATUS_DEACTIVE  	= 0;

STATUS_DROP_DOWN = [
	{
		status_id	: STATUS_ACTIVE,
		status_name	: "Active",
		status_type	: STATUS_ACTIVE
	},
	{
		status_id	: STATUS_DEACTIVE,
		status_name	: "Deactive",
		status_type	: STATUS_DEACTIVE
	},
];

/** Max character allwoed length*/
MAX_CHARACTER_ALLOWED_IN_LISTING = 100;

/** This seting are only used get setting*/
CONDITION_SETTING	=	["Social","Site"];
SITE_DATE_FORMAT = "YYYY/MM/DD";


DRIVING_LICENSE_RECORD = "driving_license",
DRIVER_INSURANCE_RECORD = "insurance"

PERSONAL_DOCUMENT_NAME 					= {};
PERSONAL_DOCUMENT_NAME[DRIVING_LICENSE_RECORD] 		= "Driving License";
PERSONAL_DOCUMENT_NAME[DRIVER_INSURANCE_RECORD] 	= "Insurance";

PERSONAL_DOCUMENT_NAME[CORPORATE_LICENSE_RECORD] 		= "License";
PERSONAL_DOCUMENT_NAME[CORPORATE_INSURANCE_RECORD] 	= "Insurance";

DRIVER_TAXI_PASSING 		= "taxi_passing";
DRIVER_VEHICLE_INSURANCE 	= "vehicle_insurance";
DRIVER_VEHICLE_PERMIT 		= "vehicle_permit";

VEHICLE_DOCUMENT_NAME 					= {};
VEHICLE_DOCUMENT_NAME[DRIVER_TAXI_PASSING]		=	"Taxi Passing";
VEHICLE_DOCUMENT_NAME[DRIVER_VEHICLE_INSURANCE]	=	"Vehicle Insurance";
VEHICLE_DOCUMENT_NAME[DRIVER_VEHICLE_PERMIT]	=	"Vehicle Permit";

PERSONAL_DOCUMENT_TYPE = {
	driving_license : DRIVING_LICENSE_RECORD,
	insurance : DRIVER_INSURANCE_RECORD,
}
APPROVE_DOC_STATUS	=	"approve_doc";
REJECT_DOC_STATUS	=	"reject_doc";
FORGOT_PASSWORD_PAGE_TYPE = "forgot_password";
VERIFY_ACCOUNT_PAGE_TYPE = "verify_account";
KID_PROFILE_SETTNIG_VIEW_OTP = "kid_profile_setting_view_otp";

REFERRAL_CODE_LENGHT = 5;


/** Status Object **/
STATUS_LABEL_DROPDOWN							= {};
STATUS_LABEL_DROPDOWN[ACTIVE]	= {
	"title" 		: "Active",
	"label_class" 	: "label-success",
};
STATUS_LABEL_DROPDOWN[DEACTIVE]		= {
	"title" 		: "Deactive",
	"label_class" 	: "label-danger",
};

/** Document Status Object **/
DOCUMENT_STATUS_LABEL_DROPDOWN							= {};
DOCUMENT_STATUS_LABEL_DROPDOWN[ACTIVE]	= {
	"title" 		: "Approved",
	"label_class" 	: "label-success",
};
DOCUMENT_STATUS_LABEL_DROPDOWN[DEACTIVE]		= {
	"title" 		: "Pending",
	"label_class" 	: "label-warning",
};
DOCUMENT_STATUS_LABEL_DROPDOWN[REJECTED]		= {
	"title" 		: "Rejected",
	"label_class" 	: "label-danger",
};


/** Document Status Object **/
DOCUMENT_CURRENT_STATUS_LABEL_DROPDOWN							= {};
DOCUMENT_CURRENT_STATUS_LABEL_DROPDOWN[ACTIVE]	= {
	"title" 		: "Current",
	"label_class" 	: "label-success",
};
DOCUMENT_CURRENT_STATUS_LABEL_DROPDOWN[DEACTIVE]		= {
	"title" 		: "Pending",
	"label_class" 	: "label-warning",
};
DOCUMENT_CURRENT_STATUS_LABEL_DROPDOWN[REJECTED]		= {
	"title" 		: "Expired",
	"label_class" 	: "label-danger",
};

//~ CURRENCY_SYMBOL = '&#8358;';
CURRENCY_SYMBOL = '$';


/** Push notification user type **/
ALL_DRIVERS			=	"all_drivers";
ALL_RIDERS			=	"all_riders";
ALL_LOGIN_DRIVERS	=	"all_login_drivers";
ALL_LOGIN_RIDERS	=	"all_login_riders";

ALL_KIDS			=	"all_kids";
ALL_TEENS			=	"all_teens";
ALL_ADULTS			=	"all_adults";
ALL_LOGIN_RIDERS	=	"all_login_riders";



USER_TYPES = {};
USER_TYPES[ALL_KIDS] = "Kid";
USER_TYPES[ALL_TEENS] = "Teen";
USER_TYPES[ALL_ADULTS] = "Adult";




/** Search status for customer **/
CORPORATES_DOCUMENT_DROPDOWN = [
	{
		status_id	: CORPORATE_LICENSE_RECORD,
		status_name	: "License",
		status_type	: CORPORATE_LICENSE_RECORD
	},
	{
		status_id	: CORPORATE_INSURANCE_RECORD,
		status_name	: "Insurance",
		status_type	: CORPORATE_INSURANCE_RECORD
	},
];



/** User type customer **/
USER_TYPE_DROPDOWN = [
	{
		status_id	: ALL_KIDS,
		status_name	: "All Kids",
		status_type	: ALL_KIDS
	},
	{
		status_id	: ALL_TEENS,
		status_name	: "All Teens",
		status_type	: ALL_TEENS
	},
	{
		status_id	: ALL_ADULTS,
		status_name	: "All Adults",
		status_type	: ALL_ADULTS
	},
	
];



/** User type customer **/
USER_PROFILE_TYPE_DROPDOWN = [
	{
		status_id	: KIDS_USER_TYPE,
		status_name	: "All Kids",
		status_type	: ALL_KIDS
	},
	{
		status_id	: TEENS_USER_TYPE,
		status_name	: "All Teens",
		status_type	: ALL_TEENS
	},
	{
		status_id	: ADULTS_USER_TYPE,
		status_name	: "All Adults",
		status_type	: ALL_ADULTS
	},
	
];



/** Search status for global (master) **/
GLOBAL_STATUS_SEARCH_DROPDOWN_NEW = [
	{
		status_id	: 	ACTIVE,
		status_name	:	"Active",
		label_class	:	"label-success",
		status_type	: 	TYPE_ACTIVE
	},
	{
		status_id	:	 DEACTIVE,
		status_name	: 	"Deactive",
		label_class	:	"label-danger",
		status_type	: 	TYPE_DEACTIVE
	}
];


CORPORATES_MODULES_LIST = [
	"5e314793decddc3f38066a7f",
	"5e314d17decddc3f38066a80",
	"5e316c963d075701fa9fd3ad",
	"5e33fc233ffafa49fc16700d",
	"5e4ce27b67a44a6f4c857b57"
];
/**For fleet type */
COMPANY 	= "company";
INDIVIDUAL 	= "individual";

FLEET_TYPE 				= {};
FLEET_TYPE[COMPANY]		= "Company";
FLEET_TYPE[INDIVIDUAL]	= "Individual";

/**For Vehicle in your fleet */
VEHICLE_IN_FLEET_LENGTH = 10;

/**For vat liable */
YES   = "yes";
NO    = "no"; 

VAT_LIABLE 		 = {};
VAT_LIABLE[YES]  = "Yes";
VAT_LIABLE[NO]   = "No";

/**For group week  */
SUNDAY    = "sunday";
MONDAY    = "monday";
TUESDAY   = "tuesday";
WEDNESDAY = "wednesday";
THURSDAY  = "thursday";
FRIDAY	  = "friday";
SATURDAY  = "saturday";

GROUP_WEEK = {};
GROUP_WEEK[SUNDAY]    = "Sunday";
GROUP_WEEK[MONDAY]    = "Monday";
GROUP_WEEK[TUESDAY]   = "Tuesday";
GROUP_WEEK[WEDNESDAY] = "Wednesday";
GROUP_WEEK[THURSDAY]  = "Thursday";
GROUP_WEEK[FRIDAY]    = "Friday";
GROUP_WEEK[SATURDAY]  = "Saturday";

/**For group payment mode */
AUTO_PAID_BY_COMPANY   = "auto_paid_by_company";
PAY_AND_GET_REIMBURSED = "pay_and_get_reimbursed"; 

PAYMENT_MODE 	 = {};
PAYMENT_MODE[AUTO_PAID_BY_COMPANY]     = "Auto-Paid By Company";
PAYMENT_MODE[PAY_AND_GET_REIMBURSED]   = "Pay & Get Reimbursed";

CORPORATE_PROFILE_STEP_ONE		= 1;
CORPORATE_PROFILE_STEP_TWO 		= 2;
CORPORATE_PROFILE_STEP_THREE 	= 3;


FLEET_PROFILE_STEP_ONE		= 1;
FLEET_PROFILE_STEP_TWO 		= 2;
FLEET_PROFILE_STEP_THREE 	= 3;


TIMEARRAY = [];
TIMEARRAY[1] = 3600;
TIMEARRAY[2] = 7200;
TIMEARRAY[3] = 10800;
TIMEARRAY[4] = 14400;
TIMEARRAY[5] = 18000;
TIMEARRAY[6] = 21600;
TIMEARRAY[7] = 25200;
TIMEARRAY[8] = 28800;
TIMEARRAY[9] = 32400;
TIMEARRAY[10] = 36000;
TIMEARRAY[11] = 39600;
TIMEARRAY[12] = 43200;
TIMEARRAY[13] = 46800;
TIMEARRAY[14] = 50400;
TIMEARRAY[15] = 54000;
TIMEARRAY[16] = 57600;
TIMEARRAY[17] = 61200;
TIMEARRAY[18] = 64800;
TIMEARRAY[19] = 68400;
TIMEARRAY[20] = 72000;
TIMEARRAY[21] = 75600;
TIMEARRAY[22] = 79200;
TIMEARRAY[23] = 82800;
TIMEARRAY[24] = 86400;

DAYS_NAME_ARRAY = [SUNDAY,MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY];

/**For wallet transaction  */
BEFORE_THREE_MONTH  = 3;
BEFORE_SIX_MONTH    = 6;
BEFORE_NINE_MONTH   = 9;
BEFORE_TWELVE_MONTH = 12;

SEARCH_MONTH = {};
SEARCH_MONTH[BEFORE_THREE_MONTH] = "Before Three Month";
SEARCH_MONTH[BEFORE_SIX_MONTH] = "Before Six Month";
SEARCH_MONTH[BEFORE_NINE_MONTH] = "Before Nine Month";
SEARCH_MONTH[BEFORE_TWELVE_MONTH] = "Before Twelve Month";


FRONT_SRC_FILE_PATH				=	"trixxie/src/";
FRONT_DIST_SETTING_FILE_PATH	=	"trixxie/dist/";

/*** JWT Configuration **/
JWT_CONFIG	=	{
	"secret": "some-secret-shit-goes-here",
	"refreshTokenSecret": "some-secret-refresh-token-shit",
	"port": 3000,
	"tokenLife": 30072000,
	"refreshTokenLife": 30072000
}

/** Restrict area dropdown **/
RESTRICT_AREA_ALL		=	"all";
RESTRICT_AREA_PICKUP	=	"pick_up";
RESTRICT_AREA_DROP_OFF	=	"drop_off";

RESTRICT_AREA_DROPDOWN = [
	{
		area_id		: RESTRICT_AREA_ALL,
		area_name	: "All",
	},
	{
		area_id		: RESTRICT_AREA_PICKUP,
		area_name	: "Pick Up",
	},
	{
		area_id		: RESTRICT_AREA_DROP_OFF,
		area_name	: "Drop Off",
	}
];

/** Restrict Type dropdown **/
RESTRICT_TYPE_DISALLOWED	=	"disallowed";
RESTRICT_TYPE_ALLOWED		=	"allowed";

RESTRICT_TYPE_DROPDOWN = [
	{
		area_id		: RESTRICT_TYPE_DISALLOWED,
		area_name	: "Disallowed",
	},
	{
		area_id		: RESTRICT_TYPE_ALLOWED,
		area_name	: "Allowed",
	}
];

/**Location type*/
AIRPORT_SURCHARGE_TYPE	=	"airport_surcharge";
RESTRICTED_AREA_TYPE	=	"restricted_area";

AIRPORT_PICK_UP_LOCATION = "airport_pick_up";
AIRPORT_DROP_OF_LOCATION = "airport_drop_of";

NORMAL_LOCATION = "normal_location";

/** Display Placement Dropdown**/
HOME_PAGE_UPPER = 'home_page_upper';
HOME_PAGE_RIGHT = 'home_page_right';
ADS_DISPLAY_PLACEMENT_DROPDOWN = [
	{
		slug	: HOME_PAGE_UPPER,
		name	: "Home Page Upper Side",
	},{
		slug	: HOME_PAGE_RIGHT,
		name	: "Home Page Right Side",
	},
]


ADS_DISPLAY_PLACEMENT_DROPDOWN_OBJ 						= {};
ADS_DISPLAY_PLACEMENT_DROPDOWN_OBJ[HOME_PAGE_UPPER] 	= "Home Page Upper Side";
ADS_DISPLAY_PLACEMENT_DROPDOWN_OBJ[HOME_PAGE_RIGHT] 	= "Home Page Right Side";




PUSH_NOTIFICATION_USER_TYPE_DROPDOWN = [
	{
		id		: ALL_KIDS,
		name	: "All Kids",
	},{
		id		: ALL_TEENS,
		name	: "All Teens",
	},{
		id		: ALL_ADULTS,
		name	: "All Adults",
	},
];

VEHICLE_TYPE_SEDAN 		= 'sedan';
VEHICLE_TYPE_HATCHBACK 	= 'hatchback';

VEHICLE_TYPE_OBJ 							= 	{};
VEHICLE_TYPE_OBJ[VEHICLE_TYPE_SEDAN]		=	"Sedan"
VEHICLE_TYPE_OBJ[VEHICLE_TYPE_HATCHBACK]	=	"Hatchback"


/** Promo code user selted global*/
PROMO_CODE_ALL_USER			=	'all_user';
PROMO_CODE_SELECTED_USER	=	'selected_user';

/** Driver Ride  conditions */
DRIVER_RIDE_CONDITIONS = {
	// is_deleted 			: 	NOT_DELETED,
	// is_admin_approved 	: 	VERIFIED,
	// active 				: 	ACTIVE,
	// user_role_id		: 	DRIVER_USER_ROLE_ID,
	// is_on_ride			: 	DEACTIVE,
	// is_online 			: 	OFFLINE,
	// is_inprocess_ride 	: 	DEACTIVE,
	
	is_deleted 			: 	NOT_DELETED,
					is_admin_approved 	: 	VERIFIED,
					active 				: 	ACTIVE,
					user_role_id		: 	DRIVER_USER_ROLE_ID,
					is_on_ride			: 	DEACTIVE,
					//is_online 			: 	OFFLINE,
					
}

/** Rider Profile Dropdown*/
RIDER_PROFILE_TYPE_DROPDOWN = [
	{
		id		: NORMAL_RIDER_TYPE,
		name	: "Normal Rider",
	},{
		id		: CORPORATE_RIDER_TYPE,
		name	: "Corporate Riders",
	}
];

CASH_PAYMENT 	= "cash";
ONLINE_PAYMENT 	= "online";
/** Payment Option Dropdown*/
PAYMENT_OPTION_DROPDOWN = [
	{
		id		: CASH_PAYMENT,
		name	: "Cash",
	},{
		id		: ONLINE_PAYMENT,
		name	: "Online",
	}
];


/** User notification on off status**/
ON_NOTIFICATION_STATUS	=	1;
OFF_NOTIFICATION_STATUS	=	0;

PERCENTAGE  = "%";

COUNTRY_STATE_CITY_URL				= 	WEBSITE_URL+ADMIN_NAME+"/country_state_city";


BCRYPT_PASSWORD_SALT_ROUNDS = 1;

/** CMS page Status **/
CMS_PAGE_STATUS = [
	{
		id 		: ACTIVE,
		text 	: "Published",
		status_type	: ACTIVE
		
	},
	{
		id 		: DEACTIVE,
		text 	: "Unpublished",
		status_type	: DEACTIVE
	}
];


/** Blog  Featured Selection **/
FIRST_POSITION 	= "featured_1",
SECOND_POSITION = "featured_2",
THIRD_POSITION 	= "featured_3",
BLOG_FEATURED_SECTION = [
	{
		id 		: FIRST_POSITION,
		text 	: "First Position",
		status_type	: FIRST_POSITION
		
	},
	{
		id 		: SECOND_POSITION,
		text 	: "Second Position",
		status_type	: SECOND_POSITION
	},
	{
		id 		: THIRD_POSITION,
		text 	: "Third Position",
		status_type	: THIRD_POSITION
	}
];

/*** Blog status **/
BLOG_PUBLISHED			=	1;
BLOG_UNPUBLISHED		=	2;
BLOG_TRENDING			=	3;
BLOG_NOT_TRENDING		=	4;
BLOG_FEATURED			=	5;
BLOG_NOT_FEATURED		=	6;

BLOG_STATUS_NAMES	=	{};
BLOG_STATUS_NAMES[BLOG_PUBLISHED]		=	'Published';
BLOG_STATUS_NAMES[BLOG_UNPUBLISHED]		=	'Unpublished';
BLOG_STATUS_NAMES[BLOG_TRENDING]		=	'Trending';
BLOG_STATUS_NAMES[BLOG_NOT_TRENDING]	=	'Not Trending';
BLOG_STATUS_NAMES[BLOG_FEATURED]		=	'Featured';
BLOG_STATUS_NAMES[BLOG_NOT_FEATURED]	=	'Not Featured';

/** Search status for blog **/
BLOG_STATUS_SEARCH_DROPDOWN = [
	{
		status_id	: BLOG_PUBLISHED,
		status_name	: BLOG_STATUS_NAMES[BLOG_PUBLISHED],
	},
	{
		status_id	: BLOG_UNPUBLISHED,
		status_name	: BLOG_STATUS_NAMES[BLOG_UNPUBLISHED],
	},
	{
		status_id	: BLOG_TRENDING,
		status_name	: BLOG_STATUS_NAMES[BLOG_TRENDING]
	},
	{
		status_id	: BLOG_NOT_TRENDING,
		status_name	: BLOG_STATUS_NAMES[BLOG_NOT_TRENDING]
	},
	{
		status_id	: BLOG_FEATURED,
		status_name	: BLOG_STATUS_NAMES[BLOG_FEATURED]
	},
	{
		status_id	: BLOG_NOT_FEATURED,
		status_name	: BLOG_STATUS_NAMES[BLOG_NOT_FEATURED]
	},
];


KIDS_USER_MINIMUM_ALLOWED_AGE =5 ;
KIDS_USER_MAXIMUM_ALLOWED_AGE = 11;

TEENS_USER_MINIMUM_ALLOWED_AGE =12 ;
TEENS_USER_MAXIMUM_ALLOWED_AGE = 18;

ADULTS_USER_MINIMUM_ALLOWED_AGE =19 ;
ADULTS_USER_MAXIMUM_ALLOWED_AGE = 200;

/**encrypt deccrypt API key for crypto**/
CRYPTO_ENCRYPT_DECRYPT_API_KEY	= "123456$#@$^@1ERF123456$#@$^@1ERF";
CRYPTO_ENCRYPT_DECRYPT_API_IV	= "123456$#@$^@1ERF";
JWT_ENCRYPT_DECRYPT_API_KEY		= "123456$#@$^@1ERF";

RELATED_POSTS_LIMIT = 5;
POSTS_HISTORY_LIMIT = 15;
FOLLOW_REQUEST_ACCEPT = "accept";
FOLLOW_REQUEST_REJECT = "reject";

CLOSE_FRIEND_ADD = "add";
CLOSE_FRIEND_REMOVE = "remove";

FOLLOW_ACTION_TYPE = "follow";
SUBSCRIBE_ACTION_TYPE = "subscribe";

FOLLOW_REQUEST_PENDING	=	2;

/** Search post for age type **/
POST_FOR_AGE_TYPE = [
	{
		status_id	: "kid",
		status_name	: "Kid",
		
	},
	{
		status_id	: "teen",
		status_name	: "Teen",
		
	},
	{
		status_id	: "adult",
		status_name	: "Adult",
		
	},
];

CAMPAIGN_BUDGET_MIN_VLAUE = 20;

/** For campaign images and videos file directory path and url*/
CAMPAIGN_FILE_PATH		=	WEBSITE_UPLOADS_ROOT_PATH+"campaign/";
CAMPAIGN_URL			=	WEBSITE_PUBLIC_UPLOADS_PATH+"campaign/";

CAMPAIGN_SHOW_AFTER_POST = 5;

INDIVIDUAL_CAMPAIGN = 'individual';
COMPANY_CAMPAIGN = 'company';

CAMPAIGN_DROPDOWN = [
	{
		slug	: INDIVIDUAL_CAMPAIGN,
		name	: "Individual",
	},{
		slug	: COMPANY_CAMPAIGN,
		name	: "Company",
	},
]

CAMPAIGN_DROPDOWN_OBJ 							= {};
CAMPAIGN_DROPDOWN_OBJ[INDIVIDUAL_CAMPAIGN] 		= "Individual";
CAMPAIGN_DROPDOWN_OBJ[COMPANY_CAMPAIGN] 		= "Company";  

DROPDOWN_FOR_AGE_TYPE = [
	{
		id		: "kid",
		name	: "Kid",
		
	},
	{
		id		: "teen",
		name	: "Teen",
		
	},
	{
		id		: "adult",
		name	: "Adult",
		
	},
];


AGE_ROLE_INTEREST_URL				= 	WEBSITE_URL+ADMIN_NAME+"/users";

POST_PRIVACY_PUBLIC = "Public";
POST_PRIVACY_FRIENDS = "Friends";
POST_PRIVACY_CLOSE_FRIENDS = "Close Friends";
CAMPAIGN_RUNNING = "running";
CAMPAIGN_EXPIRE = "expire";
CAMPAIGN_BUDGET_FIXED_VALUE_FOR_ADMIN = 10;

TESTIMONIAL_DESCRIPTION_MIN_LENGTH 	= 	10;
TESTIMONIAL_DESCRIPTION_MAX_LENGTH 	= 	250;

/** For splash screens images file directory path and url*/
TESTIMONIAL_SCREENS_FILE_PATH	= 	WEBSITE_UPLOADS_ROOT_PATH+"testimonial/";
TESTIMONIAL_SCREENS_IMG_URL		= 	WEBSITE_PUBLIC_UPLOADS_PATH+"testimonial/";


DEFAULT_LIMIT_FRONT	=	21;
DEFAULT_SKIP_FRONT	=	20;
FAQ_LIMIT = 21;

TAXONOMY_TYPE_PLATFORM		=	"platform";
TAXONOMY_TYPE_CATEGORY		=	"category";
TAXONOMY_TYPE_FEATURES		=	"features";
TAXONOMY_TYPE_TAGS			=	"tags";
REVIEW_TYPE_NEW				=	"new";
REVIEW_TYPE_UPDATE_REQUEST	=	"update_request";