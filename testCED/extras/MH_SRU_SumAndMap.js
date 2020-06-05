//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"esri/geometry/Point",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/Font",
	"esri/symbols/TextSymbol",
	"esri/Color",
	"esri/graphic", 
	"esri/layers/GraphicsLayer",
	"esri/tasks/query",
	"esri/request"
], function (
		declare, lang, Point, SimpleMarkerSymbol, SimpleLineSymbol, Font, TextSymbol, Color, Graphic, GraphicsLayer, Query, esriRequest
) {
		return declare([], {
			pCED_PP_poly: null,
			pCED_PP_point: null,

			constructor: function (options) {            // specify class defaults
				this.pCED_PP_poly = options.pCED_PP_poly || null;
				this.pCED_PP_point = options.pCED_PP_point || null;
				this.gl = new GraphicsLayer();
			},
			startSRUSum4Map: function (strQuery, pGeometry) {
				this.gl.clear();

				this.font = new Font("15px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER, "Arial");
				this.s = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 20,
					new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([255, 0, 0]), 1),
					new Color([0, 255, 0, 0.25]));

				var pQueryTask = new esri.tasks.QueryTask(this.pCED_PP_poly.url);
				var pQuery = new esri.tasks.Query();

				var pstatDef1 = new esri.tasks.StatisticDefinition();
				pstatDef1.statisticType = "count"
				pstatDef1.onStatisticField = "SRU_ID";
				pstatDef1.outStatisticFieldName = "genericstat";
				var array_QueryStatDefs = [];
				array_QueryStatDefs.push(pstatDef1);

				pQuery.returnGeometry = true;
				pQuery.where = strQuery;

				if (pGeometry != undefined) {
					pQuery.geometry = pGeometry;
				}
				pQuery.outFields = ["*"];
				var strGroupByField = "SRU_ID";
				pQuery.groupByFieldsForStatistics = [strGroupByField];
				pQuery.orderByFields = [strGroupByField + " ASC"];
				pQuery.outStatistics = array_QueryStatDefs;

				return pQueryTask.execute(pQuery, this.returnEvents, this.err);
			},

			returnEvents: function (results) {
				var resultFeatures = results.features;

				var arraySRUResutls = [];

				dojo.forEach(resultFeatures, function (feature) {//Loop through the QueryTask results and populate an array with the unique values
					iSum = feature.attributes["genericstat"];
					iSRU = feature.attributes["SRU_ID"];
					arraySRUResutls.push([iSRU,iSum]);
				});

				var i;
				for (i = 0; i < arraySRUResutls.length; i++) {
					var iSRU4Query2 = arraySRUResutls[i][0];
					var strSRUQuery = "SRU_ID = " + iSRU4Query2.toString();
					var pQuery = new Query();
					var queryTask = new esri.tasks.QueryTask(app.MH_SRUsumMap.pCED_PP_point.url);

					pQuery.where = strSRUQuery;
					pQuery.returnGeometry = true;
					pQuery.outFields = ["SRU_ID"];
					//pQuery.outSpatialReference = { "wkid": 102100 };
					queryTask.execute(pQuery, function (results) {
						var resultFeatures = results.features;
						var resultCount = resultFeatures.length;
						if (resultCount > 0) {
							var pPoint = resultFeatures[0].geometry;
							var iSRU2 = resultFeatures[0].attributes["SRU_ID"];
							var iSum2 = 0;
							var ii;
							for (ii = 0; ii < arraySRUResutls.length; ii++) {
								if (arraySRUResutls[ii][0] == iSRU2) {
									iSum2 = arraySRUResutls[ii][1];
								}
							}

							//var g = new Graphic(pPoint, app.MH_SRUsumMap.s);
							//g.setAttributes({
							//	name: strSRUQuery
							//});
							//app.MH_SRUsumMap.gl.add(g);
							var t = new TextSymbol(iSum2.toString() + " efforts", app.MH_SRUsumMap.font, new Color([0, 0, 0]));
							var g2 = new Graphic(pPoint, t);
							app.MH_SRUsumMap.gl.add(g2);
						}
					}, function (error) {
						console.log(error);
					});
				}
				app.map.addLayer(app.MH_SRUsumMap.gl)
			},

			err: function (err) {
				$(function () {
					$("#dialogWarning1").dialog("open");
				});
			}
		});
	}
);

