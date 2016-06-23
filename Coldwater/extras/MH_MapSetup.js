//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2015

function showLoading() {
    esri.show(app.loading);
    app.map.disableMapNavigation();
    app.map.hideZoomSlider();
}

function hideLoading(error) {
    esri.hide(app.loading);
    if (app.map) {
        app.map.enableMapNavigation();
        app.map.showZoomSlider();
    }
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
  "esri/Color",
  "esri/renderers/SimpleRenderer",
  "esri/layers/LabelLayer",
  "esri/symbols/TextSymbol",
  "esri/geometry/webMercatorUtils",
  "esri/dijit/BasemapGallery",
  "extras/PTS_Identify", "esri/dijit/HistogramTimeSlider", "dojo/parser", "dojo/dom-construct"
  ], function (
        declare, lang, esriRequest, all, urlUtils, FeatureLayer, ArcGISDynamicMapServiceLayer, CheckBox,
        Legend, Scalebar, Geocoder, dom, domClass, mouse, on, BasemapGallery, Map, Color, SimpleRenderer, LabelLayer, TextSymbol, webMercatorUtils, BasemapGallery, PTS_Identify, HistogramTimeSlider, parser, domConstruct
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
              app.loading = dojo.byId("loadingImg");  //loading image. id
              var customExtentAndSR = new esri.geometry.Extent(-12310232, 5492317, -12260927, 5575417, new esri.SpatialReference({ "wkid": 3857 }));
              app.map = new esri.Map("map", { basemap: "topo", logo: false, extent: customExtentAndSR });
              app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/56d91717c576443f8385cd1e1001fd6d/rest/services/Catalog/57506bc5e4b033c61ac3d5dd/MapServer/";  //Theme Layers
              dojo.connect(app.map, "onUpdateStart", showLoading);
              dojo.connect(app.map, "onUpdateEnd", hideLoading);
              pDetectionsLayer = new FeatureLayer(app.strTheme1_URL + "0", { "opacity": 0.5, mode: FeatureLayer.MODE_SNAPSHOT, id: 0, visible: true });
              pDetectionsLayer.setDefinitionExpression("OBJECTID < 0");

              var strBase_URL = "https://utility.arcgis.com/usrsvcs/servers/56d91717c576443f8385cd1e1001fd6d/rest/services/Catalog/57506bc5e4b033c61ac3d5dd/MapServer/"
              var strlabelField1 = "Receiver";
              pReceiversLayer = new FeatureLayer(strBase_URL + "1", { "opacity": 0.5, mode: FeatureLayer.MODE_SNAPSHOT, id: "Receiver", outFields: [strlabelField1], visible: true });
              
              var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels
              var pLabel1 = new TextSymbol().setColor(vGreyColor);
              pLabel1.font.setSize("10pt");
              pLabel1.font.setFamily("arial");
              var pLabelRenderer1 = new SimpleRenderer(pLabel1);
              var plabels1 = new LabelLayer({ id: "labels1" });
              plabels1.addFeatureLayer(pReceiversLayer, pLabelRenderer1, "{" + strlabelField1 + "}");

              var strNORWESTURL = "https://www.sciencebase.gov/arcgis/rest/services/Catalog/53616f96e4b082a3ecf53f7c/MapServer/";

              pNorWeST = new ArcGISDynamicMapServiceLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/53616f96e4b082a3ecf53f7c/MapServer", { "opacity": 0.9, id: "NorWeST_Layers", visible: false });
              arrayLayers = [pReceiversLayer, plabels1, pDetectionsLayer, pNorWeST];
              var cbxLayers = [];
              cbxLayers.push({ layer: pReceiversLayer, title: 'Receivers' });
              cbxLayers.push({ layer: pDetectionsLayer, title: 'Detections' });

              cbxLayers.push({ layer: pNorWeST, title: 'NorWeST Stream Temp Layers' });
                            
              dojo.connect(app.map, 'onLayersAddResult', function (results) {
                  var legend = new Legend({ map: app.map, layerInfos: cbxLayers, respectCurrentMapScale: false, autoUpdate: true }, "legendDiv");
                  legend.startup();
              });

              app.map.addLayers(arrayLayers);
              dojo.connect(app.map, "onClick", app.pMapSup.executeIdeintifyQueries);

              dojo.connect(app.map, 'onLayersAddResult', function (results) {            //add check boxes 
                  if (results !== 'undefined') {
                      dojo.forEach(cbxLayers, function (layer) {
                          var layerName = layer.title;
                          var checkBox = new CheckBox({ name: "checkBox" + layer.layer.id, value: layer.layer.id, checked: layer.layer.visible,
                              onChange: function (evt) {
                                  var clayer = app.map.getLayer(this.value);
                                  if (clayer.visible) {
                                      clayer.hide();
                                      if (this.value == "GNLCC Project Heat Map") {
                                          var clayer2 = app.map.getLayer("GNLCCProjectHeatMap2");
                                          clayer2.hide();
                                      }
                                  } else {
                                      clayer.show();
                                      if (this.value == "GNLCC Project Heat Map") {
                                          var clayer2 = app.map.getLayer("GNLCCProjectHeatMap2");
                                          clayer2.show();
                                      }
                                  }
                                  this.checked = clayer.visible;
                              }
                          });
                          dojo.place(checkBox.domNode, dojo.byId("toggle"), "after"); //add the check box and label to the toc
                          var checkLabel = dojo.create('label', { 'for': checkBox.name, innerHTML: layerName }, checkBox.domNode, "after");
                          dojo.place("<br />", checkLabel, "after");
                      });
                  }
              });
          },


          executeIdeintifyQueries: function (e) {
              app.map.graphics.clear();
              app.map.infoWindow.hide();

              var arrayQuery = app.gCQD.Return_InitialQueryDefs();

              app.pPTS_Identify = new PTS_Identify({ pLayer1: pDetectionsLayer, pMap: app.map, strQueryString4ID: arrayQuery[0], strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow }); // instantiate the ID Search class
              //app.pPTS_Identify = new PTS_Identify({ pLayer1: pDetectionsLayer, pMap: app.map, strQueryString4ID: app.gQuery.strQuery, strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow }); // instantiate the ID Search class
              app.pEvt = e;
              var pPTS_Identify_Results = app.pPTS_Identify.executeQueries(e, "", 0, 0, 0);
          },



          QueryZoom: function (strQuery) {
              if (app.slider != undefined) {
                  app.layerUpdateEnd.remove();
                  app.slider.destroy();
                  app.slider = null;
                  app.sliderParams = null;
                  app.sliderElem = null;
                  app.map.setTimeSlider(null);
              } 

              app.layerUpdateEnd = pDetectionsLayer.on("update-end", function () {
                app.layerUpdateEnd.remove();

                app.sliderElem = domConstruct.create("div", {
                    id: "timeSlider_" + app.map.id,
                    style: "margin-bottom:10px; bottom:33px"
                }, "bottom-div");
                app.sliderParams = {
                    // format the dates as mm/dd/yyyy
                    // more formatting options:  https://developers.arcgis.com/javascript/3/jshelp/intro_formatinfowindow.html
                    dateFormat: "DateFormat(selector: 'date', fullYear: true)",
                    layers: [pDetectionsLayer],
                    mode: "show_all",
                    timeInterval: "esriTimeUnitsDays",
                };
                app.slider = new HistogramTimeSlider(app.sliderParams, app.sliderElem);
    
                app.map.setTimeSlider(app.slider);
                //app.slider.value[0] = 1;
                //app.slider.value[1] = 2;
                domConstruct.destroy("loading");

                //app.slider.setThumbIndexes([0, 1]);

              });
        
              pDetectionsLayer.setDefinitionExpression(strQuery);

              document.getElementById("ImgResultsLoading").style.visibility = "hidden";

              arrayCheckedCheckboxes = [];
              var pform = document.getElementById("NavigationForm");
              for (var i = 0; i < pform.elements.length; i++) {
                  if (pform.elements[i].type == 'checkbox') {
                      strID = pform.elements[i].id;
                      document.getElementById(strID).disabled = false;
                  }
              }

              document.getElementById("txtQueryResults").innerHTML = "Ready";

          },

          mapLoaded: function () {        // map loaded//            // Map is ready
              app.map.on("mouse-move", app.pMapSup.showCoordinates); //after map loads, connect to listen to mouse move & drag events
              app.map.on("mouse-drag", app.pMapSup.showCoordinates);
              app.basemapGallery = new BasemapGallery({ showArcGISBasemaps: true, map: app.map }, "basemapGallery");
              app.basemapGallery.startup();
              app.basemapGallery.on("selection-change", function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });
              app.basemapGallery.on("error", function (msg) { console.log("basemap gallery error:  ", msg); });

              app.gSup.Phase1(app.strTheme1_URL, [], "OBJECTID > 0");
          },

          showCoordinates: function (evt) {
              var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);  //the map is in web mercator but display coordinates in geographic (lat, long)
              dom.byId("txt_xyCoords").innerHTML = "Latitude:" + mp.x.toFixed(4) + ", Longitude:" + mp.y.toFixed(4);  //display mouse coordinates
          },

          Phase2: function () {

          },

          Phase3: function () {
              var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" });

              var basemapTitle = dom.byId("basemapTitle");
              on(basemapTitle, "click", function () { domClass.toggle("panelBasemaps", "panelBasemapsOn"); });
              on(basemapTitle, mouse.enter, function () { domClass.add("panelBasemaps", "panelBasemapsOn"); });
              var panelBasemaps = dom.byId("panelBasemaps");
              on(panelBasemaps, mouse.leave, function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });

              if (app.map.loaded) {
                  app.pMapSup.mapLoaded();
              }
              else {
                  app.map.on("load", function () {
                      app.pMapSup.mapLoaded();
                  });
              }
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



