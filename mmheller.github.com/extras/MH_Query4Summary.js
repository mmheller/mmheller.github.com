//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014
//function onRowClickHandler(evt) {
//    var strProjectID = evt.grid.getItem(evt.rowIndex).ProjectID;
//    alert(strProjectID);
////    var selectedTaxLot = arrayUtils.filter(map.graphics.graphics, function (graphic)
////    { return ((graphic.attributes) && graphic.attributes.PARCELID === clickedTaxLotId); });
////    if (selectedTaxLot.length) {
////        map.setExtent(selectedTaxLot[0].geometry.getExtent(), true);
////    } 
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
          strURL: null,
          m_iarrayQueryIndex: null,
          m_arrayQuery: null,
          constructor: function (options) {
              this.strURL = options.strURL || "www.cnn.com"; // default AGS REST URL
          },

          Summarize: function (strQuery) {
              //table/fc index, query string, field 4 aggregation, stat type (count, sum, avg), group by field, html ID, string function
              arrayQuery = [];
              arrayQuery.push(["0", strQuery, "ProjectID", "count", "", "page_collapsible1", 'Results ({0} projects)', ""]);
              arrayQuery.push(["0", strQuery, "Total__Funding_by_Your_LCC", "sum", "", "dTotalAllocatedbyLCC", 'Total Funds Allocated by GNLCC: {0} ', "currency"]);
              arrayQuery.push(["6", strQuery, "amount", "sum", "Fund_Year", "dTotalAllocatedbyLCCbyYear", 'Total Funds Allocated by GNLCC by Year: \n<br> {0} ', "show both"]);
              arrayQuery.push(["0", strQuery, "Total_Matching_or_In_kind_Funds", "sum", "", "dTotalInKindMatch", 'Total Partner In-Kind or Match Funding: {0} ', "currency"]);
              arrayQuery.push(["7", strQuery, "ProjectID", "count", "orgname ", "dNumberofInKindOrgs", 'Partner Organizations Providing In-Kind or Match Funding: {0} ', "countOfGroupBy"]);
              arrayQuery.push(["1", strQuery, "ProjectID", "count", "CommonName", "dTotalNumberofConsvTargets", 'Total Number of Consv Targets: {0} ', "countOfGroupBy"]);
              arrayQuery.push(["6", strQuery, "ProjectID", "count", "Fund_Year", "dYearsFunded", 'Fund Years: {0} ', ""]);
              arrayQuery.push(["9", strQuery, "ProjectID", "count", "contactID", "dNumberOfProjectContacts", 'Number of Project Contacts: {0} ', "countOfGroupBy"]);
              arrayQuery.push(["2", strQuery, "ProjectID", "count", "DelivType", "dDeliverabletype", 'Deliverable Types: {0} ', ""]);
              arrayQuery.push(["2", strQuery, "ProjectID", "count", "", "dNumberofDeliverables", 'Number of Deliverables: {0} ', ""]);
              arrayQuery.push(["0", strQuery, "ProjectID", "count", "PrjStatus", "dPrjStatus", 'Project Status: {0} ', ""]);
              arrayQuery.push(["5", strQuery, "ProjectID", "count", "dest_orgname", "dNumberOfFundingRecipients", 'Number of Funding Recipient Organizations: {0} ', "countOfGroupBy"]);
              arrayQuery.push(["5", strQuery, "ProjectID", "count", "DestinationType", "dFundRecipientTypes", 'Funding Recipient Types: {0} ', ""]);
              arrayQuery.push(["4", strQuery, "ProjectID", "count", "EcotypicAreaName", "dEcotypicAreas", 'Ecotypic (Partner Forum) Areas: {0} ', ""]);
              arrayQuery.push(["11", strQuery, "ProjectID", "count", "Stressor", "dStressors", 'Stressors: {0} ', ""]);
              arrayQuery.push(["8", strQuery, "ProjectID", "count", "GoalName", "dGoals", 'Goals: {0} ', ""]);



              this.m_arrayQuery = arrayQuery;
              this.SendQuery(arrayQuery, 0)
          },

          SendQuery: function (arrayQuery, iarrayQueryIndex) {
              this.m_iarrayQueryIndex = iarrayQueryIndex;
              pTblindexAndQuery = arrayQuery[iarrayQueryIndex];

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
              console.log(iarrayQueryIndex, iarrayQueryIndex);


              return pQueryTask.execute(pQuery, this.returnEvents, this.err);
          },

          returnEvents: function (results) {
              pTblindexAndQuery = this.app.gQuerySummary.m_arrayQuery[this.app.gQuerySummary.m_iarrayQueryIndex];
              //              var strQuery = pTblindexAndQuery[1];
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
                                  if (this.app.gQuerySummary.m_iarrayQueryIndex == 10) {
                                      temp = "";
                                  }

                                  if (feature.attributes[an] == null) {
                                      strText = "null or undefined";
                                  } else {
                                      var strText = feature.attributes[an].toString();
                                  }
                                  //                                  if ((strText == null) || (strText == undefined)) {
                                  if (strText == undefined) {
                                      strText = "null or undefined";
                                  }

                                  if ((strGroupByField != "") & (an == "genericstat") & (strVarType != "show both")) {
                                      //values.push(strText);
                                  } else {
                                      if ((strVarType == "show both") & (an == "genericstat")) {
                                          var iTempNumber = Number(strText);
                                          strText = iTempNumber.toCurrencyString() + "\n<br>";
                                      }
                                      values.push(strText);
                                  }
                              });
                          });
                      }
                  }
                  strText = values.join(" ");
              }

              if (strVarType == "currency") {
                  var iTempNumber = Number(strText);
                  strText = iTempNumber.toCurrencyString();
              }

              if (strHTMLElementID == "page_collapsible1") {  // have to treat writing the collapsible content different becuase otherwise will loos 
                  var str_divinnerHTML = div.innerHTML;
                  str_divinnerHTML = "Results (" + strText + " projects) <span></span>";
                  div.innerHTML = str_divinnerHTML;
              } else {
                  div.innerHTML = strStringFormatting.format(strText);
              }

              //pTblindexAndQuery = this.app.gQuerySummary.m_arrayQuery[this.app.gQuerySummary.m_iarrayQueryIndex];
              this.app.gQuerySummary.m_iarrayQueryIndex += 1
              if (this.app.gQuerySummary.m_iarrayQueryIndex < this.app.gQuerySummary.m_arrayQuery.length) {
                  this.app.gQuerySummary.SendQuery(this.app.gQuerySummary.m_arrayQuery, this.app.gQuerySummary.m_iarrayQueryIndex)
              }
              else {
                  //loop through the checkboxes and enable, so user interaction dosen't disrupt the queryies
                  arrayCheckedCheckboxes = [];
                  var pform = document.getElementById("NavigationForm");
                  for (var i = 0; i < pform.elements.length; i++) {
                      if (pform.elements[i].type == 'checkbox') {
                          strID = pform.elements[i].id;
                          document.getElementById(strID).disabled = false;
                      }
                  }


              }
              return results;
          },
          err: function (err) {
              console.log("Failed to get stat results due to an error: ", err);
              //loop through the checkboxes and enable, so user interaction dosen't disrupt the queryies
              arrayCheckedCheckboxes = [];
              var pform = document.getElementById("NavigationForm");
              for (var i = 0; i < pform.elements.length; i++) {
                  if (pform.elements[i].type == 'checkbox') {
                      strID = pform.elements[i].id;
                      document.getElementById(strID).disabled = false;
                  }
              }


          }
      }
    )
    ;

  }
);


