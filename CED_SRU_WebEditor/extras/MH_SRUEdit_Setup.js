//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        May 2018, Updated May 2019


function showLoading() {
    esri.show(app.loading);
    app.map.disableMapNavigation();
    app.map.hideZoomSlider();
}

function hideLoading(error) {
    esri.hide(app.loading);
    app.map.enableMapNavigation();
    app.map.showZoomSlider();
}



define([
	"esri/Color", "esri/renderers/SimpleRenderer",
	"esri/layers/LabelLayer",
	"esri/symbols/TextSymbol", "esri/tasks/query",
	"esri/toolbars/draw",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/SimpleLineSymbol",
    "dijit/form/CheckBox", "esri/layers/GraphicsLayer",
    "esri/dijit/BasemapGallery",
    "esri/geometry/webMercatorUtils",
    "dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
    "esri/urlUtils",
    "esri/layers/FeatureLayer",
    "esri/dijit/Scalebar",
    "esri/geometry/scaleUtils", "dojo/_base/array", 
    "esri/layers/FeatureLayer",
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/mouse",
    "dojo/on",
	"esri/map",
	"extras/MH_SRUPopUniqueQueryInterfaceValues"
], function (Color, SimpleRenderer, LabelLayer, TextSymbol, Query, Draw, SimpleFillSymbol, SimpleLineSymbol,
		CheckBox, GraphicsLayer, BasemapGallery, webMercatorUtils, declare, lang, arrayUtil, urlUtils, FeatureLayer,
            Scalebar, scaleUtils, arrayUtils, FeatureLayer,
			dom, domClass, registry, mouse, on, Map, MH_SRUPopUniqueQueryInterfaceValues) {

    return declare([], {
		Phase1: function () {
			$(function () {
				$('#cbx_SRU1').change(function () {
					$('#DivInitialCBXs2').toggle(this.checked);
				}).change(); //ensure visible state matches initially
			});

			$(function () {
				$('#cbx_SRU2').change(function () {
					$('#dropdownForm').toggle(this.checked);
				}).change(); //ensure visible state matches initially
			});

			$(function () {
				$('#cbx_SRU3').change(function () {
					$('#MapPickerArea').toggle(this.checked);

				}).change(); //ensure visible state matches initially
			});

			//on(dom.byId("ddlSRU"), "change", ddlMatrix_Change);
			on(dom.byId("ddlSRUState"), "change", ddlMatrix_Change);
			on(dom.byId("ddlBLMHAF"), "change", ddlMatrix_Change);

			app.strSRU_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/SRU_HAF_Map/FeatureServer/0";
			app.MH_SRUUniques = new MH_SRUPopUniqueQueryInterfaceValues({ strURL: app.strSRU_URL, iNonSpatialTableIndex: 0, divTagSource: null });
			//app.MH_SRUUniques = new MH_SRUPopUniqueQueryInterfaceValues({ });

			app.iNonSpatialTableIndex = 0;  //
			app.MH_SRUUniques.divTagSource = null;
			app.MH_SRUUniques.qry_SetUniqueValuesOf("Name", "SRU_ID", "Image", document.getElementById("ddlSRU"), "OBJECTID_1  > 0"); //maybe move this to MH_FeatureCount  //clear111

			app.pSup.Phase2();

			function ddlMatrix_Change(divTagSource) {
				$('#ddlSRU').ddslick('destroy');
				

				document.getElementById("loadingImg").style.visibility = "visible";
				disableOrEnableFormElements("dropdownForm", 'select-one', true); //disable/enable to avoid user clicking query options during pending queries
				disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries

				//app.map.infoWindow.hide();
				//app.map.graphics.clear();
				//CED_PP_poly.clearSelection();

				//var strddlSRU = document.getElementById("ddlSRU").options[document.getElementById("ddlSRU").selectedIndex].value;
				var strddlSRUState = document.getElementById("ddlSRUState").options[document.getElementById("ddlSRUState").selectedIndex].value;
				var strddlBLMHAF = document.getElementById("ddlBLMHAF").options[document.getElementById("ddlBLMHAF").selectedIndex].value;

				//if (((strddlSRU == "All") | (strddlSRU == "99")) &
				//	(strddlSRUState == "99") &
				//	(strBLMstrddlBLMHAFHAF == "99")) {
				//	//dojo.forEach(app.arrayLayers, function (player) {
				//	//	var id = player.id;
				//	//	if (id == "graphicsLayer1") { player.setVisibility(!blnTPKs); }
				//	//});
				//}
				//else {
				//	//dojo.forEach(app.arrayLayers, function (player) {
				//	//	var id = player.id;
				//	//	if (id == "graphicsLayer1") { player.setVisibility(false); }
				//	//});
				//}

				app.strQueryLabelText = "";

				var strQuery = "";
				//if ((app.arrayPrjIDs_fromSpatialSelect != undefined) & (app.arrayPrjIDs_fromSpatialSelect != "")) {
				//	strQuery = "project_ID in (";
				//	for (var i = 0; i < app.arrayPrjIDs_fromSpatialSelect.length; i++) {
				//		strQuery += app.arrayPrjIDs_fromSpatialSelect[i] + ",";
				//	}
				//	strQuery = strQuery.slice(0, -1) + ")";
				//}

				if (strddlSRUState !== "99") {
					if (strQuery !== "") { strQuery += " and "; }
					strQuery += "State = '" + strddlSRUState + "'";
					//app.strQueryLabelText += "Entry Type = " + document.getElementById("ddlEntry").options[document.getElementById("ddlEntry").selectedIndex].text + ", ";
				}

				if (strddlBLMHAF !== "99") {
					if (strQuery !== "") { strQuery += " and "; }
					strQuery += "HAF_SRU = '" + strddlBLMHAF + "'";
					//app.strQueryLabelText += "Start Year = " + document.getElementById("ddlStartYear").options[document.getElementById("ddlStartYear").selectedIndex].text + ", ";
				}

				ExecutetheDerivedQuery(strQuery, divTagSource);



			};

			function ExecutetheDerivedQuery(strQuery, divTagSource) {
				if (strQuery == "") { strQuery = "OBJECTID_1 > 0"; }
				app.iNonSpatialTableIndex = 0;  //

				app.MH_SRUUniques.divTagSource = divTagSource;
				app.MH_SRUUniques.qry_SetUniqueValuesOf("Name", "SRU_ID", "Image", document.getElementById("ddlSRU"), strQuery); //maybe move this to MH_FeatureCount  //clear111
				
				app.pSRULayer.setDefinitionExpression(strQuery);

				//if (document.getElementById("cbx_zoom").checked) {
				//	var pZoom2 = new MH_Zoom2FeatureLayer({ pMap: app.map, dblExpandNum: 1.0 }); // instantiate the zoom class
				//	var pZoom2Result = pZoom2.qry_Zoom2FeatureLayerExtent(this.pCED_PP_point);
				//}
			};

			function setQS(strQueryDef) {
				this.pCED_PP_poly.setDefinitionExpression(strQueryDef);
				this.pCED_PP_poly.setVisibility(true);
			};

        },

		Phase2: function () {
			//app.loading = dojo.byId("loadingImg");  //loading image. id
			var customExtentAndSR = new esri.geometry.Extent(-14000000, 4800000, -11000000, 6200000, new esri.SpatialReference({ "wkid": 3857 }));
			app.map = new esri.Map("map", { basemap: "topo", logo: false, extent: customExtentAndSR });


			var strlabelField1 = "Name";
			var strlabelField2 = "SRU_ID";

			//var selectionToolbar;
			app.map.on("load", initSelectToolbar);

			app.pSRULayer = new FeatureLayer(app.strSRU_URL, { id: "0", mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField1, strlabelField2], visible: true });

			var pSelectionSymbol =
				new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
					new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
						new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.5]));

			app.pSRULayer.setSelectionSymbol(pSelectionSymbol);
			app.pSRULayer.on("selection-complete", PointSelectClick);
			//pSRULayer.on("selection-clear", function () {
			//	dom.byId('messages').innerHTML = "<i>SRU Not Selected</i>";
			//});


			var vRedColor = new Color("#FF0000");              // create a text symbol to define the style of labels
			var pLabel1 = new TextSymbol().setColor(vRedColor);
			pLabel1.font.setSize("8pt");
			pLabel1.font.setFamily("helvetica");
			var pLabelRenderer1 = new SimpleRenderer(pLabel1);
			var plabels1 = new LabelLayer({ id: "labels1" });
			plabels1.addFeatureLayer(app.pSRULayer, pLabelRenderer1, "{" + strlabelField1 + "} : {" + strlabelField2 + "}");

			dojo.connect(app.map, "onUpdateStart", showLoading);
			dojo.connect(app.map, "onUpdateEnd", hideLoading);

			app.map.addLayers([app.pSRULayer, plabels1]);

			function initSelectToolbar(event) {
				app.selectionToolbar = new Draw(event.map);
				var selectQuery = new Query();
				app.selectionToolbar.activate(Draw.POINT);
				on(app.selectionToolbar, "DrawEnd", function (geometry) {
					app.selectionToolbar.deactivate();
					selectQuery.geometry = geometry;
					app.pSRULayer.selectFeatures(selectQuery,
						app.pSRULayer.SELECTION_NEW);
				});
			}

			function PointSelectClick(event) {
				if (event.features.length == 0) {
					dom.byId('messages').innerHTML = "<b>Nothing selected</b>";
				}
				else {
					arrayUtil.forEach(event.features, function (feature) {
						var iSRU_ID = feature.attributes.SRU_ID;
						for (var ii = 0; ii < app.MH_SRUUniques.ddDataSRU.length; ii++) {
							dataElement = app.MH_SRUUniques.ddDataSRU[ii];
							if (dataElement.value == iSRU_ID) {
								$('#ddlSRU').ddslick('select', { index: ii });
							}
						}
						dom.byId('messages').innerHTML = "";
					});
				}
				app.selectionToolbar.activate(Draw.POINT);
			}
		},

		ddSRUslickSelected: function (iSRU_ID) {
			alert("test, SRU_ID selected " + iSRU_ID.toString());
		},

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);