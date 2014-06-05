define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request"
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
                        switch (strMatrix) {
                            case "0":
                                this.pTissueLayer.show();
                                this.pTissueLayer.setDefinitionExpression(strQueryDef);

                                this.pWaterLayer.hide();
                                this.pSedimentLayer.hide();
                                break;
                            case "1":
                                this.pWaterLayer.show();
                                this.pWaterLayer.setDefinitionExpression(strQueryDef);

                                this.pTissueLayer.hide();
                                this.pSedimentLayer.hide();
                                break;
                            case "2":
                                this.pSedimentLayer.show();
                                this.pSedimentLayer.setDefinitionExpression(strQueryDef);
                                
                                this.pTissueLayer.hide();
                                this.pWaterLayer.hide();
                                break;
                        }
            return true;
        },

        err: function (err) {
            console.log("Failed to get results from Seat Geek due to an error: ", err);
            alert(error.name);
        }
    });
}
);

