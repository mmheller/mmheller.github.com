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
			},
			startSRUSum4Map: function (strQuery, pGeometry) {
				app.gl.clear();

				this.font = new Font("15px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER, "Arial");
				this.s = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 20,
					new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([255, 0, 0]), 1),
					new Color([0, 255, 0, 0.25]));

				var pQueryTask = new esri.tasks.QueryTask(this.pCED_PP_poly.url);
				var pQuery = new esri.tasks.Query();

				if (app.strModule == "GUSG") {
					//1)query the ced_poly to get the project id's ********Current Step***********
					//2)query ced_AGS_SRU_info for sru's per project_id 
					//3) query GUSG SRU layer to place lables
					pQuery.returnGeometry = false;
					pQuery.where = strQuery;
					if (pGeometry != undefined) {
						pQuery.geometry = pGeometry;
					}
					pQuery.outFields = ["Project_ID"];
					return pQueryTask.execute(pQuery, this.returnEventsSRU1, this.err);
				} else {
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
				}
			},

			returnEventsSRU1: function (results) {
				var pQueryTask = new esri.tasks.QueryTask(app.strTheme1_URL + "21");
				var pQuery = new esri.tasks.Query();

				var resultFeatures = results.features;
				var arraySRUResutls = [];

				dojo.forEach(resultFeatures, function (feature) {//Loop through the QueryTask results and populate an array with the unique values
					iPRJID = feature.attributes["Project_ID"];
					arraySRUResutls.push([iPRJID]);
				});

				var strQuery = "Project_ID in (" + arraySRUResutls.join(",") + ")"

				//1)query the ced_poly to get the project id's
				//2)query ced_AGS_SRU_info for sru's per project_id  ********Current Step***********
				//3) query GUSG SRU layer to place lables

				var pstatDef1 = new esri.tasks.StatisticDefinition();
				pstatDef1.statisticType = "count"
				pstatDef1.onStatisticField = "SRU_ID";
				pstatDef1.outStatisticFieldName = "genericstat";
				var array_QueryStatDefs = [];
				array_QueryStatDefs.push(pstatDef1);

				pQuery.where = strQuery;

				pQuery.outFields = ["*"];
				var strGroupByField = "SRU_ID";
				pQuery.groupByFieldsForStatistics = [strGroupByField];
				pQuery.orderByFields = [strGroupByField + " ASC"];
				pQuery.outStatistics = array_QueryStatDefs;
				return pQueryTask.execute(pQuery, app.MH_SRUsumMap.returnEventsSRU2, this.err);
			},
			returnEventsSRU2: function (results) {
				var resultFeatures = results.features;
				var arraySRUResutls = [];
				dojo.forEach(resultFeatures, function (feature) {//Loop through the QueryTask results and populate an array with the unique values
					iSum = feature.attributes["genericstat"];
					iSRU = feature.attributes["SRU_ID"];
					arraySRUResutls.push([iSRU, iSum]);
				});
				//1)query the ced_poly to get the project id's
				//2)query ced_AGS_SRU_info for sru's per project_id
				//3) query GUSG SRU layer to place lables  ********Current Step***********
				var i;
				for (i = 0; i < arraySRUResutls.length; i++) {
					var iSRU4Query2 = arraySRUResutls[i][0];
					var strSRUQuery = "SRU_ID = " + iSRU4Query2.toString();
					var pQueryTask = new esri.tasks.QueryTask("https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/SRU_GUSG_Map/FeatureServer/0");
					var pQuery = new esri.tasks.Query();

					pQuery.where = strSRUQuery;
					pQuery.returnGeometry = true;
					pQuery.outFields = ["SRU_ID"];
					pQueryTask.execute(pQuery, function (results) {
						var resultFeatures = results.features;
						var resultCount = resultFeatures.length;
						if (resultCount > 0) {
							var ii;
							for (ii = 0; ii < resultCount; ii++) {

								var pPoly = resultFeatures[ii].geometry;
								var pPoint = pPoly.getCentroid();
								var iSRU2 = resultFeatures[ii].attributes["SRU_ID"];
								var iSum2 = 0;
								var iii;
								for (iii = 0; iii < arraySRUResutls.length; iii++) {
									if (arraySRUResutls[iii][0] == iSRU2) {
										iSum2 = arraySRUResutls[iii][1];
									}
								}

								var t = new TextSymbol(iSum2.toString() + " effort(s)", app.MH_SRUsumMap.font, new Color([0, 0, 0]));
								var g2 = new Graphic(pPoint, t);
								app.gl.add(g2);
							}
						}
					}, function (error) {
						console.log(error);
					});
				}
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
					strSRUQuery = "(" + strSRUQuery + ") and (" + app.MH_SRUsumMap.pCED_PP_poly.getDefinitionExpression() + ")";

					var pQuery = new Query();
					var queryTask = new esri.tasks.QueryTask(app.MH_SRUsumMap.pCED_PP_point.url);

					pQuery.where = strSRUQuery;
					pQuery.returnGeometry = true;
					pQuery.outFields = ["SRU_ID"];
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

							var t = new TextSymbol(iSum2.toString() + " effort(s)", app.MH_SRUsumMap.font, new Color([0, 0, 0]));
							var g2 = new Graphic(pPoint, t);
							app.gl.add(g2);
						}
					}, function (error) {
						console.log(error);
					});
				}
			},

			err: function (err) {
				$(function () {
					$("#dialogWarning1").dialog("open");
				});
			}
		});
	}
);

