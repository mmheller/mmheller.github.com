﻿////Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

function disableOrEnableFormElements(strFormName, strElementType, TorF) {
	var pform = document.getElementById(strFormName);   // enable all the dropdown menu's while queries are running

	if (pform != null) {
		for (var i = 0; i < pform.elements.length; i++) {
			if (pform.elements[i].type == strElementType) {
				strID = pform.elements[i].id;
				document.getElementById(strID).disabled = TorF;
			}
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
        if (isNaN(a.T)) {
            var textA = a.T.toUpperCase();
            var textB = b.T.toUpperCase();
        }
        else {
            var textA = a.T;
            var textB = b.T;
        }

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


		qry_SetUniqueValuesOf: function (strFieldNameText, strFieldNameValue, divTag4Results, strQuery) {
            this.divTag4Results = divTag4Results;
            this.strFieldNameText = strFieldNameText;
            this.strFieldNameValue = strFieldNameValue;
            this.strQuery1 = strQuery;

            var pQueryT = new esri.tasks.QueryTask(this.strURL + this.iNonSpatialTableIndex + "?returnDistinctValues=true");
            var pQuery = new esri.tasks.Query();
            pQuery.returnGeometry = false;
            pQuery.outFields = [strFieldNameText, strFieldNameValue];
            pQuery.where = strQuery;
            return pQueryT.execute(pQuery, this.returnEvents, this.err);
        },


        returnEvents: function (results) {
            var strRemoveStrings = ["", "---select an effort type---"];
            var resultFeatures = results.features;
            var strdivTagSourceID = "";
            var strText = "";

            if ((this.divTagSource != "") & (this.divTagSource != null)) {
                strdivTagSourceID = this.divTagSource.target.id;
            }
            
            var strdivTag4ResultsID = "";
            if (this.divTag4Results != null) {
                strdivTag4ResultsID = this.divTag4Results.id;
            }
            

            if ((resultFeatures != null) || (resultFeatures != undefined)) {
                if (resultFeatures.length > 0) {
                    var featAttrs = resultFeatures[0].attributes;
                    var values = [];
                    var texts = [];

                    var strValue = "";
                    var testTexts = {};
                    var attrNames = [];
                    var blnAdd2Dropdown;
                    for (var i in featAttrs) { attrNames.push(i); }

                    dojo.forEach(resultFeatures, function (feature) {//Loop through the QueryTask results and populate an array with the unique values
                        blnAdd2Dropdown = false;
                        dojo.forEach(attrNames, function (an) {
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
                                        if (strText.toString != undefined)   {
                                            if (isNaN(strText)){
                                                if (strText.toString() == "null or undefined") {
                                                    blnAdd2Dropdown = false;
                                                }
                                                else if (str2remove.toLowerCase() == strText.toString().toLowerCase()) {
                                                    blnAdd2Dropdown = false;
                                                }
                                            }
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

					if ((this.strFieldNameText == "Start_Year") | (this.strQuery1 == "Theme = 'StartYear'")) {
                        var all = [];
                        for (var i = 0; i < values.length; i++) {
                            all.push({ 'T': texts[i], 'V': values[i] });
                        }

                        all.sort(sortFunction);
                        texts = [];
                        values = [];
                        arrayOfNot2ShowActivityValues = ["1900", "1940", "1947", "1960",
                                                         "1973", "1977", "1978", "1979",
                                                         "1980", "1981", "1983", "1984",
                                                         "1985", "1986", "1987", "1988", "1989",
                                                         "1990", "2095", "2098", "2099"];
                        //arrayOfNot2ShowActivityValues = [""];

                        for (var i = 0; i < all.length; i++) {
                            blnShow = true;
							dojo.forEach(arrayOfNot2ShowActivityValues, function (arrayOfNot2ShowActivityValue) {
								if (all[i].T == "2099"){
									var stop = true;
								}

                                if ((arrayOfNot2ShowActivityValue == all[i].T) | (arrayOfNot2ShowActivityValue == all[i].V)) {
                                    blnShow = false;
                                }
                            });
							if (blnShow) {
                                texts.push(all[i].T);
                                values.push(all[i].V);
                            }
                        }
                    }
                    else if (this.strFieldNameText != "Project_ID") {
                        var all = [];
                        for (var i = 0; i < values.length; i++) {
                            all.push({ 'T': texts[i], 'V': values[i] });
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
                            }

                            this.divTag4Results.options.add(new Option(tt, iValue))
                            if ((strTempValue == tt) & (strdivTagSourceID != "")) {
                                this.divTag4Results.selectedIndex = i + 1
                            }
                        }
                    }
                }
                else if (this.strFieldNameText == "Project_ID") {
                    if (values == undefined) {
                        var strstop = ""; 
                    }

                    if (this.strQuery1 == "OBJECTID > 0") {
                        //do nothing
                    } else {
                        var strQuery2 = "Project_ID in (";
                        for (var i = 0; i < values.length; i++) { strQuery2 += values[i] + ","; }
                        this.strQuery1 = strQuery2.slice(0, -1) + ")";
                    }
                }
            }

			var strDescField, strIDField, strQuery;

			if (app.blnInitialLoadOrSpatialCleared == true) {
				switch (this.strQuery1) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
					case "Theme = 'StartYear'":
						strDescField = "Value";
						strIDField = "Value_ID";
						strQuery = "Theme = 'Activity'";
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlActivity"), strQuery);
						break;
					case "Theme = 'Activity'":   // this project_ID query needs to happen here to make sure the query for the related tables works
						strDescField = "Value";
						strIDField = "Value_ID";
						strQuery = "Theme = 'SubActivity'";
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlSubActivity"), strQuery);
						break;
					case "Theme = 'SubActivity'":   // this project_ID query needs to happen here to make sure the query for the related tables works
						strDescField = "Value";
						strIDField = "Value_ID";
						strQuery = "Theme = 'Prj_Status'";
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlEntry"), strQuery);
						break;
					case "Theme = 'Prj_Status'":
						strDescField = "Value";
						strIDField = "Value_ID";
						strQuery = "Theme = 'Imp_Party'";
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlImpParty"), strQuery);
						break;
					case "Theme = 'Imp_Party'":
						strDescField = "Value";
						strIDField = "Value_ID";
						strQuery = "Theme = 'Office'";
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlOffice"), strQuery);
						break;
					case "Theme = 'Office'":
						strDescField = "Value";
						strIDField = "Value_ID";
						strQuery = "Theme = 'State'";
						this.strURL = app.strInitialLoad_URL;
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlState"), strQuery);
						break;
					case "Theme = 'State'":
						strDescField = "Value";
						strIDField = "Value_ID";
						strQuery = "Theme = 'Pop'";
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlPopArea"), strQuery);
						break;
					case "Theme = 'Pop'":
						strDescField = "Value";
						strIDField = "Value_ID";
						strQuery = "Theme = 'WAFWA'";
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlManagUnit"), strQuery);
						break;
					case "Theme = 'WAFWA'":
						document.getElementById("ImgResultsLoading").style.visibility = "hidden";
						disableOrEnableFormElements("dropdownForm", 'select-one', false); //disable/enable to avoid user clicking query options during pending queries
						disableOrEnableFormElements("dropdownForm", 'button', false);  //disable/enable to avoid user clicking query options during pending queries
						disableOrEnableFormElements("dropdownForm", 'radio', false);  //disable/enable to avoid user clicking query options during pending queries

						if (app.strModule == "GRSG") {
							this.strQuery1 = "((SRU_ID IS NULL) OR (SRU_ID = 0)) and (typeact = 'Spatial Project')";
						}
						if (app.strModule == "GUSG") {
							this.strQuery1 = "((Private_Lands IS NULL) OR (Private_Lands = '0')) and (typeact = 'Spatial Project')";
						}

						this.strURL = app.strTheme1_URL;
						app.pFC.GetCountOfFCDef_ShowText(this.strQuery1, this.strURL + 0, "txtQueryResults", "count", "project_id", "");

						this.iNonSpatialTableIndex = 0; //reset the table index for next time
						app.blnInitialLoadOrSpatialCleared = false;
						break;
				}
			} else {
				switch (this.strFieldNameText) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
					case "Start_Year":
						strDescField = "Activity";
						strIDField = "ACT_ID";
						strQuery = this.strQuery1;
						//this.qry_SetUniqueValuesOf("Activity", "ACT_ID", document.getElementById("ddlActivity"), this.strQuery1);

						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlActivity"), strQuery);
						break;

					case "Activity":   // this project_ID query needs to happen here to make sure the query for the related tables works
						strDescField = "SubActivity";
						strIDField = "SACT_ID";
						strQuery = this.strQuery1;
						//this.qry_SetUniqueValuesOf("SubActivity", "SACT_ID", document.getElementById("ddlSubActivity"), this.strQuery1);

						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlSubActivity"), strQuery);
						break;

					case "SubActivity":   // this project_ID query needs to happen here to make sure the query for the related tables works
						strDescField = "Prj_Status_Desc";
						strIDField = "Project_Status";
						strQuery = this.strQuery1;
						//this.qry_SetUniqueValuesOf("Prj_Status_Desc", "Project_Status", document.getElementById("ddlEntry"), this.strQuery1);

						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlEntry"), strQuery);
						break;

					case "Prj_Status_Desc":
						strDescField = "Implementing_Party";
						strIDField = "IP_ID";
						strQuery = this.strQuery1;
						//this.qry_SetUniqueValuesOf("Implementing_Party", "IP_ID", document.getElementById("ddlImpParty"), this.strQuery1);

						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlImpParty"), strQuery);
						break;

					case "Implementing_Party":
						strDescField = "Office";
						strIDField = "FO_ID";
						strQuery = this.strQuery1;
						//this.qry_SetUniqueValuesOf("Office", "FO_ID", document.getElementById("ddlOffice"), this.strQuery1);
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlOffice"), strQuery);
						break;

					case "Office":
						strDescField = "Project_ID";
						strIDField = "Project_ID";
						strQuery = this.strQuery1;
						//this.qry_SetUniqueValuesOf("Project_ID", "Project_ID", null, this.strQuery1);
						
						this.qry_SetUniqueValuesOf(strDescField, strIDField, null, strQuery);
						break;

					case "Project_ID":
						strDescField = "State";
						strIDField = "ST_ID";
						strQuery = this.strQuery1;
						//this.qry_SetUniqueValuesOf("State", "ST_ID", document.getElementById("ddlState"), this.strQuery1);
						this.iNonSpatialTableIndex = (9 + app.iIncrementHFL);
						
						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlState"), strQuery);
						break;
					case "State":
						strDescField = "Pop_Name";
						strIDField = "Pop_ID";
						strQuery = this.strQuery1;
						//this.qry_SetUniqueValuesOf("Pop_Name", "Pop_ID", document.getElementById("ddlPopArea"), this.strQuery1);
						this.iNonSpatialTableIndex = (8 + app.iIncrementHFL);

						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlPopArea"), strQuery);
						break;
					case "Pop_Name":
						strDescField = "WAFWA_Zone";
						strIDField = "WAFWA_ID";
						strQuery = this.strQuery1;
						//this.qry_SetUniqueValuesOf("WAFWA_Zone", "WAFWA_ID", document.getElementById("ddlManagUnit"), this.strQuery1);
						this.iNonSpatialTableIndex = (3 + app.iIncrementHFL);

						this.qry_SetUniqueValuesOf(strDescField, strIDField, document.getElementById("ddlManagUnit"), strQuery);
						break;
					case "WAFWA_Zone":
						document.getElementById("ImgResultsLoading").style.visibility = "hidden";
						disableOrEnableFormElements("dropdownForm", 'select-one', false); //disable/enable to avoid user clicking query options during pending queries
						disableOrEnableFormElements("dropdownForm", 'button', false);  //disable/enable to avoid user clicking query options during pending queries
						disableOrEnableFormElements("dropdownForm", 'radio', false);  //disable/enable to avoid user clicking query options during pending queries

						app.pFC.GetCountOfFCDef_ShowText(this.strQuery1, this.strURL + 0, "txtQueryResults", "count", "project_id", "");

						this.iNonSpatialTableIndex = 0; //reset the table index for next time

						break;
				}
			}


            return results;
        },

        err: function (err) {
            $(function () {
                $("#dialogWarning1").dialog("open");
            });
            console.log("Error number" + String(this.app.PS_Uniques.numberOfErrors) + " Failed to get stat results due to an error: " + this.app.PS_Uniques.strFieldNameText + this.app.PS_Uniques.strFieldNameValue + " " + this.app.PS_Uniques.strURL + this.app.iNonSpatialTableIndex, err);
            this.app.PS_Uniques.numberOfErrors += 1;
            disableOrEnableFormElements("dropdownForm", 'select-one', false); //disable/enable to avoid user clicking query options during pending queries
			disableOrEnableFormElements("dropdownForm", 'button', false);  //disable/enable to avoid user clicking query options during pending queries
			disableOrEnableFormElements("dropdownForm", 'radio', false);  //disable/enable to avoid user clicking query options during pending queries

    //        $(function () {
    //            $('.divOpenStats').click(function () {
    //                app.pSup.openCEDPSummary();
				//});
				//$("#btn_Report").prop("disabled", false);
    //        });
        }
    });
}
);

