define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request"
], function (
  declare, lang, esriRequest
) {

    function trimStringWhiteSpace(str) {
        return str.replace('     ', ' ').replace('    ', ' ').replace('  ', ' ');
    }

    return declare([], {
        strURL: null,
        strContaminant: null,
        strMatrix: null,
        strManagUnit: null,
        strDataType: null,
        iNonSpatialTableIndex: null,
        divTag4Results: null,
        strFieldName: null,

        constructor: function (options) {            // specify class defaults
            this.strURL = options.strURL || "test";
            this.strContaminant = options.strContaminant || "20mi"; // default seat geek range is 30mi
            this.strMatrix = options.strMatrix || ""; // default to 50 results per page
            this.strManagUnit = options.strManagUnit || "";
            this.strDataType = options.strDataType || "";
            this.iNonSpatialTableIndex = options.iNonSpatialTableIndex || 9999;
            this.divTag4Results = options.divTag4Results || null;
            this.returnEvents = lang.hitch(this, this.returnEvents);
        },

        qry_SetUniqueValuesOf: function (strFieldName, divTag4Results) {
            this.divTag4Results = divTag4Results;
            this.strFieldName = strFieldName;
            var strQuery = "";
            if (this.strMatrix !== "Select Matrix") {
                //continue, query will use the iNonSpatialTableIndex
            }
            if (this.strManagUnit !== "All") {
                strQuery = "MU = '" + this.strManagUnit + "'";
            }
            if (this.strDataType !== "0,1") {
                if (strQuery != "") {
                    strQuery += " and ";
                }
                strQuery += "Exceedance in (" + this.strDataType + ")";
            }
            if (strQuery == "") {
                strQuery = "OBJECTID > 0"
            }

            var pQueryT = new esri.tasks.QueryTask(this.strURL + this.iNonSpatialTableIndex + "?returnDistinctValues=true");
            var pQuery = new esri.tasks.Query();
            pQuery.returnGeometry = false;
            pQuery.outFields = [strFieldName];
            pQuery.where = strQuery;
            //pQuery.returnDistinctValues=true;this parameter has not been setup for the JS api, used workaround in the querytask creation
            return pQueryT.execute(pQuery, this.returnEvents, this.err);
        },

        returnEvents: function (results) {
            var strRemoveStrings = ["p,p'-", "**", " (Recoverable)", " (Total)", " (Dissolved)", "*", "(Total Recoverable)", " (Muscle)", " (Fillet)", " (Liver)", " (Other Tissue)", " (WB)", " (Kidney)", " (Eggs)", " (Gonads)", " (Carcass)", " (Digesta)", " (Brain)"];
            var resultFeatures = results.features;
            if (resultFeatures.length > 0) {
                var values = [];
                var testVals = {};
                dojo.forEach(resultFeatures, function (feature) {//Loop through the QueryTask results and populate an array with the unique values
                    var strTempValue = feature.attributes.Contaminant;
                    strRemoveStrings.forEach(function (str2Remove) {//remove some of the strings to make wildcard functionality work
                        strTempValue = strTempValue.replace(str2Remove, "");
                    });
                    strTempValue = trimStringWhiteSpace(strTempValue)
                    if (!testVals[strTempValue]) {
                        testVals[strTempValue] = true;
                        var strValue = strTempValue;
                        values.push(strValue); //values.push({ name: zone });
                    }
                });
                values.sort();

                this.divTag4Results.options.length = 0; // clear out existing items
                this.divTag4Results.options.add(new Option("Select Contaminant", i))

                for (var i = 0; i < values.length; i++) {
                    var d = values[i];
                    this.divTag4Results.options.add(new Option(d, d))
                }

                if (this.strContaminant !== "Select Contaminant") {
                    for (i = 0; i < this.divTag4Results.options.length; i++) {
                        if (this.divTag4Results.options[i].value == this.strContaminant) {
                            this.divTag4Results.selectedIndex = i;
                            return;
                        }
                    }
                }
            }
            else { // do nothing
                this.divTag4Results.options.length = 0; // clear out existing items
                this.divTag4Results.options.add(new Option("Select Contaminant", i))
            }
            return results;
        },

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
            alert(error.name);
        }
    });
}
);

