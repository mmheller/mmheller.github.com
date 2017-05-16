//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request"
], function (
  declare, lang, esriRequest
) {
    return declare([], {
        pCED_PP_poly: null,
        pCED_PP_line: null,
        pCED_PP_point: null,
        //pCED_PP_point4FeatureTable: null,
        strQueryDef: null,
        pCurrentFeatureLayer: null,

        constructor: function (options) {            // specify class defaults
            this.pCED_PP_poly = options.pCED_PP_poly || null;
            this.pCED_PP_line = options.pCED_PP_line || null;
            this.pCED_PP_point = options.pCED_PP_point || null;
            //this.pCED_PP_point4FeatureTable = options.pCED_PP_point4FeatureTable || null;
        },
        setQS: function (strQueryDef) {
            this.pCED_PP_poly.setDefinitionExpression(strQueryDef);
            this.pCED_PP_line.setDefinitionExpression(strQueryDef);
            app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression(strQueryDef);
            app.pSup.gFeatureTable.refresh();

            if (strQueryDef !== "") { strQueryDef += " and "; }
            strQueryDef += "(((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')))"
            //strQueryDef += "((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1))"
            this.pCED_PP_point.setDefinitionExpression(strQueryDef);

            this.pCED_PP_point.setVisibility(true);
            this.pCED_PP_line.setVisibility(true);
            this.pCED_PP_poly.setVisibility(true);

            return true;
        },
        err: function (err) {
            console.log("Failed to get results from Seat Geek due to an error: ", err);
            alert(error.name);
        }
    });
}
);

