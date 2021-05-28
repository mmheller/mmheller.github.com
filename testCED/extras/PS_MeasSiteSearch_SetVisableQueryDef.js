//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018
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
        strQueryDef: null,
        pCurrentFeatureLayer: null,

        constructor: function (options) {            // specify class defaults
            this.pCED_PP_poly = options.pCED_PP_poly || null;
            this.pCED_PP_line = options.pCED_PP_line || null;
            this.pCED_PP_point = options.pCED_PP_point || null;
        },
        setQS: function (strQueryDef) {
			this.pCED_PP_poly.setDefinitionExpression(strQueryDef);
			if (app.strModule == "GRSG") {
				this.pCED_PP_line.setDefinitionExpression(strQueryDef);
			}
			var strQueryDef4FeatureTable = strQueryDef;  //setting the gCED_PP_point4FeatureTable later due to table refresh issues

            if (strQueryDef !== "") { strQueryDef += " and "; }
			strQueryDef += "(((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project')))";
            this.pCED_PP_point.setDefinitionExpression(strQueryDef);
            this.pCED_PP_point.setVisibility(true);
			if (app.strModule == "GRSG") {
				this.pCED_PP_line.setVisibility(true);
			}
            this.pCED_PP_poly.setVisibility(true);

			console.log("setting app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression");

			app.pSup.gFeatureTable.clearSelection();
			if (app.blnPopulateFeatureTable == true) {
				app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression(strQueryDef4FeatureTable);
				//app.pSup.gFeatureTable.refresh();
			} else {
				app.pSup.gCED_PP_point4FeatureTable.setDefinitionExpression("OBJECTID < 0");
				//app.pSup.gFeatureTable.clearFilter();
				//app.pSup.gFeatureTable.refresh();
			}   
			//app.pSup.gFeatureTable.refresh();
			return true;
        },
        err: function (err) {
            $(function () {
                $("#dialogWarning1").dialog("open");
            });
        }
    });
}
);

