//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2016


function disableOrEnableFormElements(strFormName, strElementType, TorF, pDocument) {
    var pform = pDocument.getElementById(strFormName);   // enable all the dropdown menu's while queries are running
    for (var i = 0; i < pform.elements.length; i++) {
        if (pform.elements[i].type == strElementType) {
            strID = pform.elements[i].id;
            pDocument.getElementById(strID).disabled = TorF;
        }
    }
}


//function disableOrEnableFormElements(strFormName, strElementType, TorF) {
//    var pform = document.getElementById(strFormName);   // enable all the dropdown menu's while queries are running
//    for (var i = 0; i < pform.elements.length; i++) {
//        if (pform.elements[i].type == strElementType) {
//            strID = pform.elements[i].id;
//            document.getElementById(strID).disabled = TorF;
//        }
//    }
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
        mNewDoc: null,
        constructor: function (options) {
            this.strURL = options.strURL || "www.cnn.com"; // default AGS REST URL
        },

        Summarize: function (strQuery, blnOpenEntireSummary) {
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

            if (blnOpenEntireSummary) {
                var pNewWindow = window.open("CEDPSummary.html");
                this.mNewDoc = pNewWindow.document;
                arrayQuery.push(["0", strQuery + " and (typeact = 'Project')", "Project_ID", "count", "", "dTotalProjects", '<b>&nbspTotal Number of Projects:</b> {0}', "", ""]);
                arrayQuery.push(["0", strQuery + " and (typeact = 'Plan')", "Project_ID", "count", "", "dTotalPlans", '<b>&nbspTotal Number of Plans:</b> {0}', "", ""]);
                

                arrayQuery.push(["0", strQuery, "totalacres", "sum", "", "dTotalAcresQ2", '<b>&nbspTotal Acres:</b> {0}', "commas-no-round-decimal", ""]);

                arrayQuery.push(["0", strQuery, "Project_ID", "count", "Implementing_Party", "dNumofDistinctImpParties", '<b>Number of Unique Implementing Parties:</b> {0}', "countOfGroupBy", ""]);
                arrayQuery.push(["0", strQuery, "totalacres", "sum", "Implementing_Party", "dTotalAcresQ2byImplementing_Party", '<b>Total Acres by Implementing Party:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID", "count", "Implementing_Party", "dNumberOfRecordsbyImpParty", '<b>Number of Projects/Plans by Implementing Party:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both", ""]);

                arrayQuery.push(["0", strQuery, "Project_ID", "count", "Activity", "dNumofDistinctActivities", '<b>Number of Unique Activities:</b> {0}', "countOfGroupBy", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID", "sum", "Activity", "dTotalAcresQ2byActivity", '<b>Total Acres by Activity:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID", "count", "Activity", "dNumberOfRecordsbyActivity", '<b>Number of Projects/Plans by Activity:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both", ""]);

                arrayQuery.push(["0", strQuery, "Project_ID", "count", "Office", "dNumofDistinctOffices", '<b>Number of Unique Offices:</b> {0}', "countOfGroupBy", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID", "sum", "Office", "dTotalAcresQ2byOffice", '<b>Total Acres by Office:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID", "count", "Office", "dNumberOfRecordsbyOffice", '<b>Number of Projects/Plans by Office:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both", ""]);

                arrayQuery.push(["0", strQuery, "Project_ID", "count", "SubActivity", "dNumofDistinctSubActivities", '<b>Number of Unique Sub-Activities:</b> {0}', "countOfGroupBy", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID", "sum", "SubActivity", "dTotalAcresQ2bySubActivity", '<b>Total Acres by SubActivity:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID", "count", "SubActivity", "dNumberOfRecordsbySubActivity", '<b>Number of Projects/Plans by SubActivity:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both", ""]);

                arrayQuery.push(["9", app.PS_Uniques.strQuery1, "Project_ID", "count", "State", "dNumberofOverlappingStates", '<b>Number of Overlapping States:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both", ""]);
                arrayQuery.push(["3", app.PS_Uniques.strQuery1, "Project_ID", "count", "WAFWA_Zone", "dNumberofOverlappingMngmtZones", '<b>Number of Overlapping Management Zones:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both", ""]);
                arrayQuery.push(["8", app.PS_Uniques.strQuery1, "Project_ID", "count", "Pop_Name", "dNumberofOverlappingPopAreas", '<b>Number of Overlapping Population Areas:</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both", ""]);

            } else {
                arrayQuery.push(["0", strQuery, "totalacres", "sum", "", "dTotalAcresQ", '{0}', "commas-no-round-decimal", ""]);
            }

            this.m_arrayQuery = arrayQuery;
            this.SendQuery(arrayQuery, 0)
        },


        SendQuery: function (arrayQuery, iarrayQueryIndex) {
            if (iarrayQueryIndex == 15) {
                var tempstop = 1;
            }

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

                if (div == undefined){
                    var div = this.app.gQuerySummary.mNewDoc.getElementById(strHTMLElementID);
                }

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

                                    if (this.app.gQuerySummary.m_iarrayQueryIndex == 1) {
                                        var tempstop = 1;
                                    }


                                    if (((strGroupByField != "") & (an == "genericstat") & (strVarType != "show both") & (strVarType != "show both-commas-no-round-decimal")) | (strText == "")) {
                                        //values.push(strText);
                                        //do nothing
                                    } else if ((strStatisticType == "count") & (strVarType == "default")) {
                                        strText += "\n<br>&nbsp;&nbsp;&nbsp;";
                                        values.push(strText);
                                    } else if ((strVarType == "show both-currency") & (an == "genericstat")) {
                                        var iTempNumber = Number(strText);
                                        strText = iTempNumber.toCurrencyString() + "\n<br>&nbsp;&nbsp;&nbsp;";
                                        values.push(strText);
                                    } else if ((strVarType == "show both-commas-no-round-decimal") & (an == "genericstat")) {
                                        var iTempNumber = Number(strText);
                                        iTempNumber = Math.round(iTempNumber);
                                        strText = iTempNumber.toCurrencyString().replace("$", "") + "\n<br>&nbsp;&nbsp;&nbsp;";
                                        values.push(strText);
                                    } else if ((strVarType == "commas-no-round-decimal") & (an == "genericstat")) {
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
                    if (document.getElementById("ImgResultsLoading") != undefined) {
                        document.getElementById("ImgResultsLoading").style.visibility = "hidden";
                        disableOrEnableFormElements("dropdownForm", 'select-one', false, document) //disable/enable to avoid user clicking query options during pending queries
                        disableOrEnableFormElements("dropdownForm", 'button', false, document);  //disable/enable to avoid user clicking query options during pending queries
                    }
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

