//Explore drilldown examples https://js.devexpress.com/Demos/WidgetsGallery/Demo/Charts/ChartsDrillDown/Knockout/Light/

define([
        "esri/tasks/QueryTask",
        "esri/rest/support/Query",
        "esri/geometry/Polygon",
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
           QueryTask, Query, Polygon, declare, lang, esriRequest, All, request, dom, domClass, registry, on, geometryEngine
) {

		return declare([], {
			m_arrray_ReservoirStatus: [],
            m_arrray_Detail4Chart_ForeBay: [],
            m_arrray_Res_Detail4ChartHistoryCFS: [],
            //m_arrray_Detail4ChartHistoryHt: [],
            m_arrray_StationIDsFB: [],
			m_ProcessingIndex: 0,
			m_arrayRes_OIDYellow: [],
			m_arrayRes_OIDsGold: [],
			m_arrayRes_OIDsOrange: [],
			m_arrayRes_OIDsPlum: [],
			m_arrayRes_OIDsRed: [],
			mIDXQuery1AtaTime: 0,
			m_arrayRes_DNRC_Sens_Loc: null,
            m_arrayRes_CODWR_Sens_Loc: null,
            m_arrayRes_BOR_MB_Sens_Loc: null,
            m_arrayRes_USACE_NWD_Sens_Loc: null,

            gageReadingsReservoir: function (strSiteName,
                                strHyperlinkURL,
                                dteLatestDateTimeForeBay,
                                dblLatestForeBay,
                                strSiteForeBayStatus,
                                strGageID,
                                strStreamSystemName,
                                strSectionID,
                                str3DayFBTrend,
                                strOverallStatus,
                                strMONTHDAYEarlyFlowFromDroughtManagementTarget,
                                strMONTHDAYEarlyFlowToDroughtManagementTarget,
                                iLateFBPref4ConsvValue,                         //iLateFlowPref4ConsvValue,
                                iLateFBConsvValue,                                        //iLateFlowConsvValue,
                                iLateFBClosureValue,                         //iLateFlowClosureValueFlow,
                                strLateFBPref4ConsvValue,                         //strLateFlowPref4ConsvValue,
                                strLateFBConsvValue,                         //strLateFlowConsvValue,
                                strLateFBClosureValue,                         //strLateFlowClosureValueFlow,
                                strSiteID,
                                strDailyStat_URL,
                                strFWPDESCRIPTION,
                                strFWPLOCATION,
                                strFWPPRESSRELEASE,
                                strFWPPUBLISHDATE,
                                strFWPTITLE,
                                strOverallStatus,                         // strOverallStatus,
                                strOverallSymbol,                         //strOverallSymbol,
                                strWatershed,
                                strLake_Reservoir_Name_,
                                strTeaCupURL,
                                iHt_Flood,
                                iHt_BaseElev,
                                strAgency
							) {// Class to represent a row in the gage values grid
            var self = this;
            self.SiteName = strSiteName;
            self.Hyperlink = strHyperlinkURL;
            self.ForeBay = dblLatestForeBay;
            self.formattedForeBayDateTime = ko.computed(function () {
                var strDateTimeForeBay = (dteLatestDateTimeForeBay.getMonth() + 1) + "/" + dteLatestDateTimeForeBay.getDate() + "/" + dteLatestDateTimeForeBay.getFullYear();
                strDateTimeForeBay += " " + dteLatestDateTimeForeBay.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                return strDateTimeForeBay ? strDateTimeForeBay : "None";
            });
            
            self.SiteFBStatus = strSiteForeBayStatus;
            self.StreamSystemName = strStreamSystemName;
            self.Lake_Reservoir_Name_ = strLake_Reservoir_Name_;
            self.Day3FBTrend = str3DayFBTrend;
            self.strMONTHDAYEarlyFlowFromDroughtManagementTarget = strMONTHDAYEarlyFlowFromDroughtManagementTarget;
            self.strMONTHDAYEarlyFlowToDroughtManagementTarget = strMONTHDAYEarlyFlowToDroughtManagementTarget;
            self.strSiteID = strSiteID;
            self.strDailyStat_URL = strDailyStat_URL;
            self.overallStatus = strOverallStatus;
            self.overallSymbol = strOverallSymbol;
            self.strWatershed = strWatershed;
            self.dteLatestDateTimeForeBay = dteLatestDateTimeForeBay;
            self.iLateFBPref4ConsvValue = iLateFBPref4ConsvValue;
            self.iLateFBConsvValue = iLateFBConsvValue;
            self.iLateFBClosureValue = iLateFBClosureValue;
            self.strLateFBPref4ConsvValue = strLateFBPref4ConsvValue;
            self.strLateFBConsvValue = strLateFBConsvValue;
            self.strLateFBClosureValue = strLateFBClosureValue;
            self.strTeaCupURL = strTeaCupURL;
                self.iHt_BaseElev = iHt_BaseElev;
                self.iHt_Flood = iHt_Flood;
			self.strAgency = strAgency;
        },
        
        handleReservoirGageResults: function (results) {
            var items = dom.map(results, function (result) {
                return result;
            });
            var streamSectionArrray = [];
            var found = false;
            var strHt_Active = "";
            var strStratDate = "";
            var strtoDate = "";
            var isomeval = "";
            var strsomenote = "";
            var iHt_BaseElev = 99999;
            var iHt_Flood = 99999;
            var strHt_NoteActive = "";
            var strHt_NoteFlood = "";
            var iOID = "";
            var strStartEndpoint = "";
            var strEndEndpoint = "";
            var strDailyStat_URL = "";
            var strGage2URL = "";
            var reservoirGageArrray = [];

			dom.map(items[0].features, function (itemSection) {  //loop through the sections!!!!
                let strTempCollected = null;
                let strStratDate = "";
                let strtoDate = "";
                let isomeval = "";
                let strsomenote = "";
                let iHt_Active = 99999;
                let iHt_Flood = 99999;
                let iHt_BaseElev = 99999;
                let strHt_NoteActive = "";
                let strHt_NoteFlood = "";
                let strDailyStat_URL = "";

                if (itemSection.attributes.GageID_Abrev != null) {
                    if (itemSection.attributes.BaseElev != null) {
                        iHt_BaseElev = itemSection.attributes.BaseElev;
                    }
                    if (itemSection.attributes.Flood_ft != null) {
                        iHt_Flood = itemSection.attributes.Flood_ft;
                        strHt_NoteFlood = itemSection.attributes.Flood_ft.toString() + " temporary text";
                    }

                    switch (itemSection.attributes.Agency) {
                        case "BOR-MB":
                            app.bln_RES_BOR_MB_Src_NeedsProc = true;
                            break;
                        case "USACE-NWD":
                            app.bln_RES_USACE_NWD_Src_NeedsProc = true;
                            break;
                        default:
                            console.log("no agency match");
                    }

                    reservoirGageArrray.push([
                        itemSection.attributes.GageID_Abrev,
                        itemSection.attributes.StreamSystem,
                        "someval",
                        "somenote",
                        itemSection.attributes.OBJECTID,
                        itemSection.attributes.GageURL1,
                        itemSection.attributes.GageURL2,
                        itemSection.attributes.Watershed,
                        itemSection.attributes.Lake_Reservoir_Name,
                        iHt_BaseElev,  //ht dead poool
                        null,  //af dead poool
                        null,  //ht inactive pool
                        null,  //af inactive pool
                        iHt_Active,
                        null, //af active
                        iHt_Flood,
                        null, //af flood,
                        null, //dead note
                        null, //inactive note
                        strHt_NoteActive,
                        strHt_NoteFlood,
                        itemSection.attributes.Gage_Name,
                        itemSection.attributes.TeaCupURL,
                        iHt_BaseElev,
                        iHt_Flood,
                        itemSection.attributes.Agency
                    ]);

                    console.log("gage added");
                }
            })

            reservoirGageArrray.sort(
                function (a, b) {
                    if (a[21]=== b[21]) {    //sort based on 1st value in the array
                        return a[1]-b[1];
                    }
                    return a[21]> b[21]? 1: -1;
                });

            let sectionGeometries = new Polygon(app.view.spatialReference);
            for (var i = 0; i < items[0].features.length; i++) {
                var rings = items[0].features[i].geometry.rings;
                for (var j = 0; j < rings.length; j++) { //needed for multi part lines
                    sectionGeometries.addRing(rings[j]);
                }
            }
            
            app.pGetWarn.Start4Reservoirs(sectionGeometries, reservoirGageArrray);
        },

		getArray2Process: function (strURL, strQuery) {// Class to represent a row in the gage values grid
			console.log("getArray2Process");
            var siteNameArrray = [];
            let q_Layer1 = new Query();
            let qt_Layer1 = new QueryTask(strURL + app.idx11[7]); //sections layer
            q_Layer1.returnGeometry = true;
            q_Layer1.outFields = ["*"];;
            q_Layer1.where = strQuery;
            var pLayer1, pPromises;
            pLayer1 = qt_Layer1.execute(q_Layer1);
            pPromises = new All([pLayer1]);  //keeping the promis syntax in case we need it later
            //pPromises = new All([pLayer1, pLayer2, pLayer3]);
            pPromises.then(this.handleReservoirGageResults, this.err);
        },
        
		ViewModel2FB: function () {  //this is for google charts
            //https://developers.google.com/chart/interactive/docs/datatables_dataviews
            var self = this;
            self.ViewModel2FB_LineData = ko.computed(function () {
                var strIDTemp = "";
                var arraystrIDs = [];
                var arrayPrelimData_1 = [];
                var arrayPrelimData_2 = [];
                var arrayPrelimData_3 = [];

                var uniqueSiteIDs = [];  //Remove duplicates from the siteid array
                $.each(app.pGageRes.m_arrray_StationIDsFB, function (i, el) {
                    if ($.inArray(el, uniqueSiteIDs) === -1) uniqueSiteIDs.push(el);
                });

                blnSingleCharting = false;
                var iChart_TMP_ColumnNames = [];
                if (app.pGageRes.m_arrray_Detail4Chart_ForeBay.length > 0) {//get the 1st gagedate form comparrison
                    var dteDateTimeTemp = app.pGageRes.m_arrray_Detail4Chart_ForeBay[0].gagedatetime;

                    if (app.pGageRes.m_arrray_StationIDsFB.length == 1) {
                        blnSingleCharting = true;
                        var iFBTarget1 = app.pGageRes.m_arrray_Detail4Chart_ForeBay[0].iFBTarget1;

                        if (iFBTarget1 != undefined) {
                            if (!(isNaN(iFBTarget1))) {
                                iFBTarget1 = Number(iFBTarget1)
                                if (iFBTarget1 != 0) {
                                    iChart_TMP_ColumnNames.push(iFBTarget1.toString() + "Consv. Target");
								}
							}
						}
                    }
                }

                for (var i = 0; i < app.pGageRes.m_arrray_Detail4Chart_ForeBay.length; i++) {
                    var strID = app.pGageRes.m_arrray_Detail4Chart_ForeBay[i].id;
                    var dteDateTime = app.pGageRes.m_arrray_Detail4Chart_ForeBay[i].gagedatetime;
                    var iFBVal = app.pGageRes.m_arrray_Detail4Chart_ForeBay[i].FB;

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
                                var iVal2Chart = arrayPrelimData_1[f].FB;
                                if (iVal2Chart == -999999) {
                                    iVal2Chart = null;
                                }
                            }
                            arrayPrelimData_2.push(iVal2Chart);

                            if (blnSingleCharting) {
                                if (iFBTarget1 != undefined) {
                                    arrayPrelimData_2.push(iFBTarget1);
                                }
                            }
                        }

                        arrayPrelimData_3.push(arrayPrelimData_2);
                        arrayPrelimData_1 = [];
                    }
                    var obj22 = {};       // build a temporary array of all the cfs values to use when the date/time switches and will grabe appropriate values based on station id as a key
                    obj22["id"] = strID;
                    obj22["FB"] = iFBVal;
                    obj22["gagedatetime"] = dteDateTime;
                    arrayPrelimData_1.push(obj22);
                    strIDTemp = strID;
                    dteDateTimeTemp = dteDateTime;
                }

                var strDateColumnName = "DatetimeFB";
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



        

		readingsViewModel_RES: function () {
            console.log("readingsViewModel_RES");
            var self = this;
            //app.pGageRes.m_arrray_ReservoirStatus =
            //    app.pGageRes.m_arrray_ReservoirStatus.sort(function (a, b) { return a[9]+a[10] > b[9]+b[10] ? 1 : -1; }); //sorting by contcatonating stream name and secitonID

            if (typeof app.pGageRes.m_arrray_ReservoirStatus !== "undefined") {//this feed then gageReadingsReservoir: function
                var arrayKOTemp = [];
                for (var i = 0; i < app.pGageRes.m_arrray_ReservoirStatus.length; i++)
                    arrayKOTemp.push(new app.pGageRes.gageReadingsReservoir(app.pGageRes.m_arrray_ReservoirStatus[i][0],
                        app.pGageRes.m_arrray_ReservoirStatus[i][1],
                        app.pGageRes.m_arrray_ReservoirStatus[i][2],  //latest fb time
                        app.pGageRes.m_arrray_ReservoirStatus[i][3], //lateste fb
                        app.pGageRes.m_arrray_ReservoirStatus[i][4],
                        app.pGageRes.m_arrray_ReservoirStatus[i][5],
                        app.pGageRes.m_arrray_ReservoirStatus[i][6],  //stream sys name
                        app.pGageRes.m_arrray_ReservoirStatus[i][7],
                        app.pGageRes.m_arrray_ReservoirStatus[i][8], //trend image
                        app.pGageRes.m_arrray_ReservoirStatus[i][9],
                        app.pGageRes.m_arrray_ReservoirStatus[i][10],
                        app.pGageRes.m_arrray_ReservoirStatus[i][11],
                        app.pGageRes.m_arrray_ReservoirStatus[i][12],
                        app.pGageRes.m_arrray_ReservoirStatus[i][13],
                        app.pGageRes.m_arrray_ReservoirStatus[i][14],
                        app.pGageRes.m_arrray_ReservoirStatus[i][15],
                        app.pGageRes.m_arrray_ReservoirStatus[i][16],
                        app.pGageRes.m_arrray_ReservoirStatus[i][17],
                        app.pGageRes.m_arrray_ReservoirStatus[i][18], //siteid
                        app.pGageRes.m_arrray_ReservoirStatus[i][19], //strDailyStat_url
                        app.pGageRes.m_arrray_ReservoirStatus[i][20],
                        app.pGageRes.m_arrray_ReservoirStatus[i][21],
                        app.pGageRes.m_arrray_ReservoirStatus[i][22],
                        app.pGageRes.m_arrray_ReservoirStatus[i][23],
                        app.pGageRes.m_arrray_ReservoirStatus[i][24],
                        app.pGageRes.m_arrray_ReservoirStatus[i][25],
                        app.pGageRes.m_arrray_ReservoirStatus[i][26], //overall symbol
                        app.pGageRes.m_arrray_ReservoirStatus[i][27], //watershed
                        app.pGageRes.m_arrray_ReservoirStatus[i][28], //res name
                        app.pGageRes.m_arrray_ReservoirStatus[i][29],//TeaCupURL
                        app.pGageRes.m_arrray_ReservoirStatus[i][30],//iHt_BaseElev;
                        app.pGageRes.m_arrray_ReservoirStatus[i][31],//iHt_Flood;
                        app.pGageRes.m_arrray_ReservoirStatus[i][32]                    ));

                //self.gageRecords = ko.observableArray_Reservoir(arrayKOTemp);
                self.gageReservoirRecords = ko.observableArray(arrayKOTemp);
                
                self.CurrentDisplayGageRecord_Res = ko.observable(self.gageReservoirRecords()[0]);
                self.selectThing = function (item) {
                    document.getElementById("divSectionDetail_RESERVOIR_A").style.display = 'inline';


                    if (((item.iLateFlowPref4ConsvValue == null) | (item.iLateFlowPref4ConsvValue == 0)) &
                        ((item.iLateFlowConsvValue == null) | (item.iLateFlowConsvValue == 0)) &
                        ((item.iLateFlowClosureValueFlow == null) | (item.iLateFlowClosureValueFlow == 0))) {
                        document.getElementById("divCFSTargetDefinitions").style.display = 'none';
                    } else {
                        document.getElementById("divCFSTargetDefinitions").style.display = 'inline';
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

                    //if ((item.fwpTITLE == "") | (item.fwpTITLE == "") | (item.fwpTITLE == "")) {
                    //    document.getElementById("detailSection2").style.display = 'none';
                    //} else {
                    //    $("#detailSection2").show();
                    //}
                    
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

                    
                    self.CurrentDisplayGageRecord_Res(item);
                };
                self.avgTemp = ko.computed(function () {
                    var total = 0;
                    for (var i = 0; i < self.gageReservoirRecords().length; i++)
                        total += self.gageReservoirRecords()[i].rWaterTemp;
                    dblAverage = total / self.gageReservoirRecords().length;
                    return dblAverage;
                });
            } else {
                var currentdate = new Date();
                self.gageReservoirRecords = ko.observableArray([new app.pGageRes.gageReadingsReservoir("", "", currentdate, 0, "", currentdate, 0, "")]);
            }

        },
        
        Start: function (dteStartDay2Check, dteEndDay2Check) {
            app.bln_RES_USACE_NWD_Src_NeedsProc = false;
            app.bln_RES_BOR_MB_Src_NeedsProc = false;

            this.dteStartDay2Check = dteStartDay2Check;
            this.dteEndDay2Check = dteEndDay2Check;

            strQuery = app.ReservoirQryStringGetGageData;

            this.getArray2Process(app.strHFL_URL, strQuery);
        },

        GraphSingleSEction: function (strClickSiteName, strSiteID, strLake_Reservoir_Name_, strStreamSystemName, 
                                            iHt_BaseElev, iHt_Flood, strWatershed, strDailyStat_URL, strAgency) {

                app.pGageRes.m_arrray_StationIDsFB = [];
                app.pGageRes.m_arrray_Detail4ChartTMP = [];
                app.pGageRes.m_arrray_Detail4ChartHistoryTMP = [];
                app.pGageRes.m_arrray_Detail4Chart_ForeBay = [];
                app.pGageRes.m_arrray_Detail4ChartHistoryCFS = [];
                app.pGageRes.m_arrray_Detail4ChartHt = [];
                app.pGageRes.m_arrray_Detail4ChartHistoryHt = [];


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
            

            var strURL = strDailyStat_URL;
            if ((strAgency == "BOR") | (strAgency == "USACE-NWD")) {  ///!!!!!!!!!!!! not doing historical information for reservoir gages, settting url to blank
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
                                            obj["id"] = strStreamSystemName + "," + iSectionID;
                                            obj["date"] = dteDate4Charting.getFullYear() + "-" + ("0" + (dteDate4Charting.getMonth() + 1)).slice(-2) + "-" + ("0" + dteDate4Charting.getDate()).slice(-2);
                                            obj["time"] = dteDate4Charting.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
                                            obj["cfs"] = arrayTabs[idxMean];
                                            obj["gagedatetime"] = dteDate4Charting;
                                            app.pGageRes.m_arrray_Detail4ChartHistoryCFS.push(obj);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    });

                    var reservoirGageArrray = [];
                    reservoirGageArrray.push([strSiteID, strStreamSystemName, null, null, null, strDailyStat_URL, null, strWatershed, strLake_Reservoir_Name_, null, null, null, null, null, null, null, null, null, null, null, null, strClickSiteName, strAgency]);

                    app.pGageRes.ReservoirsReceived(reservoirGageArrray, iHt_BaseElev, iHt_Flood, false);
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });
        },

        ReservoirSummaryUIAdditions: function (blnIsInitialPageLoad_Reservoir) {
            console.log("Stream Section Summary UI Additions");
            if (blnIsInitialPageLoad_Reservoir) {
                app.blnZoom = true; //this controls zooming to sections if user clicks a summary or if clicks on map
                var vm = new app.pGageRes.readingsViewModel_RES();
                ko.applyBindings(vm, document.getElementById("entriesConRESERVOIR_div"));
                ko.applyBindings(vm, document.getElementById("divSectionDetail_RESERVOIR_A"));

                /*var elements = document.getElementsByTagName('tr');  //Sets the click event for the row*/
                var table = document.getElementById("entriesReservoir");
                var rows = table.getElementsByTagName("tr");

                var str_overallSymbool = "";
                for (var i = 0; i < rows.length; i++) {
                    (rows)[i].addEventListener("click", function () {
                        var strTempText = this.innerHTML;  //parse the section summary text to set var's for charting and zooming
                        strTempText = strTempText.substring(strTempText.indexOf("SiteName") + ("SiteName".length + 2), strTempText.length);
                        let strClickSiteName = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("Lake_Reservoir_Name_") + ("Lake_Reservoir_Name_".length + 2), strTempText.length);
                        let strClickLake_Reservoir_Name_ = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("StreamSystemName") + ("StreamSystemName".length + 2), strTempText.length);
                        let strClickStreamSystemName = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("overallStatus") + ("overallStatus".length + 2), strTempText.length);
                        let strOverallStatus = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("strSiteID") + ("strSiteID".length + 2), strTempText.length);
                        let strClickSiteID = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("strDailyStat_URL") + ("strDailyStat_URL".length + 2), strTempText.length);
                        let strDailyStat_URL = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("overallSymbol") + ("overallSymbol".length + 2), strTempText.length);
                        let strOverallSymbol = strTempText.substring(0, strTempText.indexOf("</span>"));

						strTempText = strTempText.substring(strTempText.indexOf("strWatershed") + ("strWatershed".length + 2), strTempText.length);
                        let strWatershed = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("strTeaCupURL") + ("strTeaCupURL".length + 2), strTempText.length);
                        let strTeaCupURL = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("iHt_BaseElev") + ("iHt_BaseElev".length + 2), strTempText.length);
                        let iHt_BaseElev = strTempText.substring(0, strTempText.indexOf("</span>"));

                        strTempText = strTempText.substring(strTempText.indexOf("iHt_Flood") + ("iHt_Flood".length + 2), strTempText.length);
                        let iHt_Flood = strTempText.substring(0, strTempText.indexOf("</span>"));

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

                        app.pGageRes.GraphSingleSEction(strClickSiteName, strClickSiteID, strClickLake_Reservoir_Name_, strClickStreamSystemName,
                                                        iHt_BaseElev, iHt_Flood, strWatershed, strDailyStat_URL, strAgency);



                        let pGFeature = null;
                        app.pZoom.qry_Zoom2FeatureLayerByQuery(app.strHFL_URL + app.idx11[7], 
                                                                "Lake_Reservoir_Name = '" + strClickLake_Reservoir_Name_ + "'", app.blnZoom);
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

                app.pSup.addReservoirConditionFeatureLayer(m_arrayOIDYellow, m_arrayOIDsGold, m_arrayOIDsOrange, m_arrayOIDsPlum, m_arrayOIDsRed);

                tableHighlightRow();
                document.getElementById("loadingImg2").style.display = "none";
                document.getElementById("divLoadingUSGS").style.display = "none";
            }  //if initial run through, post stream section detail for all the stream sections


            app.pGageRes.m_arrray_Detail4Chart_ForeBay.sort(function (a, b) {
                var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)
                return dateA - dateB //sort by date ascending
            })


            var ViewModel2FB_model = new app.pGageRes.ViewModel2FB();
            var elementFB = $('#ViewModel2FBBinding_div')[0];

            if (!(blnIsInitialPageLoad_Reservoir)) {
                ko.cleanNode(elementFB);
            }

            ko.applyBindings(ViewModel2FB_model, document.getElementById("ViewModel2FBBinding_div"));
            $(window).resize(function () { //this is necessary to call for responsivness since google charts are sized are not changeable, must re-create
                ko.cleanNode(elementFB);
                ko.applyBindings(ViewModel2FB_model, document.getElementById("ViewModel2FBBinding_div"));
            });
        },

       


            BOR_mb_ReservoirsReceived: function (arrayProc,  blnQuery1AtaTime, blnIsInitialPageLoad_Reservoir) {  //this is needed to get the SensorID for each location
                console.log("BOR_mb_ReservoirsReceived start");

                app.bln_RES_BOR_MB_Src_NeedsProc = false;

                //https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrytimeserieshour/?startDate=-3days&abbrev=MANCHICO%2CMANMANCO
                //var strURLGagePrefix = "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?abbrev=";

                

                var arrayProc2 = [];
                var arraySiteIDsBOR_mb = [];

                for (var ii in arrayProc) {
                    if (arrayProc[ii][1] != null) {
                        strAgency = arrayProc[ii][(arrayProc[ii].length - 1)];  //the agency will be the last element in the array.  If loading all sections then array is long, if single click then array is short
                        if (strAgency == "USACE-NWD") {
                            let strURLGagePrefix = "https://cwms-data.usace.army.mil/cwms-data/timeseries?name=";
                            let strURLGageSuffix = ".Elev-Forebay.Inst.1Hour.0.CBT-REV&office=NWDP&unit=EN&begin=2024-01-22T17%3A40%3A42&end=2024-01-26T17%3A40%3A42";
                            let strSiteID = arrayProc[ii][0]; //site id will be the first element in the array
                            arrayProc2 = arrayProc;
                            
                            app.strRES_URLGage = strURLGagePrefix + strSiteID + strURLGageSuffix;

                            var arrayCODWR_Sens_Loc = [];

                            $.getJSON(app.strRES_URLGage)
                                .done(function (jsonResult) {
                                    if (jsonResult["time-series"]["time-series"].length > 0) {
                                        arrayJSONValues = jsonResult["time-series"]["time-series"][0]["irregular-interval-values"].values;
                                        var strUSACE_NWD_1stTime = jsonResult["time-series"]["time-series"][0]["irregular-interval-values"].values[0][0];
                                        var dteUSACE_NWD_1stTime = Date.parse(strUSACE_NWD_1stTime);
                                        var strUSACE_NWD_LastTime = jsonResult["time-series"]["time-series"][0]["irregular-interval-values"].values[(arrayJSONValues.length - 1)][0];
                                        var dteUSACE_NWD_LastTime = Date.parse(strUSACE_NWD_LastTime);
                                    }
                                    app.pGageRes.m_arrayCODWR_Sens_Loc = arrayCODWR_Sens_Loc;
                                    app.pGageRes.ReservoirsReceived(arrayProc, iHt_BaseElev, iHt_Flood, blnQuery1AtaTime)
                                })

                                .fail(function (jqxhr, textStatus, error) {
                                    var err = textStatus + ", " + app.strRES_URLGage + ", " + error;
                                    //alert("Initial query for USGS gage data failed, trying again");
                                    document.getElementById("divLoadingUSGS").innerHTML = "Loading Gage Data, again";
                                    console.log("Request Failed: " + err);

                                    if (!blnQuery1AtaTime) {  //if the USGS api is erroring out try the refactored method
                                        app.pGageRes.ReservoirsReceived(arrayProc, iHt_BaseElev, iHt_Flood, true);
                                    }
                                })
                                .always(function () {
                                    if ((!(blnIsInitialPageLoad_Reservoir)) & (app.pGageRes.m_arrray_StationIDsCFS.length == 0)) {  // in the case of no gage station do the following for the graphing
                                        dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
                                            iSectionID = itemSectionRefined[2];
                                            strStreamSystemName = itemSectionRefined[0];
                                            app.pGageRes.m_arrray_StationIDsTMP.push("(No Data) " + strStreamSystemName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                            app.pGageRes.m_arrray_StationIDsCFS.push("(No Data) " + strStreamSystemName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                            app.pGageRes.m_arrray_StationIDsHt.push("(No Data) " + strStreamSystemName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                                            app.pGageRes.ReservoirSummaryUIAdditions(blnIsInitialPageLoad_Reservoir);
                                        })
                                    }
                                });


                        }
                    }
                }
            },

            USACE_NWD_ReservoirsReceived: function (arrayProc, blnQuery1AtaTime, blnIsInitialPageLoad_Reservoir) {  //this is needed to get the SensorID for each location
                console.log("USACE_NWD_SectionsReceived start");
                app.bln_USACE_NWD_Src_NeedsProc = false;
                var arraySiteIDsUSACE_NWD = [];

                blnQuery1AtaTime = false;

                var arrayUSACE_NWD_Sens_Loc = [];

                for (var ii in arrayProc) {
                    if (arrayProc[ii][1] != null) {
                        strAgency = arrayProc[ii][(arrayProc[ii].length - 1)];  //the agency will be the last element in the array.  If loading all sections then array is long, if single click then array is short
                        if (strAgency == "USACE-NWD") {
                            arraySiteIDsUSACE_NWD.push(arrayProc[ii][0]);

                            arrayUSACE_NWD_Sens_Loc.push([arrayProc[ii][0],  //gage ID/abbrev
                                    arrayProc[ii][21], //long name
                                    arrayProc[ii][8],   //reservoir name
                                    arrayProc[ii][0],   // gage id/abbrev
                                        null, null]
                            );
                            app.pGageRes.m_arrayRes_USACE_NWD_Sens_Loc = arrayUSACE_NWD_Sens_Loc;
                        }
                    }
                }
                app.pGageRes.ReservoirsReceived(arrayProc, null, null, blnQuery1AtaTime)

            },

        ReservoirsReceived: function (arrayProc, iHt_BaseElev, iHt_Flood, blnQuery1AtaTime) {
            console.log("ReservoirsReceived1");

            var EntiretrHTML, strHyperlinkURL1, strHyperlinkURL2, strSiteID_Abbrevs,
                strFWPWarn, strAgency;
            EntiretrHTML = strHyperlinkURL1 = strHyperlinkURL2 = strSiteID_Abbrevs =
                strFWPWarn = strAgency = "";

            var iProcIndex, arraySiteIDInfo, strStreamSystemName, strSiteIDAbrrev, iSectionID, strResGageName,
                iOID;
            iProcIndex = arraySiteIDInfo = strStreamSystemName = strSiteIDAbrrev = iSectionID = strResGageName =
                iOID = null;

            var array_RES_USACE_NWD_Sens_Loc = null;
            var array_RES_BOR_MB_Sens_Loc = null;

            var blnIsInitialPageLoad_Reservoir = app.blnIsInitialPageLoad_Reservoir;
            var blnSingleSelect_BOR_MB = false;
            var blnSingleSelect_USACE_NWD = false;

            if ((arrayProc[0].length == 4) & (arrayProc.length == 1) & (arrayProc[0][3] == "BOR-MB")) {
                var blnSingleSelect_BOR_MB = true;
                array_RES_BOR_MB_Sens_Loc = app.pGageRes.m_array_Reservoir_BOR_MB_Sens_Loc;
            }
            if ((arrayProc[0].length == 23) & (arrayProc.length == 1) & (arrayProc[0][22] == "USACE-NWD")) {
                var blnSingleSelect_USACE_NWD = true;

                for (var irr = 0; irr < app.pGageRes.m_arrayRes_USACE_NWD_Sens_Loc.length; irr++) {
                    if (arrayProc[0][0] == app.pGageRes.m_arrayRes_USACE_NWD_Sens_Loc[irr][0]) {
                        array_RES_USACE_NWD_Sens_Loc = [app.pGageRes.m_arrayRes_USACE_NWD_Sens_Loc[irr]];
                    }
                }

                //array_RES_USACE_NWD_Sens_Loc = app.pGageRes.m_arrayRes_USACE_NWD_Sens_Loc;
            }

			m_arrayOIDYellow = [];
			m_arrayOIDsRed = [];
			m_arrayOIDsPlum = [];
			m_arrayOIDsOrange = [];
			m_arrayOIDsGold = [];
            app.pGageRes.m_arrray_Detail4Chart_ForeBay = [];


            if ((app.pGageRes.m_array_Reservoir_BOR_MB_Sens_Loc != null) & (blnIsInitialPageLoad_Reservoir)) {
                array_RES_BOR_MB_Sens_Loc = app.pGageRes.m_array_Reservoir_BOR_MB_Sens_Loc;
            }
            if ((app.pGageRes.m_arrayRes_USACE_NWD_Sens_Loc != null) & (blnIsInitialPageLoad_Reservoir)) {
                array_RES_USACE_NWD_Sens_Loc = app.pGageRes.m_arrayRes_USACE_NWD_Sens_Loc;
            }

            if (array_RES_BOR_MB_Sens_Loc != null) {
                var strURLGagePrefix = "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrytimeserieshour/";
                strURLGagePrefix += "?startDate=" + this.dteStartDay2Check + "&abbrev=";

                var arrayTempCODWRIDs = [];
                for (var iS = 0; iS < arrayCODWR_Sens_Loc.length; iS++) {  //getting the sensor id's passed through the arrays
                    arrayTempCODWRIDs.push(arrayCODWR_Sens_Loc[iS][3])
                }
                strTempCODWIDs = arrayTempCODWRIDs.join("%2C");
                app.strRES_URLGage = strURLGagePrefix + strTempCODWIDs;
            } else if (array_RES_USACE_NWD_Sens_Loc != null) {
                var strURLGagePrefix = "https://cwms-data.usace.army.mil/cwms-data/timeseries?name=";
                var strURLGageSuffix = ".Elev-Forebay.Inst.1Hour.0.CBT-REV&office=NWDP&begin=";
                strURLGageSuffix += this.dteStartDay2Check + "T00:00:01&end=" + this.dteEndDay2Check + "T23:59:59";

                var arrayTempUSACE_NWD_IDs = [];
                for (var iS = 0; iS < array_RES_USACE_NWD_Sens_Loc.length; iS++) {  //getting the sensor id's passed through the arrays
                    //arrayTempUSACE_NWD_IDs.push(array_RES_USACE_NWD_Sens_Loc[iS][3])
                    arrayTempUSACE_NWD_IDs.push(strURLGagePrefix + array_RES_USACE_NWD_Sens_Loc[iS][3] + strURLGageSuffix);

                }
                app.strRES_URLGage = arrayTempUSACE_NWD_IDs.join(",");  //could leave this as an array since lower in the code will change it into an array
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
                app.strRES_URLGage = strURLGagePrefix + strTempDNRCIDs + "')" ;
			}

			var arrayProc2 = [];

            if (blnQuery1AtaTime) {   //due to https://cwms-data.usace.army.mil/ not allowing multiple gages be queried this is the work around
                strSiteIDs = arrayProc[app.pGageRes.mIDXQuery1AtaTime][0];
                arrayProc2 = [arrayProc[app.pGageRes.mIDXQuery1AtaTime]];
			} else {
				var arraySiteIDs = [];
                var arraySiteIDsBOR_MB = [];
                var arraySiteIDsUSACE_NWD = [];

                for (var ii in arrayProc) {
					if (arrayProc[ii][1] != null) {
						strAgency = arrayProc[ii][(arrayProc[ii].length - 1)];  //the agency will be the last element in the array.  If loading all sections then array is long, if single click then array is short
                        if (strAgency == "BOR_MB") {
                            arraySiteIDsBOR_MB.push(arrayProc[ii][1]);
                            strSiteIDs = arraySiteIDsBOR_MB.join(",");
                        } else if (strAgency == "USACE-NWD") {  //useful for initial delineation of USGS,CODWR and DNRC gages
                            arraySiteIDsUSACE_NWD.push(arrayProc[ii]);
                            strSiteIDs = arraySiteIDsUSACE_NWD.join(",");
                        }
                    }
				}

                arrayProc2 = arrayProc;
            }
            
            
                var arrayRES_URLs = [];

                if (array_RES_USACE_NWD_Sens_Loc != null) {
                    arrayRES_URLs = app.strRES_URLGage.split(",");
                }

                var requests = arrayRES_URLs.map(function (path) {
                    return $.getJSON(path);
                });

                console.log("just before the reservoir gage query");

                $.when.apply($, requests)
                    .then(function (a_resp, b_resp, c_resp, d_resp) {  //if dealing with more than 4 variables, add more variables to this line~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

                        if (array_RES_USACE_NWD_Sens_Loc != null) {
                            let arrayResponses = [a_resp, b_resp, c_resp, d_resp];  //if dealing with more than 4 variables, add more variables to this line~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

                            if (arrayRES_URLs.length == 1) {
                                arrayResponses = [arrayResponses];  // if only 1 response the API does not return an array, need to nest in an array for the next for loop to work
                            }

                            let jsonGagesReadingsValueArray = new Array();
                            let jsonFineValueArray = [];
                            for (let iR = 0; iR < arrayResponses.length; iR++) {
                                let resQueryInfoTmp = "";
                                let resQueryInfoData = "";

                                let a_resp = arrayResponses[iR];
                                if (a_resp) {
                                    if (a_resp[0]["time-series"] != undefined) {
                                        resQueryInfoTmp = a_resp[0]["time-series"]["query-info"]["requested-items"][0].name;

                                        let blnProceed = false;

                                        if (a_resp[0]["time-series"]["time-series"].length > 0) {
                                            blnProceed = true;
                                        }

                                        if (blnProceed) {                                                           // if time-series exist then proceed
                                            let arrayTimeSeries1;
                                            arrayTimeSeries1 = a_resp[0]["time-series"];   //get the info about the gage and what data queried

                                            for (let iTimeSeries = 0; iTimeSeries < arrayTimeSeries1["time-series"].length; iTimeSeries++) {        // loop through the time series
                                                let jsonTimeSeries = arrayTimeSeries1["time-series"][iTimeSeries];
                                                let strUnits = jsonTimeSeries["regular-interval-values"].unit;                                              //not needed for the website but good to confirm the units for development

                                                for (let iSegment = 0; iSegment < jsonTimeSeries["regular-interval-values"].segments.length; iSegment++) {             //loop through the time segments
                                                    let jsonSegment = jsonTimeSeries["regular-interval-values"].segments[iSegment];
                                                    let strUSACE_NWD_1stTimeUTC = jsonSegment["first-time"];
                                                    let dteUSACE_NWD_1stTimeUTC = Date.parse(strUSACE_NWD_1stTimeUTC);
                                                    let dteUSACE_NWD_1stTimeLOCAL = new Date(dteUSACE_NWD_1stTimeUTC);

                                                    let dteTempDate4USACEValue = dteUSACE_NWD_1stTimeLOCAL;
                                                    arrayJSONValues = jsonSegment.values;

                                                    //console.log("Segment # " + iSegment.toString() + ", " + arrayJSONValues.length.toString() + " time-series values in this array");
                                                    for (let iResponseVal = 0; iResponseVal < arrayJSONValues.length; iResponseVal++) {
                                                        if (iResponseVal > 0) {
                                                            dteTempDate4USACEValue = new Date(dteTempDate4USACEValue.setTime(dteTempDate4USACEValue.getTime() + (1 * 60 * 60 * 1000)));//USACE_NWD returns values that are hourly but have to build the time value
                                                        }
                                                        jsonFineValueArray = { 'Name': resQueryInfoTmp, 'value': arrayJSONValues[iResponseVal][0], "DateTimeReading": dteTempDate4USACEValue };
                                                        jsonGagesReadingsValueArray.push(jsonFineValueArray);
                                                        //console.log("dteUSACE_NWD_LastTimeLOCAL = " + dteUSACE_NWD_LastTimeLOCAL.toString() + "-------- dteTempDate4USACEValue" + dteTempDate4USACEValue.toString());
                                                    }
                                                    //console.log("values for segment completed");
                                                }
                                            }
                                        }
                                    } else {
                                        console.log("NO JSON Data response # " + iR.toString());
                                    }
                                } else {
                                    console.log("NO JSON Data response # " + iR.toString());
                                }
                            }
                            arrayJSONValues = jsonGagesReadingsValueArray;
                            jsonGagesReadingsValueArray = new Array();
                            //console.log(jsonGagesReadingsValueArray.length.toString() + " time-series values in this array");
                        } else if (arrayCODWR_Sens_Loc != null) {
                            arrayJSONValues = jsonResult.ResultList;
                        }
                        else {
							arrayJSONValues = jsonResult.features;
						}
               
                        dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
							var strSiteName = "";
							//if inital load then do full run through of code
                            strSiteID = itemSectionRefined[0];  //since some sections do not have readings all the time setting this before finding data in the JSON
                            strStreamSystemName = itemSectionRefined[1]; 
                            iOID = itemSectionRefined[4];
                            strGage1URL = itemSectionRefined[5];
                            strGage2URL = itemSectionRefined[6];
                            strWatershed = itemSectionRefined[7];
                            strLake_Reservoir_Name_ = itemSectionRefined[8];
                            iHtDeadPool = itemSectionRefined[9];
                            iAfDeadPool = itemSectionRefined[10];
                            iHtInactivePool = itemSectionRefined[11];
                            iAfInactivePool = itemSectionRefined[12];
                            iHtActivePool = itemSectionRefined[13];
                            iAfActivePool = itemSectionRefined[14];
                            iHtFloodPool = itemSectionRefined[15];
                            iAfFloodPool = itemSectionRefined[16];
                            strDeadNote = itemSectionRefined[17];
                            strInactiveNote = itemSectionRefined[18];
                            strActiveNote = itemSectionRefined[19];
                            strFloodNote = itemSectionRefined[20];
                            strGageName = itemSectionRefined[21];
                            strSiteName = strGageName;
                            strTeaCupURL = itemSectionRefined[22];
                            if (iHt_BaseElev == null) {  //if passed during the summary mouse click then do not get from array
                               iHt_BaseElev = itemSectionRefined[23];
                            }
                            if (iHt_Flood == null) {  //if passed during the summary mouse click then do not get from array
                                iHt_Flood = itemSectionRefined[24];
                            }
                            strAgency = itemSectionRefined[25];
                                                        
                            var itemFoundForeBay
                            itemFoundForeBay = [];

                            if (array_RES_BOR_MB_Sens_Loc != null) {
                                if (strSiteID == "") {
                                    strSiteID = "no site id specified";
                                }
                                var itemFoundForeBay = arrayJSONValues  //no need to filter, only Discharge for USACE NWD gages at this time
                            } else if (array_RES_USACE_NWD_Sens_Loc != null) {
                                if (strSiteID == "") {
                                    strSiteID = "no site id specified";
                                }

                                var itemFoundForeBay = arrayJSONValues.filter(function (itemArraySearch) {
                                    return typeof itemArraySearch.Name == 'string' && itemArraySearch.Name.indexOf(strSiteID) > -1 && strSiteID != "";
                                });
                            }

                            let arrray_Detail4InterpolationForeBay = [];
                            let dteLatestDateTimeForeBay = "";
                            let dblLatestForeBay = "";
                            let strNoDataLabel4ForeBay = "";
                            var strID = "";


                            if (itemFoundForeBay.length > 0) {  //set the some base variable values
                                iHtInactivePoolConsvValue = itemSectionRefined[11];

                                if (blnIsInitialPageLoad_Reservoir) {

                                    if (iHtInactivePoolConsvValue == 9999) {  // this is for testing only!!!!!!!!!!!!!!!!!!!!!!!!!!
                                        iHtInactivePoolConsvValue = 400;
                                    }
  
                                    var strSiteForeBayStatus = "OPEN"; //OPEN, PREPARE FOR CONSERVATION, CONSERVATION, RIVER CLOSURE (CLOSED TO FISHING)

                                    if (array_RES_BOR_MB_Sens_Loc != null) {
                                        strHyperlinkURL = "https://www.usbr.gov/gp-bin/arcweb_" + strSiteID.toLowerCase() + ".pl";
                                    } else if (array_RES_USACE_NWD_Sens_Loc != null) {
                                        strHyperlinkURL = "https://www.nwd-wc.usace.army.mil/dd/common/projects/www/" + strSiteID.toLowerCase() + ".html";
                                    }

                                    blnRealValues = false;
                                    var str3DayFBTrend = "images/blank.png";
                            } else {
                                    iHtInactivePoolConsvValue = 2000;
                            }

                            if (itemFoundForeBay.length > 0) {                                       //run through each gage forebay record
                            if (array_RES_BOR_MB_Sens_Loc) {
                                arrayJSONValues2 = itemFoundForeBay;
                            } else if (array_RES_USACE_NWD_Sens_Loc != null) {
                                arrayJSONValues2 = itemFoundForeBay;
                            }
                                
							jQuery.each(arrayJSONValues2, function (k, item2) {
                                if (array_RES_BOR_MB_Sens_Loc) {
                                    var dteDateTime = new Date(item2.DateTimeReading);
                                } else if (array_RES_USACE_NWD_Sens_Loc != null) {
                                    var dteDateTime = new Date(item2.DateTimeReading);
                                } 
                                var strNoData = "";
								var iForeBayValue;

                                if (array_RES_BOR_MB_Sens_Loc) {
                                    iForeBayValue = Math.round(parseFloat(item2.value) * 10) / 10;
                                } else if (array_RES_USACE_NWD_Sens_Loc != null) {
                                    iForeBayValue = Math.round(parseFloat(item2.value) * 10) / 10;
                                } 

                                if (iForeBayValue != -999999) {
                                    blnRealValues = true;
                                    var obj = {};
                                    obj["id"] = strGageName + "," + strStreamSystemName;
                                    obj["date"] = dteDateTime.getFullYear() + "-" +("0" + (dteDateTime.getMonth() + 1)).slice(-2) + "-" +("0" +dteDateTime.getDate()).slice(-2);
									obj["time"] = dteDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
                                    obj["FB"] = iForeBayValue;
                                    obj["gagedatetime"]= dteDateTime;
                                    
                                    obj["iHt_BaseElev"] = iHt_BaseElev;  //this are only used in single charting situations
                                    obj["iHt_Flood"] = iHt_Flood;  //this are only used in single charting situations
                                    //obj["cfsTarget3"]= iCFSTarget3;  //this are only used in single charting situations

                                    app.pGageRes.m_arrray_Detail4Chart_ForeBay.push(obj);//populate the array that contains the data for charting
                                    obj["EPOCH"]= Date.parse(dteDateTime);

                                    arrray_Detail4InterpolationForeBay.push(obj);  //populate the array that is used to determing the flow trend
                                }
                            });

                            if ((arrray_Detail4InterpolationForeBay.length > 0) & (blnRealValues)) { //figure out if the flow trend is increasing or decreasing & the last known values
                                arrray_Detail4InterpolationForeBay.sort(function (a, b) {
                                    var dateA = new Date(a.gagedatetime), dateB = new Date(b.gagedatetime)  //sort
                                    return dateA -dateB //sort by date ascending
                                })
                                var iFBArrayLength = (arrray_Detail4InterpolationForeBay.length -1);
                                dteLatestDateTimeForeBay = arrray_Detail4InterpolationForeBay[iFBArrayLength].gagedatetime;
                                dblLatestForeBay = parseFloat(arrray_Detail4InterpolationForeBay[iFBArrayLength].FB);

                                str3DayFBTrend = ProcLinearRegression(arrray_Detail4InterpolationForeBay, "FB");
                            }
                        }

                        arrayJSONValues2 =[]; //clear out the array
                        ForeBayItem = "";
                    }

                    iLateHtPref4ConsvValue = null;
                    iLateHtConsvValue = null;
                    strLateHtClosureValue = null;

                    var strNoDataLabel4ChartingFB = "";
                    if (dblLatestForeBay == -999999) {
                        dblLatestForeBay = "Not Available"
                        dteLatestDateTimeForeBay = new Date();
                        strNoDataLabel4ChartingFB = "(No Data) ";
                    } else if (dblLatestForeBay == "") {
                        dblLatestForeBay = "*Not collected"
                        strNoDataLabel4ChartingFB = "(No Data) ";
                        dteLatestDateTimeForeBay = new Date();
                    } else {//determine the site's status based on discharge
                        if ((dblLatestForeBay >= iLateHtPref4ConsvValue) & (iLateHtPref4ConsvValue != null)) {
                            strSiteHtStatus = "PREPARE FOR CONSERVATION";
                        }
                        if ((dblLatestForeBay >= iLateHtConsvValue) &
                            (dblLatestForeBay < strLateHtClosureValue) &
                            (iLateHtConsvValue != null)) {
                            strSiteHtStatus = "CONSERVATION";
                        }
                        if ((dblLatestForeBay >= strLateHtClosureValue) & (strLateHtClosureValue != null)) {
                            strSiteHtStatus = "EXPANDED CONSERVATION MEASURES";
                        }
                    }

                    if (itemSectionRefined[1]== null) {  //if no gage id then hardcode 
                        dblLatestForeBay = "No gage exists";
                    }


                    if (array_RES_USACE_NWD_Sens_Loc != null) {
                        for (var iSL = 0; iSL < app.pGageRes.m_arrray_StationIDsFB.length; iSL++) {  //remove placeholder sections if entered
                            if (app.pGageRes.m_arrray_StationIDsFB[iSL] == "(No Data) " + strGageName + "," + strStreamSystemName) {
                                app.pGageRes.m_arrray_StationIDsFB.splice(iSL, 1);
                                break;
                            }
                        }
                    }

                    app.pGageRes.m_arrray_StationIDsFB.push(strNoDataLabel4ChartingFB + strGageName + "," + strStreamSystemName);  // using this array of station id's to pivot the table for charting

                    if (blnIsInitialPageLoad_Reservoir) {
                        var streamSectionDispalyName = strSiteName.replace(strStreamSystemName, "");

                        if (streamSectionDispalyName == "") {
                            console.log("this section does not have a dispaly name");
                        } else {
                            streamSectionDispalyName = streamSectionDispalyName;
                        }

                        if (array_RES_USACE_NWD_Sens_Loc != null) {
                            for (var iSL3 = 0; iSL3 < app.pGageRes.m_arrray_ReservoirStatus.length; iSL3++) {  //remove placeholder sections if entered
                                if ((app.pGageRes.m_arrray_ReservoirStatus[iSL3][9] == strStreamSystemName) & (app.pGageRes.m_arrray_ReservoirStatus[iSL3][10] == iSectionID)) {
                                    app.pGageRes.m_arrray_Reservoirtatus.splice(iSL3, 1);
                                    break;
                                }
                            }
                        }

                        app.pGageRes.m_arrray_ReservoirStatus.push([streamSectionDispalyName, //add to array that populates the river sections summary div
                                    strHyperlinkURL,
                                    dteLatestDateTimeForeBay,
                                    dblLatestForeBay.toString().replace("-999999", "Data not available"),
                                    "strSiteForeBayStatus,",       //strSiteForeBayStatus,
                                    strID,
                                    strStreamSystemName,
                                    "77777777", //iSectionID,
                                    str3DayFBTrend,
                                    "strMONTHDAYEarlyFlowFromDroughtManagementTarget",  //strMONTHDAYEarlyFlowFromDroughtManagementTarget,
                                    "strMONTHDAYEarlyFlowToDroughtManagementTarget,",   //strMONTHDAYEarlyFlowToDroughtManagementTarget,
                                    "iLateFlowPref4ConsvValue1",                         //iLateFlowPref4ConsvValue,
                                    "iLateFlowPref4ConsvValue2",                         //iLateFlowPref4ConsvValue,
                                    "iLateFlowConsvValue",                                        //iLateFlowConsvValue,
                                    "iLateFlowClosureValueFlow",                         //iLateFlowClosureValueFlow,
                                    "strLateFlowPref4ConsvValue",                         //strLateFlowPref4ConsvValue,
                                    "strLateFlowConsvValue",                         //strLateFlowConsvValue,
                                    "strLateFlowClosureValueFlow",                         //strLateFlowClosureValueFlow,
                                    strSiteID,
                                    strGage1URL,                         //strDailyStat_URL,
                                    strFWPDESCRIPTION,
                                    strFWPLOCATION,
                                    strFWPPRESSRELEASE,
                                    strFWPPUBLISHDATE,
                                    strFWPTITLE,
                                    "unknown",                         // strOverallStatus,
                                    "strOverallSymbol",                         //strOverallSymbol,
                                    strWatershed,
                                    strLake_Reservoir_Name_,
                                    strTeaCupURL,
                                    iHt_BaseElev,
                                    iHt_Flood,
                                    strAgency]);
                    }

                    var blnAddNew = false;
                    dteLatestDateTimeForeBay = "";
                    dblLatestForeBay = "";
                    arrayTempsAbove =[];
                    strSiteName = "";
                })

                    arrayJSONValues = [];

                    app.pGageRes.mIDXQuery1AtaTime += 1;

                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    ///////////////////// the 1st time this runs through is for the USGS gages, then checks if other sources available
                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if ((arraySiteIDsBOR_MB.length > 0) & (app.bln_RES_BOR_MB_Src_NeedsProc)) {
                        app.pGageRes.CODWRSectionsReceived(arraySiteIDsBOR_MB, "", "", "", "", false, null, blnIsInitialPageLoad_Reservoir,
                            iHtTarget1, iHtTarget2, iHtTarget3)
                    } else if ((arraySiteIDsUSACE_NWD.length > 0) & (app.bln_USACE_NWD_Src_NeedsProc)) {
                        app.pGageRes.USACE_NWD_SectionsReceived(arraySiteIDsUSACE_NWD, "", "", "", "", false, null, blnIsInitialPageLoad_Reservoir,
                            iHtTarget1, iHtTarget2, iHtTarget3)
                    }
					else {
                        app.pGageRes.ReservoirSummaryUIAdditions(blnIsInitialPageLoad_Reservoir);
                        app.pGageRes.mIDXQuery1AtaTime = 0;
                    }
                })

                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + app.strURLGage + ", " + error;
                    //alert("Initial query for USGS gage data failed, trying again");
                    document.getElementById("divLoadingUSGS").innerHTML = "Loading USGS Data, again";
                    console.log("Request Failed: " + err);

                    if (!blnQuery1AtaTime) {  //if the USGS api is erroring out try the refactored method
                        app.pGageRes.ReservoirsReceived(arrayProc, iHt_BaseElev, iHt_Flood, true);
                    }
                })
                .always(function () {
                    if ((!(blnIsInitialPageLoad_Reservoir)) & (app.pGageRes.m_arrray_StationIDsFB.length == 0)) {  // in the case of no gage station do the following for the graphing
                        dom.map(arrayProc2, function (itemSectionRefined) {  //loop through the sections  //run through the elements in the section array to pick out the relevant JSON elements
                            iSectionID = itemSectionRefined[2];  
                            strStreamSystemName = itemSectionRefined[0];
                            app.pGageRes.m_arrray_StationIDsFB.push("(No Data) " + strStreamSystemName + "," + iSectionID);  // using this array of station id's to pivot the table for charting
                            app.pGageRes.ReservoirSummaryUIAdditions(blnIsInitialPageLoad_Reservoir);
                        })
                    }
                });
            
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

