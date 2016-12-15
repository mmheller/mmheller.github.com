//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014

function showFeaturePrep(feature, strURL, strTheme) {
    this.app.pPS_Identify.strURL4Statquery = strURL;
    this.app.pPS_Identify.showFeature(feature, strTheme);
//    this.showFeature(feature);
}
define([
  "dojo/_base/declare", "dojo/_base/lang", "esri/request", "dojo/promise/all", "dojo/_base/array", "esri/symbols/SimpleMarkerSymbol",
  "dojo/_base/Color", "extras/CK_AutoCompleteSearchAndZoom", "dojo/date/locale", "dojox/charting/Chart2D",
  "dojox/charting/plot2d/Pie", "dojox/charting/action2d/Highlight", "dojox/charting/action2d/MoveSlice", "dojox/charting/action2d/Tooltip",
  "dojox/charting/themes/Julie", //try other themes (Julie,CubanShirts, PrimaryColors, Charged, BlueDusk, Bahamation,Harmony,Shrooms,Wetland)
], function (
  declare, lang, esriRequest, all, arrayUtils, SimpleMarkerSymbol, Color, CK_AutoCompleteSearchAndZoom
) {

    function formatDate(value) {
        var inputDate = new Date(value);
        return dojo.date.locale.format(inputDate, {
            selector: 'date',
            datePattern: 'MM/dd/yyyy'
        });
    }

    return declare([], {
        pTissueLayer: null,
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
            this.pTissueLayer = options.pTissueLayer || null;
            this.pWaterLayer = options.pWaterLayer || null; // default seat geek range is 30mi
            this.pSedimentLayer = options.pSedimentLayer || null; // default to 50 results per page
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
                //var pMP = new esri.geometry.Point(dblX, dblY, this.mSR);
                var pMP = new esri.geometry.Point(dblX, dblY, new esri.SpatialReference({ "wkid": 3857 }));
                var pSP = app.map.toScreen(pMP);
                padding = 0.0005

                this.m_dblX = dblX
                this.m_dblY = dblY
            }

            this.pSP = pSP;
            qt_tissueLayer = new esri.tasks.QueryTask(this.pTissueLayer.url);
            q_tissueLayer = new esri.tasks.Query();
            q_tissueLayer.returnGeometry = true;
            q_tissueLayer.outFields = ["*"];

            var tissues, pPromises, pxWidth, padding;

            qGeom = new esri.geometry.Extent({ "xmin": dblX - padding, "ymin": dblY - padding, "xmax": dblX + padding,
                "ymax": dblY + padding, "spatialReference": this.mSR
            });
            q_tissueLayer.geometry = qGeom; // use the extent for the query geometry

            tissues = qt_tissueLayer.execute(q_tissueLayer);
            pPromises = new all([tissues]);
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
                if (dijit.byId('cp2')) { dijit.byId('cp2').destroy(); }
                if (dijit.byId('cp3')) { dijit.byId('cp3').destroy(); }

                if (strStat_Type == "nostat") {  // code handles features and displaying features in the identify window
                    tab3Content = "<i>Total features returned: " + resultFeatures.length + "</i>";
                    if (resultFeatures.length > 999) { tab3Content += "<i> (Note: Maximum Number of Records Returned is 1,000)</i>"; }
                    var strFieldNamesStrings = "";

                    //                    if (this.app.pPS_Identify.strURL4Statquery.slice(-1) == 4) {
                    //                        strFieldNamesStrings = ["ID", "Contaminant", "MU", "Date_", "Filtered", "Unfiltered", "MinBenchmark", "MaxBenchmark", "Exceedance", "SiteID"];
                    //                    } else if (this.app.pPS_Identify.strURL4Statquery.slice(-1) == 3) {
                    //                        strFieldNamesStrings = ["ID", "Contaminant", "MU", "Age", "Sex", "Species", "Date_", "Measurement", "Benchmark", "Exceedance", "Qualifier", "SiteID"];
                    //                    } else {
                    //                        strFieldNamesStrings = ["ID", "Contaminant", "MU", "Date_", "Measurement", "Benchmark", "Exceedance", "Qualifier", "SiteID"];
                    //                    }
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
                        //this.app.pPS_Identify.strFeatureContent += strStat_Type + " = " + iStatValue + "<br /><br />      "; //this.app.pPS_Identify.strFeatureContent += "<br />      " + strStat_Type + " = " + iStatValue + " " + strOnStatisticField;

                    }
                }


                this.app.mTc = new dijit.layout.TabContainer({ id: "tabcontainer1", style: "width:100%;height:100%;", useMenu: false, useSlider: false, focused: false }, dojo.create('div'));
                this.app.mCp1 = new dijit.layout.ContentPane({ id: "cp1", title: "Site and Summary", content: this.app.pPS_Identify.strFeatureContent });
                this.app.mCp1.selected = true;
                //                this.app.mCp2 = new dijit.layout.ContentPane({ id: "cp2", title: "Summary Chart" });
                //                this.app.mCp3 = new dijit.layout.ContentPane({ id: "cp3", title: "Threats", content: tab3Content });

                this.app.mTc.addChild(this.app.mCp1);
                //                this.app.mTc.addChild(this.app.mCp2);
                //                this.app.mTc.addChild(this.app.mCp3);
                this.app.mTc.startup();   //*************************** don't know if this is necessary

                if ((this.m_ExceedCount > -1) && (this.m_ExceedSum > -1)) {
                    var c = dojo.create("div", { id: "ExceedChart" }, dojo.create('div')); //create the chart that will display in the second tab
                    var chart = new dojox.charting.Chart2D(c, { title: "Note: values depend on user search/query filter",
                        titlePos: "bottom", titleGap: 30, titleFont: "normal normal normal 8pt Arial", titleFontColor: "grey"
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
                    //                    this.app.mCp2.set('content', chart.node);
                }

                this.app.map.infoWindow.setContent("");
                this.app.map.infoWindow.setContent(this.app.mTc.domNode);
                this.app.mTc.resize({ w: 550, h: 300 });

                switch (strConcat) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
                    //                    case "countFiltered":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("sum", "Filtered");                
                    //                        break;                
                    //                    case "sumFiltered":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("min", "Filtered");                
                    //                        break;                
                    //                    case "minFiltered":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("max", "Filtered");                
                    //                        break;                
                    //                    case "maxFiltered":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("avg", "Filtered");                
                    //                        break;                
                    //                    case "avgFiltered":                
                    //                        this.app.pPS_Identify.strFeatureContent += "<br/><br/>Unfiltered Measurement Summary";                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("count", "Unfiltered");                
                    //                        break;                

                    //                    case "countUnfiltered":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("sum", "Unfiltered");                
                    //                        break;                
                    //                    case "sumUnfiltered":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("min", "Unfiltered");                
                    //                        break;                
                    //                    case "minUnfiltered":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("max", "Unfiltered");                
                    //                        break;                
                    //                    case "maxUnfiltered":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("avg", "Unfiltered");                
                    //                        break;                
                    //                    case "avgUnfiltered":                
                    //                        this.app.pPS_Identify.strFeatureContent += "<br/><br/>Exceedance Measurement Summary";                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("count", "Exceedance");                
                    //                        break;                

                    case "countproject_id":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("nostat", "*");
                        break;
                    //                    case "countMeasurement":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("sum", "Measurement");                
                    //                        break;                
                    //                    case "sumMeasurement":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("min", "Measurement");                
                    //                        break;                
                    //                    case "minMeasurement":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("max", "Measurement");                
                    //                        break;                
                    //                    case "maxMeasurement":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("avg", "Measurement");                
                    //                        break;                
                    //                    case "avgMeasurement":                
                    //                        this.app.pPS_Identify.strFeatureContent += "<br/><br/>Exceedance Measurement Summary";                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("count", "Exceedance");                
                    //                        break;                
                    //                    case "countExceedance":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("sum", "Exceedance");                
                    //                        break;                
                    //                    case "sumExceedance":                
                    //                        this.app.pPS_Identify.strFeatureContent += "<br/><br/>Date Measurement Summary";                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("min", "Date_");                
                    //                        break;                
                    //                    case "minDate_":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("max", "Date_");                
                    //                        break;                
                    //                    case "maxDate_":                
                    //                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("nostat", "*");                
                    //                        break;                        //do nothing                
                    //                    case "nostat*":                
                        break;                        //do nothing
                }
            }
            else {
                // do nothing
            }
            //            return results;
        },


        showFeature: function (pFeature, strTheme) {
            this.pMap.graphics.clear();
            var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.5]));
            pFeature.setSymbol(symbol);
            var attr = pFeature.attributes;
            //            var title = strTheme + " Site ID: " + attr.SID + " (values depend on user search/query filter)";
            //            this.strFeatureContent = "Management Unit : " + attr.MU + "<br />Latitude : " + attr.Latitude + " Longitude : " + attr.Longitude +
            //                                        "<br/><hr>" + strTheme + " Measurements Summary";

            var strTotalAcres = "n/a";
            if (attr.totalacres != undefined && attr.totalacres != null) {
                strTotalAcres = attr.totalacres.toString();
            }
            var strTotalMiles = "n/a";
            if (attr.totalmiles != undefined && attr.totalmiles != null) {
                strTotalMiles = attr.totalmiles.toString();
            }

            var strTotalRemoved = "n/a";
            if (attr.totalnumberremoved != undefined && att.totalnumberremoved != null) {
                strTotalRemoved = attr.totalnumberremoved.toString();
            }

            var title = attr.typeact + " Effort Name:" + attr.project_name + "<br /> Effort Identification Number: " + attr.project_id;
            var tempstrcontent = "Note: Some locations may be buffered, generalized, or altered" + "<br />" + "<br />" +
                                     "Implementing Party:  " + attr.implementing_party + "<br />" +
                                     "Subactivity: " + attr.subactivity + "<br />" +
                                        "<br/><hr>" + "Summary" + "<br />" +
                                        "Total Acres:  " + strTotalAcres + "<br />" +
                                        "Total Miles:  " + strTotalMiles + "<br />" +
                                        "Total Number Removed : " + strTotalRemoved + "<br />"
            //            if (this.strURL4Statquery.slice(-1) == 4) {
            //                this.strFeatureContent += "<br/>Filtered Measurement Summary";
            //            }
            this.strFeatureContent = tempstrcontent;
            var strOffice = "http://www.fws.gov/";
            //var strThemeT = attr.office;
            //this.strFeatureContent += "For More information, contact:<br />    (<A href=" + strOffice + ">" + strThemeT + "</A>)<br/>";
            this.strFeatureContent += "For More information, contact:<br />    " + attr.office + ",<br />" + attr.implementing_party + "<br/>";


            this.pMap.graphics.add(pFeature);
            if (dijit.byId('tabcontainer1')) { dijit.byId('tabcontainer1').destroy(); }
            if (dijit.byId('cp1')) { dijit.byId('cp1').destroy(); }
            if (dijit.byId('cp2')) { dijit.byId('cp2').destroy(); }
            if (dijit.byId('cp3')) { dijit.byId('cp3').destroy(); }
            this.mTc = new dijit.layout.TabContainer({ id: "tabcontainer1", style: "width:100%;height:100%;", useMenu: false, useSlider: false, focused: true }, dojo.create('div'));
            this.mCp1 = new dijit.layout.ContentPane({ id: "cp1", title: "Site and Summary", content: this.strFeatureContent });
            this.mCp1.selected = true;
            //            this.mCp2 = new dijit.layout.ContentPane({ id: "cp2", title: "Exceedance Pie Chart" });
            //            this.mCp3 = new dijit.layout.ContentPane({ id: "cp3", title: "Measurement Records" });

            this.mTc.addChild(this.mCp1);
            //            this.mTc.addChild(this.mCp2);
            //            this.mTc.addChild(this.mCp3);
            this.mTc.startup();
            this.pMap.infoWindow.setContent(this.mTc.domNode);
            this.pMap.infoWindow.setTitle(title);
            this.pMap.infoWindow.resize(575, 300);
            this.pMap.infoWindow.show(this.pSP, this.pMap.getInfoWindowAnchor(this.pSP));

            this.pFeature = pFeature;
            this.mTc.resize({ w: 550, h: 300 });

            //            if (this.strURL4Statquery.slice(-1) == 4) {
            //                this.qry_Stats_Non_SpatialTable4Stats("count", "Filtered");
            //            } else {
            //                this.qry_Stats_Non_SpatialTable4Stats("count", "Measurement");
            //            }
            this.qry_Stats_Non_SpatialTable4Stats("count", "project_id");
        },

        showFeatureSet: function (results) {
            tissues = results[0].features; // results from deferred lists are returned in the order they were created  // so parcel results are first in the array and buildings results are second
            //            waters = results[1].features;
            //            sediments = results[2].features;

            this.pMap.graphics.clear();
            var content = "Number of locations:  " + tissues.length + "<br />";
            arrayUtils.forEach(tissues, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color([255, 0, 255, 0.5]))); app.map.graphics.add(feat); }); // add the results to the map
            for (var i = 0; i < tissues.length; i++) {
                var graphic1 = tissues[i];
                strThemeT = "Tissue";
                //                strURL4queryT = this.strURL + "3";
                strURL4queryT = this.strURL + "10";
                content = content + graphic1.attributes.project_id + " Field (<A href='#' onclick='showFeaturePrep(tissues[" + i + "],strURL4queryT,strThemeT);'>show</A>)<br/>";
                //                content = content + graphic1.attributes.SID + " Field (<A href='#' onclick='showFeaturePrep(tissues[" + i + "],strURL4queryT,strThemeT);'>show</A>)<br/>";
            }
            //            content = content + "<br />Number of Water Measurement Sites:  " + waters.length + "<br />";
            //            arrayUtils.forEach(waters, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color("red"))); app.map.graphics.add(feat); });
            //            for (var ii = 0; ii < waters.length; ii++) {
            //                var graphic2 = waters[ii];
            //                strThemeW = "Water";
            //                strURL4queryW = this.strURL + "4";
            //                content = content + graphic2.attributes.SID + " Field (<A href='#' onclick='showFeaturePrep(waters[" + ii + "],strURL4queryW,strThemeW);'>show</A>)<br/>";
            //            }
            //            content = content + "<br />Number of Sediment Measurement Sites:  " + sediments.length + "<br />";
            //            arrayUtils.forEach(sediments, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color([255, 0, 255, 0.5]))); app.map.graphics.add(feat); });
            //            for (var iii = 0; iii < sediments.length; iii++) {
            //                var graphic3 = sediments[iii];
            //                strThemeS = "Sediment";
            //                strURL4queryS = this.strURL + "5";
            //                content = content + graphic3.attributes.SID + " Field (<A href='#' onclick='showFeaturePrep(sediments[" + iii + "],strURL4queryS,strThemeS);'>show</A>)<br/>";
            //            }

            this.strMultipleContent = content;
            this.pMap.infoWindow.setContent(content);
            this.pMap.infoWindow.setTitle("Identify Results");
            this.pMap.infoWindow.show(this.pSP, this.pMap.getInfoWindowAnchor(this.pSP));
        },

        returnEvents: function (results) {
            console.log("queries finished: ", results);
            var tissues
            //            var tissues, waters, sediments;

            // make sure both queries finished successfully
            if (!results[0].hasOwnProperty("features")) {
                console.log("Parcels query failed.");
            }
            //            if (!results[1].hasOwnProperty("features")) {
            //                conosle.log("Buildings query failed.");
            //            }
            //            if (!results[2].hasOwnProperty("features")) {
            //                conosle.log("Buildings query failed.");
            //            }

            //            if ((results[0].features.length == 1 & (results[1].features.length == 0 & results[2].features.length == 0)) ||
            //                (results[1].features.length == 1 & (results[0].features.length == 0 & results[2].features.length == 0)) ||
            //                (results[2].features.length == 1 & (results[0].features.length == 0 & results[1].features.length == 0))
            //                        )

            //            if (results[0].features.length == 1 & (results[1].features.length == 0 & results[2].features.length == 0))
            //                 {
            if (results[0].features.length == 1) {
                var pFeature = null;
                var strURL4query = "";
                if (results[0].features.length == 1) {
                    pFeature = results[0].features[0];
                    strTheme = "Tissue";
                    strURL4query = this.strURL + "10";
                    //                    strURL4query = this.strURL + "3";
                }
                //                else if (results[1].features.length == 1) {
                //                    pFeature = results[1].features[0];
                //                    strTheme = "Water";
                //                    strURL4query = this.strURL + "4";
                //                }
                //                else if (results[2].features.length == 1) {
                //                    pFeature = results[2].features[0];
                //                    strTheme = "Sediment";
                //                    strURL4query = this.strURL + "5";
                //                }
                else { //some issue
                }

                this.strURL4Statquery = strURL4query;
                this.showFeature(pFeature, strTheme);
            }
            else {
                this.showFeatureSet(results);
            }


            if (this.m_dblY != null) {
                var CK_ASZ = new CK_AutoCompleteSearchAndZoom({ pMap: app.map, dblExpandNum: 2,
                    divTag4Results: document.getElementById("loc"),
                    strSearchField: "Project_ID", pSR: this.mSR
                }); // instantiate the class
                CK_ASZ.zoomToPoint(this.m_dblX, this.m_dblY, "", null);
            }
        },

        err: function (err) {
            console.log("Failed to get results from ? due to an error: ", err);
            alert(error.name);
        }
    }
    )
    ;
}
);


