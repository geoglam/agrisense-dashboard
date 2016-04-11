require([], function() {
	var onaClient;
	//agrisense
	//Jambula
	function getAllForms(){
		onaClient.getForms(function(data){
			var html = '';
			for (var i = 0; i < data.length; i++) {
				html += "<option>"+data[i].title+"</option>";
			}
			$("#formlist").html(html);
			resetMasterialSelect();
		});
	}

	function resetMasterialSelect(){
		$('select').material_select();
	}

	function stopSplashScreen(){
		$( "#loading" ).animate({
				opacity: 0,
				display:'none',
			},1000, function() {
				this.remove();
		});
	}

	function addGeoJSON(url, geojson){
		$.ajax({
			dataType: "json",
			url: url,
			success: function(data) {
		  	$(data.features).each(function(key, data) {
		        geojson.addData(data);
		    });
			}
		}).error(function() {});
	}
	function districtsChange(value){
		console.log(value);
	}

	function setDistrictsItems(url){
		$.ajax({
			dataType: "json",
			url: url,
			success: function(data) {
				var html = "<option>All</option>";
				var districts =[]
		  	$(data.features).each(function(key, data) {
						districts.push(data.properties.District);
						// html += "<option>"+data.properties.District+"</option>";
		    });
				districts.sort();
				// view-source:http://techslides.com/demos/leaflet/leaflet-country-zoom.html
				$(districts).each(function(key,data){
					html += "<option value='"+data+"'>"+data+"</option>";
				})
				$("#districts").html(html);
				$('#districts').change(function(){
					districtsChange(this.value)
					// actions.changeVillage(this.value)
				});
				$('select').material_select();
			}
		}).error(function() {});
	}
	function initMap(){
		var map = L.map('map').setView([-6.489983, 35.859375], 6);
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		var district_boundary = new L.geoJson();
		district_boundary.addTo(map);
		addGeoJSON("data/TZdistricts_2012.geojson",district_boundary);
		setDistrictsItems('data/TZdistricts_2012.geojson')

		var end_of_season_assessment = new L.geoJson();
		end_of_season_assessment.addTo(map);
		addGeoJSON("data/disctrict_join_end_of_season_assessment.geojson",end_of_season_assessment);

		var in_season_assessment = new L.geoJson();
		in_season_assessment.addTo(map);
		addGeoJSON("data/disctrict_join_in_season_assessment.geojson",in_season_assessment);

		var pre_season_assessment = new L.geoJson();
		pre_season_assessment.addTo(map);
		addGeoJSON("data/district_join_pre_season_assessment.geojson",pre_season_assessment);

		$.ajax({
			dataType: "json",
			url: 'data/disctrict_join_in_season_assessment.geojson',
			success: function(data) {
				var crops = []

				$(data.features).each(function(key, data) {
					crops.push(data.properties.agricultur);
				});
				unique_crops = _.uniq(crops);
				chart_object = []
				for (var i = 0; i < unique_crops.length; i++) {

					 var obj = {
						name:unique_crops[i],
						y:_.countBy(crops)[unique_crops[i]],
						}
					chart_object.push(obj);
				}

				$('#chart1').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Crop Types'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.y}',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Crops',
            colorByPoint: true,
            data:chart_object
        }]
    });



			}
		}).error(function() {});
		  // var data = getData({owner:user.username},function(data){
		  // 	console.log(data);
		  // });
	}

	function init(){
		resetMasterialSelect();
		var siteObject = {
			url:'http://52.23.108.108/api/v1/',
			token:'ssfdk343434'
		}
		onaClient = new OnaClient(siteObject);

		$('.dropdown-button').dropdown({
			inDuration: 300,
			outDuration: 225,
			constrain_width: false,
			hover: true,
			gutter: 10,
			belowOrigin: true,
			alignment: 'right'
		});

		stopSplashScreen();
		initMap();
		// getAllForms();

	}

	$(document).ready(function() {
		init();
	});

});
