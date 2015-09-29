define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "esri/layers/FeatureLayer"
], function (
  declare, lang, esriRequest
) {
    return declare([], {
        pTissueLayer: null,
        pWaterLayer: null,
        pSedimentLayer: null,
        strQueryDef: null,
        strMatrix: null,

        constructor: function (options) {            // specify class defaults
            this.pTissueLayer = options.pTissueLayer || null;
            this.pWaterLayer = options.pWaterLayer || null; // default seat geek range is 30mi
            this.pSedimentLayer = options.pSedimentLayer || null; // default to 50 results per page
            this.strMatrix = options.strMatrix || null; // default to 50 results per page
        },

        setQS: function (strQueryDef) {
//            this.pTissueLayer.setDefinitionExpression("");
//            this.pWaterLayer.setDefinitionExpression("");
//            this.pSedimentLayer.setDefinitionExpression("");

//            this.pTissueLayer.hide();
//            this.pWaterLayer.hide();
//            this.pSedimentLayer.hide();

//            switch (strMatrix) {
//                case "0":
//                    this.pTissueLayer.show();
//                    break;
//                case "1":
//                    this.pWaterLayer.show();
//                    break;
//                case "2":
//                    this.pSedimentLayer.show();
//                    break;
//            }


            switch (strMatrix) {
                case "0":
                    this.pTissueLayer.setDefinitionExpression(strQueryDef);
                    break;
                case "1":
                    this.pWaterLayer.setDefinitionExpression(strQueryDef);
                    break;
                case "2":
                    this.pSedimentLayer.setDefinitionExpression(strQueryDef);
                    break;
            }
            return true;
        }
    });
}
);

