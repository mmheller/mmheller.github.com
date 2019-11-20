//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        May 2018, Updated May 2019

function getTokens() {
	var tokens = [];
	var query = location.search;
	query = query.slice(1);
	query = query.split('&');
	$.each(query, function (i, value) {
		var token = value.split('=');
		var key = decodeURIComponent(token[0]);
		var data = decodeURIComponent(token[1]);
		tokens[key] = data;
	});
	return tokens;
}



define([
	"esri/Color", "esri/renderers/SimpleRenderer",
	"esri/layers/LabelLayer",
	"esri/symbols/TextSymbol", "esri/tasks/query",
	"esri/toolbars/draw",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/SimpleLineSymbol",
	"dijit/form/CheckBox", "esri/layers/GraphicsLayer", "esri/graphic", "esri/request",
    "dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/json",
    "esri/urlUtils",
    "esri/layers/FeatureLayer",
	"dojo/_base/array", 
    "esri/layers/FeatureLayer",
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/mouse",
    "dojo/on"
], function (Color, SimpleRenderer, LabelLayer, TextSymbol, Query, Draw, SimpleFillSymbol, SimpleLineSymbol,
		CheckBox, GraphicsLayer, Graphic, esriRequest, declare, lang, arrayUtil, dojoJson, urlUtils, FeatureLayer,
            arrayUtils, FeatureLayer,
			dom, domClass, registry, mouse, on) {

    return declare([], {
		
		onsucess: function (msg) {
			var bnlSuccessfull = msg[0].success;
			dom.byId('messages').innerHTML = "<p style='color:Green;margin-right:5px'><b>Successful save of SRU polygon" + "</b></p>";

			if (((document.location.host.indexOf("localhost") > -1) | (document.location.host.indexOf("github") > -1)) & (document.location.host != 'localhost:9000')) {
				alert("Successful save of SRU polygon, Local/Testing version not configured with CED");

			} else {
				document.getElementById("dropdownForm").submit(); //Use for CED production!!!!!!!!!!!!!!!!!!!!!
			}
		},

		onerror: function (msg) {
			dom.byId('messages').innerHTML = "<p style='color:red;margin-right:5px'><b>" + msg.message + "</b></p>";
		},

		onsucessDelete: function (response, io) {
			var strResults = "Deleting any existing features if they exist for this project/effort: " + dojoJson.toJson(response, true);
			dom.byId('messages').innerHTML = "<p style='color:red;margin-right:5px'><b>" + strResults + "</b></p>";

			app.MH_SRUEditBackend.WriteTheSRUPolygon2theAGOL_HFL(app.iCEDID, app.iSelectedSRUID.toString());
		},

		onerrorDelete: function (error, io) {
			var strResults = dojoJson.toJson(error, true);
			dom.byId('messages').innerHTML = "<p style='color:red;margin-right:5px'><b>" + strResults+ "</b></p>";

			dojoJson.toJsonIndentStr = " ";
			dom.byId("messages").value = dojoJson.toJson(error, true);
		},
	

		DeleteSRUPolygonIntheAGOL_HFL: function (iCED_ID) {
			var capabilities = app.pSrcFeatureLayer.getEditCapabilities();
			if (capabilities.canDelete) {
				var requestHandle = esriRequest({
					"url": app.pSrcFeatureLayer.url + "/deleteFeatures",
					"content": {
						"where": "Project_ID = " + iCED_ID.toString(),
						"f": "json"
					}
				}, {
						"usePost": true
					}
				);
				requestHandle.then(app.MH_SRUEditBackend.onsucessDelete, app.MH_SRUEditBackend.onerrorDelete);
			}
		},

		WriteTheSRUPolygon2theAGOL_HFL: function (iCED_ID, iSRU_ID) {
			var querySRU = new Query();
			querySRU.where = "SRU_ID = " + iSRU_ID.toString();
			app.pSRULayer.selectFeatures(querySRU, app.pSRULayer.SELECTION_NEW, function (results) {
				var pNewFeatures2Add = [];
				arrayUtil.forEach(results, function (feature) {
					var pGeom = feature.geometry;				//get the geometry
					var attr = {};
					attr["SBURL"] = "NOT YET DEFINED, Attn: SRU Poly " + iSRU_ID.toString();
					attr["Project_ID"] = iCED_ID;
					attr["DateCreated"] = Date.now();
					attr["DateUpdated"] = Date.now();
					var graphic = new Graphic(pGeom);
					graphic.setAttributes(attr);
					pNewFeatures2Add.push(graphic);
					var capabilities = app.pSrcFeatureLayer.getEditCapabilities();
					if (capabilities.canUpdate) {
						console.log("This layer can be updated");
						app.pSrcFeatureLayer.applyEdits(pNewFeatures2Add, null, null, app.MH_SRUEditBackend.onsucess, app.MH_SRUEditBackend.onerror);
					}

				});
			});
		},

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);