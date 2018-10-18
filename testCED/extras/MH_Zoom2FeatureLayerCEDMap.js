//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "dojo/promise/all",
  "esri/geometry/Point",
  "extras/MH_FeatureCount"
], function (
  declare, lang, esriRequest, all, Point, MH_FeatureCount
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
            this.pFeatureLayer1 = pFeatureLayer1;
            var strQuery = pFeatureLayer1.getDefinitionExpression();
            strQuery = strQuery.replace(" and (((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')))", " and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))");

            if (strQuery == "") { strQuery = "OBJECTID > 0"; }
            var pQueryT1 = new esri.tasks.QueryTask(pFeatureLayer1.url);
            var pQuery1 = new esri.tasks.Query();
            pQuery1.returnGeometry = true;
            pQuery1.outFields = ["OBJECTID"];
            pQuery1.where = strQuery;
            this.strQuerySaved = strQuery
            var FLayer1, pPromises
            FLayer1 = pQueryT1.execute(pQuery1);
            pPromises = new all([FLayer1]);
            return pPromises.then(this.returnEvents, this.err);
        },

        returnEvents: function (results) {
            if (results) {
                document.getElementById("btn_TextSummary").disabled = false;

                var pExtent;
                var mapPoint1;
                if (results[0].features.length > 0) {
                    var resultFeatures1 = results[0].features;
                    pfeatureExtent1 = esri.graphicsExtent(resultFeatures1);
                    if ((pfeatureExtent1 != undefined) & (pfeatureExtent1.xmax != pfeatureExtent1.xmin)) {
                        pExtent = new esri.geometry.Extent(pfeatureExtent1.xmin, pfeatureExtent1.ymin, pfeatureExtent1.xmax, pfeatureExtent1.ymax, new esri.SpatialReference({ "wkid": 3857 }));
                        pExtent = pExtent.expand(this.dblExpandNum);
                        app.map.setExtent(pExtent, true);
                    }
                    else {
                        var pFeature1 = resultFeatures1[0];
                        var ptempSR = new esri.SpatialReference({ "wkid": 3857 });
                        mapPoint1 = new Point(pFeature1.geometry.points[0][0], pFeature1.geometry.points[0][1], ptempSR);
                        app.map.centerAndZoom(mapPoint1,10);
                    }
                }
                if (!(pExtent) & !(mapPoint1)){
                    var customExtentAndSR = new esri.geometry.Extent(-14000000, 4800000, -11000000, 6200000, new esri.SpatialReference({ "wkid": 3857 }));
                    app.map.setExtent(customExtentAndSR, true);
                }
            }
            else {
                //do nothing
            }
            return results;
        },
        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
            
            $(function () {
                $("#dialogWarning1").dialog("open");
            });
        }
    }
    )
    ;

}
);

