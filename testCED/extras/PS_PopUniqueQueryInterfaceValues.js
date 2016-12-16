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
  "esri/request"
], function (
  declare, lang, esriRequest
) {

    function trimStringWhiteSpace(str) {
        return str.replace('     ', ' ').replace('    ', ' ').replace('  ', ' ');
    }

    function sortFunction(a, b) {
        var textA = a.T.toUpperCase();
        var textB = b.T.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    }

    return declare([], {
        strURL: null,
        strContaminant: null,
        strMatrix: null,
        strManagUnit: null,
        strDataType: null,
        iNonSpatialTableIndex: 0,
        divTag4Results: null,
        strFieldNameText: null,
        strFieldNameValue: null,
        strQuery1: null,
        strQuery2: null,
        divTagSource: null,
        numberOfErrors: 0,

        constructor: function (options) {            // specify class defaults
            this.strURL = options.strURL || "test";
            this.strContaminant = options.strContaminant || "20mi"; // default seat geek range is 30mi
            this.strMatrix = options.strMatrix || ""; // default to 50 results per page
            this.strManagUnit = options.strManagUnit || "";
            this.strDataType = options.strDataType || "";
            this.iNonSpatialTableIndex = options.iNonSpatialTableIndex || 0;
            this.divTag4Results = options.divTag4Results || null;
            this.returnEvents = lang.hitch(this, this.returnEvents);
            this.returnEvents2 = lang.hitch(this, this.returnEvents2);
            this.strQuery1 = options.strQuery1 || "";
            this.divTagSource = options.divTagSource || "";
            this.m_strCED_PP_pointQuery = null;
        },


        qry_SetUniqueValuesOf: function (strFieldNameText, strFieldNameValue, divTag4Results) {
            
            this.divTag4Results = divTag4Results;
            this.strFieldNameText = strFieldNameText;
            this.strFieldNameValue = strFieldNameValue;
            var strQuery = "";
            var pQueryT = new esri.tasks.QueryTask(this.strURL + this.iNonSpatialTableIndex + "?returnDistinctValues=true");
            var pQuery = new esri.tasks.Query();
            pQuery.returnGeometry = false;
            pQuery.outFields = [this.strFieldNameText, this.strFieldNameValue];
            pQuery.where = this.strQuery1;

            if (this.strFieldNameValue == "WAFWA_Zone") {
                var strstop = "";
            }
            return pQueryT.execute(pQuery, this.returnEvents, this.err);
        },


        returnEvents: function (results) {
            if (this.strFieldNameValue == "WAFWA_Zone") {
                var strstop = "";
            }
            var strRemoveStrings = ["", "---select an effort type---"];
            var resultFeatures = results.features;
            var strdivTagSourceID = "";
            if ((this.divTagSource != "") & (this.divTagSource != null)) {
                strdivTagSourceID = this.divTagSource.srcElement.id;
            }
            var strdivTag4ResultsID = "";
            if (this.divTag4Results != null) {
                strdivTag4ResultsID = this.divTag4Results.id;
            }

            if ((resultFeatures != null) || (resultFeatues != undefined)) {
                if (resultFeatures.length > 0) {
                    var featAttrs = resultFeatures[0].attributes;
                    var values = [];
                    var texts = [];
                    var strText = "";
                    var strValue = "";
                    var testTexts = {};
                    var attrNames = [];
                    var blnAdd2Dropdown;
                    for (var i in featAttrs) { attrNames.push(i); }

                    dojo.forEach(resultFeatures, function (feature) {//Loop through the QueryTask results and populate an array with the unique values
                        blnAdd2Dropdown = false;
                        dojo.forEach(attrNames, function (an) {
                            if (this.app.PS_Uniques.strFieldNameValue == "ST_ID") {
                                var strstop = "";
                            }

                            if (an.toLowerCase() == this.app.PS_Uniques.strFieldNameText.toString().toLowerCase()) {
                                var strTempText = feature.attributes[an];
                                if (!testTexts[strTempText]) {
                                    testTexts[strTempText] = true;

                                    strText = strTempText;
                                    if ((strText == null) || (strText == undefined)) {
                                        strText = "null or undefined";
                                    }
                                    blnAdd2Dropdown = true;
                                    dojo.forEach(strRemoveStrings, function (str2remove) {  //check to see if should add to the values for the dropdown list
                                        if (strText.toString != undefined) {
                                            if (str2remove.toLowerCase() == strText.toString().toLowerCase()) { blnAdd2Dropdown = false; }
                                        }
                                        else { console.log("error with: if (strValue.toString != undefined) {"); }
                                    });
                                }
                            }
                            if (an.toLowerCase() == this.app.PS_Uniques.strFieldNameValue.toString().toLowerCase()) {
                                iValue = feature.attributes[an];
                            }
                        });
                        if (blnAdd2Dropdown) {
                            if (strText == "") { strText = iValue.toString(); }
                            texts.push(strText);
                            values.push(iValue);
                        } //values.push({ name: zone });
                        strText = "";
                        iValue = "";
                    });
                    //values.sort();

                    if (this.strFieldNameText != "Project_ID") {
                        var all = [];
                        for (var i = 0; i < values.length; i++) {
                            all.push({ 'T': texts[i], 'V': values[i] });
                        }
                        if (this.strFieldNameText == "ST_ID") {
                            var temp = "";
                        }
                        all.sort(sortFunction);
                        texts = [];
                        values = [];

                        for (var i = 0; i < all.length; i++) {
                            texts.push(all[i].T);
                            values.push(all[i].V);
                        }
                    }
                }

                if ((strdivTag4ResultsID != "") & (strdivTag4ResultsID != strdivTagSourceID)) {
                    //                    if (this.strFieldNameValue == "ST_ID") {
                    //                        var strstop = "";
                    //                    }
                    var strTempValue = this.divTag4Results.options[this.divTag4Results.selectedIndex].text;                //record the existing selection
                    this.divTag4Results.options.length = 0; // clear out existing items
                    this.divTag4Results.options.add(new Option("All", 99))
                    this.divTag4Results.selectedIndex = 0
                    if (values != undefined) {
                        for (var i = 0; i < values.length; i++) {
                            iValue = values[i];

                            var tt = texts[i];
                            if (this.divTag4Results.id == "ddlEntry") {
                                var strDTextTemp = tt.toString();
                                var strDText = strDTextTemp.replace("1", "Planned").replace("2", "In Progress").replace("3", "Completed");
                                this.divTag4Results.options.add(new Option(strDText, iValue));
                                if ((strTempValue == strDText) & (strdivTagSourceID != "")) {
                                    this.divTag4Results.selectedIndex = i
                                }
                            } else {
                                //                                if (this.strFieldNameValue == "ST_ID") {
                                //                                    iValue = iValue.toString();
                                //                                }

                                this.divTag4Results.options.add(new Option(tt, iValue))
                                if ((strTempValue == tt) & (strdivTagSourceID != "")) {
                                    this.divTag4Results.selectedIndex = i + 1
                                }
                            }
                        }
                    }
                }
                else if (this.strFieldNameText == "Project_ID") {
                    if (values == undefined) {
                        var strstop = ""; 
                    }

                    var strQuery2 = "Project_ID in (";
                    for (var i = 0; i < values.length; i++) { strQuery2 += values[i] + ","; }
                    this.strQuery1 = strQuery2.slice(0, -1) + ")";
                }
            }
            switch (this.strFieldNameText) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
                case "TypeAct":
                    this.qry_SetUniqueValuesOf("implementing_party", "IP_ID", document.getElementById("ddlImpParty"));
                    break;
                case "implementing_party":
                    this.qry_SetUniqueValuesOf("office", "FO_ID", document.getElementById("ddlOffice"));
                    break;
                case "office":
                    this.qry_SetUniqueValuesOf("entry_type", "entry_type", document.getElementById("ddlEntry"));
                    break;
                case "entry_type":
                    this.qry_SetUniqueValuesOf("activity", "ACT_ID", document.getElementById("ddlActivity"));
                    break;
                case "activity":
                    this.qry_SetUniqueValuesOf("Project_ID", "Project_ID", null);
                    break;
                case "Project_ID":
                    this.iNonSpatialTableIndex = 9;
                    this.qry_SetUniqueValuesOf("State", "ST_ID", document.getElementById("ddlState"));
                    break;
                case "State":
                    this.iNonSpatialTableIndex = 8;
                    this.qry_SetUniqueValuesOf("Pop_Name", "Pop_ID", document.getElementById("ddlPopArea"));
                    break;
                case "Pop_Name":
                    this.iNonSpatialTableIndex = 3;
                    this.qry_SetUniqueValuesOf("WAFWA_Zone", "WAFWA_ID", document.getElementById("ddlManagUnit"));
                    break;
                case "WAFWA_Zone":
                    document.getElementById("ImgResultsLoading").style.visibility = "hidden";
                    disableOrEnableFormElements("dropdownForm", 'select-one', false) //disable/enable to avoid user clicking query options during pending queries
                    disableOrEnableFormElements("dropdownForm", 'button', false);  //disable/enable to avoid user clicking query options during pending queries

                    ////not due to max record count not being increased yet, not going with ....this.strQuery1
                    //app.pFC.GetCountOfFCDef_ShowText(this.m_strCED_PP_pointQuery, this.strURL + "0", "dTotalProjects", "count", "project_id", " and (typeact = 'Project')");
                    break;
            }

            return results;
        },

        err: function (err) {
            console.log("Error number" + String(this.app.PS_Uniques.numberOfErrors) + " Failed to get stat results due to an error: " + this.app.PS_Uniques.strFieldNameText + this.app.PS_Uniques.strFieldNameValue + " " + this.app.PS_Uniques.strURL + this.app.iNonSpatialTableIndex, err);
            this.app.PS_Uniques.numberOfErrors += 1;
            
            if (this.app.PS_Uniques.numberOfErrors < 5) {
                this.app.PS_Uniques.qry_SetUniqueValuesOf("TypeAct", "TypeAct", document.getElementById("ddlMatrix"));
            }
        }
    });
}
);

