//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2016


// You could either use a function similar to this or pre convert an image with for example http://dopiaza.org/tools/datauri
// http://stackoverflow.com/questions/6150289/how-to-convert-image-into-base64-string-using-javascript
function imgToBase64(url, callback, imgVariable) {
    if (!window.FileReader) {
        callback(null);
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            imgVariable = reader.result.replace('text/xml', 'image/jpeg');
            callback(imgVariable);
        };
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
};


function headerFooterFormatting(doc, totalPages) {
    for (var i = totalPages; i >= 1; i--) {
        doc.setPage(i);
        header(doc);                //header
        footer(doc, i, totalPages);
        doc.page++;
    }
};

function header(doc) {
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.setFontStyle('normal');
    if (app.base64Img1) {
        doc.addImage(app.base64Img1, 'JPEG', pdfMargins.left, 10, 130, 20);
    }
    if (app.base64Img2) {
        doc.addImage(app.base64Img2, 'JPEG', 175, 10, 80, 20);
    }
    if (app.base64Img3) {
        doc.addImage(app.base64Img3, 'JPEG', 260, 10, 80, 20);
    }
    if (app.base64ImgMap) {
        doc.addImage(app.base64ImgMap, 'JPEG', 350, 10, 80, 20);
    }
    doc.text("CED Report", pdfMargins.left + 450, 30);
    doc.setLineCap(2);
    doc.line(pdfMargins.left, 40, pdfMargins.width - pdfMargins.left, 40); // horizontal line
};


function footer(doc, pageNumber, totalPages) {
    var str = "Page " + pageNumber + " of " + totalPages
    doc.setFontSize(10);
    doc.text(str, pdfMargins.left, doc.internal.pageSize.height - 20);
};


function printErr(err) {
    console.log("Failed to print due to an error: " + err);
};

function startExport2PDF() {
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.setFontSize(18);

    if (app.base64ImgMap) {
        //doc.addImage(app.base64ImgMap, 'JPEG', 350, 10, 80, 20);
        //pdf.addImage(app.base64ImgMap, 'JPEG', pdfMargins.left, 50, pdfMargins.left + 604, 284 + 50);
        pdf.addImage(app.base64ImgMap, 'JPEG', pdfMargins.left, 90, pdfMargins.left + 520, 244 + 20);

        pdf.setFontSize(12);
        pdf.text("Note: Some overlapping area efforts may not be visible in PDF map", pdfMargins.left, 400);
        pdf.setFontSize(18);
    }

    pdf.text("Conservation Efforts Database v2.1", pdfMargins.left, 60);
    pdf.text("Interactive Map - Summary Report", pdfMargins.left, 80);

    pdf.fromHTML(document.getElementById('html-2-pdfwrapper'),
        pdfMargins.left, // x coord
        pdfMargins.top + 390,
        {
            width: pdfMargins.width// max width of content on PDF
        }, function (dispose) {
            headerFooterFormatting(pdf, pdf.internal.getNumberOfPages());
        },
        pdfMargins);

    document.getElementById("ImgResultsLoading").style.visibility = "hidden";
    pdf.save("CEDReport.pdf");
};

function disableOrEnableFormElements(strFormName, strElementType, TorF, pDocument) {
    var pform = pDocument.getElementById(strFormName);   // enable all the dropdown menu's while queries are running
    for (var i = 0; i < pform.elements.length; i++) {
        if (pform.elements[i].type == strElementType) {
            strID = pform.elements[i].id;
            pDocument.getElementById(strID).disabled = TorF;
        }
    }
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function getRanges(array) {
    var ranges = [], rstart, rend;
    for (var i = 0; i < array.length; i++) {
        rstart = array[i];
        rend = rstart;
        while (array[i + 1] - array[i] == 1) {
            rend = array[i + 1]; // increment the index if the numbers sequential
            i++;
        }
        ranges.push(rstart == rend ? rstart + '' : rstart + '-' + rend);
    }
    return ranges;
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
  "esri/tasks/PrintTask", "esri/tasks/PrintTemplate", "esri/tasks/PrintParameters",
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
      "dojo/data/ItemFileReadStore", "esri/config", 
      "dojo/date/locale"
], function (
      declare,
      PrintTask, PrintTemplate, PrintParameters,
      lang, esriRequest, IdentityManager, FeatureLayer, FeatureTable,
      domConstruct, dom, parser, ready, on,
      registry, Query, DataGrid, ItemFileReadStore, esriConfig
) {

    function sortFunction(a, b) {
        //          var textA = a.T.toUpperCase();
        //          var textB = b.T.toUpperCase();
        var textA = a.T;
        var textB = b.T;
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    }

    function formatDate(value) {
        if (value) {
            var inputDate = new Date(value);
            return dojo.date.locale.format(inputDate, {
                selector: 'date',
                datePattern: 'MM/dd/yyyy HH:mm:ss'
            });

            
        } else {
            return "";
        }
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


        Summarize: function (strQuery, strQuery2, blnOpenEntireSummary) {
            document.getElementById("ImgResultsLoading").style.visibility = "visible";
            disableOrEnableFormElements("dropdownForm", 'select-one', true); //disable/enable to avoid user clicking query options during pending queries
            disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries

            arrayQuery = [];            //table/fc index, query string, field 4 aggregation, stat type (count, sum, avg), group by field, html ID, string function

            strQuery = strQuery.replace(" and (((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')))", "");
            if (strQuery == "((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))") {
                strQuery = "objectid > 0";
            }
            //strQuery = strQuery.replace(" and ((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1))", "");
            //if (strQuery == "(SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)") {
            //    strQuery = "objectid > 0";
            //}
            
            this.m_query4SummaryMap = strQuery;

            if (blnOpenEntireSummary) {
                arrayQuery.push(["12", "OBJECTID > 0", "LastDataProviderEdit", "Max", "", "dMaxLastDataProviderEdit", '<b>LAST APPROVED DATA PROVIDER EDIT:</b> {0}', "convert2date", ""]);
                arrayQuery.push(["12", "OBJECTID > 0", "ProcDate", "Max", "", "dMaxLastPubProc", '<b>LAST DATA REFRESH:</b> {0}', "convert2date", ""]);
                

                arrayQuery.push(["0", strQuery, "Project_ID,totalacres", "count,sum", "", "dTotalAcresQ2", '<b>ALL EFFORTS:</b> {0}', "commas-no-round-decimal", ""]);

                arrayQuery.push(["11", strQuery2, "GIS_Acres", "sum", "", "dTotalCalcAcresQ2", '{0} GIS calculated acres', "commas-no-round-decimal", ""]);

                arrayQuery.push(["0", strQuery + " and (typeact = 'Spatial Project')", "Project_ID,totalacres", "count,sum", "", "dTotalProjects", '<b>SPATIAL PROJECTS:</b> {0}', "", ""]);
                arrayQuery.push(["0", strQuery + " and (typeact = 'Non-Spatial Project')", "Project_ID,totalacres", "count,sum", "", "dTotalProjectsNon", '<b>NON-SPATIAL PROJECTS:</b> {0}', "", ""]);
                arrayQuery.push(["0", strQuery + " and (typeact = 'Non-Spatial Plan')", "Project_ID,totalacres", "count,sum", "", "dTotalPlans", '<b>NON-SPATIAL PLANS:</b> {0}', "", ""]);
                
                //////arrayQuery.push(["0", strQuery, "Project_ID", "count", "Implementing_Party", "dNumofDistinctImpParties", '<b>Number of Unique Implementing Parties:</b> {0}', "countOfGroupBy", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID,totalacres", "count,sum", "Implementing_Party", "dNumberOfRecordsbyImpParty", '<b>"NUMBER of EFFORTS AND TOTAL ACRES by IMPLEMENTING PARTY"</b><br>{0}', "show both-commas-no-round-decimal", ""]);
                //arrayQuery.push(["0", strQuery, "Project_ID,totalacres", "count,sum", "Implementing_Party", "dNumberOfRecordsbyImpParty", '{0}', "show both-commas-no-round-decimal", ""]);


                //////arrayQuery.push(["0", strQuery, "Project_ID", "count", "Activity", "dNumofDistinctActivities", '<b>Number of Unique Activities:</b> {0}', "countOfGroupBy", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID,totalacres", "count,sum", "Activity", "dNumberOfRecordsbyActivity", '<b>"NUMBER OF EFFORTS and TOTAL ACRES by ACTIVITY"</b><br>{0}', "show both-commas-no-round-decimal", ""]);

                //////arrayQuery.push(["0", strQuery, "Project_ID", "count", "Office", "dNumofDistinctOffices", '<b>Number of Unique Offices:</b> {0}', "countOfGroupBy", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID,totalacres", "count,sum", "Office", "dNumberOfRecordsbyOffice", '<b>"NUMBER of EFFORTS and TOTAL ACRES by OFFICE"</b><br>{0}', "show both-commas-no-round-decimal", ""]);

                ////arrayQuery.push(["0", strQuery, "Project_ID", "count", "SubActivity", "dNumofDistinctSubActivities", '<b>Number of Unique Sub-Activities:</b> {0}', "countOfGroupBy", ""]);
                arrayQuery.push(["0", strQuery, "Project_ID,totalacres", "count,sum", "SubActivity", "dNumberOfRecordsbySubActivity", '<p><b>"NUMBER of EFFORTS and TOTAL ACRES by SUBACTIVITY"</b><br>{0}</p>', "show both-commas-no-round-decimal", ""]);

                arrayQuery.push(["9", strQuery2, "Project_ID", "count", "State", "dNumberofOverlappingStates", '<b>"NUMBER of OVERLAPPING STATES"</b><br>{0}', "show both", ""]);
                arrayQuery.push(["11", strQuery2, "Project_ID,GIS_Acres", "count,sum", "State", "dGISStates", '<b>"NUMBER of EFFORTS and TOTAL ACRES by STATE"<br>(NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["3", strQuery2, "Project_ID", "count", "WAFWA_Zone", "dNumberofOverlappingMngmtZones", '<b>"NUMBER of OVERLAPPING MANAGEMENT ZONES"</b><br>{0}', "show both", ""]);
                arrayQuery.push(["8", strQuery2, "Project_ID", "count", "Pop_Name", "dNumberofOverlappingPopAreas", '<p><b>"NUMBER of OVERLAPPING POPULATION AREAS"</b>{0}</p>', "show both", ""]);

                arrayQuery.push(["13", strQuery2, "Project_ID,GIS_Acres", "count,sum", "RR_class_n", "dGISRMZ", '<b>"RESILIENCE and RESISTANCE"<br>(Total Number of Efforts and Associated Acres Included in Each Class - NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["14", strQuery2 + " and Symbol <> 'Unknown'", "Project_ID,GIS_Acres", "count,sum", "Symbol", "dGISAB", '<b>"CUMULATIVE PERCENT of GRSG POPULATION by MANAGEMENT ZONE"<br>(Total Number of Efforts and Associated Acres Included in Each Class - NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["15", strQuery2, "Project_ID,GIS_Acres", "count,sum", "class", "dGISBD", '<b>"GRSG BREEDING HABITAT PROBABILITY by MANAGEMENT ZONE"<br>(Total Number of Efforts and Associated Acres Included in Each Class - NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b>\n<br>;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["16", strQuery2 + " and Symbol <> 'N/A'", "Project_ID,GIS_Acres", "count,sum", "Symbol", "dGISBP", '<b>"GRSG BREEDING HABITAT PROBABILITY intersected with RESILIENCE and RESISTANCE CATEGORIES by MANAGEMENT ZONE"<br>(Total Number of Efforts and Associated Acres Included in Each Class - NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)<br>(Breeding Habitat - R&R Value)</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["17", strQuery2, "Project_ID,GIS_Acres", "count,sum", "EIS_HAB", "dGISGHMA", '<b>"NUMBER of TOTAL ACRES BY PROPOSED GRSG GENERAL HABITAT MANAGEMENT AREAS"<br>(NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["18", strQuery2, "Project_ID,GIS_Acres", "count,sum", "Mgmt_zone", "dGISMZ", '<b>"NUMBER of EFFORTS and TOTAL ACRES by WAFWA MANAGEMENT ZONES"<br>(NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["19", strQuery2, "Project_ID,GIS_Acres", "count,sum", "EIS_HAB", "dGISPHMA", '<b>"NUMBER of TOTAL ACRES BY PROPOSED GRSG PRIORITY HABITAT MANAGEMENT AREAS"<br>(NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["20", strQuery2, "Project_ID,GIS_Acres", "count,sum", "POPULATION", "dGISPoP", '<b>"NUMBER of EFFORTS and TOTAL ACRES by GRSG POPULATION AREAS"<br>(NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["21", strQuery2 + " and Symbol <> 'N/A'", "Project_ID,GIS_Acres", "count,sum", "Symbol", "dGISIDX", '<b>"NUMBER of EFFORTS and TOTAL ACRES by RESILIENCE and RESISTANCE AND POPULATION INDEX HIGH/LOW DENSITY CLASS"<br>(NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);
                arrayQuery.push(["10", strQuery2, "Project_ID,GIS_Acres", "count,sum", "ADMIN_AGEN", "dGISSMA", '<b>"NUMBER of EFFORTS and TOTAL ACRES by SURFACE MANAGEMENT AGENCY"<br>(NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;{0}', "show both-commas-no-round-decimal", ""]);

                arrayQuery.push(["22", strQuery2, "GIS_Acres", "sum", "", "dGISPACSum", '<b>"TOTAL ACRES within GRSG PRIORITY AREAS for CONSERVATION (PACs)"<br>(NOTE: Acreages are GIS Calculated and Results *Does Not* Include Point or Line Data)</b> \n<br>&nbsp;&nbsp;&nbsp;&nbsp;<i>{0}  acres</i>', "commas-no-round-decimal", ""]);
            } else {
                arrayQuery.push(["12", "OBJECTID > 0", "LastDataProviderEdit", "Max", "", "dFPMaxLastDataProviderEdit", '<font size="1px"><b>Last Approved Data Provider Edit:</b> {0}</font>', "convert2date", ""]);
                arrayQuery.push(["12", "OBJECTID > 0", "ProcDate", "Max", "", "dFPMaxLastPubProc", '<font size="1px"><b>Last Data Refresh:</b> {0}</font>', "convert2date", ""]);
                arrayQuery.push(["0", strQuery, "totalacres", "sum", "", "dTotalAcresQ", '{0}', "commas-no-round-decimal", ""]);
            }

            this.m_arrayQuery = arrayQuery;
            this.SendQuery(arrayQuery, 0)
        },

        StartPrinting: function (pMap) {
            esriConfig.defaults.io.corsEnabledServers.push("https://utility.arcgis.com")
            esriConfig.defaults.io.corsEnabledServers.push("https://services.arcgis.com")

            console.log("Starting printting map to .jpg");
            
            esriConfig.defaults.io.corsEnabledServers.push("https://sampleserver6.arcgisonline.com")

            var oWid = pMap.width;
            var oHgt = pMap.height;

            //var printTask = new PrintTask('https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task');
            var printTask = new PrintTask('https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task');
            //var printTask = new PrintTask('https://sampleserver6.arcgisonline.com/arcgis/rest/services/ExportWebMap/GPServer/Export_Web_Map');
            var template = new PrintTemplate();
            this.imgHeight = (740 / oWid) * oHgt;
            template.exportOptions = {
                width: 1542,
                height: (1542 / oWid) * oHgt,
                dpi: 150
            };

            //template.exportOptions = {
            //    width: 1542,
            //    height: (1542 / oWid) * oHgt,
            //    dpi: 200
            //};

            //template.format = "png32";
            //template.format = "jpg";
            template.format = "JPG";
            template.layout = "MAP_ONLY";
            template.preserveScale = false;
            template.showAttribution = false;
            var params = new PrintParameters();
            params.map = pMap;
            params.template = template;

            printTask.execute(params, this.printResult, this.printErr);
        },


        printResult: function (rsltURL) {
            app.base64ImgMap = null;
            imgToBase64(rsltURL.url, function (base64) {
                app.base64ImgMap = base64;                ////waiting for the callback to change the .jpg to base64 string,  base64 string is required for the PDF exporter
                
                if (app.base64ImgMap.indexOf("data:;base64,/9") >= 0) {     //// this is a work around, for some reason the 64base converter is sometimes not including the image/jpeg prefix
                    app.base64ImgMap = app.base64ImgMap.replace("data:;base64,/9", "data:image/jpeg;base64,/9");
                }
                startExport2PDF();
            });
        },
        

        SendQuery: function (arrayQuery, iarrayQueryIndex) {
            this.m_iarrayQueryIndex = iarrayQueryIndex;
            pTblindexAndQuery = arrayQuery[iarrayQueryIndex];
            var iTableIndex = pTblindexAndQuery[0];

            var strQuery = pTblindexAndQuery[1];
            var pQueryTask = new esri.tasks.QueryTask(this.strURL + iTableIndex);
            var pQuery = new esri.tasks.Query();
            strFieldNameText = pTblindexAndQuery[2];

            var array_QueryStatDefs = [];

            if (strFieldNameText.indexOf(",") > -1) {
                var strFieldNameText1 = strFieldNameText.substring(0, strFieldNameText.indexOf(","));
                var strFieldNameText2 = strFieldNameText.replace(strFieldNameText1 + ",", "");

                var strStateType = pTblindexAndQuery[3];
                var strStateType1 = strStateType.substring(0, strStateType.indexOf(","));
                var strStateType2 = strStateType.replace(strStateType1 + ",", "");

                var pstatDef1 = new esri.tasks.StatisticDefinition();
                pstatDef1.statisticType = strStateType1
                pstatDef1.onStatisticField = strFieldNameText1;
                pstatDef1.outStatisticFieldName = strFieldNameText1;
                //pstatDef1.outStatisticFieldName = "genericstat1";
                array_QueryStatDefs.push(pstatDef1);

                var pstatDef2 = new esri.tasks.StatisticDefinition();
                pstatDef2.statisticType = strStateType2;
                pstatDef2.onStatisticField = strFieldNameText2;
                pstatDef2.outStatisticFieldName = strFieldNameText2;
                //pstatDef2.outStatisticFieldName = "genericstat2";
                array_QueryStatDefs.push(pstatDef2);
            } else {
                var pstatDef = new esri.tasks.StatisticDefinition();
                pstatDef.statisticType = pTblindexAndQuery[3];
                pstatDef.onStatisticField = strFieldNameText;
                pstatDef.outStatisticFieldName = "genericstat";
                array_QueryStatDefs.push(pstatDef);
            }

            pQuery.returnGeometry = false;
            pQuery.where = strQuery;

            //pQuery.outFields = [strFieldNameText];
            pQuery.outFields = ["*"];
            var strGroupByField = pTblindexAndQuery[4];

            if (strGroupByField != "") {
                pQuery.groupByFieldsForStatistics = [strGroupByField];
                //pQuery.groupByFieldsForStatistics = [strGroupByField];
                //pQuery.orderByFields = [strGroupByField + " DESC"];
                pQuery.orderByFields = [strGroupByField + " ASC"];
            }

            pQuery.outStatistics = array_QueryStatDefs;
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

                if (div == undefined) {
                    console.log("div undefined for " + strHTMLElementID);
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
                            var strTextTemp = "";
                            var blnAdd2Dropdown;
                            for (var i in featAttrs) { attrNames.push(i); }

                            dojo.forEach(resultFeatures, function (feature) {//Loop through the QueryTask results and populate an array with the unique values
                                blnAdd2Dropdown = false;

                                if (strGroupByField != "") {   //because the order of attribute retreival can differ, get the attribute that is the group by
                                    if ((feature.attributes[strGroupByField] == null) | (feature.attributes[strGroupByField] == undefined)) {
                                        strText = "Unknown :";
                                    } else {
                                        strText = "<b>" + feature.attributes[strGroupByField] + ":</b>";
                                    }
                                    strText = strText.replace("101 - ", "").replace("102 - ", "").replace("103 - ", "").replace("11 - ", "").replace("12 - ", "").replace("13 - ", "").replace("51 - ", "").replace("52 - ", "").replace("53 - ", "").replace("76 - ", "").replace("77 - ", "").replace("78 - ", "");
                                    values.push(strText);
                                }

                                dojo.forEach(attrNames, function (an) {
                                    if ((feature.attributes[an] == null) | (feature.attributes[an] == undefined)) {
                                        strText = "N/A";
                                    } else {
                                        strText = feature.attributes[an].toString();
                                    }

                                    if (((strGroupByField != "") & (an == "genericstat") & (strVarType != "show both") & (strVarType != "show both-commas-no-round-decimal")) | (strText == "")) {
                                        //values.push(strText);
                                        //do nothing, don't add the the array of values
                                    } else if (an == strGroupByField){
                                        //do nothing, don't add the the array of values
                                    }
                                    else if ((strStatisticType == "count") & (strVarType == "default")) {
                                        strText += "<br>";//\n<br>
                                        values.push(strText);
                                    } else if ((strVarType == "show both-currency") & (an == "genericstat")) {
                                        var iTempNumber = Number(strText);
                                        strText = iTempNumber.toCurrencyString() + "<br>";//\n<br>
                                        values.push(strText);
                                    //} else if ((strVarType == "show both-commas-no-round-decimal") & (an == "genericstat")) {
                                    } else if (strVarType == "show both-commas-no-round-decimal") {
                                        var iTempNumber = Number(strText);
                                        iTempNumber = Math.round(iTempNumber);
                                        if (iTempNumber >= 1000) {
                                            iTempNumber = Math.round(iTempNumber);
                                            strText = iTempNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                        }
                                        if (attrNames[0] == an) {
                                            strText += " efforts, ";
                                        } else if (attrNames[1] == an) {
                                            strText += "acres</br>";//\n<br>
                                        }

                                        //strText = "<i>" + strText + "</i>"
                                        values.push(strText);
                                    } else if ((strVarType == "commas-no-round-decimal") & (an == "genericstat")) {
                                        var iTempNumber = Number(strText);
                                        iTempNumber = Math.round(iTempNumber);
                                        //strText = iTempNumber.toCurrencyString().replace("$", "");
                                        if (iTempNumber >= 1000) {
                                            strText = iTempNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                            }
                                        values.push(strText);

                                    } else if (strVarType == "convert2date") {
                                        strText = formatDate(Number(strText));
                                        values.push(strText);

                                    } else if ((strVarType == "show both") & (an == "genericstat")) {
                                        //                                      var iTempNumber = Number(strText);
                                        strText = "(" + strText + ")<br>";  //\n<br>
                                        values.push(strText);
                                    } else if (attrNames.length >= 2) {

                                            var iTempNumber = Number(strText);
                                            iTempNumber = Math.round(iTempNumber);
                                            if (iTempNumber >= 1000) {
                                                strText = iTempNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                            }

                                        if (attrNames[0] == an) {
                                            //strTextTemp = strText + " efforts, ";
                                            values.push(strText + " efforts, ");
                                        } else {
                                            //values.push(strTextTemp + ", " + an + ":" + strText);
                                            values.push(strText + " acres");
                                        }
                                    }
                                    else {
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
                    str_divinnerHTML = "Results (" + strText + " projects)";
                    //str_divinnerHTML = "Results (" + strText + " projects) <span></span>";
                    div.innerHTML = str_divinnerHTML;
                } else {


                    if (strHTMLElementID == "dNumberOfRecordsbyImpParty") {
                        var strop = "";
                    }

                    var strFormattedString2Inject = strStringFormatting.format(strText);

                    strFormattedString2Inject = replaceAll(strFormattedString2Inject, "</br> <b>", "</br><b>");
                    strFormattedString2Inject = replaceAll(strFormattedString2Inject, ",  ", ", ");

                    div.innerHTML = strFormattedString2Inject;

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
                        disableOrEnableFormElements("dropdownForm", 'select-one', false, document); //disable/enable to avoid user clicking query options during pending queries
                        disableOrEnableFormElements("dropdownForm", 'button', false, document);  //disable/enable to avoid user clicking query options during pending queries
                    }
                }
            }
            //return results;
        },

        err: function (err) {
            console.log("Failed to get stat results due to an error: " + this.app.gQuerySummary.iTempIndexSubmit + " " + this.app.gQuerySummary.iTempIndexResults, err);
            this.app.pFC.numberOfErrors += 1;

            if (this.app.pFC.numberOfErrors < 5) {
                
                //this.app.pFC.GetCountOfFCDef_ShowText(this.app.pFC.strQueryStored, this.app.pFC.strURLStored, "txtQueryResults", "count", "project_id");

                this.app.pFC.gQuerySummary.SendQuery(this.app.pFC.gQuerySummary.m_arrayQuery, this.app.pFC.gQuerySummary.m_iarrayQueryIndex + 1)

            }
        }
    }
    );
}
);


