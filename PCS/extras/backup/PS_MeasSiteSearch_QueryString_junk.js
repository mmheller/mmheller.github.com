define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request"
], function (
  declare, lang, esriRequest
) {
    return declare([], {
        strURL: null,
        strContaminant: null,
        strMatrix: null,
        strManagUnit: null,
        strDataType: null,
        SIDs: null,
        iNonSpatialTableIndex: null,
        seatGeekUrl: null,

        constructor: function (options) {            // specify class defaults
            this.strURL = options.strURL || "test";
            this.strContaminant = options.strContaminant || "20mi"; // default seat geek range is 30mi
            this.strMatrix = options.strMatrix || ""; // default to 50 results per page
            this.strManagUnit = options.strManagUnit || "";
            this.strDataType = options.strDataType || "";
            this.SIDs = options.SIDs || null;
            this.iNonSpatialTableIndex = options.iNonSpatialTableIndex || 9999;
            this.seatGeekUrl = "http://api.seatgeek.com/2/events";

            this.returnEvents = lang.hitch(this, this.returnEvents);
        },

        returnQS: function () {
            strQuery = "Contaminant LIKE '%" + this.strContaminant + "%' and Exceedance in (" + this.strDataType + ")";


            if (this.strManagUnit !== "All") {
                strQuery += " and MU='" + this.strManagUnit + "'";
            }

            if (this.SIDs !== null) {
                strQuery += " and (NOT(SiteID in (" + this.SIDs + ")))";
            }
            return strQuery;
        }
    });
}
);

