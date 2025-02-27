//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014

function showLoading() {
    esri.show(app.loading);
    app.mapPrjReport.disableMapNavigation();
    app.mapPrjReport.hideZoomSlider();
}

function hideLoading(error) {
    esri.hide(app.loading);
    app.mapPrjReport.enableMapNavigation();
    app.mapPrjReport.showZoomSlider();
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
  "esri/dijit/BasemapGallery"
  ], function (
        declare, lang, esriRequest, all, urlUtils, FeatureLayer, ArcGISDynamicMapServiceLayer, CheckBox,
        Legend, Scalebar, Geocoder, dom, domClass, mouse, on, BasemapGallery, Map, Color, SimpleRenderer, LabelLayer, TextSymbol, webMercatorUtils, BasemapGallery
) {
      return declare([], {
          //pMap: null,
          dblExpandNum: null,
          //pFeatureLayer: null,
          strQuery: null,

          constructor: function (options) {
              //              this.pMap = options.pMap || null;
              this.dblExpandNum = options.dblExpandNum || 4;
              this.strQuery = options.strQuery || null;
          },
          Phase1: function () {
              app.loading = dojo.byId("loadingImg");  //loading image. id
              var customExtentAndSR = new esri.geometry.Extent(-14900000, 5200000, -11500000, 7600000, new esri.SpatialReference({ "wkid": 3857 }));
              app.mapPrjReport = new esri.Map("mapPrjReport", { basemap: "osm", logo: false, extent: customExtentAndSR });
              //app.mapPrjReport = new esri.Map("mapPrjReport", { basemap: "topo", logo: false, extent: customExtentAndSR });
              app.strTheme1_URL = app.gCQD.GetMasterAGSMapservicURL();

//              dojo.connect(app.mapPrjReport, "onUpdateStart", showLoading);
              dojo.connect(app.mapPrjReport, "onUpdateEnd", hideLoading);

              var legendLayers = [];
              pPTS_Projects = new FeatureLayer(app.strTheme1_URL + "0", { "opacity": 0.7, mode: FeatureLayer.MODE_ONDEMAND, id: 0, visible: true });
              var strBase_URL = "https://www.sciencebase.gov/arcgis/rest/services/Catalog/546cfb04e4b0fc7976bf1d83/MapServer/"
              var strlabelField1 = "area_names";
              pBase_LCC = new FeatureLayer(strBase_URL + "11", { mode: FeatureLayer.MODE_ONDEMAND, id: "LCC", outFields: [strlabelField1], visible: true });
              var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels
              var pLabel1 = new TextSymbol().setColor(vGreyColor);
              pLabel1.font.setSize("10pt");
              pLabel1.font.setFamily("arial");
              var pLabelRenderer1 = new SimpleRenderer(pLabel1);
              var plabels1 = new LabelLayer({ id: "labels1" });
              plabels1.addFeatureLayer(pBase_LCC, pLabelRenderer1, "{" + strlabelField1 + "}");

              arrayLayers = [pPTS_Projects, plabels1, pBase_LCC];
              app.mapPrjReport.addLayers(arrayLayers);

              this.QueryZoom(this.strQuery);
          },

          QueryZoom: function (strQuery) {
              pPTS_Projects.setDefinitionExpression(strQuery);

              var pQueryT1 = new esri.tasks.QueryTask(pPTS_Projects.url);
              var pQuery1 = new esri.tasks.Query();

              pQuery1.returnGeometry = true;
              pQuery1.outFields = ["objectid, ProjectID"];

              var strQuery1 = pPTS_Projects.getDefinitionExpression();
              pQuery1.where = strQuery1;
              var FLayer1;
              FLayer1 = pQueryT1.execute(pQuery1);
              pPromises = new all([FLayer1]);
              return pPromises.then(this.returnEvents, this.err);

          },


          mapLoaded: function () {        // map loaded//            // Map is ready
              app.mapPrjReport.on("mouse-move", app.pMapSup_prjReport.showCoordinates); //after map loads, connect to listen to mouse move & drag events
              app.mapPrjReport.on("mouse-drag", app.pMapSup_prjReport.showCoordinates);
              app.basemapGallery = new BasemapGallery({ showArcGISBasemaps: true, map: app.mapPrjReport }, "basemapGallery");
              app.basemapGallery.startup();
              app.basemapGallery.on("selection-change", function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });
              app.basemapGallery.on("error", function (msg) {
                  console.log("basemap gallery error:  ", msg); 
                });
          },


          showCoordinates: function (evt) {
              var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);  //the map is in web mercator but display coordinates in geographic (lat, long)
              dom.byId("txt_xyCoords").innerHTML = "Latitude:" + mp.x.toFixed(4) + ", Longitude:" + mp.y.toFixed(4);  //display mouse coordinates
          },

          Phase3: function () {
              var scalebar = new Scalebar({ map: app.mapPrjReport, scalebarUnit: "dual" });

              var basemapTitle = dom.byId("basemapTitle");
              on(basemapTitle, "click", function () { domClass.toggle("panelBasemaps", "panelBasemapsOn"); });
              on(basemapTitle, mouse.enter, function () { domClass.add("panelBasemaps", "panelBasemapsOn"); });
              var panelBasemaps = dom.byId("panelBasemaps");
              on(panelBasemaps, mouse.leave, function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });

              if (app.mapPrjReport.loaded) {
                  app.pMapSup_prjReport.mapLoaded();
              }
              else {
                  app.mapPrjReport.on("load", function () {
                      app.pMapSup_prjReport.mapLoaded();
                  });
              }
          },


          returnEvents: function (results) {

              var resultFeatures = [];
              resultFeatures = resultFeatures.concat(results[0].features);

              if (resultFeatures.length > 0) {
                  var pExtent;
                  pfeatureExtent1 = esri.graphicsExtent(resultFeatures);
                  if (pfeatureExtent1) {
                      pExtent = new esri.geometry.Extent(pfeatureExtent1.xmin, pfeatureExtent1.ymin, pfeatureExtent1.xmax, pfeatureExtent1.ymax, new esri.SpatialReference({ "wkid": 3857 }));
                  }
                  else {
                      var pFeature1 = resultFeatures[0];
                      var ptempSR = new esri.SpatialReference({ "wkid": 3857 });
                      mapPoint1 = new Point(pFeature1.geometry.points[0][0], pFeature1.geometry.points[0][1], ptempSR);
                      app.mapPrjReport.centerAndZoom(mapPoint1, 9);
                  }
                  if (pExtent) {
                      pExtent = pExtent.expand(this.app.pMapSup_prjReport.dblExpandNum);
                      app.mapPrjReport.setExtent(pExtent, true);
                  }
                  else { var strMessage = "hold it up here"; }
              }
              else {
                  // do nothing
              }
              return results;
          },

          err: function (err) {
              console.log("Error: ", err);
              alert(error.name);
          }
      }
    )
    ;

  }
);

