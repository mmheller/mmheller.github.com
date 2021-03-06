﻿//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014
function onRowClickHandler(evt) {
    var strProjectID = evt.grid.getItem(evt.rowIndex).ProjectID.toString();
    var strURL = "prj_report.html?PRJ_ID=" + strProjectID;
    window.open(strURL);
    //window.open(strURL, "_self");
}

//function returnRangeStringQuery(strFieldName, arrayValues) {
//  var strQueryStandard = "ProjectID in (" + arrayValues.join(",") + ")";
//  var strQuery = "";
//  arrayValues = arrayValues.sort();
//  var ranges = [], singles = [], rstart, rend;
// 
//  for (var i = 0; i < arrayValues.length; i++) {
//    rstart = arrayValues[i];
//    rend = rstart;
//    while (arrayValues[i + 1] - arrayValues[i] == 1) {
//      rend = arrayValues[i + 1]; // increment the index if the numbers sequential
//      i++;
//    }
//    //ranges.push(rstart == rend ? rstart+'' : rstart + '-' + rend);
//    if (rstart == rend){
//        singles.push(rstart);
//    }else {
//        ranges.push([rstart, rend]);
//    }
//  }
//  strQuery = strFieldName + " in (" + singles.join(",") + ")";
//  for (var ii = 0; ii < ranges.length; ii++) {
//    strQuery += " and ((" + strFieldName + " >= " + ranges[ii][0].toString() + ") and (" + strFieldName + " <= " + ranges[ii][1].toString() + "))";
//  }

//  if (strQueryStandard.length < strQuery.length) {//if the original formatted query is shorter than the new, go with the original
//      strQuery = strQueryStandard;
//  }
//  return strQuery;
//}

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
      "dojo/data/ItemFileReadStore",
  ], function (
      declare, lang, esriRequest, IdentityManager, FeatureLayer, FeatureTable,
      domConstruct, dom, parser, ready, on,
      registry, Query, DataGrid, ItemFileReadStore
) {
      return declare([], {
          arrayProjectIDs: [],
          strURL: null,
          m_iarrayQueryIndex: null,
          m_arrayQuery: null,
          m_grid: null,
          m_EventAdded2Grid: false,
          strQuery: null,
          m_arrayUserRemovedPrjs: [],

          constructor: function (options) {
              this.strURL = options.strURL || "www.cnn.com"; // default AGS REST URL
          },
          SendQuery: function (arrayQuery, iarrayQueryIndex) {
              if (arrayQuery.length > 0) {
                  this.m_arrayQuery = arrayQuery;
                  this.m_iarrayQueryIndex = iarrayQueryIndex;

                  if (iarrayQueryIndex == 0) {
                      this.arrayProjectIDs = [];  //clear out the array if index is zero
                  }

                  pTblindexAndQuery = arrayQuery[iarrayQueryIndex];
                  var iIndex = pTblindexAndQuery[0];
                  var strQuery = pTblindexAndQuery[1];
                  var queryTask = new esri.tasks.QueryTask(this.strURL + "/" + iIndex.toString() + "?returnDistinctValues=true");
                  var pQuery = new Query();
                  pQuery.returnGeometry = false;
                  pQuery.outFields = ["ProjectID"];

                  if (this.arrayProjectIDs.length > 0) {
                      strQuery = "(" + strQuery + ") and (ProjectID in (" + this.arrayProjectIDs.join(",") + "))";
                  }
                  //                  if (this.arrayProjectIDs.length > 25) {
                  //                      strQuery2ndTry4Shorter = "(" + strQuery + ") and (ProjectID in (" + this.arrayProjectIDs.join(",") + "))";
                  //                  }


                  if (this.m_arrayUserRemovedPrjs.length > 0) {  //if user's right clicked and removed a row then don't include
                      strQuery += " and (not (ProjectID in (" + this.m_arrayUserRemovedPrjs.join(",") + ")))";
                  }

                  pQuery.where = strQuery;
                  queryTask.execute(pQuery, this.SendQueryResults, this.err);
              } else {  // if not query filters query all the values

                  this.SendQuery4ProjectResults("OBJECTID > 0", this.m_grid);
                  //                  this.m_grid.on("rowclick", onRowClickHandler);
                  var tmp = "";
              }
          },

          SendQueryResults: function (results) {
              var resultFeatures = results.features;
              if ((resultFeatures != null) && (resultFeatures != undefined)) {
                  if (resultFeatures.length > 0) {
                      var tempValue;
                      var arrayValues = [];
                      var testVals = {};

                      dojo.forEach(resultFeatures, function (feature) {  //Loop through the QueryTask results and populate an array with the unique values
                          tempValue = feature.attributes.ProjectID;
                          if (tempValue == undefined) {
                              tempValue = feature.attributes.projectid;
                          }
                          if (!testVals[tempValue]) {
                              testVals[tempValue] = true;
                              var CheckedValue = tempValue;
                              arrayValues.push(CheckedValue); //values.push({ name: zone });//values.push("'" + strValue + "'"); //values.push({ name: zone });
                          }
                      });
                      this.app.gQuery.arrayProjectIDs = arrayValues;
                      this.app.gQuery.m_iarrayQueryIndex += 1; //increment the index value of the query array by 1



//                      if (arrayValues.length < 15) {
                      this.app.gQuery.strQuery = "ProjectID in (" + arrayValues.join(",") + ")";  //!!!!!!!!!!!!!!!!!!this gets used for the summary and the gis layer
//                      } else {
//                          this.app.gQuery.strQuery = returnRangeStringQuery("ProjectID", arrayValues);
//                      }

//                      alert(this.app.gQuery.strQuery);

                      if (this.app.gQuery.m_iarrayQueryIndex >= this.app.gQuery.m_arrayQuery.length) {
                          this.app.gQuery.ClearDivs();
                          this.app.gQuery.SendQuery4ProjectResults(this.app.gQuery.strQuery, this.app.gQuery.m_grid);  //reset the entire search page

                      } else {
                          this.app.gQuery.SendQuery(this.app.gQuery.m_arrayQuery, this.app.gQuery.m_iarrayQueryIndex);  //append the the existing search page projects
                      }
                  }
              }
              else {
                  // do nothing
              }
          },

          ClearDivs: function () {
              document.getElementById('dTotalAllocatedbyLCC').innerHTML = "";
              document.getElementById('dTotalAllocatedbyLCCbyYear').innerHTML = "";
              document.getElementById('dNumberOfFundingRecipients').innerHTML = "";
              document.getElementById('dFundRecipientTypes').innerHTML = "";
              //              document.getElementById('dYearsFunded').innerHTML = "";
              document.getElementById('dNumberOfProjectContacts').innerHTML = "";
              document.getElementById('dTotalInKindMatch').innerHTML = "";
              document.getElementById('dNumberofInKindOrgs').innerHTML = "";
              document.getElementById('dTotalNumberofConsvTargets').innerHTML = "";
              document.getElementById('dEcotypicAreas').innerHTML = "";
              document.getElementById('dStressors').innerHTML = "";
              document.getElementById('dGoals').innerHTML = "";
              document.getElementById('dNumberofDeliverables').innerHTML = "";
              document.getElementById('dDeliverabletype').innerHTML = "";
              document.getElementById('dPrjStatus').innerHTML = "";
          },


          SendQuery4ProjectResults: function (strQuery, pGrid) {
              this.ClearDivs();
              document.getElementById("ImgResultsLoading").style.visibility = "visible";
              //              if (app.pMapSup != undefined) {
              //                  app.pMapSup.QueryZoom(strQuery);
              //              }
              this.m_grid = pGrid
              var queryTask = new esri.tasks.QueryTask(this.strURL + "/0");
              var pQuery = new Query();
              pQuery.returnGeometry = false;
              pQuery.outFields = ["ProjectID", "Prj_Title", "Fiscal_Years_of_Allocation", "PI_Org", "OBJECTID", "LeadName_LastFirst"];
              pQuery.where = strQuery;
              var items = [];
              var gSup = app.gSup;
              strURL = this.strURL;
              var gQuerySummary = app.gQuerySummary;

              if (!this.m_EventAdded2Grid) {  //if don't put this logic in then keeps on adding the click event to the data grid and gets repetitive
                  pGrid.on("rowclick", onRowClickHandler);
                  this.m_EventAdded2Grid = true;
              }
              dojo.connect(queryTask, "onComplete", function (featureSet) {
                  var items = dojo.map(featureSet.features, function (feature) {                  //build an array of attributes
                      return feature.attributes;
                  });
                  var data = { identifier: "OBJECTID", items: items };
                  store = new ItemFileReadStore({ data: data });
                  pGrid.setStore(store);
                  gSup.Phase1(strURL, [], strQuery);
                  gQuerySummary.Summarize(strQuery);
              });
              queryTask.execute(pQuery);
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

