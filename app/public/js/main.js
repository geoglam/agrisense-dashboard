require([], function() {
	var onaClient;
	var geojsonMarkerOptions = {
			radius: 8,
			fillColor: "#009688",
			color: "#fff",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
	};
	var myStyle = {
    "color": "#635B5B",
    "weight": 2,
    "opacity": 9,
		"fillOpacity": 0,
};
	var district_boundary = new L.geoJson(null,{
		style: myStyle,
		onEachFeature: function (feature, layer) {
			var html = "";
			html += "<b>District:</b> " + feature.properties.District + "<br/>"
			layer.bindPopup(html);
		}
	});
	var end_of_season_assessment = new L.geoJson();
	var in_season_assessment = new L.geoJson(null,{
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, geojsonMarkerOptions);
		},
		onEachFeature: function (feature, layer) {
			var html = ""
			html += "<b>District:</b> " + feature.properties.District + "<br/>"
			html += "<b>Crop:</b> "+feature.properties.agricultur + "<br/>"
			html += "<b>Comments:</b> "+feature.properties.comments + "<br/>"
			if (feature.properties.crop_con_7 !="n/a"){
			html += "<img width='150px' src='http://52.23.108.108/media/agrisense/attachments/"+feature.properties.crop_con_7.split(".")[0]+".jpg' />"  +"<br/>"
			}

			layer.bindPopup(html);
		}
	});
	var pre_season_assessment = new L.geoJson();
	var map;
	var gData;
	var layer;
	var layerLabels;
	var current_district_data = new L.geoJson(

	);
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

		$('#districts').change(function(){
			map.removeLayer(in_season_assessment);
			map.removeLayer(current_district_data);
			if ($(this).val() == "all") {
				generateCropTypeChart("*");
				generateMaizeDevelopmentStage("*");
				generateMaizeHeightChart("*");
				generateIrrigated("*");
				generateWeeded("*");
				farmerAssessmentCondition("*");
				generateMaizeFoodPriceChart("*");
				generateFoodPriceRice("*");
				generateFoodPriceCassava("*");
				generateFoodPriceBeans("*");
				in_season_assessment.addTo(map);
				map.fitBounds(in_season_assessment.getBounds());

			}else{
				generateCropTypeChart($(this).val());
				generateMaizeDevelopmentStage($(this).val());
				generateMaizeHeightChart($(this).val());
				generateIrrigated($(this).val());
				generateWeeded($(this).val());
				farmerAssessmentCondition($(this).val());
				generateMaizeFoodPriceChart($(this).val());
				generateFoodPriceRice($(this).val());
				generateFoodPriceCassava($(this).val());
				generateFoodPriceBeans($(this).val());
				setMapDataToDistrict($(this).val());
			}

		})
	}

	function setMapDataToDistrict(district){
		current_district_data = L.geoJson(gData, {
			pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    	},
			filter: function(feature, layer) {
					return feature.properties.District == district;
			},
			onEachFeature: function (feature, layer) {
				var html = ""
				html += "<b>District:</b> " + feature.properties.District + "<br/>"
				html += "<b>Crop:</b> "+feature.properties.agricultur + "<br/>"
				html += "<b>Comments:</b> "+feature.properties.comments + "<br/>"
				if (feature.properties.crop_con_7 !="n/a"){
				html += "<img width='150px' src='http://52.23.108.108/media/agrisense/attachments/"+feature.properties.crop_con_7.split(".")[0]+".jpg' />"  +"<br/>"
				}

				layer.bindPopup(html);
			}
		});
		map.fitBounds(current_district_data.getBounds());
		//map.addLayer(current_district_data);
		current_district_data.addTo(map);
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
		var request = $.ajax({
			dataType: "json",
			url: url,
			async:false,
			success: function(data) {
				gData = data;
		  	$(data.features).each(function(key, data) {
		        geojson.addData(data);
		    });
			}
		}).error(function() {});
	}

	function setDistrictsItems(){
		var form = $('#formlist').val();
		if (form == 'in'){
			var districts = _.uniq(in_season_assessment.getLayers().map(function(row){
				row.feature.properties
				return row.feature.properties.District ? row.feature.properties.District : 'other';
			}));
			var html = "<option value='all'>All</option>";
			districts.sort();
			$(districts).each(function(key,data){
				html += "<option value='"+data+"'>"+data+"</option>";
			})
			$("#districts").html(html);
			$("#districts").material_select();
		}
	}

	function getData(district,field){
		var data = []
		if (district == "*"){
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties[field]})
		}else{
			data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
			data = data.map(function(row){return row.feature.properties[field]})
		}
		return data
	}

	function generateMaizeDevelopmentStage(district){
		var data = getData(district,"select_med");
		data = data.filter(function(row){
			return row != "n/a"
		});
		var total = data.length;
		var uniq = _.uniq(data);
		var categories = uniq.map(function(row){
			return row.replace("_"," ")
		})
		var chart_data = uniq.map(function(row){
			return ((_.countBy(data)[row])/total) *100
		});

		$('#chart2').highcharts({
		        chart: {type: 'bar'},
		        title: {text: 'Maize Development Stage'},
		        xAxis: {categories: categories,title: {text: null}},
		        yAxis: {min: 0,title: {text: '',align: 'high'},labels: {overflow: 'justify'}},
		        tooltip: {pointFormat: '{point.y:.2f}',valueSuffix: ' percentage'},
		        plotOptions: {bar: {dataLabels: {format:"{y:.2f}",enabled: true}}},
		        legend: {enabled:false},
		        credits: {enabled: false},
		        series: [{
		            data: chart_data
		        }]
		    });
	}
	function farmerAssessmentCondition(district){
		var data = getData(district,"farmer_ass");
		data = data.filter(function(row){
			return row != "n/a"
		});
		var total = data.length;
		var uniq = _.uniq(data);
		var categories = uniq.map(function(row){
			return row.replace("_"," ")
		})
		var chart_data = uniq.map(function(row){
			return ((_.countBy(data)[row])/total) *100
		});

		$('#chart6').highcharts({
						chart: {type: 'bar'},
						title: {text: 'Farmer Assessment of Condition'},
						xAxis: {categories: categories,title: {text: null}},
						yAxis: {min: 0,title: {text: '',align: 'high'},labels: {overflow: 'justify'}},
						tooltip: {pointFormat: '{point.y:.2f}',valueSuffix: ' percentage'},
						plotOptions: {bar: {dataLabels: {format:"{y:.2f}",enabled: true}}},
						legend: {enabled:false},
						credits: {enabled: false},
						series: [{
								data: chart_data
						}]
				});
	}

	function generateCropTypeChart(district){
		var data;
		if (district == "*"){
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.agricultur})
		}else{
			data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
			data = data.map(function(row){return row.feature.properties.agricultur})
		}
		var unique_crops = _.uniq(data);
		var chartData = unique_crops.map(function(row){
			return {
			 	name:row,
			 	y:_.countBy(data)[row],
			 }
		})

		$('#chart1').highcharts({
	        chart: {plotBackgroundColor: null,plotBorderWidth: null,plotShadow: false,type: 'pie'},
	        title: {text: 'Crop Types'},
	        tooltip: {pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'},
	        plotOptions: {pie: {allowPointSelect: true,cursor: 'pointer',dataLabels: {enabled: true,format: '<b>{point.name}</b>: {point.y}',style: {color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'}}}},
					credits: {enabled: false},
					series: [{
	            name: 'Crops',
	            colorByPoint: true,
	            data:chartData
	        }]
	    });

	}
	function countInRange(data,high,low,binStep){
		var count = 0;
		for (var i = 0; i < data.length; i++) {
			if (binStep == 0 ){
				if(data[i] <=high){
					count = count + 1
				}
			}else{
				if (data[i] > low & data[i] <= high){
					count = count + 1
				}
			}

		}
		return count
	}
	function generateFoodPriceBeans(district){
		var bins = [800,1000,1200,1400,1600,1800,2000,2200,2400,2600,2800]
		var step = 200

		if (district == "*"){
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.food_pri_3})
		}else{
			data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
			data = data.map(function(row){return row.feature.properties.food_pri_3})
		}


		data = data.filter(function(row){
			return row !="n/a"
		});



		var total = data.length -1;
		var binStep = 0;
		var binCounts = []
		for (var i = 0; i < bins.length-1; i++) {
			var high = bins[i]
			var low = bins[i] - step
			var binCount = (countInRange(data,high,low,binStep)/total)*100
			binCounts.push([bins[i],binCount]);
			binStep = binStep+1;
		}
		$('#chart9').highcharts({
				chart: {type: 'column'},
				title: {text: 'Food Prices Beans'},
				xAxis: {type: 'category',title:{text:"Food Prices Beans"},labels: {rotation: -45,style: {fontSize: '13px',fontFamily: 'Verdana, sans-serif'}}},
				yAxis: {min: 0,title: {text: 'Frequency in percentage'}},
				legend: {enabled: false},
				credits: {enabled: false},
				tooltip: {pointFormat: 'Food Prices Beans <b>{point.y:.1f}%</b>'},
				series: [{
						name: 'Food Prices Beans',
						data: binCounts,
						dataLabels: {
								enabled: true,
								rotation: 0,
								color: '#FFFFFF',
								align: 'right',
								format: '{point.y:.1f}%', // one decimal
								y: 10, // 10 pixels down from the top
								style: {
										fontSize: '13px',
										fontFamily: 'Verdana, sans-serif'
								}
						}
				}]
		});
	}

	function generateFoodPriceCassava(district){
		var bins = [100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700]
		var step = 100

		if (district == "*"){
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.food_pri_2})
		}else{
			data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
			data = data.map(function(row){return row.feature.properties.food_pri_2})
		}

		data = data.filter(function(row){
			return row !="n/a"
		});

		var total = data.length -1;
		var binStep = 0;
		var binCounts = []
		for (var i = 0; i < bins.length-1; i++) {
			var high = bins[i]
			var low = bins[i] - step
			var binCount = (countInRange(data,high,low,binStep)/total)*100
			binCounts.push([bins[i],binCount]);
			binStep = binStep+1;
		}
		$('#chart8').highcharts({
				chart: {type: 'column'},
				title: {text: 'Food Prices Cassava'},
				xAxis: {type: 'category',title:{text:"Food Prices Cassava"},labels: {rotation: -45,style: {fontSize: '13px',fontFamily: 'Verdana, sans-serif'}}},
				yAxis: {min: 0,title: {text: 'Frequency in percentage'}},
				legend: {enabled: false},
				credits: {enabled: false},
				tooltip: {pointFormat: 'Food Prices Cassava <b>{point.y:.1f}%</b>'},
				series: [{
						name: 'Food Prices Cassava',
						data: binCounts,
						dataLabels: {
								enabled: true,
								rotation: 0,
								color: '#FFFFFF',
								align: 'right',
								format: '{point.y:.1f}%', // one decimal
								y: 10, // 10 pixels down from the top
								style: {
										fontSize: '13px',
										fontFamily: 'Verdana, sans-serif'
								}
						}
				}]
		});
	}

	function generateFoodPriceRice(district){
		var bins = [200,400,600,800,1000,1200,1400,1600,1800,2000,2200,2400,2600,2800,3000]
		var step = 200

		if (district == "*"){
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.food_pri_1})
		}else{
			data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
			data = data.map(function(row){return row.feature.properties.food_pri_1})
		}

		data = data.filter(function(row){
			return row !="n/a"
		});

		var total = data.length -1;
		var binStep = 0;
		var binCounts = []
		for (var i = 0; i < bins.length-1; i++) {
			var high = bins[i]
			var low = bins[i] - step
			var binCount = (countInRange(data,high,low,binStep)/total)*100
			binCounts.push([bins[i],binCount]);
			binStep = binStep+1;
		}
		$('#chart4').highcharts({
				chart: {type: 'column'},
				title: {text: 'Food Prices Rice'},
				xAxis: {type: 'category',title:{text:"Food Prices Rice"},labels: {rotation: -45,style: {fontSize: '13px',fontFamily: 'Verdana, sans-serif'}}},
				yAxis: {min: 0,title: {text: 'Frequency in percentage'}},
				legend: {enabled: false},
				credits: {enabled: false},
				tooltip: {pointFormat: 'Food Prices Rice <b>{point.y:.1f}%</b>'},
				series: [{
						name: 'Food Prices Rice',
						data: binCounts,
						dataLabels: {
								enabled: true,
								rotation: 0,
								color: '#FFFFFF',
								align: 'right',
								format: '{point.y:.1f}%', // one decimal
								y: 10, // 10 pixels down from the top
								style: {
										fontSize: '13px',
										fontFamily: 'Verdana, sans-serif'
								}
						}
				}]
		});
	}

	function generateMaizeHeightChart(district){
		var bins = [0.5,1.0,1.5,2.0,2.5,3.0,4.0,5.0,6.0]
		var step = 0.5
		if (district == "*"){
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.crop_condi})
		}else{
			data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
			data = data.map(function(row){return row.feature.properties.crop_condi})
		}
		data = data.filter(function(row){
			return row !="n/a"
		});
		data = data.sort()
		var total = data.length -1;
		var binStep = 0;
		var binCounts = []
		for (var i = 0; i < bins.length-1; i++) {
			var high = bins[i]
			var low = bins[i] - step
			var binCount = (countInRange(data,high,low,binStep)/total)*100
			binCounts.push([bins[i],binCount]);
			binStep = binStep+1;
		}
		$('#chart3').highcharts({
        chart: {type: 'column'},
        title: {text: 'Maize Height'},
        xAxis: {type: 'category',title:{text:"Maize Hight (meters)"},labels: {rotation: -45,style: {fontSize: '13px',fontFamily: 'Verdana, sans-serif'}}},
        yAxis: {min: 0,title: {text: 'Frequency in percentage'}},
        legend: {enabled: false},
				credits: {enabled: false},
        tooltip: {pointFormat: 'Maize Height <b>{point.y:.1f}%</b>'},
        series: [{
            name: 'Maize Height',
            data: binCounts,
            dataLabels: {
                enabled: true,
                rotation: 0,
                color: '#FFFFFF',
                align: 'right',
                format: '{point.y:.1f}%', // one decimal
                y: 10, // 10 pixels down from the top
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    });
	}
	function generateMaizeFoodPriceChart(district){
		var bins = [300,400,500,600,700,800,900,1000,1500,2000]
		var step = 100
		if (district == "*"){
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.food_price})
		}else{
			data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
			data = data.map(function(row){return row.feature.properties.food_price})
		}
		data = data.filter(function(row){
			return row !="n/a"
		});

		data = data.sort();
		var total = data.length -1;
		var binStep = 0;
		var binCounts = []
		var temp = 0;
		for (var i = 0; i < bins.length-1; i++) {
			var high = bins[i]
			var low = bins[i] - step
			var binCount = (countInRange(data,high,low,binStep)/total)*100

			temp = temp +countInRange(data,high,low,binStep);
			binCounts.push([bins[i],binCount]);
			binStep = binStep+1;
		}

		$('#chart7').highcharts({
        chart: {type: 'column'},
        title: {text: 'Food Prices Maize'},
        xAxis: {type: 'category',title:{text:"Food Prices Maize"},labels: {rotation: -45,style: {fontSize: '13px',fontFamily: 'Verdana, sans-serif'}}},
        yAxis: {min: 0,title: {text: 'Frequency in percentage'}},
        legend: {enabled: false},
				credits: {enabled: false},
        tooltip: {pointFormat: '<b>{point.y:.1f}%</b>'},
        series: [{
            name: 'Food Prices Maize',
            data: binCounts,
            dataLabels: {
                enabled: true,
                rotation: 0,
                color: '#FFFFFF',
                align: 'right',
                format: '{point.y:.1f}%', // one decimal
                y: 10, // 10 pixels down from the top
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    });



	}

	function generateIrrigated(district){
		if (district == "*"){
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.management})
		}else{
			data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
			data = data.map(function(row){return row.feature.properties.management})
		}
		data = data.filter(function(row){
			return row !="n/a"
		})
		var categories = _.uniq(data);

		var chartData = categories.map(function(row){
			return {
				name:row,
				y:_.countBy(data)[row],
			 }
		})
		$('#chart0').highcharts({
					chart: {plotBackgroundColor: null,plotBorderWidth: null,plotShadow: false,type: 'pie'},
					title: {text: 'Crop Irrigated'},
					tooltip: {pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'},
					plotOptions: {pie: {allowPointSelect: true,cursor: 'pointer',dataLabels: {enabled: true,format: '<b>{point.name}</b>: {point.y}',style: {color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'}}}},
					credits: {enabled: false},
					series: [{
							name: 'Crop Irrigated',
							colorByPoint: true,
							data:chartData
					}]
			});
	}

	function generateWeeded(district){
		if (district == "*"){
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.manageme_1})
		}else{
			data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
			data = data.map(function(row){return row.feature.properties.manageme_1})
		}
		data = data.filter(function(row){
			return row !="n/a"
		})
		var categories = _.uniq(data);

		var chartData = categories.map(function(row){
			return {
				name:row,
				y:_.countBy(data)[row],
			 }
		})
		$('#chart5').highcharts({
					chart: {plotBackgroundColor: null,plotBorderWidth: null,plotShadow: false,type: 'pie'},
					title: {text: 'Crop Weeded'},
					tooltip: {pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'},
					plotOptions: {pie: {allowPointSelect: true,cursor: 'pointer',dataLabels: {enabled: true,format: '<b>{point.name}</b>: {point.y}',style: {color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'}}}},
					credits: {enabled: false},
					series: [{
							name: 'Crop Weeded',
							colorByPoint: true,
							data:chartData
					}]
			});
	}

	function loadCharts(){
		debugger
	}
	function setBasemap(basemap) {
	if (layer) {
		map.removeLayer(layer);
	}

	layer = L.esri.basemapLayer(basemap);

	map.addLayer(layer);

	if (layerLabels) {
		map.removeLayer(layerLabels);
	}

	if (basemap === 'ShadedRelief'
	 || basemap === 'Oceans'
	 || basemap === 'Gray'
	 || basemap === 'DarkGray'
	 || basemap === 'Imagery'
	 || basemap === 'Terrain'
 ) {
		layerLabels = L.esri.basemapLayer(basemap + 'Labels');
		map.addLayer(layerLabels);
	}
}
function changeBasemap(basemap){
	setBasemap(basemap);
}
	function initMap(){
		map = L.map('map',{
			fullscreenControl: true,
			// OR
			fullscreenControl: {
					pseudoFullscreen: false // if true, fullscreen to page width and height
			}
		}).setView([-6.489983, 35.859375], 6);
		layer = L.esri.basemapLayer('Topographic').addTo(map);
		// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	  //   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		// }).addTo(map);
		map.on('fullscreenchange', function () {
			if (map.isFullscreen()) {
			    console.log('entered fullscreen');
			} else {
			    console.log('exited fullscreen');
			}
		});


		current_district_data.addTo(map);

		district_boundary.addTo(map);
		addGeoJSON("data/TZdistricts_2012.geojson",district_boundary);

		// end_of_season_assessment.addTo(map);
		// addGeoJSON("data/disctrict_join_end_of_season_assessment.geojson",end_of_season_assessment);

		in_season_assessment.addTo(map);
		addGeoJSON("data/disctrict_join_in_season_assessment.geojson",in_season_assessment);
		map.fitBounds(in_season_assessment.getBounds());

		// current_district_data.addTo(map);
		// pre_season_assessment.addTo(map);
		// addGeoJSON("data/disctrict_join_in_season_assessment.geojson",current_district_data);

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

		$("#basemaps").change(function(){
			changeBasemap(this.value);
		})


		stopSplashScreen();
		initMap();
		setDistrictsItems();
		generateCropTypeChart("*");
		generateMaizeDevelopmentStage("*");
		generateMaizeHeightChart("*");
		generateIrrigated("*")
		generateWeeded("*");
		farmerAssessmentCondition("*");
		generateMaizeFoodPriceChart("*");
		generateFoodPriceRice("*");
		generateFoodPriceCassava("*");
		generateFoodPriceBeans("*")
		// getAllForms();

	}

	$(document).ready(function() {
		init();
	});

});
