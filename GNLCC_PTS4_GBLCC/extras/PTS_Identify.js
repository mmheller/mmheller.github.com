//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014

function showFeaturePrep(feature, strURL, strTheme) {
    //remedied the issue of zooming to the top of the page
    var div = document.getElementById("page_collapsibleMap");
    //div.scrollIntoView();
    //$('html, body').animate({ scrollTop: (($(div).offset().top) - ($(div).offset().outerHeight())) }, 'slow');
    $('html, body').animate({ scrollTop: ($(div).offset().top) }, 'fast');

    this.app.pPTS_Identify.strURL4Statquery = strURL;
    this.app.pPTS_Identify.showFeature(feature, strTheme);
    //    this.showFeature(feature);
}


function showReportPage(strProjectID) {
    var strURL = "prj_report.html?PRJ_ID=" + strProjectID;
    window.open(strURL);
}

define([
  "dojo/_base/declare", "dojo/_base/lang", "esri/request", "dojo/promise/all", "dojo/_base/array", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
  "dojo/_base/Color", "extras/CK_AutoCompleteSearchAndZoom", "dojo/date/locale", "dojox/charting/Chart2D",
  "dojox/charting/plot2d/Pie", "dojox/charting/action2d/Highlight", "dojox/charting/action2d/MoveSlice", "dojox/charting/action2d/Tooltip",
  "dojox/charting/themes/Julie", //try other themes (Julie,CubanShirts, PrimaryColors, Charged, BlueDusk, Bahamation,Harmony,Shrooms,Wetland)
], function (
  declare, lang, esriRequest, all, arrayUtils, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color, CK_AutoCompleteSearchAndZoom
) {

    function formatDate(value) {
        var inputDate = new Date(value);
        return dojo.date.locale.format(inputDate, {
            selector: 'date',
            datePattern: 'MM/dd/yyyy'
        });
    }

    return declare([], {
        pLayer1: null,
        pLayer2: null,
        pLayer3: null,
        strSingleLayerName: null,
        iSingleObjectID: null,
        pMap: null,
        pEvt: null,
        strMultipleContent: null,
        strMultipleTitle: null,
        strQueryString4ID: null,
        strFeatureContent: null,
        strStatType: null,
        strURL: null,
        strURL4Statquery: null,
        pFeature: null,
        strOnStatisticField: null,
        cp1: null,
        pInfoWindow: null,
        mCp1: null,
        mTc: null,
        m_ExceedCount: null,
        m_ExceedSum: null,
        pSP: null,
        m_dblX: null,
        m_dblY: null,
        mSR: null,

        constructor: function (options) {// specify class defaults
            this.pLayer1 = options.pLayer1 || null;
            //            this.pLayer2 = options.pLayer2 || null;
            //            this.pLayer3 = options.pLayer3 || null; // default to 50 results per page
            this.strSingleLayerName = options.strSingleLayerName || null;
            this.iSingleObjectID = options.iSingleObjectID || null;
            this.pMap = options.pMap || null;
            this.strQueryString4ID = options.strQueryString4ID || null;
            this.strURL = options.strURL || null;
            this.pTemplate = options.pTemplate || null;
            this.mSR = options.mSR || null;
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
        },

        executeQueries: function (pEvt, strSingleLayerName, iSingleObjectID, dblX, dblY) {
            esri.show(app.loading);
            this.pEvt = pEvt;
            this.strMultipleContent = null;
            this.m_ExceedCount = null;
            this.m_ExceedSum = null;
            if (pEvt != null) {
                dblX = pEvt.mapPoint.x;
                dblY = pEvt.mapPoint.y;
                this.mSR = pEvt.mapPoint.spatialReference;
                pSP = pEvt.screenPoint;
                pxWidth = app.map.extent.getWidth() / app.map.width; // create an extent from the mapPoint that was clicked // this is used to return features within 3 pixels of the click point
                padding = 8 * pxWidth;
            } else {
                var pMP = new esri.geometry.Point(dblX, dblY, new esri.SpatialReference({ "wkid": 3857 }));
                var pSP = app.map.toScreen(pMP);
                padding = 0.0005
                this.m_dblX = dblX
                this.m_dblY = dblY
            }
            this.pSP = pSP;
            qt_Layer1 = new esri.tasks.QueryTask(this.pLayer1.url);
            q_Layer1 = new esri.tasks.Query();
            q_Layer1.returnGeometry = true;
            q_Layer1.maxAllowableOffset = 200;
            q_Layer1.outSpatialReference = new esri.SpatialReference({ "wkid": 3857 })
            q_Layer1.outFields = ["ProjectID, Prj_Title, PI_Org, Partner_Organizaitons, Total__Funding_by_Your_LCC, Fiscal_Years_of_Allocation, LeadName_LastFirst"];

            var strQuery = this.pLayer1.getDefinitionExpression();
            q_Layer1.where = this.pLayer1.getDefinitionExpression();

            var pLayer1, pPromises, pxWidth, padding;
            qGeom = new esri.geometry.Extent({ "xmin": dblX - padding, "ymin": dblY - padding, "xmax": dblX + padding, "ymax": dblY + padding, "spatialReference": this.mSR });
            q_Layer1.geometry = qGeom; // use the extent for the query geometry

            return qt_Layer1.execute(q_Layer1, this.returnEvents, this.err);
        },



        showFeature: function (pFeature, strTheme) {
            this.pMap.graphics.clear();
            pFeature.setSymbol(new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([0, 255, 255, 0.2])));
            var attr = pFeature.attributes;

            var strTitle = attr.Prj_Title;
            strTitle = strTitle.split(/((?:\w+ ){7})/g).filter(Boolean).join("<br>");

            var tempstrcontent = ""
            tempstrcontent += "<u>Project Lead:</u>  " + attr.LeadName_LastFirst + "<br />" +
                                     "<u>Project Lead Org:</u>  " + attr.PI_Org + "<br />" +
                                     "<u>Partner Organizations:</u> " + attr.Partner_Organizaitons + "<br />" +
                                     "<u>Total Funding by GNLCC:</u> $" + attr.Total__Funding_by_Your_LCC + "<br />" +
                                     "<u>Fiscal Years of Allocation:</u>  " + attr.Fiscal_Years_of_Allocation + "<br />"
            this.strFeatureContent = tempstrcontent;
            this.strFeatureContent += "(<A href='#' onclick='showReportPage(" + attr.ProjectID + ");'>Show project detail</A>)<br/>";

            this.pMap.infoWindow.setContent(this.strFeatureContent);
            this.pMap.infoWindow.setTitle(strTitle);
            this.pMap.infoWindow.resize(415, 300);
            this.pMap.infoWindow.show(this.pSP, this.pMap.getInfoWindowAnchor(this.pSP));
            this.pFeature = pFeature;
//            this.mTc.resize({ w: 400, h: 235 });
            app.map.graphics.add(pFeature);
        },

        showFeatureSet: function (results) {
            pLayer1 = results.features; // results from deferred lists are returned in the order they were created  // so parcel results are first in the array and buildings results are second
            var content = "<u>Number of projects:  " + pLayer1.length + "</u><br />";
            arrayUtils.forEach(pLayer1, function (feat) { feat.setSymbol(new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new Color([255, 0, 0]), 2), new Color([0, 255, 255, 0.2]))); app.map.graphics.add(feat); }); // add the results to the map
            for (var iii = 0; iii < pLayer1.length; iii++) {
                var graphic3 = pLayer1[iii];
                strThemeT = "Polygon";
                strURL4query3 = this.strURL + "0";
                if (graphic3.attributes.Prj_Title != null) {
                    var strTrimmedTitle = graphic3.attributes.Prj_Title.substring(0, 20) + "...";
                } else {
                    var strTrimmedTitle = "unknown title";
                }
                content += "  " + strTrimmedTitle + " (" + graphic3.attributes.LeadName_LastFirst + ") (<A href='#' onclick='showFeaturePrep(pLayer1[" + iii + "],strURL4query3,strThemeT);'>show</A>)<br/>";
            }
            this.strMultipleContent = content;
            this.pMap.infoWindow.setContent(content);
            this.pMap.infoWindow.setTitle("Identify Results");
            this.pMap.infoWindow.resize(300, 300);
            this.pMap.infoWindow.show(this.pSP, this.pMap.getInfoWindowAnchor(this.pSP));
            //this.mTc.resize({ w: 460, h: 235 });
        },

        returnEvents: function (results) {
            console.log("queries finished: ", results);
            var pLayer1

            if (results.features.length == 1) {
                var pFeature = null;
                var strURL4query = "";
                if (results.features.length == 1) {
                    pFeature = results.features[0];
                    strTheme = "PRJ Boundaries";
                }
                else { //some issue
                }
                this.showFeature(pFeature, strTheme);
            }
            else { this.showFeatureSet(results); }

            if (this.m_dblY != null) {
                var CK_ASZ = new CK_AutoCompleteSearchAndZoom({ pMap: app.map, dblExpandNum: 2,
                    divTag4Results: document.getElementById("loc"),
                    strSearchField: "ProjectID", pSR: this.mSR
                }); // instantiate the class
                CK_ASZ.zoomToPoint(this.m_dblX, this.m_dblY, "", null);
            }
            esri.hide(app.loading);
        },

        err: function (err) {
            console.log("Failed to get results from ? due to an error: ", err);
            alert(error.name);
            esri.hide(app.loading);
            app.map.enableMapNavigation();
            app.map.showZoomSlider();
        }
    }
    )
    ;
}
);


