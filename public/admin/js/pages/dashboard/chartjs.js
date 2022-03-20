$(function () {
	//riderDonutChart();
	//driverDonutChart();
    new Chart(document.getElementById("bar_chart").getContext("2d"), getChartJs());
});

function getChartJs() {
    var config 			= 	null;
    var monthsArray 	=   getPreviousMonths();

	console.log(userRecords);
   
	$.each(userRecords, function(index,html){
		for(var i=0; i < monthsArray.length; i++) {
			if(typeof html[monthsArray[i]['month_year']] !== typeof undefined){
				monthsArray[i]['total_kids'] 	= (html[monthsArray[i]['month_year']]['total_kids'])  ? html[monthsArray[i]['month_year']]['total_kids'] : 0;
				monthsArray[i]['total_teens'] = (html[monthsArray[i]['month_year']]['total_teens']) ? html[monthsArray[i]['month_year']]['total_teens'] : 0;
				monthsArray[i]['total_adults'] = (html[monthsArray[i]['month_year']]['total_adults']) ? html[monthsArray[i]['month_year']]['total_adults'] : 0;
				monthsArray[i]['total_posts'] = (html[monthsArray[i]['month_year']]['total_posts']) ? html[monthsArray[i]['month_year']]['total_posts'] : 0;
				monthsArray[i]['total_campaign'] = (html[monthsArray[i]['month_year']]['total_campaign']) ? html[monthsArray[i]['month_year']]['total_campaign'] : 0;
			}
		}
	});

	var months		= [];
	var riderCount 	= [];
	var driverCount = [];
	var corporateCount = [];
	var postsCount = [];
	var campaignCount = [];
	for(var i=0; i < monthsArray.length; i++) {
		months.push(monthsArray[i]['name']);
		if(typeof monthsArray[i]['total_kids'] !== typeof undefined){
			riderCount.push(monthsArray[i]['total_kids']);
		}else{
			riderCount.push(0);
		}
		if(typeof monthsArray[i]['total_teens'] !== typeof undefined){
			driverCount.push(monthsArray[i]['total_teens']);
		}else{
			driverCount.push(0);
		}
		if(typeof monthsArray[i]['total_adults'] !== typeof undefined){
			corporateCount.push(monthsArray[i]['total_adults']);
		}else{
			corporateCount.push(0);
		}
		if(typeof monthsArray[i]['total_posts'] !== typeof undefined){
			postsCount.push(monthsArray[i]['total_posts']);
		}else{
			postsCount.push(0);
		}

		if(typeof monthsArray[i]['total_campaign'] !== typeof undefined){
			campaignCount.push(monthsArray[i]['total_campaign']);
		}else{
			campaignCount.push(0);
		}
	}

	config = {
		type: 'bar',
		data: {
			labels: months.reverse(),
			datasets: [
				{
					label: "Kids",
					data: riderCount.reverse(),
					backgroundColor: 'rgba(233, 30, 99, 0.8)'
				},
				{
					label: "Teens",
					data: driverCount.reverse(),
					backgroundColor: 'rgba(0, 128, 0, 128)'
				},
				{
					label: "Adults",
					data: corporateCount.reverse(),
					backgroundColor: 'rgba(154, 18, 179, 1)'
				},
				{
					label: "Posts",
					data: postsCount.reverse(),
					backgroundColor: 'rgba(34, 150, 243, 1)'
				},
				{
					label: "Campaign",
					data: campaignCount.reverse(),
					backgroundColor: 'rgba(244, 67, 54, 1)'
				},
			]
		},
		options: {
			maintainAspectRatio: false,
			responsive: true,
			legend: {
				display		:	true,
				fullWidth	: 	true,
				position 	:	"top",
				labels		: 	{
					fontColor: 'rgb(255, 99, 132)'
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						userCallback: function(label, index, labels) {
							if (Math.floor(label) === label) {
								return label;
							}
						},
					}
				}],
			}
		},

	};
    return config;
}

function getPreviousMonths(){
    var theMonths = new Array("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12");
    var theMonthNames = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    var today = new Date();

    var aMonth 	= today.getMonth();
    var aYear 	= today.getFullYear();

    var i;
    var monthList = new Array();

    for (i=0; i<12; i++) {
        monthList[i] 				=	{};
        monthList[i]['month_year'] 	=  	theMonths[aMonth]+'-'+aYear;
        monthList[i]['name'] 		=	theMonthNames[aMonth]+' '+aYear;
        aMonth--;
        if (aMonth < 0) {
            aMonth = 11;
            aYear--;
        }
    }
    return monthList;
}


/**Rider chart on dashboard**/
function riderDonutChart() {
    Morris.Donut({
        element: 'rider_donut_chart',
        data: [{
            label: 'Completed',
            value: ridesResult['complete_ride_percentage']
        }, {
            label: 'Cancelled',
            value: ridesResult['cancel_ride_percentage']
        }, {
            label: 'On Going',
            value: ridesResult['on_going_percentage']
        }],
        colors: ['rgb(233, 30, 99)', 'rgb(0, 188, 212)', 'rgb(255, 152, 0)'],
        formatter: function (y) {
            return y + '%'
        }
    });
}
/**Driver chart on dashboard**/
function driverDonutChart() {
    Morris.Donut({
        element: 'driver_donut_chart',
        data: [{
            label: 'Active',
            value: driverResult['active_driver_percentage']
        }, {
            label: 'Pending',
            value: driverResult['pending_driver_percentage']
        }],
        colors: ['rgb(33, 101, 0)', 'rgb(183, 216, 0)',],
        formatter: function (y) {
            return y + '%'
        }
    });
}

