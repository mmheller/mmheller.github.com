//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014




function btn_TextSummary_click() {
    var strddlMatrix = document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].value;
    var strddlEntry = document.getElementById("ddlEntry").options[document.getElementById("ddlEntry").selectedIndex].value;

    var strddlStartYear = document.getElementById("ddlStartYear").options[document.getElementById("ddlStartYear").selectedIndex].value;
    var strActivity = document.getElementById("ddlActivity").options[document.getElementById("ddlActivity").selectedIndex].value;  //get dropdown menu selection

    var strSubActivity = document.getElementById("ddlSubActivity").options[document.getElementById("ddlSubActivity").selectedIndex].value;  //get dropdown menu selection

    var strImpParty = document.getElementById("ddlImpParty").options[document.getElementById("ddlImpParty").selectedIndex].value;  //get dropdown menu selection
    var strOffice = document.getElementById("ddlOffice").options[document.getElementById("ddlOffice").selectedIndex].value;  //get dropdown menu selection
    var strState = document.getElementById("ddlState").options[document.getElementById("ddlState").selectedIndex].value;  //get dropdown menu selection
    var strPopArea = document.getElementById("ddlPopArea").options[document.getElementById("ddlPopArea").selectedIndex].value;  //get dropdown menu selection
    var strManagUnit = document.getElementById("ddlManagUnit").options[document.getElementById("ddlManagUnit").selectedIndex].value;  //get dropdown menu selection

    var strQuery = "";
    if (strddlMatrix !== "99") {
        strQuery += "&TA=" + strddlMatrix.replace("Plan", "2").replace("Project", "3"); //TypeAct
    }
    if (strddlEntry !== "99") {
        strQuery += "&ET=" + strddlEntry; //entry_type
    }

    if (strddlEntry !== "99") {
        strQuery += "&StartYear=" + strddlStartYear; //entry_type
    }

    if (strActivity !== "99") {
        strQuery += "&ACT=" + strActivity; //activity
    }

    if (strSubActivity !== "99") {
        strQuery += "&SubACT=" + strSubActivity; //activity
    }
    if (strImpParty !== "99") {
        strQuery += "&IP=" + strImpParty; //implementing_party
    }
    if (strOffice !== "99") {
        strQuery += "&FO=" + strOffice; //implementing_party
    }
    if (strState != "99") {
        strQuery += "&ST=" + strState; //State
    }
    if (strPopArea != "99") {
        strQuery += "&POP=" + strPopArea; //pop area
    }
    if (strManagUnit != "99") {
        strQuery += "&MU=" + strManagUnit; //management unit
    }
    if (strQuery !== "") {
        var strURL = "https://conservationefforts.org/sgce/sgcedquery/" + strQuery.replace('&', '?');
        window.open(strURL);
    }
}

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

function disableOrEnableFormElements(strFormName, strElementType, TorF) {
    var pform = document.getElementById(strFormName);   // enable all the dropdown menu's while queries are running

    if (pform != null) {
        for (var i = 0; i < pform.elements.length; i++) {
            if (pform.elements[i].type == strElementType) {
                strID = pform.elements[i].id;
                document.getElementById(strID).disabled = TorF;
            }
        }
    }
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

$(function () {
    $(document).tooltip();
});

function AllFiltersClear() {
    var strddlMatrix = document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].value;
    var strddlEntry = document.getElementById("ddlEntry").options[document.getElementById("ddlEntry").selectedIndex].value;
    var strddlStartYear = document.getElementById("ddlStartYear").options[document.getElementById("ddlStartYear").selectedIndex].value;
    var strActivity = document.getElementById("ddlActivity").options[document.getElementById("ddlActivity").selectedIndex].value;  //get dropdown menu selection
    var strSubActivity = document.getElementById("ddlSubActivity").options[document.getElementById("ddlSubActivity").selectedIndex].value;  //get dropdown menu selection
    var strImpParty = document.getElementById("ddlImpParty").options[document.getElementById("ddlImpParty").selectedIndex].value;  //get dropdown menu selection
    var strOffice = document.getElementById("ddlOffice").options[document.getElementById("ddlOffice").selectedIndex].value;  //get dropdown menu selection
    var strState = document.getElementById("ddlState").options[document.getElementById("ddlState").selectedIndex].value;  //get dropdown menu selection
    var strPopArea = document.getElementById("ddlPopArea").options[document.getElementById("ddlPopArea").selectedIndex].value;  //get dropdown menu selection
    var strManagUnit = document.getElementById("ddlManagUnit").options[document.getElementById("ddlManagUnit").selectedIndex].value;  //get dropdown menu selection

    var blnClear = false;

    if (((strddlMatrix == "All") | (strddlMatrix == "99")) &
                 (strddlEntry == "99") &
                 (strddlStartYear == "99") &
                 (strActivity == "99") &
                 (strSubActivity == "99") &
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
         "esri/toolbars/draw", "esri/graphic", "extras/PS_MeasSiteSearch4Definition",
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "dojo/promise/all", "dojo/_base/array",
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
  "esri/symbols/TextSymbol",
  "dijit/registry", "esri/geometry/webMercatorUtils",
  "extras/MH_FeatureCount", "extras/PS_ReturnQuerySt", "extras/PS_MeasSiteSearch_SetVisableQueryDef", "extras/PS_PopUniqueQueryInterfaceValues", "dojo/parser"

  ], function (
            Draw, Graphic, PS_MeasSiteSearch4Definition, declare, lang, esriRequest, all, arrayUtils, urlUtils, FeatureLayer, FeatureTable,
            SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, graphicsUtils, Query, All,
            ArcGISDynamicMapServiceLayer, CheckBox, Legend, Scalebar, Geocoder, dom, domClass,
            mouse, on, BasemapGallery, Map, PS_Identify, Color, SimpleRenderer, LabelLayer, TextSymbol, registry, webMercatorUtils,
            MH_FeatureCount, PS_ReturnQuerySt, PS_MeasSiteSearch_SetVisableQueryDef, PS_PopUniqueQueryInterfaceValues, parser
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
              disableOrEnableFormElements("dropdownForm", 'select-one', true); //disable/enable to avoid user clicking query options during pending queries
              disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries

              $(".divOpenStats").prop("onclick", null).off("click");


              esriConfig.defaults.io.corsEnabledServers.push("https://utility.arcgis.com")
              esriConfig.defaults.io.corsEnabledServers.push("https://sampleserver6.arcgisonline.com")
              esriConfig.defaults.io.corsEnabledServers.push("https://services.arcgisonline.com");

              document.getElementById("txtQueryResults").innerHTML = "-";
              document.getElementById("dTotalProjectsQ").innerHTML = "-";
              document.getElementById("dTotalNonProjectsQ").innerHTML = "-";
              document.getElementById("dTotalPlansQ").innerHTML = "-";
              document.getElementById("dTotalAcresQ").innerHTML = "-";

              document.getElementById("ImgResultsLoading").style.visibility = "visible";

              on(dom.byId("btn_clear"), "click", btn_clear_click);
              on(dom.byId("btn_TextSummary"), "click", btn_TextSummary_click);
              on(dom.byId("ddlMatrix"), "change", ddlMatrix_Change);
              on(dom.byId("ddlEntry"), "change", ddlMatrix_Change);
              on(dom.byId("ddlStartYear"), "change", ddlMatrix_Change);
              on(dom.byId("ddlActivity"), "change", ddlMatrix_Change);
              on(dom.byId("ddlSubActivity"), "change", ddlMatrix_Change);
              on(dom.byId("ddlImpParty"), "change", ddlMatrix_Change);
              on(dom.byId("ddlOffice"), "change", ddlMatrix_Change);
              on(dom.byId("ddlState"), "change", ddlMatrix_Change);
              on(dom.byId("ddlManagUnit"), "change", ddlMatrix_Change);
              on(dom.byId("ddlPopArea"), "change", ddlMatrix_Change);
              

              var blnShoReportButton = getTokens()['RButton'];
              if (blnShoReportButton) { document.getElementById("btn_TextSummary").style.display = "inline"; }
              var blnnoBannter = getTokens()['noBanner'];
              if (typeof blnnoBannter != 'undefined') {

                  document.getElementById("contact1").style.visibility = "hidden";
                  document.getElementById("contact2").style.visibility = "hidden";
                  document.getElementById("theImage2").style.visibility = "hidden";
                  document.getElementById("theImage3").style.visibility = "hidden";
                  document.getElementById("theImage4").style.visibility = "hidden";
                  document.getElementById("panelBasemaps").style.top = "15px";
                  document.getElementById("mapPanelTitle").style.height = "0px";
                  document.getElementById("topPane").style.height = "0px";
                  
              }

              parser.parse();

              function ddlMatrix_Change(divTagSource) {
                  var botContainer = registry.byId("bottomTableContainer");

                  if (botContainer.containerNode.style.height == "") {
                      var bc = registry.byId('content');
                      var newSize = 150;
                      dojo.style(botContainer.domNode, "height", 15 + "%");
                      bc.resize();
                  }

                  document.getElementById("ImgResultsLoading").style.visibility = "visible";
                  disableOrEnableFormElements("dropdownForm", 'select-one', true); //disable/enable to avoid user clicking query options during pending queries
                  disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries
                  $(".divOpenStats").prop("onclick", null).off("click");


                  app.map.infoWindow.hide();
                  app.map.graphics.clear();
                  CED_PP_point.clearSelection();
                  CED_PP_line.clearSelection();
                  CED_PP_poly.clearSelection();

                  document.getElementById("txtQueryResults").innerHTML = "";
                  var strddlMatrix = document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].value;
                  var strddlEntry = document.getElementById("ddlEntry").options[document.getElementById("ddlEntry").selectedIndex].value;
                  var strStartYear = document.getElementById("ddlStartYear").options[document.getElementById("ddlStartYear").selectedIndex].value;
                  var strActivity = document.getElementById("ddlActivity").options[document.getElementById("ddlActivity").selectedIndex].value;  //get dropdown menu selection
                  var strSubActivity = document.getElementById("ddlSubActivity").options[document.getElementById("ddlSubActivity").selectedIndex].value;  //get dropdown menu selection
                  var strImpParty = document.getElementById("ddlImpParty").options[document.getElementById("ddlImpParty").selectedIndex].value;  //get dropdown menu selection
                  var strOffice = document.getElementById("ddlOffice").options[document.getElementById("ddlOffice").selectedIndex].value;  //get dropdown menu selection
                  var strState = document.getElementById("ddlState").options[document.getElementById("ddlState").selectedIndex].value;  //get dropdown menu selection
                  var strPopArea = document.getElementById("ddlPopArea").options[document.getElementById("ddlPopArea").selectedIndex].value;  //get dropdown menu selection
                  var strManagUnit = document.getElementById("ddlManagUnit").options[document.getElementById("ddlManagUnit").selectedIndex].value;  //get dropdown menu selection

                  if (((strddlMatrix == "All") | (strddlMatrix == "99")) &
                       (strddlEntry == "99") &
                       (strStartYear == "99") &
                       (strActivity == "99") &
                       (strSubActivity == "99") &
                       (strImpParty == "99") &
                       (strOffice == "99") &
                       (strState == "99") &
                       (strPopArea == "99") &
                       (strManagUnit == "99")) {
                      blnTPKs = true;

                      dojo.forEach(app.arrayLayers, function (player) {
                          var id = player.id;
                          if (id == "graphicsLayer1") { player.setVisibility(!blnTPKs); }
                      });
                  }
                  else {
                      dojo.forEach(app.arrayLayers, function (player) {
                          var id = player.id;
                          if (id == "graphicsLayer1") { player.setVisibility(false); }
                      });
                  }

                  app.strQueryLabelText = "";

                  var strQuery = "";
                  if ((app.arrayPrjIDs_fromSpatialSelect != undefined) & (app.arrayPrjIDs_fromSpatialSelect != "")) {
                      strQuery = "project_ID in (";
                      for (var i = 0; i < app.arrayPrjIDs_fromSpatialSelect.length; i++) {
                          strQuery += app.arrayPrjIDs_fromSpatialSelect[i] + ",";
                      }
                      strQuery = strQuery.slice(0, -1) + ")";
                  }

                  if ((strddlMatrix !== "All") & (strddlMatrix !== "99")) {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "typeact = '" + strddlMatrix + "'";
                      app.strQueryLabelText += "Effort Type = " + document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].text + ", ";
                  }
                  if (strddlEntry !== "99") {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "Project_Status = " + strddlEntry + "";
                      app.strQueryLabelText += "Entry Type = " + document.getElementById("ddlEntry").options[document.getElementById("ddlEntry").selectedIndex].text + ", ";
                  }

                  if (strStartYear !== "99") {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "Start_Year = " + strStartYear + "";
                      app.strQueryLabelText += "Start Year = " + document.getElementById("ddlStartYear").options[document.getElementById("ddlStartYear").selectedIndex].text + ", ";
                  }

                  if (strActivity !== "99") {  //            if ((strActivity !== "All") & (strActivity != 99)) {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "ACT_ID = " + strActivity + "";
                      app.strQueryLabelText += "Activity Type = " + document.getElementById("ddlActivity").options[document.getElementById("ddlActivity").selectedIndex].text + ", ";
                  }
                  if (strSubActivity !== "99") {  //            if ((strActivity !== "All") & (strActivity != 99)) {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "SACT_ID = " + strSubActivity + "";
                      app.strQueryLabelText += "SubActivity Type = " + document.getElementById("ddlSubActivity").options[document.getElementById("ddlSubActivity").selectedIndex].text + ", ";
                  }
                  if (strImpParty !== "99") {    //            if (strImpParty !== "All") {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "IP_ID = " + strImpParty + "";
                      app.strQueryLabelText += "Implementing Party = " + document.getElementById("ddlImpParty").options[document.getElementById("ddlImpParty").selectedIndex].text + ", ";
                  }
                  if (strOffice !== "99") {    //            if (strImpParty !== "All") {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "FO_ID = " + strOffice + "";
                      app.strQueryLabelText += "Field Office = " + document.getElementById("ddlOffice").options[document.getElementById("ddlOffice").selectedIndex].text + ", ";
                  }
                  app.PSQ = new PS_MeasSiteSearch4Definition({
                      strURL: app.strTheme1_URL, iNonSpatialTableIndex: app.iNonSpatialTableIndex,
                      strState: strState, strPopArea: strPopArea, strManagUnit: strManagUnit, strQuerySaved: strQuery, divTagSource: divTagSource, pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly, pCED_PP_line: CED_PP_line
                  }); // instantiate the class

                  if ((strState != "99") || (strPopArea != "99") || (strManagUnit != "99")) {
                      app.PSQ.qry_Non_SpatialTable("", null, "ST_ID");

                      if (strState !== "99") {    //            if (strImpParty !== "All") {
                          app.strQueryLabelText += "State = " + document.getElementById("ddlState").options[document.getElementById("ddlState").selectedIndex].text + ", ";
                      }
                      if (strPopArea !== "99") {    //            if (strImpParty !== "All") {
                          app.strQueryLabelText += "GRSG Population Area = " + document.getElementById("ddlPopArea").options[document.getElementById("ddlPopArea").selectedIndex].text + ", ";
                      }
                      if (strManagUnit !== "99") {    //            if (strImpParty !== "All") {
                          app.strQueryLabelText += "GRSG Management Zone = " + document.getElementById("ddlManagUnit").options[document.getElementById("ddlManagUnit").selectedIndex].text + ", ";
                      }

                  } else {  // if not filters realting to related table selected then execute the queries
                      app.PSQ.ExecutetheDerivedQuery(strQuery, divTagSource);
                  }
              }

              function btn_clear_click() {
                  app.arrayPrjIDs_fromSpatialSelect = "";
                  document.getElementById("txt_NoSpatial").style.visibility = 'hidden';
                  disableOrEnableFormElements("dropdownForm", 'select-one', true); //disable/enable to avoid user clicking query options during pending queries
                  disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries
                  $(".divOpenStats").prop("onclick", null).off("click");

                  document.getElementById("txtQueryResults").innerHTML = "-";
                  document.getElementById("dTotalProjectsQ").innerHTML = "-";
                  document.getElementById("dTotalNonProjectsQ").innerHTML = "-";
                  document.getElementById("dTotalPlansQ").innerHTML = "-";
                  document.getElementById("dTotalAcresQ").innerHTML = "-";

                  document.getElementById("ImgResultsLoading").style.visibility = "visible";
                  app.map.infoWindow.hide();
                  app.map.graphics.clear();
                  CED_PP_point.clearSelection();
                  CED_PP_line.clearSelection();
                  CED_PP_poly.clearSelection();

                  document.getElementById("btn_TextSummary").disabled = true;

                  CED_PP_poly.show();
                  CED_PP_point.show();
                  CED_PP_line.show();

                  // do not turn off layer visibility here, the checkbox click methods will handle layer visibility
                  var pform = dom.byId("toggleForm");
                  for (var i = 0; i < pform.elements.length; i++) {  //loop through the checkboxes of the form and determin if one of the ones to click
                      if (pform.elements[i].type == 'checkbox') {
                          if ((pform.elements[i].name == "checkBoxMZ") || (pform.elements[i].name == "checkBoxPop")) {
                              //pform.elements[i].checked = false;
                              if (pform.elements[i].checked == true) {
                                  pform.elements[i].click();  //turn the layer visiblity on by firing the click event of the checkboxes
                              }
                          }
                          if (!((pform.elements[i].name == "checkBoxMZ") || (pform.elements[i].name == "checkBoxPop"))) {
                              pform.elements[i].checked = true;
                              if (pform.elements[i].checked == false) {
                                  pform.elements[i].click();  //turn the layer visiblity on by firing the click event of the checkboxes
                              }
                          }
                      }
                  }

                  CED_PP_point.setDefinitionExpression("((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))");
                  //CED_PP_point4FeatureTable.setDefinitionExpression("");
                  app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression("");
                  app.pSup.gFeatureTable.refresh();

                  CED_PP_line.setDefinitionExpression("");
                  CED_PP_poly.setDefinitionExpression("");
                  document.getElementById("txtQueryResults").innerHTML = ""; //clear the text results

                  if (document.getElementById("cbx_zoom").checked) {
                      var customExtentAndSR = new esri.geometry.Extent(-14000000, 4595472, -11000000, 5943351, new esri.SpatialReference({ "wkid": 3857 }));
                      app.map.setExtent(customExtentAndSR, true);
                  }

                  app.iNonSpatialTableIndex = 0;  //
                  app.PS_Uniques.divTagSource = null;
                  app.PS_Uniques.m_strCED_PP_pointQuery = CED_PP_point.getDefinitionExpression();
                  app.PS_Uniques.qry_SetUniqueValuesOf("TypeAct", "TypeAct", document.getElementById("ddlMatrix"), "OBJECTID > 0"); //maybe move this to MH_FeatureCount  //clear111
                  app.strQueryLabelText = "";
                  app.strQueryLabelTextSpatial = "";
              }
          },


          Phase2: function () {
              app.loading = dojo.byId("loadingImg");  //loading image. id
                                      
              var selectionToolbar;

              var customExtentAndSR = new esri.geometry.Extent(-14000000, 4800000, -11000000, 6200000, new esri.SpatialReference({ "wkid": 3857 }));
              app.map = new esri.Map("map", { basemap: "topo", logo: false, extent: customExtentAndSR });
              //app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/d725bb5ba60348fd841b05f80cf4465d/rest/services/CEDfrontpage_map_v9_Restrict/FeatureServer/"
              app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/5d5fc053dd7e4de4b9765f7a6b6f1f61/rest/services/CEDfrontpage_map_v9_Restrict/FeatureServer/";

              app.map.on("load", initSelectToolbar);
              dojo.connect(app.map, "onUpdateStart", showLoading);
              dojo.connect(app.map, "onUpdateEnd", hideLoading);

              var legendLayers = [];
              CED_PP_point = new FeatureLayer(app.strTheme1_URL + "0", { id: "0", mode: FeatureLayer.MODE_ONDEMAND, outFields: ["Project_ID"], visible: true });
              CED_PP_point.setDefinitionExpression("((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))");
              var PSelectionSymbolPoint = new SimpleMarkerSymbol().setColor(new Color([0, 255, 255, 0.4]))
              CED_PP_point.setSelectionSymbol(PSelectionSymbolPoint);

              this.gCED_PP_point4FeatureTable = new FeatureLayer(app.strTheme1_URL + "0", {
                  id: "00", mode: FeatureLayer.MODE_ONDEMAND, visible: false,
                  outFields: ["Project_ID", "SourceFeatureType", "Project_Name", "Project_Status", "Activity", "SubActivity", "Implementing_Party", "Office", "Date_Created", "Last_Updated", "Date_Approved", "Start_Year", "Finish_Year", "TypeAct", "TotalAcres", "TotalMiles", "Prj_Status_Desc"]
              });

              CED_PP_line = new FeatureLayer(app.strTheme1_URL + "1", { id: "1", mode: FeatureLayer.MODE_ONDEMAND, outFields: ["Project_ID"], visible: true });
              pSeletionSymbolLine = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([0, 255, 255]), 3)
              CED_PP_line.setSelectionSymbol(pSeletionSymbolLine);

              CED_PP_poly = new FeatureLayer(app.strTheme1_URL + "2", { id: "2", "opacity": 0.5, mode: esri.layers.FeatureLayer.MODE_ONDEMAND, outFields: ["Project_ID"], autoGeneralize: true, visible: true });
              pSeletionSymbolPoly = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 2), new Color([0, 255, 255, 0.4]));
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
              pLabel1.font.setFamily("helvetica");
              var pLabelRenderer1 = new SimpleRenderer(pLabel1);
              var plabels1 = new LabelLayer({ id: "labels1" });
              plabels1.addFeatureLayer(pBase_Pop, pLabelRenderer1, "{" + strlabelField1 + "}");

              var pLabel2 = new TextSymbol().setColor(vGreyColor);
              pLabel2.font.setSize("10pt");
              pLabel2.font.setFamily("helvetica Black");
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
                    "Project_ID", "TypeAct", "Prj_Status_Desc", "Project_Name", "Activity", "SubActivity", "Implementing_Party", "Office", "Date_Created",
                    "Last_Updated", "Date_Approved", "Start_Year", "Finish_Year", "TotalAcres", "TotalMiles", "SourceFeatureType"
                  ],
                  fieldInfos: [
                    { name: 'Project_ID', alias: 'ID'},
                    { name: 'TypeAct', alias: 'Project or Plan', },
                    { name: 'Prj_Status_Desc', alias: 'Implementation Status', },
                    { name: 'Project_Name', alias: 'Effort Name', },
                    { name: 'Activity', alias: 'Activity', },
                    { name: 'SubActivity', alias: 'Sub Activity', },
                    { name: 'Implementing_Party', alias: 'Implementing Party', },
                    { name: 'Office', alias: 'Office', },
                    { name: 'Date_Created', alias: 'Date Recorded', },
                    { name: 'Last_Updated', alias: 'Recorded Update', },
                    { name: 'Date_Approved', alias: 'Date Approved', },
                    { name: 'Start_Year', alias: 'Start Year', },
                    { name: 'Finish_Year', alias: 'Finish Year', },
                    { name: 'TotalAcres', alias: 'Acres', },
                    { name: 'TotalMiles', alias: 'Miles', },
                    { name: 'SourceFeatureType', alias: 'Source', }
                  ],
                  "map": map
              }, 'myTableNode');

              this.gFeatureTable.showGridHeader = false;
              this.gFeatureTable.columnResizer = false;
              this.gFeatureTable.startup();

              function handleSpatialSelectResults(results) {
                  var featureLayer1Message = results[0].features.length;
                  var featureLayer2Message = results[1].features.length;
                  var featureLayer3Message = results[2].features.length;

                  var count = 0;
                  for (var i = 0; i < results.length; i++) {
                      count = count + results[i].features.length;
                  }
                  var temp = "Total features selected:  <b>" + count + "</b><br>&nbsp;&nbsp;FeatureLayer1:  <b>" + featureLayer1Message + "</b><br>&nbsp;&nbsp;FeatureLayer2:  <b>" + featureLayer2Message + "</b><br>&nbsp;&nbsp;FeatureLayer3:  " + featureLayer3Message;

                  var items = arrayUtils.map(results, function (result) {
                      return result;
                  });

                  var allItems = [];

                  arrayUtils.map(items[0].features, function (item) {
                      allItems.push(item.attributes.Project_ID);
                  })

                  arrayUtils.map(items[1].features, function (item) {
                      allItems.push(item.attributes.Project_ID);
                  })

                  arrayUtils.map(items[2].features, function (item) {
                      allItems.push(item.attributes.Project_ID);
                  })

                  if (allItems.length > 0) {
                      app.arrayPrjIDs_fromSpatialSelect = allItems;
                      var strQuery2 = "";
                      strQuery2 = "project_ID in (";
                      for (var i = 0; i < app.arrayPrjIDs_fromSpatialSelect.length; i++) {
                          strQuery2 += app.arrayPrjIDs_fromSpatialSelect[i] + ",";
                      }
                      strQuery2 = strQuery2.slice(0, -1) + ")";
                      this.strFinalQuery += strQuery2;
                      
                      if (app.PSQ == null) {
                          app.PSQ = new PS_MeasSiteSearch4Definition({
                              strURL: app.strTheme1_URL, iNonSpatialTableIndex: app.iNonSpatialTableIndex,
                              strState: "", strPopArea: "", strManagUnit: "", strQuerySaved: strQuery2, divTagSource: document.getElementById("ddlMatrix"),
                              pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly, pCED_PP_line: CED_PP_line
                          }); 
                      }

                      app.PSQ.ExecutetheDerivedQuery(strQuery2, null);
                  }
              }

              function initSelectToolbar(event) {
                  selectionToolbar = new Draw(event.map);
                  var selectQuery = new Query();

                  on(selectionToolbar, "DrawEnd", function (pGeometry) {
                      if (app.strQueryLabelTextSpatial == undefined) {
                          app.strQueryLabelTextSpatial = "";
                      }
                      app.strQueryLabelTextSpatial = "</br>Spatial Selection (xmin=" + Math.round(pGeometry.xmin / 100000).toString() +
                                                                        ",ymin=" + Math.round(pGeometry.ymin / 100000).toString() +
                                                                        ",xmax=" + Math.round(pGeometry.xmax / 100000).toString() +
                                                                        ",ymax=" + Math.round(pGeometry.ymax / 100000).toString() + ")";
                      app.FilterGeometry = pGeometry;
                      selectionToolbar.deactivate();

                      switch (pGeometry.type) {
                          case "point":
                          case "multipoint":
                              symbol = new SimpleMarkerSymbol();
                              break;
                          case "polyline":
                              symbol = new SimpleLineSymbol();
                              break;
                          default:
                              symbol = new SimpleFillSymbol();
                              break;
                      }
                      var graphic = new Graphic(pGeometry, symbol);
                      app.map.graphics.add(graphic);
                      SpatialqueryMapService(pGeometry);
                  });
              }

              function SpatialqueryMapService(Geom) {
                  qt_Layer1 = new esri.tasks.QueryTask(CED_PP_point.url);
                  q_Layer1 = new esri.tasks.Query();
                  qt_Layer2 = new esri.tasks.QueryTask(CED_PP_line.url);
                  q_Layer2 = new esri.tasks.Query();
                  qt_Layer3 = new esri.tasks.QueryTask(CED_PP_poly.url);
                  q_Layer3 = new esri.tasks.Query();
                  q_Layer1.returnGeometry = q_Layer2.returnGeometry = q_Layer3.returnGeometry = false;
                  q_Layer1.outFields = q_Layer2.outFields = q_Layer3.outFields = ["Project_ID"];
                  q_Layer1.geometry = q_Layer2.geometry = q_Layer3.geometry = Geom;

                  q_Layer1.where = CED_PP_point.getDefinitionExpression();
                  q_Layer2.where = CED_PP_line.getDefinitionExpression();
                  q_Layer3.where = CED_PP_poly.getDefinitionExpression();

                  var pLayer1, pLayer2, pLayer3, pPromises;
                  pLayer1 = qt_Layer1.execute(q_Layer1);
                  pLayer2 = qt_Layer2.execute(q_Layer2);
                  pLayer3 = qt_Layer3.execute(q_Layer3);
                  pPromises = new All([pLayer1, pLayer2, pLayer3]);
                  pPromises.then(handleSpatialSelectResults, this.err);

                  var botContainer = registry.byId("bottomTableContainer");//open the attribute table if not already done so
                  if (botContainer.containerNode.style.height == "") {
                      var bc = registry.byId('content');
                      var newSize = 150;
                      dojo.style(botContainer.domNode, "height", 15 + "%");
                      bc.resize();
                  }
              }

              on(dom.byId("btn_selectFieldsButton"), "click", function () {
                  selectionToolbar.activate(Draw.EXTENT);
              });
              on(this.gFeatureTable, "load", function (evt) {  //resize the column widths
                  var pGrid = this.grid;
                  var arrayColWidths = [55, 145, 145, 380, 380, 360, 230, 290, 150, 150, 150, 80, 80, 60, 100, 100];
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
                          if (document.getElementById("cbx_zoom").checked) {
                            app.map.setExtent(pUnionedExtent, true);
                          }
                          
                      };
                  }
                  else {
                      alert("Effort selected is a non-spatial record, select a spatial record for map highlighting");
                  }
              });
              
              return arrayLayers;
          },

          
          Phase3: function (CED_PP_point, CED_PP_line, CED_PP_poly) {
              app.pSetQS = new PS_MeasSiteSearch_SetVisableQueryDef({ pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly, pCED_PP_line: CED_PP_line }); // instantiate the class

              dojo.connect(app.map, "onClick", executeIdeintifyQueries);

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

                      } else {
                          strURL4Search = app.strTheme1_URL + "0/query" +
                                       "?where=Project_Name+like+'%25" + request.term + "%25'" + "&f=pjson&returnGeometry=true&outFields=Project_Name%2C+Project_ID%2C+SourceFeatureType%2C+TypeAct";

                      }
                      $.ajax({
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
                      app.map.infoWindow.hide();            //var strquery4id = "Contaminant LIKE '%Mercury%'";
                      app.map.graphics.clear();
                      CED_PP_point.clearSelection();
                      CED_PP_line.clearSelection();
                      CED_PP_poly.clearSelection();

                      app.pPS_Identify = new PS_Identify({ pLayer1: CED_PP_point, pLayer2: CED_PP_line, pLayer3: CED_PP_poly, pMap: app.map,
                          strQueryString4Measurements: "Project_ID = " + strValue3, strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow, mSR: pSR
                      }); // instantiate the ID Search class    
                      var pPS_Identify_Results = app.pPS_Identify.executeQueries(null, "", 0, pGeometryPoint[0], pGeometryPoint[1]);
                  }
              });
              
              app.iNonSpatialTableIndex = 0;  //these 3 lines populate the list values
              app.PS_Uniques = new PS_PopUniqueQueryInterfaceValues({ strURL: app.strTheme1_URL, iNonSpatialTableIndex: 0, divTagSource: null });
              app.PS_Uniques.m_strCED_PP_pointQuery = CED_PP_point.getDefinitionExpression();
              app.PS_Uniques.qry_SetUniqueValuesOf("TypeAct", "TypeAct", document.getElementById("ddlMatrix"), "OBJECTID > 0"); //startup

              if (app.map.loaded) {
                  mapLoaded();
              } else {
                  app.map.on("load", function () { mapLoaded(); });
              }

              app.pFC = new MH_FeatureCount({}); // instantiate the zoom class

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
                  dom.byId("txt_xyCoords").innerHTML = "Latitude:" + mp.y.toFixed(4) + ", Longitude:" + mp.x.toFixed(4);  //display mouse coordinates
              }

              function executeIdeintifyQueries(e) {
                  app.map.graphics.clear();

                  CED_PP_point.clearSelection();
                  CED_PP_line.clearSelection();
                  CED_PP_poly.clearSelection();

                  var strMatrix = document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].text;  //get dropdown menu selection
                  var strManagUnit = document.getElementById("ddlManagUnit").options[document.getElementById("ddlManagUnit").selectedIndex].value;  //get dropdown menu selection
                  app.PSQS = new PS_ReturnQuerySt({ strURL: app.strTheme1_URL, strMatrix: strMatrix, strManagUnit: strManagUnit, SIDs: null, iNonSpatialTableIndex: null }); // instantiate the Seat Geek Search class
                  var psqs_strQueryString = app.PSQS.returnQS();

                  app.map.infoWindow.hide();            //var strquery4id = "Contaminant LIKE '%Mercury%'";
                  app.pPS_Identify = new PS_Identify({
                      pLayer1: CED_PP_point, pLayer2: CED_PP_line, pLayer3: CED_PP_poly, pMap: app.map,
                      strQueryString4Measurements: psqs_strQueryString, strURL: app.strTheme1_URL,
                      pInfoWindow: app.infoWindow
                  }); // instantiate the ID Search class
                  app.pEvt = e;
                  var pPS_Identify_Results = app.pPS_Identify.executeQueries(e, "", 0, 0, 0);
              }


          },

          Phase4: function () {

              var strA_TypeAct = getTokens()['TA'];
              var strA_entry_type = getTokens()['ET'];
              var strA_activity = getTokens()['ACT'];
              var strA_Subactivity = getTokens()['SACT'];
              var strA_implementing_party = getTokens()['IP'];
              var strA_office = getTokens()['FO'];
              var strA_State = getTokens()['ST'];
              var strA_POPArea = getTokens()['POP'];
              var strA_Managementunit = getTokens()['MU'];

              parser.parse();
              //https://conservationefforts.org/grsgmap/?IP=11,14,16&TA=3&ST=183,985,1992,4512,9901,12665,15561,19432
              if ((strA_TypeAct) || (strA_entry_type) || (strA_activity) || (strA_Subactivity) || (strA_implementing_party) || (strA_State) || (strA_POPArea) || (strA_Managementunit || strA_office)) {
                  var botContainer = registry.byId("bottomTableContainer");

                  if (botContainer.containerNode.style.height == "") {
                      var bc = registry.byId('content');
                      var newSize = 150;
                      dojo.style(botContainer.domNode, "height", 15 + "%");
                      bc.resize();
                  }

                  RunQueryArgs(strA_TypeAct, strA_entry_type, strA_activity, strA_Subactivity, strA_implementing_party, strA_State, strA_POPArea, strA_Managementunit, strA_office);
              } else {
                  document.getElementById("btn_TextSummary").disabled = true;
              }



              function RunQueryArgs(strA_TypeAct, strA_entry_type, strA_activity, strA_Subactivity, strA_implementing_party, strA_State, strA_POPArea, strA_Managementunit, strA_office) {
                  dojo.forEach(app.arrayLayers, function (player) {
                      var id = player.id;
                      if ((id == "0") | (id == "1") | (id == "2") | (id == "graphicsLayer1")) {
                          player.setDefinitionExpression("OBJECTID < 0");  // set the definition expression for quick display of nothing
                          player.setVisibility(true);
                      }
                  });

                  var strQuery = ""
                  if (strA_TypeAct) {
                      strQuery = "(ta_id in (" + strA_TypeAct + "))";
                  }
                  if (strA_entry_type) {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "(Project_Status in (" + strA_entry_type + "))";
                  }
                  if (strA_activity) {  //            if ((strActivity !== "All") & (strActivity != 99)) {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "(ACT_ID in (" + strA_activity + "))";
                  }
                  if (strA_Subactivity) {  //            if ((strActivity !== "All") & (strActivity != 99)) {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "(SACT_ID in (" + strA_Subactivity + "))";
                  }
                  if (strA_implementing_party) {    //            if (strImpParty !== "All") {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "(IP_ID in (" + strA_implementing_party + "))";
                  }
                  if (strA_office) {    //            if (strImpParty !== "All") {
                      if (strQuery !== "") { strQuery += " and "; }
                      strQuery += "(FO_ID in (" + strA_office + "))";
                  }

                  app.PSQ = new PS_MeasSiteSearch4Definition({
                      strURL: app.strTheme1_URL, iNonSpatialTableIndex: app.iNonSpatialTableIndex,
                      strState: strA_State, strPopArea: strA_POPArea, strManagUnit: strA_Managementunit, strQuerySaved: strQuery, divTagSource: document.getElementById("ddlMatrix"),
                      pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly, pCED_PP_line: CED_PP_line
                  }); // instantiate the class

                  if ((strA_State != undefined) || (strA_POPArea != undefined) || (strA_Managementunit != undefined)) {
                      var PSQResults = app.PSQ.qry_Non_SpatialTable("", null, "ST_ID");
                      PSQResults.then(PSQsearchSucceeded, PSQsearchFailed);
                  } else {  // handling arguments passed
                      app.PSQ.ExecutetheDerivedQuery(strQuery, document.getElementById("ddlMatrix"));
                  }
                  app.PS_Uniques.m_strCED_PP_pointQuery = CED_PP_point.getDefinitionExpression();
                  app.PS_Uniques.divTagSource = null;
                  app.PS_Uniques.qry_SetUniqueValuesOf("TypeAct", "TypeAct", document.getElementById("ddlMatrix"), CED_PP_point.getDefinitionExpression()); //args

              }

              function PSQsearchSucceeded(results) { }

              function PSStatFailed(err) { document.getElementById("txtQueryResults").innerHTML = " Search error " + err.toString(); }

              function PSQsearchFailed(err) { document.getElementById("txtQueryResults").innerHTML = " Search error " + err.toString(); }
          },


          openCEDPSummary: function () {
              localStorage.setItem("ls_strTheme1_URL", app.strTheme1_URL);
              localStorage.setItem("ls_strDefQuery", CED_PP_point.getDefinitionExpression());
              localStorage.setItem("ls_strDefQuery2", app.PS_Uniques.strQuery1);
              localStorage.setItem("ls_strQueryLabelText", app.strQueryLabelText);
              localStorage.setItem("ls_strQueryLabelTextSpatial", app.strQueryLabelTextSpatial);

              localStorage.setItem("ls_strMapExtent", String(app.map.extent.xmin + "," + app.map.extent.ymin + "," + app.map.extent.xmax + "," + app.map.extent.ymax));

              strBasemap = "topo";
              if (app.basemapGallery._selectedBasemap != null) {
                  pBasemap = app.basemapGallery.getSelected();
                  strBasemap = pBasemap.id;
              }

              localStorage.setItem("ls_strBasemap", strBasemap);

              var array_extraMaplayerList = [];
              dojo.forEach(app.map.graphicsLayerIds, function (pGraphicLayerID) {
                  pTempGraphicLayer = app.map.getLayer(pGraphicLayerID);
                  if ((pTempGraphicLayer.visible) &
                      (pGraphicLayerID != "labels1") & (pGraphicLayerID != "labels2")) {
                      array_extraMaplayerList.push(pGraphicLayerID);
                  }
              });

              var str_extraMaplayerList = String(array_extraMaplayerList);
              localStorage.setItem("ls_extraMaplayerList", str_extraMaplayerList);

              var pNewWindow = window.open("CEDPSummary.html");
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


