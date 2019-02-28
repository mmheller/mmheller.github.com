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


function headerFooterFormatting(doc, totalPages) {
    for (var i = totalPages; i >= 1; i--) {
        doc.setPage(i);
        header(doc);                //header
        footer(doc, i, totalPages);
        doc.page++;
    }
};

function header(doc) {
    doc.setFontSize(25);
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
        doc.addImage(app.base64ImgMap, 'JPEG', 375, 5, 65, 30);
    }

    doc.text("CED Report", pdfMargins.left + 425, 30);
    doc.setLineCap(2);
    doc.line(pdfMargins.left, 40, pdfMargins.width - pdfMargins.left, 40); // horizontal line
};


function footer(doc, pageNumber, totalPages) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;

    var str = "Page " + pageNumber + " of " + totalPages + ", Report Date: " + today
    doc.setFontSize(10);
    var iPageHeight = doc.internal.pageSize.getHeight();
    doc.text(str, pdfMargins.left, iPageHeight - 20);
};


function GetHTMLElementTopandLeft(strElementID) {
    var element = document.getElementById(strElementID); //replace elementId with your element's Id.
    var rect = element.getBoundingClientRect();
    var elementLeft, elementTop; //x and y
    var scrollTop = document.documentElement.scrollTop ?
                    document.documentElement.scrollTop : document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft ?
                     document.documentElement.scrollLeft : document.body.scrollLeft;
    elementTop = rect.top + scrollTop;
    elementLeft = rect.left + scrollLeft;
    return [elementLeft, elementTop];
};

function printErr(err) {
    console.log("Failed to print due to an error: " + err);
};

function AddChartImage2PDF(doc, strElementID, iPageNumber, iTop) {
    var strBase64 = "";
    for (i = 0; i < app.arrayCHARTsBASE64.length; i++) {
        if (strElementID == app.arrayCHARTsBASE64[i][0]) {
            strBase64 = app.arrayCHARTsBASE64[i][1];
        }
    }

    if (strBase64 != "") {
        if (iTop > 650) {
            iPageNumber += 1;
            iTop = 60;
            doc.addPage();
        }
        
        doc.setPage(iPageNumber);
        doc.addImage(strBase64, 'PNG', pdfMargins.left, iTop, 520, 120);
    }
};

function startExport2PDF() {
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.setFontSize(18);
    pdf.setFont("helvetica");  //not sure this is doing anything
    pdf.setFontType("normal");

    if (app.base64ImgMap) {
        pdf.addImage(app.base64ImgMap, 'JPEG', pdfMargins.left, 90, pdfMargins.left + 520, 244 + 20);
        pdf.setFontSize(12);
        pdf.setFontType("bold");
        pdf.text("ALERT:  The CED is in a period of data collection.", pdfMargins.left, 370);
        pdf.text("If generating report(s), beware the summaries, values, and figures are to be considered", pdfMargins.left, 385);
        pdf.text("DRAFT and PROVISIONAL until further notice.", pdfMargins.left, 400);

        pdf.setFontType("normal");
        pdf.text("Note: Some overlapping area efforts may not be visible in PDF map", pdfMargins.left, 420);
        pdf.setFontSize(18);
    }

    pdf.text("Conservation Efforts Database v2.1", pdfMargins.left, 60);
    pdf.text("Interactive Map - Summary Report", pdfMargins.left, 80);

    
    $("#dREPORTGENERATED").css("font-family", "helvetica");// change property value
     $("#dTotalAcresQ2").css("font-family", "helvetica");// change property value
     $("#dTotalCalcAcresQ2").css("font-family", "helvetica");// change property value
     $("#dTotalProjects").css("font-family", "helvetica");// change property value
     $("#dTotalProjectsNon").css("font-family", "helvetica");// change property value
     $("#dTotalPlans").css("font-family", "helvetica");// change property value
     $("#dFilterParameters").css("font-family", "helvetica");// change property value
     $("#dMaxLastDataProviderEdit").css("font-family", "helvetica");// change property value
     $("#dMaxLastPubProc").css("font-family", "helvetica");// change property value

     $("#dNumberOfRecordsbyImpStatus").css("font-family", "helvetica");// change property value
     $("#dNumberOfRecordsbyImpStatus").css("font-size", "10px");// original value

    $("#dNumberOfRecordsbyImpParty").css("font-family", "helvetica");// change property value
    $("#dNumberOfRecordsbyImpParty").css("font-size", "10px");// original value
    $("#dNumberOfRecordsbyStartYear").css("font-family", "helvetica");// change property value
    $("#dNumberOfRecordsbyStartYear").css("font-size", "10px");// original value
    $("#dNumberOfRecordsbyFinishYear").css("font-family", "helvetica");// change property value
    $("#dNumberOfRecordsbyFinishYear").css("font-size", "10px");// original value
    $("#dNumberOfRecordsbyActivity").css("font-family", "helvetica");// change property value
    $("#dNumberOfRecordsbyActivity").css("font-size", "10px");// original value

    $("#dNumberOfRecordsbySubActivity").css("font-family", "helvetica");// change property value
    $("#dNumberOfRecordsbySubActivity").css("font-size", "10px");// original value
    $("#dNumberOfRecordsbyOffice").css("font-family", "helvetica");// change property value
    $("#dNumberOfRecordsbyOffice").css("font-size", "10px");// original value
    $("#dNumberofOverlappingStates").css("font-family", "helvetica");// change property value
    $("#dNumberofOverlappingStates").css("font-size", "10px");// original value
    $("#dGISStates").css("font-family", "helvetica");// change property value
    $("#dGISStates").css("font-size", "10px");// original value
    $("#dNumberofOverlappingPopAreas").css("font-family", "helvetica");// change property value
    $("#dNumberofOverlappingPopAreas").css("font-size", "10px");// original value
    $("#dGISPoP").css("font-family", "helvetica");// change property value
    $("#dGISPoP").css("font-size", "10px");// original value
    $("#dNumberofOverlappingMngmtZones").css("font-family", "helvetica");// change property value
    $("#dNumberofOverlappingMngmtZones").css("font-size", "10px");// original value
    $("#dGISMZ").css("font-family", "helvetica");// change property value
    $("#dGISMZ").css("font-size", "10px");// original value
    $("#dGISSMA").css("font-family", "helvetica");// change property value
    $("#dGISSMA").css("font-size", "10px");// original value
    $("#dGISBLMHMA").css("font-family", "helvetica");// change property value
    $("#dGISBLMHMA").css("font-size", "10px");// original value
    ////$("#dGISPHMA").css("font-family", "helvetica");// change property value
    ////$("#dGISPHMA").css("font-size", "10px");// original value
    $("#dGISRMZ").css("font-family", "helvetica");// change property value
    $("#dGISRMZ").css("font-size", "10px");// original value
    $("#dGISAB").css("font-family", "helvetica");// change property value
    $("#dGISAB").css("font-size", "10px");// original value
    $("#dGISBD").css("font-family", "helvetica");// change property value
    $("#dGISBD").css("font-size", "10px");// original value
    $("#dGISBP").css("font-family", "helvetica");// change property value
    $("#dGISBP").css("font-size", "10px");// original value
    $("#dGISIDX").css("font-family", "helvetica");// change property value
    $("#dGISIDX").css("font-size", "10px");// original value
    $("#dGISPACSum").css("font-family", "helvetica");// change property value
    $("#dGISPACSum").css("font-size", "10px");// original value
            
    
   source = $('#html-2-pdfwrapper').html();//div_pdf contains idTablaDatos and idTablaDetalle
    pdf.fromHTML(source,
        pdfMargins.left, // x coord
        pdfMargins.top + 390, 
        {
            setFont: "helvetica",
            width: 5000, // resetting the max width of content on PDF, otherwise the text output word wraps because jsPDF doesnt' always recognize the <br>'s
            //width: pdfMargins.width, // max width of content on PDF
            elementHandlers: specialElementHandlers = {
                '#dNumberOfRecordsbySubActivity_COLUMNCHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dNumberOfRecordsbySubActivity_COLUMNCHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dNumberOfRecordsbyStartYear_COLUMNCHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dNumberOfRecordsbyStartYear_COLUMNCHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dNumberOfRecordsbyFinishYear_COLUMNCHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dNumberOfRecordsbyFinishYear_COLUMNCHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dNumberOfRecordsbyOffice_COLUMNCHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dNumberOfRecordsbyOffice_COLUMNCHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dGISPoP_COLUMNCHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISPoP_COLUMNCHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dGISSMA_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISSMA_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dNumberOfRecordsbyImpStatus_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dNumberOfRecordsbyImpStatus_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dNumberOfRecordsbyImpParty_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dNumberOfRecordsbyImpParty_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dNumberOfRecordsbyActivity_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dNumberOfRecordsbyActivity_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dGISStates_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISStates_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dGISMZ_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISMZ_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dGISRMZ_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISRMZ_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                
                '#dGISBLMHMA_COLUMNCHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISBLMHMA_COLUMNCHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                //'#dGISPHMA_COLUMNCHART': function (element, renderer) {
                //    AddChartImage2PDF(pdf, "dGISPHMA_COLUMNCHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                //    return true;                      
                //},
                
                '#dGISAB_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISAB_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dGISBD_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISBD_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dGISBP_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISBP_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dGISIDX_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISIDX_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                },
                '#dGISMZ_PIECHART': function (element, renderer) {
                    AddChartImage2PDF(pdf, "dGISMZ_PIECHART", renderer.pdf.internal.pages.length - 1, renderer.pdf.tableHeaderRow[0][1] + 25);
                    return true;                      // true = "handled elsewhere, bypass text extraction"
                }
            }
        }, function (dispose) {
            headerFooterFormatting(pdf, pdf.internal.getNumberOfPages());
        },
        pdfMargins);

    var i;
    for (i = 1; i < 19; i++) {
        strDivID4WhiteSpace = "dWhiteSpace" + i.toString();
        var pElement = document.getElementById(strDivID4WhiteSpace);
        if (pElement != undefined) {
            pElement.innerHTML = "";
        }
    }

    document.getElementById("ImgResultsLoading").style.visibility = "hidden";
    pdf.save("CEDReport.pdf");

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


        StartPrinting: function (pMap) {

            var i;
            for (i = 1; i < 19; i++) {
                strDivID4WhiteSpace = "dWhiteSpace" + i.toString();
                var pElement = document.getElementById(strDivID4WhiteSpace);
                if (pElement != undefined) {
                    pElement.innerHTML = "<font color='white'>-<br />-<br />-<br />-<br />-<br />-<br />-<br />-<br />-<br /></font>";
                }
            }

            esriConfig.defaults.io.corsEnabledServers.push("https://utility.arcgis.com")
            esriConfig.defaults.io.corsEnabledServers.push("https://services.arcgis.com")
            esriConfig.defaults.io.corsEnabledServers.push("https://sampleserver6.arcgisonline.com")

            var oWid = pMap.width;
            var oHgt = pMap.height;

            var printTask = new PrintTask('https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task');
            var template = new PrintTemplate();
            this.imgHeight = (740 / oWid) * oHgt;
            template.exportOptions = {
                width: 1542,
                height: (1542 / oWid) * oHgt,
                dpi: 150
            };

            template.format = "JPG";
            template.layout = "MAP_ONLY";
            template.preserveScale = false;
            template.showAttribution = false;
            var params = new PrintParameters();
            params.map = pMap;
            params.template = template;

            esriConfig.defaults.io.timeout = 180000; //3 minutes  //this greatly helps with the printing task timeout issues

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
    }
    );
}
);


