//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2015

function showLoading() {
    esri.show(app.loading);
    app.map.disableMapNavigation();
    app.map.hideZoomSlider();
}

function formatDateTime(value) {
    var inputDate = new Date(value);
    return dojo.date.locale.format(inputDate, {
        datePattern: 'MM/dd/yyyy',
        timePattern: "K:mm:ss a"
        //timePattern: "h:MM:ss TT"
    });
}

function hideLoading(error) {
    var pform = document.getElementById("section3content");
    if (pform.elements != undefined) {
        esri.hide(app.loading);
    }
    
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
  "extras/PTS_Identify", "esri/dijit/HistogramTimeSlider",
  "esri/TimeExtent", "esri/dijit/TimeSlider", "dojo/_base/array", "dojo/parser", "dojo/dom-construct"
  ], function (
        declare, lang, esriRequest, all, urlUtils, FeatureLayer, ArcGISDynamicMapServiceLayer, CheckBox,
        Legend, Scalebar, Geocoder, dom, domClass, mouse, on, BasemapGallery, Map, Color, SimpleRenderer, LabelLayer, TextSymbol, webMercatorUtils, BasemapGallery, PTS_Identify, HistogramTimeSlider, TimeExtent, TimeSlider, arrayUtils, parser, domConstruct
) {
      return declare([], {
          pMap: null,
          dblExpandNum: null,
          pFeatureLayer: null,
          iSliderDateStart: null,
          iSliderDateEnd: null,
          constructor: function (options) {
              this.pMap = options.pMap || null;
              this.dblExpandNum = options.dblExpandNum || 4;
          },
          Phase1: function () {
              app.loading = dojo.byId("loadingImg");  //loading image. id
              var customExtentAndSR = new esri.geometry.Extent(-12310232, 5492317, -12260927, 5575417, new esri.SpatialReference({ "wkid": 3857 }));
              app.map = new esri.Map("map", { basemap: "topo", logo: false, extent: customExtentAndSR });
              app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/5d9e8587a07a41b09c9b1f62cf51b920/rest/services/Layers/FeatureServer/";  //Theme Layers
              dojo.connect(app.map, "onUpdateStart", showLoading);
              dojo.connect(app.map, "onUpdateEnd", hideLoading);
              pDetectionsLayer = new FeatureLayer(app.strTheme1_URL + "0", { "opacity": 0.5, mode: FeatureLayer.MODE_SNAPSHOT, id: 0, visible: true });

              pDetectionsLayer.setDefinitionExpression("OBJECTID < 0");  //set initial def query to show nothing

              var strBase_URL = "https://utility.arcgis.com/usrsvcs/servers/5d9e8587a07a41b09c9b1f62cf51b920/rest/services/Layers/FeatureServer/"
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

          TimeSliderStart: function (strdte_Start, strdteEnd) {
              if (app.slider == undefined) {
                  app.slider = new TimeSlider({ style: "width: 100%;" }, dom.byId("timeSliderDiv"));
              } else {
                  app.slider.pause();
              }
              
              app.map.setTimeSlider(app.slider);
              var timeExtent = new TimeExtent();
              timeExtent.startTime = new Date(strdte_Start);
              timeExtent.endTime = new Date(strdteEnd);
              app.slider.setThumbCount(2);

              //figure out the difference of days and set the scale appropriately
              //var dteFromTime = app.slider.fullTimeExtent.startTime;
              //var dteToTime = app.slider.fullTimeExtent.endTime;
              var timeDiff = Math.abs(new Date(strdteEnd) - new Date(strdte_Start).getTime());
              var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
              if (diffDays > 400) {
                  app.slider.createTimeStopsByTimeInterval(timeExtent, 3, "esriTimeUnitsMonths");
              } else if ((diffDays <= 400) & (diffDays > 200)) {
                  app.slider.createTimeStopsByTimeInterval(timeExtent, 20, "esriTimeUnitsDays");
              } else if ((diffDays <= 205) & (diffDays > 60)) {
                  app.slider.createTimeStopsByTimeInterval(timeExtent, 10, "esriTimeUnitsDays");
              } else if ((diffDays <= 60) & (diffDays > 30)) {
                  app.slider.createTimeStopsByTimeInterval(timeExtent, 2, "esriTimeUnitsDays");
              } else if ((diffDays <= 30) & (diffDays > 2)) {
                  app.slider.createTimeStopsByTimeInterval(timeExtent, 1, "esriTimeUnitsDays");
              } else if ((diffDays <= 2) & (diffDays > 1)) {
                  app.slider.createTimeStopsByTimeInterval(timeExtent, 4, "esriTimeUnitsHours");
              } else {
                  //app.timeSlider.singleThumbAsTimeInstant(true);
                  app.slider.createTimeStopsByTimeInterval(timeExtent, 2, "esriTimeUnitsHours");
                }      
              app.slider.setThumbIndexes([0, 1]);
              app.slider.setThumbMovingRate(2000);
              app.slider.setLoop(true);
              app.slider.startup();
              //app.slider.setLoop = true;

              var labels = arrayUtils.map(app.slider.timeStops, function (timeStop, i) {              //add labels for every other time stop
                  if (i % 2 === 0) {
                      if (diffDays <= 2) {
                          return formatDateTime(timeStop.getTime());
                      } else {
                          return timeStop.getMonth() + 1 + "/" + timeStop.getDate() + "/" + timeStop.getFullYear();
                      }
                  } else {
                      return "";
                  }
              });
              app.slider.setLabels(labels);
              app.slider.on("time-extent-change", function (evt) {
                  var startValString = evt.startTime.getMonth() + 1 + "/" + evt.startTime.getDate() + "/" + evt.startTime.getFullYear();
                  var endValString = evt.endTime.getMonth() + 1 + "/" + +evt.endTime.getDate() + "/" + evt.endTime.getFullYear();

                  dom.byId("daterange").innerHTML = "<i>" + startValString + " and " + endValString + "<\/i>";
              });
              app.slider.play();
          },

          QueryZoom: function (strQuery) {
              ////strFromDate = app.pMapSup.iSliderDateStart.getMonth() + 1 + "/" + app.pMapSup.iSliderDateStart.getDate() + "/" + app.pMapSup.iSliderDateStart.getFullYear();
              ////strEndDate = app.pMapSup.iSliderDateEnd.getMonth() + 1 + "/" + app.pMapSup.iSliderDateEnd.getDate() + "/" + app.pMapSup.iSliderDateEnd.getFullYear();
              strFromDate = $('#datepickerFrom').datepicker({ dateFormat: 'mm/dd/yy' }).val();
              strEndDate = $('#datepickerTo').datepicker({ dateFormat: 'mm/dd/yy' }).val();

              if (strQuery == "OBJECTID > 0") {
              //    var tempFromDate = $("#datepickerFrom").datepicker("getDate");
              //    strFromDate = tempFromDate.getMonth() + 1 + "/" + tempFromDate.getDate() + "/" + tempFromDate.getFullYear();
              //    strFromDateQuery = tempFromDate.getMonth() + 1 + "-" + tempFromDate.getDate() + "-" + tempFromDate.getFullYear();
              //    var tempToDate = $("#datepickerTo").datepicker("getDate");
              //    strEndDate = tempToDate.getMonth() + 1 + "/" + tempToDate.getDate() + "/" + tempToDate.getFullYear();
              //    strEndDateQuery = tempToDate.getMonth() + 1 + "-" + tempToDate.getDate() + "-" + tempToDate.getFullYear();
                  strFromDateQuery = $('#datepickerFrom').datepicker({ dateFormat: 'mm-dd-yy' }).val();
                  strEndDateQuery = $('#datepickerTo').datepicker({ dateFormat: 'mm-dd-yy' }).val();
                  strQuery = "(Date_Time_noMin >= '" + strFromDateQuery + "') and (Date_Time_noMin <= '" + strEndDateQuery + "')";
              }

              if (app.slider != undefined) {
                  app.slider.pause();
              }
              pDetectionsLayer.setDefinitionExpression(strQuery);
              app.layerUpdateEnd = pDetectionsLayer.on("update-end", function () {
                  app.layerUpdateEnd.remove();
                  app.pMapSup.TimeSliderStart(strFromDate + " 12:00:00 UTC", strEndDate + " 00:00:00 UTC");
              })
              
              arrayCheckedCheckboxes = [];
              var pform = document.getElementById("NavigationForm");
              for (var i = 0; i < pform.elements.length; i++) {
                  if (pform.elements[i].type == 'checkbox') {
                      strID = pform.elements[i].id;
                      document.getElementById(strID).disabled = false;
                  }
              }
              //document.getElementById("txtQueryResults").innerHTML = "Ready";
          },

          mapLoaded: function () {        // map loaded//            // Map is ready
              app.map.on("mouse-move", app.pMapSup.showCoordinates); //after map loads, connect to listen to mouse move & drag events
              app.map.on("mouse-drag", app.pMapSup.showCoordinates);
              app.basemapGallery = new BasemapGallery({ showArcGISBasemaps: true, map: app.map }, "basemapGallery");
              app.basemapGallery.startup();
              app.basemapGallery.on("selection-change", function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });
              app.basemapGallery.on("error", function (msg) { console.log("basemap gallery error:  ", msg); });
              //app.gSup.Phase1(app.strTheme1_URL, [], "(Date_Time_noMin > '08-26-2011') and (Date_Time_noMin > '09-13-2011')");
              //app.gSup.Phase1(app.strTheme1_URL, [], "FishID in ('LKT_0008')");
              app.gSup.Phase1(app.strTheme1_URL, [], "OBJECTID > 0");
              //pDetectionsLayer.setDefinitionExpression("(OBJECTID > 0)");
              //app.pMapSup.TimeSliderStart("8/11/2015 12:00:00 UTC", "8/13/2015 00:00:00 UTC");
              //app.pMapSup.HistSliderStart();
          },

          showCoordinates: function (evt) {
              var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);  //the map is in web mercator but display coordinates in geographic (lat, long)
              dom.byId("txt_xyCoords").innerHTML = "Latitude:" + mp.x.toFixed(4) + ", Longitude:" + mp.y.toFixed(4);  //display mouse coordinates
          },

          Phase2: function () {

          },

          Phase3: function () {
              var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" }, dojo.byId("scalebar"));

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



