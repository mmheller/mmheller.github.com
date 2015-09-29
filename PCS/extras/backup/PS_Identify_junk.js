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

        constructor: function (options) {// specify class defaults
            this.pTissueLayer = options.pTissueLayer || null;
            this.pWaterLayer = options.pWaterLayer || null; // default seat geek range is 30mi
            this.pSedimentLayer = options.pSedimentLayer || null; // default to 50 results per page
            this.strSingleLayerName = options.strSingleLayerName || null;
            this.iSingleObjectID = options.iSingleObjectID || null;
            this.pMap = options.pMap || null;
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
        },

        executeQueries: function (pEvt, strSingleLayerName, iSingleObjectID) {
            this.pEvt = pEvt;
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
            pPromises.then(this.returnEvents, this.err);

        },

        showFeature: function (pFeature) {


            this.pMap.graphics.clear();
            var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.5]));
            pFeature.setSymbol(symbol);
            //construct infowindow title and content
            var attr = pFeature.attributes;
            var title = "Measurement Site: " + attr.SID;
            var content = "Field ID : " + attr.MU + "<br />Produces Gas : " + attr.Latitude + "<br />Produces Oil : " + attr.Longitude + "<br />Status : " + "";
            this.pMap.graphics.add(pFeature);

            this.pMap.infoWindow.setTitle(title);
            this.pMap.infoWindow.setContent(content);

            (this.pEvt) ? this.pMap.infoWindow.show(this.pEvt.screenPoint, this.pMap.getInfoWindowAnchor(this.pEvt.screenPoint)) : null;
        },

        showFeatureSet: function (results) {
            tissues = results[0].features; // results from deferred lists are returned in the order they were created  // so parcel results are first in the array and buildings results are second
            waters = results[1].features;
            sediments = results[2].features;

            this.pMap.graphics.clear();
            var content = "";

            var content = "Number of tissues:  " + tissues.length + "<br />";
            arrayUtils.forEach(tissues, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color([255, 0, 255, 0.5]))); app.map.graphics.add(feat); }); // add the results to the map
            for (var i = 0; i < tissues.length; i++) {
                var graphic1 = tissues[i];


                //                var pPS_Identify = new PS_Identify({pMap: app.map }); 
                //                var blnQSSet = pPS_Identify.executeQueries(e, "", 0);


                content = content + graphic1.attributes.SID + " Field (<A href='#' onclick='showFeature(tissues[" + i + "]);'>show</A>)<br/>";
            }

            content = content + "<br />Number of waters:  " + waters.length + "<br />";

            arrayUtils.forEach(waters, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color("red"))); app.map.graphics.add(feat); });

            for (var ii = 0; ii < waters.length; ii++) {
                var graphic2 = waters[ii];
                content = content + graphic2.attributes.SID + " Field (<A href='#' onclick='this.showFeature(waters[" + ii + "]);'>show</A>)<br/>";
            }
            content = content + "<br />Number of sediments:  " + sediments.length + "<br />";
            arrayUtils.forEach(sediments, function (feat) { feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color([255, 0, 255, 0.5]))); app.map.graphics.add(feat); });
            for (var iii = 0; iii < sediments.length; iii++) {
                var graphic3 = sediments[iii];
                content = content + graphic3.attributes.SID + " Field (<A href='#' onclick='this.showFeature(sediments[" + iii + "]);'>show</A>)<br/>";
            }


            //            var strHTMLContent = "Number of tissues:  " + tissues.length + "<br />Number of waters:  " + waters.length + "<br />Number of sediments:  " + sediments.length;

            this.pMap.infoWindow.resize(415, 200);
            this.pMap.infoWindow.setContent(content);
            //this.pMap.infoWindow.setContent(dijit.byId("tabs").domNode);
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
                var strTheme = "";
                if (results[0].features.length == 1) {
                    pFeature = results[0].features[0];
                    strTheme = "Tissue";
                }
                else if (results[1].features.length == 1) {
                    pFeature = results[1].features[0];
                    strTheme = "Water";
                }
                else if (results[2].features.length == 1) {
                    pFeature = results[2].features[0];
                    strTheme = "Sediment";
                }
                else { //some issue
                }

                this.showFeature(pFeature);
            }
            else {
                this.showFeatureSet(results);
            }

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

