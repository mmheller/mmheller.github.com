//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014

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
            disableOrEnableFormElements("dropdownForm", 'select-one', true);  //disable/enable to avoid user clicking query options during pending queries
            disableOrEnableFormElements("dropdownForm", 'button', true);  //disable/enable to avoid user clicking query options during pending queries
            this.strHTML_ID = strHTML_ID;
            this.strURLStored = strURL;

            if (this.strHTML_ID != "txtQueryResults") {
                var temp = "";
            }

            this.strQueryStored = strQuery;
            var pQueryTask = new esri.tasks.QueryTask(strURL + "?returnCountOnly=true");
            var pQuery = new esri.tasks.Query();

            pQuery.returnGeometry = false;
            //var strQuery = pLayer.getDefinitionExpression();
            strQuery = strQuery.replace(" and ((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1))", "");
            if (strQuery == "(SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)") {
                strQuery = "(objectid > 0) ";
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
            //strDispaly = iStatValue + " Results";
            if (this.strHTML_ID == "txtQueryResults") {
                strDispaly = strDispaly + " Results";
                if (iStatValue > 1000) {
                    strDispaly += "<br> Note: Limits displaying over 1000 features, zoom into area of interest or add filters to handle display limits"
                }
            }

            document.getElementById(this.strHTML_ID).innerHTML = strDispaly;

            switch (this.strHTML_ID) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
                case "txtQueryResults":
                    //app.PS_Uniques.qry_SetUniqueValuesOf("TypeAct", "TypeAct", document.getElementById("ddlMatrix"));
                    app.pFC.GetCountOfFCDef_ShowText(this.strQueryStored, this.strURLStored + "0", "dTotalProjectsQ", "count", "project_id", " and (typeact = 'Project')");
                    break;
                case "dTotalProjectsQ":
                    app.pFC.GetCountOfFCDef_ShowText(this.strQueryStored, this.strURLStored + "0", "dTotalPlansQ", "count", "project_id", " and (typeact = 'Plan')");
                    break;
                case "dTotalPlansQ":
                    //app.pFC.GetCountOfFCDef_ShowText(this.m_strCED_PP_pointQuery, this.strURL + "0", "dTotalProjects", "count", "project_id", " and (typeact = 'Project')");
                    disableOrEnableFormElements("dropdownForm", 'select-one', false) //disable/enable to avoid user clicking query options during pending queries
                    disableOrEnableFormElements("dropdownForm", 'button', false);  //disable/enable to avoid user clicking query options during pending queries

                    app.gQuerySummary.Summarize(this.strQueryStored, "", false);

                    break;
            }


            //var pform = document.getElementById("dropdownForm");   // enable all the dropdown menu's while queries are running
            //for (var i = 0; i < pform.elements.length; i++) {
            //    if (pform.elements[i].type == 'select-one') {
            //        strID = pform.elements[i].id;
            //        document.getElementById(strID).disabled = false;
            //    }
            //}
        },


        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);

            this.app.pFC.numberOfErrors += 1;

            if (this.app.pFC.numberOfErrors < 5) {
                this.app.pFC.GetCountOfFCDef_ShowText(this.app.pFC.strQueryStored, this.app.pFC.strURLStored, "txtQueryResults", "count", "project_id");
            }
        }
    }
    );
}
);

