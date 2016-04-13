require([], function() {
	var onaClient;
	var district_boundary = new L.geoJson();
	var end_of_season_assessment = new L.geoJson();
	var in_season_assessment = new L.geoJson();
	var pre_season_assessment = new L.geoJson();
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
			if ($(this).val() == "all") {
				generateCropTypeChart("*");
				generateMaizeDevelopmentStage("*");
			}else{
				generateCropTypeChart($(this).val());
				generateMaizeDevelopmentStage($(this).val());
			}

		})
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
		  	$(data.features).each(function(key, data) {
		        geojson.addData(data);
		    });
			}
		}).error(function() {});
	}
	function districtsChange(value){
		console.log(value);
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
			data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.select_med})
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
		})
		var total = data.length;

		var uniq = _.uniq(data);
		// (_.countBy(data)[row]/total)*100
		var chart_data = uniq.map(function(row){
			return ((_.countBy(data)[row])/total) *100
		})

		console.log(chart_data);

		$('#chart2').highcharts({
		        chart: {
		            type: 'bar'
		        },
		        title: {
		            text: 'Maize Development Stage'
		        },
		        xAxis: {
		            categories: uniq,
		            title: {
		                text: null
		            }
		        },
		        yAxis: {
		            min: 0,
		            title: {
		                text: '',
		                align: 'high'
		            },
		            labels: {
		                overflow: 'justify'
		            }
		        },
		        tooltip: {
		            valueSuffix: ' percentage'
		        },
		        plotOptions: {
		            bar: {
		                dataLabels: {
		                    enabled: true
		                }
		            }
		        },
		        legend: {
		            layout: 'vertical',
								enabled:false,
		            align: 'right',
		            verticalAlign: 'top',
		            x: -40,
		            y: 80,
		            floating: true,
		            borderWidth: 1,
		            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
		            shadow: true
		        },
		        credits: {
		            enabled: false
		        },
		        series: [{
		            data: chart_data
		        }]
		    });


		// var data;
		// if (district == "*"){
		// 	data = in_season_assessment.getLayers().map(function(row){return row.feature.properties.select_med})
		// }else{
		// 	data = in_season_assessment.getLayers().filter(function(row){return row.feature.properties.District == district});
		// 	data = data.map(function(row){return row.feature.properties.select_med})
		// }
		// console.log(data)
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
	function loadCharts(){
		debugger
	}
	function initMap(){
		var map = L.map('map').setView([-6.489983, 35.859375], 6);
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		district_boundary.addTo(map);
		addGeoJSON("data/TZdistricts_2012.geojson",district_boundary);

		end_of_season_assessment.addTo(map);
		addGeoJSON("data/disctrict_join_end_of_season_assessment.geojson",end_of_season_assessment);

		in_season_assessment.addTo(map);
		addGeoJSON("data/disctrict_join_in_season_assessment.geojson",in_season_assessment);

		pre_season_assessment.addTo(map);
		addGeoJSON("data/district_join_pre_season_assessment.geojson",pre_season_assessment);

		// $.ajax({
		// 	dataType: "json",
		// 	url: 'data/disctrict_join_in_season_assessment.geojson',
		// 	success: function(data) {
		// 		var crops = []
		// 		$(data.features).each(function(key, data) {
		// 			crops.push(data.properties.agricultur);
		// 		});
		// 		unique_crops = _.uniq(crops);
		// 		chart_object = []
		// 		for (var i = 0; i < unique_crops.length; i++) {
		// 			 var obj = {
		// 				name:unique_crops[i],
		// 				y:_.countBy(crops)[unique_crops[i]],
		// 				}
		// 			chart_object.push(obj);
		// 		}
		//
		// 	}
		// }).error(function() {});
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
		setDistrictsItems();
		generateCropTypeChart("*");
		generateMaizeDevelopmentStage("*");
		// getAllForms();

	}

	$(document).ready(function() {
		init();
	});

});
