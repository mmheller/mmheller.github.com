////Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
], function (
  declare, lang, esriRequest
) {

    return declare([], {
        strURL: null,
        iNonSpatialTableIndex: null,
        strQuery: null,
        strFieldName: null,
        strStatType: null,
        divTag4Results: null,

        constructor: function (options) {// specify class defaults
            this.strURL = options.strURL || "www.cnn.com"; // default AGS REST URL
            this.iNonSpatialTableIndex = options.iNonSpatialTableIndex || 4; // default to 2nd non-spataial table
            this.strQuery = options.strQuery || null;
            this.strFieldName = options.strFieldName || null;
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
            this.divTag4Results = options.divTag4Results || null;
        },

        qry_Stats_Non_SpatialTable: function (strStatType) {
            this.strStatType = strStatType;
            var pQueryTask = new esri.tasks.QueryTask(this.strURL + this.iNonSpatialTableIndex);
            var pQuery = new esri.tasks.Query();
            var pstatDef = new esri.tasks.StatisticDefinition();
            pstatDef.statisticType = strStatType;
            pstatDef.onStatisticField = this.strFieldName;
            pstatDef.outStatisticFieldName = "genericstat";

            pQuery.returnGeometry = false;
            pQuery.where = this.strQuery;
            pQuery.outFields = ["SiteID"];
            pQuery.outStatistics = [pstatDef];
            return pQueryTask.execute(pQuery, this.returnEvents, this.err);
        },

        returnEvents: function (results) {
            strConcat = this.strStatType + this.strFieldName;
            var resultFeatures = results.features;
            if (resultFeatures.length > 0) {
                var iStatValue = resultFeatures[0].attributes.genericstat;
                this.divTag4Results.innerHTML += "<br />      " + this.strFieldName + ":" + this.strStatType + " = " + iStatValue;
                switch (strConcat) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
                    case "countMeasurement":
                        this.qry_Stats_Non_SpatialTable("sum");
                        break;
                    case "sumMeasurement":
                        this.qry_Stats_Non_SpatialTable("min");
                        break;
                    case "minMeasurement":
                        this.qry_Stats_Non_SpatialTable("max");
                        break;
                    case "maxMeasurement":
                        this.qry_Stats_Non_SpatialTable("avg");
                        break;
                    case "avgMeasurement":
                        break;                        //do nothing
                    case "countFiltered":
                        this.qry_Stats_Non_SpatialTable("sum");
                        break;
                    case "sumFiltered":
                        this.qry_Stats_Non_SpatialTable("min");
                        break;
                    case "minFiltered":
                        this.qry_Stats_Non_SpatialTable("max");
                        break;
                    case "maxFiltered":
                        this.qry_Stats_Non_SpatialTable("avg");
                        break;
                    case "avgFiltered":
                        this.strFieldName = "Unfiltered";
                        this.qry_Stats_Non_SpatialTable("count");
                        break;                        
                    case "countUnfiltered":
                        this.qry_Stats_Non_SpatialTable("sum");
                        break;
                    case "sumUnfiltered":
                        this.qry_Stats_Non_SpatialTable("min");
                        break;
                    case "minUnfiltered":
                        this.qry_Stats_Non_SpatialTable("max");
                        break;
                    case "maxUnfiltered":
                        this.qry_Stats_Non_SpatialTable("avg");
                        break;
                    case "avgUnfiltered":
                        break;                        //do nothing
                }
            }
            else {
                // do nothing
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
    );
}
);

