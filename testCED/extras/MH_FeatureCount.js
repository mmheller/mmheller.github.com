//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

function disableOrEnableFormElements(strFormName, strElementType, TorF) {
    var pform = document.getElementById(strFormName);   // enable all the dropdown menu's while queries are running
    for (var i = 0; i < pform.elements.length; i++) {
        if (pform.elements[i].type == strElementType) {
            strID = pform.elements[i].id;
            document.getElementById(strID).disabled = TorF;
        }
    }
}


define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
], function (
  declare, lang, esriRequest
) {

    return declare([], {
        divTag4Results: null,
        numberOfErrors: 0,
        strQueryStored: null,
        strURLStored: null,

        constructor: function (options) {// specify class defaults
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
            this.divTag4Results = options.divTag4Results || null;
        },



        GetCountOfFCDef_ShowText: function (strQuery, strURL, strHTML_ID, strStatType, strFieldName, strAddedQueryString) {
            this.strHTML_ID = strHTML_ID;
            disableOrEnableFormElements("dropdownForm", 'select-one', true);  //disable/enable to avoid user clicking query options during pending queries
            disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries
            $(".divOpenStats").prop("onclick", null).off("click");

            this.strURLStored = strURL;
            this.strQueryStored = strQuery;
            var pQueryTask = new esri.tasks.QueryTask(strURL + "?returnCountOnly=true");
            var pQuery = new esri.tasks.Query();

            pQuery.returnGeometry = false;
            strQuery = strQuery.replace(" and (((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))", "");
            if (strQuery == "((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))") {
                strQuery = "(OBJECTID > 0) ";
            }

            if (strAddedQueryString != "") {
                strQuery += strAddedQueryString;
            }
            pQuery.where = strQuery;
            pQuery.returnGeometry = false;
            return pQueryTask.execute(pQuery, this.returnEvents, this.err);
        },

        returnEvents: function (results) {
            var iStatValue = results.count;
            strDispaly = iStatValue.toString();
            if (this.strHTML_ID == "txtQueryResults") {
                strDispaly = strDispaly + " Resulting Efforts";
            }

            document.getElementById(this.strHTML_ID).innerHTML = strDispaly;

            switch (this.strHTML_ID) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
                case "txtQueryResults":
                    disableOrEnableFormElements("dropdownForm", 'select-one', false); //disable/enable to avoid user clicking query options during pending queries
                    disableOrEnableFormElements("dropdownForm", 'button', false);  //disable/enable to avoid user clicking query options during pending queries
                    //$(".divOpenStats").prop("onclick", null).off("click");
                    $(function () {
                        $('.divOpenStats').click(function () {
                            app.pSup.openCEDPSummary();
                        });
                    });

                    this.strHTML_ID = "dTotalProjectsQ"; //this is redundant but having issues with some of the callbacks ie. GRSG pop area = Crab Creek

                    app.pFC.GetCountOfFCDef_ShowText(this.strQueryStored, this.strURLStored + "0", "dTotalProjectsQ", "count", "project_id", " and (typeact = 'Spatial Project')");
                    break;
                case "dTotalProjectsQ":
                    if (iStatValue == 0) {
                        document.getElementById("txt_NoSpatial").style.visibility = 'visible';
                    } else {
                        document.getElementById("txt_NoSpatial").style.visibility = 'hidden';
                    }
                    this.strHTML_ID = "dTotalPlansQ"; //this is redundant but having issues with some of the callbacks ie. GRSG pop area = Crab Creek
                    app.pFC.GetCountOfFCDef_ShowText(this.strQueryStored, this.strURLStored + "0", "dTotalNonProjectsQ", "count", "project_id", " and (typeact = 'Non-Spatial Project')");
                    break;

                case "dTotalNonProjectsQ":
                    this.strHTML_ID = "dTotalPlansQ"; //this is redundant but having issues with some of the callbacks ie. GRSG pop area = Crab Creek
                    app.pFC.GetCountOfFCDef_ShowText(this.strQueryStored, this.strURLStored + "0", "dTotalPlansQ", "count", "project_id", " and (typeact = 'Non-Spatial Plan')");
                    break;

                case "dTotalPlansQ":
                    app.gQuerySummary.Summarize(this.strQueryStored, "", false);

                    break;
            }
        },

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
            this.app.pFC.numberOfErrors += 1;
            $(function () {
                $("#dialogWarning1").dialog("open");
            });
            if (this.app.pFC.numberOfErrors < 5) {
                this.app.pFC.GetCountOfFCDef_ShowText(this.app.pFC.strQueryStored, this.app.pFC.strURLStored, "txtQueryResults", "count", "project_id");
            }
        }
    }
    );
}
);

