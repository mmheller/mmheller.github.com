function showFeaturePrep(feature, strURL, strTheme) {
    this.app.pPS_Identify.strURL4Statquery = strURL;
    this.app.pPS_Identify.showFeature(feature, strTheme);
//    this.showFeature(feature);
}
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "dojo/promise/all",
  "dojo/_base/array",
  "esri/symbols/SimpleMarkerSymbol",
  "dojo/_base/Color",

], function (
  declare, lang, esriRequest, all, arrayUtils, SimpleMarkerSymbol, Color
) {
    return declare([], {
        pTissueLayer: null,
        pWaterLayer: null,
        pSedimentLayer: null,
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
        mCp2: null,
        mTc: null,

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
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
        },

        executeQueries: function (pEvt, strSingleLayerName, iSingleObjectID) {
            this.pEvt = pEvt;
            this.strMultipleContent = null;
            qt_tissueLayer = new esri.tasks.QueryTask(this.pTissueLayer.url);
            q_tissueLayer = new esri.tasks.Query();
            qt_waterLayer = new esri.tasks.QueryTask(this.pWaterLayer.url);
            q_waterLayer = new esri.tasks.Query();
            qt_sedimentLayer = new esri.tasks.QueryTask(this.pSedimentLayer.url);
            q_sedimentLayer = new esri.tasks.Query();
            q_tissueLayer.returnGeometry = q_waterLayer.returnGeometry = q_sedimentLayer.returnGeometry = true;
            q_tissueLayer.outFields = q_waterLayer.outFields = q_sedimentLayer.outFields = ["*"];

            var tissues, waters, sediments, pPromises, pxWidth, padding;

            pxWidth = app.map.extent.getWidth() / app.map.width; // create an extent from the mapPoint that was clicked // this is used to return features within 3 pixels of the click point
            padding = 3 * pxWidth;
            qGeom = new esri.geometry.Extent({ "xmin": pEvt.mapPoint.x - padding, "ymin": pEvt.mapPoint.y - padding, "xmax": pEvt.mapPoint.x + padding, "ymax": pEvt.mapPoint.y + padding,
                "spatialReference": pEvt.mapPoint.spatialReference
            });

            q_tissueLayer.geometry = q_waterLayer.geometry = q_sedimentLayer.geometry = qGeom; // use the extent for the query geometry

            tissues = qt_tissueLayer.execute(q_tissueLayer);
            waters = qt_waterLayer.execute(q_waterLayer);
            sediments = qt_sedimentLayer.execute(q_sedimentLayer);
            pPromises = new all([tissues, waters, sediments]);
            return pPromises.then(this.returnEvents, this.err);
        },


        qry_Stats_Non_SpatialTable4Stats: function (strStatType, strOnStatisticField) {
            this.strStatType = strStatType;
            this.strOnStatisticField = strOnStatisticField;
            var pQueryTask = new esri.tasks.QueryTask(this.strURL4Statquery);
            var pQuery = new esri.tasks.Query();
            var pstatDef = new esri.tasks.StatisticDefinition();
            pstatDef.statisticType = strStatType;
            pstatDef.onStatisticField = strOnStatisticField;
            pstatDef.outStatisticFieldName = "genericstat";

            pQuery.returnGeometry = false;

            var attr = this.pFeature.attributes;
            pQuery.where = "SiteID = '" + attr.SID + "'";
            //pQuery.where = this.strQueryString4Measurements + " and SiteID = '" + attr.SID + "'";
            pQuery.outFields = ["SiteID"];
            pQuery.outStatistics = [pstatDef];

            return pQueryTask.execute(pQuery, this.qryStatResults, this.err);
        },


        qryStatResults: function (results) {
            var resultFeatures = results.features;
            if (resultFeatures.length > 0) {
                strStat_Type = this.app.pPS_Identify.strStatType;
                strOnStatisticField = this.app.pPS_Identify.strOnStatisticField;

                var iStatValue = resultFeatures[0].attributes.genericstat;
                this.app.pPS_Identify.strFeatureContent += "<br />      " + strStat_Type + " = " + iStatValue + " " + strOnStatisticField;

                if (dijit.byId('tabcontainer1')) {
                    dijit.byId('tabcontainer1').destroy();
                }
                if (dijit.byId('cp1')) {
                    dijit.byId('cp1').destroy();
                }
                if (dijit.byId('cp2')) {
                    dijit.byId('cp2').destroy();
                }

                this.app.mTc = new dijit.layout.TabContainer({ id: "tabcontainer1", style: "width:100%;height:100%;", useMenu: false, useSlider: false, focused: false }, dojo.create('div'));
                this.app.mCp1 = new dijit.layout.ContentPane({ id: "cp1", title: "Site and Summary", content: this.app.pPS_Identify.strFeatureContent });
                this.app.mCp1.selected = true;
                this.app.mCp2 = new dijit.layout.ContentPane({ id: "cp2", title: "Pie Chart" });

                this.app.mTc.addChild(this.app.mCp1);
                this.app.mTc.addChild(this.app.mCp2);
                this.app.mTc.startup();

                this.app.map.infoWindow.setContent("");
                this.app.map.infoWindow.setContent(this.app.mTc.domNode);

                (this.app.pPS_Identify.pEvt) ? this.app.map.infoWindow.show(this.app.pPS_Identify.pEvt.screenPoint, this.app.map.getInfoWindowAnchor(this.app.pPS_Identify.pEvt.screenPoint)) : null;
                this.app.mTc.resize({ w: 350, h: 350 });

                strConcat = strStat_Type + strOnStatisticField;

                switch (strConcat) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
                    case "countMeasurement":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("sum", "Measurement");
                        break;
                    case "sumMeasurement":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("min", "Measurement");
                        break;
                    case "minMeasurement":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("max", "Measurement");
                        break;
                    case "maxMeasurement":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("avg", "Measurement");
                        break;
                    case "avgMeasurement":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("count", "Exceedance");
                        break;
                    case "countExceedance":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("sum", "Exceedance");
                        break;
                    case "sumExceedance":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("min", "Exceedance");
                        break;
                    case "minExceedance":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("max", "Exceedance");
                        break;
                    case "maxExceedance":
                        this.app.pPS_Identify.qry_Stats_Non_SpatialTable4Stats("avg", "Exceedance");
                        break;
                    case "avgExceedance":
//                        dojo.connect(this.app.map.infoWindow, 'onMouseOver', function () {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mTc, 'onMouseOver', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mTc, 'onMouseUp', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mTc, 'onMouseOut', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mTc, 'onClick', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mCp1, 'onMouseOver', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mCp1, 'onMouseLeave', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mCp1, 'onMouseEnter', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mCp1, 'onMouseOut', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mCp2, 'onMouseOver', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
//                        dojo.connect(this.app.mCp2, 'onMouseOut', function (tabItem) {
//                            app.map.infoWindow.resize(375, 375);
//                        });
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
            var title = strTheme + " Site ID: " + attr.SID;
            this.strFeatureContent = "Management Unit : " + attr.MU + "<br />Latitude : " + attr.Latitude + "<br />Longitude : " + attr.Longitude + "<br/><hr><br/> Measurements Summary<br/>";
            this.pMap.graphics.add(pFeature);

            if (dijit.byId('tabcontainer1')) {
                dijit.byId('tabcontainer1').destroy();
            }
            if (dijit.byId('cp1')) {
                dijit.byId('cp1').destroy();
            }
            if (dijit.byId('cp2')) {
                dijit.byId('cp2').destroy();
            }
            this.mTc = new dijit.layout.TabContainer({ id: "tabcontainer1", style: "width:100%;height:100%;", useMenu: false, useSlider: false, focused: true }, dojo.create('div'));
            //this.mTc = new dijit.layout.TabContainer({ style: "width:100%;height:100%;", useMenu: false, useSlider: false, focused: true }, dojo.create('div'));




            this.mCp1 = new dijit.layout.ContentPane({ id: "cp1", title: "Site and Summary", content: this.strFeatureContent });
            this.mCp1.selected = true;
            this.mCp2 = new dijit.layout.ContentPane({ id: "cp2", title: "Pie Chart" });




            this.mTc.addChild(this.mCp1);
            this.mTc.addChild(this.mCp2);
            this.mTc.startup();
            //            this.mTc.selectChild(this.mCp2);

            this.pMap.infoWindow.setContent(this.mTc.domNode);
            this.pMap.infoWindow.setTitle(title);
            this.pMap.infoWindow.resize(375, 375);


            (this.pEvt) ? this.pMap.infoWindow.show(this.pEvt.screenPoint, this.pMap.getInfoWindowAnchor(this.pEvt.screenPoint)) : null;

            this.pFeature = pFeature;
            this.mTc.resize({ w: 350, h: 350 });
            this.qry_Stats_Non_SpatialTable4Stats("count", "Measurement");
        },

        showFeatureSet: function (results) {
            tissues = results[0].features; // results from deferred lists are returned in the order they were created  // so parcel results are first in the array and buildings results are second
            waters = results[1].features;
            sediments = results[2].features;

            this.pMap.graphics.clear();
            var content = "";

            //            strTheme = "";
            var content = "Number of Tissues Measurement Sites:  " + tissues.length + "<br />";
            arrayUtils.forEach(tissues, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color([255, 0, 255, 0.5]))); app.map.graphics.add(feat); }); // add the results to the map
            for (var i = 0; i < tissues.length; i++) {
                var graphic1 = tissues[i];
                strThemeT = "Tissue";
                strURL4queryT = this.strURL + "3";
                content = content + graphic1.attributes.SID + " Field (<A href='#' onclick='showFeaturePrep(tissues[" + i + "],strURL4queryT,strThemeT);'>show</A>)<br/>";
            }
            content = content + "<br />Number of Water Measurement Sites:  " + waters.length + "<br />";
            arrayUtils.forEach(waters, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color("red"))); app.map.graphics.add(feat); });
            for (var ii = 0; ii < waters.length; ii++) {
                var graphic2 = waters[ii];
                strThemeW = "Water";
                strURL4queryW = this.strURL + "4";
                content = content + graphic2.attributes.SID + " Field (<A href='#' onclick='showFeaturePrep(waters[" + ii + "],strURL4queryW,strThemeW);'>show</A>)<br/>";
            }
            content = content + "<br />Number of Sediment Measurement Sites:  " + sediments.length + "<br />";
            arrayUtils.forEach(sediments, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color([255, 0, 255, 0.5]))); app.map.graphics.add(feat); });
            for (var iii = 0; iii < sediments.length; iii++) {
                var graphic3 = sediments[iii];
                strThemeS = "Sediment";
                strURL4queryS = this.strURL + "5";
                content = content + graphic3.attributes.SID + " Field (<A href='#' onclick='showFeaturePrep(sediments[" + iii + "],strURL4queryS,strThemeS);'>show</A>)<br/>";
            }

            //this.strURL4Statquery = strURL4query;

            this.strMultipleContent = content;
            //            this.pMap.infoWindow.resize(415, 200);
            this.pMap.infoWindow.setContent(content);
            this.pMap.infoWindow.setTitle("Identify Results");
            this.pMap.infoWindow.show(this.pEvt.screenPoint, this.pMap.getInfoWindowAnchor(this.pEvt.screenPoint));
        },

        returnEvents: function (results) {
            console.log("queries finished: ", results);
            var tissues, waters, sediments;

            // make sure both queries finished successfully
            if (!results[0].hasOwnProperty("features")) {
                console.log("Parcels query failed.");
            }
            if (!results[1].hasOwnProperty("features")) {
                conosle.log("Buildings query failed.");
            }
            if (!results[2].hasOwnProperty("features")) {
                conosle.log("Buildings query failed.");
            }

            if ((results[0].features.length == 1 & (results[1].features.length == 0 & results[2].features.length == 0)) ||
                (results[1].features.length == 1 & (results[0].features.length == 0 & results[2].features.length == 0)) ||
                (results[2].features.length == 1 & (results[0].features.length == 0 & results[1].features.length == 0))
                        ) {

                var pFeature = null;
                var strURL4query = "";
                if (results[0].features.length == 1) {
                    pFeature = results[0].features[0];
                    strTheme = "Tissue";
                    strURL4query = this.strURL + "3";
                }
                else if (results[1].features.length == 1) {
                    pFeature = results[1].features[0];
                    strTheme = "Water";
                    strURL4query = this.strURL + "4";
                }
                else if (results[2].features.length == 1) {
                    pFeature = results[2].features[0];
                    strTheme = "Sediment";
                    strURL4query = this.strURL + "5";
                }
                else { //some issue
                }

                this.strURL4Statquery = strURL4query;
                this.showFeature(pFeature, strTheme);
            }
            else {
                this.showFeatureSet(results);
            }
            //            return results;
        },

        err: function (err) {
            console.log("Failed to get results from Seat Geek due to an error: ", err);
            alert(error.name);
        }
    }
    )
    ;

}
);


