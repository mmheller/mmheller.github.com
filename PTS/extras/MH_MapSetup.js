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

function btn_EmailLink_click(e) {
    //strURL = document.URL;
    strURL = window.location.href.split('?')[0]
    strQuery = "?"
    arrayQuery = app.gCQD.Return_InitialQueryDefs();
    for (var i = 0; i < arrayQuery.length; i++) {  //loop through the checkboxes of the form and determin if one of the ones to click
        strTableIndex = arrayQuery[i][0];
        strQueryString = arrayQuery[i][1];
        strQuery += strTableIndex + "|" + strQueryString
        if (i != (arrayQuery.length - 1)) {
            strQuery += "&"
        }
    }
    if (app.gQuery.arryExtraPrjIDs4URLParam.length > 0) {  //add individually added project (i.e. from text search) to a query option)
        if (document.URL.length + 1 != (strURL.length + strQuery.length)) {
            strQuery += "&";
        }
        //strQuery += "PrjID2Add|ProjectID in (" + app.gQuery.arryExtraPrjIDs4URLParam.join(",") + ")";
        strQuery += "PrjID2Add|" + app.gQuery.arryExtraPrjIDs4URLParam.join(",");
    }
    if (app.gQuery.m_arrayUserRemovedPrjs.length > 0) {    //remove individually removed projects (i.e. from right click-->reomve) to a query option)
        if (document.URL.length + 1 != (strURL.length + strQuery.length)) {
            strQuery += "&";
        }
        strQuery += "PrjID2Remove|" + app.gQuery.m_arrayUserRemovedPrjs.join(",");
        //strQuery += "PrjID2Remove|ProjectID in (" + app.gQuery.m_arrayUserRemovedPrjs.join(",") + ")";
    }
    strURL += strQuery;
    btn_Get_filter_link2.value = strURL;
    btn_Get_filter_link2.style.visibility = "visible";
    var t = e.target // find target element
    var c = t.dataset.copytarget
    var inp = (c ? document.querySelector(c) : null);
    if (inp && inp.select) {            // is element selectable?
        inp.select();                // select text
        try {
            document.execCommand('copy');                    // copy text
            inp.blur();
            t.classList.add('copied');// copied animation
            setTimeout(function () { t.classList.remove('copied'); }, 1500);
        }
        catch (err) {
            alert('please press Ctrl/Cmd+C to copy');
        }
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
  "extras/PTS_Identify"
  ], function (
        declare, lang, esriRequest, all, urlUtils, FeatureLayer, ArcGISDynamicMapServiceLayer, CheckBox,
        Legend, Scalebar, Geocoder, dom, domClass, mouse, on, BasemapGallery, Map, Color, SimpleRenderer, LabelLayer, TextSymbol, webMercatorUtils, BasemapGallery, PTS_Identify
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
              var customExtentAndSR = new esri.geometry.Extent(-14900000, 5200000, -11500000, 7600000, new esri.SpatialReference({ "wkid": 3857 }));
              app.map = new esri.Map("map", { basemap: "topo", logo: false, extent: customExtentAndSR });
              app.strTheme1_URL = app.gCQD.GetMasterAGSMapservicURL();

              dojo.connect(app.map, "onUpdateStart", showLoading);
              dojo.connect(app.map, "onUpdateEnd", hideLoading);

//              var legendLayers = [];
              pPTS_Projects = new FeatureLayer(app.strTheme1_URL + "0", { "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, id: 0, visible: true });
              var strBase_URL = "https://www.sciencebase.gov/arcgis/rest/services/Catalog/546cfb04e4b0fc7976bf1d83/MapServer/";
              var strlabelField1 = "area_names";
              pBase_LCC = new FeatureLayer(strBase_URL + "11", { mode: FeatureLayer.MODE_ONDEMAND, id: "LCC", outFields: [strlabelField1], visible: true });
              var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels
              var pLabel1 = new TextSymbol().setColor(vGreyColor);
              pLabel1.font.setSize("10pt");
              pLabel1.font.setFamily("arial");
              var pLabelRenderer1 = new SimpleRenderer(pLabel1);
              var plabels1 = new LabelLayer({ id: "labels1" });
              plabels1.addFeatureLayer(pBase_LCC, pLabelRenderer1, "{" + strlabelField1 + "}");

              pHeatLayer = new FeatureLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/55c00cf2e4b033ef52104158/MapServer/0", { mode: FeatureLayer.MODE_ONDEMAND, id: "GNLCC Project Heat Map", visible: false });
              pHeatLayer2 = new ArcGISDynamicMapServiceLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/55c00cf2e4b033ef52104158/MapServer", { "opacity": 0.8, id: "GNLCCProjectHeatMap2", visible: false });

              pHumanMod = new ArcGISDynamicMapServiceLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/5527fe7fe4b026915857c948/MapServer", { "opacity": 0.5, id: "HumanMod", visible: false });

              pRefugesLayer = new FeatureLayer(strBase_URL + "2", { "opacity": 0.8, mode: FeatureLayer.MODE_ONDEMAND, id: "USFWS Refuges", visible: false });
              pUSNativeLayer = new FeatureLayer("https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_TribalIndianLands_01/MapServer/0", { "opacity": 0.8, mode: FeatureLayer.MODE_ONDEMAND, id: "US Native Lands", visible: false });


              pCANNationalParks = new ArcGISDynamicMapServiceLayer("http://maps.natureserve.org/landscope1/rest/services/CAN/PRO_CAN_NationalParks/MapServer", { "opacity": 0.8, mode: FeatureLayer.MODE_ONDEMAND, id: "Can National Parks", visible: false });

              pNPSLayer = new ArcGISDynamicMapServiceLayer("https://mapservices.nps.gov/arcgis/rest/services/LandResourcesDivisionTractAndBoundaryService/MapServer", { "opacity": 0.8, mode: FeatureLayer.MODE_ONDEMAND, id: "US National Park Service", visible: false });
              pUSFSLayer = new ArcGISDynamicMapServiceLayer("https://apps.fs.fed.us/arcx/rest/services/EDW/EDW_BasicOwnership_01/MapServer", { "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, id: "US Forest Service Land (Zoom in to View)", visible: false });
              pBLMLayer = new ArcGISDynamicMapServiceLayer("https://maps4.arcgisonline.com/ArcGIS/rest/services/DOI/SMA-BLM_Federal_Lands/MapServer", { "opacity": 0.8, mode: FeatureLayer.MODE_ONDEMAND, id: "BLM Land", visible: false });

              var strlabelField2 = "area_names";
              pLCCNetworkLayer = new FeatureLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/55b943ade4b09a3b01b65d78/MapServer/0", { "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, id: "LCC Network", outFields: [strlabelField2], visible: false });
              var vWhiteColor = new Color("#FFFFFF");              // create a text symbol to define the style of labels
              var pLabel2 = new TextSymbol().setColor(vWhiteColor);
              pLabel2.font.setSize("10pt");
              pLabel2.font.setFamily("arial");
              var pLabelRenderer2 = new SimpleRenderer(pLabel2);
              var plabels2 = new LabelLayer({ id: "labels2" });
              plabels2.addFeatureLayer(pLCCNetworkLayer, pLabelRenderer2, "{" + strlabelField2 + "}");


              pCascadiaPF = new ArcGISDynamicMapServiceLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/55cba6bfe4b08400b1fddd17/MapServer", { "opacity": 0.9, id: "Cascadia", visible: false });
              pColumbiaPF = new ArcGISDynamicMapServiceLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/55cba71be4b08400b1fddd1a/MapServer", { "opacity": 0.9, id: "Columbia", visible: false });
              pRMPF = new ArcGISDynamicMapServiceLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/55cba7cbe4b08400b1fddd22/MapServer", { "opacity": 0.9, id: "Rocky Mountain", visible: false });
              pSSPF = new ArcGISDynamicMapServiceLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/55cba817e4b08400b1fddd28/MapServer", { "opacity": 0.9, id: "Sage Steppe", visible: false });
              pPartnershipsAreas = new ArcGISDynamicMapServiceLayer("https://www.sciencebase.gov/arcgis/rest/services/Catalog/55cba773e4b08400b1fddd1f/MapServer", { "opacity": 0.9, id: "PandE_Areas", visible: false });


              arrayLayers = [pCascadiaPF, pColumbiaPF, pRMPF, pSSPF, pPartnershipsAreas, pPTS_Projects, plabels1, pHeatLayer2, pHeatLayer, pBase_LCC, pRefugesLayer,
                                pUSNativeLayer, pCANNationalParks, pNPSLayer, pUSFSLayer, pBLMLayer, pLCCNetworkLayer, plabels2, pHumanMod];


              var cbxLayers = [];

              cbxLayers.push({ layer: pHeatLayer, title: 'GNLCC Project Heat Map' });
              cbxLayers.push({ layer: pHumanMod, title: 'Human Modification Index' });
              cbxLayers.push({ layer: pLCCNetworkLayer, title: 'LCC Network Areas' });
              cbxLayers.push({ layer: pRefugesLayer, title: 'USFWS Refuges' });
              cbxLayers.push({ layer: pUSNativeLayer, title: 'US Indian Lands Boundaries' });
              cbxLayers.push({ layer: pCANNationalParks, title: 'Canada National Parks' });
              cbxLayers.push({ layer: pNPSLayer, title: 'US National Park Service' });
              cbxLayers.push({ layer: pUSFSLayer, title: 'US Forest Service Land (Zoom in to View)' });
              cbxLayers.push({ layer: pBLMLayer, title: 'BLM Land' });
              
              cbxLayers.push({ layer: pCascadiaPF, title: 'Cascadia PF (General Area)' });
              cbxLayers.push({ layer: pColumbiaPF, title: 'Columbia Basin PF (General Area)' });
              cbxLayers.push({ layer: pRMPF, title: 'Rocky Mountain PF (General Area)' });
              cbxLayers.push({ layer: pSSPF, title: 'Sage Steppe PF (General Area)' });
              cbxLayers.push({ layer: pPartnershipsAreas, title: 'Partner and Ecosystem Areas of Interest' });
              cbxLayers.push({ layer: pBase_LCC, title: 'GNLCC Boundary' });
              cbxLayers.push({ layer: pPTS_Projects, title: 'Projects' });
                            
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
              app.pPTS_Identify = new PTS_Identify({ pLayer1: pPTS_Projects, pMap: app.map, strQueryString4ID: app.gQuery.strQuery, strURL: app.strTheme1_URL,
                  pInfoWindow: app.infoWindow
              }); // instantiate the ID Search class
              app.pEvt = e;
              var pPTS_Identify_Results = app.pPTS_Identify.executeQueries(e, "", 0, 0, 0);
          },
          
          QueryZoom: function (strQuery) {
              pPTS_Projects.setDefinitionExpression(strQuery);
          },

          mapLoaded: function () {        // map loaded//            // Map is ready
              app.map.on("mouse-move", app.pMapSup.showCoordinates); //after map loads, connect to listen to mouse move & drag events
              app.map.on("mouse-drag", app.pMapSup.showCoordinates);
              app.basemapGallery = new BasemapGallery({ showArcGISBasemaps: true, map: app.map }, "basemapGallery");
              app.basemapGallery.startup();
              app.basemapGallery.on("selection-change", function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });
              app.basemapGallery.on("error", function (msg) { console.log("basemap gallery error:  ", msg); });
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

              document.getElementById("btn_Get_filter_link1").addEventListener('click', btn_EmailLink_click);

              $('#loc').autocomplete({
                  source: function (request, response) {
                      var strURL4Search = app.strTheme1_URL + "0/query" +
                                       "?where=ProjectID+like+%27%25" + request.term + "%25%27" +
                                       "+or+Prj_Title+like+%27%25" + request.term + "%25%27" +
                                       "+or+PI_Org+like+%27%25" + request.term + "%25%27" +
                                       "+or+Partner_Organizaitons+like+%27%25" + request.term + "%25%27" +
                                       "+or+Subject_Keywords+like+%27%25" + request.term + "%25%27" +
                                       "+or+Location_Keywords+like+%27%25" + request.term + "%25%27" +
                                       "+or+LeadName_LastFirst+like+%27%25" + request.term + "%25%27" +
                                       "&f=pjson&returnGeometry=false&outFields=ProjectID%2C+Prj_Title%2C+PI_Org%2C+LeadName_LastFirst";
                      
                      $.ajax({
                          // this is for use with a proxy page url: app.strPxURL  "?" + app.strTheme1_URL + "find"  "?searchFields=ProjectID,Prj_Title,PI_Org,Partner_Organizaitons,Subject_Keywords,Location_Keywords,LeadName_LastFirst&SearchText=" + request.term + "&layers=0&f=pjson&returnGeometry=true",
                          //the following no longer works due to AGOL not exposing the "find" supported operation
                          //url: app.strTheme1_URL + "find" +  
                          //          "?searchFields=ProjectID,Prj_Title,PI_Org,Partner_Organizaitons,Subject_Keywords,Location_Keywords,LeadName_LastFirst" +
                          //          "&SearchText=" + request.term +
                          //          "&layers=0,9&f=pjson&returnGeometry=true",
                          url: strURL4Search,
                          dataType: "jsonp",
                          data: {},                        //data: { where: strSearchField + " LIKE '%" + request.term.replace(/\'/g, '\'\'').toUpperCase() + "%'", outFields: strSearchField, returnGeometry: true, f: "pjson" },                        
                          success: function (data) {
                              //if (data.results) {                           //                            if (data.features) {
                              if (data.features) {                           //                            if (data.features) {
                                  response($.map(data.features.slice(0, 19), function (item) {      //only display first 10
                                      return { label: item.attributes.Prj_Title + " ID:" + item.attributes.ProjectID +
                                        " (PI:" + item.attributes.LeadName_LastFirst + ")",
                                          value2: item.attributes.ProjectID, value3: item.attributes.ProjectID
                                      }
                                  }));
                              }
                          },
                          error: function (message) { response([]); }
                      });
                  },
                  minLength: 4,
                  select: function (event, ui) {
                      this.blur();
                      var iProjectID = ui.item.value2;
                      if (app.gQuery.strQuery == null) {
                          app.gQuery.strQuery = "ProjectID in (" + iProjectID + ")";
                      } else {
                          app.gQuery.strQuery = app.gQuery.strQuery.replace(")", "," + iProjectID + ")");
                      }
                      app.gQuery.SendQuery4ProjectResults(app.gQuery.strQuery, grid);
                      this.value = "";
                      return false;
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





