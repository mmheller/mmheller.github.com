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
            mouse, on, BasemapGallery, Map, PS_Identify, Color, SimpleRenderer, LabelLayer, TextSymbol
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

          Phase1: function () {
            //do nothing
          },


          Phase2: function () {
          app.loading = dojo.byId("loadingImg");  //loading image. id
              var customExtentAndSR = new esri.geometry.Extent(-14000000, 4800000, -11000000, 6200000, new esri.SpatialReference({ "wkid": 3857 }));
              app.map = new esri.Map("map", { basemap: "topo", logo: false, extent: customExtentAndSR });
              //app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/d725bb5ba60348fd841b05f80cf4465d/rest/services/CEDfrontpage_map_v9_Restrict/FeatureServer/"
              app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/5d5fc053dd7e4de4b9765f7a6b6f1f61/rest/services/CEDfrontpage_map_v9_Restrict/FeatureServer/";

              dojo.connect(app.map, "onUpdateStart", showLoading);
              dojo.connect(app.map, "onUpdateEnd", hideLoading);

              var legendLayers = [];
              CED_PP_point = new FeatureLayer(app.strTheme1_URL + "0", {id: "0", mode: FeatureLayer.MODE_ONDEMAND, visible: true});
              CED_PP_point.setDefinitionExpression("((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))");
              var PSelectionSymbolPoint = new SimpleMarkerSymbol().setColor(new Color([0, 255, 255, 0.4]))
              CED_PP_point.setSelectionSymbol(PSelectionSymbolPoint);

              this.gCED_PP_point4FeatureTable = new FeatureLayer(app.strTheme1_URL + "0", {
                  id: "00", mode: FeatureLayer.MODE_ONDEMAND, visible: false,
                  outFields: ["Project_ID", "SourceFeatureType", "Project_Name", "Project_Status", "Activity", "SubActivity", "Implementing_Party", "Office", "Date_Created", "Last_Updated", "Date_Approved", "TypeAct", "TotalAcres", "TotalMiles"]
                  //outFields: ["Project_ID", "SourceFeatureType", "Project_Name", "Entry_Type", "Activity", "SubActivity", "Implementing_Party", "Office", "Date_Created", "Last_Updated", "Date_Approved", "TypeAct", "TotalAcres", "TotalMiles"]
              });

              CED_PP_line = new FeatureLayer(app.strTheme1_URL + "1", { id: "1", mode: FeatureLayer.MODE_ONDEMAND, visible: true });
              pSeletionSymbolLine = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([0, 255, 255]), 3)
              CED_PP_line.setSelectionSymbol(pSeletionSymbolLine);

              CED_PP_poly = new FeatureLayer(app.strTheme1_URL + "2", { id: "2", "opacity": 0.5, mode: esri.layers.FeatureLayer.MODE_ONDEMAND, autoGeneralize: true, visible: true });
              pSeletionSymbolPoly = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([0, 0, 0]), 3), new Color([0, 255, 255, 0.4]));
              CED_PP_poly.setSelectionSymbol(pSeletionSymbolPoly);


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

              legendLayers.push({ layer: pBase_PAC, title: 'GRSG Priority Areas for Conservation (PACs)' });
              legendLayers.push({ layer: pBase_SMA, title: 'Land Ownership (Surface Management Agency, BLM 2015)' });
              legendLayers.push({ layer: pBase_GHMA, title: 'GRSG General Habitat Management Areas (GHMA + OHMA [NV, UT]) (BLM/USFS 2015)' });
              legendLayers.push({ layer: pBase_PHMA, title: 'GRSG Priority Habitat Management Areas (PHMA + IHMA [ID]) (BLM/USFS 2015)' });
              legendLayers.push({ layer: pBase_Eco, title: 'Ecosystem Resilience & Resistance (R&R) (Chambers et al. 2014, 2016)' });
              legendLayers.push({ layer: pBase_RRP, title: 'GRSG Pop’l’n Index (High/Low (80% threshold)) + R&R (Chambers et al. 2017 )' });
              legendLayers.push({ layer: pBase_RRB, title: 'GRSG Breeding Habitat Dist. + R&R (Chambers et al. 2017)' });
              legendLayers.push({ layer: pBase_Breed, title: 'Breeding Habitat Distribution (Doherty et al. 2017)' });
              legendLayers.push({ layer: pBase_PI, title: 'GRSG Pop’l’n Index (Relative Abundance) (Doherty et al. 2017)' });
              legendLayers.push({ layer: CED_PP_poly, title: 'CED Plans and Projects' });
              //legendLayers.push({ layer: CED_PP_line, title: 'CED Plans and Projects (line)' });
              //legendLayers.push({ layer: CED_PP_point, title: 'CED Plans and Projects (point)' });
              legendLayers.push({ layer: pBase_Pop, title: 'GRSG Populations' });
              legendLayers.push({ layer: pBase_MZ, title: 'WAFWA Management Zones' });

              dojo.connect(app.map, 'onLayersAddResult', function (results) {
                  var legend = new Legend({ map: app.map, layerInfos: legendLayers, respectCurrentMapScale: false, autoUpdate: true }, "legendDiv");
                  legend.startup();
              });

              var cbxLayers = [];

              cbxLayers.push({ layers: [pBase_PAC, pBase_PAC], title: 'GRSG Priority Areas for Conservation (PACs)' });
              cbxLayers.push({ layers: [pBase_SMA, pBase_SMA], title: 'Land Ownership<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<a href="https://landscape.blm.gov/geoportal/catalog/search/resource/details.page?uuid=%7BB425E538-FC75-4B70-B287-4AEC6F9017DB%7D" target="_blank">(Surface Management Agency, BLM 2015)</a>' });
              cbxLayers.push({ layers: [pBase_GHMA, pBase_GHMA], title: 'GRSG General Habitat Management Areas<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(GHMA + OHMA [NV, UT])<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<a href="https://landscape.blm.gov/geoportal/catalog/search/resource/details.page?uuid=%7BB0348167-81B5-481E-80CB-BF28B1587988%7D" target="_blank">(BLM/USFS 2015)</a>' });
              cbxLayers.push({ layers: [pBase_PHMA, pBase_PHMA], title: 'GRSG Priority Habitat Management Areas<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(PHMA + IHMA [ID])<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<a href="https://landscape.blm.gov/geoportal/catalog/search/resource/details.page?uuid=%7B8D87923A-E3C5-4853-80C3-4399CC5C9E53%7D" target="_blank">(BLM/USFS 2015)</a>' });
              cbxLayers.push({ layers: [pBase_Eco, pBase_Eco], title: 'Ecosystem Resilience & Resistance (R&R)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Chambers et al. 2014, 2016)' });
              cbxLayers.push({ layers: [pBase_RRP, pBase_RRP], title: 'GRSG Pop’l’n Index (High/Low (80% threshold)) + R&R<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Chambers et al. 2017 )' });
              cbxLayers.push({ layers: [pBase_RRB, pBase_RRB], title: 'GRSG Breeding Habitat Dist. + R&R<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Chambers et al. 2017)' });
              cbxLayers.push({ layers: [pBase_Breed, pBase_Breed], title: 'Breeding Habitat Distribution<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Doherty et al. 2017)' });
              cbxLayers.push({ layers: [pBase_PI, plabels2], title: 'GRSG Pop’l’n Index (Relative Abundance)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Doherty et al. 2017)' });
              cbxLayers.push({ layers: [CED_PP_poly, CED_PP_poly], title: 'CED Plans and Projects (area)' });
              cbxLayers.push({ layers: [CED_PP_point, CED_PP_point], title: 'CED Plans and Projects (point)' });
              cbxLayers.push({ layers: [CED_PP_line, CED_PP_line], title: 'CED Plans and Projects (line)' });
              cbxLayers.push({ layers: [pBase_Pop, plabels1], title: 'GRSG Populations' });
              cbxLayers.push({ layers: [pBase_MZ, plabels2], title: 'WAFWA Management Zones' });

              arrayLayers = [pBase_PAC, pBase_SMA, pBase_GHMA, pBase_PHMA, pBase_Eco, pBase_RRP, pBase_RRB, pBase_Breed, pBase_PI, pBase_MZ, pBase_Pop, plabels1, plabels2, CED_PP_poly, CED_PP_line, CED_PP_point, this.gCED_PP_point4FeatureTable];
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
                          if ((pID0 == "0") | (pID0 == "1") | (pID0 == "2") | (pID0 == "graphicsLayer1")) {
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

              this.gFeatureTable = new FeatureTable({
                  "featureLayer": this.gCED_PP_point4FeatureTable,
                  "outFields": [
                    "Project_ID", "TypeAct", "Project_Name", "Activity", "SubActivity", "Implementing_Party", "Office", "Date_Created",
                    "Last_Updated", "Date_Approved", "TotalAcres", "TotalMiles", "SourceFeatureType"
                  ],
                  fieldInfos: [
                    { name: 'Project_ID', alias: 'ID'},
                    { name: 'TypeAct', alias: 'Project or Plan', },
                    { name: 'Project_Name', alias: 'Effort Name', },
                    { name: 'Activity', alias: 'Activity', },
                    { name: 'SubActivity', alias: 'Sub Activity', },
                    { name: 'Implementing_Party', alias: 'Implementing Party', },
                    { name: 'Office', alias: 'Office', },
                    { name: 'Date_Created', alias: 'Date Recorded', },
                    { name: 'Last_Updated', alias: 'Recorded Update', },
                    { name: 'Date_Approved', alias: 'Date Approved', },
                    { name: 'TotalAcres', alias: 'Acres', },
                    { name: 'TotalMiles', alias: 'Miles', },
                    { name: 'SourceFeatureType', alias: 'Source', }
                  ],
                  "map": map
              }, 'myTableNode');

              this.gFeatureTable.showGridHeader = false;
              this.gFeatureTable.columnResizer = false;
              this.gFeatureTable.startup();

              on(this.gFeatureTable, "load", function (evt) {  //resize the column widths
                  var pGrid = this.grid;
                  var arrayColWidths = [55, 145, 380, 380, 360, 230, 290, 150, 150, 150, 80, 80, 60];
                  var iTotalWidth = 0;
                  dojo.forEach(arrayColWidths, function (iWidth) {
                      iTotalWidth += iWidth;
                  });
                  pGrid.width = iTotalWidth;
                  var iWidthIndex = 1;
                  dojo.forEach(arrayColWidths, function (iWidth) {
                      pGrid.resizeColumnWidth(iWidthIndex, iWidth);
                      
                      iWidthIndex += 1;
                  });
                  pGrid.bodyNode.scrollWidth = iTotalWidth;
              });



              on(this.gFeatureTable, "row-select", function (evt) {  //resize the column widths
                  app.map.graphics.clear();
                  CED_PP_point.clearSelection();
                  CED_PP_line.clearSelection();
                  CED_PP_poly.clearSelection();

                  var pGrid = this.grid;
                  var arrayPrjIDs = [];
                  var strProjectType = "";
                  var iProjectid;

                  for (var irowID in pGrid.selection) {  //run through selected records in the attribute table that meet a criteria
                      var pRow = pGrid.row(irowID);

                      strProjectType = pRow.data.TypeAct;
                      if (strProjectType == "Spatial Project") {
                          //strSourceGeom = pRow.data.SourceFeatureType;
                          iProjectid = pRow.data.Project_ID;
                          arrayPrjIDs.push(iProjectid);
                      }
                  }

                  if (arrayPrjIDs != []) {    //if some records selected in the attribute table then query 
                      var strQuery2 = ""
                      for (var i = 0; i < arrayPrjIDs.length; i++) {
                          strQuery2 += arrayPrjIDs[i] + ",";
                      }
                      var strQuery1 = "Project_ID in (" + strQuery2.slice(0, -1) + ")";

                      var promises = []

                      var pSelQueryPoint = new Query();
                      pSelQueryPoint.returnGeometry = false;
                      pSelQueryPoint.outFields = ["*"];
                      pSelQueryPoint.where = strQuery1 + " and ((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1))";
                      promises.push(CED_PP_point.selectFeatures(pSelQueryPoint, FeatureLayer.SELECTION_NEW));

                      var pSelQuery = new Query();
                      pSelQuery.returnGeometry = false;
                      pSelQuery.outFields = ["*"];
                      pSelQuery.where = strQuery1;
                      promises.push(CED_PP_poly.selectFeatures(pSelQuery, FeatureLayer.SELECTION_NEW));
                      promises.push(CED_PP_line.selectFeatures(pSelQuery, FeatureLayer.SELECTION_NEW));
                      var allPromises = new All(promises);
                      allPromises.then(function (r) {
                          showResults(r);
                      });


                      function showResults(results) {
                          var pUnionedExtent;
                          if (results[0].length > 0) {
                              pUnionedExtent = graphicsUtils.graphicsExtent(CED_PP_point.getSelectedFeatures());
                          }
                          if (results[1].length > 0) {
                              if (pUnionedExtent) {
                                  if (pUnionedExtent.xmax == pUnionedExtent.xmin) {  //if extent is derived from a point must expand otherwise union will not work properly
                                      var pXtemp = pUnionedExtent.xmax
                                      var pYtemp = pUnionedExtent.ymax

                                      pUnionedExtent.xmax = pXtemp + 10000;
                                      pUnionedExtent.xmin = pXtemp - 10000;
                                      pUnionedExtent.ymax = pYtemp + 10000;
                                      pUnionedExtent.ymin = pYtemp - 10000;
                                  }

                                  pUnionedExtent = pUnionedExtent.union(graphicsUtils.graphicsExtent(CED_PP_poly.getSelectedFeatures()));
                              } else {
                                  pUnionedExtent = graphicsUtils.graphicsExtent(CED_PP_poly.getSelectedFeatures());
                              }
                          }
                          if (results[2].length > 0) {
                              if (pUnionedExtent) {
                                  if (pUnionedExtent.xmax == pUnionedExtent.xmin) {  //if extent is derived from a point must expand otherwise union will not work properly
                                      var pXtemp = pUnionedExtent.xmax
                                      var pYtemp = pUnionedExtent.ymax

                                      pUnionedExtent.xmax = pXtemp + 10000;
                                      pUnionedExtent.xmin = pXtemp - 10000;
                                      pUnionedExtent.ymax = pYtemp + 10000;
                                      pUnionedExtent.ymin = pYtemp - 10000;
                                  }
                                  pUnionedExtent = pUnionedExtent.union(graphicsUtils.graphicsExtent(CED_PP_line.getSelectedFeatures()));
                              } else {
                                  pUnionedExtent = graphicsUtils.graphicsExtent(CED_PP_line.getSelectedFeatures());
                              }
                          }

                          app.map.setExtent(pUnionedExtent, true);
                      };
                  }
                  else {
                      alert("Effort selected is a non-spatial record, select a spatial record for map highlighting");
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
                      var strURL4Search = "";
                      if (!(isNaN(request.term))) {
                          strURL4Search = app.strTheme1_URL + "0/query" +
                                       "?where=Project_Name+like+%27%25" + request.term + "%25%27+or+Project_ID+%3D+" + request.term + "&f=pjson&returnGeometry=true&outFields=Project_Name%2C+Project_ID%2C+SourceFeatureType%2C+TypeAct";
                          //strURL4Search = app.strTheme1_URL + "0/query" +
                          //             "?where=Project_Name+like+%27%25" + request.term + "%25%27+or+Project_ID+%3D+" + request.term + "&f=pjson&outFields=*&returnGeometry=true&outFields=Project_Name%2C+Project_ID%2C+SourceFeatureType%2C+TypeAct%2C+geometry";

                      } else {
                          strURL4Search = app.strTheme1_URL + "0/query" +
                                       "?where=Project_Name+like+'%25" + request.term + "%25'" + "&f=pjson&returnGeometry=true&outFields=Project_Name%2C+Project_ID%2C+SourceFeatureType%2C+TypeAct";
                          //strURL4Search = app.strTheme1_URL + "0/query" +
                          //             "?where=Project_Name+like+'%25" + request.term + "%25'" + "&f=pjson&outFields=*&returnGeometry=true&outFields=Project_Name%2C+Project_ID%2C+SourceFeatureType%2C+TypeAct%2C+geometry";

                      }
                      $.ajax({
                          //url: app.strTheme1_URL + "find" + "?searchFields=Project_Name,Project_ID&SearchText=" + request.term + "&layers=0&f=pjson&returnGeometry=true",
                          url: strURL4Search,
                          dataType: "jsonp",
                          data: {},                        //data: { where: strSearchField + " LIKE '%" + request.term.replace(/\'/g, '\'\'').toUpperCase() + "%'", outFields: strSearchField, returnGeometry: true, f: "pjson" },                        
                          success: function (data) {
                              //if (data.results) {                           //                            if (data.features) {
                              if (data.features) {                           //                            if (data.features) {
                                  response($.map(data.features.slice(0, 19), function (item) {      //only display first 10
                                      var strtemp = item.geometry;

                                      return { label: item.attributes.Project_Name + " ID:" + item.attributes.Project_ID +
                                        " (Layer:" + item.attributes.SourceFeatureType.replace("poly", "area") + ",Type:" + item.attributes.TypeAct + ")",
                                          value2: item.geometry, value3: item.attributes.Project_ID, value4: "CED Projects and Plans (point)"
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
                      //var psqs_strQueryString = "objectid  > 0";
                      app.map.infoWindow.hide();            //var strquery4id = "Contaminant LIKE '%Mercury%'";
                      app.map.graphics.clear();
                      CED_PP_point.clearSelection();
                      CED_PP_line.clearSelection();
                      CED_PP_poly.clearSelection();

                      app.pPS_Identify = new PS_Identify({ pLayer1: CED_PP_point, pLayer2: CED_PP_line, pLayer3: CED_PP_poly, pMap: app.map,
                          strQueryString4Measurements: "Project_ID = " + strValue3, strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow, mSR: pSR
                      }); // instantiate the ID Search class    

                      //app.pPS_Identify = new PS_Identify({
                      //    pLayer1: CED_PP_point, pLayer2: CED_PP_line, pLayer3: CED_PP_poly, pMap: app.map,
                      //    strQueryString4Measurements: "OBJECTID > 0", strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow, mSR: pSR
                      //}); // instantiate the ID Search class    

                      var pPS_Identify_Results = app.pPS_Identify.executeQueries(null, "", 0, pGeometryPoint[0], pGeometryPoint[1]);
                  }
              });


          },

          err: function (err) {
              console.log("Failed to get stat results due to an error: ", err);
          }
      }
    )
    ;

  }
);

