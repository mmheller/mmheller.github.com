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

    function CreateLayerDefString(values) {
        var strDefQuery2 = "SID in (" + values + ")";
        strDefQuery2 = trimStringWhiteSpace(String(strDefQuery2));
        return strDefQuery2;
    }

    return declare([], {
        strURL: null,
        iNonSpatialTableIndex: null,
        arraySID: null,
        strLayerDefString: null,
        iNumberofSites: null,
        strQuerySaved: null,

        constructor: function (options) {// specify class defaults
            this.strURL = options.strURL || "https://www.sciencebase.gov/arcgis/rest/services/Catalog/52ab7d7de4b078ad3e41b15d/MapServer/"; // default AGS REST URL
            this.iNonSpatialTableIndex = options.iNonSpatialTableIndex || 4; // default to 2nd non-spataial table
            //            this.arraySID = options.arraySID || null;
            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
            this.returnEvents = lang.hitch(this, this.returnEvents);
        },

        qry_Non_SpatialTable: function (strQuery) {
            var pQueryT = new esri.tasks.QueryTask(this.strURL + this.iNonSpatialTableIndex);
            var pQuery = new esri.tasks.Query();
            pQuery.returnGeometry = false;
            pQuery.outFields = ["SiteID"];
            pQuery.where = strQuery;
            this.strQuerySaved = strQuery
            return pQueryT.execute(pQuery, this.returnEvents, this.err);
        },

        getMore: function () {
            var eventsResponse;
        },

        returnEvents: function (results) {
            var resultFeatures = results.features;
            if (resultFeatures.length > 0) {
                var zone;
                var values = [];
                if (this.arraySID !== null) {
                    values = this.arraySID;
                }  //if there are values stored in the module variable then set the value variables
                var testVals = {};
                var features = results.features; //Loop through the QueryTask results and populate an array with the unique values
                dojo.forEach(features, function (feature) {
                    zone = feature.attributes.SiteID;
                    if (!testVals[zone]) {
                        testVals[zone] = true;
                        var strValue = trimStringWhiteSpace(zone);
                        values.push("'" + strValue + "'"); //values.push({ name: zone });
                    }
                });

                if (resultFeatures.length > 999) {
                    this.arraySID = values;
                    this.strLayerDefString = null;
                    this.iNumberofSites = values.length;
//                    this.qry_Non_SpatialTable(strQuery += " and (NOT(SiteID in (" + this.arraySID + ")))");  //call the funtion that does the query
                    //trying this
                    var pQueryT = new esri.tasks.QueryTask(this.strURL + this.iNonSpatialTableIndex);
                    var pQuery = new esri.tasks.Query();
                    pQuery.returnGeometry = false;
                    pQuery.outFields = ["SiteID"];
                    pQuery.where = strQuery += " and (NOT(SiteID in (" + this.arraySID + ")))";
                    this.strQuerySaved = strQuery
                    return pQueryT.execute(pQuery, this.returnEvents, this.err);


                }
                else {
                    this.strLayerDefString = CreateLayerDefString(values);
                    this.iNumberofSites = values.length;
                    return results;
                }
            }
            else {
                if (this.arraySID !== null) {
                    this.strLayerDefString = CreateLayerDefString(app.SIDs);
                    this.iNumberofSites = app.SIDs.length;
                    this.arraySID = null;
                    return results;
                }
                else
                { console.log("No records meet search criteria"); }
            }
        },

        err: function (err) {
            console.log("Failed to get results from Seat Geek due to an error: ", err);
            alert(error.name);
        }
    }
    )
    ;

}
);

