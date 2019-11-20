////Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
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
		ddDataSRU: null,
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


        qry_SetUniqueValuesOf: function (strFieldNameText, strFieldNameValue, strFieldImageName, divTag4Results, strQuery) {
            this.divTag4Results = divTag4Results;
            this.strFieldNameText = strFieldNameText;
			this.strFieldNameValue = strFieldNameValue;
			this.strFieldImageName = strFieldImageName;

			arraystrFieldNames = [strFieldNameText, strFieldNameValue];
			if (strFieldImageName != "") {
				arraystrFieldNames.push(strFieldImageName);
			}
            this.strQuery1 = strQuery;

			//var pQueryT = new esri.tasks.QueryTask(this.strURL);
			var pQueryT = new esri.tasks.QueryTask(this.strURL + "?returnDistinctValues=true");
            var pQuery = new esri.tasks.Query();
            pQuery.returnGeometry = false;
			pQuery.outFields = arraystrFieldNames;
            pQuery.where = strQuery;
            return pQueryT.execute(pQuery, this.returnEvents, this.err);
        },


        returnEvents: function (results) {
            var strRemoveStrings = ["", "---select a SRU filter---"];
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
					var imagesSRU = [];
					var strText = "";
					var iValue = "";
					var strImagePath = "";
                    var strValue = "";
                    var testTexts = {};
                    var attrNames = [];
                    var blnAdd2Dropdown;
                    for (var i in featAttrs) { attrNames.push(i); }

					var iCounter111 = 0;

                    dojo.forEach(resultFeatures, function (feature) {//Loop through the QueryTask results and populate an array with the unique values
						iCounter111 += 1;
						blnAdd2Dropdown = false;
                        dojo.forEach(attrNames, function (an) {
							if (an.toLowerCase() == this.app.MH_SRUUniques.strFieldNameText.toString().toLowerCase()) {
                                var strTempText = feature.attributes[an];
                                //if (!testTexts[strTempText]) {    // remove the condition of finding duplication
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
                                //}
                            }
							if (an.toLowerCase() == this.app.MH_SRUUniques.strFieldNameValue.toString().toLowerCase()) {
                                iValue = feature.attributes[an];
							}
							if (an.toLowerCase() == this.app.MH_SRUUniques.strFieldImageName.toString().toLowerCase()) {
								strImagePath = "images/" + feature.attributes[an];
							}
                        });
                        if (blnAdd2Dropdown) {
							if (strText == "") {
								strText = iValue.toString();
							}
                            texts.push(strText);
							values.push(iValue);
							if (this.app.MH_SRUUniques.strFieldImageName != "") {
								imagesSRU.push(strImagePath);
							}
                        } //values.push({ name: zone });
                        strText = "";
						iValue = "";
						strImagePath = "";
                    });

                    if (this.strFieldNameText == "Start_Year") {
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
                        arrayOfNot2ShowActivityValues = ["1900", "1940", "1947", "1960",
                                                         "1973", "1977", "1978", "1979",
                                                         "1980", "1981", "1983", "1984",
                                                         "1985", "1986", "1987", "1988", "1989",
                                                         "1990", "2095", "2098", "2099"];
                        //arrayOfNot2ShowActivityValues = [""];

                        for (var i = 0; i < all.length; i++) {
                            blnShow = true;
                            dojo.forEach(arrayOfNot2ShowActivityValues, function (arrayOfNot2ShowActivityValue) {
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
							if (this.strFieldImageName != "") {
								all.push({ 'T': texts[i], 'V': values[i], 'I': imagesSRU[i] });
							} else {
								all.push({ 'T': texts[i], 'V': values[i] });
							}
                        }
                        if (this.strFieldNameText == "ST_ID") {
                            var temp = "";
                        }
                        all.sort(sortFunction);
                        texts = [];
                        values = [];
						imagesSRU = [];

                        for (var i = 0; i < all.length; i++) {
                            texts.push(all[i].T);
							values.push(all[i].V);
							if (this.strFieldImageName != "") {
								imagesSRU.push(all[i].I);
							}
                        }
                    } 
                }

				

                if ((strdivTag4ResultsID != "") & (strdivTag4ResultsID != strdivTagSourceID)) {
					if (this.divTag4Results.id != "ddlSRU") {
						var strTempValue = this.divTag4Results.options[this.divTag4Results.selectedIndex].text;                //record the existing selection
						this.divTag4Results.options.length = 0; // clear out existing items

						var opt = new Option("All", 99);
						this.divTag4Results.options.add(opt)
						this.divTag4Results.selectedIndex = 0
					} else {
						this.ddDataSRU = [];
					}

					if (values != undefined) {
                        for (var i = 0; i < values.length; i++) {
                            iValue = values[i];

                            var tt = texts[i];
                            if (this.divTag4Results.id == "ddlEntry") {
                                var strDTextTemp = tt.toString();
                            }

							if (this.divTag4Results.id == "ddlSRU") {
								this.ddDataSRU.push({
									text: "SRU ID: " + iValue,
									value: iValue,
									selected: false,
									description: tt,
									imageSrc: imagesSRU[i]
												});
							}

							if (this.divTag4Results.id != "ddlSRU") {
								var opt = new Option(tt, iValue);
								this.divTag4Results.options.add(opt);
							}
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

					if (this.strQuery1 == "1=1") {
                        //do nothing
                    } else {
                        var strQuery2 = "Project_ID in (";
                        for (var i = 0; i < values.length; i++) { strQuery2 += values[i] + ","; }
                        this.strQuery1 = strQuery2.slice(0, -1) + ")";
                    }
                }
            }



			if (this.divTag4Results.id == "ddlSRU") {
				var temp = this.ddDataSRU;

				$('#ddlSRU').ddslick({
					data: this.ddDataSRU,
					width: 320,
					height: 300,
					selectText: "Select your preferred SRU or click SRU on map",
					imagePosition: "right",
					onSelected: function (pData) {
						app.pSup.ddSRUslickSelected(pData.selectedData.value);
					}
				});
			}

            switch (this.strFieldNameText) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
				case "Name":
					this.qry_SetUniqueValuesOf("State", "State", "", document.getElementById("ddlSRUState"), this.strQuery1);
                    break;
				case "State":
					document.getElementById("loadingImg").style.visibility = "hidden";
					disableOrEnableFormElements("dropdownForm", 'select-one', false); //disable/enable to avoid user clicking query options during pending queries
					disableOrEnableFormElements("dropdownForm", 'button', false);  //disable/enable to avoid user clicking query options during pending queries
					//disableOrEnableFormElements("dropdownFormState", 'select-one', false); //disable/enable to avoid user clicking query options during pending queries
					//disableOrEnableFormElements("dropdownFormState", 'button', false);  //disable/enable to avoid user clicking query options during pending queries

					this.iNonSpatialTableIndex = 0; //reset the table index for next time

					if (app.blnInitialLoad == true) {
						app.blnInitialLoad == false;
						app.pSup.Select_dd_basedOnURLParam();
					}
					
					break;
            }

            return results;
        },

        err: function (err) {
            $(function () {
                $("#dialogWarning1").dialog("open");
            });
			console.log("Error number" + String(this.app.MH_SRUUniques.numberOfErrors) + " Failed to get stat results due to an error: " + this.app.MH_SRUUniques.strFieldNameText + this.app.MH_SRUUniques.strFieldNameValue + " " + this.app.MH_SRUUniques.strURL + this.app.iNonSpatialTableIndex, err);
			this.app.MH_SRUUniques.numberOfErrors += 1;
            disableOrEnableFormElements("dropdownForm", 'select-one', false); //disable/enable to avoid user clicking query options during pending queries
            disableOrEnableFormElements("dropdownForm", 'button', false);  //disable/enable to avoid user clicking query options during pending queries

			//disableOrEnableFormElements("dropdownFormState", 'select-one', false); //disable/enable to avoid user clicking query options during pending queries
			//disableOrEnableFormElements("dropdownFormState", 'button', false);  //disable/enable to avoid user clicking query options during pending queries
        }
    });
}
);

