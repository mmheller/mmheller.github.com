//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014

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
              
              var strBasemap = localStorage.getItem("ls_strBasemap");
              if (strBasemap != "topo") {
                  app.basemapGallerySummary.select(strBasemap);
              } else {
                  app.basemapGallerySummary.select('StreetMap');
              }
          },

          Phase1: function () {
            //do nothing
          },


          Phase2: function () {
              app.loading = dojo.byId("loadingImg");  //loading image. id
              var arrayStrMapExtent = localStorage.getItem("ls_strMapExtent").split(",");
              //var customExtentAndSR = new esri.geometry.Extent(-14000000, 4800000, -11000000, 6200000, new esri.SpatialReference({ "wkid": 3857 }));
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
              //var strDefQuery2 = localStorage.getItem("ls_strDefQuery2");
              
              CED_PP_point = new FeatureLayer(app.strTheme1_URL + "0", {id: "0", mode: FeatureLayer.MODE_ONDEMAND, visible: true});
              CED_PP_point.setDefinitionExpression(strDefQuery);

              var str4Replacing = "(((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')))";
              strDefQuery4LinePoly = strDefQuery;
              strDefQuery4LinePoly = strDefQuery4LinePoly.replace(str4Replacing, "");
              str4Replacing = "((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))";
              strDefQuery4LinePoly = strDefQuery4LinePoly.replace(str4Replacing, "");

              CED_PP_line = new FeatureLayer(app.strTheme1_URL + "1", { id: "1", mode: FeatureLayer.MODE_ONDEMAND, visible: true });
              CED_PP_line.setDefinitionExpression(strDefQuery4LinePoly);

              CED_PP_poly = new FeatureLayer(app.strTheme1_URL + "2", { id: "2", "opacity": 0.5, mode: esri.layers.FeatureLayer.MODE_ONDEMAND, autoGeneralize: true, visible: true });
              CED_PP_poly.setDefinitionExpression(strDefQuery4LinePoly);

              var strBase_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/CED_Base_Layers/FeatureServer/"
              var strlabelField1 = "POPULATION";
              var strlabelField2 = "Name";
              var strlabelField3 = "Mgmt_zone";
              var pBase_Pop = new FeatureLayer(strBase_URL + "0", { id: "Pop", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField1], visible: false });
              var pBase_MZ = new FeatureLayer(strBase_URL + "1", { id: "MZ", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField2, strlabelField3], visible: false });

              var pBase_RRP = new FeatureLayer(strBase_URL + "2", { id: "RRP", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              var pBase_RRB = new FeatureLayer(strBase_URL + "3", { id: "RRB", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              var pBase_Breed = new FeatureLayer(strBase_URL + "4", { id: "Breed", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              var pBase_PI = new FeatureLayer(strBase_URL + "5", { id: "PI", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              var pBase_Eco = new FeatureLayer(strBase_URL + "6", { id: "Eco", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              var pBase_PHMA = new FeatureLayer(strBase_URL + "7", { id: "PHMA", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              var pBase_GHMA = new FeatureLayer(strBase_URL + "8", { id: "GHMA", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              var pBase_SMA = new FeatureLayer(strBase_URL + "9", { id: "SMA", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              var pBase_PAC = new FeatureLayer(strBase_URL + "10", { id: "PAC", "opacity": 0.8, mode: FeatureLayer.MODE_ONDEMAND, visible: false });

              var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels
              var pLabel1 = new TextSymbol().setColor(vGreyColor);
              pLabel1.font.setSize("10pt");
              pLabel1.font.setFamily("arial");
              var pLabelRenderer1 = new SimpleRenderer(pLabel1);
              var plabels1 = new LabelLayer({ id: "labels1" });
              plabels1.addFeatureLayer(pBase_Pop, pLabelRenderer1, "{" + strlabelField1 + "}");

              var pLabel2 = new TextSymbol().setColor(vGreyColor);
              pLabel2.font.setSize("10pt");
              pLabel2.font.setFamily("Arial Black");
              var pLabelRenderer2 = new SimpleRenderer(pLabel2);
              var plabels2 = new LabelLayer({ id: "labels2" });
              plabels2.addFeatureLayer(pBase_MZ, pLabelRenderer2, "{" + strlabelField2 + "} : {" + strlabelField3 + "}");

             
              //arrayLayers = [pBase_PAC, pBase_SMA, pBase_GHMA, pBase_PHMA, pBase_Eco, pBase_RRP, pBase_RRB, pBase_Breed, pBase_PI, pBase_MZ, pBase_Pop, plabels1, plabels2, CED_PP_poly, CED_PP_line, CED_PP_point, this.gCED_PP_point4FeatureTable];
              arrayLayers = [pBase_PAC, pBase_SMA, pBase_GHMA, pBase_PHMA, pBase_Eco, pBase_RRP, pBase_RRB, pBase_Breed, pBase_PI, pBase_MZ, pBase_Pop,
                                plabels1, plabels2, CED_PP_poly, CED_PP_line, CED_PP_point];
              app.map.addLayers(arrayLayers);
              
              return arrayLayers;
          },

          //Phase3: function (CED_PP_point, CED_PP_line, CED_PP_poly) {
          //    var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" });
          //    var pGeocoder = new Geocoder({ autoComplete: true, arcgisGeocoder: { placeholder: "Find a place" }, map: app.map }, dojo.byId('search'));
          //    pGeocoder.startup();

          //    var basemapTitle = dom.byId("basemapTitle");
          //    on(basemapTitle, "click", function () {
          //        domClass.toggle("panelBasemaps", "panelBasemapsOn");
          //    });

          //    on(basemapTitle, mouse.enter, function () {
          //        domClass.add("panelBasemaps", "panelBasemapsOn");
          //    });

          //    var panelBasemaps = dom.byId("panelBasemaps");
          //    on(panelBasemaps, mouse.leave, function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });

          //    $('#loc').autocomplete({
          //        source: function (request, response) {
          //            var strURL4Search = "";
          //            if (!(isNaN(request.term))) {
          //                strURL4Search = app.strTheme1_URL + "0/query" +
          //                             "?where=Project_Name+like+%27%25" + request.term + "%25%27+or+Project_ID+%3D+" + request.term + "&f=pjson&returnGeometry=true&outFields=Project_Name%2C+Project_ID%2C+SourceFeatureType%2C+TypeAct";
          //                //strURL4Search = app.strTheme1_URL + "0/query" +
          //                //             "?where=Project_Name+like+%27%25" + request.term + "%25%27+or+Project_ID+%3D+" + request.term + "&f=pjson&outFields=*&returnGeometry=true&outFields=Project_Name%2C+Project_ID%2C+SourceFeatureType%2C+TypeAct%2C+geometry";

          //            } else {
          //                strURL4Search = app.strTheme1_URL + "0/query" +
          //                             "?where=Project_Name+like+'%25" + request.term + "%25'" + "&f=pjson&returnGeometry=true&outFields=Project_Name%2C+Project_ID%2C+SourceFeatureType%2C+TypeAct";
          //                //strURL4Search = app.strTheme1_URL + "0/query" +
          //                //             "?where=Project_Name+like+'%25" + request.term + "%25'" + "&f=pjson&outFields=*&returnGeometry=true&outFields=Project_Name%2C+Project_ID%2C+SourceFeatureType%2C+TypeAct%2C+geometry";

          //            }
          //            $.ajax({
          //                //url: app.strTheme1_URL + "find" + "?searchFields=Project_Name,Project_ID&SearchText=" + request.term + "&layers=0&f=pjson&returnGeometry=true",
          //                url: strURL4Search,
          //                dataType: "jsonp",
          //                data: {},                        //data: { where: strSearchField + " LIKE '%" + request.term.replace(/\'/g, '\'\'').toUpperCase() + "%'", outFields: strSearchField, returnGeometry: true, f: "pjson" },                        
          //                success: function (data) {
          //                    //if (data.results) {                           //                            if (data.features) {
          //                    if (data.features) {                           //                            if (data.features) {
          //                        response($.map(data.features.slice(0, 19), function (item) {      //only display first 10
          //                            var strtemp = item.geometry;

          //                            return { label: item.attributes.Project_Name + " ID:" + item.attributes.Project_ID +
          //                              " (Layer:" + item.attributes.SourceFeatureType.replace("poly", "area") + ",Type:" + item.attributes.TypeAct + ")",
          //                                value2: item.geometry, value3: item.attributes.Project_ID, value4: "CED Projects and Plans (point)"
          //                            }
          //                        }));
          //                    }
          //                },
          //                error: function (message) { console.log("Failed to get autocomplete results due to an error: ", message); }
          //            });
          //        },
          //        minLength: 3,
          //        select: function (event, ui) {
          //            this.blur();
          //            var strMatrix = "Project";
          //            var strManagUnit = "All";
          //            var strDataType = "0";
          //            var pGeometryMultipoint = ui.item.value2.points;
          //            var pSR = ui.item.value2.spatialReference;
          //            var pGeometryPoint = pGeometryMultipoint[0];

          //            var dblX = pGeometryPoint[0];
          //            var dblY = pGeometryPoint[1];
          //            var strValue3 = ui.item.value3;
          //            //var psqs_strQueryString = "objectid  > 0";
          //            app.map.infoWindow.hide();            //var strquery4id = "Contaminant LIKE '%Mercury%'";
          //            app.map.graphics.clear();
          //            CED_PP_point.clearSelection();
          //            CED_PP_line.clearSelection();
          //            CED_PP_poly.clearSelection();

          //            app.pPS_Identify = new PS_Identify({ pLayer1: CED_PP_point, pLayer2: CED_PP_line, pLayer3: CED_PP_poly, pMap: app.map,
          //                strQueryString4Measurements: "Project_ID = " + strValue3, strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow, mSR: pSR
          //            }); // instantiate the ID Search class    

          //            //app.pPS_Identify = new PS_Identify({
          //            //    pLayer1: CED_PP_point, pLayer2: CED_PP_line, pLayer3: CED_PP_poly, pMap: app.map,
          //            //    strQueryString4Measurements: "OBJECTID > 0", strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow, mSR: pSR
          //            //}); // instantiate the ID Search class    

          //            var pPS_Identify_Results = app.pPS_Identify.executeQueries(null, "", 0, pGeometryPoint[0], pGeometryPoint[1]);
          //        }
          //    });


          //},

          err: function (err) {
              console.log("Failed to get stat results due to an error: ", err);
          }
      }
    )
    ;

  }
);

