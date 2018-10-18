//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018


// You could either use a function similar to this or pre convert an image with for example https://dopiaza.org/tools/datauri
// https://stackoverflow.com/questions/6150289/how-to-convert-image-into-base64-string-using-javascript
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

function getImgData(chartContainer) {
    var chartArea = chartContainer.getElementsByTagName('svg')[0].parentNode;
    var svg = chartArea.innerHTML;
    var chartDoc = chartContainer.ownerDocument;
    var canvas = chartDoc.createElement('canvas');
    canvas.setAttribute('width', chartArea.offsetWidth);
    canvas.setAttribute('height', chartArea.offsetHeight);
    canvas.setAttribute(
        'style',
        'position: absolute; ' +
        'top: ' + (-chartArea.offsetHeight * 2) + 'px;' +
        'left: ' + (-chartArea.offsetWidth * 2) + 'px;');
    chartDoc.body.appendChild(canvas);
    canvg(canvas, svg);
    var imgData = canvas.toDataURL('image/JPEG');
    canvas.parentNode.removeChild(canvas);
    return imgData;
};

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

    function ConvertSummaryString2Array4DataTable(sCHART_DIVID) {
        var strElementID2Find = sCHART_DIVID.replace("_PIECHART", "").replace("_COLUMNCHART", "");
        var divSummaryElement = document.getElementById(strElementID2Find);
                
        var strTextContent = divSummaryElement.innerHTML;
        var arrayTextContent = strTextContent.split("<br>");

        strTextTitle = arrayTextContent[0];
        strTextTitle = strTextTitle.replace("<b>", "").replace("</b>", "");

        strTextTitle = strTextTitle.replace("CUMULATIVE PERCENT of GRSG POPULATION by MANAGEMENT ZONE", "CUMULATIVE PERCENT of GRSG POPULATION");
        strTextTitle = strTextTitle.replace("GRSG BREEDING HABITAT PROBABILITY by MANAGEMENT ZONE", "GRSG BREEDING HABITAT PROBABILITY");
        strTextTitle = strTextTitle.replace("GRSG BREEDING HABITAT PROBABILITY intersected with RESILIENCE and RESISTANCE CATEGORIES by MANAGEMENT ZONE", "GRSG BREEDING HABITAT PROBABILITY intersected with RESILIENCE and RESISTANCE CATEGORIES");


        if (strTextTitle.indexOf("by ") > -1) {
            strTextTitle = strTextTitle.substring(strTextTitle.search('by ') + 3, strTextTitle.length);
            strTextTitle = strTextTitle.substring(0, strTextTitle.search('"'));
        } else {

            strTextTitle = strTextTitle.substring(1, (strTextTitle.length - 1));
        }



        
        arrayTextContent.shift();  //remove the 1st line from the array

        var arrayRefined = [[strTextTitle, "Acres"]];

        var blnProcessAcres = true;
        var strTotalProjects = document.getElementById("dTotalProjects").innerHTML;
        if (strTotalProjects.indexOf(" 0 efforts") > -1) {
            blnProcessAcres = false;
            arrayRefined = [[strTextTitle, "# of Efforts"]];
        }
        
        dojo.forEach(arrayTextContent, function (strTextContentRow) {
            arrayTextContentRow = strTextContentRow.split(", ");

            if (arrayTextContentRow.length == 2) {
                if (blnProcessAcres) {
                    strAcres = arrayTextContentRow[1];
                    strAcres = strAcres.replace(" acres", "")
                    strAcres = strAcres.replace(",", "").replace(",", "").replace(",", "").replace(",", "").replace(",", "").replace(",", "");
                    strAcres = strAcres.replace("N/A", "0");
                    strAcres = strAcres.replace("NaN", "0");
                    dblValue = Number(strAcres);
                } else {
                    strNumberofEfforts = arrayTextContentRow[0];
                    strNumberofEfforts = strNumberofEfforts.replace(" efforts", "")
                    strNumberofEfforts = strNumberofEfforts.replace(",", "").replace(",", "").replace(",", "").replace(",", "").replace(",", "").replace(",", "");
                    strNumberofEfforts = strNumberofEfforts.replace("<b>", "").replace("</b> ", "");
                    strNumberofEfforts = strNumberofEfforts.replace("N/A", "0");
                    strNumberofEfforts = strNumberofEfforts.replace("NaN", "0");
                    
                    arraystrNumberofEfforts = strNumberofEfforts.split(":");
                    strNumberofEfforts = arraystrNumberofEfforts[1];
                    dblValue = Number(strNumberofEfforts);

                }
                strEntitiy = arrayTextContentRow[0]
                strEntitiy = strEntitiy.replace("RESTORATION: ", "RESTORATION| ");
                strEntitiy = strEntitiy.split(":")[0].replace("<b>", "").replace("</b>", "");
                strEntitiy = strEntitiy.replace("RESTORATION| ", "RESTORATION: ");
                strEntitiy = strEntitiy.replace("&nbsp;&nbsp;&nbsp;&nbsp;", "");
                strEntitiy = strEntitiy.replace("&amp;", "and");
                strEntitiy = strEntitiy.replace("Rand;", "R and ");

                strEntitiy = strEntitiy.replace(";&lt;", "<");
                strEntitiy = strEntitiy.replace("&lt;", "<");
                strEntitiy = strEntitiy.replace("&gt;", ">");
                
                arrayRefined.push([strEntitiy, dblValue]);
            }
        });
        return arrayRefined;
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

        StartCHARTING: function () {
            google.charts.load('current', { 'packages': ['corechart'] });
            google.charts.setOnLoadCallback(this.StartedCHARTING);
        },

        StartedCHARTING: function () {
            app.arrayCHARTsBASE64 = [];
            app.arrayOfCHART_DIVIDs = ["dNumberOfRecordsbyStartYear_COLUMNCHART",
                                       "dNumberOfRecordsbyFinishYear_COLUMNCHART",
                                       "dNumberOfRecordsbySubActivity_COLUMNCHART",
                                       "dNumberOfRecordsbyOffice_COLUMNCHART",
                                       "dGISPoP_COLUMNCHART", "dGISSMA_PIECHART",
                                       "dNumberOfRecordsbyImpStatus_PIECHART",
                                       "dNumberOfRecordsbyImpParty_PIECHART",
                                       "dNumberOfRecordsbyActivity_PIECHART",
                                       "dGISStates_PIECHART",
                                       "dGISMZ_PIECHART",
                                       "dGISRMZ_PIECHART",
                                       "dGISAB_PIECHART",
                                       "dGISBLMHMA_COLUMNCHART",
                                       "dGISBD_PIECHART",
                                       "dGISBP_PIECHART",
                                       "dGISIDX_PIECHART"];

            var i;
            for (i = 0; i < app.arrayOfCHART_DIVIDs.length; i++) {
                sCHART_DIVID = app.arrayOfCHART_DIVIDs[i];
                var blnPieCHART = true;
                if (sCHART_DIVID.search("COLUMN") >= 0) {
                    blnPieCHART = false;
                }
                var dataArray = ConvertSummaryString2Array4DataTable(sCHART_DIVID);
                if (dataArray.length > 1){  //some of the summaries will not return data
                    var dataTable = google.visualization.arrayToDataTable(dataArray);

                    var strTitlePrefix = "Acres by ";
                    var strTotalProjects = document.getElementById("dTotalProjects").innerHTML;
                    if (strTotalProjects.indexOf(" 0 efforts") > -1) {
                        var strTitlePrefix = "Number of Efforts by ";
                    }

                    var options = { title: strTitlePrefix + dataArray[0][0] };

                    if (blnPieCHART) {
                        var pChart1 = new google.visualization.PieChart(document.getElementById(app.arrayOfCHART_DIVIDs[i]));
                    } else {
                        var pChart1 = new google.visualization.ColumnChart(document.getElementById(app.arrayOfCHART_DIVIDs[i]));
                    }

                    google.visualization.events.addListener(pChart1, 'ready', function () {
                        app.base64CHART1 = null;
                        var chart_divBASE64 = document.getElementById('piechartBASE64');
                        chart_divBASE64.style.display = "block";
                        chart_divBASE64.innerHTML = '<img src="' + pChart1.getImageURI() + '">';
                        app.base64CHART1 = chart_divBASE64.innerHTML.replace('<img src="', '').replace('">', '');

                        app.arrayCHARTsBASE64.push([sCHART_DIVID, app.base64CHART1])
                        chart_divBASE64.style.display = "none";
                    });
                    pChart1.draw(dataTable, options);
                }
            }
        },
    }
    );
}
);