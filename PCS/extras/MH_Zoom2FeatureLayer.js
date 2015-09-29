define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
], function (
  declare, lang, esriRequest
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

        qry_Zoom2FeatureLayerExtent: function (pFeatureLayer) {
            var strQuery = pFeatureLayer.getDefinitionExpression();
            var pQueryT = new esri.tasks.QueryTask(pFeatureLayer.url);
            var pQuery = new esri.tasks.Query();
            pQuery.returnGeometry = true;
            pQuery.outFields = ["SID"];
            pQuery.where = strQuery;
            this.strQuerySaved = strQuery
            return pQueryT.execute(pQuery, this.returnEvents, this.err);
        },

        returnEvents: function (results) {
            var resultFeatures = results.features;
            if (resultFeatures.length > 0) {
                pfeatureExtent = esri.graphicsExtent(resultFeatures);
                if (pfeatureExtent != null) {
                    var pExtent = new esri.geometry.Extent(pfeatureExtent.xmin, pfeatureExtent.ymin, pfeatureExtent.xmax, pfeatureExtent.ymax, app.map.SpatialReference);
                    pExtent = pExtent.expand(this.dblExpandNum);
                    app.map.setExtent(pExtent, true);
                }
                else {
                    var strMessage = "hold it up here";
                }
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

