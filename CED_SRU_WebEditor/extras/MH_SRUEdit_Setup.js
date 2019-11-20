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
	"dijit/form/CheckBox", "esri/layers/GraphicsLayer", "esri/graphic", "esri/request",
    "esri/dijit/BasemapGallery",
    "esri/geometry/webMercatorUtils",
    "dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/json",
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
	"extras/MH_SRUPopUniqueQueryInterfaceValues",
	"extras/MH_SRUEdit_Backend",
	"extras/MH_Zoom2FeatureLayersSRUFootprinter",
	"esri/dijit/BasemapGallery",
], function (Color, SimpleRenderer, LabelLayer, TextSymbol, Query, Draw, SimpleFillSymbol, SimpleLineSymbol,
		CheckBox, GraphicsLayer, Graphic, esriRequest, BasemapGallery, webMercatorUtils, declare, lang, arrayUtil, dojoJson, urlUtils, FeatureLayer,
            Scalebar, scaleUtils, arrayUtils, FeatureLayer,
		dom, domClass, registry, mouse, on, Map, MH_SRUPopUniqueQueryInterfaceValues, MH_SRUEdit_Backend,
		MH_Zoom2FeatureLayersSRUFootprinter, BasemapGallery) {

    return declare([], {
		Phase1: function () {
			app.blnMapClicked = false;
			app.blnInitialLoad = true;

			app.iCEDID = getTokens()['CEDID'];
			if (app.iCEDID == undefined) {
				app.iCEDID = 99989889;
			}

			app.iSRUID = getTokens()['SRUID'];

			app.pSupZ = new MH_Zoom2FeatureLayersSRUFootprinter({}); // instantiate the class
			app.dblExpandNum = 2;

			$("#btn_NextSRU").click(function () {
				app.pSup.ddSRUSaveClicked();
			});

			$("#btn_BackSRU").click(function () {
				app.pSup.ddSRUBackClicked();
			});


			var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" });
			app.loading = document.getElementById("loadingImg");  //loading image. id
			dojo.connect(app.map, "onUpdateStart", showLoading);
			dojo.connect(app.map, "onUpdateEnd", hideLoading);

			var basemapTitle = dom.byId("basemapTitle");
			on(basemapTitle, "click", function () {
				domClass.toggle("panelBasemaps", "panelBasemapsOn");
			});
			on(basemapTitle, mouse.enter, function () {
				domClass.add("panelBasemaps", "panelBasemapsOn");
			});
			var panelBasemaps = dom.byId("panelBasemaps");
			on(panelBasemaps, mouse.leave, function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });

			on(dom.byId("ddlSRUState"), "change", ddlMatrix_Change);
			//on(dom.byId("ddlBLMHAF"), "change", ddlMatrix_Change);

			app.strSRU_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/SRU_HAF_Map/FeatureServer/0";
			app.MH_SRUUniques = new MH_SRUPopUniqueQueryInterfaceValues({ strURL: app.strSRU_URL, iNonSpatialTableIndex: 0, divTagSource: null });
			app.MH_SRUEditBackend = new MH_SRUEdit_Backend();

			app.iNonSpatialTableIndex = 0;  //
			app.MH_SRUUniques.divTagSource = null;
			app.MH_SRUUniques.qry_SetUniqueValuesOf("Name", "SRU_ID", "Image", document.getElementById("ddlSRU"), "OBJECTID > 0"); //maybe move this to MH_FeatureCount  //clear111
			
			app.pSup.Phase2();

			function ddlMatrix_Change(divTagSource) {
				$('#ddlSRU').ddslick('destroy');
				app.pSRULayer.clearSelection();

				document.getElementById("loadingImg").style.visibility = "visible";
				disableOrEnableFormElements("dropdownForm", 'select-one', true); //disable/enable to avoid user clicking query options during pending queries
				disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries

				disableOrEnableFormElements("dropdownFormState", 'select-one', true); //disable/enable to avoid user clicking query options during pending queries
				disableOrEnableFormElements("dropdownFormState", 'button', true);  //disable/enable to avoid user clicking query options during pending queries

				var strddlSRUState = document.getElementById("ddlSRUState").options[document.getElementById("ddlSRUState").selectedIndex].value;
				app.strQueryLabelText = "";
				var strQuery = "";

				if (strddlSRUState !== "99") {
					strQuery = "State = '" + strddlSRUState + "'";
				} else {
					strQuery = "1=1";
				}
				ExecutetheDerivedQuery(strQuery, divTagSource);
			};

			function ExecutetheDerivedQuery(strQuery, divTagSource) {
				app.iNonSpatialTableIndex = 0;  //
				app.MH_SRUUniques.divTagSource = divTagSource;
				app.MH_SRUUniques.qry_SetUniqueValuesOf("Name", "SRU_ID", "Image", document.getElementById("ddlSRU"), strQuery); //maybe move this to MH_FeatureCount  //clear111
				app.pSRULayer.setDefinitionExpression(strQuery);

				app.pSupZ.qry_Zoom2FeatureLayerExtent(app.pSRULayer);
			};

			function setQS(strQueryDef) {
				this.pCED_PP_poly.setDefinitionExpression(strQueryDef);
				this.pCED_PP_poly.setVisibility(true);
			};

			if (app.map.loaded) {
				mapLoaded();
			} else {
				app.map.on("load", function () { mapLoaded(); });
			}

			function mapLoaded() {        // map loaded//            // Map is ready
				app.map.on("mouse-move", showCoordinates); //after map loads, connect to listen to mouse move & drag events
				app.map.on("mouse-drag", showCoordinates);

				app.basemapGallery = new BasemapGallery({ showArcGISBasemaps: true, map: app.map }, "basemapGallery");
				app.basemapGallery.startup();
				app.basemapGallery.on("selection-change", function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });
				app.basemapGallery.on("error", function (msg) { console.log("basemap gallery error:  ", msg); });
			}

			function showCoordinates(evt) {
				var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);  //the map is in web mercator but display coordinates in geographic (lat, long)
				dom.byId("txt_xyCoords").innerHTML = " Latitude:" + mp.y.toFixed(4) + ", Longitude:" + mp.x.toFixed(4);  //display mouse coordinates
			}
        },

		Phase2: function () {
			var customExtentAndSR = new esri.geometry.Extent(-14000000, 4250000, -11000000, 7050000, new esri.SpatialReference({ "wkid": 3857 }));
			app.map = new esri.Map("map", { basemap: "topo", logo: false, extent: customExtentAndSR });

			var strlabelField1 = "Name";
			var strlabelField2 = "SRU_ID";
			app.map.on("load", initSelectToolbar);

			app.pSRULayer = new FeatureLayer(app.strSRU_URL, { id: "0", mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField1, strlabelField2], visible: true });
			app.pSRULayer.setDefinitionExpression("1=1");
			var pSelectionSymbol =
				new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
					new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
						new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.5]));

			app.pSRULayer.setSelectionSymbol(pSelectionSymbol);
			app.pSRULayer.on("selection-complete", PointSelectClick);

			var vRedColor = new Color("#FF0000");              // create a text symbol to define the style of labels
			var pLabel1 = new TextSymbol().setColor(vRedColor);
			pLabel1.font.setSize("8pt");
			pLabel1.font.setFamily("helvetica");
			var pLabelRenderer1 = new SimpleRenderer(pLabel1);
			var plabels1 = new LabelLayer({ id: "labels1" });
			plabels1.addFeatureLayer(app.pSRULayer, pLabelRenderer1, "{" + strlabelField1 + "} : {" + strlabelField2 + "}");

			dojo.connect(app.map, "onUpdateStart", showLoading);
			dojo.connect(app.map, "onUpdateEnd", hideLoading);


			if (document.location.host == "conservationefforts.org") {
				var strHFL_URL = "https://utility.arcgis.com/usrsvcs/servers/3ffd269482224fa9a08027ef8617a44c/rest/services/NA_SRC_v2/FeatureServer/5"; //***Production!!!!
			} else {
				var strHFL_URL = "https://utility.arcgis.com/usrsvcs/servers/e09a9437e03d4190a3f3a8f2e36190b4/rest/services/Development_Src_v2/FeatureServer/0"; //***Sandbox!!!!!
				//document.getElementById("messages").innerHTML += ": Sandbox AGOL Hosted Feature Layer Currently Configured";
			}
			app.pSrcFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL, { id: "99", mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: ['*'], visible: false  });

			app.map.addLayers([app.pSrcFeatureLayer, app.pSRULayer, plabels1]);
			//app.pSupZ.qry_Zoom2FeatureLayerExtent(app.pSRULayer);

			function initSelectToolbar(event) {
				app.selectionToolbar = new Draw(event.map);
				esri.bundle.toolbars.draw.addPoint = "Click to select a SRU";
				var selectQuery = new Query();
				app.selectionToolbar.activate(Draw.POINT);
				
				on(app.selectionToolbar, "DrawEnd", function (geometry) {
					app.selectionToolbar.deactivate();
					selectQuery.geometry = geometry;
					app.pSRULayer.selectFeatures(selectQuery,
						app.pSRULayer.SELECTION_NEW);
					//esri.bundle.toolbars.draw.addPoint = "Add a new tree to the map";
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
								app.blnMapClicked = true;
								$('#ddlSRU').ddslick('select', { index: ii });
							}
						}
						dom.byId('messages').innerHTML = "";
					});
				}
				app.selectionToolbar.activate(Draw.POINT);
			}
		},

		Select_dd_basedOnURLParam: function (iSRU_ID) {
			if (app.iSRUID != undefined) {
				for (var ii = 0; ii < app.MH_SRUUniques.ddDataSRU.length; ii++) {
					dataElement = app.MH_SRUUniques.ddDataSRU[ii];
					if (dataElement.value == app.iSRUID) {
						//app.blnMapClicked = true;
						$('#ddlSRU').ddslick('select', { index: ii });
					}
				}
			}
		},

		ddSRUslickSelected: function (iSRU_ID) {
			app.iSelectedSRUID = iSRU_ID;
			$("#btn_NextSRU").prop("disabled", false);

			if (app.blnMapClicked) {
				app.blnMapClicked = false;
			} else {
				//clear the map selection
				app.pSRULayer.clearSelection();

				var querySRU = new Query();
				querySRU.where = "SRU_ID = " + iSRU_ID.toString();
				app.pSRULayer.selectFeatures(querySRU, app.pSRULayer.SELECTION_NEW, function (results) {
					//do nothing more
				});


			}
		},

		ddSRUBackClicked: function () {
			alert("test, Back button clicked");
		},

		ddSRUSaveClicked: function () {
			app.MH_SRUEditBackend.DeleteSRUPolygonIntheAGOL_HFL(app.iCEDID);
		},

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);