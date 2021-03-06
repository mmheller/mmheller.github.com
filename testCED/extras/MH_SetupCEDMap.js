﻿///Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

$(function () {
	$("#dialogMap").dialog();
});


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

$(document).click(function () {
    $('.ui-tooltip').remove();
});

function AllFiltersClear() {
    //var strddlMatrix = document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].value;
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

    if (
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
	"esri/layers/FeatureLayer", "esri/layers/GraphicsLayer",
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
	"extras/MH_FeatureCount", "extras/PS_ReturnQuerySt", "extras/PS_MeasSiteSearch_SetVisableQueryDef", "extras/PS_PopUniqueQueryInterfaceValues", "extras/MH_SRU_SumAndMap",
	"dojo/parser"

  ], function (
		Draw, Graphic, PS_MeasSiteSearch4Definition, declare, lang, esriRequest, all, arrayUtils, urlUtils, FeatureLayer, GraphicsLayer, FeatureTable,
            SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, graphicsUtils, Query, All,
            ArcGISDynamicMapServiceLayer, CheckBox, Legend, Scalebar, Geocoder, dom, domClass,
            mouse, on, BasemapGallery, Map, PS_Identify, Color, SimpleRenderer, LabelLayer, TextSymbol, registry, webMercatorUtils,
		MH_FeatureCount, PS_ReturnQuerySt, PS_MeasSiteSearch_SetVisableQueryDef, PS_PopUniqueQueryInterfaceValues, MH_SRU_SumAndMap, parser
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
			  disableOrEnableFormElements("dropdownForm", 'radio', true);  //disable/enable to avoid user clicking query options during pending queries

			  $(".divOpenStats").prop("onclick", null).off("click");
			  $("#btn_Report").prop("disabled", true);


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

			  on(dom.byId("rdo_SRU"), "change", btn_clear_click);
			  on(dom.byId("rdo_Public"), "change", btn_clear_click);
			  on(dom.byId("rdo_NonSpatial"), "change", btn_clear_click);

			  //on(dom.byId("ddlMatrix"), "change", ddlMatrix_Change);
              on(dom.byId("ddlEntry"), "change", ddlMatrix_Change);
              on(dom.byId("ddlStartYear"), "change", ddlMatrix_Change);
              on(dom.byId("ddlActivity"), "change", ddlMatrix_Change);
              on(dom.byId("ddlSubActivity"), "change", ddlMatrix_Change);
              on(dom.byId("ddlImpParty"), "change", ddlMatrix_Change);
              on(dom.byId("ddlOffice"), "change", ddlMatrix_Change);
              on(dom.byId("ddlState"), "change", ddlMatrix_Change);
              on(dom.byId("ddlManagUnit"), "change", ddlMatrix_Change);
              on(dom.byId("ddlPopArea"), "change", ddlMatrix_Change);

			  app.strModule = getTokens()['module'];
			  if (!(app.strModule == undefined)) {
				  if (app.strModule.toUpperCase() == "GUSG") {
					  dom.byId("mapModID").innerHTML = "Gunnison Sage-Grouse Recovery TEST DATA!!!";

					  document.getElementById("ddlPopArea").style.visibility = "collapse";
					  document.getElementById("txtPop_4_GRSG").style.visibility = "collapse";
					  document.getElementById("txtWAFWA_4_GRSG").style.visibility = "collapse";
					  document.getElementById("ddlManagUnit").style.visibility = "collapse";
				  } 
			  } else {
				  app.strModule = "GRSG";
			  }
			  
              var blnShoReportButton = getTokens()['RButton'];
              //if (blnShoReportButton) { document.getElementById("btn_TextSummary").style.display = "inline"; }
			  var blnnoBannter = getTokens()['noBanner'];

			  var blnAdmin = getTokens()['Admin'];
			  if (blnAdmin) {
				  app.Admin = true;
			  }
			  else {
				  app.Admin = false;
			  }

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

              //parser.parse();

              function ddlMatrix_Change(divTagSource) {
                  document.getElementById("ImgResultsLoading").style.visibility = "visible";
				  disableOrEnableFormElements("dropdownForm", 'select-one', true); //disable/enable to avoid user clicking query options during pending queries
				  disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries
				  disableOrEnableFormElements("dropdownForm", 'radio', true);  //disable/enable to avoid user clicking query options during pending queries
				  $(".divOpenStats").prop("onclick", null).off("click");
				  $("#btn_Report").prop("disabled", true);

                  app.map.infoWindow.hide();
				  app.map.graphics.clear();
				  app.gl.clear();
				  CED_PP_point.clearSelection();
				  if (app.strModule == "GRSG") {
					  CED_PP_line.clearSelection();
				  }
                  CED_PP_poly.clearSelection();

				  document.getElementById("txtQueryResults").innerHTML = "";
			  
                  //var strddlMatrix = document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].value;
                  var strddlEntry = document.getElementById("ddlEntry").options[document.getElementById("ddlEntry").selectedIndex].value;
                  var strStartYear = document.getElementById("ddlStartYear").options[document.getElementById("ddlStartYear").selectedIndex].value;
                  var strActivity = document.getElementById("ddlActivity").options[document.getElementById("ddlActivity").selectedIndex].value;  //get dropdown menu selection
                  var strSubActivity = document.getElementById("ddlSubActivity").options[document.getElementById("ddlSubActivity").selectedIndex].value;  //get dropdown menu selection
                  var strImpParty = document.getElementById("ddlImpParty").options[document.getElementById("ddlImpParty").selectedIndex].value;  //get dropdown menu selection
                  var strOffice = document.getElementById("ddlOffice").options[document.getElementById("ddlOffice").selectedIndex].value;  //get dropdown menu selection
                  var strState = document.getElementById("ddlState").options[document.getElementById("ddlState").selectedIndex].value;  //get dropdown menu selection
                  var strPopArea = document.getElementById("ddlPopArea").options[document.getElementById("ddlPopArea").selectedIndex].value;  //get dropdown menu selection
                  var strManagUnit = document.getElementById("ddlManagUnit").options[document.getElementById("ddlManagUnit").selectedIndex].value;  //get dropdown menu selection


				  var botContainer = registry.byId("bottomTableContainer");

				  if ((app.Admin) | ((strStartYear != "99") & (strSubActivity != "99"))) {
					  app.blnPopulateFeatureTable = true;
					  if (botContainer.containerNode.style.height == "") {
						  var bc = registry.byId('content');
						  //var newSize = 150;

						  dojo.style(botContainer.domNode, "height", 15 + "%");
						  bc.resize();
					  }
				  } else {
					  app.blnPopulateFeatureTable = false;
					  if (botContainer.containerNode.style.height != "") {
						  var bc = registry.byId('content');
						  app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression("OBJECTID < 0");
						  dojo.style(botContainer.domNode, "height", "");
						  bc.resize();
					  }
				  }

                  if (
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

				  var bln_rdo_Public = document.getElementById("rdo_Public").checked
				  var bln_rdo_SRU = document.getElementById("rdo_SRU").checked
				  if (bln_rdo_Public) {
					  strQuery = "((SRU_ID IS NULL) OR (SRU_ID = 0)) and (typeact = 'Spatial Project')";

				  }
				  else if (bln_rdo_SRU) {
					  strQuery = "(SRU_ID IS NOT NULL) AND (SRU_ID > 0)";
					  CED_PP_poly.setRenderer(app.rendererSRU);
				  }
				  else
					  strQuery = "((SRU_ID IS NULL) OR (SRU_ID = 0)) and (typeact <> 'Spatial Project')";

                  if ((app.arrayPrjIDs_fromSpatialSelect != undefined) & (app.arrayPrjIDs_fromSpatialSelect != "")) {
                      strQuery = "project_ID in (";
                      for (var i = 0; i < app.arrayPrjIDs_fromSpatialSelect.length; i++) {
                          strQuery += app.arrayPrjIDs_fromSpatialSelect[i] + ",";
                      }
                      strQuery = strQuery.slice(0, -1) + ")";
                  }

				  app.strQueryLabelText += strQuery + " ";

                  //if ((strddlMatrix !== "All") & (strddlMatrix !== "99")) {
                  //    if (strQuery !== "") { strQuery += " and "; }
                  //    strQuery += "typeact = '" + strddlMatrix + "'";
                  //    app.strQueryLabelText += "Effort Type = " + document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].text + ", ";
                  //}
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
                      
                      var strQueryTemp = "ACT_ID = " + strActivity + "";
                      strQueryTemp = strQueryTemp.replace("= null","is NULL");  //this is a simple temp fix to handle 'RESTORATION: Non-Fire Related: Habitat Improvement / Restoration' not having a lookup value
                      strQuery += strQueryTemp;

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

				  if (app.strModule == "GRSG") {
					  app.PSQ = new PS_MeasSiteSearch4Definition({
						  strURL: app.strTheme1_URL, iNonSpatialTableIndex: app.iNonSpatialTableIndex,
						  strState: strState, strPopArea: strPopArea, strManagUnit: strManagUnit, strQuerySaved: strQuery, divTagSource: divTagSource, pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly, pCED_PP_line: CED_PP_line
					  }); // instantiate the class
				  } else {
					  app.PSQ = new PS_MeasSiteSearch4Definition({
						  strURL: app.strTheme1_URL, iNonSpatialTableIndex: app.iNonSpatialTableIndex,
						  strState: strState, strPopArea: strPopArea, strManagUnit: strManagUnit, strQuerySaved: strQuery, divTagSource: divTagSource, pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly
					  }); // instantiate the class
				  }

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
				  
				  if(bln_rdo_SRU) {
					  app.MH_SRUsumMap.startSRUSum4Map(strQuery, undefined);
				  }


              }

			  function btn_clear_click() {
				  app.gl.clear();
                  app.arrayPrjIDs_fromSpatialSelect = "";
                  document.getElementById("txt_NoSpatial").style.visibility = 'hidden';
				  disableOrEnableFormElements("dropdownForm", 'select-one', true); //disable/enable to avoid user clicking query options during pending queries
				  disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries
				  disableOrEnableFormElements("dropdownForm", 'radio', true);  //disable/enable to avoid user clicking query options during pending queries
				  $(".divOpenStats").prop("onclick", null).off("click");
				  $("#btn_Report").prop("disabled", true);

                  document.getElementById("txtQueryResults").innerHTML = "-";
                  document.getElementById("dTotalProjectsQ").innerHTML = "-";
                  document.getElementById("dTotalNonProjectsQ").innerHTML = "-";
                  document.getElementById("dTotalPlansQ").innerHTML = "-";
                  document.getElementById("dTotalAcresQ").innerHTML = "-";

                  document.getElementById("ImgResultsLoading").style.visibility = "visible";
                  app.map.infoWindow.hide();
				  app.map.graphics.clear();

				  CED_PP_point.clearSelection();
				  if (app.strModule == "GRSG") {
					  CED_PP_line.clearSelection();
				  }
                  CED_PP_poly.clearSelection();

                  // do not turn off layer visibility here, the checkbox click methods will handle layer visibility
                  var pform = dom.byId("toggleForm");
                  for (var i = 0; i < pform.elements.length; i++) {  //loop through the checkboxes of the form and determin if one of the ones to click
                      if (pform.elements[i].type == 'checkbox') {
                          if ((pform.elements[i].name == "checkBoxMZ") || (pform.elements[i].name == "checkBoxPop")) {
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

                  if (document.getElementById("cbx_zoom").checked) {
					  if (app.strModule == "GUSG") {
						  var customExtentAndSR = new esri.geometry.Extent(-12260000, 4400000, -11620000, 4840000, new esri.SpatialReference({ "wkid": 3857 }));
					  } else {
						  var customExtentAndSR = new esri.geometry.Extent(-14000000, 4800000, -11000000, 6200000, new esri.SpatialReference({ "wkid": 3857 }));
					  }
					  app.map.setExtent(customExtentAndSR, true);
                  }

				  var bln_rdo_Public = document.getElementById("rdo_Public").checked
				  var bln_rdo_SRU = document.getElementById("rdo_SRU").checked
				  var bln_rdo_NonSpatial = document.getElementById("rdo_NonSpatial").checked
				  
				  if (bln_rdo_Public) {
					  if (app.strModule == "GRSG") {
						  strQuerySRU = "((SRU_ID IS NULL) OR (SRU_ID = 0)) and (typeact = 'Spatial Project')";
					  }
					  if (app.strModule == "GUSG") {
						  strQuerySRU = "((Private_Lands IS NULL) OR (Private_Lands = '0')) and (typeact = 'Spatial Project')";
					  }
					  CED_PP_poly.setRenderer(app.PolyRendererSpatialyExplicit);
				  }
				  else if (bln_rdo_SRU) {
					  if (app.strModule == "GRSG") {
						  strQuerySRU = "(SRU_ID IS NOT NULL) AND (SRU_ID > 0) and (typeact = 'Spatial Project')";
					  }
					  if (app.strModule == "GUSG") {
						  strQuerySRU = "Private_Lands = '1' and (typeact = 'Spatial Project')";
					  }
					  CED_PP_poly.setRenderer(app.rendererSRU);
				  }
				  else {
						  //strQuerySRU = "((SRU_ID IS NULL) OR (SRU_ID = 0)) and (typeact <> 'Spatial Project')";
						  strQuerySRU = "(typeact <> 'Spatial Project')";
						  //strQuerySRU = "((Private_Lands IS NULL) OR (Private_Lands= '0')) and (typeact <> 'Spatial Project')";
				  }

				  CED_PP_point.setDefinitionExpression("((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')) and " + strQuerySRU);
				  
				  if (!(app.Admin)) {
					  //CED_PP_point4FeatureTable.setDefinitionExpression("");
					  app.blnPopulateFeatureTable = false;
					  app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression("OBJECTID < 0");
					  app.pSup.gFeatureTable.refresh();
					  var botContainer = registry.byId("bottomTableContainer");  //clear out the visible attribute table
					  if (botContainer.containerNode.style.height != "") {
						  var bc = registry.byId('content');
						  var newSize = 0;
						  dojo.style(botContainer.domNode, "height", "");
						  bc.resize();
					  }
				  } 
				  
				  if (app.blnPopulateFeatureTable == true) {
					  app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression(strQuerySRU);
				  }
				  app.pSup.gFeatureTable.refresh();

				  $('.btn_clear').tooltip("close");

				  CED_PP_poly.setDefinitionExpression(strQuerySRU);
                  document.getElementById("txtQueryResults").innerHTML = ""; //clear the text results

                  CED_PP_poly.show();
				  CED_PP_point.show();
				  if (app.strModule == "GRSG") {
					  CED_PP_line.setDefinitionExpression(strQuerySRU);
					  CED_PP_line.show();
				  }

				  app.PS_Uniques.divTagSource = null;

				  app.PS_Uniques.m_strCED_PP_pointQuery = CED_PP_point.getDefinitionExpression();
				  if (bln_rdo_Public) {
					  app.iNonSpatialTableIndex = 23 + app.iIncrementHFL;  //
					  app.PS_Uniques.iNonSpatialTableIndex = app.iNonSpatialTableIndex;
					  app.PS_Uniques.strURL = app.strInitialLoad_URL;
					  app.blnInitialLoadOrSpatialCleared = true;
					  app.PS_Uniques.qry_SetUniqueValuesOf("Value", "Value", document.getElementById("ddlStartYear"), "Theme = 'StartYear'"); 
				  } else {
					  app.iNonSpatialTableIndex = 0;  //
					  app.PS_Uniques.iNonSpatialTableIndex = app.iNonSpatialTableIndex;
					  app.PS_Uniques.qry_SetUniqueValuesOf("Start_Year", "Start_Year", document.getElementById("ddlStartYear"), strQuerySRU); //maybe move this to MH_FeatureCount  //clear111
				  }

                  app.strQueryLabelText = "";
				  app.strQueryLabelTextSpatial = "";

				  if (bln_rdo_SRU) {
					  app.MH_SRUsumMap.startSRUSum4Map(strQuerySRU, undefined);
				  }
			  }
          },


          Phase2: function () {
              app.loading = dojo.byId("loadingImg");  //loading image. id
                                      
              var selectionToolbar;

			  if (app.strModule == "GUSG") {
				  var customExtentAndSR = new esri.geometry.Extent(-12260000, 4400000, -11620000, 4840000, new esri.SpatialReference({ "wkid": 3857 }));
				  app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/7a5cc2f9e5c540289acf0c291af7ab15/rest/services/CED_GUSG_frontpage_map_Restrict/FeatureServer/";
			  } else {
				  var customExtentAndSR = new esri.geometry.Extent(-14000000, 4800000, -11000000, 6200000, new esri.SpatialReference({ "wkid": 3857 }));
				  app.strTheme1_URL = "https://utility.arcgis.com/usrsvcs/servers/5d5fc053dd7e4de4b9765f7a6b6f1f61/rest/services/CEDfrontpage_map_v9_Restrict/FeatureServer/";
			  }

			  app.map = new esri.Map("map", { basemap: "topo", logo: false, extent: customExtentAndSR });


              app.map.on("load", initSelectToolbar);
              dojo.connect(app.map, "onUpdateStart", showLoading);
              dojo.connect(app.map, "onUpdateEnd", hideLoading);

			  var legendLayers = [];

			  app.iIncrementHFL = 0;
			  if (app.strModule == "GUSG") {
				  app.iIncrementHFL = -1;
			  }
			  CED_PP_point = new FeatureLayer(app.strTheme1_URL + "0", { id: "0", mode: FeatureLayer.MODE_ONDEMAND, outFields: ["Project_ID"], visible: true });

			  var strstrCED_PP_point_Where;
			  if (app.strModule == "GRSG") {
				  strstrCED_PP_point_Where = "((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')) and ((SRU_ID IS NULL) OR (SRU_ID = 0))"
			  } else {
				  strstrCED_PP_point_Where = "((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')) and ((Private_Lands IS NULL) OR (Private_Lands = '0'))"
			  }
			  CED_PP_point.setDefinitionExpression(strstrCED_PP_point_Where);


			  var PSelectionSymbolPoint = new SimpleMarkerSymbol().setColor(new Color([0, 255, 255, 0.4]))
              CED_PP_point.setSelectionSymbol(PSelectionSymbolPoint);

              this.gCED_PP_point4FeatureTable = new FeatureLayer(app.strTheme1_URL + "0", {
                  id: "00", mode: FeatureLayer.MODE_ONDEMAND, visible: false,
				  outFields: ["Project_ID", "SourceFeatureType", "Project_Name", "Project_Status", "Activity", "SubActivity", "Implementing_Party", "Office", "Date_Created", "Last_Updated", "Date_Approved", "Start_Year", "Finish_Year", "TypeAct", "TotalAcres", "TotalMiles", "Prj_Status_Desc", "post_fire", "SRU_ID"]
              });
              this.gCED_PP_point4FeatureTable.setDefinitionExpression("OBJECTID < 0");
			  app.blnPopulateFeatureTable = false

			  var strstrCED_PP_poly_Where;
			  if (app.strModule == "GRSG") {
				  CED_PP_line = new FeatureLayer(app.strTheme1_URL + "1", { id: "1", mode: FeatureLayer.MODE_ONDEMAND, outFields: ["Project_ID"], visible: true });
				  pSeletionSymbolLine = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([0, 255, 255]), 3)
				  CED_PP_line.setSelectionSymbol(pSeletionSymbolLine);
				  strCED_PP_poly_Where = "((SRU_ID IS NULL) OR (SRU_ID = 0)) and (typeact = 'Spatial Project')";
			  } else {
				  strCED_PP_poly_Where = "((Private_Lands IS NULL) OR (Private_Lands = '0')) and (typeact = 'Spatial Project')";
			  }

              //note: the autoGeneralize only works if the hosted feature layer editing is not enabled on AGOL
			  CED_PP_poly = new FeatureLayer(app.strTheme1_URL + (parseInt("2") + app.iIncrementHFL).toString(), { id: "2", "opacity": 0.5, mode: esri.layers.FeatureLayer.MODE_ONDEMAND, outFields: ["Project_ID"], autoGeneralize: true, visible: true });
			  CED_PP_poly.setDefinitionExpression(strCED_PP_poly_Where); 

			  var sfsSRU = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
				  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
					  new Color([0, 0, 0]), 3), new Color([200, 200, 155, 0.8])
			  );
			  app.rendererSRU = new SimpleRenderer(sfsSRU);
			  

			  CED_PP_poly.on('load', function (evt) {
				  if (app.PolyRendererSpatialyExplicit == undefined) {
					  app.PolyRendererSpatialyExplicit = evt.target.renderer;
				  }
			  });  
			  
              pSeletionSymbolPoly = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 2), new Color([0, 255, 255, 0.4]));
              CED_PP_poly.setSelectionSymbol(pSeletionSymbolPoly);

			  var strBase_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/CED_Base_Layers/FeatureServer/"
			  if (app.strModule == "GRSG") {

				  var strlabelField1 = "POPULATION";
				  var strlabelField2 = "Name";
				  var strlabelField3 = "Mgmt_zone";
				  var pBase_Pop = new FeatureLayer(strBase_URL + "0", { id: "Pop", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField1], visible: false });
				  var pBase_MZ = new FeatureLayer(strBase_URL + "1", { id: "MZ", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, outFields: [strlabelField2, strlabelField3], visible: false });
			  
				  var pBase_SBBiom = new FeatureLayer("https://gis.usgs.gov/sciencebase2/rest/services/Catalog/5ccb4a64e4b09b8c0b7808a6/MapServer/0", { id: "SBBi", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false })
				  var sfsSBBiom = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
					  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						  new Color([0, 200, 0]), 3), new Color([26, 255, 158, 0.1])
				  );
				  var rendererSBBiom = new SimpleRenderer(sfsSBBiom);
				  pBase_SBBiom.setRenderer(rendererSBBiom);

				  var pBase_RRP = new FeatureLayer(strBase_URL + "2", { id: "RRP", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
				  var pBase_RRB = new FeatureLayer(strBase_URL + "3", { id: "RRB", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
				  var pBase_Breed = new FeatureLayer(strBase_URL + "4", { id: "Breed", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
				  var pBase_PI = new FeatureLayer(strBase_URL + "5", { id: "PI", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
				  var pBase_Eco = new FeatureLayer(strBase_URL + "6", { id: "Eco", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
				  var pBase_BLMHMA = new FeatureLayer(strBase_URL + "7", { id: "BLMMA", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
				  var pBase_PAC = new FeatureLayer(strBase_URL + "9", { id: "PAC", "opacity": 0.8, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
			  }
			  var pBase_SMA = new FeatureLayer(strBase_URL + "8", { id: "SMA", "opacity": 0.5, mode: FeatureLayer.MODE_ONDEMAND, visible: false });

			  if (app.strModule == "GRSG") {
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
			  }

			  legendLayers.push({ layer: pBase_SMA, title: 'Land Ownership (Surface Management Agency, BLM 2015)' });
			  if (app.strModule == "GRSG") {
				  legendLayers.push({ layer: pBase_PAC, title: 'GRSG Priority Areas for Conservation (PACs)' });
				  legendLayers.push({ layer: pBase_SBBiom, title: 'US Sagebrush Biome Range Extent' });				
				  legendLayers.push({ layer: pBase_BLMHMA, title: 'GRSG BLM Habitat Management Areas (PHMA + IHMA [ID]) (BLM/USFS 2015)' });
				  legendLayers.push({ layer: pBase_Eco, title: 'Ecosystem Resilience & Resistance (R&R) (Chambers et al. 2014, 2016)' });
				  legendLayers.push({ layer: pBase_RRP, title: 'GRSG Pop’l’n Index (High/Low (80% threshold)) + R&R (Chambers et al. 2017 )' });
				  legendLayers.push({ layer: pBase_RRB, title: 'GRSG Breeding Habitat Dist. + R&R (Chambers et al. 2017)' });
				  legendLayers.push({ layer: pBase_Breed, title: 'Breeding Habitat Distribution (Doherty et al. 2017)' });
				  legendLayers.push({ layer: pBase_PI, title: 'GRSG Pop’l’n Index (Relative Abundance) (Doherty et al. 2017)' });
				  legendLayers.push({ layer: pBase_Pop, title: 'GRSG Populations' });
				  legendLayers.push({ layer: pBase_MZ, title: 'WAFWA Management Zones' });
			  }
			  legendLayers.push({ layer: CED_PP_poly, title: 'CED Plans and Projects' });

              dojo.connect(app.map, 'onLayersAddResult', function (results) {
                  var legend = new Legend({ map: app.map, layerInfos: legendLayers, respectCurrentMapScale: false, autoUpdate: true }, "legendDiv");
                  legend.startup();
              });

              var cbxLayers = [];
			  if (app.strModule == "GRSG") {
				  cbxLayers.push({
					  layers: [pBase_PAC, pBase_PAC], title: 'GRSG Priority Areas for Conservation (PACs)' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<i title="This polygon data set represents all sage-grouse Priority Areas for Conservation (PACs) identified in the 2013 Greater Sage-Grouse Conservation Objectives Team (COT) Report. PACs represent areas identified as essential for the long-term conservation of the sage-grouse. The COT determined that the PACs are key for the conservation of the species range wide.">more..., </i>' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<a href="https://www.sciencebase.gov/catalog/item/56f96d88e4b0a6037df066a3" target="_blank">(COT Team Report, 2014)</a>'
				  });

				  cbxLayers.push({
					  layers: [pBase_SBBiom, pBase_SBBiom], title: 'US Sagebrush Biome Range Extent' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<i title="This feature estimates the geographic extent of the sagebrush biome in the United States. It was created for the Western Association of Fish and Wildlife Agency’s (WAFWA) Sagebrush Conservation Strategy publication as a visual for the schematic figures. This layer does not represent the realized distribution of sagebrush and should not be used to summarize statistics about the distribution or precise location of sagebrush across the landscape.">more..., </i>' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<a href="https://www.sciencebase.gov/catalog/item/5ccb4a64e4b09b8c0b7808a6" target="_blank">(Jeffries, M.I., and Finn, S.P., 2019)</a>'
				  });
			  }
              cbxLayers.push({
                  layers: [pBase_SMA, pBase_SMA], title: 'Land Ownership (SMA)' +
                                                                      '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<i title="The Surface Management Agency (SMA) Geographic Information System (GIS) dataset depicts Federal land for the United States and classifies this land by its active Federal surface managing agency.">more..., </i>' +
                                                                      '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<a href="https://landscape.blm.gov/geoportal/catalog/search/resource/details.page?uuid=%7B2A8B8906-7711-4AF7-9510-C6C7FD991177%7D" target="_blank">(Surface Management Agency, BLM 2015)</a>'
              });

			  if (app.strModule == "GRSG") {
				  cbxLayers.push({
					  layers: [pBase_BLMHMA, pBase_BLMHMA], title: 'GRSG Habitat Management Areas' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<i title="This dataset represents the consolidated submissions of GRSG habitat management areas from each individual BLM ARMP & ARMPA/Records of Decision (ROD) and for subsequent updates. These data were submitted to the BLM’s Wildlife Habitat Spatial Analysis Lab in March 2016 and were updated for UT in April of 2017 and WY in October of 2017. All of the data used to create this file was submitted by the EIS.">more..., </i>' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<a href="https://landscape.blm.gov/geoportal/catalog/search/resource/details.page?uuid=%7BECEEE1DF-9B8A-478D-874B-C6FF315A7585%7D" target="_blank">(Habitat Management Areas, BLM 2017)</a>'


				  });
			  }

			  if (app.strModule == "GRSG") {
				  cbxLayers.push({ layers: [pBase_Eco, pBase_Eco], title: 'Ecosystem Resilience & Resistance (R&R)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Chambers et al. 2014, 2016)' });
				  cbxLayers.push({ layers: [pBase_RRP, pBase_RRP], title: 'GRSG Pop’l’n Index (High/Low (80% threshold)) + R&R<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Chambers et al. 2017 )' });
				  cbxLayers.push({ layers: [pBase_RRB, pBase_RRB], title: 'GRSG Breeding Habitat Dist. + R&R<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Chambers et al. 2017)' });
				  cbxLayers.push({ layers: [pBase_Breed, pBase_Breed], title: 'Breeding Habitat Distribution<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Doherty et al. 2017)' });
				  cbxLayers.push({ layers: [pBase_PI, plabels2], title: 'GRSG Pop’l’n Index (Relative Abundance)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp(Doherty et al. 2017)' });
				  cbxLayers.push({
					  layers: [pBase_Pop, plabels1], title: 'GRSG Populations' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<i title="This data set represents greater sage-grouse populations to be used in work for the US Fish and Wildlife (USFWS) 2015 Status Review for the greater sage-grouse. Populations do not represent occupied habitat. Population polygons are meant to coarsely identify areas of occupation based on encircling groups of leks. Boundaries taken from BLM/WAFWA revised population boundaries (‘COT_SG_Populations_2014_WAFWA_UT’ data layer). The original data layer was slightly modified for the USFWS 2015 Status Review...">more..., </i>' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<a href="https://www.sciencebase.gov/catalog/item/56f96f78e4b0a6037df06b0f" target="_blank">USFWS, ES 2014</a>'
				  });

				  cbxLayers.push({
					  layers: [pBase_MZ, plabels2], title: 'WAFWA Management Zones' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<i title="The Greater Sage-grouse Comprehensive Conservation Strategy developed sage-grouse management zones determined by sage-grouse populations and sub-populations identified within seven floristic provinces.">more..., </i>' +
						  '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp<a href="https://www.wafwa.org/Documents%20and%20Settings/37/Site%20Documents/Initiatives/Sage%20Grouse/Primer%203%20SGMapping%20&%20Priority%20Habitats1.2.pdf" target="_blank">WAFWA</a>'
				  });
			  }
			  cbxLayers.push({ layers: [CED_PP_poly, CED_PP_poly], title: 'CED Plans and Projects (area)' });
			  if (app.strModule == "GRSG") {
				  cbxLayers.push({ layers: [CED_PP_point, CED_PP_point], title: 'CED Plans and Projects (point)' });
				  cbxLayers.push({ layers: [CED_PP_line, CED_PP_line], title: 'CED Plans and Projects (line)' });
			  }

			  if (app.strModule == "GRSG") {
				  arrayLayers = [pBase_PAC, pBase_SBBiom, pBase_SMA, pBase_BLMHMA, pBase_Eco, pBase_RRP,
					  pBase_RRB, pBase_Breed, pBase_PI, pBase_MZ, pBase_Pop, plabels1, plabels2,
					  CED_PP_poly, CED_PP_line, CED_PP_point, this.gCED_PP_point4FeatureTable];
			  } else {
				  arrayLayers = [pBase_SMA, CED_PP_poly, CED_PP_point, this.gCED_PP_point4FeatureTable];
			  }
              app.map.addLayers(arrayLayers);

			  app.gl = new esri.layers.GraphicsLayer();
			  app.map.addLayer(app.gl)
			  app.gl.setMinScale(5000000);

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
					  "Last_Updated", "Date_Approved", "Start_Year", "Finish_Year", "TotalAcres", "TotalMiles", "post_fire","SRU_ID", "SourceFeatureType"
				  ],
				  dateOptions: {
					  // set date options at the feature table level 
					  // all date fields will adhere this 
					  datePattern: "y MM dd"
				  },
                  fieldInfos: [
					{
						  name: 'Project_ID', alias: 'ID',
						  	format: {
							  template: "${value}"
						  }
					},
                    { name: 'TypeAct', alias: 'Project or Plan', },
                    { name: 'Prj_Status_Desc', alias: 'Implementation Status', },
                    { name: 'Project_Name', alias: 'Effort Name', },
                    { name: 'Activity', alias: 'Activity', },
                    { name: 'SubActivity', alias: 'Sub Activity', },
                    { name: 'Implementing_Party', alias: 'Implementing Party', },
                    { name: 'Office', alias: 'Office', },
					{ name: 'Date_Created', alias: 'Date Recorded', },
					{
						  name: 'Last_Updated', alias: 'Recorded Update',
						  format: {
							  template: "${value}"
						  }
					},
                    { name: 'Date_Approved', alias: 'Date Approved', },
					{
						  name: 'Start_Year', alias: 'Start Year',
						  format: {
							  template: "${value}"
						  }
					  },
					{ name: 'Finish_Year', alias: 'Finish Year', 
					  format: {
						  template: "${value}"
						  }
					},
					  {
						  name: 'TotalAcres', alias: 'Acres',
					  },
					{ name: 'TotalMiles', alias: 'Miles', },
					{ name: 'post_fire', alias: 'Post Fire Effort', },
     				{ name: 'SRU_ID', alias: 'SRU ID', },
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

				  if (app.strModule == "GRSG") {
					  var featureLayer3Message = results[2].features.length;
				  }

                  var count = 0;
                  for (var i = 0; i < results.length; i++) {
                      count = count + results[i].features.length;
                  }
				  var temp = "Total features selected:  <b>" + count +
					  "</b><br>&nbsp;&nbsp;FeatureLayer1:  <b>" + featureLayer1Message +
					  "</b><br>&nbsp;&nbsp;FeatureLayer2:  <b>" + featureLayer2Message

				  if (app.strModule == "GRSG") {
					  temp += "</b><br>&nbsp;&nbsp;FeatureLayer3:  " + featureLayer3Message;
				  }
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

				  if (app.strModule == "GRSG") {
					  arrayUtils.map(items[2].features, function (item) {
						  allItems.push(item.attributes.Project_ID);
					  })
				  }

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
						  if (app.strModule == "GRSG") {
							  app.PSQ = new PS_MeasSiteSearch4Definition({
								  strURL: app.strTheme1_URL, iNonSpatialTableIndex: app.iNonSpatialTableIndex,
								  strState: "", strPopArea: "", strManagUnit: "", strQuerySaved: strQuery2, divTagSource: document.getElementById("ddlStartYear"),
								  pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly, pCED_PP_line: CED_PP_line
							  });
						  } else {
							  app.PSQ = new PS_MeasSiteSearch4Definition({
								  strURL: app.strTheme1_URL, iNonSpatialTableIndex: app.iNonSpatialTableIndex,
								  strState: "", strPopArea: "", strManagUnit: "", strQuerySaved: strQuery2, divTagSource: document.getElementById("ddlStartYear"),
								  pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly
							  });
						  }
					  }


					  if (!(app.Admin)) {
						  //CED_PP_point4FeatureTable.setDefinitionExpression("");
						  app.blnPopulateFeatureTable = false;
						  app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression("OBJECTID < 0");
						  app.pSup.gFeatureTable.refresh();
						  var botContainer = registry.byId("bottomTableContainer");  //clear out the visible attribute table
						  if (botContainer.containerNode.style.height != "") {
							  var bc = registry.byId('content');
							  var newSize = 0;
							  dojo.style(botContainer.domNode, "height", "");
							  bc.resize();
						  }
					  }
					  if (app.blnPopulateFeatureTable == true) {
						  app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression(strQuery2);
					  }
					  app.pSup.gFeatureTable.refresh();
					  
					  app.PSQ.ExecutetheDerivedQuery(strQuery2, null);

					  var bln_rdo_SRU = document.getElementById("rdo_SRU").checked
					  if (bln_rdo_SRU) {
						  app.MH_SRUsumMap.startSRUSum4Map(strQuery2, undefined);
					  }

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
				  if (app.strModule == "GRSG") {
					  qt_Layer2 = new esri.tasks.QueryTask(CED_PP_line.url);
					  q_Layer2 = new esri.tasks.Query();
				  }
                  qt_Layer3 = new esri.tasks.QueryTask(CED_PP_poly.url);
                  q_Layer3 = new esri.tasks.Query();
                  q_Layer1.returnGeometry = q_Layer3.returnGeometry = false;
                  q_Layer1.outFields = q_Layer3.outFields = ["Project_ID"];
                  q_Layer1.geometry = q_Layer3.geometry = Geom;

				  if (app.strModule == "GRSG") {
					  q_Layer2.returnGeometry  = false;
					  q_Layer2.outFields ["Project_ID"];
					  q_Layer2.geometry = Geom;
					  q_Layer2.where = CED_PP_line.getDefinitionExpression();
				  }

				  q_Layer1.where = CED_PP_point.getDefinitionExpression();
                  q_Layer3.where = CED_PP_poly.getDefinitionExpression();

                  var pLayer1, pLayer2, pLayer3, pPromises;
				  pLayer1 = qt_Layer1.execute(q_Layer1);
				  if (app.strModule == "GRSG") {
					  pLayer2 = qt_Layer2.execute(q_Layer2);
				  }
				  pLayer3 = qt_Layer3.execute(q_Layer3);
				  if (app.strModule == "GRSG") {
					  pPromises = new All([pLayer1, pLayer2, pLayer3]);
				  } else {
					  pPromises = new All([pLayer1, pLayer3]);
				  }
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
				  var arrayColWidths = [55, 145, 145, 380, 380, 360, 230, 290, 150, 150, 150, 80, 80, 60, 100, 150, 100, 100];
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

			  on(this.gFeatureTable, "error", function (evt) {  //resize the column widths
				  console.log("Failed to get stat results due to an error: ", err);
				  $(function () {
					  $("#dialogWarning1").dialog("open");
				  });


			  });


              on(this.gFeatureTable, "row-select", function (evt) {  //resize the column widths
                  app.map.graphics.clear();
				  CED_PP_point.clearSelection();
				  if (app.strModule == "GRSG") {
					  CED_PP_line.clearSelection();
				  }
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
					  if (app.strModule == "GRSG") {
						  promises.push(CED_PP_line.selectFeatures(pSelQuery, FeatureLayer.SELECTION_NEW));
					  }
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
						  if (app.strModule == "GRSG") {
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
					  if (app.strModule == "GRSG") {
						  CED_PP_line.clearSelection();
					  }
                      CED_PP_poly.clearSelection();
					  if (app.strModule == "GRSG") {
						  app.pPS_Identify = new PS_Identify({
							  pLayer1: CED_PP_point, pLayer2: CED_PP_line, pLayer3: CED_PP_poly, pMap: app.map,
							  strQueryString4Measurements: "Project_ID = " + strValue3, strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow, mSR: pSR
						  }); // instantiate the ID Search class    
					  } else {
						  app.pPS_Identify = new PS_Identify({
							  pLayer1: CED_PP_point, pLayer3: CED_PP_poly, pMap: app.map,
							  strQueryString4Measurements: "Project_ID = " + strValue3, strURL: app.strTheme1_URL, pInfoWindow: app.infoWindow, mSR: pSR
						  }); // instantiate the ID Search class    
					  }
                      var pPS_Identify_Results = app.pPS_Identify.executeQueries(null, "", 0, pGeometryPoint[0], pGeometryPoint[1]);
                  }
              });
			  app.blnInitialLoadOrSpatialCleared = true;
			  app.iNonSpatialTableIndex = 0;  //these 3 lines populate the list values
			  app.strInitialLoad_URL = app.strTheme1_URL;
			  //app.strInitialLoad_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/CEDStartup/FeatureServer/";
			  app.PS_Uniques = new PS_PopUniqueQueryInterfaceValues({ strURL: app.strInitialLoad_URL, iNonSpatialTableIndex: 23 + app.iIncrementHFL, divTagSource: null });
			  app.PS_Uniques.m_strCED_PP_pointQuery = CED_PP_point.getDefinitionExpression();
			  app.PS_Uniques.qry_SetUniqueValuesOf("Value", "Value", document.getElementById("ddlStartYear"), "Theme = 'StartYear'"); 
			  
			  app.MH_SRUsumMap = new MH_SRU_SumAndMap({ pCED_PP_poly: CED_PP_poly, pCED_PP_point: CED_PP_point });

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
				  if (app.strModule == "GRSG") {
					  CED_PP_line.clearSelection();
				  }
                  CED_PP_poly.clearSelection();

				  //var strMatrix = document.getElementById("ddlMatrix").options[document.getElementById("ddlMatrix").selectedIndex].text;  //get dropdown menu selection
				  var iMatrix = document.getElementById("ddlStartYear").options[document.getElementById("ddlStartYear").selectedIndex].text;  //get dropdown menu selection

				  var strManagUnit = document.getElementById("ddlManagUnit").options[document.getElementById("ddlManagUnit").selectedIndex].value;  //get dropdown menu selection
				  //app.PSQS = new PS_ReturnQuerySt({ strURL: app.strTheme1_URL, strMatrix: strMatrix, strManagUnit: strManagUnit, SIDs: null, iNonSpatialTableIndex: null }); // instantiate the Seat Geek Search class
				  app.PSQS = new PS_ReturnQuerySt({ strURL: app.strTheme1_URL, iMatrix: iMatrix, strManagUnit: strManagUnit, SIDs: null, iNonSpatialTableIndex: null }); // instantiate the Seat Geek Search class


				  var psqs_strQueryString = app.PSQS.returnQS();

                  app.map.infoWindow.hide();            //var strquery4id = "Contaminant LIKE '%Mercury%'";

				  if (app.strModule == "GRSG") {
					  app.pPS_Identify = new PS_Identify({
						  pLayer1: CED_PP_point, pLayer2: CED_PP_line, pLayer3: CED_PP_poly, pMap: app.map,
						  strQueryString4Measurements: psqs_strQueryString, strURL: app.strTheme1_URL,
						  pInfoWindow: app.infoWindow
					  }); // instantiate the ID Search class
				  } else {
					  app.pPS_Identify = new PS_Identify({
						  pLayer1: CED_PP_point, pLayer3: CED_PP_poly, pMap: app.map,
						  strQueryString4Measurements: psqs_strQueryString, strURL: app.strTheme1_URL,
						  pInfoWindow: app.infoWindow
					  }); // instantiate the ID Search class
				  }
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

              //parser.parse();
              //?IP=11,14,16&TA=3&ST=183,985,1992,4512,9901,12665,15561,19432
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
                  //document.getElementById("btn_TextSummary").disabled = true;
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

				  strQuery = "((SRU_ID IS NULL) OR (SRU_ID = 0)) and (typeact = 'Spatial Project')"

                  if (strA_TypeAct) {
                      strQuery += "(ta_id in (" + strA_TypeAct + "))";
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


				  if (app.strModule == "GRSG") {
					  app.PSQ = new PS_MeasSiteSearch4Definition({
						  strURL: app.strTheme1_URL, iNonSpatialTableIndex: app.iNonSpatialTableIndex,
						  strState: strA_State, strPopArea: strA_POPArea, strManagUnit: strA_Managementunit, strQuerySaved: strQuery, divTagSource: document.getElementById("ddlStartYear"),
						  pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly, pCED_PP_line: CED_PP_line
					  }); // instantiate the class
				  } else {
					  app.PSQ = new PS_MeasSiteSearch4Definition({
						  strURL: app.strTheme1_URL, iNonSpatialTableIndex: app.iNonSpatialTableIndex,
						  strState: strA_State, strPopArea: strA_POPArea, strManagUnit: strA_Managementunit, strQuerySaved: strQuery, divTagSource: document.getElementById("ddlStartYear"),
						  pCED_PP_point: CED_PP_point, pCED_PP_poly: CED_PP_poly,
					  }); // instantiate the class
				  }
				  if ((strA_State != undefined) || (strA_POPArea != undefined) || (strA_Managementunit != undefined)) {
                      var PSQResults = app.PSQ.qry_Non_SpatialTable("", null, "ST_ID");
                      PSQResults.then(PSQsearchSucceeded, PSQsearchFailed);
                  } else {  // handling arguments passed
					  app.PSQ.ExecutetheDerivedQuery(strQuery, document.getElementById("ddlStartYear"));
                  }
                  app.PS_Uniques.m_strCED_PP_pointQuery = CED_PP_point.getDefinitionExpression();
                  app.PS_Uniques.divTagSource = null;
				  //app.PS_Uniques.qry_SetUniqueValuesOf("TypeAct", "TypeAct", document.getElementById("ddlMatrix"), CED_PP_point.getDefinitionExpression()); //args
				  app.PS_Uniques.qry_SetUniqueValuesOf("Start_Year", "Start_Year", document.getElementById("ddlStartYear"), CED_PP_point.getDefinitionExpression()); //args
				  

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
			  localStorage.setItem("iIncrementHFL4Summary", app.iIncrementHFL);

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
              //var pNewWindow = window.open("CEDPSummary"); //static
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


