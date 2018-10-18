////Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

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

            this.returnEvents = lang.hitch(this, this.returnEvents);
        },

        returnQS: function () {
            strQuery = "";
            return strQuery;
        }
    });
}
);

