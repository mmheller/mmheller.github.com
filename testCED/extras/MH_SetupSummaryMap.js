//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

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

$(function () {
    $("#dialog").dialog();
});

function AllFiltersClear() {
    var strddlMatrix = document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].value;
    var strddlEntry = document.getElementById("ddlEntry").options[document.getElementById("ddlEntry").selectedIndex].value;
    var strActivity = document.getElementById("ddlActivity").options[document.getElementById("ddlActivity").selectedIndex].value;  //get dropdown menu selection
    var strImpParty = document.getElementById("ddlImpParty").options[document.getElementById("ddlImpParty").selectedIndex].value;  //get dropdown menu selection
    var strOffice = document.getElementById("ddlOffice").options[document.getElementById("ddlOffice").selectedIndex].value;  //get dropdown menu selection
    var strState = document.getElementById("ddlState").options[document.getElementById("ddlState").selectedIndex].value;  //get dropdown menu selection
    var strPopArea = document.getElementById("ddlPopArea").options[document.getElementById("ddlPopArea").selectedIndex].value;  //get dropdown menu selection
    var strManagUnit = document.getElementById("ddlManagUnit").options[document.getElementById("ddlManagUnit").selectedIndex].value;  //get dropdown menu selection

    var blnClear = false;

    if (((strddlMatrix == "All") | (strddlMatrix == "99")) &
                 (strddlEntry == "99") &
                 (strActivity == "99") &
                 (strImpParty == "99") &
                 (strOffice == "99") &
                 (strState = "99") &
                 (strPopArea = "99") &
                 (strManagUnit = "99")) {
        blnClear = true;
    }
    return blnClear;
}

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "dojo/promise/all",
  "esri/urlUtils",
  "esri/layers/FeatureLayer",
  "esri/dijit/FeatureTable",
  "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/graphicsUtils",
  "esri/tasks/query",
  "dojo/promise/all",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "dijit/form/CheckBox",
  "esri/dijit/Legend",
  "esri/dijit/Scalebar",
  "esri/dijit/Geocoder",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/mouse",
  "dojo/on",
  "esri/dijit/BasemapGallery",
  "esri/dijit/Basemap",
  "esri/map",
  "extras/PS_Identify",
  "esri/Color",
  "esri/renderers/SimpleRenderer",
  "esri/layers/LabelLayer",
  "esri/symbols/TextSymbol"
  ], function (
            declare, lang, esriRequest, all, urlUtils, FeatureLayer, FeatureTable,
            SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, graphicsUtils, Query, All,
            ArcGISDynamicMapServiceLayer, CheckBox, Legend, Scalebar, Geocoder, dom, domClass,
            mouse, on, BasemapGallery, Basemap, Map, PS_Identify, Color, SimpleRenderer, LabelLayer, TextSymbol
) {

      return declare([], {
          pMap: null,
          dblExpandNum: null,
          gCED_PP_point4FeatureTable: null,
          gFeatureTable: null,

          constructor: function (options) {
              this.pMap = options.pMap || null;
              this.dblExpandNum = options.dblExpandNum || 4;
          },


          mapLoadedSummary: function (results) {        // map loaded//            // Map is ready
              app.basemapGallerySummary = new BasemapGallery({ showArcGISBasemaps: true, map: app.map }, "basemapGallerySummary");
              app.basemapGallerySummary.startup();
              app.basemapGallerySummary.on("selection-change", function () { domClass.remove("panelBasemapsSum", "panelBasemapsOnSum"); });
              app.basemapGallerySummary.on("error", function (msg) { console.log("basemap gallery error:  ", msg); });

              var basemapTitle = dom.byId("basemapTitleSum");
              on(basemapTitle, "click", function () {
                  domClass.toggle("panelBasemapsSum", "panelBasemapsOnSum");
              });
              on(basemapTitle, mouse.enter, function () {
                  domClass.add("panelBasemapsSum", "panelBasemapsOnSum");
              });
              var panelBasemaps = dom.byId("panelBasemapsSum");
              on(panelBasemaps, mouse.leave, function () { domClass.remove("panelBasemapsSum", "panelBasemapsOnSum"); });
              
              app.map.on("update-end", function () {   // this is designed to fire after the map has been fully updated, along with the basemap gallery available layers
                  var strBasemap = localStorage.getItem("ls_strBasemap");
                  if (!(app.basemapLoaded)) {
                      app.basemapGallerySummary.select(strBasemap);
                      app.basemapLoaded = true;
                  }
              });
          },

          Phase1: function () {
              app.basemapLoaded = false;
              app.loading = dojo.byId("loadingImg");  //loading image. id
              var arrayStrMapExtent = localStorage.getItem("ls_strMapExtent").split(",");
              var customExtentAndSR = new esri.geometry.Extent(Number(arrayStrMapExtent[0]), Number(arrayStrMapExtent[1]),
                                                               Number(arrayStrMapExtent[2]), Number(arrayStrMapExtent[3]), new esri.SpatialReference({ "wkid": 3857 }));
              app.map = new esri.Map("mapSum", { basemap: 'topo', logo: false, extent: customExtentAndSR });

              if (app.map.loaded) {
                  app.pSupSumMap.mapLoadedSummary();

              } else {
                  app.map.on("load", function () { app.pSupSumMap.mapLoadedSummary(); });
              }

              app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/5d5fc053dd7e4de4b9765f7a6b6f1f61/rest/services/CEDfrontpage_map_v9_Restrict/FeatureServer/";
              dojo.connect(app.map, "onUpdateStart", showLoading);
              dojo.connect(app.map, "onUpdateEnd", hideLoading);

              var legendLayers = [];
              var strDefQuery = localStorage.getItem("ls_strDefQuery");

              var str4Replacing = " and (((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')))";
              strDefQuery4LinePoly = strDefQuery;
              strDefQuery4LinePoly = strDefQuery4LinePoly.replace(str4Replacing, "");

              str4Replacing = "(((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')))";
              strDefQuery4LinePoly = strDefQuery4LinePoly.replace(str4Replacing, "");

              str4Replacing = " and ((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))";
              strDefQuery4LinePoly = strDefQuery4LinePoly.replace(str4Replacing, "");

              str4Replacing = "((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))";
              strDefQuery4LinePoly = strDefQuery4LinePoly.replace(str4Replacing, "");

              var strBase_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/CED_Base_Layers/FeatureServer/"
              var strlabelField1 = "POPULATION";
              var strlabelField2 = "Name";
              var strlabelField3 = "Mgmt_zone";

              str_extraMaplayerList = localStorage.getItem("ls_extraMaplayerList");
              extraMaplayerList = str_extraMaplayerList.split(",");

              var arrayLayers = [];
              var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels

              dojo.forEach(extraMaplayerList, function (pGraphicLayerIDFromOtherMap) {
                  switch (pGraphicLayerIDFromOtherMap) {
                      case "Pop":
                          var pBase_Pop = new FeatureLayer("https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/WAFWA_MZs/FeatureServer/0", { id: "Pop", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField1], visible: true });
                          arrayLayers.push(pBase_Pop);

                          var pLabel1 = new TextSymbol().setColor(vGreyColor);
                          pLabel1.font.setSize("10pt");
                          pLabel1.font.setFamily("helvetica");
                          var pLabelRenderer1 = new SimpleRenderer(pLabel1);
                          var plabels1 = new LabelLayer({ id: "labels1" });
                          plabels1.addFeatureLayer(pBase_Pop, pLabelRenderer1, "{" + strlabelField1 + "}");
                          arrayLayers.push(plabels1);
                          break;
                      case "MZ":
                          var pBase_MZ = new FeatureLayer("https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/WAFWA_MZs/FeatureServer/1", { id: "MZ", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField2, strlabelField3], visible: true });
                          arrayLayers.push(pBase_MZ);

                          var pLabel2 = new TextSymbol().setColor(vGreyColor);
                          pLabel2.font.setSize("10pt");
                          pLabel2.font.setFamily("helvetica Black");
                          var pLabelRenderer2 = new SimpleRenderer(pLabel2);
                          var plabels2 = new LabelLayer({ id: "labels2" });
                          plabels2.addFeatureLayer(pBase_MZ, pLabelRenderer2, "{" + strlabelField2 + "} : {" + strlabelField3 + "}");
                          arrayLayers.push(plabels2);
                          break;
                      case "RRP":
                          var pBase_RRP = new FeatureLayer(strBase_URL + "2", { id: "RRP", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          arrayLayers.push(pBase_RRP);
                          break;
                      case "RRB":
                          var pBase_RRB = new FeatureLayer(strBase_URL + "3", { id: "RRB", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          arrayLayers.push(pBase_RRB);
                          break;
                      case "Breed":
                          var pBase_Breed = new FeatureLayer(strBase_URL + "4", { id: "Breed", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          arrayLayers.push(pBase_Breed);
                          break;
                      case "PI":
                          var pBase_PI = new FeatureLayer(strBase_URL + "5", { id: "PI", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          arrayLayers.push(pBase_PI);
                          break;
                      case "Eco":
                          var pBase_Eco = new FeatureLayer(strBase_URL + "6", { id: "Eco", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          arrayLayers.push(pBase_Eco);
                          break;
                      case "PHMA":
                          var pBase_PHMA = new FeatureLayer(strBase_URL + "7", { id: "PHMA", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          arrayLayers.push(pBase_PHMA);
                          break;
                      case "GHMA":
                          var pBase_GHMA = new FeatureLayer(strBase_URL + "8", { id: "GHMA", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          arrayLayers.push(pBase_GHMA);
                          break;
                      case "SMA":
                          var pBase_SMA = new FeatureLayer(strBase_URL + "9", { id: "SMA", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          arrayLayers.push(pBase_SMA);
                          break;
                      case "PAC":
                          var pBase_PAC = new FeatureLayer(strBase_URL + "10", { id: "PAC", "opacity": 0.8, mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          arrayLayers.push(pBase_PAC);
                          break;
                      case "0":
                          CED_PP_point = new FeatureLayer(app.strTheme1_URL + "0", { id: "0", mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          CED_PP_point.setDefinitionExpression(strDefQuery);
                          arrayLayers.push(CED_PP_point);
                          break;
                      case "1":
                          CED_PP_line = new FeatureLayer(app.strTheme1_URL + "1", { id: "1", mode: FeatureLayer.MODE_ONDEMAND, visible: true });
                          CED_PP_line.setDefinitionExpression(strDefQuery4LinePoly);
                          arrayLayers.push(CED_PP_line);
                          break;
                      case "2":
                          CED_PP_poly = new FeatureLayer(app.strTheme1_URL + "2", { id: "2", "opacity": 0.5, mode: esri.layers.FeatureLayer.MODE_ONDEMAND, autoGeneralize: true, visible: true });
                          CED_PP_poly.setDefinitionExpression(strDefQuery4LinePoly);
                          arrayLayers.push(CED_PP_poly);
                  }
              });
              app.map.addLayers(arrayLayers);
              return arrayLayers;
          },


          err: function (err) {
              console.log("Failed to get stat results due to an error: ", err);
              $(function () {
                  $("#dialogWarning1").dialog("open");
              });
          }
      }
    )
    ;

  }
);

