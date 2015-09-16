//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        July 2015

function onRowClickHandler(evt) {
    var strURL = evt.grid.getItem(evt.rowIndex).uri;
    if (strURL) {
        window.open(strURL);
    }
}

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
      "esri/IdentityManager",
      "esri/layers/FeatureLayer",
      "esri/dijit/FeatureTable",
      "dojo/dom-construct",
      "dojo/dom",
      "dojo/parser",
      "dojo/ready",
      "dojo/on",
      "dijit/registry",
      "esri/tasks/query",
      "dojox/grid/DataGrid",
      "dojo/data/ItemFileReadStore", "extras/MH_MapSetup_prjReport",
      "dojo/date/locale"

  ], function (
      declare, lang, esriRequest, IdentityManager, FeatureLayer, FeatureTable,
      domConstruct, dom, parser, ready, on,
      registry, Query, DataGrid, ItemFileReadStore, MH_MapSetup_prjReport
) {


      function formatDate(value) {
          if (value) {
              var inputDate = new Date(value);
              return dojo.date.locale.format(inputDate, {
                  selector: 'date',
                  datePattern: 'MM/dd/yyyy'
              });
          } else {
              return "";
          }
      }


      return declare([], {
          m_prjQuery: null,
          strURL: null,
          m_gridArray: null,
          m_igridArrayIndex: null,
          m_iarrayQueryIndex: null,
          m_arrayQuery: null,
          m_arrayQuery4DataGrid: null,
          m_iarrayQueryIndex4Grid: null,
          m_gridContacts: null,
          m_gridContactOrgsOnly: null,

          constructor: function (options) {
              this.strURL = options.strURL || "www.cnn.com"; // default AGS REST URL
          },

          RunReport: function (strQuery, gridArray) {
              this.m_gridArray = gridArray;
              this.m_prjQuery = strQuery;
              //table/fc index, query string, field 4 aggregation, stat type (count, sum, avg), group by field, html ID, string function
              arrayQuery = [];
              arrayQuery.push(["0", strQuery, "Prj_Title", "count", "Prj_Title", "divTitle", 'Title: {0}', ""]);
              arrayQuery.push(["0", strQuery, "Description", "count", "Description", "divDescription", 'Description: {0}', ""]);
              arrayQuery.push(["0", strQuery, "Total__Funding_by_Your_LCC", "count", "Total__Funding_by_Your_LCC", "dTotalAllocatedbyLCCSum", '<b>Total Funds Allocated by GNLCC: {0}</b>', "currency"]);
              arrayQuery.push(["0", strQuery, "Total_Matching_or_In_kind_Funds", "count", "Total_Matching_or_In_kind_Funds", "dTotalInKindSum", '<b>Total In-Kind/Match Contributions: {0}</b>', "currency"]);
              arrayQuery.push(["0", strQuery, "Prj_Start_Date", "count", "Prj_Start_Date", "divStart", 'Project Start Date: {0} ', ""]);
              arrayQuery.push(["0", strQuery, "Prj_End_Date", "count", "Prj_End_Date", "divEnd", 'Project End Date: {0} ', ""]);
              arrayQuery.push(["2", strQuery, "DelivType", "count", "DelivType", "divDeliverables", 'Deliverable Types: {0} ', ""]);
              arrayQuery.push(["6", strQuery, "amount", "sum", "Fund_Year", "dTotalAllocatedbyLCCbyYear", 'Total Funds Allocated by GNLCC by Year: \n<br>&nbsp;&nbsp;&nbsp;{0} ', "show both"]);
              arrayQuery.push(["0", strQuery, "PI_and_Email", "count", "PI_and_Email", "divPI", 'Project Lead: {0}', ""]);
              arrayQuery.push(["0", strQuery, "PI_Org", "count", "PI_Org", "divLeadOrg", 'Lead Organization: {0}', ""]);
              arrayQuery.push(["5", strQuery, "amount", "sum", "dest_orgname", "divFundingDispersal", 'Funding Dispersal: \n<br>&nbsp;&nbsp;&nbsp;{0} ', "show both"]);
              arrayQuery.push(["7", strQuery, "InKindamount", "sum", "orgname", "divInKindMatch", 'In-Kind/Match Contributions: \n<br>&nbsp;&nbsp;&nbsp;{0} ', "show both"]);
              arrayQuery.push(["4", strQuery, "EcotypicAreaName", "count", "EcotypicAreaName", "divEcotypicArea", 'Ecotypic Area(s): \n<br> {0} ', ""]);
              arrayQuery.push(["8", strQuery, "GoalName", "count", "GoalName", "divGoals", 'Goal(s): \n<br> {0} ', ""]);
              arrayQuery.push(["11", strQuery, "Stressor", "count", "Stressor", "divStressors", 'Stressor(s): \n<br> {0} ', ""]);
              arrayQuery.push(["0", strQuery, "Comments", "count", "Comments", "divLCMAPLink", '<a href="{0}">LC MAP Collaborative Project Workspace Link</a>  ', ""]);
              //              arrayQuery.push(["1", strQuery, "CommonName", "count", "CommonName", "divConservationTargets", 'Conservation Target(s): \n<br> {0} ', ""]);
              arrayQuery4DataGrid = [];
              arrayQuery4DataGrid.push(["9", strQuery + " and organization = 0", ["PersonName", "Contact_Type", "GroupName", "prj_priority", "OBJECTID"], "gridDivContacts"]);
              arrayQuery4DataGrid.push(["9", strQuery + " and organization <> 0", ["OBJECTID", "GroupName", "Contact_Type"], "gridDivContactOrgsOnly"]);
              arrayQuery4DataGrid.push(["3", strQuery + " and DelivType in ('Statement of Work','Proposal')", ["OBJECTID", "Fund_Year", "deliverable_title", "uri"], "gridDivProposals"]);
              arrayQuery4DataGrid.push(["1", strQuery + " and CTTYPE_ID = 3", ["OBJECTID", "CommonName", "ESA_Status", "TierName", "PrimaryLCCTargetType"], "gridDivConservationTargetsSPP"]);
              arrayQuery4DataGrid.push(["1", strQuery + " and CTTYPE_ID <> 3", ["OBJECTID", "CommonName", "ConsvTargetTypeName", "PrimaryLCCTargetType"], "gridDivConservationTargetsOther"]);

              arrayQuery4DataGrid.push(["2", strQuery + " and supplemental = 0 and not (DelivType in ('Statement of Work','Proposal'))", ["OBJECTID", "deliverable_title", "Fund_Year", "duedate", "DelivType", "Deliverable_Received", "deliverableid"], "gridDivDeliverables"]);
              arrayQuery4DataGrid.push(["2", strQuery + " and supplemental <> 0", ["OBJECTID", "deliverable_title", "Fund_Year", "DelivType", "deliverableid"], "gridDivDeliverablesSupWebinarsPages"]);

              this.m_arrayQuery = arrayQuery;
              this.m_arrayQuery4DataGrid = arrayQuery4DataGrid;

              this.SendQuery(arrayQuery, 0)
          },

          SendQuery: function (arrayQuery, iarrayQueryIndex) {
              this.m_iarrayQueryIndex = iarrayQueryIndex;
              pTblindexAndQuery = arrayQuery[iarrayQueryIndex];

              if (pTblindexAndQuery[5] == "divProposals") {
                  var temp2 = "";
              }

              var iTableIndex = pTblindexAndQuery[0];
              var strQuery = pTblindexAndQuery[1];
              var pQueryTask = new esri.tasks.QueryTask(this.strURL + "/" + iTableIndex);
              var pQuery = new esri.tasks.Query();
              var pstatDef = new esri.tasks.StatisticDefinition();

              strFieldNameText = pTblindexAndQuery[2];

              pstatDef.statisticType = pTblindexAndQuery[3];
              pstatDef.onStatisticField = strFieldNameText;
              pstatDef.outStatisticFieldName = "genericstat";

              pQuery.returnGeometry = false;
              pQuery.where = strQuery;
              pQuery.outFields = [strFieldNameText];
              var strGroupByField = pTblindexAndQuery[4];

              if (strGroupByField != "") {
                  pQuery.groupByFieldsForStatistics = [strGroupByField];
              }


              pQuery.outStatistics = [pstatDef];
              return pQueryTask.execute(pQuery, this.returnEvents, this.err);
          },

          SendQuery4DataGrid: function (arrayQuery, iarrayQueryIndex) {
              this.m_igridArrayIndex = iarrayQueryIndex;

              pTblindexAndQuery = arrayQuery[iarrayQueryIndex];

              var iTableIndex = pTblindexAndQuery[0];
              var strQuery = pTblindexAndQuery[1];
              var arrayFields = pTblindexAndQuery[2];
              var pQueryTask = new esri.tasks.QueryTask(this.strURL + "/" + iTableIndex);
              var pQuery = new esri.tasks.Query();

              pQuery.returnGeometry = false;
              pQuery.where = strQuery;
              pQuery.outFields = arrayFields;

              return pQueryTask.execute(pQuery, this.returnEvents4DataGrid, this.errDG);
          },

          returnEvents4DataGrid: function (results) {
              pTblindexAndQuery = this.app.gPjrReportQuery.m_arrayQuery4DataGrid[this.app.gPjrReportQuery.m_igridArrayIndex];
              var strHTMLElementID = pTblindexAndQuery[3];


              var gridArray = this.app.gPjrReportQuery.m_gridArray;
              var iarrayQueryIndex4Grid = this.app.gPjrReportQuery.m_igridArrayIndex;
              var pGrid = gridArray[iarrayQueryIndex4Grid];
              var resultFeatures = results.features;

              if (resultFeatures.length == 0) {
                  dojo.style(pGrid.domNode, 'display', 'none');
              } else {
                  dojo.style(pGrid.domNode, 'display', '');


                  var items = dojo.map(resultFeatures, function (feature) {                  //build an array of attributes
                      return feature.attributes;
                  });

                  var data = { identifier: "OBJECTID", items: items };

                  if (strHTMLElementID == "gridDivDeliverables") {
                      var pItems = data["items"]
                      for (var key in pItems) {
                          if (pItems.hasOwnProperty(key)) {
                              var pItem = pItems[key];

                              for (var keyField in pItem) {
                                  if (pItem.hasOwnProperty(keyField)) {
                                      if (keyField == "duedate") {
                                          var pValue = formatDate(pItem[keyField]);
                                          data["items"][key][keyField] = pValue;
                                      }
                                      if (keyField == "Deliverable_Received") {
                                          var pValue = formatDate(pItem[keyField]);
                                          if (pValue == 1) {
                                              pValue = "Yes";
                                          } else {
                                              pValue = "No";
                                          }
                                          data["items"][key][keyField] = pValue;
                                      }
                                  }
                              }
                          }
                      }

                  }


                  store = new ItemFileReadStore({ data: data });
                  pGrid.on("rowclick", onRowClickHandler);
                  pGrid.setStore(store);

                  var iRowHeight4Grid = 80 // Adjust the grid height based on number of records

                  //                  if (resultFeatures != undefined) {
                  if (resultFeatures.length <= 2) {
                      //iRowHeight4Grid = (45 * resultFeatures.length);
                      iRowHeight4Grid = (85 * resultFeatures.length);
                  } else if (resultFeatures.length > 2 & resultFeatures.length <= 5) {
                      //iRowHeight4Grid = (30 * resultFeatures.length);
                      iRowHeight4Grid = (35 * resultFeatures.length);
                  } else {
                      //iRowHeight4Grid = (30 * resultFeatures.length);
                      iRowHeight4Grid = (32 * resultFeatures.length);
                  }
                  //                  }
                  var strRowHeight4Grid = iRowHeight4Grid.toString() + "px";
                  document.getElementById(pGrid.id).style.height = strRowHeight4Grid;
                  dijit.byId(pGrid.id).resize();
                  dijit.byId(pGrid.id).update();

                  document.getElementById(strHTMLElementID).appendChild(document.getElementById(pGrid.id));  //move the grid to the designated div, grids need to be built outside the collapsable panel otherwise risk not rendering properly
              }
              this.app.gPjrReportQuery.m_igridArrayIndex += 1
              if (this.app.gPjrReportQuery.m_igridArrayIndex < this.app.gPjrReportQuery.m_arrayQuery4DataGrid.length) {
                  this.app.gPjrReportQuery.SendQuery4DataGrid(this.app.gPjrReportQuery.m_arrayQuery4DataGrid, this.app.gPjrReportQuery.m_igridArrayIndex)
              }
              else {
                  //                  app.pMapSup_prjReport = new MH_MapSetup_prjReport({ strQuery: this.app.gPjrReportQuery.m_prjQuery, dblExpandNum: 0.8 }); // instantiate the class
                  //                  app.pMapSup_prjReport.Phase1();
                  //                  app.pMapSup_prjReport.Phase3();

              }

          },


          returnEvents: function (results) {
              pTblindexAndQuery = this.app.gPjrReportQuery.m_arrayQuery[this.app.gPjrReportQuery.m_iarrayQueryIndex];

              var strGroupByField = pTblindexAndQuery[4];
              var strHTMLElementID = pTblindexAndQuery[5];
              var strStringFormatting = pTblindexAndQuery[6];
              var strVarType = pTblindexAndQuery[7];
              var div = document.getElementById(strHTMLElementID);
              var resultFeatures = results.features;

              if (!String.prototype.format) {
                  String.prototype.format = function () {
                      var args = arguments;
                      return this.replace(/{(\d+)}/g, function (match, number) {
                          return typeof args[number] != 'undefined'
                                            ? args[number]
                                            : match
                                          ;
                      });
                  };
              }

              if (!Number.prototype.toCurrencyString) {
                  Number.prototype.toCurrencyString = function (prefix, suffix) {
                      if (typeof prefix === 'undefined') { prefix = '$'; }
                      if (typeof suffix === 'undefined') { suffix = ''; }
                      var _localeBug = new RegExp((1).toLocaleString().replace(/^1/, '').replace(/\./, '\\.') + "$");
                      //return prefix + (~ ~this).toLocaleString().replace(_localeBug, '') + (this % 1).toFixed(2).toLocaleString().replace(/^[+-]?0+/, '') + suffix;
                      return prefix + (~ ~this).toLocaleString().replace(_localeBug, '') + suffix;
                  }
              }

              if (strVarType == "countOfGroupBy") {
                  strText = resultFeatures.length.toString();
              }
              else {
                  if ((resultFeatures != null) || (resultFeatues != undefined)) {
                      if (resultFeatures.length > 0) {
                          var featAttrs = resultFeatures[0].attributes;
                          var values = [];
                          var texts = [];
                          var strText = "";
                          var strValue = "";
                          var testTexts = {};
                          var attrNames = [];
                          var blnAdd2Dropdown;
                          for (var i in featAttrs) { attrNames.push(i); }

                          dojo.forEach(resultFeatures, function (feature) {//Loop through the QueryTask results and populate an array with the unique values

                              blnAdd2Dropdown = false;
                              dojo.forEach(attrNames, function (an) {
                                  var strText = feature.attributes[an].toString();

                                  if ((strText == null) || (strText == undefined)) {
                                      strText = "null or undefined";
                                  }
                                  if ((strGroupByField != "") & (an == "genericstat") & (strVarType != "show both")) {
                                      //values.push(strText);
                                  } else {
                                      if ((strVarType == "show both") & (an == "genericstat")) {
                                          var iTempNumber = Number(strText);
                                          strText = iTempNumber.toCurrencyString() + "\n<br>&nbsp;&nbsp;&nbsp;";
                                      } else {
                                          strText = strText.replace("unknown", "");
                                          strText = strText.replace("Unknown", "");
                                          strText = strText.replace(/\n/g, "<br>");
                                      }
                                      values.push(strText);
                                  }
                              });
                          });
                      }
                  }
                  if ((values != null) || (values != undefined)) {
                      if (values.length != 0) {
                          strText = values.join("\n<br>&nbsp;&nbsp;&nbsp;");
                      } else {
                          strText = "unk";
                      }
                  } else {
                      strText = "unk";
                  }
              }

              if (strVarType == "currency") {
                  var iTempNumber = Number(strText);
                  strText = iTempNumber.toCurrencyString();
              }
              div.innerHTML = strStringFormatting.format(strText);

              this.app.gPjrReportQuery.m_iarrayQueryIndex += 1
              if (this.app.gPjrReportQuery.m_iarrayQueryIndex < this.app.gPjrReportQuery.m_arrayQuery.length) {
                  this.app.gPjrReportQuery.SendQuery(this.app.gPjrReportQuery.m_arrayQuery, this.app.gPjrReportQuery.m_iarrayQueryIndex)
              }
              else {
                  this.app.gPjrReportQuery.SendQuery4DataGrid(this.app.gPjrReportQuery.m_arrayQuery4DataGrid, 0);
              }
              return results;
          },
          err: function (err) {
              console.log("Failed to get stat results due to an error: ", err);
              this.app.gPjrReportQuery.m_iarrayQueryIndex += 1
              if (this.app.gPjrReportQuery.m_iarrayQueryIndex < this.app.gPjrReportQuery.m_arrayQuery.length) {
                  this.app.gPjrReportQuery.SendQuery(this.app.gPjrReportQuery.m_arrayQuery, this.app.gPjrReportQuery.m_iarrayQueryIndex)
              }
          },
          errDG: function (err) {
              console.log("Failed to get stat results due to an error: ", err);
              this.app.gPjrReportQuery.m_iarrayQueryIndex += 1
              if (this.app.gPjrReportQuery.m_iarrayQueryIndex < this.app.gPjrReportQuery.m_arrayQuery.length) {
                  this.app.gPjrReportQuery.SendQuery(this.app.gPjrReportQuery.m_arrayQuery, this.app.gPjrReportQuery.m_iarrayQueryIndex)
              }
          }
      }
    )
    ;

  }
);



