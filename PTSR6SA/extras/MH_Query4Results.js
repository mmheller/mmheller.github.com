//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014
function onRowClickHandler(evt) {
    var strProjectID = evt.grid.getItem(evt.rowIndex).ProjectID.toString();
    var strURL = "prj_report.html?PRJ_ID=" + strProjectID;
    window.open(strURL);
    //window.open(strURL, "_self");
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
          arryExtraPrjIDs4URLParam: [],
          arryExtraPrjIDs4URLParam2Remove: [],
          
          constructor: function (options) {
              this.strURL = options.strURL || "www.cnn.com"; // default AGS REST URL
              //this.arrayProjectIDs = options.strURL || [];
              this.arryExtraPrjIDs4URLParam = options.arryExtraPrjIDs4URLParam || []
              this.m_arrayUserRemovedPrjs = options.m_arrayUserRemovedPrjs || [];

          },

          SendQuery2: function (arrayQuery, iarrayQueryIndex, pGrid) {
            this.m_grid = pGrid;
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
            //if (this.arrayProjectIDs.length > 0) {  !!!!!!!!!!!!!don't do this when handleing url parameters and the 1st of queries
            //    strQuery = "(" + strQuery + ") and (ProjectID in (" + this.arrayProjectIDs.join(",") + "))";
            //}
            if (this.m_arrayUserRemovedPrjs.length > 0) {  //if user's right clicked and removed a row then don't include
                strQuery += " and (not (ProjectID in (" + this.m_arrayUserRemovedPrjs.join(",") + ")))";
            }

            pQuery.where = strQuery;
            queryTask.execute(pQuery, this.SendQueryResults, this.err);
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
                  if (this.m_arrayUserRemovedPrjs.length > 0) {  //if user's right clicked and removed a row then don't include
                      strQuery += " and (not (ProjectID in (" + this.m_arrayUserRemovedPrjs.join(",") + ")))";
                  }
                  pQuery.where = strQuery;
                  queryTask.execute(pQuery, this.SendQueryResults, this.err);
              } else {  // if not query filters query all the values
                  this.SendQuery4ProjectResults("OBJECTID > 0", this.m_grid);
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

                      if (this.app.gQuery.arryExtraPrjIDs4URLParam.length > 0) {   //////if id's passed via url then add for the query
                          arrayValues = arrayValues.concat(this.app.gQuery.arryExtraPrjIDs4URLParam)
                      }
                      this.app.gQuery.strQuery = "ProjectID in (" + arrayValues.join(",") + ")";  //!!!!!!!!!!!!!!!!!!this gets used for the summary and the gis layer
                      if (this.app.gQuery.m_iarrayQueryIndex >= this.app.gQuery.m_arrayQuery.length) {  //final query for projects
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
              document.getElementById('dTotalInKindMatchbyYear').innerHTML = "";
              document.getElementById('dNumberOfFundingRecipients').innerHTML = "";
              document.getElementById('dInKindFundingTypes').innerHTML = "";
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

