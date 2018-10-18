//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

function showFeaturePrep(feature, strURL, strTheme) {
    this.app.pPS_Identify.strURL4Statquery = strURL;
    this.app.pPS_Identify.showFeature(feature, strTheme);
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
        strQueryString4Measurements: null,
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
            this.pLayer2 = options.pLayer2 || null;
            this.pLayer3 = options.pLayer3 || null; // default to 50 results per page
            this.strSingleLayerName = options.strSingleLayerName || null;
            this.iSingleObjectID = options.iSingleObjectID || null;
            this.pMap = options.pMap || null;
            this.strQueryString4Measurements = options.strQueryString4Measurements || null;
            this.strURL = options.strURL || null;
            this.pTemplate = options.pTemplate || null;
            this.mSR = options.mSR || null;
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
        },

        executeQueries: function (pEvt, strSingleLayerName, iSingleObjectID, dblX, dblY) {
            esri.show(app.loading);
            app.map.disableMapNavigation();
            app.map.hideZoomSlider();

            this.pEvt = pEvt;
            this.strMultipleContent = null;
            this.m_ExceedCount = null;
            this.m_ExceedSum = null;

            var strQuery1 = "";
            var strQuery23 = "";

            if (pEvt != null) {
                dblX = pEvt.mapPoint.x;
                dblY = pEvt.mapPoint.y;
                this.mSR = pEvt.mapPoint.spatialReference;
                pSP = pEvt.screenPoint;
                pxWidth = app.map.extent.getWidth() / app.map.width; // create an extent from the mapPoint that was clicked // this is used to return features within 3 pixels of the click point
                padding = 8 * pxWidth;

                strQuery1 = this.pLayer1.getDefinitionExpression();
                if (this.pLayer2.getDefinitionExpression() != "") {
                    strQuery23 = this.pLayer2.getDefinitionExpression();
                } else {
                    strQuery23 = "OBJECTID > 0";
                }

            } else {
                var pMP = new esri.geometry.Point(dblX, dblY, new esri.SpatialReference({ "wkid": 3857 }));

                this.mSR = new esri.SpatialReference({ "wkid": 3857 });
                var pSP = app.map.toScreen(pMP);
                padding = 500
                
                this.m_dblX = dblX
                this.m_dblY = dblY
                
                strQuery1 = this.strQueryString4Measurements;
                strQuery23 = this.strQueryString4Measurements;
            }

            this.pSP = pSP;
            qt_Layer1 = new esri.tasks.QueryTask(this.pLayer1.url);
            q_Layer1 = new esri.tasks.Query();
            qt_Layer2 = new esri.tasks.QueryTask(this.pLayer2.url);
            q_Layer2 = new esri.tasks.Query();
            qt_Layer3 = new esri.tasks.QueryTask(this.pLayer3.url);
            q_Layer3 = new esri.tasks.Query();

            q_Layer1.returnGeometry = q_Layer2.returnGeometry = q_Layer3.returnGeometry = true;
            q_Layer1.outSpatialReference = q_Layer2.outSpatialReference = q_Layer3.outSpatialReference = new esri.SpatialReference({ "wkid": 3857 })

            q_Layer3.maxAllowableOffset = 200;
            q_Layer1.outFields = q_Layer2.outFields = q_Layer3.outFields = ["*"];
            
            q_Layer1.where = strQuery1;
            q_Layer2.where = q_Layer3.where = strQuery23;
                                    
            var pLayer1, pLayer2, pLayer3, pPromises, pxWidth, padding;

            qGeom = new esri.geometry.Extent({ "xmin": dblX - padding, "ymin": dblY - padding, "xmax": dblX + padding, "ymax": dblY + padding, "spatialReference": this.mSR });
            q_Layer1.geometry = q_Layer2.geometry = q_Layer3.geometry = qGeom; // use the extent for the query geometry

            pLayer1 = qt_Layer1.execute(q_Layer1);
            pLayer2 = qt_Layer2.execute(q_Layer2);
            pLayer3 = qt_Layer3.execute(q_Layer3);
            pPromises = new all([pLayer1, pLayer2, pLayer3]);
            return pPromises.then(this.returnEvents, this.err);
        },


        qry_Stats_Non_SpatialTable4Stats: function (strStatType, strOnStatisticField) {
            this.strStatType = strStatType;
            this.strOnStatisticField = strOnStatisticField;
            var pQueryTask = new esri.tasks.QueryTask(this.strURL4Statquery);
            var pQuery = new esri.tasks.Query();

            if (strStatType != "nostat") {
                var pstatDef = new esri.tasks.StatisticDefinition();
                pstatDef.statisticType = strStatType;
                pstatDef.onStatisticField = strOnStatisticField;
                pstatDef.outStatisticFieldName = "genericstat";
                pQuery.outFields = ["project_id"];
                pQuery.outStatistics = [pstatDef];
            }
            else { pQuery.outFields = ["*"]; }

            pQuery.returnGeometry = false;
            var attr = this.pFeature.attributes;
            var strQuery = "project_id = '" + attr.project_id + "'";

            if ((this.strQueryString4Measurements != "") && (!!this.strQueryString4Measurements) && (this.strQueryString4Measurements != "undefined")) {
                strQuery += " and " + this.strQueryString4Measurements;
            }
            pQuery.where = strQuery
            return pQueryTask.execute(pQuery, this.qryStatResults, this.err);
        },


        qryStatResults: function (results) {
            var strStat_Type = this.app.pPS_Identify.strStatType;
            var strOnStatisticField = this.app.pPS_Identify.strOnStatisticField;
            strConcat = strStat_Type + strOnStatisticField;
            var resultFeatures = results.features;
            var tab3Content = "";
            if (resultFeatures.length > 0) {
                if (dijit.byId('tabcontainer1')) { dijit.byId('tabcontainer1').destroy(); }
                if (dijit.byId('cp1')) { dijit.byId('cp1').destroy(); }

                if (strStat_Type == "nostat") {  // code handles features and displaying features in the identify window
                    tab3Content = "<i>Total features returned: " + resultFeatures.length + "</i>";
                    var strFieldNamesStrings = "";

                    strFieldNamesStrings = ["threats"];
                    tab3Content += "<table border='1'><tr>"; //create table and first row in table with field names
                    strFieldNamesStrings.forEach(function (strField) {
                        tab3Content += "<th>" + strField + "</th>";
                    });
                    tab3Content += "</tr>";
                    for (var ii = 0, iil = resultFeatures.length; ii < iil; ii++) {                    //add the record content
                        tab3Content += "<tr>";
                        strFieldNamesStrings.forEach(function (strField) {//remove some of the strings to make wildcard functionality work
                            if (strField == "Date_") {
                                if (resultFeatures[ii].attributes['Date_'] == null) {
                                    tab3Content += "<td>null</td>";
                                }
                                else { tab3Content += "<td>" + formatDate(resultFeatures[ii].attributes['Date_']) + "</td>"; }
                            }
                            else { tab3Content += "<td>" + resultFeatures[ii].attributes[strField] + "</td>"; }
                        });
                        tab3Content += "</tr>";
                    }
                    tab3Content += "</table>";
                }
                else {
                    var iStatValue = resultFeatures[0].attributes.genericstat;
                    if (strOnStatisticField == "Date_") { iStatValue = formatDate(iStatValue); }
                    if (strConcat == "countExceedance") { this.m_ExceedCount = iStatValue; }
                    else if (strConcat == "sumExceedance") {
                        this.m_ExceedSum = iStatValue;
                        this.app.pPS_Identify.strFeatureContent += "<br />      exceeding count = " + iStatValue; //this.app.pPS_Identify.strFeatureContent += "<br />      " + strStat_Type + " = " + iStatValue + " " + strOnStatisticField;
                    }
                    else {
                        //do nothing
                    }
                }

                this.app.mTc = new dijit.layout.TabContainer({ id: "tabcontainer1", style: "width:100%;height:100%;", useMenu: false, useSlider: false, focused: false }, dojo.create('div'));
                this.app.mCp1 = new dijit.layout.ContentPane({ id: "cp1", title: "Site and Summary", content: this.app.pPS_Identify.strFeatureContent });
                this.app.mCp1.selected = true;

                this.app.mTc.addChild(this.app.mCp1);
                this.app.mTc.startup();   //*************************** don't know if this is necessary

                if ((this.m_ExceedCount > -1) && (this.m_ExceedSum > -1)) {
                    var c = dojo.create("div", { id: "ExceedChart" }, dojo.create('div')); //create the chart that will display in the second tab
                    var chart = new dojox.charting.Chart2D(c, { title: "Note: values depend on user search/query filter",
                        titlePos: "bottom", titleGap: 30, titleFont: "normal normal normal 8pt helvetica", titleFontColor: "grey"
                    });
                    dojo.addClass(chart, 'chart');
                    chart.setTheme(dojo.getObject("dojox.charting.themes.Julie")); //try other themes (Julie,CubanShirts, PrimaryColors, Charged, BlueDusk, Bahamation,Harmony,Shrooms,Wetland)   
                    chart.addPlot("default", { type: "Pie", radius: 70, htmlLabels: true });
                    dojo.connect(this.app.mTc, 'selectChild', function (tabItem) { if (tabItem.title === "Exceedance Pie Chart") { chart.resize(420, 260); } });
                    var iTotal = this.m_ExceedCount; //get percent exceed

                    var iPctExceed = null;
                    var iPctNonExceed = null;

                    if (this.m_ExceedSum == 0) {
                        iPctExceed = 0;
                        iPctNonExceed = 100;
                    }
                    else {
                        iPctExceed = dojo.number.round(this.m_ExceedSum / iTotal * 100, 2);
                        iPctNonExceed = dojo.number.round((iTotal - this.m_ExceedSum) / iTotal * 100, 2);
                    }
                    chart.addSeries("PopulationSplit", [{ y: iPctExceed, tooltip: iPctExceed, text: 'Exceed <br/>Count = ' + this.m_ExceedSum },
                                                        { y: iPctNonExceed, tooltip: iPctNonExceed, text: 'Does Not Exceed <br/>   Count = ' + (this.m_ExceedCount - this.m_ExceedSum)}]);

                    new dojox.charting.action2d.Highlight(chart, "default"); //highlight the chart and display tooltips when you mouse over a slice.   
                    new dojox.charting.action2d.Tooltip(chart, "default");
                    new dojox.charting.action2d.MoveSlice(chart, "default");
                }

                this.app.map.infoWindow.setContent("");
                this.app.map.infoWindow.setContent(this.app.mTc.domNode);
                this.app.mTc.resize({ w: 460, h: 235 });

                switch (strConcat) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
                    case "countproject_id":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("nostat", "*");
                        break;                        //do nothing
                }
            }
            else {                // do nothing
            }
        },

        showFeature: function (pFeature, strTheme) {
            this.pMap.graphics.clear();
            CED_PP_point.clearSelection();
            CED_PP_line.clearSelection();
            CED_PP_poly.clearSelection();

            var attr = pFeature.attributes;

            if (strTheme == "Point") {
                if (attr.TypeAct.indexOf("Non-Spatial") < 0) { pFeature.setSymbol(new SimpleMarkerSymbol().setColor(new Color([0, 255, 255, 0.4]))); }
            }
            else if (strTheme == "Line") {
                pFeature.setSymbol(new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([0, 255, 255]), 3));
            }
            else {
                pFeature.setSymbol(new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 2), new Color([0, 255, 255, 0.4])));
            }


            var strGISTotalAcres = "n/a";
            if (attr.GIS_Acres != undefined && attr.GIS_Acres != null) { strGISTotalAcres = Math.round(attr.GIS_Acres).toString(); }
            var strTotalAcres = "n/a";
            if (attr.TotalAcres != undefined && attr.TotalAcres != null) { strTotalAcres = Math.round(attr.TotalAcres).toString(); }
            var strTotalMiles = "n/a";
            if (attr.TotalMiles != undefined && attr.TotalMiles != null) { strTotalMiles = attr.TotalMiles.toString(); }
            var strTotalRemoved = "n/a";
            if (attr.TotalNumberRemoved != undefined && attr.TotalNumberRemoved != null) { strTotalRemoved = attr.TotalNumberRemoved.toString(); }
            var strOffice = "n/a";
            if (attr.Office != undefined && attr.Office != null) { strOffice = attr.Office.toString(); }
            var strImplementing_party = "n/a";
            if (attr.Implementing_Party != undefined && attr.Implementing_Party != null) { strImplementing_party = attr.Implementing_Party.toString(); }

            blnwobble_gis = false;
            if (attr.Wobbled_GIS != undefined && attr.Wobbled_GIS != null) {
                blnwobble_gis = attr.Wobbled_GIS;
            }

            var title = attr.TypeAct + " Effort Name:" + attr.Project_Name + "<br /> Effort Identification Number: " + attr.Project_ID;
            var tempstrcontent = ""
            if ((blnwobble_gis) | (strTheme == "Polygon")) { tempstrcontent += "<b><i>Note: Some locations may be buffered, generalized, or altered</i></b>" + "<br />" }

            if (attr.TypeAct.indexOf("Non-Spatial") >= 0) { tempstrcontent += "<b><i>Note: This is a Non-Spatial Project, This is an arbritrary location!</i></b>" + "<br />" }

            tempstrcontent += "<u>Implementing Party:</u>  " + attr.Implementing_Party + "<br />" +
                                     "<u>Activity:</u> " + attr.Activity + "<br />" +
                                     "<u>Subactivity:</u> " + attr.SubActivity +
                                        "<br/><hr>" + "Summary" + "<br />" +
                                        "<u>Total Acres:</u>  " + strTotalAcres + "<br />" +
                                        "<u>Total Acres Calculated by GIS (Areas Efforts Only):</u>  " + strGISTotalAcres + "<br />" +
                                        "<u>Total Miles:</u>  " + strTotalMiles + "<br />" +
                                        "<u>Total Number Removed</u> : " + strTotalRemoved + "<br />"
            this.strFeatureContent = tempstrcontent;
            this.strFeatureContent += "<br />For More information, contact...<br />    " + strOffice + ",<br />" + strImplementing_party + "<br/>Phone Number(s):";


            if (dijit.byId('tabcontainer1')) { dijit.byId('tabcontainer1').destroy(); }
            if (dijit.byId('cp1')) { dijit.byId('cp1').destroy(); }
            this.mTc = new dijit.layout.TabContainer({ id: "tabcontainer1", style: "width:100%;height:100%;", useMenu: false, useSlider: false, focused: true }, dojo.create('div'));
            this.mCp1 = new dijit.layout.ContentPane({ id: "cp1", title: "Site and Summary", content: this.strFeatureContent });
            this.mCp1.selected = true;
            this.mTc.addChild(this.mCp1);
            this.mTc.startup();
            this.pMap.infoWindow.setContent(this.mTc.domNode);
            this.pMap.infoWindow.setTitle(title);
            this.pMap.infoWindow.resize(475, 300);
            this.pMap.infoWindow.show(this.pSP, this.pMap.getInfoWindowAnchor(this.pSP));

            this.pFeature = pFeature;
            this.mTc.resize({ w: 460, h: 235 });

            app.map.graphics.add(pFeature);
            this.qry_Non_SpatialTable("agency = '" + strImplementing_party + "' and field_office = '" + strOffice + "'", "6", "user_phone_number");

        },

        qry_Non_SpatialTable: function (strWhere, strTableIndex, strOutField) {
            var pQueryTask = new esri.tasks.QueryTask(this.strURL + strTableIndex);
            var pQuery = new esri.tasks.Query();
            pQuery.outFields = [strOutField];
            pQuery.returnGeometry = false;
            pQuery.where = strWhere
            return pQueryTask.execute(pQuery, this.qryNonSpatialResults, this.err);
        },


        qryNonSpatialResults: function (results) {
            var resultFeatures = results.features;
            if (resultFeatures.length > 0) {
                var featAttrs = resultFeatures[0].attributes;
                var attrNames = [];
                var values = [];
                var testVals = {};
                for (var i in featAttrs) { attrNames.push(i); }

                if (dijit.byId('tabcontainer1')) { dijit.byId('tabcontainer1').destroy(); }
                if (dijit.byId('cp1')) { dijit.byId('cp1').destroy(); }

                dojo.forEach(resultFeatures, function (pFeature) {//Loop through the QueryTask results and populate an array with the unique values
                    dojo.forEach(attrNames, function (an) {
                        var strTempValue = pFeature.attributes[an];
                        if (!testVals[strTempValue]) {
                            testVals[strTempValue] = true;
                            var strValue = strTempValue;
                            values.push(strValue);
                        }
                    });
                });
                values.sort();
                strValues = values.join(",");
                this.app.pPS_Identify.strFeatureContent += strValues;

                this.app.mTc = new dijit.layout.TabContainer({ id: "tabcontainer1", style: "width:100%;height:100%;", useMenu: false, useSlider: false, focused: false }, dojo.create('div'));
                this.app.mCp1 = new dijit.layout.ContentPane({ id: "cp1", title: "Site and Summary", content: this.app.pPS_Identify.strFeatureContent });
                this.app.mCp1.selected = true;
                this.app.mTc.addChild(this.app.mCp1);
                this.app.mTc.startup();   //*************************** don't know if this is necessary

                this.app.map.infoWindow.setContent("");
                this.app.map.infoWindow.setContent(this.app.mTc.domNode);
                this.app.mTc.resize({ w: 460, h: 235 });
            }
            else {                // do nothing
            }
        },

        showFeatureSet: function (results) {
            pLayer1 = results[0].features; // results from deferred lists are returned in the order they were created  // so parcel results are first in the array and buildings results are second
            pLayer2 = results[1].features;
            pLayer3 = results[2].features;

            var content = "<u>Number of point projects/plans:  " + pLayer1.length + "</u><br />";
            arrayUtils.forEach(pLayer1, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color([0, 255, 255, 0.4]))); app.map.graphics.add(feat); }); // add the results to the map
            for (var i = 0; i < pLayer1.length; i++) {
                var graphic1 = pLayer1[i];
                strThemeT = "Point";
                strURL4query1 = this.strURL + "0";
                content += "  " + graphic1.attributes.Project_ID + ", " + graphic1.attributes.Project_Name.substring(0, 35) + " (<A href='#' onclick='showFeaturePrep(pLayer1[" + i + "],strURL4query1,strThemeT);'>show</A>)<br/>";
            }
            content += "<br /><u>Number of line projects/plans:  " + pLayer2.length + "</u><br />";
            arrayUtils.forEach(pLayer2, function (feat) { feat.setSymbol(new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([0, 255, 255]), 3)); app.map.graphics.add(feat); }); // add the results to the map
            for (var ii = 0; ii < pLayer2.length; ii++) {
                var graphic2 = pLayer2[ii];
                strThemeT = "Line";
                strURL4query2 = this.strURL + "1";
                content += "  " + graphic2.attributes.Project_ID + ", " + graphic2.attributes.Project_Name.substring(0, 35) + " (<A href='#' onclick='showFeaturePrep(pLayer2[" + ii + "],strURL4query2,strThemeT);'>show</A>)<br/>";
            }
            content += "<br /><u>Number of area projects/plans:  " + pLayer3.length + "</u><br />";
            arrayUtils.forEach(pLayer3, function (feat) { feat.setSymbol(new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new Color([255, 0, 0]), 2), new Color([0, 255, 255, 0.2]))); app.map.graphics.add(feat); }); // add the results to the map
            for (var iii = 0; iii < pLayer3.length; iii++) {
                var graphic3 = pLayer3[iii];
                strThemeT = "Polygon";
                strURL4query3 = this.strURL + "2";
                content += "  " + graphic3.attributes.Project_ID + ", " + graphic3.attributes.Project_Name.substring(0, 35) + " (<A href='#' onclick='showFeaturePrep(pLayer3[" + iii + "],strURL4query3,strThemeT);'>show</A>)<br/>";
            }
            this.strMultipleContent = content;
            this.pMap.infoWindow.setContent(content);
            this.pMap.infoWindow.setTitle("Identify Results");
            this.pMap.infoWindow.resize(400, 300);
            this.pMap.infoWindow.show(this.pSP, this.pMap.getInfoWindowAnchor(this.pSP));
        },

        returnEvents: function (results) {
            console.log("queries finished: ", results);
            var pLayer1, pLayer2, pLayer3

            if ((results[0].features.length == 1 & (results[1].features.length == 0 & results[2].features.length == 0)) ||
                (results[1].features.length == 1 & (results[0].features.length == 0 & results[2].features.length == 0)) ||
                (results[2].features.length == 1 & (results[0].features.length == 0 & results[1].features.length == 0))
                        ) {
                var pFeature = null;
                var strURL4query = "";
                if (results[0].features.length == 1) {
                    pFeature = results[0].features[0];
                    strTheme = "Point";
                }
                else if (results[1].features.length == 1) {
                    pFeature = results[1].features[0];
                    strTheme = "Line";
                }
                else if (results[2].features.length == 1) {
                    pFeature = results[2].features[0];
                    strTheme = "Poly";
                }
                else { //some issue
                }

                this.strURL4Statquery = strURL4query;
                this.showFeature(pFeature, strTheme);
            }
            else { this.showFeatureSet(results); }

            if (this.m_dblY != null) {
                var CK_ASZ = new CK_AutoCompleteSearchAndZoom({ pMap: app.map, dblExpandNum: 2,
                    divTag4Results: document.getElementById("loc"),
                    strSearchField: "Project_ID", pSR: this.mSR
                }); // instantiate the class

                if ((this.m_dblX == -11686922.0000472) & (this.m_dblY == 4828120.99995937)) {
                    CK_ASZ.zoomToPoint(-12500000, 5500000, "", 6);
                } else {
                    CK_ASZ.zoomToPoint(this.m_dblX, this.m_dblY, "", null);
                }
            }

            esri.hide(app.loading);
            app.map.enableMapNavigation();
            app.map.showZoomSlider();

        },

        err: function (err) {
            console.log("Failed to get results from ? due to an error: ", err);
            
            esri.hide(app.loading);
            app.map.enableMapNavigation();
            app.map.showZoomSlider();
            $(function () {
                $("#dialogWarning1").dialog("open");
            });
        }
    }
    )
    ;
}
);


