//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Dec 2014

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "dojo/promise/all",
  "esri/geometry/Point",
  "dojo/_base/array",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "dojo/_base/Color"
], function (
  declare, lang, esriRequest, all, Point, arrayUtils, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color
) {

    return declare([], {
        pMap: null,
        dblExpandNum: null,
        pFeatureLayer: null,

        constructor: function (options) {
            this.pMap = options.pMap || null;
            this.dblExpandNum = options.dblExpandNum || 4;
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
        },

        qry_Zoom2FeatureLayerExtent: function (pFeatureLayer1) {
            var pQueryT1 = new esri.tasks.QueryTask(pFeatureLayer1.url);
            var pQuery1 = new esri.tasks.Query();
//            var pQueryT2 = new esri.tasks.QueryTask(pFeatureLayer2.url);
//            var pQuery2 = new esri.tasks.Query();
            pQuery1.returnGeometry = true;
            pQuery1.outFields = ["objectid"];
//            pQuery1.returnGeometry = pQuery2.returnGeometry = true;
//            pQuery1.outFields = pQuery2.outFields = ["objectid"];
            var strQuery1 = pFeatureLayer1.getDefinitionExpression();
//            var strQuery2 = pFeatureLayer2.getDefinitionExpression();
            pQuery1.where = strQuery1;
//            pQuery2.where = strQuery2;
            var FLayer1;
//            var FLayer1, FLayer2;
            FLayer1 = pQueryT1.execute(pQuery1);
//            FLayer2 = pQueryT2.execute(pQuery2);
//            pPromises = new all([FLayer1, FLayer2]);
            pPromises = new all([FLayer1]);
            return pPromises.then(this.returnEvents, this.err);
        },

        returnEvents: function (results) {
            var resultFeatures = [];

            resultFeatures = resultFeatures.concat(results[0].features);
//            resultFeatures = resultFeatures.concat(results[1].features);

            if (resultFeatures.length > 0) {
                var pExtent;
                pfeatureExtent1 = esri.graphicsExtent(resultFeatures);
                if (pfeatureExtent1) {
                    pExtent = new esri.geometry.Extent(pfeatureExtent1.xmin, pfeatureExtent1.ymin, pfeatureExtent1.xmax, pfeatureExtent1.ymax, new esri.SpatialReference({ "wkid": 3857 }));
                }
                else {
                    var pFeature1 = resultFeatures[0];
                    var ptempSR = new esri.SpatialReference({ "wkid": 3857 });
                    mapPoint1 = new Point(pFeature1.geometry.points[0][0], pFeature1.geometry.points[0][1], ptempSR);
                    app.map.centerAndZoom(mapPoint1, 9);
                }
                if (pExtent) {
                    pExtent = pExtent.expand(this.dblExpandNum);
                    app.map.setExtent(pExtent, true);
                }
                else { var strMessage = "hold it up here"; }

                arrayUtils.forEach(results[0].features, function (feat) {                //This section handles features with no symbology
                    var attr = feat.attributes;
                    if ((attr.typeact != "Project") && (attr.typeact != "Plan")) {
                        feat.setSymbol(new SimpleMarkerSymbol().setColor(new Color([0, 255, 255, 0.4])));
                        app.map.graphics.add(feat);
                    }
                }); // add the results to the map
//                arrayUtils.forEach(results[1].features, function (feat) {
//                    var attr = feat.attributes;
//                    if ((attr.typeact != "Project") && (attr.typeact != "Plan")) {
//                        feat.setSymbol(new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([0, 255, 255]), 3));
//                        app.map.graphics.add(feat);
//                    }
//                }); // add the results to the map
            }
            else {
                // do nothing
            }
            return results;
        },

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
            alert(error.name);
        }
    }
    )
    ;
}
);

