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
  "esri/map",
  "extras/PS_Identify",
  "esri/Color",
  "esri/renderers/SimpleRenderer",
  "esri/layers/LabelLayer",
  "esri/symbols/TextSymbol"
  ], function (
            declare, lang, esriRequest, all, urlUtils, FeatureLayer, ArcGISDynamicMapServiceLayer, CheckBox, Legend, Scalebar, Geocoder, dom, domClass,
            mouse, on, BasemapGallery, Map, PS_Identify, Color, SimpleRenderer, LabelLayer, TextSymbol
) {

      return declare([], {
          pMap: null,
          dblExpandNum: null,
          pFeatureLayer: null,

          constructor: function (options) {
              this.pMap = options.pMap || null;
              this.dblExpandNum = options.dblExpandNum || 4;
          },

          Phase1: function () {
            //do nothing
          },


          Phase2: function () {
          app.loading = dojo.byId("loadingImg");  //loading image. id
              var customExtentAndSR = new esri.geometry.Extent(-14000000, 4800000, -11000000, 6200000, new esri.SpatialReference({ "wkid": 3857 }));
              app.map = new esri.Map("map", { basemap: "topo", logo: false, extent: customExtentAndSR });
              //app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/a9bd0c665cc543f7800991255031638b/rest/services/Catalog/53d6d123e4b00d9e8ffa6124/MapServer/";  //Theme Layers
              //app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/636fc6181db341218d8e594e96eca923/rest/services/Catalog/5851daa2e4b0e2663625ebcb/MapServer/"
              app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/d725bb5ba60348fd841b05f80cf4465d/rest/services/CEDfrontpage_map_v9_Restrict/FeatureServer/"

              dojo.connect(app.map, "onUpdateStart", showLoading);
              dojo.connect(app.map, "onUpdateEnd", hideLoading);

              var legendLayers = [];
              CED_PP_point = new FeatureLayer(app.strTheme1_URL + "0", { id: "0", mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              CED_PP_point.setDefinitionExpression("(SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)");
              CED_PP_line = new FeatureLayer(app.strTheme1_URL + "1", { id: "1", mode: FeatureLayer.MODE_ONDEMAND, visible: false });
              CED_PP_poly = new FeatureLayer(app.strTheme1_URL + "2", { id: "2", "opacity": 0.5, mode: esri.layers.FeatureLayer.MODE_ONDEMAND, autoGeneralize: true, visible: false });

              var strBase_URL = "https://utility.arcgis.com/usrsvcs/servers/8631d8c78be64789a68a049f5dfe01e9/rest/services/Catalog/54ee573fe4b02d776a684ac8/MapServer/"
              var strlabelField1 = "population";
              var strlabelField2 = "name";
              var strlabelField3 = "mgmt_zone";
              pBase_Pop = new FeatureLayer(strBase_URL + "0", {id: "Pop", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField1], visible: false });
              pBase_MZ = new FeatureLayer(strBase_URL + "1", { id: "MZ", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField2, strlabelField3], visible: false });
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
              plabels2.addFeatureLayer(pBase_MZ, pLabelRenderer2, "{" + strlabelField2 + "} \n {" + strlabelField3 + "}");


              var pLegendBase_Pop = new FeatureLayer(strBase_URL + "2", { id: "LegendPop", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField1], visible: false });
              var pLegendBase_MZ = new FeatureLayer(strBase_URL + "3", { id: "LegendMZ", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField2], visible: false });
              var pLegendCED_PP_point = new FeatureLayer(strBase_URL + "4", { id: "LegendPt", mode: FeatureLayer.MODE_ONDEMAND, visible: true });
              var pLegendCED_PP_line = new FeatureLayer(strBase_URL + "5", {id: "LegendLine", mode: FeatureLayer.MODE_ONDEMAND, visible: true });
              var pLegendCED_PP_poly = new FeatureLayer(strBase_URL + "6", { id: "LegendPoly", "opacity": 0.5, mode: esri.layers.FeatureLayer.MODE_ONDEMAND, visible: true });

              legendLayers.push({ layer: pLegendCED_PP_poly, title: 'CED Plans and Projects (area)' });
              legendLayers.push({ layer: pLegendCED_PP_line, title: 'CED Plans and Projects (line)' });
              legendLayers.push({ layer: pLegendCED_PP_point, title: 'CED Plans and Projects (point)' });

              dojo.connect(app.map, 'onLayersAddResult', function (results) {
                  var legend = new Legend({ map: app.map, layerInfos: legendLayers, respectCurrentMapScale: false, autoUpdate: false }, "legendDiv");
                  legend.startup();
              });

              var strTPK_URL = "https://www.sciencebase.gov/arcgis/rest/services/Catalog/"
              CED_PP_point_tpk = new ArcGISDynamicMapServiceLayer(strTPK_URL + "54f0a7b5e4b02419550ce925/MapServer", { id: "10", visible: true });
              CED_PP_line_tpk = new ArcGISDynamicMapServiceLayer(strTPK_URL + "54f0a722e4b02419550ce91d/MapServer", { id: "11", visible: true });
              CED_PP_poly_tpk = new ArcGISDynamicMapServiceLayer(strTPK_URL + "54f0a8b1e4b02419550ce930/MapServer", { id: "12", "opacity": 0.6, visible: true });

              var cbxLayers = [];
              cbxLayers.push({ layers: [CED_PP_poly, CED_PP_poly_tpk], title: 'CED Plans and Projects (area)' });
              cbxLayers.push({ layers: [CED_PP_point, CED_PP_point_tpk], title: 'CED Plans and Projects (point)' });
              cbxLayers.push({ layers: [CED_PP_line, CED_PP_line_tpk], title: 'CED Plans and Projects (line)' });
              cbxLayers.push({ layers: [pBase_Pop, plabels1], title: 'GRSG Population Areas' });
              cbxLayers.push({ layers: [pBase_MZ, plabels2], title: 'WAFWA Management Zones' });

              arrayLayers = [pBase_MZ, pBase_Pop, plabels1, plabels2, CED_PP_poly, CED_PP_line, CED_PP_point, CED_PP_poly_tpk, CED_PP_line_tpk, CED_PP_point_tpk];
              app.map.addLayers(arrayLayers);

              dojo.connect(app.map, 'onLayersAddResult', function (results) {            //add check boxes 
                  if (results !== 'undefined') {
                      dojo.forEach(cbxLayers, function (playerset) {
                          var layerName = playerset.title;
                          var blnClear = AllFiltersClear();  // determine if no definition queries set
                          var clayer0 = playerset.layers[0];
                          var clayer1 = playerset.layers[1];
                          var pID0 = clayer0.id;
                          var pID1 = clayer1.id;

                          var blnCEDLayer = false; // determine if this layer is a ced point line or poly layer
                          if ((pID0 == 0) | (pID0 == 1) | (pID0 == 2) | (pID0 == "graphicsLayer1")) {
                              blnCEDLayer = true; 
                          }

                          var blnCheckIt = false;  // determine if checkbox will be on/off
                          if (((blnCEDLayer) & (clayer0.visible | clayer1.visible)) | ((!(blnCEDLayer)) & (clayer0.visible))) {
                              blnCheckIt = true;
                          }

                          var checkBox = new CheckBox({ name: "checkBox" + pID0, value: [pID0, pID1], checked: blnCheckIt,
                              onChange: function (evt) {
                                  if (blnCEDLayer) {
                                      if ((clayer0.visible) | (clayer1.visible)) {
                                          clayer0.hide();
                                          clayer1.hide();
                                      }
                                      else {
                                          if (blnClear) { clayer1.show();}
                                          else { clayer0.show();}
                                      }
                                      if (clayer0.visible | clayer1.visible) { this.checked = true; } 
                                      else { this.checked = false; }
                                  }
                                  else {
                                      if (clayer0.visible) {
                                          clayer0.hide();
                                          clayer1.hide();
                                      } else {
                                          clayer0.show();
                                          clayer1.show();
                                      }
                                      this.checked = clayer0.visible;
                                  }
                              }
                          });

                          dojo.place(checkBox.domNode, dojo.byId("toggle"), "after"); //add the check box and label to the toc
                          var checkLabel = dojo.create('label', { 'for': checkBox.name, innerHTML: layerName }, checkBox.domNode, "after");
                          dojo.place("<br />", checkLabel, "after");
                      });
                  }
              });
              return arrayLayers;
          },

          Phase3: function (CED_PP_point, CED_PP_line, CED_PP_poly) {
              var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" });
              var pGeocoder = new Geocoder({ autoComplete: true, arcgisGeocoder: { placeholder: "Find a place" }, map: app.map }, dojo.byId('search'));
              pGeocoder.startup();

              var basemapTitle = dom.byId("basemapTitle");
              on(basemapTitle, "click", function () {
                  domClass.toggle("panelBasemaps", "panelBasemapsOn");
              });

              on(basemapTitle, mouse.enter, function () {
                  domClass.add("panelBasemaps", "panelBasemapsOn");
              });

              var panelBasemaps = dom.byId("panelBasemaps");
              on(panelBasemaps, mouse.leave, function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });

              $('#loc').autocomplete({
                  source: function (request, response) {
                      $.ajax({
                          url: app.strTheme1_URL + "find" +
                                    "?searchFields=Project_Name,Project_ID&SearchText=" + request.term + "&layers=0&f=pjson&returnGeometry=true",
                          dataType: "jsonp",
                          data: {},                        //data: { where: strSearchField + " LIKE '%" + request.term.replace(/\'/g, '\'\'').toUpperCase() + "%'", outFields: strSearchField, returnGeometry: true, f: "pjson" },                        
                          success: function (data) {
                              if (data.results) {                           //                            if (data.features) {
                                  response($.map(data.results.slice(0, 19), function (item) {      //only display first 10
                                      return { label: item.attributes.Project_Name + " ID:" + item.attributes.Project_ID +
                                        " (Layer:" + item.attributes.SourceFeatureType.replace("poly", "area") + ",Type:" + item.attributes.TypeAct + ")",
                                          value2: item.geometry, value3: item.attributes.Project_ID, value4: item.layerName
                                      }
                                  }));
                              }
                          },
                          error: function (message) { console.log("Failed to get autocomplete results due to an error: ", message); }
                      });
                  },
                  minLength: 3,
                  select: function (event, ui) {
                      this.blur();
                      var strMatrix = "Project";
                      var strManagUnit = "All";
                      var strDataType = "0";
                      var pGeometryMultipoint = ui.item.value2.points;
                      var pSR = ui.item.value2.spatialReference;
                      var pGeometryPoint = pGeometryMultipoint[0];

                      var dblX = pGeometryPoint[0];
                      var dblY = pGeometryPoint[1];
                      var strValue3 = ui.item.value3;
                      var psqs_strQueryString = "objectid  > 0";
                      app.map.infoWindow.hide();            //var strquery4id = "Contaminant LIKE '%Mercury%'";
                      app.map.graphics.clear();
                      app.pPS_Identify = new PS_Identify({ pLayer1: CED_PP_point, pLayer2: CED_PP_line, pLayer3: CED_PP_poly, pMap: app.map,
                          strQueryString4Measurements: "objectid  > 0", strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow, mSR: pSR
                      }); // instantiate the ID Search class    
                      var pPS_Identify_Results = app.pPS_Identify.executeQueries(null, "", 0, pGeometryPoint[0], pGeometryPoint[1]);
                  }
              });


          },

          err: function (err) {
              console.log("Failed to get stat results due to an error: ", err);
              alert(error.name);
          }
      }
    )
    ;

  }
);

