//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "extras/PS_MeasSiteSearch_SetVisableQueryDef",
  "extras/PS_PopUniqueQueryInterfaceValues",
  "extras/MH_Zoom2FeatureLayerCEDMap",
], function (
  declare, lang, esriRequest, PS_MeasSiteSearch_SetVisableQueryDef, PS_PopUniqueQueryInterfaceValues, MH_Zoom2FeatureLayer
) {
    function trimStringWhiteSpace(str) {
        return str.replace('     ', ' ').replace('    ', ' ').replace('  ', ' ');
    }

    return declare([], {
        strURL: null,
        iNonSpatialTableIndex: null,
        arrayID: null,
        strLayerDefString: null,
        iNumberofSites: null,
        strQuerySaved: null,
        ifeaturecount: null,
        strState: null,
        strPopArea: null,
        strManagUnit: null,
        strField: null,
        strFinalQuery: null,
        divTagSource: null,
        pCED_PP_poly: null,
        pCED_PP_line: null,
        pCED_PP_point: null,

        constructor: function (options) {// specify class defaults
            this.strURL = options.strURL || "www.cnn.com"; // default AGS REST URL
            this.iNonSpatialTableIndex = options.iNonSpatialTableIndex || 9; // default to 2nd non-spataial table
            this.arrayID = options.arrayID || null;
            this.strState = options.strState || "ST_ID";
            this.strPopArea = options.strPopArea || null;
            this.strManagUnit = options.strManagUnit || null;
            this.strQuerySaved = options.strQuerySaved || null;
            this.divTagSource = options.divTagSource || null;
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
            this.pCED_PP_poly = options.pCED_PP_poly || null;
            this.pCED_PP_line = options.pCED_PP_line || null;
            this.pCED_PP_point = options.pCED_PP_point || null;
        },

        qry_Non_SpatialTable: function (strQuery1, arrayIDTemp, strField) {
            this.strField = strField;
            var strField4NextQuery = "";
            var blnFireInsideQuery = false;

            if (this.strField == "ST_ID"){
                if ((this.strState != "99") && (this.strState != undefined)) {
                    this.iNonSpatialTableIndex = 9; // set the index to the table to query
                    strQuery = this.strField + " in (" + this.strState + ")";
                    blnFireInsideQuery = true;
                }
                else {
                    this.iNonSpatialTableIndex = 6;  //set the index for the next table to query
                    strField4NextQuery = "Pop_ID";

                }
            }
            if (this.strField == "Pop_ID"){
                if ((this.strPopArea != "99") && (this.strPopArea != undefined)) {
                    this.iNonSpatialTableIndex = 8; // set the index to the table to query
                    strQuery = this.strField + " in (" + this.strPopArea + ")";
                    blnFireInsideQuery = true;
                }
                else {
                    this.iNonSpatialTableIndex = 3; //set the index for the next table to query
                    strField4NextQuery = "WAFWA_ID";

                }
            }
            if (this.strField == "WAFWA_ID") {
                this.iNonSpatialTableIndex = 3; // set the index to the table to query
                strQuery = this.strField + " in (" + this.strManagUnit + ")";
                blnFireInsideQuery = true;
            }

            if (blnFireInsideQuery) {
                if ((strQuery1 != "") && (strQuery1.length > 0)) {
                    strQuery = "(" + strQuery + ") and (" + strQuery1 + ")";
                }
                var pQueryT = new esri.tasks.QueryTask(this.strURL + this.iNonSpatialTableIndex + "?returnDistinctValues=true");
                var pQuery = new esri.tasks.Query();
                pQuery.returnGeometry = false;
                pQuery.outFields = ["Project_id"];
                pQuery.where = strQuery;

                pQueryT.execute(pQuery, this.returnEvents, this.err);

            } else {
                this.qry_Non_SpatialTable(strQuery1, arrayIDTemp, strField4NextQuery);
            }
        },

        getMore: function () {
            var eventsResponse;
        },

        ExecutetheDerivedQuery: function (strQuery, divTagSource) {
            document.getElementById("txtQueryResults").innerHTML = "-";
            document.getElementById("dTotalProjectsQ").innerHTML = "-";
            document.getElementById("dTotalNonProjectsQ").innerHTML = "-";
            document.getElementById("dTotalPlansQ").innerHTML = "-";
            document.getElementById("dTotalAcresQ").innerHTML = "-";

            if (strQuery == "") { strQuery = "OBJECTID > 0"; }
            app.iNonSpatialTableIndex = 0;  //

            app.PS_Uniques.divTagSource = divTagSource;    //this may be redundant
            app.PS_Uniques.qry_SetUniqueValuesOf("TypeAct", "TypeAct", document.getElementById("ddlMatrix"), strQuery);//dropdown change

            var blnQSSet = app.pSetQS.setQS(strQuery);  //this sets the definition query on the layers

            if (document.getElementById("cbx_zoom").checked) {
                var pZoom2 = new MH_Zoom2FeatureLayer({ pMap: app.map, dblExpandNum: 1.0 }); // instantiate the zoom class
                var pZoom2Result = pZoom2.qry_Zoom2FeatureLayerExtent(this.pCED_PP_point);
            }
        },
        
        returnEvents: function (results) {
            this.strFinalQuery = "";
            var resultFeatures = results.features;
            if ((resultFeatures != null) && (resultFeatures != undefined)) {
                if (resultFeatures.length > 0) {
                    var zone;
                    var values = [];
                    var testVals = {};
                    var features = results.features; //Loop through the QueryTask results and populate an array with the unique values
                    dojo.forEach(features, function (feature) {
                        zone = feature.attributes.Project_ID;
                        if (!testVals[zone]) {
                            testVals[zone] = true;
                            var strValue = zone;
                            values.push(strValue); //values.push({ name: zone });//values.push("'" + strValue + "'"); //values.push({ name: zone });
                        }
                    });
                    this.arrayID = values;
                }

                if (this.arrayID.length > 0) {
                    var strQuery2 = "";
                    strQuery2 = "project_ID in (";
                    for (var i = 0; i < this.arrayID.length; i++) { strQuery2 += this.arrayID[i] + ","; }
                    strQuery2 = strQuery2.slice(0, -1) + ")";
                }
            }

            else {
                console.log("No records meet search criteria");
                this.strLayerDefString = "nothing returned";
                this.returnEvents(this.strFinalQuery);
            }
            blnFireReturnEvents = false;

            switch (this.strField) {
                case "ST_ID":
                    if ((this.strPopArea == "99") && (this.strManagUnit == "99")) {
                        blnFireReturnEvents = true;
                    } else {
                        this.iNonSpatialTableIndex = 8;
                        this.qry_Non_SpatialTable(strQuery2, "", "Pop_ID");
                    }
                    break;

                case "Pop_ID":
                    if (this.strManagUnit == "99") {
                        blnFireReturnEvents = true;
                    } else {
                        this.iNonSpatialTableIndex = 3;
                        this.qry_Non_SpatialTable(strQuery2, "", "WAFWA_ID");
                    }
                    break;
                case "WAFWA_ID":
                    blnFireReturnEvents = true;
                    break;
            }
            if (blnFireReturnEvents) {   //stop and move on
                if ((this.arrayID != null) || (this.arrayID != undefined)) {
                    if (this.strQuerySaved == null) { this.strQuerySaved = ""; }
                    this.strFinalQuery = this.strQuerySaved;
                    if (this.strQuerySaved !== "") { this.strFinalQuery += " and "; }
                    this.strFinalQuery += strQuery2;
                } else {
                    if (this.strQuerySaved == null) { this.strQuerySaved = ""; }
                    this.strFinalQuery = this.strQuerySaved;
                }
                this.ExecutetheDerivedQuery(this.strFinalQuery, this.divTagSource);
            }
        },
        err: function (err) {
            console.log("Failed to get results due to an error: ", err);
            $(function () {
                $("#dialogWarning1").dialog("open");
            });
        }
    }
    )
    ;
}
);

