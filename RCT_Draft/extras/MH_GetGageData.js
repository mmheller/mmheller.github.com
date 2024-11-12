function returnURL4GSgage(strURL) {
    strHyperlinkURL = strURL; 
    strHyperlinkURL = strHyperlinkURL.substring(strHyperlinkURL.search("sites=") + 6), strHyperlinkURL.length;  //find the site id
    strHyperlinkURL = "https://waterdata.usgs.gov/monitoring-location/" + strHyperlinkURL + "/#period=P3D";
    return strHyperlinkURL;
}


function multiDimensionalUnique(arr) {
	var uniques = [];
	var itemsFound = {};
	for (var i = 0, l = arr.length; i < l; i++) {
		var stringified = JSON.stringify(arr[i]);
		if (itemsFound[stringified]) { continue; }
		uniques.push(arr[i]);
		itemsFound[stringified] = true;
	}
	return uniques;
}

function ProcLinearRegression(arrray_Detail4Interpolation, strValueKey) {
    var str3DayCFSTrend = "images/blank.png";
    arrayX = [];
    arrayY = [];
    for (var ilr = 0; ilr < arrray_Detail4Interpolation.length; ilr++) {
        arrayX.push(arrray_Detail4Interpolation[ilr].EPOCH);
        arrayY.push(arrray_Detail4Interpolation[ilr][strValueKey]);
    }
    var lr = linearRegression(arrayY, arrayX);

    var dMidRangeLow = -0.0000001;
    var dMidRangeHigh = 0.0000001;

    if ((strValueKey == "TMP") | (strValueKey == "Ht")) {
        dMidRangeLow = -0.000000001;
        dMidRangeHigh = 0.000000001;
    }


    islope = lr.slope;
    if ((islope < dMidRangeHigh) & (islope > dMidRangeLow)) {
        str3DayCFSTrend = "images/flatline.png";
    } else if (islope > 0) {
        str3DayCFSTrend = "images/up.png";
    } else {
        str3DayCFSTrend = "images/down.png";
    }
    arrayX = [];  //clear out the var's
    arrayY = [];
    arrray_Detail4Interpolation = [];
    return str3DayCFSTrend;
}

function linearRegression(y, x) {  //https://stackoverflow.com/questions/6195335/linear-regression-in-javascript
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i] * y[i]);
        sum_xx += (x[i] * x[i]);
        sum_yy += (y[i] * y[i]);
    }

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
    lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

    return lr;
}

function removeFunction(myObjects, prop, valu) {
    return myObjects.filter(function (val) {
        return val[prop] !== valu;
    });

}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}   

function sortFunction10Column(a, b) {
    if (a[10] === b[10]) {
        return 0;
    }
    else {
        return (a[10] < b[10]) ? -1 : 1;
    }
}

//Explore drilldown examples https://js.devexpress.com/Demos/WidgetsGallery/Demo/Charts/ChartsDrillDown/Knockout/Light/

define([
    "esri/tasks/QueryTask",
    "esri/rest/support/Query",
    "esri/rest/query",
    "esri/geometry/Polyline",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/request",
    "dojo/promise/all",
    "esri/request", "dojo/_base/array",
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/on",
    "esri/geometry/geometryEngine"


], function (
    QueryTask, Query, query, Polyline, declare, lang, esriRequest, All, request, dom, domClass, registry, on, geometryEngine
) {

    return declare([], {
        m_arrray_RiverSectionStatus: [],
        m_arrray_Detail4ChartCFS: [],
        m_arrray_Detail4ChartHt: [],
        m_arrray_Detail4ChartTMP: [],
        m_arrray_Detail4ChartHistoryCFS: [],
        //m_arrray_Detail4ChartHistoryHt: [],
        m_arrray_StationIDsCFS: [],
        m_arrray_StationIDsHt: [],
        m_arrray_StationIDsTMP: [],
        m_ProcessingIndex: 0,
        m_arrayOIDYellow: [],
        m_arrayOIDsGold: [],
        m_arrayOIDsOrange: [],
        m_arrayOIDsPlum: [],
        m_arrayOIDsRed: [],
        mIDXQuery1AtaTime: 0,
        //m_blnQuery4DNRCGages: false,
        m_arrayDNRC_Sens_Loc: null,
        //m_blnQuery4CODWRGages: false,
        m_arrayCODWR_Sens_Loc: null,

        //m_blnQuery4USACE_NWDGages: false,
        m_arrayUSACE_NWD_Sens_Loc: null,

        //m_bln_USGS_Src_NeedsProc: false,
        //m_bln_CODWR_Src_NeedsProc: false,
        //m_bln_MTDNRC_Src_NeedsProc: false,
        //m_bln_USACE_NWD_Src_NeedsProc: false,

        gageReadings: function (strSiteName,
            strHyperlinkURL,
            dteLatestDateTimeTemp,
            dblLatestTemp,
            strSiteTempStatus,
            dteLatestDateTimeCFS,
            dteLatestCFS,
            strSiteFlowStatus,
            strGageID,
            strStreamName,
            strSectionID,
            str3DayCFSTrend,
            strMONTHDAYEarlyFlowFromDroughtManagementTarget,
            strMONTHDAYEarlyFlowToDroughtManagementTarget,
            iLateFlowPref4ConsvValue,
            iLateFlowConsvValue,
            iLateFlowClosureValueFlow,
            strLateFlowPref4ConsvValue,
            strLateFlowConsvValue,
            strLateFlowClosureValueFlow,
            iTempClosureValue,
            strTempCollected,
            strSiteID,
            strDailyStat_URL,
            str3DayTMPTrend,
            strFWPDESCRIPTION,
            strFWPLOCATION,
            strFWPPRESSRELEASE,
            strFWPPUBLISHDATE,
            strFWPTITLE,
            strOverallStatus,
            strOverallSymbol,
            strStartEndpoint,
            strEndEndpoint,
            strWatershed,
            strSectionName_,
            dteLatestDateTimeHt,
            dblLatestHt,
            strSiteTempStatusHt,
            str3DayHtTrend,
            iLateHtPref4ConsvValue,
            iLateHtConsvValue,
            iLateHtClosureValue,
            strLateHtPref4ConsvValue,
            strLateHtConsvValue,
            strLateHtClosureValue,
            strAgency
            //            , dteLatestDateTimeHt, dteLatestHt, str3DayHtTrend
        ) {// Class to represent a row in the gage values grid
            var self = this;
            self.SiteName = strSiteName;
            self.Hyperlink = strHyperlinkURL;
            self.Discharge = dteLatestCFS;
            self.formattedDischargeDateTime = ko.computed(function () {
                var strDateTimeCFS = (dteLatestDateTimeCFS.getMonth() + 1) + "/" + dteLatestDateTimeCFS.getDate() + "/" + dteLatestDateTimeCFS.getFullYear();
                strDateTimeCFS += " " + dteLatestDateTimeCFS.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                return strDateTimeCFS ? strDateTimeCFS : "None";
            });
            self.WaterTemp = dblLatestTemp;
            self.formattedWaterTempDateTime = ko.computed(function () {
                if (dteLatestDateTimeTemp != "") {
                    var strDateTimeWaterTemp = (dteLatestDateTimeTemp.getMonth() + 1) + "/" + dteLatestDateTimeTemp.getDate() + "/" + dteLatestDateTimeTemp.getFullYear();
                    strDateTimeWaterTemp += " " + dteLatestDateTimeTemp.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }
                return strDateTimeWaterTemp ? strDateTimeWaterTemp : "Data No Available";
            });
            self.GageHt = dblLatestHt;
            self.formattedGageHtDateTime = ko.computed(function () {
                if (dteLatestDateTimeHt != "") {
                    var strDateTimeGageHt = (dteLatestDateTimeHt.getMonth() + 1) + "/" + dteLatestDateTimeHt.getDate() + "/" + dteLatestDateTimeHt.getFullYear();
                    strDateTimeGageHt += " " + dteLatestDateTimeHt.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }
                return strDateTimeGageHt ? strDateTimeGageHt : "Data No Available";
            });


            if ((strSiteTempStatus == "EXPANDED CONSERVATION MEASURES") &
                ((strWatershed == "North Fork Flathead") |
                    (strWatershed == "Mainstem Flathead") |
                    (strWatershed == "Swan") |
                    (strWatershed == "Lower Flathead") |
                    (strWatershed == "Stillwater") |
                    (strWatershed == "South Fork Flathead") |
                    (strWatershed == "Middle Fork Flathead"))) {
                strSiteTempStatus = "Recommendation to anglers to use caution when handling westslope cutthroat trout and bull trout to minimize stress";
            }


            self.SiteTempStatus = strSiteTempStatus;
            self.SiteFlowStatus = strSiteFlowStatus;
            self.StreamName = strStreamName;
            self.SectionID = strSectionID;
            self.SectionName_ = strSectionName_;
            self.Day3CFSTrend = str3DayCFSTrend;

            self.strMONTHDAYEarlyFlowFromDroughtManagementTarget = strMONTHDAYEarlyFlowFromDroughtManagementTarget;
            self.strMONTHDAYEarlyFlowToDroughtManagementTarget = strMONTHDAYEarlyFlowToDroughtManagementTarget;
            self.iLateFlowPref4ConsvValue = iLateFlowPref4ConsvValue;
            self.iLateFlowConsvValue = iLateFlowConsvValue;
            self.iLateFlowClosureValueFlow = iLateFlowClosureValueFlow;
            self.strLateFlowPref4ConsvValue = strLateFlowPref4ConsvValue;
            self.strLateFlowConsvValue = strLateFlowConsvValue;
            self.strLateFlowClosureValueFlow = strLateFlowClosureValueFlow;
            self.iTempClosureValue = iTempClosureValue;
            self.strTempCollected = strTempCollected;
            self.strSiteID = strSiteID;
            self.strDailyStat_URL = strDailyStat_URL;
            self.Day3TMPTrend = str3DayTMPTrend;
            self.fwpDESCRIPTION = strFWPDESCRIPTION;
            self.fwpLOCATION = strFWPLOCATION;
            self.fwpPRESSRELEASE = strFWPPRESSRELEASE;
            self.fwpPUBLISHDATE = strFWPPUBLISHDATE;
            self.fwpTITLE = strFWPTITLE;
            self.overallStatus = strOverallStatus;
            self.overallSymbol = strOverallSymbol;
            self.StartEndpoint = strStartEndpoint;
            self.EndEndpoint = strEndEndpoint;
            self.strWatershed = strWatershed;

            self.dteLatestDateTimeHt = dteLatestDateTimeHt;
            //self.dblLatestTempHt = dblLatestHt;
            self.strSiteTempStatusHt = strSiteTempStatusHt;
            self.Day3HtTrend = str3DayHtTrend;
            self.iLateHtPref4ConsvValue = iLateHtPref4ConsvValue;
            self.iLateHtConsvValue = iLateHtConsvValue;
            self.iLateHtClosureValue = iLateHtClosureValue;
            self.strLateHtPref4ConsvValue = strLateHtPref4ConsvValue;
            self.strLateHtConsvValue = strLateHtConsvValue;
            self.strLateHtClosureValue = strLateHtClosureValue;

            self.strAgency = strAgency;
        },

        handleSectionGageResults: function (results) {
            var items = dom.map(results, function (result) {
                return result;
            });
            var streamSectionArrray = [];
            //var arrayDuplicateCheck = [];
            var found = false;

            var strStreamName = "";
            var strSectionID = "";
            var strSectionName_ = "";
            var strCFS_Prep4Conserv = "";
            var strCFS_Conserv = "";
            var strCFS_NotOfficialClosure = "";
            var strHt_Prep4Conserv = "";
            var strHt_Conserv = "";
            var strHt_NotOfficialClosure = "";

            var iConsvTemp = 0;
            var strStratDate = "";
            var strtoDate = "";
            var isomeval = "";
            var strsomenote = "";
            var iCFS_Note_Prep4Conserv = 99999;
            var iCFS_Note_Conserv = 99999;
            var iCFS_Note_NotOfficialClosure = 99999;
            var iHt_Note_Prep4Conserv = 99999;
            var iHt_Note_Conserv = 99999;
            var iHt_Note_NotOfficialClosure = 99999;
            var iOID = "";
            var strStartEndpoint = "";
            var strEndEndpoint = "";

            dom.map(items[0].features, function (itemSection) {  //loop through the sections!!!!
                //console.log("handleSectionGageResults2");
                var strGageID_Source = null;
                var strAgency = null;
                var strTempCollected = null;
                var DailyStat_URL = "";

                strStreamName = "";
                strSectionID = "";
                strSectionName_ = "";
                strCFS_Prep4Conserv = "";
                strCFS_Conserv = "";
                strCFS_NotOfficialClosure = "";
                strHt_Prep4Conserv = "";
                strHt_Conserv = "";
                strHt_NotOfficialClosure = "";

                iConsvTemp = 0;
                strStratDate = "";
                strtoDate = "";
                isomeval = "";
                strsomenote = "";
                iCFS_Note_Prep4Conserv = 99999;
                iCFS_Note_Conserv = 99999;
                iCFS_Note_NotOfficialClosure = 99999;
                iHt_Note_Prep4Conserv = 99999;
                iHt_Note_Conserv = 99999;
                iHt_Note_NotOfficialClosure = 99999;

                iOID = "";
                strStartEndpoint = "";
                strEndEndpoint = "";
                strWatershed = "";
                //strAgency = "";

                strStreamName = itemSection.attributes.StreamName;
                strSectionID = itemSection.attributes.SectionID;
                strSectionName_ = itemSection.attributes.SectionName;
                strCFS_Prep4Conserv = itemSection.attributes.CFS_Prep4Conserv;
                strCFS_Conserv = itemSection.attributes.CFS_Conserv;
                strCFS_NotOfficialClosure = itemSection.attributes.CFS_NotOfficialClosure;

                strHt_Prep4Conserv = itemSection.attributes.Ht_Prep4Conserv;
                strHt_Conserv = itemSection.attributes.Ht_Conserv;
                strHt_NotOfficialClosure = itemSection.attributes.Ht_NotOfficialClosure;

                iConsvTemp = itemSection.attributes.ConsvTemp,

                    iCFS_Note_Prep4Conserv = itemSection.attributes.CFS_Note_Prep4Conserv;
                iCFS_Note_Conserv = itemSection.attributes.CFS_Note_Conserv;
                iCFS_Note_NotOfficialClosure = itemSection.attributes.CFS_Note_NotOfficialClosure;

                iHt_Note_Prep4Conserv = itemSection.attributes.Ht_Note_Prep4Conserv;
                iHt_Note_Conserv = itemSection.attributes.Ht_Note_Conserv;
                iHt_Note_NotOfficialClosure = itemSection.attributes.Ht_Note_NotOfficialClosure;


                iOID = itemSection.attributes.OBJECTID;
                strWatershed = itemSection.attributes.Watershed;

                var arrayGages4Section = [];

                var blnGageFound = false;
                dom.map(items[1].features, function (itemGage) { //loop through the gages that match the sections
                    //query by     Watershed , StreamName, Section_ID
                    //if (itemGage.attributes.Watershed == "Smith") {
                    //    console.log("pause");
                    //}
                    //if (itemSection.attributes.Watershed == "Smith") {
                    //    console.log("pause");
                    //}

                    if ((itemGage.attributes.Watershed === itemSection.attributes.Watershed) &
                        (itemGage.attributes.StreamName === itemSection.attributes.StreamName) &
                        (itemGage.attributes.Section_ID === itemSection.attributes.SectionID) &
                        (itemGage.attributes.Symbology === "TRIGGER MEASURE LOCATION")) {

                        console.log("Gage/Section Match: " + itemGage.attributes.StreamName + ":" + itemGage.attributes.Section_ID + ":" + itemGage.attributes.Agency);

                        arrayGages4Section.push({
                            GageID_Source: itemGage.attributes.GageID_Source,
                            TempCollected: itemGage.attributes.TempCollected,
                            Agency: itemGage.attributes.Agency,
                            DailyStat_URL: itemGage.attributes.DailyStat_URL
                        });

                        switch (itemGage.attributes.Agency) {
                            case "USGS":
                                app.bln_USGS_Src_NeedsProc = true;
                                break;
                            case "CODWR":
                                app.bln_CODWR_Src_NeedsProc = true;
                                break;
                            case "MTDNRC":
                                app.bln_MTDNRC_Src_NeedsProc = true;
                                break;
                            case "USACE-NWD":
                                app.bln_USACE_NWD_Src_NeedsProc = true;
                                break;
                            default:
                                console.log("no agency match");
                        }

                        blnGageFound = true;
                    } else {
                        //console.log("test");
                    }
                })

                if (!(blnGageFound)) {
                    arrayGages4Section.push({
                        GageID_Source: "",
                        TempCollected: "",
                        Agency: "",
                        DailyStat_URL: ""
                    });
                }

                dom.map(items[2].features, function (itemEndpoint) {  //loop through the endpoints
                    //query by     Watershed , StreamName, Section_ID
                    //console.log("handleSectionGageResults4");
                    if ((itemEndpoint.attributes.Watershed_Name === itemSection.attributes.Watershed) &
                        (itemEndpoint.attributes.Stream_Name === itemSection.attributes.StreamName) &
                        ((itemEndpoint.attributes.Section_ID === itemSection.attributes.SectionID) | (itemEndpoint.attributes.Section_Name === itemSection.attributes.SectionID) | (itemEndpoint.attributes.Section_Name === itemSection.attributes.SectionName)) &
                        (itemEndpoint.attributes.Start_End === "Start")) {
                        strStartEndpoint = itemEndpoint.attributes.Endpoint_Name;
                    }
                    if ((itemEndpoint.attributes.Watershed_Name === itemSection.attributes.Watershed) &
                        (itemEndpoint.attributes.Stream_Name === itemSection.attributes.StreamName) &
                        ((itemEndpoint.attributes.Section_ID === itemSection.attributes.SectionID) | (itemEndpoint.attributes.Section_Name === itemSection.attributes.SectionID) | (itemEndpoint.attributes.Section_Name === itemSection.attributes.SectionName)) &
                        (itemEndpoint.attributes.Start_End === "End")) {
                        strEndEndpoint = itemEndpoint.attributes.Endpoint_Name;
                    }
                })

                dom.map(arrayGages4Section, function (itemGage2) { //loop through the gages that match the sections
                    let strSectionNameSuffix = "";
                    if (arrayGages4Section.length > 1) {
                        strSectionNameSuffix = " - NOTE: " + arrayGages4Section.length.toString() + " SUMMARY GAGES FOR THIS SECTION"
                    }

                    streamSectionArrray.push([strStreamName, itemGage2.GageID_Source,
                        strSectionID, strCFS_Prep4Conserv, strCFS_Conserv, strCFS_NotOfficialClosure, iConsvTemp,
                        "Temperature Conservation Target Start Date: year round", "Temperature Conservation Target End Date: year round", "someval", "somenote",
                        iCFS_Note_Prep4Conserv, iCFS_Note_Conserv, iCFS_Note_NotOfficialClosure,
                        itemGage2.TempCollected, iOID, itemGage2.DailyStat_URL,
                        "", //Placeholder for FWP ward description
                        "", //Placeholder for FWP ward location
                        "", //Placeholder for FWP ward Press Release
                        "", //Placeholder for FWP ward Publish date
                        "", //Placeholder for FWP ward Title,
                        "", //Placeholder for FWP warning,
                        strStartEndpoint,
                        strEndEndpoint,
                        strWatershed,
                        strSectionName_ + strSectionNameSuffix,
                        strHt_Prep4Conserv, strHt_Conserv, strHt_NotOfficialClosure,
                        iHt_Note_Prep4Conserv, iHt_Note_Conserv, iHt_Note_NotOfficialClosure,
                        itemGage2.Agency
                    ]);
                })

            })

            streamSectionArrray.sort(
                function (a, b) {
                    if (a[0] === b[0]) {
                        return a[2] - b[2];
                    }
                    return a[0] > b[0] ? 1 : -1;
                });

            let sectionGeometries = new Polyline(app.view.spatialReference);
            for (var i = 0; i < items[0].features.length; i++) {
                var paths = items[0].features[i].geometry.paths;
                for (var j = 0; j < paths.length; j++) { //needed for multi part lines  
                    sectionGeometries.addPath(paths[j]);
                }
            }

            app.pGetWarn.Start(sectionGeometries, streamSectionArrray);
        },

        getArray2Process: function (strURL, strQuery) {// Class to represent a row in the gage values grid
            console.log("getArray2Process");
            var siteNameArrray = [];
            let q_Layer1 = new Query();
            let qt_Layer1 = new QueryTask(strURL + app.idx11[5]); //sections layer
            let q_Layer2 = new Query();
            let qt_Layer2 = new QueryTask(strURL + app.idx11[1]); //gages layer
            let q_Layer3 = new Query();
            let qt_Layer3 = new QueryTask(strURL + app.idx11[0]); //endpoints layer

            q_Layer1.returnGeometry = q_Layer2.returnGeometry = true;
            q_Layer1.outFields = q_Layer2.outFields = ["*"];
            q_Layer3.outFields = ["*"];


            let strQuery1 = strQuery;
            if ((app.H2O_ID == "Blackfoot") | (app.H2O_ID == "Upper Clark Fork")) { //since the Turah gage is used for a conservation target for all, add this gage and stream data
                strQuery1 = strQuery + " OR ((StreamName = 'Clark Fork River') AND ((SectionID = '5') OR (SectionID = '6')))"
            }
            q_Layer1.where = strQuery1;

            let strQuery2 = strQuery;
            if ((app.H2O_ID == "Blackfoot") | (app.H2O_ID == "Upper Clark Fork")) {
                strQuery2 += " OR (GageID_Source = '12334550')"
            }
            q_Layer2.where = strQuery2;

            let strQuery3 = strQuery.replace("Watershed in", "Watershed_Name in").replace("Watershed =", "Watershed_Name =")
            q_Layer3.where = strQuery3;

            var pLayer1, pLayer2, pLayer3, pPromises;
            pLayer1 = qt_Layer1.execute(q_Layer1);
            pLayer2 = qt_Layer2.execute(q_Layer2);
            pLayer3 = qt_Layer3.execute(q_Layer3);
            pPromises = new All([pLayer1, pLayer2, pLayer3]);
            //pPromises = new All([pLayer1, pLayer2]);
            pPromises.then(this.handleSectionGageResults, this.err);
        },

        ViewModel2TMP: function () {  //this is for google charts
            //https://developers.google.com/chart/interactive/docs/datatables_dataviews
            var self = this;
            self.ViewModel2TMP_LineData = ko.computed(function () {
                var strIDTemp = "";
                var arraystrIDs = [];
                var arrayPrelimData_1 = [];
                var arrayPrelimData_2 = [];
                var arrayPrelimData_3 = [];

                var uniqueSiteIDs = [];  //Remove duplicates from the siteid array
                $.each(app.pGage.m_arrray_StationIDsTMP, function (i, el) {
                    if ($.inArray(el, uniqueSiteIDs) === -1) uniqueSiteIDs.push(el);
                });

                blnSingleCharting = false;
                var iChart_TMP_ColumnNames = [];
                if (app.pGage.m_arrray_Detail4ChartTMP.length > 0) {//get the 1st gagedate form comparrison 
                    var dteDateTimeTemp = app.pGage.m_arrray_Detail4ChartTMP[0].gagedatetime;

                    if (app.pGage.m_arrray_StationIDsTMP.length == 1) {
                        blnSingleCharting = true;
                        var iTMPTarget1 = app.pGage.m_arrray_Detail4ChartTMP[0].TMPTarget1;

                        if (iTMPTarget1 != undefined) {
                            if (!(isNaN(iTMPTarget1))) {
                                iTMPTarget1 = Number(iTMPTarget1)
                                if (iTMPTarget1 != 0) {
                                    iChart_TMP_ColumnNames.push(iTMPTarget1.toString() + "Consv. Target");
                                }
                            }
                        }
                    }
                }

                for (var i = 0; i < app.pGage.m_arrray_Detail4ChartTMP.length; i++) {
                    var strID = app.pGage.m_arrray_Detail4ChartTMP[i].id;
                    var dteDateTime = app.pGage.m_arrray_Detail4ChartTMP[i].gagedatetime;
                    var iTMPVal = app.pGage.m_arrray_Detail4ChartTMP[i].TMP;

                    if (dteDateTimeTemp.toString() != dteDateTime.toString()) {
                        var iHours = dteDateTime.getHours();
                        var iMinutes = dteDateTime.getMinutes();
                        var dteDate4Charting = new Date(dteDateTime.getFullYear(), dteDateTime.getMonth(), dteDateTime.getDate(), iHours, iMinutes, 0, 0);

                        arrayPrelimData_2 = [dteDate4Charting];

                        for (var ii = 0; ii < uniqueSiteIDs.length; ii++) {
                            var strID2 = uniqueSiteIDs[ii];
                            var f;
                            var found = arrayPrelimData_1.some(function (item, index) { f = index; return item.id == strID2; });
                            if (!found) {
                                var iVal2Chart = null;
                            } else {
                                var iVal2Chart = arrayPrelimData_1[f].TMP;
                                if (iVal2Chart == -999999) {
                                    iVal2Chart = null;
                                }
                            }
                            arrayPrelimData_2.push(iVal2Chart);

                            if (blnSingleCharting) {
                                if (iTMPTarget1 != undefined) {
                                    arrayPrelimData_2.push(iTMPTarget1);
                                }
                            }
                        }

                        arrayPrelimData_3.push(arrayPrelimData_2);
                        arrayPrelimData_1 = [];
                    }
                    var obj22 = {};       // build a temporary array of all the cfs values to use when the date/time switches and will grabe appropriate values based on station id as a key
                    obj22["id"] = strID;
                    obj22["TMP"] = iTMPVal;
                    obj22["gagedatetime"] = dteDateTime;
                    arrayPrelimData_1.push(obj22);
                    strIDTemp = strID;
                    dteDateTimeTemp = dteDateTime;
                }

                var strDateColumnName = "DatetimeTMP";
                if (blnSingleCharting) {
                    strDateColumnName += "Single";
                }

                var data = new google.visualization.DataTable();
                data.addColumn('date', strDateColumnName);

                for (var ii = 0; ii < uniqueSiteIDs.length; ii++) {
                    data.addColumn('number', uniqueSiteIDs[ii]);
                }

                if (blnSingleCharting) {
                    for (var ii = 0; ii < iChart_TMP_ColumnNames.length; ii++) {
                        data.addColumn('number', iChart_TMP_ColumnNames[ii]);
                    }
                }

                data.addRows(arrayPrelimData_3);

                var date_formatter = new google.visualization.DateFormat({  //this will format the crosshair in the google chart
                    pattern: "MMM dd, yyyy HH:mm"
                });
                date_formatter.format(data, 0);

                return data;
            });
        },

        ViewModel2CFS: function () {  //this is for google charts
            //https://developers.google.com/chart/interactive/docs/datatables_dataviews
            var self = this;
            self.ViewModel2CFS_LineData = ko.computed(function () {
                var strIDTemp = "";
                var arraystrIDs = [];
                var arrayPrelimData_1 = [];
                var arrayPrelimData_2 = [];
                var arrayPrelimData_3 = [];

                var uniqueSiteIDs = [];  //Remove duplicates from the siteid array
                $.each(app.pGage.m_arrray_StationIDsCFS, function (i, el) {
                    if ($.inArray(el, uniqueSiteIDs) === -1) uniqueSiteIDs.push(el);
                });

                blnSingleCharting = false;
                var iChart_CFS_ColumnNames = [];
                if (app.pGage.m_arrray_Detail4ChartCFS.length > 0) {//get the 1st gagedate form comparrison 
                    var dteDateTimeTemp = app.pGage.m_arrray_Detail4ChartCFS[0].gagedatetime;

                    if (app.pGage.m_arrray_StationIDsCFS.length == 1) {
                        blnSingleCharting = true;
                        var icfsTarget1 = app.pGage.m_arrray_Detail4ChartCFS[0].cfsTarget1;
                        if (!(isNaN(icfsTarget1))) {
                            icfsTarget1 = Number(icfsTarget1)
                            if (icfsTarget1 != 0) {
                                iChart_CFS_ColumnNames.push(icfsTarget1.toString() + "Consv. Target");
                            }
                        }
                        var icfsTarget2 = app.pGage.m_arrray_Detail4ChartCFS[0].cfsTarget2;
                        if (!(isNaN(icfsTarget2))) {
                            icfsTarget2 = Number(icfsTarget2)
                            if (icfsTarget2 != 0) {
                                iChart_CFS_ColumnNames.push(icfsTarget2.toString() + "Consv. Target");
                            }
                        }
                        var icfsTarget3 = app.pGage.m_arrray_Detail4ChartCFS[0].cfsTarget3;
                        if (!(isNaN(icfsTarget3))) {
                            icfsTarget3 = Number(icfsTarget3)
                            if (icfsTarget3 != 0) {
                                iChart_CFS_ColumnNames.push(icfsTarget3.toString() + "Consv. Target");
                            }
                        }
                        //iChart_CFS_ColumnNames = [icfsTarget1.toString() + "Consv. Target", icfsTarget2.toString() + "Consv. Target", icfsTarget3.toString() + "Consv. Target"];
                    }
                } else if (app.pGage.m_arrray_Detail4ChartHistoryCFS.length > 0) {  //if historical data AND NO CURRNET DATA, only gathered for single sections, then add the the datatable
                    for (var ih = 0; ih < app.pGage.m_arrray_Detail4ChartHistoryCFS.length; ih++) {
                        arrayPrelimData_3.push([app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].gagedatetime, null, Number(app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].cfs)])  //add historical to an array to chart without other values
                        for (var iAddhr = 15; iAddhr < 1440; iAddhr += 15) {
                            var dteDate4Null = new Date(app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].gagedatetime);
                            dteDate4Null.setMinutes(dteDate4Null.getMinutes() + iAddhr);
                            arrayPrelimData_3.push([dteDate4Null, null, null])  //add historical to an array to chart without other values
                        }
                    }
                }

                for (var i = 0; i < app.pGage.m_arrray_Detail4ChartCFS.length; i++) {
                    var strID = app.pGage.m_arrray_Detail4ChartCFS[i].id;
                    var dteDateTime = app.pGage.m_arrray_Detail4ChartCFS[i].gagedatetime;
                    var iCFSVal = app.pGage.m_arrray_Detail4ChartCFS[i].cfs;

                    var obj22 = {};       // build a temporary array of all the cfs values to use when the date/time switches and will grabe appropriate values based on station id as a key
                    obj22["id"] = strID;
                    obj22["cfs"] = iCFSVal;
                    obj22["gagedatetime"] = dteDateTime;
                    arrayPrelimData_1.push(obj22);


                    //if (dteDateTimeTemp.toString() != dteDateTime.toString()) {                        ///edited this on 1/12/2024
                    if ((i == 0) | (dteDateTimeTemp.toString() != dteDateTime.toString())) {
                        var iHours = dteDateTime.getHours();
                        var iMinutes = dteDateTime.getMinutes();
                        var dteDate4Charting = new Date(dteDateTime.getFullYear(), dteDateTime.getMonth(), dteDateTime.getDate(), iHours, iMinutes, 0, 0);

                        arrayPrelimData_2 = [dteDate4Charting];

                        for (var ii = 0; ii < uniqueSiteIDs.length; ii++) {
                            var strID2 = uniqueSiteIDs[ii];
                            var f;
                            var found = arrayPrelimData_1.some(function (item, index) { f = index; return item.id == strID2; });
                            if (!found) {
                                var iVal2Chart = null;
                            } else {
                                var iVal2Chart = arrayPrelimData_1[f].cfs;
                                if (iVal2Chart == -999999) {
                                    iVal2Chart = null;
                                }
                            }
                            arrayPrelimData_2.push(iVal2Chart);
                            if (blnSingleCharting) {
                                if (icfsTarget1 != 0) {
                                    arrayPrelimData_2.push(icfsTarget1);
                                }
                                if (icfsTarget2 != 0) {
                                    arrayPrelimData_2.push(icfsTarget2);
                                }
                                if (icfsTarget3 != 0) {
                                    arrayPrelimData_2.push(icfsTarget3);
                                }
                            }
                        }

                        if (app.pGage.m_arrray_Detail4ChartHistoryCFS.length > 0) {  //if historical data, only gathered for single sections, then add the the datatable
                            if ((iHours == 12) & (iMinutes == 00)) {
                                for (var ih = 0; ih < app.pGage.m_arrray_Detail4ChartHistoryCFS.length; ih++) {
                                    var dteDate4ChartingHistorycheck = dteDateTime.getFullYear() + "-" + ("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTime.getDate()).slice(-2);

                                    if (app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].date == dteDate4ChartingHistorycheck) {  //At the New Year, this does get messed up for a few days for USGS gages
                                        arrayPrelimData_2.push(Number(app.pGage.m_arrray_Detail4ChartHistoryCFS[ih].cfs))  //convert the string value to number type
                                        break;  //if found then don't check for more for this date/time
                                    }
                                }
                            } else {
                                arrayPrelimData_2.push(null)
                            }
                            //console.log("History found for");
                        } else {
                            //console.log("no history found for");
                        }

                        arrayPrelimData_3.push(arrayPrelimData_2);
                        arrayPrelimData_1 = [];
                    }

                    //edited on 1/12/2024
                    //var obj22 = {};       // build a temporary array of all the cfs values to use when the date/time switches and will grabe appropriate values based on station id as a key
                    //obj22["id"] = strID;
                    //obj22["cfs"] = iCFSVal;
                    //obj22["gagedatetime"] = dteDateTime;
                    //arrayPrelimData_1.push(obj22);


                    strIDTemp = strID;
                    dteDateTimeTemp = dteDateTime;
                }

                var data = new google.visualization.DataTable();
                var strDateColumnName = "DatetimeCFS";
                if (blnSingleCharting) {
                    strDateColumnName += "Single";
                }

                data.addColumn('date', strDateColumnName);
                for (var ii = 0; ii < uniqueSiteIDs.length; ii++) {
                    data.addColumn('number', uniqueSiteIDs[ii]);
                }

                if (blnSingleCharting) {
                    for (var ii = 0; ii < iChart_CFS_ColumnNames.length; ii++) {
                        data.addColumn('number', iChart_CFS_ColumnNames[ii]);
                    }
                }

                if (app.pGage.m_arrray_Detail4ChartHistoryCFS.length > 0) {
                    data.addColumn('number', "Historical Daily Mean");
                }

                data.addRows(arrayPrelimData_3);

                var date_formatter = new google.visualization.DateFormat({  //this will format the crosshair in the google chart
                    pattern: "MMM dd, yyyy HH:mm"
                });
                date_formatter.format(data, 0);

                return data;
            });
        },

        ViewModel2Ht: function () {  //this is for google charts
            //https://developers.google.com/chart/interactive/docs/datatables_dataviews
            var self = this;
            self.ViewModel2Ht_LineData = ko.computed(function () {
                var strIDHt = "";
                var arraystrIDs = [];
                var arrayPrelimData_1 = [];
                var arrayPrelimData_2 = [];
                var arrayPrelimData_3 = [];

                var uniqueSiteIDs = [];  //Remove duplicates from the siteid array
                $.each(app.pGage.m_arrray_StationIDsHt, function (i, el) {
                    if ($.inArray(el, uniqueSiteIDs) === -1) uniqueSiteIDs.push(el);
                });

                blnSingleCharting = false;
                var iChart_Ht_ColumnNames = [];
                if (app.pGage.m_arrray_Detail4ChartHt.length > 0) {//get the 1st gagedate form comparrison
                    var dteDateTimeTemp = app.pGage.m_arrray_Detail4ChartHt[0].gagedatetime;

                    if (app.pGage.m_arrray_StationIDsHt.length == 1) {
                        blnSingleCharting = true;
                        var iHtTarget1 = app.pGage.m_arrray_Detail4ChartHt[0].HtTarget1;
                        if (!(isNaN(iHtTarget1))) {
                            iHtTarget1 = Number(iHtTarget1)
                            if (iHtTarget1 != 0) {
                                iChart_Ht_ColumnNames.push(iHtTarget1.toString() + "Consv. Target");
                            }
                        }
                        var iHtTarget2 = app.pGage.m_arrray_Detail4ChartHt[0].HtTarget2;
                        if (!(isNaN(iHtTarget2))) {
                            iHtTarget2 = Number(iHtTarget2)
                            if (iHtTarget2 != 0) {
                                iChart_Ht_ColumnNames.push(iHtTarget2.toString() + "Consv. Target");
                            }
                        }
                        var iHtTarget3 = app.pGage.m_arrray_Detail4ChartHt[0].HtTarget3;
                        if (!(isNaN(iHtTarget3))) {
                            iHtTarget3 = Number(iHtTarget3)
                            if (iHtTarget3 != 0) {
                                iChart_Ht_ColumnNames.push(iHtTarget3.toString() + "Consv. Target");
                            }
                        }
                    }
                }

                for (var i = 0; i < app.pGage.m_arrray_Detail4ChartHt.length; i++) {
                    var strID = app.pGage.m_arrray_Detail4ChartHt[i].id;
                    var dteDateTime = app.pGage.m_arrray_Detail4ChartHt[i].gagedatetime;
                    var iHtVal = app.pGage.m_arrray_Detail4ChartHt[i].Ht;

                    if (dteDateTimeTemp.toString() != dteDateTime.toString()) {
                        var iHours = dteDateTime.getHours();
                        var iMinutes = dteDateTime.getMinutes();
                        var dteDate4Charting = new Date(dteDateTime.getFullYear(), dteDateTime.getMonth(), dteDateTime.getDate(), iHours, iMinutes, 0, 0);

                        arrayPrelimData_2 = [dteDate4Charting];

                        for (var ii = 0; ii < uniqueSiteIDs.length; ii++) {
                            var strID2 = uniqueSiteIDs[ii];
                            var f;
                            var found = arrayPrelimData_1.some(function (item, index) { f = index; return item.id == strID2; });
                            if (!found) {
                                var iVal2Chart = null;
                            } else {
                                var iVal2Chart = arrayPrelimData_1[f].Ht;
                                if (iVal2Chart == -999999) {
                                    iVal2Chart = null;
                                }
                            }
                            arrayPrelimData_2.push(iVal2Chart);

                            if (blnSingleCharting) {
                                if ((iHtTarget1 != 0) & (iHtTarget1 != undefined)) {
                                    arrayPrelimData_2.push(iHtTarget1);
                                }
                                if ((iHtTarget2 != 0) & (iHtTarget2 != undefined)) {
                                    arrayPrelimData_2.push(iHtTarget2);
                                }
                                if ((iHtTarget3 != 0) & (iHtTarget3 != undefined)) {
                                    arrayPrelimData_2.push(iHtTarget3);
                                }
                            }
                        }

                        arrayPrelimData_3.push(arrayPrelimData_2);
                        arrayPrelimData_1 = [];
                    }
                    var obj22 = {};       // build a temporary array of all the Ht values to use when the date/time switches and will grabe appropriate values based on station id as a key
                    obj22["id"] = strID;
                    obj22["Ht"] = iHtVal;
                    obj22["gagedatetime"] = dteDateTime;
                    arrayPrelimData_1.push(obj22);
                    strIDTemp = strID;
                    dteDateTimeTemp = dteDateTime;
                }

                var data = new google.visualization.DataTable();
                var strDateColumnName = "DatetimeHt";
                if (blnSingleCharting) {
                    strDateColumnName += "Single";
                }

                data.addColumn('date', strDateColumnName);
                for (var ii = 0; ii < uniqueSiteIDs.length; ii++) {
                    data.addColumn('number', uniqueSiteIDs[ii]);
                }

                if (blnSingleCharting) {
                    for (var ii = 0; ii < iChart_Ht_ColumnNames.length; ii++) {
                        data.addColumn('number', iChart_Ht_ColumnNames[ii]);
                    }
                }

                data.addRows(arrayPrelimData_3);
                var date_formatter = new google.visualization.DateFormat({  //this will format the crosshair in the google chart
                    pattern: "MMM dd, yyyy HH:mm"
                });
                date_formatter.format(data, 0);

                return data;
            });
        },


        GetDatesForRunningRCT: function () {
            let dteDateTime = new Date();
            let strDateTime = dteDateTime.getFullYear() + "-" + ("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTime.getDate()).slice(-2);
            let strDateTimeUserFreindly = (dteDateTime.getMonth() + 1) + "/" + dteDateTime.getDate() + "/" + dteDateTime.getFullYear();
            let dteDateTimeMinus3 = new Date();
            dteDateTimeMinus3.setDate(dteDateTimeMinus3.getDate() - 3);
            let strDateTimeMinus3 = dteDateTimeMinus3.getFullYear() + "-" + ("0" + (dteDateTimeMinus3.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTimeMinus3.getDate()).slice(-2);
            let strDateTimeMinus3UserFreindly = (dteDateTimeMinus3.getMonth() + 1) + "/" + dteDateTimeMinus3.getDate() + "/" + dteDateTimeMinus3.getFullYear();
            return [strDateTimeMinus3, strDateTime, strDateTimeMinus3UserFreindly, strDateTimeUserFreindly];
        },

        readingsViewModel: function () {
            console.log("readingsViewModel");
            var self = this;




            for (var iPropogate = 0; iPropogate < app.pGage.m_arrray_RiverSectionStatus.length; iPropogate++) {   ///// propogate summary symbol color and conservatin message if special use case (i.e., Turah, Big Hole Section 4)
                if (((app.pGage.m_arrray_RiverSectionStatus[iPropogate][0] == "(Clark Fork at Turah Bridge nr Bonner MT)") | (app.pGage.m_arrray_RiverSectionStatus[iPropogate][22] == "06026210") | (app.pGage.m_arrray_RiverSectionStatus[iPropogate][22] == "06025500")) &
                    (["EXPANDED CONSERVATION MEASURES", "PREPARE FOR CONSERVATION", "CONSERVATION"].includes(app.pGage.m_arrray_RiverSectionStatus[iPropogate][7]))) {
                        
                    let strConsMessage = app.pGage.m_arrray_RiverSectionStatus[iPropogate][7];
                    let strColor = app.pGage.m_arrray_RiverSectionStatus[iPropogate][31];
                    let strSearchIDXStreamName = null;
                    let strSearchIDXSectionName = null;
                    let ArrayBasin2Check = [];
                    let ArrayWatershed2Check = [];
                    let ArrayStreamName2Check = [];
                    let ArrayStreamSection2Check = [];

                    strRelatedStreamsQuery = app.pSup.getQueryDefs1_4()[5];
                    strRelatedStreamsQuery = strRelatedStreamsQuery.replaceAll("'", "");  //remove the single quotes, to make sure string conditional statement works below
                    
                    let strSearchString = "SectionName in ";
                    let idxStringFound = strRelatedStreamsQuery.indexOf(strSearchString);
                    let strTMPResult = "";
                    let strSplitStringSearch = ") OR (StreamName in "
                    let blnSearchByStreamname_Section = true;

                    if (idxStringFound > -1) {                                                                                                                              //sections
                        strTMPResult = strRelatedStreamsQuery.substring(idxStringFound + strSearchString.length + 1, strRelatedStreamsQuery.indexOf(strSplitStringSearch) -1);
                        ArrayStreamSection2Check = strTMPResult.split(",");
                        strTMPResult = strRelatedStreamsQuery.substring(strRelatedStreamsQuery.indexOf(strSplitStringSearch) + strSplitStringSearch.length + 1, strRelatedStreamsQuery.length - 2);
                        ArrayStreamName2Check = strTMPResult.split(",");
                        strSearchIDXStreamName = 9;  //"StreamName"
                        strSearchIDXSectionName = 35; //"SectionName"
                    } else {                                                                                                                                                //basins
                        blnSearchByStreamname_Section = false;
                        let strSearchString = "Basin = ";
                        let strSplitStringSearch = ") OR (Watershed in "
                        strTMPResult = strRelatedStreamsQuery.substring(idxStringFound + strSearchString.length + 1, strRelatedStreamsQuery.indexOf(strSplitStringSearch) - 1);
                        ArrayStreamSection2Check = strTMPResult.split(",");
                        strTMPResult = strRelatedStreamsQuery.substring(strRelatedStreamsQuery.indexOf(strSplitStringSearch) + strSplitStringSearch.length + 1, strRelatedStreamsQuery.length - 2);
                        ArrayStreamName2Check = strTMPResult.split(",");
                    }

                    for (var iPropogateEdit = 0; iPropogateEdit < app.pGage.m_arrray_RiverSectionStatus.length; iPropogateEdit++) {                 //if the summary list item matches the streamname or section name then change the color and status
                        let blnFound = false;
                        if (blnSearchByStreamname_Section) {
                            for (var iStreamName2Match = 0; iStreamName2Match < ArrayStreamName2Check.length; iStreamName2Match++) {
                                if (ArrayStreamName2Check[iStreamName2Match] == app.pGage.m_arrray_RiverSectionStatus[iPropogateEdit][strSearchIDXStreamName]) {
                                    blnFound = true;
                                    break
                                }
                            }
                            if (!blnFound) {
                                for (var iSectionName2Match = 0; iSectionName2Match < ArrayStreamSection2Check.length; iSectionName2Match++) {
                                    if (ArrayStreamSection2Check[iSectionName2Match] == app.pGage.m_arrray_RiverSectionStatus[iPropogateEdit][strSearchIDXSectionName]) {
                                        blnFound = true;
                                        break
                                    }
                                }
                            }
                        } else {
                            blnFound = true;
                        }
                        if (blnFound) {

                            let strConcatSpecialMessage = "";
                            let strSpecialMessage = "";

                            if ((app.Basin_ID == "Upper Clark Fork") | (app.H2O_ID == "Blackfoot") | (app.H2O_ID == "Upper Clark Fork")) {
                                strConcatSpecialMessage = ", Click the Clark Fork Section 6/Turah gage for more information";
                                strSpecialMessage = " due to the Clark Fork Section 6/Turah gage (Click Clark Fork Section 6 for more information)";
                            } else if ((app.Basin_ID == "UMH") | (app.H2O_ID == "Big Hole")) {
                                strConcatSpecialMessage = ", Click the Big Hole Seciton 4 summaries for more information";
                                strSpecialMessage = " due to one of the Big Hole Seciton 4 gages (Click Big Hole Seciton 4 summaries for more information)";
                            }



                            if (app.pGage.m_arrray_RiverSectionStatus[iPropogateEdit][7] != "OPEN") {
                                app.pGage.m_arrray_RiverSectionStatus[iPropogateEdit][30] += strConcatSpecialMessage;
                            } else {
                                app.pGage.m_arrray_RiverSectionStatus[iPropogateEdit][7] = strConsMessage;
                                app.pGage.m_arrray_RiverSectionStatus[iPropogateEdit][30] = strConsMessage + strSpecialMessage;
                                app.pGage.m_arrray_RiverSectionStatus[iPropogateEdit][31] = strColor;
                            }
                        }
                    };
                }
             };




            app.pGage.m_arrray_RiverSectionStatus =
                app.pGage.m_arrray_RiverSectionStatus.sort(function (a, b) { return a[9]+a[10] > b[9]+b[10] ? 1 : -1; }); //sorting by contcatonating stream name and secitonID

            if (typeof app.pGage.m_arrray_RiverSectionStatus !== "undefined") {//this feed then gageReadings: function 
                var arrayKOTemp = [];
                for (var i = 0; i < app.pGage.m_arrray_RiverSectionStatus.length; i++)
                    arrayKOTemp.push(new app.pGage.gageReadings(app.pGage.m_arrray_RiverSectionStatus[i][0],   
                                                                app.pGage.m_arrray_RiverSectionStatus[i][1],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][2],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][3],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][4],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][5],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][6],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][7],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][8],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][9],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][10],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][11],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][12],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][13],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][14],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][15],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][16],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][17],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][18],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][19],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][20],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][21],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][22],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][23],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][24],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][25],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][26],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][27],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][28],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][29],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][30],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][31],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][32],
																app.pGage.m_arrray_RiverSectionStatus[i][33],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][34],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][35],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][36],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][37],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][38],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][39],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][40],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][41],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][42],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][43],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][44],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][45],
                                                                app.pGage.m_arrray_RiverSectionStatus[i][46]));

                self.gageRecords = ko.observableArray(arrayKOTemp);
                
                self.CurrentDisplayGageRecord = ko.observable(self.gageRecords()[0]);
                self.selectThing = function (item) {
                    document.getElementById("divSectionDetail_A").style.display = 'inline';
                    document.getElementById("divSectionDetail_B").style.display = 'inline';
                    document.getElementById("divSectionDetail_C").style.display = 'inline';

                    if (((item.iLateFlowPref4ConsvValue == null) | (item.iLateFlowPref4ConsvValue == 0)) &
                        ((item.iLateFlowConsvValue == null) | (item.iLateFlowConsvValue == 0)) &
                        ((item.iLateFlowClosureValueFlow == null) | (item.iLateFlowClosureValueFlow == 0))) {
                        document.getElementById("divCFSTargetDefinitions").style.display = 'none';
                    } else {
                        if (app.Basin_ID == "Smith") {
                            document.getElementById("divCFSTargetDefinitions").style.display = 'none';
                            document.getElementById("divCFSTargetDefinitionsREC").style.display = 'inline';

                        } else {
                            document.getElementById("divCFSTargetDefinitions").style.display = 'inline';
                            document.getElementById("divCFSTargetDefinitionsREC").style.display = 'none';
                        }
                    }


                    if (((item.iLateHtPref4ConsvValue == null) | (item.iLateHtPref4ConsvValue == 0)) &
                        ((item.iLateHtConsvValue == null) | (item.iLateHtConsvValue == 0)) &
                        ((item.iLateHtClosureValue == null) | (item.iLateHtClosureValue == 0))) {
                        document.getElementById("divHtTargetDefinitions").style.display = 'none';
                    } else {
                        document.getElementById("divHtTargetDefinitions").style.display = 'inline';
                    }


                    if ((item.strDailyStat_URL == null) | (item.strDailyStat_URL == "")) {
                        document.getElementById("detailSectionUSGSHistorical").style.display = 'none';
                    } else {
                        document.getElementById("detailSectionUSGSHistorical").style.display = 'inline';
                    }

                    if ((item.Hyperlink == null) | (item.Hyperlink == undefined)) {
                        document.getElementById("detailSectionUSGSCurrent").style.display = 'none';
                    } else {
                        document.getElementById("detailSectionUSGSCurrent").style.display = 'inline';
                    }

                    if ((item.fwpTITLE == "") | (item.fwpTITLE == "") | (item.fwpTITLE == "")) {
                        document.getElementById("detailSection2").style.display = 'none';
                    } else {
                        $("#detailSection2").show();
                    }
                    
                    if ((item.Day3CFSTrend == undefined) | (item.Day3CFSTrend == "images/blank.png")) {
                        document.getElementById("divDay3CFSTrend").style.display = 'none';
                    } else {
                        $("#divDay3CFSTrend").show();
                    }

                    if ((item.Day3TMPTrend == undefined) | (item.Day3TMPTrend == "images/blank.png")) {
                        document.getElementById("divDay3TMPTrend").style.display = 'none';
                    } else {
                        $("#divDay3TMPTrend").show();
                    }

                    if ((item.Day3HtTrend == undefined) | (item.Day3HtTrend == "images/blank.png")) {
                        document.getElementById("divDay3HtTrend").style.display = 'none';
                    } else {
                        $("#divDay3HtTrend").show();
                    }

                    
                    self.CurrentDisplayGageRecord(item);
                };
                self.avgTemp = ko.computed(function () {
                    var total = 0;
                    for (var i = 0; i < self.gageRecords().length; i++)
                        total += self.gageRecords()[i].rWaterTemp;
                    dblAverage = total / self.gageRecords().length;
                    return dblAverage;
                });
            } else {
                var currentdate = new Date();
                self.gageRecords = ko.observableArray([new app.pGage.gageReadings("", "", currentdate, 0, "", currentdate, 0, "")]);
            }

        },
        
        Start: function (dteStartDay2Check, dteEndDay2Check) {

            app.bln_USGS_Src_NeedsProc = false;
            app.bln_CODWR_Src_NeedsProc = false;
            app.bln_MTDNRC_Src_NeedsProc = false;
            app.bln_USACE_NWD_Src_NeedsProc = false;

            this.dteStartDay2Check = dteStartDay2Check;
            this.dteEndDay2Check = dteEndDay2Check;

			strQuery = app.SectionQryStringGetGageData;

            this.getArray2Process(app.strHFL_URL, strQuery);
        },

		GraphSingleSEction: function (strStreamName, iSectionID, strSiteID, iCFSTarget1, iCFSTarget2, iCFSTarget3,
            strDailyStat_URL, iTMPTarget1, strAgency, iHtTarget1, iHtTarget2, iHtTarget3) {
            app.pGage.m_arrray_StationIDsTMP = [];
            app.pGage.m_arrray_StationIDsCFS = [];
            app.pGage.m_arrray_StationIDsHt = [];
            app.pGage.m_arrray_Detail4ChartTMP = [];
            app.pGage.m_arrray_Detail4ChartHistoryTMP = [];
            app.pGage.m_arrray_Detail4ChartCFS = [];
            app.pGage.m_arrray_Detail4ChartHistoryCFS = [];
            app.pGage.m_arrray_Detail4ChartHt = [];
            app.pGage.m_arrray_Detail4ChartHistoryHt = [];


            var dteDateTimeMinus0 = new Date();
            dteDateTimeMinus0.setDate(dteDateTimeMinus0.getDate() - 0);
            var dteDateTimeMinus1 = new Date();
            dteDateTimeMinus1.setDate(dteDateTimeMinus1.getDate() - 1);
            var dteDateTimeMinus2 = new Date();
            dteDateTimeMinus2.setDate(dteDateTimeMinus2.getDate() - 2);
            var dteDateTimeMinus3 = new Date();
            dteDateTimeMinus3.setDate(dteDateTimeMinus3.getDate() - 3);

            var idxMonth = 0;
            var idxMonth2 = 0;
            var idxDay = 0;
            var idxDay2 = 0;
            var idxMean = 0;

            var arrayMonthsDays = [[(dteDateTimeMinus3.getMonth() + 1).toString(), dteDateTimeMinus3.getDate().toString()],
                                    [(dteDateTimeMinus2.getMonth() + 1).toString(), dteDateTimeMinus2.getDate().toString()],
                                    [(dteDateTimeMinus1.getMonth() + 1).toString(), dteDateTimeMinus1.getDate().toString()],
                                    [(dteDateTimeMinus0.getMonth() + 1).toString(), dteDateTimeMinus0.getDate().toString()]];
            var iMean = 0;
            
            //get the summary output USGS daily mean data, unfortunately this is not available in JSON format
            //var strURL = "https://nwis.waterdata.usgs.gov/nwis/dvstat?&site_no=" + strSiteID + "&agency_cd=USGS&por_" + strSiteID + "_80655=64907,00060,80655,1950-10-01,2017-10-29&stat_cds=mean_va&referred_module=sw&format=rdb";
            //  var strURL = "https://nwis.waterdata.usgs.gov/nwis/dvstat?&site_no=" + strSiteID + "&agency_cd=USGS&por_" + strSiteID + "_80888=65063,00060,80888,1893-10-01,2017-10-29&stat_cds=mean_va&format=rdb";
			var strURL = strDailyStat_URL;
            if ((strAgency == "MTDNRC") | (strAgency == "CODWR") | (strAgency == "USACE-NWD")) {
				strURL = "";
            }

			console.log("retreiving historical information");

            $.get(strURL)   //http://api.jquery.com/jquery.getjson/
                .done(function (webpageResult) {  //relying on the output from usgs incrementing through the calendar
                    $.each(webpageResult.split('\n'), function (index) {  //https://stackoverflow.com/questions/15009744/how-to-iterate-over-a-javascript-line-delimited-string-check-the-semi-colon-del
                        if (this.charAt(0) != "#") {
                            var arrayTabs = this.split('\t');

                            if (arrayTabs.indexOf("month_nu") > -1) {
                                idxMonth = arrayTabs.indexOf("month_nu");
                                idxDay = arrayTabs.indexOf("day_nu");
                                idxMean = arrayTabs.indexOf("p50_va");  //when looking at the USGS charting, they are using this column vs the mean_va column
                            } else {
                                if (isNaN(arrayTabs[idxMonth])) {
                                    //console.log("This line describes the tab formatting and does not contain data");
                                } else {
                                    var tempArrayMonthDay = [arrayTabs[idxMonth], arrayTabs[idxDay]];
                                    
                                    for (var i = 0, len = arrayMonthsDays.length; i < len; i++) {  //loop through the days we're looking for, if on of the last 3 days then push into an array
                                        if ((arrayMonthsDays[i][0] === arrayTabs[idxMonth]) & (arrayMonthsDays[i][1] === arrayTabs[idxDay])) {
                                            var dteDate4Charting = new Date(dteDateTimeMinus0.getFullYear(), (arrayTabs[idxMonth] - 1), arrayTabs[idxDay], 12, 0, 0, 0);
                                            var obj = {};
                                            obj["id"] = strStreamName + "," + iSectionID;
                                            obj["date"] = dteDate4Charting.getFullYear() + "-" + ("0" + (dteDate4Charting.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDate4Charting.getDate()).slice(-2);
                                            obj["time"] = dteDate4Charting.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
                                            obj["cfs"] = arrayTabs[idxMean];
                                            obj["gagedatetime"] = dteDate4Charting;
                                            app.pGage.m_arrray_Detail4ChartHistoryCFS.push(obj);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    });

					var streamSectionArrray = [];
					streamSectionArrray.push([strStreamName, strSiteID, iSectionID, strAgency]);
                    app.pGage.SectionsReceived(streamSectionArrray, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, false,
                        iHtTarget1, iHtTarget2, iHtTarget3);

                    //app.map.enableMapNavigation();
                    //app.map.showZoomSlider();
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });
        },

        StreamSectionSummaryUIAdditions: function (blnIsInitialPageLoad) {
            if (blnIsInitialPageLoad) {
                app.blnZoom = true; //this controls zooming to sections if user clicks a summary or if clicks on map
                var vm = new app.pGage.readingsViewModel();
                ko.applyBindings(vm, document.getElementById("entriesCon_div"));
                ko.applyBindings(vm, document.getElementById("divSectionDetail_A"));
                ko.applyBindings(vm, document.getElementById("divSectionDetail_B"));
                ko.applyBindings(vm, document.getElementById("divSectionDetail_C"));

                //var elements = document.getElementsByTagName('tr');  //Sets the click event for the row
                var table = document.getElementById("entries");
                var rows = table.getElementsByTagName("tr");

                var str_overallSymbool = "";
                for (var i = 0; i < rows.length; i++) {
                    (rows)[i].addEventListener("click", function () {
                        var strTempText = this.innerHTML;  //parse the section summary text to set var's for charting and zooming
                        strTempText = strTempText.substring(strTempText.indexOf("StreamName") + ("StreamName".length + 2), strTempText.length);
                        let strClickStreamName = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("SectionName_") + ("SectionName_".length + 2), strTempText.length);
                        let strClickSectionName_ = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("iLateFlowPref4ConsvValue") + ("iLateFlowPref4ConsvValue".length + 2), strTempText.length);
                        let iCFSTarget1 = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("iLateFlowConsvValue") + ("iLateFlowConsvValue".length + 2), strTempText.length);
                        let iCFSTarget2 = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("iLateFlowClosureValueFlow") + ("iLateFlowClosureValueFlow".length + 2), strTempText.length);
                        let iCFSTarget3 = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("iLateHtPref4ConsvValue") + ("iLateHtPref4ConsvValue".length + 2), strTempText.length);
                        let iHtTarget1 = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("iLateHtConsvValue") + ("iLateHtConsvValue".length + 2), strTempText.length);
                        let iHtTarget2 = strTempText.substring(0, strTempText.indexOf("</span>"));
                        strTempText = strTempText.substring(strTempText.indexOf("iLateHtClosureValue") + ("iLateHtClosureValue".length + 2), strTempText.length);
                        let iHtTarget3 = strTempText.substring(0, strTempText.indexOf("</span>"));


                        strTempText = strTempText.substring(strTempText.indexOf("iTempClosureValue") + ("iTempClosureValue".length + 2), strTempText.length);
                        let iTempCloseValue = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("strSiteID") + ("strSiteID".length + 2), strTempText.length);
                        let strClickSiteID = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("SectionID") + ("SectionID".length + 2), strTempText.length);
                        let strClickSegmentID = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("strDailyStat_URL") + ("strDailyStat_URL".length + 2), strTempText.length);
                        let strDailyStat_URL = strTempText.substring(0, strTempText.indexOf("</span>"));

						strTempText = strTempText.substring(strTempText.indexOf("Watershed") + ("Watershed".length + 2), strTempText.length);
                        let strWatershed = strTempText.substring(0, strTempText.indexOf("</span>"));

						strTempText = strTempText.substring(strTempText.indexOf("Agency") + ("Agency".length + 2), strTempText.length);
                        let strAgency = strTempText.substring(0, strTempText.indexOf("</span>"));

                        //app.dblExpandNum = 1.5;
                        app.dblExpandNum = 0.8;

                        if (app.StateArea.indexOf("MT") > -1) {  //since the historical function is only applicable to MT, only show if in MT
                            $("#btnGetHistoricRestrctions").show();
                        }

                        if ($("#ViewModelHistoricRestrctions_div").attr("aria-expanded")) {
							$("#divHistoricRecordText").html("");
							$("#ViewModelHistoricRestrctions_div").collapse("hide");
						}

                        let xN = document.getElementById("btnHistsortByName");
						xN.style.display = "none";
                        let xP = document.getElementById("btnHistsortByPubDate");
						xP.style.display = "none";
						
						$('#btnGetHistoricRestrctions').off('click');     //clear's any click event previoulsy set
                        $("#btnGetHistoricRestrctions").click(function () {
							console.log(strClickStreamName + ":" + strClickSegmentID)
							app.pGetHistWarn.Start(strClickStreamName, strClickSegmentID);
							$("#btnGetHistoricRestrctions").hide();
                        });

						app.pGage.GraphSingleSEction(strClickStreamName, strClickSegmentID, strClickSiteID,
													iCFSTarget1, iCFSTarget2, iCFSTarget3, strDailyStat_URL, 
                                                iTempCloseValue, strAgency, iHtTarget1, iHtTarget2, iHtTarget3);

                        
                        let pGFeature = null;
                        app.pZoom.qry_Zoom2FeatureLayerByQuery(app.strHFL_URL + app.idx11[5], "(StreamName = '" + strClickStreamName + "') and " +
								 							"(SectionID = '" + strClickSegmentID + "') and " +
                                                            "(Watershed = '" + strWatershed + "')", app.blnZoom);
                        app.blnZoom = true; //this controls zooming to sections if user clicks a summary or if clicks on map
                    });

                    var strTempText2 = (rows)[i].innerHTML;
                    strTempText2 = strTempText2.substring(strTempText2.indexOf("overallSymbol") + ("overallSymbol".length + 2), strTempText2.length);
                    var str_overallSymbool = "";
                    str_overallSymbool = strTempText2.substring(0, strTempText2.indexOf("</span>"));

                    if (str_overallSymbool == "Red") {
                        (rows)[i].style.color = 'white';
                        (rows)[i].style.backgroundColor = "rgb(255, 0, 0)";
                    }
                    if (str_overallSymbool == "Orange") {
                        (rows)[i].style.color = 'white';
                        (rows)[i].style.backgroundColor = "rgb(253, 106, 2)";
                    }
                    if (str_overallSymbool == "Gold") {
                        (rows)[i].style.color = 'white';
                        (rows)[i].style.backgroundColor = "rgb(249, 166, 2)";
                    }
                    if (str_overallSymbool == "Plum") {
                        (rows)[i].style.color = 'black';
                        (rows)[i].style.backgroundColor = "rgb(221, 160, 221)";
                    }
                    if (str_overallSymbool == "Yellow") {
                        (rows)[i].style.color = 'black';
                        (rows)[i].style.backgroundColor = "rgb(255, 255, 0)";
                    }
                    if (str_overallSymbool == "Grey") {
                        (rows)[i].style.color = "rgb(128, 128, 128)";
                    }
                    if (str_overallSymbool == "White") {
                        (rows)[i].style.color = 'black';
                    }
                }

                app.pSup.addStreamConditionFeatureLayer(m_arrayOIDYellow, m_arrayOIDsGold, m_arrayOIDsOrange, m_arrayOIDsPlum, m_arrayOIDsRed);
                app.pSup.Phase3(m_arrayOIDYellow, m_arrayOIDsGold, m_arrayOIDsOrange, m_arrayOIDsPlum, m_arrayOIDsRed);
                tableHighlightRow();
                document.getElementById("loadingImg2").style.display = "none";
                document.getElementById("divLoadingUSGS").style.display = "none";
            }  //if initial run through, post stream section detail for all the stream sections


            app.pGage.m_arrray_Detail4ChartCFS.sort(function (a, b) {
                var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)
                return dateA - dateB //sort by date ascending
            })
            app.pGage.m_arrray_Detail4ChartTMP.sort(function (a, b) {
                var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)
                return dateA - dateB //sort by date ascending
            })

            app.pGage.m_arrray_Detail4ChartHt.sort(function (a, b) {
                var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)
                return dateA - dateB //sort by date ascending
            })

            var ViewModel2CFS_model = new app.pGage.ViewModel2CFS();
            var elementCFS = $('#ViewModel2CFSBinding_div')[0];
            var ViewModel2TMP_model = new app.pGage.ViewModel2TMP();
            var elementTMP = $('#ViewModel2TMPBinding_div')[0];
            var ViewModel2Ht_model = new app.pGage.ViewModel2Ht();
            var elementHt = $('#ViewModel2HtBinding_div')[0];

            if (!(blnIsInitialPageLoad)) {
                ko.cleanNode(elementCFS);
                ko.cleanNode(elementTMP);
                ko.cleanNode(elementHt);
            }

            ko.applyBindings(ViewModel2CFS_model, document.getElementById("ViewModel2CFSBinding_div"));
            $(window).resize(function () { //this is necessary to call for responsivness since google charts are sized are not changeable, must re-create
                ko.cleanNode(elementCFS);
                ko.applyBindings(ViewModel2CFS_model, document.getElementById("ViewModel2CFSBinding_div"));
            });

            ko.applyBindings(ViewModel2TMP_model, document.getElementById("ViewModel2TMPBinding_div"));
            $(window).resize(function () { //this is necessary to call for responsivness since google charts are sized are not changeable, must re-create
                ko.cleanNode(elementTMP);
                ko.applyBindings(ViewModel2TMP_model, document.getElementById("ViewModel2TMPBinding_div"));
            });

            ko.applyBindings(ViewModel2Ht_model, document.getElementById("ViewModel2HtBinding_div"));
            $(window).resize(function () { //this is necessary to call for responsivness since google charts are sized are not changeable, must re-create
                ko.cleanNode(elementHt);
                ko.applyBindings(ViewModel2Ht_model, document.getElementById("ViewModel2HtBinding_div"));
            });
        },

        DNRCSectionsReceived: function (arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime, blnIsInitialPageLoad,
                                                iHtTarget1, iHtTarget2, iHtTarget3) {  //this is needed to get the SensorID for each location
            console.log("DNRCSectionsReceived start");
            app.bln_MTDNRC_Src_NeedsProc = false;

			var strURLGagePrefix = "https://gis.dnrc.mt.gov/arcgis/rest/services/WRD/WMB_StAGE/MapServer/3/query";
            strURLGagePrefix += "?outFields=*&returnGeometry=false&f=json&where=SensorLabel+in+%28%27discharge%27%2C%27water+temp%27%2C%27working%27%29+and+LocationID+in+";

			var arrayProc2 = [];
			var arraySiteIDsDNRC = [];

			for (var ii in arrayProc) {
				if (arrayProc[ii][1] != null) {
					strAgency = arrayProc[ii][(arrayProc[ii].length - 1)];  //the agency will be the last element in the array.  If loading all sections then array is long, if single click then array is short
					if (strAgency == "MTDNRC") {
						arraySiteIDsDNRC.push(arrayProc[ii][1]);
						//arraySiteIDsDNRC.push(arrayProc[ii]);
						//1. Query the Datasets feature by LocationID to get a list of available sensors(measurement types).
						//				if there's no sensors in a module variable then query for sensors then resend to SectionsReceived
						//				https://gis.dnrc.mt.gov/arcgis/rest/services/WRD/WMB_StAGE/MapServer/3/query?outFields=*&returnGeometry=false&f=json&where=SensorLabel+in+%28%27discharge%27%2C%27water+temp%27%29+and+LocationID+%3D+%27a61e9c1d12b44ee2a7abb8e0020e25a0%27
						//2. Use the SensorID and timestamps to query the timeseries feature for the latest values.
						//				if on resend, there's sensors in the module variable then query for values
					}
				}
			}
			arrayProc2 = arrayProc;
			strSiteIDs = arraySiteIDsDNRC.join("','");
			strSiteIDs = "'" + strSiteIDs + "'"
			strURLGagePrefix += "(" + strSiteIDs + ")";
			app.strURLGage = strURLGagePrefix;

			var arrayDNRC_Sens_Loc = [];

			$.getJSON(app.strURLGage)   //http://api.jquery.com/jquery.getjson/
				.done(function (jsonResult) {
					arrayJSONValues = jsonResult.features;
					for (var i = 0; i < arrayJSONValues.length; i++) {
						arrayDNRC_Sens_Loc.push([arrayJSONValues[i].attributes.LocationID,
							arrayJSONValues[i].attributes.LocationName,
							arrayJSONValues[i].attributes.LocationCode,
							arrayJSONValues[i].attributes.SensorID,
							arrayJSONValues[i].attributes.SensorLabel,
							arrayJSONValues[i].attributes.UnitOfMeasure]
							);
					}
					app.pGage.m_arrayDNRC_Sens_Loc = arrayDNRC_Sens_Loc;
                    app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime,
                        iHtTarget1, iHtTarget2, iHtTarget3)
				})

				.fail(function (jqxhr, textStatus, error) {
					var err = textStatus + ", " + app.strURLGage + ", " + error;
					//alert("Initial query for USGS gage data failed, trying again");
					document.getElementById("divLoadingUSGS").innerHTML = "Loading Gage Data, again";
					console.log("Request Failed: " + err);

					if (!blnQuery1AtaTime) {  //if the USGS api is erroring out try the refactored method
                        app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, true,
                            iHtTarget1, iHtTarget2, iHtTarget3)
					}
				})
				.always(function () {
					if ((!(blnIsInitialPageLoad)) & (app.pGage.m_arrray_StationIDsCFS.length == 0)) {  // in the case of no gage station do the following for the graphing
						dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
							iSectionID = itemSectionRefined[2];
							strStreamName = itemSectionRefined[0];
                            app.pGage.m_arrray_StationIDsTMP.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                            app.pGage.m_arrray_StationIDsCFS.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                            app.pGage.m_arrray_StationIDsHt.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
							app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);
						})
					}
				});

		},


        CODWRSectionsReceived: function (arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime, blnIsInitialPageLoad,
                                            iHtTarget1, iHtTarget2, iHtTarget3) {  //this is needed to get the SensorID for each location
                console.log("CODWRSectionsReceived start");

                app.bln_CODWR_Src_NeedsProc = false;

                //https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrytimeserieshour/?startDate=-3days&abbrev=MANCHICO%2CMANMANCO
                var strURLGagePrefix = "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?abbrev=";
                var arrayProc2 = [];
                var arraySiteIDsCODWR = [];

                for (var ii in arrayProc) {
                    if (arrayProc[ii][1] != null) {
                        strAgency = arrayProc[ii][(arrayProc[ii].length - 1)];  //the agency will be the last element in the array.  If loading all sections then array is long, if single click then array is short
                        if (strAgency == "CODWR") {
                            arraySiteIDsCODWR.push(arrayProc[ii][1]);
                        }
                    }
                }
                arrayProc2 = arrayProc;
                strSiteIDs = arraySiteIDsCODWR.join("%2C");
                strURLGagePrefix += strSiteIDs;
                app.strURLGage = strURLGagePrefix;

                var arrayCODWR_Sens_Loc = [];

                $.getJSON(app.strURLGage)   //http://api.jquery.com/jquery.getjson/
                    .done(function (jsonResult) {
                        arrayJSONValues = jsonResult.ResultList;
                        for (var i = 0; i < arrayJSONValues.length; i++) {
                            arrayCODWR_Sens_Loc.push([arrayJSONValues[i].abbrev,
                                arrayJSONValues[i].stationName,
                                arrayJSONValues[i].gnisId,
                                arrayJSONValues[i].abbrev,
                                null,
                                null]
                            );
                        }
                        app.pGage.m_arrayCODWR_Sens_Loc = arrayCODWR_Sens_Loc;
                        app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime,
                            iHtTarget1, iHtTarget2, iHtTarget3)
                    })

                    .fail(function (jqxhr, textStatus, error) {
                        var err = textStatus + ", " + app.strURLGage + ", " + error;
                        //alert("Initial query for USGS gage data failed, trying again");
                        document.getElementById("divLoadingUSGS").innerHTML = "Loading Gage Data, again";
                        console.log("Request Failed: " + err);

                        if (!blnQuery1AtaTime) {  //if the USGS api is erroring out try the refactored method
                            app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, true,
                                iHtTarget1, iHtTarget2, iHtTarget3)
                        }
                    })
                    .always(function () {
                        if ((!(blnIsInitialPageLoad)) & (app.pGage.m_arrray_StationIDsCFS.length == 0)) {  // in the case of no gage station do the following for the graphing
                            dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
                                iSectionID = itemSectionRefined[2];
                                strStreamName = itemSectionRefined[0];
                                app.pGage.m_arrray_StationIDsTMP.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                app.pGage.m_arrray_StationIDsCFS.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                app.pGage.m_arrray_StationIDsHt.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);
                            })
                        }
                    });

            },

            USACE_NWD_SectionsReceived: function (arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime, blnIsInitialPageLoad, iHtTarget1, iHtTarget2, iHtTarget3) {  //this is needed to get the SensorID for each location
                console.log("USACE_NWD_SectionsReceived start");
                app.bln_USACE_NWD_Src_NeedsProc = false;

                var strURLGagePrefix = "https://cwms-data.usace.army.mil/cwms-data/locations/";   //https://cwms-data.usace.army.mil/cwms-data/locations/NOX?office=NWDP
                var strURLGageSuffix = "?office=NWDP";
                var arrayProc2 = [];
                //var arraySiteIDsUSACE_NWD = [];
                for (var ii in arrayProc) {
                    if (arrayProc[ii][1] != null) {
                        strAgency = arrayProc[ii][(arrayProc[ii].length - 1)];  //the agency will be the last element in the array.  If loading all sections then array is long, if single click then array is short
                        if (strAgency == "USACE-NWD") {

                            //arraySiteIDsUSACE_NWD.push(arrayProc[ii][1]);

                            app.strURLGage = strURLGagePrefix + arrayProc[ii][1] + strURLGageSuffix;
                            arrayProc2 = arrayProc;
                            var arrayUSACE_NWD_Sens_Loc = [];

                            //https://www.nwd-wc.usace.army.mil/dd/common/web_service/webexec/getjson?query=[%22NOX.Flow-Out.Ave.1Hour.1Hour.CBT-RAW%22]&timezone=GMT&backward=7d&forward=1d
                            //app.strURLGage = 'https://cwms-data.usace.army.mil/cwms-data/timeseries?name=CAB.Flow-Out.Ave.1Hour.1Hour.CBT-RAW&office=NWDP&unit=EN&begin=2023-11-22T17%3A40%3A42&end=2023-11-26T17%3A40%3A42';
                            //app.strURLGage = 'https://cwms-data.usace.army.mil/cwms-data/timeseries?name=NOX.Flow-Out.Ave.1Hour.1Hour.CBT-RAW&office=NWDP&begin=2023-12-26T22:13:26&end=2023-12-29T22:13:26';

                            arrayUSACE_NWD_Sens_Loc.push([arrayProc[ii][1],
                                null,
                                arrayProc[ii][1],
                                null,
                                null, null]
                            );

                            app.pGage.m_arrayUSACE_NWD_Sens_Loc = arrayUSACE_NWD_Sens_Loc;
                            app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime,
                                iHtTarget1, iHtTarget2, iHtTarget3)


                            if ((!(blnIsInitialPageLoad)) & (app.pGage.m_arrray_StationIDsCFS.length == 0)) {  // in the case of no gage station do the following for the graphing
                                dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
                                    iSectionID = itemSectionRefined[2];
                                    strStreamName = itemSectionRefined[0];
                                    app.pGage.m_arrray_StationIDsTMP.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                    app.pGage.m_arrray_StationIDsCFS.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                    app.pGage.m_arrray_StationIDsHt.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                    app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);
                                })
                            }


                            //$.getJSON(app.strURLGage)   //http://api.jquery.com/jquery.getjson/
                            //    .done(function (jsonResult) {
                            //        arrayUSACE_NWD_Sens_Loc.push([jsonResult.name,
                            //            jsonResult.name,
                            //            jsonResult["long-name"],
                            //            jsonResult.name,
                            //            null, null]
                            //        );

                            //        app.pGage.m_arrayUSACE_NWD_Sens_Loc = arrayUSACE_NWD_Sens_Loc;
                            //        app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime,
                            //            iHtTarget1, iHtTarget2, iHtTarget3)
                         
                            //    })
                            //    .fail(function (jqxhr, textStatus, error) {
                            //        var err = textStatus + ", " + app.strURLGage + ", " + error;
                            //        document.getElementById("divLoadingUSGS").innerHTML = "Loading Gage Data, again";
                            //        console.log("Request Failed: " + err);
                            //        if (!blnQuery1AtaTime) {  //if the USGS api is erroring out try the refactored method
                            //            app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, true,
                            //                iHtTarget1, iHtTarget2, iHtTarget3)
                            //        }
                            //    })
                            //    .always(function () {
                            //        if ((!(blnIsInitialPageLoad)) & (app.pGage.m_arrray_StationIDsCFS.length == 0)) {  // in the case of no gage station do the following for the graphing
                            //            dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
                            //                iSectionID = itemSectionRefined[2];
                            //                strStreamName = itemSectionRefined[0];
                            //                app.pGage.m_arrray_StationIDsTMP.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                            //                app.pGage.m_arrray_StationIDsCFS.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                            //                app.pGage.m_arrray_StationIDsHt.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                            //                app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);
                            //            })
                            //        }
                            //    });
                        }
                    }
                }

            },

        SectionsReceived: function (arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1,
                                        blnQuery1AtaTime, iHtTarget1, iHtTarget2, iHtTarget3) {
			console.log("SectionsReceived1");

            var iCounterTemperature = 0;
            var strDischargeSensorID, strHtSensorID, strTempSensorID, strDNRCLocID
            var EntiretrHTML, strHyperlinkURL, strSiteIDs,
                iLateFlowPref4ConsvValue, iLateFlowConsvValue, iLateFlowClosureValueFlow,
                strLateFlowPref4ConsvValue, strLateFlowConsvValue, strLateFlowClosureValueFlow,
                strDailyStat_URL, strFWPWarn, strStartEndpoint, strEndEndpoint, strAgency,
                iLateHtPref4ConsvValue, iLateHtConsvValue, strLateHtClosureValue,
                strLateHtPref4ConsvValue, strLateHtConsvValue, strLateHtClosureValue;
            EntiretrHTML = strHyperlinkURL = strSiteIDs =
                iLateFlowPref4ConsvValue = iLateFlowConsvValue = iLateFlowClosureValueFlow =
                strLateFlowPref4ConsvValue = strLateFlowConsvValue = strLateFlowClosureValueFlow =
                strDailyStat_URL = strFWPWarn = strStartEndpoint = strEndEndpoint = strAgency =
                iLateHtPref4ConsvValue = iLateHtConsvValue = strLateHtClosureValue =
                strLateHtPref4ConsvValue = strLateHtConsvValue = strLateFlowClosureValueHt = "";

            var iProcIndex, arraySiteIDInfo, strStreamName, strSiteID, iSectionID, iLateFlowHootValue,
                strHootMessage, iTempClosureValue,
                strMONTHDAYEarlyFlowFromDroughtManagementTarget, strMONTHDAYEarlyFlowToDroughtManagementTarget,
                iEarlyFlowDroughtManagementTarget, strEarlyFlowDroughtManagementTargetMessage, strTempCollected, iOID,
                strMONTHDAYEarlyHtFromDroughtManagementTarget, strMONTHDAYEarlyHtoDroughtManagementTarget,
                iEarlyHtDroughtManagementTarget, strEarlyHtDroughtManagementTargetMessage;
            iProcIndex = arraySiteIDInfo = strStreamName = strSiteID = iSectionID =
                iLateFlowHootValue = strHootMessage = iTempClosureValue = strMONTHDAYEarlyFlowFromDroughtManagementTarget =
                strMONTHDAYEarlyFlowToDroughtManagementTarget = iEarlyFlowDroughtManagementTarget =
                strEarlyFlowDroughtManagementTargetMessage = strTempCollected = iOID =
                strMONTHDAYEarlyHtFromDroughtManagementTarget = strMONTHDAYEarlyHtoDroughtManagementTarget =
                iEarlyHtDroughtManagementTarget = strEarlyHtDroughtManagementTargetMessage = null;

            var arrayDNRC_Sens_Loc = null;
            var arrayCODWR_Sens_Loc = null;
            var arrayUSACE_NWD_Sens_Loc = null;

            var blnIsInitialPageLoad = app.blnIsInitialPageLoad;
            var blnSingleSelect_DNRC = false;
            var blnSingleSelect_CODWR = false;
            var blnSingleSelect_USACE_NWD = false;

            if ((arrayProc[0].length == 4) & (arrayProc.length == 1) & (arrayProc[0][3] == "MTDNRC")) {
                var blnSingleSelect_DNRC = true;
				arrayDNRC_Sens_Loc = app.pGage.m_arrayDNRC_Sens_Loc;
			}
            if ((arrayProc[0].length == 4) & (arrayProc.length == 1) & (arrayProc[0][3] == "CODWR")) {
                var blnSingleSelect_CODWR = true;
                arrayCODWR_Sens_Loc = app.pGage.m_arrayCODWR_Sens_Loc;
            }
            if ((arrayProc[0].length == 4) & (arrayProc.length == 1) & (arrayProc[0][3] == "USACE-NWD")) {
                var blnSingleSelect_USACE_NWD = true;
                arrayUSACE_NWD_Sens_Loc = app.pGage.m_arrayUSACE_NWD_Sens_Loc;
            }

            if (((app.pGage.m_arrayDNRC_Sens_Loc == null) | !(blnIsInitialPageLoad)) &
                ((app.pGage.m_arrayCODWR_Sens_Loc == null) | !(blnIsInitialPageLoad)) &
                ((app.pGage.m_arrayUSACE_NWD_Sens_Loc == null) | !(blnIsInitialPageLoad))) {  //clear out the symbology and charting
				m_arrayOIDYellow = [];
				m_arrayOIDsRed = [];
				m_arrayOIDsPlum = [];
				m_arrayOIDsOrange = [];
				m_arrayOIDsGold = [];
				app.pGage.m_arrray_Detail4ChartCFS = [];
                app.pGage.m_arrray_Detail4ChartTMP = [];
                app.pGage.m_arrray_Detail4ChartHt = [];
			}

			if ((app.pGage.m_arrayDNRC_Sens_Loc != null) & (blnIsInitialPageLoad)) {
				arrayDNRC_Sens_Loc = app.pGage.m_arrayDNRC_Sens_Loc;
			}
            if ((app.pGage.m_arrayCODWR_Sens_Loc != null) & (blnIsInitialPageLoad)) {
                arrayCODWR_Sens_Loc = app.pGage.m_arrayCODWR_Sens_Loc;
            }
            if ((app.pGage.m_arrayUSACE_NWD_Sens_Loc != null) & (blnIsInitialPageLoad)) {
                arrayUSACE_NWD_Sens_Loc = app.pGage.m_arrayUSACE_NWD_Sens_Loc;
            }

            if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null) & !(blnSingleSelect_DNRC)) {
				var strURLGagePrefix = "https://nwis.waterservices.usgs.gov/nwis/iv/";
				strURLGagePrefix += "?format=json&indent=on&siteStatus=all";
				strURLGagePrefix += "&startDT=" + this.dteStartDay2Check;    //start date
				strURLGagePrefix += "&endDT=" + this.dteEndDay2Check;      //end date
                strURLGagePrefix += "&parameterCd=" + "00010,00060,00065";
            } else if (arrayCODWR_Sens_Loc != null) {
                var strURLGagePrefix = "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrytimeserieshour/";
                strURLGagePrefix += "?startDate=" + this.dteStartDay2Check + "&abbrev=";

                var arrayTempCODWRIDs = [];
                for (var iS = 0; iS < arrayCODWR_Sens_Loc.length; iS++) {  //getting the sensor id's passed through the arrays
                    arrayTempCODWRIDs.push(arrayCODWR_Sens_Loc[iS][3])
                }
                strTempCODWIDs = arrayTempCODWRIDs.join("%2C");
                app.strURLGage = strURLGagePrefix + strTempCODWIDs;
            } else if (arrayUSACE_NWD_Sens_Loc != null) {

                //"https://cwms-data.usace.army.mil/cwms-data/timeseries?name=MT00223.Flow-Out.Ave.~1Day.1Day.CBT-REV&office=NWDP&unit=EN&begin=2023-11-22T17%3A40%3A42&end=2023-11-26T17%3A40%3A42";
                var strURLGagePrefix = "https://cwms-data.usace.army.mil/cwms-data/timeseries?name=";
                var strURLGageSuffix = ".Flow-Out.Ave.~1Day.1Day.CBT-REV&office=NWDP&unit=EN&begin=";
                strURLGageSuffix += this.dteStartDay2Check + "T00:00:01&end=" + this.dteEndDay2Check + "T23:59:59";

                var arrayTempUSACE_NWD_IDs = [];
                for (var iS2 = 0; iS2 < arrayUSACE_NWD_Sens_Loc.length; iS2++) {  //getting the sensor id's passed through the arrays
                    arrayTempUSACE_NWD_IDs.push(arrayUSACE_NWD_Sens_Loc[iS2][0])
                }
                strTempUSACE_NWD_IDs = arrayTempUSACE_NWD_IDs.join(",");  //this is not really needed becuase the api doesen't allow mulitple sensors at the moment, maybe this will change in the future
                app.strURLGage = strURLGagePrefix + strTempUSACE_NWD_IDs + strURLGageSuffix;
            } else {
				var strURLGagePrefix = "https://gis.dnrc.mt.gov/arcgis/rest/services/WRD/WMB_StAGE/MapServer/2/query"
				strURLGagePrefix += "?f=pjson&outFields=SensorID%2CTimestamp%2CRecordedValue&where="
				strURLGagePrefix += "Timestamp > date '" + this.dteStartDay2Check + " 00:00:00'"; 
				strURLGagePrefix += "+ and + SensorID+in+%28%27"; 

				var arrayTempDNRCIDs = [];
				for (var iS = 0; iS < arrayDNRC_Sens_Loc.length; iS++) {  //getting the sensor id's passed through the arrays
					arrayTempDNRCIDs.push(arrayDNRC_Sens_Loc[iS][3])
				}
				strTempDNRCIDs = arrayTempDNRCIDs.join("','");
				app.strURLGage = strURLGagePrefix + strTempDNRCIDs + "')" ;
			}

			var arrayProc2 = [];

			if (blnQuery1AtaTime) {   //due to intermittent errors with the USGS gage api when quering on mulitple sites at the same time, added this work around as an option if ERROR occurs
				strSiteIDs = arrayProc[app.pGage.mIDXQuery1AtaTime][1];
				arrayProc2 = [arrayProc[app.pGage.mIDXQuery1AtaTime]];
			} else {
				var arraySiteIDs = [];
                var arraySiteIDsDNRC = [];
                var arraySiteIDsCODWR = [];
                var arraySiteIDsUSACE_NWD = [];

                for (var ii in arrayProc) {
					if (arrayProc[ii][1] != null) {
						strAgency = arrayProc[ii][(arrayProc[ii].length - 1)];  //the agency will be the last element in the array.  If loading all sections then array is long, if single click then array is short
						if (strAgency == "USGS") {
							arraySiteIDs.push(arrayProc[ii][1]);
                        } else if (strAgency == "CODWR") {  //useful for initial delineation of USGS,CODWR and DNRC gages
                            //} else if ((strAgency == "CODWR") | (app.StateArea.indexOf("CO") > -1) & (strAgency == "")) {  //useful for initial delineation of USGS,CODWR and DNRC gages
                            arraySiteIDsCODWR.push(arrayProc[ii]);
                        //} else if ((strAgency == "USACE-NWD") | (app.StateArea.indexOf("MT") > -1) & (strAgency == "")) {  //useful for initial delineation of USGS,CODWR and DNRC gages
                        } else if (strAgency == "USACE-NWD") {  //useful for initial delineation of USGS,CODWR and DNRC gages
                            arraySiteIDsUSACE_NWD.push(arrayProc[ii]);
                        } else if (strAgency == "MTDNRC") {  //useful for initial delineation of USGS,CODWR,USACE_NWD, and DNRC gages
							arraySiteIDsDNRC.push(arrayProc[ii]);

							//1. Query the Datasets feature by LocationID to get a list of available sensors(measurement types).
							//				if there's no sensors in a module variable then query for sensors then resend to SectionsReceived
							//https://gis.dnrc.mt.gov/arcgis/rest/services/WRD/WMB_StAGE/MapServer/3/query?where=LocationID+%3D+%27a61e9c1d12b44ee2a7abb8e0020e25a0%27+and+SensorLabel+in+%28%27discharge%27%2C%27water+temp%27%29&outFields=*&returnGeometry=false&&f=json
							//2. Use the SensorID and timestamps to query the timeseries feature for the latest values.
							//				if on resend, there's sensors in the module variable then query for values
							//https://gis.dnrc.mt.gov/arcgis/rest/services/WRD/WMB_StAGE/MapServer/2/query?where=SensorID+%3D+%275adc59fc9ffa4be1b96f22b83487f366%27+and+Timestamp+%3E+date+%272021-07-25+00%3A00%3A00%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=html
							//https://gis.dnrc.mt.gov/arcgis/rest/services/WRD/WMB_StAGE/MapServer/2/query?&outFields=*&f=html&where=SensorID+%3D+%275adc59fc9ffa4be1b96f22b83487f366%27+and+Timestamp+%3E+date+%272021-07-25+00%3A00%3A00%27
                        } else if ((strAgency != "") & (app.StateArea.indexOf("CO") < -0) & (strAgency == "")) {  //useful for initial delineation of USGS,CODWR,USACE_NWD, and DNRC gages
                            arraySiteIDsDNRC.push(arrayProc[ii]);

                            //1. Query the Datasets feature by LocationID to get a list of available sensors(measurement types).
                            //				if there's no sensors in a module variable then query for sensors then resend to SectionsReceived
                            //https://gis.dnrc.mt.gov/arcgis/rest/services/WRD/WMB_StAGE/MapServer/3/query?where=LocationID+%3D+%27a61e9c1d12b44ee2a7abb8e0020e25a0%27+and+SensorLabel+in+%28%27discharge%27%2C%27water+temp%27%29&outFields=*&returnGeometry=false&&f=json
                            //2. Use the SensorID and timestamps to query the timeseries feature for the latest values.
                            //				if on resend, there's sensors in the module variable then query for values
                            //https://gis.dnrc.mt.gov/arcgis/rest/services/WRD/WMB_StAGE/MapServer/2/query?where=SensorID+%3D+%275adc59fc9ffa4be1b96f22b83487f366%27+and+Timestamp+%3E+date+%272021-07-25+00%3A00%3A00%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=html
                            //https://gis.dnrc.mt.gov/arcgis/rest/services/WRD/WMB_StAGE/MapServer/2/query?&outFields=*&f=html&where=SensorID+%3D+%275adc59fc9ffa4be1b96f22b83487f366%27+and+Timestamp+%3E+date+%272021-07-25+00%3A00%3A00%27
                        } else if ((strAgency != "") & (app.StateArea.indexOf("CO") > -1) & (strAgency == "")) {  //useful for initial delineation of USGS,CODWR and DNRC gages
                            arraySiteIDsCODWR.push(arrayProc[ii]);
                        }
                    }
				}

                if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {
					strSiteIDs = arraySiteIDs.join(",");
                }
                arrayProc2 = arrayProc;
            }

            if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {
                if (strSiteIDs == "") {
                    strSiteIDs = "06023100";  // this is to prevent the issues if no USGS sites (i.e. Rio Grande area) but maybe state gages
                }

                app.strURLGage = strURLGagePrefix + "&sites=" + strSiteIDs;

			}

            if ((blnQuery1AtaTime) & (strSiteIDs == null)) {   //due to intermittent errors with the USGS gage api when quering on mulitple sites at the same time, added this work around as an option if ERROR occurs

                strSiteID = arrayProc2[0][1];  //since some sections do not have readings all the time setting this before finding data in the JSON
                strStreamName = arrayProc2[0][0];  //since some sections do not have readings all the time setting this before finding data in the JSON
                iSectionID = arrayProc2[0][2];  //since some sections do not have readings all the time setting this before finding data in the JSON
                strSectionName_ = arrayProc2[0][26]
                iTempClosureValue = arrayProc2[0][6];

                strMONTHDAYEarlyFlowFromDroughtManagementTarget = arrayProc2[0][7];
                strMONTHDAYEarlyFlowToDroughtManagementTarget = arrayProc2[0][8];
                iEarlyFlowDroughtManagementTarget = arrayProc2[0][9];
                strEarlyFlowDroughtManagementTargetMessage = arrayProc2[0][10];
                strLateFlowPref4ConsvValue = arrayProc2[0][11];
                strLateFlowConsvValue = arrayProc2[0][12];
                strLateFlowClosureValueFlow = arrayProc2[0][13];
                strTempCollected = arrayProc2[0][14];
                iOID = arrayProc2[0][15];
                strDailyStat_URL = arrayProc2[0][16];
                strFWPDESCRIPTION = arrayProc2[0][17];
                strFWPLOCATION = arrayProc2[0][18];
                strFWPPRESSRELEASE = arrayProc2[0][19];
                strFWPPUBLISHDATE = arrayProc2[0][20];
                strFWPTITLE = arrayProc2[0][21];
                strFWPWarn = arrayProc2[0][22];
                strStartEndpoint = arrayProc2[0][23];
				strEndEndpoint = arrayProc2[0][24];
				strWatershed = arrayProc2[0][25];
				

                iLateHtPref4ConsvValue = arrayProc2[0][27]
                iLateHtConsvValue = arrayProc2[0][28]
                strLateHtClosureValue = arrayProc2[0][29]
                strLateHtPref4ConsvValue = arrayProc2[0][30]
                strLateHtConsvValue = arrayProc2[0][31]
                strLateFlowClosureValueHt = arrayProc2[0][32]

                strAgency = arrayProc2[0][33];

                iLateFlowPref4ConsvValue = arrayProc2[0][3];
                iLateFlowConsvValue = arrayProc2[0][4];
                iLateFlowClosureValueFlow = arrayProc2[0][5];
                dblLatestTMP = "No gage exists";
                dblLatestCFS = "No gage exists";
                dblLatestHt = "No gage exists";

                var dteLatestDateTimeTMP = "";
                var dteLatestDateTimeCFS = "";
                var dteLatestDateTimeHt = "";
                var dblLatestTMP = "";
                var strID = "";
                var streamSectionDispalyName = strStreamName + " Section";
                var strSiteTempStatus = "OPEN";
                var strSiteFlowStatus = "OPEN";
                var str3DayCFSTrendCFS = "images/blank.png";
                var str3DayCFSTrendHt = "images/blank.png";
                var str3DayCFSTrendTMP = "images/blank.png";

                strNoDataLabel4Charting = "(No Data) ";
                dteLatestDateTimeCFS = new Date();
                dteLatestDateTimeTMP = new Date();
                dteLatestDateTimeHt = new Date();

                OverallStatusAndColor = app.pGage.DivyUpStatusandColors(iOID, strSiteFlowStatus, strSiteTempStatus, strFWPTITLE, strFWPDESCRIPTION,
                                        strFWPLOCATION, strFWPPRESSRELEASE, strFWPPUBLISHDATE, strFWPWarn, strWatershed);
                var strOverallStatus = OverallStatusAndColor[0];
                var strOverallSymbol = OverallStatusAndColor[1];

                app.pGage.m_arrray_RiverSectionStatus.push([streamSectionDispalyName,                    //add to array that populates the river sections summary div
                                            strHyperlinkURL,
                                            dteLatestDateTimeTMP,
                                            dblLatestTMP.toString().replace("-999999", "Data not available"),
                                            strSiteTempStatus,
                                            dteLatestDateTimeCFS,
                                            dblLatestCFS.toString(),
                                            strSiteFlowStatus,
                                            strID,
                                            strStreamName,
                                            iSectionID,
                                            str3DayCFSTrendCFS,
                                            strMONTHDAYEarlyFlowFromDroughtManagementTarget,
                                            strMONTHDAYEarlyFlowToDroughtManagementTarget,
                                            iLateFlowPref4ConsvValue,
                                            iLateFlowConsvValue,
                                            iLateFlowClosureValueFlow,
                                            strLateFlowPref4ConsvValue,
                                            strLateFlowConsvValue,
                                            strLateFlowClosureValueFlow,
                                            iTempClosureValue,
                                            strTempCollected,
                                            strSiteID,
                                            strDailyStat_URL,
                                            str3DayCFSTrendTMP,
                                            strFWPDESCRIPTION,
                                            strFWPLOCATION,
                                            strFWPPRESSRELEASE,
                                            strFWPPUBLISHDATE,
                                            strFWPTITLE,
                                            strOverallStatus,
                                            strOverallSymbol,
                                            strStartEndpoint,
                                            strEndEndpoint,
                                            strWatershed,
                                            strSectionName_,
                                            dteLatestDateTimeHt,
                                            dblLatestHt.toString(),
                                            strSiteHtStatus,
                                            str3DayCFSTrendHt,
                                            iLateHtPref4ConsvValue,
                                            iLateHtConsvValue,
                                            strLateHtClosureValue,
                                            strLateHtPref4ConsvValue,
                                            strLateHtConsvValue,
                                            strLateFlowClosureValueHt,
                                            strAgency]);

                app.pGage.mIDXQuery1AtaTime += 1;
                if ((blnQuery1AtaTime) & (app.pGage.mIDXQuery1AtaTime < arrayProc.length)) {
                    app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime,
                        iHtTarget1, iHtTarget2, iHtTarget3)
                } else {
                    app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);
                    app.pGage.mIDXQuery1AtaTime = 0;
                }

            } else {
                console.log("just before the gage query");
                //perform the trigger comparison and other sorting and tasks
                $.getJSON(app.strURLGage)   //http://api.jquery.com/jquery.getjson/
					.done(function (jsonResult) {

                        //if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                        if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {
							arrayJSONValues = jsonResult.value.timeSeries;
                        } else if (arrayCODWR_Sens_Loc != null) {
                            arrayJSONValues = jsonResult.ResultList;
                        } else if (arrayUSACE_NWD_Sens_Loc != null) {
                            if (jsonResult["time-series"]["time-series"].length > 0) {
                                arrayJSONValues = jsonResult["time-series"]["time-series"][0]["irregular-interval-values"].values;
                                var strUSACE_NWD_1stTime = jsonResult["time-series"]["time-series"][0]["irregular-interval-values"].values[0][0];
                                var dteUSACE_NWD_1stTime = Date.parse(strUSACE_NWD_1stTime);
                                var strUSACE_NWD_LastTime = jsonResult["time-series"]["time-series"][0]["irregular-interval-values"].values[(arrayJSONValues.length - 1)][0];
                                var dteUSACE_NWD_LastTime = Date.parse(strUSACE_NWD_LastTime);
                            }
                        }
                        else {
							arrayJSONValues = jsonResult.features;
						}
               
                        dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
							var strSiteName = "";

							//if inital load then do full run through of code
                            strSiteID = itemSectionRefined[1];  //since some sections do not have readings all the time setting this before finding data in the JSON

							if (arrayDNRC_Sens_Loc != null) {  //finding the corresponding sensorIDs
								for (var iS2 = 0; iS2 < arrayDNRC_Sens_Loc.length; iS2++) {  //getting the sensor id's passed through the arrays
									if ((arrayDNRC_Sens_Loc[iS2][0] == strSiteID) & (arrayDNRC_Sens_Loc[iS2][4] == "water temp")){
										strTempSensorID = arrayDNRC_Sens_Loc[iS2][3];
										strSiteName = arrayDNRC_Sens_Loc[iS2][1];
										strDNRCLocID = arrayDNRC_Sens_Loc[iS2][0];
									}
									if ((arrayDNRC_Sens_Loc[iS2][0] == strSiteID) & (arrayDNRC_Sens_Loc[iS2][4] == "discharge")) {
										strDischargeSensorID = arrayDNRC_Sens_Loc[iS2][3];
                                    }
                                    if ((arrayDNRC_Sens_Loc[iS2][0] == strSiteID) & (arrayDNRC_Sens_Loc[iS2][4] == "working")) {
                                        strHtSensorID = arrayDNRC_Sens_Loc[iS2][3];
                                    }
								}
							}

							strStreamName = itemSectionRefined[0];  //since some sections do not have readings all the time setting this before finding data in the JSON
                            iSectionID = itemSectionRefined[2];  //since some sections do not have readings all the time setting this before finding data in the JSON
                            strSectionName_ = itemSectionRefined[26];

                            strMONTHDAYEarlyFlowFromDroughtManagementTarget = itemSectionRefined[7];
                            strMONTHDAYEarlyFlowToDroughtManagementTarget = itemSectionRefined[8];
                            iEarlyFlowDroughtManagementTarget = itemSectionRefined[9];
                            strEarlyFlowDroughtManagementTargetMessage = itemSectionRefined[10];
                            strLateFlowPref4ConsvValue = itemSectionRefined[11];
                            strLateFlowConsvValue = itemSectionRefined[12];
                            strLateFlowClosureValueFlow = itemSectionRefined[13];
                            strTempCollected = itemSectionRefined[14];
                            iOID = itemSectionRefined[15];
                            strDailyStat_URL = itemSectionRefined[16];
                            strFWPDESCRIPTION = itemSectionRefined[17];
                            strFWPLOCATION = itemSectionRefined[18];
                            strFWPPRESSRELEASE = itemSectionRefined[19];
                            strFWPPUBLISHDATE = itemSectionRefined[20];
                            strFWPTITLE = itemSectionRefined[21];
                            strFWPWarn = itemSectionRefined[22];
                            strStartEndpoint = itemSectionRefined[23];
							strEndEndpoint = itemSectionRefined[24];
							strWatershed = itemSectionRefined[25];

                            iLateHtPref4ConsvValue = itemSectionRefined[27];
                            iLateHtConsvValue = itemSectionRefined[28];
                            strLateHtClosureValue = itemSectionRefined[29];
                            strLateHtPref4ConsvValue = itemSectionRefined[30];
                            strLateHtConsvValue = itemSectionRefined[31];
                            strLateFlowClosureValueHt = itemSectionRefined[32];
                            strAgency = itemSectionRefined[33];

                            var itemFound, itemFoundTemp, itemFoundDischarge, itemFoundHt;
							itemFound = [];
							itemFoundTemp = [];
                            itemFoundDischarge = [];
                            itemFoundHt = [];

                            //if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {  //these itemFound arrays house all the data that is found in the data arrays with all gage data
                            if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {  //these itemFound arrays house all the data that is found in the data arrays with all gage data
                                var itemFound = arrayJSONValues.filter(function (itemArraySearch) {
                                    return typeof itemArraySearch.name == 'string' && itemArraySearch.name.indexOf(strSiteID) > -1 && strSiteID != "";
                                });
                                
                            } else if (arrayCODWR_Sens_Loc != null) {
                                if (strSiteID == "") {
                                    strSiteID = "no site id specified";
                                }

                                var itemFoundTemp = arrayJSONValues.filter(function (itemArraySearch) {
                                    return typeof itemArraySearch.abbrev == 'string' && itemArraySearch.abbrev.indexOf(strSiteID) > -1 && (itemArraySearch.parameter == "AIRTEMP");
                                });
                                var itemFoundDischarge = arrayJSONValues.filter(function (itemArraySearch) {
                                    return typeof itemArraySearch.abbrev == 'string' && itemArraySearch.abbrev.indexOf(strSiteID) > -1 && (itemArraySearch.parameter == "DISCHRG");
                                });
                                var itemFoundHt = arrayJSONValues.filter(function (itemArraySearch) {
                                    return typeof itemArraySearch.abbrev == 'string' && itemArraySearch.abbrev.indexOf(strSiteID) > -1 && (itemArraySearch.parameter == "GAGE_HT");
                                });
                            } else if (arrayUSACE_NWD_Sens_Loc != null) {
                                if (strSiteID == "") {
                                    strSiteID = "no site id specified";
                                }
                                var itemFoundTemp = [];  /// no temperature for USACE NWD gages at this time
                                var itemFoundDischarge = arrayJSONValues  //no need to filter, only Discharge for USACE NWD gages at this time
                                var itemFoundHt = [];  /// no gage height for USACE NWD gages at this time
                            } else {
								var itemFoundTemp = arrayJSONValues.filter(function (itemArraySearch) {
									return typeof itemArraySearch.attributes.SensorID == 'string' && itemArraySearch.attributes.SensorID.indexOf(strTempSensorID) > -1 ;
								});
								var itemFoundDischarge = arrayJSONValues.filter(function (itemArraySearch) {
									return typeof itemArraySearch.attributes.SensorID == 'string' && itemArraySearch.attributes.SensorID.indexOf(strDischargeSensorID) > -1;
								});
                                var itemFoundHt = arrayJSONValues.filter(function (itemArraySearch) {
                                    return typeof itemArraySearch.attributes.SensorID == 'string' && itemArraySearch.attributes.SensorID.indexOf(strHtSensorID) > -1;
                                });
                                itemFoundTemp = multiDimensionalUnique(itemFoundTemp);
                                itemFoundDischarge = multiDimensionalUnique(itemFoundDischarge);
                                itemFoundHt = multiDimensionalUnique(itemFoundHt);
							}

                            var arrray_Detail4InterpolationCFS = [];
                            var arrray_Detail4InterpolationHt = [];
                            var arrray_Detail4InterpolationTMP =[];
                            var arrayTempsAbove =[];
                            var dteLatestDateTimeTMP = "";
                            var dteLatestDateTimeCFS = "";
                            var dteLatestDateTimeHt = "";
                            var dblLatestTMP = "";
                            var dteGreatestTMP = "";
                            var dblLatestCFS = "";
                            var dblLatestHt = "";
                            var strID = "";

							if ((itemFound.length > 0) | (itemFoundTemp.length > 0) | (itemFoundDischarge.length > 0)) {  //set the some base variable values
                                    iLateFlowPref4ConsvValue = itemSectionRefined[3];
                                    iLateFlowConsvValue = itemSectionRefined[4];
                                    iLateFlowClosureValueFlow = itemSectionRefined[5];
                                    iTempClosureValue = itemSectionRefined[6];

                                if (blnIsInitialPageLoad) {
                                    if (app.test) {
                                        if (iLateFlowPref4ConsvValue == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                            iLateFlowPref4ConsvValue = 400;
                                        }
                                        if (iLateFlowConsvValue == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                            iLateFlowConsvValue = 300;
                                        }
                                        if (iLateFlowClosureValueFlow == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                            iLateFlowClosureValueFlow = 200;
                                        }
                                        iTempClosureValue = 50;
                                    } else {
                                        if (iLateFlowPref4ConsvValue == 9999) {
                                            iLateFlowPref4ConsvValue = 0;
                                        }
                                        if (iLateFlowConsvValue == 9999) {
                                            iLateFlowConsvValue = 0;
                                        }
                                        if (iLateFlowClosureValueFlow == 9999) {
                                            iLateFlowClosureValueFlow = 0;
                                        }
                                    }

                                    var strSiteFlowStatus = "OPEN"; //OPEN, PREPARE FOR CONSERVATION, CONSERVATION, RIVER CLOSURE (CLOSED TO FISHING)
                                    var strSiteTempStatus = "OPEN";//OPEN, HOOT-OWL FISHING RESTRICTIONS CRITERIA, RIVER CLOSURE (CLOSED TO FISHING) CRITERIA
                                    var strSiteHtStatus = "OPEN";

                                    //if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                                    if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {
                                        strHyperlinkURL = strURLGagePrefix + "&sites=" + strSiteID;        //siteID
                                        strHyperlinkURL = returnURL4GSgage(strHyperlinkURL);
                                    } else if (arrayCODWR_Sens_Loc != null) {
                                        strHyperlinkURL = "https://dwr.state.co.us/tools/Stations/" + strSiteID;
                                    } else if (arrayUSACE_NWD_Sens_Loc != null) {
                                        strHyperlinkURL = "https://www.nwd-wc.usace.army.mil/dd/common/projects/www/" + strSiteID.toLowerCase() + ".html";
                                    } else {  // this captures the MT DNRC case's
                                        //strHyperlinkURL = "https://gis.dnrc.mt.gov/apps/stage/gage-report/location/" + strDNRCLocID;
                                        strHyperlinkURL = "https://gis.dnrc.mt.gov/apps/stage/gage-report/location/" + strSiteID;
                                    }
                                    blnRealValues = false;
                                    var str3DayCFSTrendCFS = "images/blank.png";
                                    var str3DayCFSTrendTMP = "images/blank.png";
                                    var str3DayCFSTrendHt = "images/blank.png";
                            } else {
                                    iLateFlowPref4ConsvValue = 0;
                                    iLateFlowConsvValue = 0;
                                    iLateFlowClosureValueFlow = 0;
                            }

                            var CFSItem = "";
                            var HtItem = "";
							var temperatureItem = "";

                            //if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                            if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {
                                for (var iv = 0; iv < itemFound.length; iv++) {//determine if the JSON element is a temperature or discharge reading
                                    if (itemFound[iv].variable.variableDescription == "Temperature, water, degrees Celsius") {
                                        temperatureItem = itemFound[iv];
                                    }
                                    if (itemFound[iv].variable.variableDescription == "Discharge, cubic feet per second") {
                                        CFSItem = itemFound[iv];
                                    }
                                    if (itemFound[iv].variable.variableDescription == "Gage height, feet") {
                                        HtItem = itemFound[iv];
                                    }
                                }
                            } 

                            if ((CFSItem != "") | (itemFoundDischarge.length > 0)) {                                       //run through each gage discharge record
                                //if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                                if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {
									arrayJSONValues2 = CFSItem.values[0].value;
                                } else if (arrayCODWR_Sens_Loc != null) {
                                    arrayJSONValues2 = itemFoundDischarge;
                                } else if (arrayUSACE_NWD_Sens_Loc != null) {
                                    arrayJSONValues2 = itemFoundDischarge;
                                    //var iCounter4USACE_NWD = 0;
                                } else {
									arrayJSONValues2 = itemFoundDischarge;
								}

                                
								jQuery.each(arrayJSONValues2, function (k, item2) {
                                    //if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                                    if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {
										var dteDateTime = new Date(item2.dateTime);
                                    } else if (arrayCODWR_Sens_Loc != null) {
                                        var dteDateTime = new Date(item2.measDate);
                                    } else if (arrayUSACE_NWD_Sens_Loc != null) {
                                        var dteDateTime = new Date(item2[0]);
                                        //iCounter4USACE_NWD += 1; //increment the counter

                                    } else {
										var dteDateTime = new Date(item2.attributes.Timestamp);
										dteDateTime.setHours(dteDateTime.getHours() + 6);
									}
                                    var strNoData = "";
									var iCFSValue;

                                    //if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                                    if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {
                                        iCFSValue = parseFloat(item2.value);
                                    } else if (arrayCODWR_Sens_Loc != null) {
                                        iCFSValue = Math.round(parseFloat(item2.measValue) * 10) / 10;
                                    } else if (arrayUSACE_NWD_Sens_Loc != null) {
                                        iCFSValue = item2[1];  //unit is CFS, changing to
                                        //iCFSValue = Math.round(item2[1] * 10) / 10;  //unit is CFS, changing to
                                        //iCFSValue = Math.round(item2[0] * 10) / 10;  //unit is CFS, changing to
                                    } else {
                                        iCFSValue = Math.round(parseFloat(item2.attributes.RecordedValue) * 10) / 10;
									}

                                    if (iCFSValue != -999999) {
                                        blnRealValues = true;
                                        var obj = {};
                                        obj["id"]= strStreamName + "," +iSectionID;
                                        obj["date"] = dteDateTime.getFullYear() + "-" +("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" +("0" +dteDateTime.getDate()).slice(-2);
										obj["time"] = dteDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
										obj["cfs"] = iCFSValue;
                                        obj["gagedatetime"]= dteDateTime;

                                        obj["cfsTarget1"]= iCFSTarget1;  //this are only used in single charting situations
                                        obj["cfsTarget2"]= iCFSTarget2;  //this are only used in single charting situations
                                        obj["cfsTarget3"]= iCFSTarget3;  //this are only used in single charting situations

                                        app.pGage.m_arrray_Detail4ChartCFS.push(obj);//populate the array that contains the data for charting
                                        obj["EPOCH"]= Date.parse(dteDateTime);

                                        arrray_Detail4InterpolationCFS.push(obj);  //populate the array that is used to determing the flow trend

                                        //console.log("cfs reading added");
                                    }
                                });

                                if ((arrray_Detail4InterpolationCFS.length > 0) & (blnRealValues)) { //figure out if the flow trend is increasing or decreasing & the last known values
                                    arrray_Detail4InterpolationCFS.sort(function (a, b) {
                                        var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)  //sort
                                        return dateA -dateB //sort by date ascending
                                    })
                                    var iCFSArrayLength = (arrray_Detail4InterpolationCFS.length -1);
                                    dteLatestDateTimeCFS = arrray_Detail4InterpolationCFS[iCFSArrayLength].gagedatetime;
                                    dblLatestCFS = parseFloat(arrray_Detail4InterpolationCFS[iCFSArrayLength].cfs);

                                    str3DayCFSTrendCFS = ProcLinearRegression(arrray_Detail4InterpolationCFS, "cfs");
                                }
                            }

                            if ((HtItem != "") | (itemFoundHt.length > 0)) {                                    //run through each gage height record
                                if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                                    arrayJSONValues2Ht = HtItem.values[0].value;
                                } else {
                                    arrayJSONValues2Ht = itemFoundHt;
                                }

                                jQuery.each(arrayJSONValues2Ht, function (k, item2Ht) {
                                    if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                                        var dteDateTime = new Date(item2Ht.dateTime);
                                    } else if (arrayCODWR_Sens_Loc != null) {
                                        var dteDateTime = new Date(item2Ht.measDate);
                                    } else {
                                        var dteDateTime = new Date(item2Ht.attributes.Timestamp);
                                        dteDateTime.setHours(dteDateTime.getHours() + 6);
                                    }
                                    var strNoData = "";
                                    var iHtValue;
                                    if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                                        iHtValue = parseFloat(item2Ht.value);
                                    } else if (arrayCODWR_Sens_Loc != null) {
                                        iHtValue = Math.round(parseFloat(item2Ht.measValue) * 10) / 10;
                                    } else {
                                        iHtValue = Math.round(parseFloat(item2Ht.attributes.RecordedValue) * 10) / 10;
                                    }

                                    if (item2Ht.value != -999999) {
                                        blnRealValues = true;
                                        var obj = {};
                                        obj["id"] = strStreamName + "," + iSectionID;
                                        obj["date"] = dteDateTime.getFullYear() + "-" + ("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDateTime.getDate()).slice(-2);
                                        obj["time"] = dteDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
                                        obj["Ht"] = iHtValue;
                                        obj["gagedatetime"] = dteDateTime;

                                        obj["HtTarget1"] = iHtTarget1;  //this are only used in single charting situations
                                        obj["HtTarget2"] = iHtTarget2;  //this are only used in single charting situations
                                        obj["HtTarget3"] = iHtTarget3;  //this are only used in single charting situations

                                        app.pGage.m_arrray_Detail4ChartHt.push(obj);//populate the array that contains the data for charting
                                        obj["EPOCH"] = Date.parse(dteDateTime);

                                        arrray_Detail4InterpolationHt.push(obj);  //populate the array that is used to determing the flow trend
                                    }
                                });

                                if ((arrray_Detail4InterpolationHt.length > 0) & (blnRealValues)) { //figure out if the flow trend is increasing or decreasing & the last known values
                                    arrray_Detail4InterpolationHt.sort(function (a, b) {
                                        var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)  //sort
                                        return dateA - dateB //sort by date ascending
                                    })
                                    var iHtArrayLength = (arrray_Detail4InterpolationHt.length - 1);
                                    dteLatestDateTimeHt = arrray_Detail4InterpolationHt[iHtArrayLength].gagedatetime;
                                    dblLatestHt = parseFloat(arrray_Detail4InterpolationHt[iHtArrayLength].Ht);

                                    str3DayCFSTrendHt = ProcLinearRegression(arrray_Detail4InterpolationHt, "Ht");
                                }
                            }


                            arrayJSONValues2 =[]; //clear out the array

                            if ((temperatureItem != "") | (itemFoundTemp.length > 0)) {                                    //run through each gage temperature record
                                if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
									arrayJSONValues22 = temperatureItem.values[0].value;
								} else {
									arrayJSONValues22 = itemFoundTemp;
								}

                                jQuery.each(arrayJSONValues22, function (k, item22) {
                                    if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
										var dteDateTime = new Date(item22.dateTime);
                                    } else if (arrayCODWR_Sens_Loc != null) {
                                        var dteDateTime = new Date(item22.measDate);
                                        //dteDateTime.setHours(dteDateTime.getHours() + 6);
                                    } else {
										var dteDateTime = new Date(item22.attributes.Timestamp);
										dteDateTime.setHours(dteDateTime.getHours() + 6);
									}
									var iTempValue;
                                    if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null)) {
                                        iTempValue = Math.round((parseFloat(item22.value) * 9 / 5 + 32) * 10) / 10;
                                    } else if (arrayCODWR_Sens_Loc != null) {
                                        iTempValue = item22.measValue;
                                    } else {
										iTempValue = Math.round((parseFloat(item22.attributes.RecordedValue) * 9 / 5 + 32)*10)/10;
									}
                                    var strNoData = "";
                                    if (iTempValue > -10) {
                                        blnRealValues = true;
                                        var obj = {};
                                        obj["id"]= strStreamName + "," +iSectionID;
                                        obj["date"] = dteDateTime.getFullYear() + "-" +("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" +("0" +dteDateTime.getDate()).slice(-2);
                                        obj["time"]= dteDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false});
										obj["TMP"] = iTempValue;
										obj["gagedatetime"] = dteDateTime;
										if (iTMPTarget1 != 0) {
											obj["TMPTarget1"] = iTMPTarget1;  //this are only used in single charting situations
										}
                                        app.pGage.m_arrray_Detail4ChartTMP.push(obj);//populate the array that contains the data for charting
                                        obj["EPOCH"]= Date.parse(dteDateTime);
                                        arrray_Detail4InterpolationTMP.push(obj);  //populate the array that is used to determing the flow trend
                                    }
                                });

                                if ((arrray_Detail4InterpolationTMP.length > 0) & (blnRealValues)) { //figure out if the flow trend is increasing or decreasing & the last known values
                                    arrray_Detail4InterpolationTMP.sort(function (a, b) {
                                        var dateA = new Date(a.TMP), dateB = new Date(b.TMP)  //sort
                                        return dateA - dateB //sort by date ascending
                                    })
                                    var iTMPArrayLength = (arrray_Detail4InterpolationTMP.length - 1);
                                    dteGreatestTMP = arrray_Detail4InterpolationTMP[iTMPArrayLength].TMP;

                                    arrray_Detail4InterpolationTMP.sort(function (a, b) {
                                            var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)  //sort
                                            return dateA -dateB //sort by date ascending
                                        })
                                    var iTMPArrayLength = (arrray_Detail4InterpolationTMP.length -1);
                                    dteLatestDateTimeTMP = arrray_Detail4InterpolationTMP[iTMPArrayLength].gagedatetime;

                                    dblLatestTMP = parseFloat(arrray_Detail4InterpolationTMP[iTMPArrayLength].TMP);
                                    str3DayCFSTrendTMP = ProcLinearRegression(arrray_Detail4InterpolationTMP, "TMP");
                                }
                            }

                            arrayJSONValues22 =[]; //clear out the array
                            CFSItem = "";
                            HtItem = "";
                            temperatureItem = "";
                        }
                            if ((arrayDNRC_Sens_Loc == null) & (arrayCODWR_Sens_Loc == null) & (arrayUSACE_NWD_Sens_Loc == null)) {
                                if (itemFound.length > 0) {
                                    var item = itemFound[0];
                                    strSiteName = item.sourceInfo.siteName;
                                }
                            } else if ((arrayUSACE_NWD_Sens_Loc != null)) {
                                strSiteName = arrayUSACE_NWD_Sens_Loc[0][0];
                                console.log("getting site name");
                            }

                            var strNoDataLabel4ChartingHt = "";
                            if (dblLatestHt == -999999) {
                                dblLatestHt = "Not Available"
                                dteLatestDateTimeHt = new Date();
                                strNoDataLabel4ChartingHt = "(No Data) ";
                            } else if (dblLatestHt == "") {
                                dblLatestHt = "*Not collected"
                                strNoDataLabel4ChartingHt = "(No Data) ";
                                dteLatestDateTimeHt = new Date();
                            } else {//determine the site's status based on discharge
                                if ((dblLatestHt >= iLateHtPref4ConsvValue) & (iLateHtPref4ConsvValue != null)) {
                                    strSiteHtStatus = "PREPARE FOR CONSERVATION";
                                }
                                if ((dblLatestHt >= iLateHtConsvValue) &
                                    (dblLatestHt < strLateHtClosureValue) &
                                    (iLateHtConsvValue != null)) {
                                    strSiteHtStatus = "CONSERVATION";
                                }
                                if ((dblLatestHt >= strLateHtClosureValue) & (strLateHtClosureValue != null)) {
                                    strSiteHtStatus = "EXPANDED CONSERVATION MEASURES";
                                }
                            }

                            var strNoDataLabel4ChartingCFS = "";
                            if (dblLatestCFS == -999999) {
                                dblLatestCFS = "Not Available"
                                dteLatestDateTimeCFS = new Date();
                                strNoDataLabel4ChartingCFS = "(No Data) ";
                            } else if (dblLatestCFS == "") {
                                dblLatestCFS = "*Not collected"
                                strNoDataLabel4ChartingCFS = "(No Data) ";
                                dteLatestDateTimeCFS = new Date();
                            } else {//determine the site's status based on discharge

                                if ((dblLatestCFS <= iLateFlowPref4ConsvValue) & (dblLatestCFS > iLateFlowConsvValue)) {
                                    strSiteFlowStatus = "PREPARE FOR CONSERVATION";
                                }

                                if ((dblLatestCFS <= iLateFlowConsvValue) & (dblLatestCFS > iLateFlowClosureValueFlow)) {
                                        strSiteFlowStatus = "CONSERVATION";
                                }
                                if (dblLatestCFS <= iLateFlowClosureValueFlow) {
                                    if (strStreamName == "Smith River") {
                                        strSiteFlowStatus = "POTENTIAL RECREATION ISSUES";
                                    } else {
                                        strSiteFlowStatus = "EXPANDED CONSERVATION MEASURES";
                                    }
                                }
                            }
                            var strNoDataLabel4ChartingTMP = "";
                            if (dteGreatestTMP == - 999999) {
                                dblLatestTMP = "Not Available"
                                strNoDataLabel4ChartingTMP = "(No Data) ";
                                dteLatestDateTimeTMP = new Date();
                            } else if (dteGreatestTMP == "") {
                                dblLatestTMP = "*Not collected"
                                strNoDataLabel4ChartingTMP = "(No Data) ";
                                dteLatestDateTimeTMP = new Date();
                            } else if ((dteGreatestTMP > iTempClosureValue) & (iTempClosureValue != 0)) {
                                strSiteTempStatus = "EXPANDED CONSERVATION MEASURES";
                            }

                            if (itemSectionRefined[1]== null) {  //if no gage id then hardcode 
                                dblLatestTMP = "No gage exists";
                                dblLatestCFS = "No gage exists";
                                dblLatestHt = "No gage exists";
                            }

							if (arrayDNRC_Sens_Loc != null) {
								for (var iSL = 0; iSL < app.pGage.m_arrray_StationIDsTMP.length; iSL++) {  //remove placeholder sections if entered
                                    if (app.pGage.m_arrray_StationIDsTMP[iSL] == "(No Data) " + strStreamName + "," + iSectionID) {
										app.pGage.m_arrray_StationIDsTMP.splice(iSL, 1);
										break;
									}
								}
								for (var iSL2 = 0; iSL2 < app.pGage.m_arrray_StationIDsCFS.length; iSL2++) {  //remove placeholder sections if entered
                                    if (app.pGage.m_arrray_StationIDsCFS[iSL2] == "(No Data) " + strStreamName + "," + iSectionID) {
										app.pGage.m_arrray_StationIDsCFS.splice(iSL2, 1);
										break;
									}
								}
                                for (var iSL2Ht = 0; iSL2Ht < app.pGage.m_arrray_StationIDsHt.length; iSL2Ht++) {  //remove placeholder sections if entered
                                    if (app.pGage.m_arrray_StationIDsHt[iSL2Ht] == "(No Data) " + strStreamName + "," + iSectionID) {
                                        app.pGage.m_arrray_StationIDsHt.splice(iSL2Ht, 1);
                                        break;
                                    }
                                }
                            }

                            if (arrayCODWR_Sens_Loc != null) {
                                for (var iSL = 0; iSL < app.pGage.m_arrray_StationIDsTMP.length; iSL++) {  //remove placeholder sections if entered
                                    if (app.pGage.m_arrray_StationIDsTMP[iSL] == "(No Data) " + strStreamName + "," + iSectionID) {
                                        app.pGage.m_arrray_StationIDsTMP.splice(iSL, 1);
                                        break;
                                    }
                                }
                                for (var iSL2 = 0; iSL2 < app.pGage.m_arrray_StationIDsCFS.length; iSL2++) {  //remove placeholder sections if entered
                                    if (app.pGage.m_arrray_StationIDsCFS[iSL2] == "(No Data) " + strStreamName + "," + iSectionID) {
                                        app.pGage.m_arrray_StationIDsCFS.splice(iSL2, 1);
                                        break;
                                    }
                                }
                                for (var iSL2Ht = 0; iSL2Ht < app.pGage.m_arrray_StationIDsHt.length; iSL2Ht++) {  //remove placeholder sections if entered
                                    if (app.pGage.m_arrray_StationIDsHt[iSL2Ht] == "(No Data) " + strStreamName + "," + iSectionID) {
                                        app.pGage.m_arrray_StationIDsHt.splice(iSL2Ht, 1);
                                        break;
                                    }
                                }
                                console.log("breakpoint 1111111");
                            }

                            if (arrayUSACE_NWD_Sens_Loc != null) {
                                for (var iSL = 0; iSL < app.pGage.m_arrray_StationIDsTMP.length; iSL++) {  //remove placeholder sections if entered
                                    if (app.pGage.m_arrray_StationIDsTMP[iSL] == "(No Data) " + strStreamName + "," + iSectionID) {
                                        app.pGage.m_arrray_StationIDsTMP.splice(iSL, 1);
                                        break;
                                    }
                                }
                                for (var iSL2 = 0; iSL2 < app.pGage.m_arrray_StationIDsCFS.length; iSL2++) {  //remove placeholder sections if entered
                                    if (app.pGage.m_arrray_StationIDsCFS[iSL2] == "(No Data) " + strStreamName + "," + iSectionID) {
                                        app.pGage.m_arrray_StationIDsCFS.splice(iSL2, 1);
                                        break;
                                    }
                                }
                                for (var iSL2Ht = 0; iSL2Ht < app.pGage.m_arrray_StationIDsHt.length; iSL2Ht++) {  //remove placeholder sections if entered
                                    if (app.pGage.m_arrray_StationIDsHt[iSL2Ht] == "(No Data) " + strStreamName + "," + iSectionID) {
                                        app.pGage.m_arrray_StationIDsHt.splice(iSL2Ht, 1);
                                        break;
                                    }
                                }
                                console.log("breakpoint 1111111");
                            }

                            app.pGage.m_arrray_StationIDsTMP.push(strNoDataLabel4ChartingTMP + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                            app.pGage.m_arrray_StationIDsCFS.push(strNoDataLabel4ChartingCFS + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                            app.pGage.m_arrray_StationIDsHt.push(strNoDataLabel4ChartingHt + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting

                            if (blnIsInitialPageLoad) {
                                //var streamSectionDispalyName = strSiteName.replace(", MT", "").replace(" MT", "").replace(strStreamName, "").replace("Big Hole R", "");
                                var streamSectionDispalyName = strSiteName.replace(strStreamName, "");
                                streamSectionDispalyName = streamSectionDispalyName.replace("Red Rock Cr ", "");
                                streamSectionDispalyName = streamSectionDispalyName.replace("E Gallatin R ", "");

                                if (streamSectionDispalyName == "") {
                                    /*streamSectionDispalyName = strStreamName + " Section";*/
                                    console.log("this section does not have a dispaly name");
                                } else {
                                    streamSectionDispalyName = "(" + streamSectionDispalyName + ")";
                                }


                                OverallStatusAndColor = app.pGage.DivyUpStatusandColors(iOID, strSiteFlowStatus,
                                    strSiteTempStatus, strFWPTITLE,
                                    strFWPDESCRIPTION, strFWPLOCATION, strFWPPRESSRELEASE,
                                    strFWPPUBLISHDATE, strFWPWarn, strWatershed, strSiteHtStatus);

                                var strOverallStatus = OverallStatusAndColor[0];
                                var strOverallSymbol = OverallStatusAndColor[1];

								if (arrayDNRC_Sens_Loc != null) {
									for (var iSL3 = 0; iSL3 < app.pGage.m_arrray_RiverSectionStatus.length; iSL3++) {  //remove placeholder sections if entered
										if ((app.pGage.m_arrray_RiverSectionStatus[iSL3][9] == strStreamName) & (app.pGage.m_arrray_RiverSectionStatus[iSL3][10] == iSectionID)) {
											app.pGage.m_arrray_RiverSectionStatus.splice(iSL3, 1);
											break;
										}
									}
								}
                                if (arrayCODWR_Sens_Loc != null) {
                                    for (var iSL3 = 0; iSL3 < app.pGage.m_arrray_RiverSectionStatus.length; iSL3++) {  //remove placeholder sections if entered
                                        if ((app.pGage.m_arrray_RiverSectionStatus[iSL3][9] == strStreamName) & (app.pGage.m_arrray_RiverSectionStatus[iSL3][10] == iSectionID)) {
                                            app.pGage.m_arrray_RiverSectionStatus.splice(iSL3, 1);
                                            break;
                                        }
                                    }
                                }

                                if (arrayUSACE_NWD_Sens_Loc != null) {
                                    for (var iSL3 = 0; iSL3 < app.pGage.m_arrray_RiverSectionStatus.length; iSL3++) {  //remove placeholder sections if entered
                                        if ((app.pGage.m_arrray_RiverSectionStatus[iSL3][9] == strStreamName) & (app.pGage.m_arrray_RiverSectionStatus[iSL3][10] == iSectionID)) {
                                            app.pGage.m_arrray_RiverSectionStatus.splice(iSL3, 1);
                                            break;
                                        }
                                    }
                                }


                                if (((strSiteID == "12334550") | (strSiteID == "06025500") | (strSiteID == "06026210")) & (["EXPANDED CONSERVATION MEASURES", "PREPARE FOR CONSERVATION", "CONSERVATION"].includes(strSiteFlowStatus))) {   ///////////////////propogate symbology to other lines if meets special use case (i.e. Turah, and Big hole section 4)
                                    let queryObject = new Query();
                                    strRelatedStreamsQuery = app.pSup.getQueryDefs1_4()[5];
                                    
                                    queryObject.where = strRelatedStreamsQuery;
                                    queryObject.returnGeometry = false;
                                    queryObject.outFields = ["*"];
                                    query.executeQueryJSON(app.strHFL_URL + app.idx11[5], queryObject).then(function (results) {
                                        let blnFeaturesExist = false;
                                        let pFeatures = results.features;
                                        var resultCount = pFeatures.length;
                                        if (resultCount > 0) {

                                            dom.map(pFeatures, function (pRelatedStream) {  //loop through the endpoints
                                                if (!(m_arrayOIDsOrange.includes(pRelatedStream.attributes.OBJECTID)) | (m_arrayOIDsGold.includes(pRelatedStream.attributes.OBJECTID)) | (m_arrayOIDYellow.includes(pRelatedStream.attributes.OBJECTID)) ) {  /// don't change the symbology if already set

                                                    if (strSiteFlowStatus == "EXPANDED CONSERVATION MEASURES") {
                                                        m_arrayOIDsOrange.push(pRelatedStream.attributes.OBJECTID);
                                                    } else if (strSiteFlowStatus == "CONSERVATION") {
                                                        m_arrayOIDsGold.push(pRelatedStream.attributes.OBJECTID);
                                                    } else if (strSiteFlowStatus == "PREPARE FOR CONSERVATION") {
                                                        m_arrayOIDYellow.push(pRelatedStream.attributes.OBJECTID);
                                                    }
                                                }
                                            })
                                        }
                                        
                                    }).catch(function (error) {
                                        console.log("ReturnFeaturesExist_YesNo, error: ", error.message);
                                    });;
                                }


                                app.pGage.m_arrray_RiverSectionStatus.push([streamSectionDispalyName, //add to array that populates the river sections summary div
                                            strHyperlinkURL,
                                            dteLatestDateTimeTMP,
                                            dblLatestTMP.toString().replace("-999999", "Data not available"),
                                            strSiteTempStatus,
                                            dteLatestDateTimeCFS,
                                            dblLatestCFS.toString(),
                                            strSiteFlowStatus,
                                            strID,
                                            strStreamName,
                                            iSectionID,
                                            str3DayCFSTrendCFS,
                                            strMONTHDAYEarlyFlowFromDroughtManagementTarget,
                                            strMONTHDAYEarlyFlowToDroughtManagementTarget,
                                            iLateFlowPref4ConsvValue,
                                            iLateFlowConsvValue,
                                            iLateFlowClosureValueFlow,
                                            strLateFlowPref4ConsvValue,
                                            strLateFlowConsvValue,
                                            strLateFlowClosureValueFlow,
                                            iTempClosureValue,
                                            strTempCollected,
                                            strSiteID,
                                            strDailyStat_URL,
                                            str3DayCFSTrendTMP,
                                            strFWPDESCRIPTION,
                                            strFWPLOCATION,
                                            strFWPPRESSRELEASE,
                                            strFWPPUBLISHDATE,
                                            strFWPTITLE,
                                            strOverallStatus,
                                            strOverallSymbol,
                                            strStartEndpoint,
                                            strEndEndpoint,
                                            strWatershed,
                                            strSectionName_,
                                            dteLatestDateTimeHt,
                                            dblLatestHt.toString(),
                                            strSiteHtStatus,
                                            str3DayCFSTrendHt,
                                            iLateHtPref4ConsvValue,
                                            iLateHtConsvValue,
                                            strLateHtClosureValue,
                                            strLateHtPref4ConsvValue,
                                            strLateHtConsvValue,
                                            strLateFlowClosureValueHt,
                                            strAgency]);
                            }

                            var blnAddNew = false;
                            dteLatestDateTimeTMP = "";
                            dteLatestDateTimeCFS = "";
                            dteLatestDateTimeHt = "";
                            dblLatestTemp = "";
                            dblLatestCFS = "";
                            dblLatestHt = "";
                            arrayTempsAbove =[];
                            strSiteName = "";
                        })

                        arrayJSONValues = [];

                        app.pGage.mIDXQuery1AtaTime += 1;

                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        ///////////////////// the 1st time this runs through is for the USGS gages & then checks if other sources available
                        /////////////////////     MT DNRC 2nd if exists
                        /////////////////////     CO DWR 3nd if exists
                        /////////////////////     USACE 4nd if exists
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        if ((blnQuery1AtaTime) & (app.pGage.mIDXQuery1AtaTime < arrayProc.length)) {
                            app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, blnQuery1AtaTime, iHtTarget1, iHtTarget2, iHtTarget3)
                        } else if ((arraySiteIDsDNRC.length > 0) & (app.bln_MTDNRC_Src_NeedsProc)) {
                            app.pGage.DNRCSectionsReceived(arraySiteIDsDNRC, "", "", "", "", false, null, blnIsInitialPageLoad, iHtTarget1, iHtTarget2, iHtTarget3)
                        } else if ((arraySiteIDsCODWR.length > 0) & (app.bln_CODWR_Src_NeedsProc)) {
                            app.pGage.CODWRSectionsReceived(arraySiteIDsCODWR, "", "", "", "", false, null, blnIsInitialPageLoad, iHtTarget1, iHtTarget2, iHtTarget3)
                        } else if ((arraySiteIDsUSACE_NWD.length > 0) & (app.bln_USACE_NWD_Src_NeedsProc)) {
                            app.pGage.USACE_NWD_SectionsReceived(arraySiteIDsUSACE_NWD, "", "", "", "", false, null, blnIsInitialPageLoad, iHtTarget1, iHtTarget2, iHtTarget3)
                        }
                        else {

                            console.log("Completed: Stream Gage Data Received");
                            app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);
                            app.pGage.mIDXQuery1AtaTime = 0;

                            if ((app.blnReservoirGagesExist) & (blnIsInitialPageLoad)) {
                                app.pGageRes.Start(app.pGage.GetDatesForRunningRCT()[0], app.pGage.GetDatesForRunningRCT()[1]);
                            }
                        }
                    })

                    .fail(function (jqxhr, textStatus, error) {
                        var err = textStatus + ", " + app.strURLGage + ", " + error;
                        //alert("Initial query for USGS gage data failed, trying again");
                        document.getElementById("divLoadingUSGS").innerHTML = "Loading USGS Data, again";
                        console.log("Request Failed: " + err);

                        if (!blnQuery1AtaTime) {  //if the USGS api is erroring out try the refactored method
                            app.pGage.SectionsReceived(arrayProc, iCFSTarget1, iCFSTarget2, iCFSTarget3, iTMPTarget1, true,
                                iHtTarget1, iHtTarget2, iHtTarget3)
                        }
                    })
                    .always(function () {
                        if ((!(blnIsInitialPageLoad)) & (app.pGage.m_arrray_StationIDsCFS.length == 0)) {  // in the case of no gage station do the following for the graphing
                            dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
                                iSectionID = itemSectionRefined[2];
                                strStreamName = itemSectionRefined[0];
                                app.pGage.m_arrray_StationIDsTMP.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                app.pGage.m_arrray_StationIDsCFS.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                app.pGage.m_arrray_StationIDsHt.push("(No Data) " + strStreamName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                app.pGage.StreamSectionSummaryUIAdditions(blnIsInitialPageLoad);

                                console.log("Completed: Single section");
                            })
                        } 
                    });
            }
        },

        DivyUpStatusandColors: function (iOID, strSiteFlowStatus, strSiteTempStatus, strTITLE,
                                                         strDESCRIPTION, strLOCATION,
                                                         strPRESSRELEASE, strPUBLISHDATE, strFWPWarn,
                                                         strWatershed, strSiteHtStatus) {
            var strOverallStatus = "Open";
            var strOverallSymbol = "White";

            if (strSiteHtStatus == "PREPARE FOR CONSERVATION") {
                strOverallStatus = "RECOMMENDED CONSERVATION MEASURES (click for details and see table below for more info)";
                strOverallSymbol = "Yellow";
                m_arrayOIDYellow.push(iOID);
            }
                if (strSiteHtStatus == "CONSERVATION") {
                strOverallStatus = "CONSERVATION";
                strOverallSymbol = "Gold";
                m_arrayOIDsGold.push(iOID);
            }
                if (strSiteHtStatus == "EXPANDED CONSERVATION MEASURES") {
                    strOverallStatus = "EXPANDED CONSERVATION MEASURES (click for details and see table below for more info)";
                strOverallSymbol = "Orange";
                m_arrayOIDsOrange.push(iOID);
            }


           
            if (strSiteFlowStatus == "PREPARE FOR CONSERVATION") {
                strOverallStatus = "PREPARE FOR CONSERVATION (click for details and see table below for more info)";
                strOverallSymbol = "Yellow";
                m_arrayOIDYellow.push(iOID);
            }
            if (strSiteFlowStatus == "CONSERVATION") {
                strOverallStatus = "CONSERVATION (click for details and see table below for more info)";
                strOverallSymbol = "Gold";
                m_arrayOIDsGold.push(iOID);
            }
            if (strSiteFlowStatus == "EXPANDED CONSERVATION MEASURES") {
                strOverallStatus = "EXPANDED CONSERVATION MEASURES (click for details and see table below for more info)";
                strOverallSymbol = "Orange";
                m_arrayOIDsOrange.push(iOID);
            }


            if (strSiteFlowStatus == "POTENTIAL RECREATION ISSUES") {
                strOverallStatus = "POTENTIAL RECREATION ISSUES (click for details and see table below for more info)";
                strOverallSymbol = "Red";
                m_arrayOIDsRed.push(iOID);
            }


            if ((strSiteTempStatus == "EXPANDED CONSERVATION MEASURES") &
                ((strWatershed == "North Fork Flathead") |
                    (strWatershed == "Mainstem Flathead") |
                    (strWatershed == "Swan") |
                    (strWatershed == "Lower Flathead") |
                    (strWatershed == "Stillwater") |
                    (strWatershed == "South Fork Flathead") |
                    (strWatershed == "Middle Fork Flathead")
                )) {
                strOverallStatus = "RECOMMENDED CONSERVATION MEASURES (click for details and see temp. section below for more info)";
                strOverallSymbol = "Plum";
                m_arrayOIDsPlum.push(iOID);
            }
            else if (strSiteTempStatus == "EXPANDED CONSERVATION MEASURES") {
                strOverallStatus = "PREPARE FOR HOOT-OWL FISHING RESTRICTIONS (click for details and see temp. section below for more info)";
                strOverallSymbol = "Plum";
                m_arrayOIDsPlum.push(iOID);
            }

            if (strFWPWarn != "") {
                strSiteFlowStatus = "MT FWS Restriction (click for details)";
                strOverallStatus = "MT FWP Official Restriction (click for details)";
                strOverallSymbol = "Red";
                m_arrayOIDsRed.push(iOID);
            }

            return [strOverallStatus, strOverallSymbol];
        },

        err: function (err) {
			console.log("Failed to get results 1 due to an error: ");
			console.log(err);
        }

    });
}
);

