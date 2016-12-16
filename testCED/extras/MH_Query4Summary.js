﻿//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2016


function disableOrEnableFormElements(strFormName, strElementType, TorF) {
    var pform = document.getElementById(strFormName);   // enable all the dropdown menu's while queries are running
    for (var i = 0; i < pform.elements.length; i++) {
        if (pform.elements[i].type == strElementType) {
            strID = pform.elements[i].id;
            document.getElementById(strID).disabled = TorF;
        }
    }
}


function disableOrEnableFormElements(strFormName, strElementType, TorF) {
    var pform = document.getElementById(strFormName);   // enable all the dropdown menu's while queries are running
    for (var i = 0; i < pform.elements.length; i++) {
        if (pform.elements[i].type == strElementType) {
            strID = pform.elements[i].id;
            document.getElementById(strID).disabled = TorF;
        }
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
      "dojo/data/ItemFileReadStore",
], function (
      declare, lang, esriRequest, IdentityManager, FeatureLayer, FeatureTable,
      domConstruct, dom, parser, ready, on,
      registry, Query, DataGrid, ItemFileReadStore
) {

    function sortFunction(a, b) {
        //          var textA = a.T.toUpperCase();
        //          var textB = b.T.toUpperCase();
        var textA = a.T;
        var textB = b.T;
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    }

    return declare([], {
        strURL: null,
        m_iarrayQueryIndex: null,
        m_arrayQuery: null,
        m_query4SummaryMap: null,
        iTempIndexSubmit: 0,
        iTempIndexResults: 0,
        constructor: function (options) {
            this.strURL = options.strURL || "www.cnn.com"; // default AGS REST URL
        },

        Summarize: function (strQuery) {
            document.getElementById("ImgResultsLoading").style.visibility = "visible";
            disableOrEnableFormElements("dropdownForm", 'select-one', true) //disable/enable to avoid user clicking query options during pending queries
            disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries

            //table/fc index, query string, field 4 aggregation, stat type (count, sum, avg), group by field, html ID, string function
            arrayQuery = [];

            strQuery = strQuery.replace(" and ((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1))", "");
            if (strQuery == "(SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)") {
                strQuery = "objectid > 0";
            }

            this.m_query4SummaryMap = strQuery;
            arrayQuery.push(["0", strQuery, "totalacres", "sum", "", "dTotalAcresQ", '{0}', "commas-no-round-decimal", ""]);
            //arrayQuery.push(["6", strQuery, "amount", "sum", "Fund_Year", "dTotalAllocatedbyLCCbyYear", '<b>GNLCC Funds Allocated by Year:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}     ', "show both-currency", "desc"]);
            //arrayQuery.push(["7", strQuery, "InKindamount", "sum", "Fund_Year", "dTotalInKindMatchbyYear", '<b>In-Kind or Match Funding by Year:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}     ', "show both-currency", "desc"]);
            //arrayQuery.push(["0", strQuery, "Total_Matching_or_In_kind_Funds", "sum", "", "dTotalInKindMatch", '<b>In-Kind or Match Funding:</b> {0} ', "currency", ""]);
            //arrayQuery.push(["7", strQuery, "ProjectID", "count", "orgname", "dNumberofInKindOrgs", '<b>Organizations Providing In-Kind or Match Funding:</b> {0} ', "countOfGroupBy", ""]);
            //arrayQuery.push(["1", strQuery, "ProjectID", "count", "CommonName", "dTotalNumberofConsvTargets", '<b>Conservation Targets:</b> {0} ', "countOfGroupBy", ""]);
            ////              arrayQuery.push(["6", strQuery, "ProjectID", "count", "Fund_Year", "dYearsFunded", 'Fund Years: \n<br>  {0} ', "default"]);
            //arrayQuery.push(["9", strQuery, "ProjectID", "count", "contactID", "dNumberOfProjectContacts", '<b>Contacts:</b> {0} ', "countOfGroupBy", ""]);
            //arrayQuery.push(["2", strQuery, "ProjectID", "count", "NationalLCCDelivType", "dDeliverabletype", '<b>Deliverable Types:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0} ', "show both", "asc"]);
            //arrayQuery.push(["2", strQuery, "ProjectID", "count", "", "dNumberofDeliverables", '<b>Deliverables:</b> {0} ', "default", ""]);
            //arrayQuery.push(["0", strQuery, "ProjectID", "count", "PrjStatus", "dPrjStatus", '<b>Project Status:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0} ', "show both", ""]);
            //arrayQuery.push(["5", strQuery, "ProjectID", "count", "dest_orgname", "dNumberOfFundingRecipients", '<b>Funding Recipient Organizations:</b> {0} ', "countOfGroupBy", ""]);
            ////arrayQuery.push(["5", strQuery, "ProjectID", "count", "DestinationType", "dFundRecipientTypes", '<b>Funding Recipient Types:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0} ', "show both", "asc"]);
            //arrayQuery.push(["5", strQuery, "amount", "sum", "DestinationType", "dFundRecipientTypes", '<b>Funding Recipient Types:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}     ', "show both-currency", "desc"]);
            //arrayQuery.push(["7", strQuery, "InKindamount", "sum", "Contact_Type", "dInKindFundingTypes", '<b>InKind/Match Provider Types:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}     ', "show both-currency", "desc"]);
            //arrayQuery.push(["4", strQuery, "ProjectID", "count", "EcotypicAreaName", "dEcotypicAreas", '<b>Ecotypic Areas (Partner Forums):</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0} ', "show both", "asc"]);
            //arrayQuery.push(["11", strQuery, "ProjectID", "count", "Stressor", "dStressors", '<b>Stressors:</b>  \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both", "asc"]);
            //arrayQuery.push(["8", strQuery, "ProjectID", "count", "GoalName", "dGoals", '<b>Conservation Goals:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0} ', "show both", "asc"]);

            this.m_arrayQuery = arrayQuery;
            this.SendQuery(arrayQuery, 0)
        },


        SendQuery: function (arrayQuery, iarrayQueryIndex) {
            this.iTempIndexSubmit += 0;
            
            this.m_iarrayQueryIndex = iarrayQueryIndex;
            pTblindexAndQuery = arrayQuery[iarrayQueryIndex];

            var iTableIndex = pTblindexAndQuery[0];
            var strQuery = pTblindexAndQuery[1];
            var pQueryTask = new esri.tasks.QueryTask(this.strURL + iTableIndex);
            //var pQueryTask = new esri.tasks.QueryTask(this.strURL + "/" + iTableIndex);
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
                //pQuery.groupByFieldsForStatistics = [strGroupByField];
                //pQuery.orderByFields = [strGroupByField + " DESC"];
                pQuery.orderByFields = [strGroupByField + " ASC"];
            }

            pQuery.outStatistics = [pstatDef];
            console.log(iarrayQueryIndex, iarrayQueryIndex);


            return pQueryTask.execute(pQuery, this.returnEvents, this.err);
        },


        returnEvents: function (results) {
            this.iTempIndexResults += 1;

            pTblindexAndQuery = this.app.gQuerySummary.m_arrayQuery[this.app.gQuerySummary.m_iarrayQueryIndex];

            if (pTblindexAndQuery != undefined) {  //no idea why this return events is getting called twice
                
                var strStatisticType = pTblindexAndQuery[3];
                var strFieldNameText = pTblindexAndQuery[2];
                var strGroupByField = pTblindexAndQuery[4];
                var strHTMLElementID = pTblindexAndQuery[5];
                var strStringFormatting = pTblindexAndQuery[6];
                var strVarType = pTblindexAndQuery[7];
                var strSortType = pTblindexAndQuery[8];
                var div = document.getElementById(strHTMLElementID);
                var resultFeatures = results.features;

                if (strSortType == "desc") {
                    resultFeatures = results.features.reverse(function (a, b) {
                        var textA = a.attributes[strGroupByField].toString().toUpperCase();
                        var textB = b.attributes[strGroupByField].toString().toUpperCase();
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
                } else if (strSortType == "asc") {
                    resultFeatures = results.features.sort(function (a, b) {
                        var textA = a.attributes[strGroupByField].toString().toUpperCase();
                        var textB = b.attributes[strGroupByField].toString().toUpperCase();
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
                }

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
                                    if ((feature.attributes[an] == null) | (feature.attributes[an] == undefined)) {
                                        strText = "TBD";
                                    } else {
                                        var strText = feature.attributes[an].toString();
                                    }
                                    if (((strGroupByField != "") & (an == "genericstat") & (strVarType != "show both") & (strVarType != "show both-currency")) | (strText == "")) {
                                        //values.push(strText);
                                        //do nothing
                                    } else if ((strStatisticType == "count") & (strVarType == "default")) {
                                        strText += "\n<br>&nbsp;&nbsp;&nbsp;";
                                        values.push(strText);
                                    } else if ((strVarType == "show both-currency") & (an == "genericstat")) {
                                        var iTempNumber = Number(strText);
                                        strText = iTempNumber.toCurrencyString() + "\n<br>&nbsp;&nbsp;&nbsp;";
                                        values.push(strText);
                                    } else if ("commas-no-round-decimal") {
                                        var iTempNumber = Number(strText);
                                        iTempNumber = Math.round(iTempNumber);
                                        strText = iTempNumber.toCurrencyString().replace("$", "");
                                        values.push(strText);
                                    } else if ((strVarType == "show both") & (an == "genericstat")) {
                                        //                                      var iTempNumber = Number(strText);
                                        strText = "(" + strText + ")\n<br>&nbsp;&nbsp;&nbsp;";
                                        values.push(strText);
                                    } else {
                                        values.push(strText);
                                    }

                                });
                            });
                        }
                    }

                    if ((values == null) | (values == undefined)) {
                        strText = "no results";
                    } else {
                        strText = values.join(" ");
                    }
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

                    document.getElementById("ImgResultsLoading").style.visibility = "hidden";

                    disableOrEnableFormElements("dropdownForm", 'select-one', false) //disable/enable to avoid user clicking query options during pending queries
                    disableOrEnableFormElements("dropdownForm", 'button', false);  //disable/enable to avoid user clicking query options during pending queries

                }
            }
            //return results;
        },

        err: function (err) {
            console.log("Failed to get stat results due to an error: " + this.app.gQuerySummary.iTempIndexSubmit + " " + this.app.gQuerySummary.iTempIndexResults, err);

            //this.app.pFC.numberOfErrors += 1;

            //if (this.app.pFC.numberOfErrors < 5) {
            //    this.app.pFC.GetCountOfFCDef_ShowText(this.app.pFC.pLayerStored, "txtQueryResults", "count", "project_id");
            //}
        }
    }
    );
}
);
