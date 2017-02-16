//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        July 2015

function formatDate_and_AddDays(value, iDays) {
    var inputDate = new Date(value);

    inputDate.setDate(inputDate.getDate() + iDays);

    return dojo.date.locale.format(inputDate, {
        selector: 'date',
        datePattern: 'MM/dd/yyyy'
    });
}

function GetMinOrMaxDateRangefromFishCheckboxes(strMinOrMax) {
    var dteMin = null;
    var dteMax = null;
    var pform = document.getElementById("NavigationForm");
    for (var i = 0; i < pform.elements.length; i++) {  //loop through the checkboxes of the form and determin if one of the ones to click
        if (pform.elements[i].type == 'checkbox') {
            if ((pform.elements[i].checked) & (pform.elements[i].id != "cbx_FilterValues") & (pform.elements[i].parentElement.parentElement.id != "GISLayerContent")) {
                strID = pform.elements[i].id;
                strDateRange = document.getElementById(strID).name;
                strDateRange = strDateRange.substring(strDateRange.indexOf(")") + 1, strDateRange.length);
                dteDateFrom = new Date(strDateRange.substring(0, strDateRange.indexOf("-")));
                strDateTo = strDateRange.substring(strDateRange.indexOf("-") + 1), strDateRange.length;
                dteDateTo = new Date(strDateTo);

                if ((dteMin == null) | (dteDateFrom < dteMin)) {
                    dteMin = dteDateFrom;
                }
                if ((dteMax == null) | (dteDateTo > dteMax)) {
                    dteMax = dteDateTo;
    }   }   }    }
    
    if (strMinOrMax == "min"){
        return dteMin;
    }else{
        return dteMax;
    }
}

function StartQuery(blnSelect) {    //loop through the checkboxes and disable, so user interaction dosen't disrupt the queryies
    if (!(document.getElementById("cbx_FilterValues").checked)) {   // if not going to filter GUI filter options then run through the text of the checked options to get min/max date
        dteMin = GetMinOrMaxDateRangefromFishCheckboxes("min");
        if (dteMin != null) {
            $("#datepickerFrom").datepicker("setDate", dteMin);
        }
        dteMax = GetMinOrMaxDateRangefromFishCheckboxes("max");
        if (dteMax != null) {
            $("#datepickerTo").datepicker("setDate", dteMax);
        }
    }

    if ((app.slider != null) || (app.slider != undefined)) {
        app.slider.pause();
    }
    arrayCheckedCheckboxes = [];
    var pform = document.getElementById("NavigationForm");
    for (var i = 0; i < pform.elements.length; i++) {
        if (pform.elements[i].type == 'checkbox') {
            strID = pform.elements[i].id;
            document.getElementById(strID).disabled = true;
        }
    }

    var strQuery = "";
    var arrayQuery = this.app.gCQD.Return_InitialQueryDefs();
    if (arrayQuery.length > 0){
        var strQueryArray = arrayQuery[0];
        strQuery = strQueryArray[1];
    }else{
        strQuery = "OBJECTID < 0";
    }

    if (document.getElementById("cbx_FilterValues").checked) {
        this.app.gSup.Phase1(app.strTheme1_URL, [], strQuery);
    } else {
        app.pMapSup.QueryZoom(strQuery);
    }
}


function ClearThenStartQuery(strContainterID) {    //loop through the checkboxes and disable, so user interaction dosen't disrupt the queryies
    app.map.graphics.clear();
    app.map.infoWindow.hide();
    var pContainter = document.getElementById(strContainterID);    //clear out the checkboxes from the container that houses the clicked clear button
    for (var i = 0; i < pContainter.childNodes.length; i++) {
        if (pContainter.childNodes[i].type == 'checkbox') {
            strID = pContainter.childNodes[i].id;
            document.getElementById(strID).checked = false;
        }
    }
    arrayCheckedCheckboxes = [];
    var pform = document.getElementById("NavigationForm");
    for (var ii = 0; ii < pform.elements.length; ii++) {
        if (pform.elements[ii].type == 'checkbox') {
            strID = pform.elements[ii].id;
            document.getElementById(strID).disabled = true
        }
    }
    var strQuery = "";
    var arrayQuery = this.app.gCQD.Return_InitialQueryDefs();
    //app.gQuery.SendQuery(arrayQuery, 0);
    this.app.gSup.Phase1(app.strTheme1_URL, [], "OBJECTID > 0");
}


function AddCheckbox(strContainerDivID, strNewID, strValueField, strLableText, blnChecked, blnDisabled) {
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = strNewID;
    cb.name = strLableText;
    cb.value = strValueField;
    cb.checked = blnChecked;
    cb.disabled = blnDisabled;
    cb.onclick = function (evt) { StartQuery(evt); }
    var text = document.createTextNode(strLableText);
    document.getElementById(strContainerDivID).appendChild(cb);
    document.getElementById(strContainerDivID).appendChild(text);
    var br = document.createElement("br");
    document.getElementById(strContainerDivID).appendChild(br);
}


function AddClearButton(strContainerDivID, strNewID, strValueField, strLableText, blnDisabled, strButtonVis) {
    var btn = document.createElement("input");
    btn.type = "button";
    btn.id = strNewID;
    btn.name = strLableText;
    btn.value = strValueField;
    btn.disabled = blnDisabled;
    btn.onclick = function (evt) { ClearThenStartQuery(strLableText); }
    btn.style.cssText = 'background-color:white;padding: 0; border: none; background: none; font-size:.85em; color:#2E2E2E; text-decoration:underline;';
    btn.style.visibility = strButtonVis;

    var text = document.createTextNode(strLableText);
    document.getElementById(strContainerDivID).appendChild(btn);
}

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request", "esri/tasks/query", "esri/tasks/QueryTask", "extras/MH_MapSetup",
], function (
  declare, lang, esriRequest, Query, QueryTask, MH_MapSetup
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
        strContainerDivID: null,
        strFieldNameText: null,
        strFieldNameValue: null,
        strNewDivID: null,
        arrayQueryStringsPerTable: null,
        iTableIndex: null,
        strURL: null,
        m_arrayCheckedCheckboxes: null,
        iCountofRangeCheckboxes2check: null,
        m_array_qry_Query4UniquesAndCheckBoxes: null,
        m_index_qry_Query4UniquesAndCheckBoxes: null,
        m_array_qry_SetRangeCheckboxes: null,
        m_index_qry_SetRangeCheckboxes: null,
        blnShowAdvancedFilter: null,

        constructor: function (options) {
            this.blnShowAdvancedFilter = options.blnShowAdvancedFilter || false; // default AGS REST URL
        },

        Phase1: function (strURL, arrayQueryStringsPerTable, strQuery) {
            document.getElementById("loadingImg").style.visibility = "visible";
            esri.show(app.loading);
            ////esri.hide(app.loading);
            // get date range from checkboxes


            this.strURL = strURL;
            this.numberOfErrors = 0;
            this.arrayQueryStringsPerTable = arrayQueryStringsPerTable;
            if (arrayQueryStringsPerTable.length < 1) {
                for (var i = 0; i < 5; i++) {
                    this.arrayQueryStringsPerTable.push(strQuery);
                }
            }
            arrayCheckedCheckboxes = []; //populate an array of checked checkboxes
            if (strQuery != "OBJECTID > 0") {  //if initial query or clear'ing then don't store the checked boxes
                var pform = document.getElementById("NavigationForm");
                for (var i = 0; i < pform.elements.length; i++) {  //loop through the checkboxes of the form and determin if one of the ones to click
                    if (pform.elements[i].type == 'checkbox') {
                        if (pform.elements[i].checked) {
                            strID = pform.elements[i].id;
                            arrayCheckedCheckboxes.push(strID);
                        }
                    }
                }
            }
            this.m_arrayCheckedCheckboxes = arrayCheckedCheckboxes;

            p_array_qry_Query4UniquesAndCheckBoxes = [];
            p_array_qry_Query4UniquesAndCheckBoxes.push([0, this.arrayQueryStringsPerTable[0], "FishID", "FishID", 'section3content', "0" + "-FishID"]);
            if (this.blnShowAdvancedFilter) {
                p_array_qry_Query4UniquesAndCheckBoxes.push([0, this.arrayQueryStringsPerTable[0], "Receiver", "Receiver", 'section12content', "0" + "-Receiver"]);
            }
            this.m_array_qry_Query4UniquesAndCheckBoxes = p_array_qry_Query4UniquesAndCheckBoxes;

            p_array_qry_SetRangeCheckboxes = [];
            if (this.blnShowAdvancedFilter) {
                pArrayTempRangeValues = ["0", "0.01 - 1.99", "2 - 5.999", "6 - 9.99", "10 and up"];
                p_array_qry_SetRangeCheckboxes.push([0, pArrayTempRangeValues, 'section14content', "0" + "-Temp_c", "Temp_c", false, false, this.arrayQueryStringsPerTable[0]]);
                pArrayTempRangeValues = ["-4 - -0.999", "0", "0.01 - 0.2499", "0.25 - 0.499", "0.5 - 0.999", "1 - 2.99", "3 - 5.999", "6 - 9.99", "10 - 40.9999", "50 - 99.9999", "100 and up"];
                p_array_qry_SetRangeCheckboxes.push([0, pArrayTempRangeValues, 'section7content', "0" + "-Depth_M", "Depth_M", false, false, this.arrayQueryStringsPerTable[0]]);
            }
            this.m_array_qry_SetRangeCheckboxes = p_array_qry_SetRangeCheckboxes;
            this.m_index_qry_SetRangeCheckboxes = 0;
            this.m_index_qry_Query4UniquesAndCheckBoxes = 0;


            //if (document.getElementById("cbx_FilterValues").checked) {
            pLocalArray = this.m_array_qry_Query4UniquesAndCheckBoxes[this.m_index_qry_Query4UniquesAndCheckBoxes];
            //document.getElementById("txtQueryResults").innerHTML = "Retreiving unique values for " + pLocalArray[2];
            this.iTableIndex = pLocalArray[0];
            this.qry_Query4UniquesAndCheckBoxes(strURL, pLocalArray[1], pLocalArray[2], pLocalArray[3], pLocalArray[4], pLocalArray[5]);

        },


        SetRangeCheckboxes: function (arrayCheckboxText, strContainerDivID, strNewID, strValueField, blnChecked, blnDisabled, strURL, strQuery) {
            document.getElementById("loadingImg").style.visibility = "visible";
            esri.show(app.loading);
            ////esri.hide(app.loading);
            //document.getElementById("txtQueryResults").innerHTML = "Retreiving unique values for " + strValueField;

            this.strFieldNameText = strValueField;
            this.strFieldNameValue = strValueField;
            this.strNewDivID = strNewID;
            this.strContainerDivID = strContainerDivID;
            document.getElementById(strContainerDivID).innerHTML = ''; // clear out existing items
            strFirstNewDiv = "";
            var blnCheckedAny = false;

            if (strQuery != "OBJECTID > 0") {  //if not initial query then determine if range in data exists 
                var pQuery = new Query();
                var pQueryTask = new esri.tasks.QueryTask(strURL + "/" + this.iTableIndex);
                pQuery.where = strQuery;
                pQuery.outFields = [strValueField, "ProjectID"];
                pQueryTask.execute(pQuery, function (results) {   //execute the query and deal with the results in this function (not calling a results function)
                    var resultFeatures = results.features;
                    if ((resultFeatures != null) || (resultFeatues != undefined)) {  //if get results then continue
                        for (var iRange in arrayCheckboxText) {                                       // loop through each checkbox range!!!!!!!!!!!!!!
                            blnAddCheckbox = false;
                            for (var i = 0, il = resultFeatures.length; i < il; i++) {
                                var pFeature = resultFeatures[i];
                                var iValue = pFeature.attributes[strValueField];
                                var strRange = arrayCheckboxText[iRange];
                                var strCodeFriendlyValue = strRange.replace("$", "").replace("$", "").replace(" - ", "_").replace(/,/g, "")
                                var strNewDivID = strNewID + "-ValueRange" + strCodeFriendlyValue;

                                if (strCodeFriendlyValue == "0") {
                                    if (iValue == 0) {
                                        blnAddCheckbox = true;
                                        break;
                                    }
                                } else if (strCodeFriendlyValue.indexOf("and up") > 0) {
                                    var n1stRangeIndex = strCodeFriendlyValue.indexOf(" and up");
                                    var n1stRangeValue = strCodeFriendlyValue.substring(0, n1stRangeIndex);
                                    if (iValue >= n1stRangeValue) {
                                        blnAddCheckbox = true;
                                        break;
                                    }
                                } else {
                                    var n1stRangeIndex = strCodeFriendlyValue.indexOf("_");
                                    var n1stRangeValue = strCodeFriendlyValue.substring(0, n1stRangeIndex);
                                    var n2ndRangeValue = strCodeFriendlyValue.substring(n1stRangeIndex + 1, strCodeFriendlyValue.length);
                                    if ((iValue >= n1stRangeValue) & (iValue <= n2ndRangeValue)) {
                                        blnAddCheckbox = true;
                                        break;
                                    }
                                }
                            }
                            if (blnAddCheckbox) {
                                if (strFirstNewDiv == "") {   //store the 1st new checkbox div so can later place the clear button ahead of it
                                    strFirstNewDiv = strNewDivID;
                                }
                                var blnChecked = false;
                                if (app.gSup.m_arrayCheckedCheckboxes != undefined) {
                                    if (app.gSup.m_arrayCheckedCheckboxes.length > 0) {
                                        var iExists = app.gSup.m_arrayCheckedCheckboxes.indexOf(strNewDivID);
                                        if (iExists >= 0) {
                                            blnChecked = true;
                                            blnCheckedAny = true;
                                        }
                                    }
                                }
                                AddCheckbox(strContainerDivID, strNewDivID, strCodeFriendlyValue, strRange, blnChecked, false);
                            }
                        }
                    }
                    if (blnCheckedAny) {
                        strNewDivIDClear = strNewDivID + "-clear";
                        AddClearButton(strContainerDivID, strNewDivIDClear, "Clear", strContainerDivID, false, "visible")
                        var br = document.createElement("br");
                        var parentDiv = document.getElementById(strFirstNewDiv).parentNode;
                        parentDiv.insertBefore(document.getElementById(strNewDivIDClear), document.getElementById(strFirstNewDiv))
                        parentDiv.insertBefore(br, document.getElementById(strFirstNewDiv))
                    }
                }, function (error) {
                    console.log(error);
                });
            } else {
                for (var iRange in arrayCheckboxText) {
                    var strRange = arrayCheckboxText[iRange];
                    var strCodeFriendlyValue = strRange.replace("$", "").replace("$", "").replace(" - ", "_").replace(/,/g, "")
                    var strNewDivID = strNewID + "-ValueRange" + strCodeFriendlyValue;

                    if (strFirstNewDiv == "") {   //store the 1st new checkbox div so can later place the clear button ahead of it
                        strFirstNewDiv = strNewDivID;
                    }
                    var blnChecked = false;
                    if (this.m_arrayCheckedCheckboxes != undefined) {
                        if (this.m_arrayCheckedCheckboxes.length > 0) {
                            var iExists = this.m_arrayCheckedCheckboxes.indexOf(strNewDivID);
                            if (iExists >= 0) {
                                blnChecked = true;
                                blnCheckedAny = true;
                            }
                        }
                    }
                    AddCheckbox(strContainerDivID, strNewDivID, strCodeFriendlyValue, strRange, blnChecked, false);
                }

            }
            if (blnCheckedAny) {
                strNewDivIDClear = strNewDivID + "-clear";
                AddClearButton(strContainerDivID, strNewDivIDClear, "Clear", strContainerDivID, false, "visible")
                var br = document.createElement("br");
                var parentDiv = document.getElementById(strFirstNewDiv).parentNode;
                parentDiv.insertBefore(document.getElementById(strNewDivIDClear), document.getElementById(strFirstNewDiv))
                parentDiv.insertBefore(br, document.getElementById(strFirstNewDiv))
            }

            this.m_index_qry_SetRangeCheckboxes += 1;
            if (this.m_index_qry_SetRangeCheckboxes < this.m_array_qry_SetRangeCheckboxes.length) {
                pLocalArray = this.m_array_qry_SetRangeCheckboxes[this.m_index_qry_SetRangeCheckboxes];
                this.iTableIndex = pLocalArray[0];
                this.SetRangeCheckboxes(pLocalArray[1], pLocalArray[2], pLocalArray[3], pLocalArray[4], pLocalArray[5], pLocalArray[6], this.strURL, pLocalArray[7]);

                document.getElementById("loadingImg").style.visibility = "hidden";
                arrayCheckedCheckboxes = [];
                var pform = document.getElementById("NavigationForm");
                for (var i = 0; i < pform.elements.length; i++) {
                    if (pform.elements[i].type == 'checkbox') {
                        strID = pform.elements[i].id;
                        document.getElementById(strID).disabled = false;
                    }
                }
                if (app.pMapSup == undefined) {
                    app.pMapSup = new MH_MapSetup({}); // instantiate the class
                }
                //document.getElementById("txtQueryResults").innerHTML = "";
            }
          },


          qry_Query4UniquesAndCheckBoxes: function (strURL, strQuery, strFieldNameText, strFieldNameValue, strContainerDivID, strNewDivID) {
              this.strContainerDivID = strContainerDivID;
              this.strFieldNameText = strFieldNameText;
              this.strFieldNameValue = strFieldNameValue;
              this.strNewDivID = strNewDivID;
              var pQueryTask = new esri.tasks.QueryTask(strURL + "/" + this.iTableIndex);
              var pQuery = new esri.tasks.Query();


              var pstatDef = new esri.tasks.StatisticDefinition();
              pstatDef.statisticType = "count";
              pstatDef.onStatisticField = strFieldNameText;
              pstatDef.outStatisticFieldName = "genericstat";

              pQuery.returnGeometry = false;
              pQuery.where = strQuery + " and (" + strFieldNameText + " is not NULL)";
              pQuery.outFields = [strFieldNameText];
              pQuery.groupByFieldsForStatistics = [strFieldNameText];

              if (strFieldNameText == "FishID") {
                  var pstatDef2 = new esri.tasks.StatisticDefinition();
                  pstatDef2.statisticType = "min";
                  pstatDef2.onStatisticField = "Date_Time_noMin";
                  pstatDef2.outStatisticFieldName = "genericstatmin";
                  var pstatDef3 = new esri.tasks.StatisticDefinition();
                  pstatDef3.statisticType = "max";
                  pstatDef3.onStatisticField = "Date_Time_noMin";
                  pstatDef3.outStatisticFieldName = "genericstatmax";
                  pQuery.outStatistics = [pstatDef, pstatDef2, pstatDef3];
              } else {
                  pQuery.outStatistics = [pstatDef];
              }
                            
              return pQueryTask.execute(pQuery, this.returnEvents, this.err);
          },

          returnEvents: function (results) {
              var dteTempStartDate = "";
              var dteTempEndDate = "";
              
              document.getElementById("loadingImg").style.visibility = "visible";
              esri.show(app.loading);
              ////esri.hide(app.loading);
              var arrayRemoveStrings = ["", "---select an effort type---"];
              var resultFeatures = results.features;
              var blnHasFeaturesInResults = true;
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
                              if (an.toLowerCase() == this.app.gSup.strFieldNameText.toString().toLowerCase()) {
                                  var strText = feature.attributes[an].toString();
                                  if ((strText == null) || (strText == undefined)) {
                                      strText = "null or undefined";
                                  }
                                  blnAdd2Dropdown = true;
                                  dojo.forEach(arrayRemoveStrings, function (str2remove) {  //check to see if should add to the values for the dropdown list
                                      if (strText.toString != undefined) {
                                          if (str2remove.toLowerCase() == strText.toString().toLowerCase()) { blnAdd2Dropdown = false; }
                                      }
                                      else { console.log("error with: if (strValue.toString != undefined) {"); }
                                  });
                              }
                              if (an.toLowerCase() == this.app.gSup.strFieldNameValue.toString().toLowerCase()) {
                                  iValue = feature.attributes[an];
                              }
                          });
                          if (blnAdd2Dropdown) {
                              if (strText == "") { strText = iValue.toString(); }

                              if (this.app.gSup.strFieldNameText == "FishID") {
                                  texts.push(strText + " (" + feature.attributes["genericstat"].toString() + ")" + formatDate_and_AddDays(feature.attributes["genericstatmin"], 0).toString() + "-" + formatDate_and_AddDays(feature.attributes["genericstatmax"], 0).toString());

                                  var dteTempStartDate2 = new Date(feature.attributes["genericstatmin"]);
                                  var dteTempEndDate2 = new Date(feature.attributes["genericstatmax"]);

                                  if ((dteTempStartDate == "") | (dteTempStartDate2 < dteTempStartDate))
                                  { dteTempStartDate = dteTempStartDate2; }

                                  if ((dteTempEndDate == "") | (dteTempEndDate2 > dteTempEndDate))
                                  { dteTempEndDate = dteTempEndDate2; }

                              } else {
                                  texts.push(strText + " (" + feature.attributes["genericstat"].toString() + ")");
                              }
                              values.push(iValue);
                          } //values.push({ name: zone });
                          strText = "";
                          iValue = "";
                      });

                      if (this.app.gSup.strFieldNameText != "Project_ID") {
                          var all = [];
                          for (var i = 0; i < values.length; i++) {
                              all.push({ 'T': texts[i], 'V': values[i] });
                          }
                          if (this.app.gSup.strFieldNameText == "Fund_Year") {
                              all.reverse(sortFunction);
                          } else {
                              all.sort(sortFunction);
                          }
                          texts = [];
                          values = [];
                          for (var i = 0; i < all.length; i++) {
                              texts.push(all[i].T);
                              values.push(all[i].V);
                          }
                      }
                  } else {
                      blnHasFeaturesInResults = false;
                  }

                  if (document.getElementById(this.app.gSup.strContainerDivID) != undefined) {
                      document.getElementById(this.app.gSup.strContainerDivID).innerHTML = ''; // clear out existing items
                  }

                  if (values != undefined) {
                      var blnCheckedAny = false;
                      strFirstNewDiv = "";
                      for (var i = 0; i < values.length; i++) {
                          varValue = values[i];
                          var tt = texts[i];
                          if (this.app.gSup.strFieldNameValue.toString() == "PersonName") {
                              tt = tt.replace("Unknown", "").replace("unknown", "")
                          }
                          var blnChecked = false; //if checkboxDivID is in list of checked boxes, then make sure new creation is checked
                          var strDivSuffix;
                          if (typeof stringValue == "string") {
                              strDivSuffix = "-" + varValue.replace(" ", "_").replace(",", "").replace(".", "");
                          } else {
                              strDivSuffix = "-" + varValue;
                          }
                          var strNewDivID = this.app.gSup.strNewDivID + strDivSuffix;
                          if (strFirstNewDiv == "") {   //store the 1st new checkbox div so can later place the clear button ahead of it
                              strFirstNewDiv = strNewDivID;
                          }
                          if (this.app.gSup.m_arrayCheckedCheckboxes != undefined) {
                              if (this.app.gSup.m_arrayCheckedCheckboxes.length > 0) {
                                  var iExists = this.app.gSup.m_arrayCheckedCheckboxes.indexOf(strNewDivID);
                                  if (iExists >= 0) {
                                      blnChecked = true;
                                      blnCheckedAny = true
                                  }
                              }
                          }
                          AddCheckbox(this.app.gSup.strContainerDivID, strNewDivID, varValue, tt, blnChecked, true)
                      }
                      if (blnCheckedAny == true) {
                          strNewDivIDClear = this.app.gSup.strNewDivID + "-clear";
                          AddClearButton(this.app.gSup.strContainerDivID, strNewDivIDClear, "Clear", this.app.gSup.strContainerDivID, false, "visible")
                          var br = document.createElement("br");
                          var parentDiv = document.getElementById(strFirstNewDiv).parentNode;
                          parentDiv.insertBefore(document.getElementById(strNewDivIDClear), document.getElementById(strFirstNewDiv))
                          parentDiv.insertBefore(br, document.getElementById(strFirstNewDiv))
                      }
                  }
                  //else if (this.strFieldNameText == "Project_ID") {
                  //    if (values == undefined) {
                  //        var strstop = "";
                  //    }
                  //    var strQuery2 = "Project_ID in (";
                  //    for (var i = 0; i < values.length; i++) { strQuery2 += values[i] + ","; }
                  //    this.strQuery1 = strQuery2.slice(0, -1) + ")";
                  //}
              } 
              this.app.gSup.m_index_qry_Query4UniquesAndCheckBoxes += 1;

              if ((dteTempStartDate != "") & (dteTempEndDate != "")) {
                  app.pMapSup.iSliderDateStart = dteTempStartDate;
                  app.pMapSup.iSliderDateEnd = dteTempEndDate;
              }

              if (!(blnHasFeaturesInResults) & (this.app.gSup.m_index_qry_Query4UniquesAndCheckBoxes == 1)) {  //in cases of 1st user select, if no results then remove the date
                  this.app.gSup.m_index_qry_Query4UniquesAndCheckBoxes = 0;
                  pLocalArray = this.app.gSup.m_array_qry_Query4UniquesAndCheckBoxes[this.app.gSup.m_index_qry_Query4UniquesAndCheckBoxes];
                  var strQuery2Change = pLocalArray[1]
                  var n = strQuery2Change.lastIndexOf(" and ");                  //remove the date constraint FishID in ('LKT_0003') and ((Date_Time_noMin >= '08/05/2015') and (Date_Time_noMin <= '08/13/2015'))
                  strQuery2Change = strQuery2Change.substring(0, n);
                  n = strQuery2Change.lastIndexOf(" and ");
                  strQuery2Change = strQuery2Change.substring(0, n);

                  $("#datepickerFrom").datepicker("setDate", "");
                  $("#datepickerTo").datepicker("setDate", "");
                  this.app.gSup.m_array_qry_Query4UniquesAndCheckBoxes[this.app.gSup.m_index_qry_Query4UniquesAndCheckBoxes][1] = strQuery2Change;
                  //this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, pLocalArray[1], pLocalArray[2], pLocalArray[3], pLocalArray[4], pLocalArray[5]);
              } else {
                  if (($('#datepickerFrom').datepicker({ dateFormat: 'mm-dd-yy' }).val() == "") &
                      ($('#datepickerTo').datepicker({ dateFormat: 'mm-dd-yy' }).val() == "")) {
                      $("#datepickerFrom").datepicker("setDate", dteTempStartDate);
                      $("#datepickerTo").datepicker("setDate", dteTempEndDate);
                  }
              }

              if (this.app.gSup.m_index_qry_Query4UniquesAndCheckBoxes < this.app.gSup.m_array_qry_Query4UniquesAndCheckBoxes.length) {
                  pLocalArray = this.app.gSup.m_array_qry_Query4UniquesAndCheckBoxes[this.app.gSup.m_index_qry_Query4UniquesAndCheckBoxes];
                  //document.getElementById("txtQueryResults").innerHTML = "Retreiving unique values for " + pLocalArray[2];
                  this.app.gSup.iTableIndex = pLocalArray[0];
                  this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, pLocalArray[1], pLocalArray[2], pLocalArray[3], pLocalArray[4], pLocalArray[5]);
              } else if (this.app.gSup.m_index_qry_SetRangeCheckboxes < this.app.gSup.m_array_qry_SetRangeCheckboxes.length) {
                  app.pMapSup.iSliderDateStart = dteTempStartDate;
                  app.pMapSup.iSliderDateEnd = dteTempEndDate;

                  pLocalArray = this.app.gSup.m_array_qry_SetRangeCheckboxes[this.app.gSup.m_index_qry_SetRangeCheckboxes];
                  //document.getElementById("txtQueryResults").innerHTML = "Retreiving unique values for " + pLocalArray[5];
                  this.app.gSup.iTableIndex = pLocalArray[0];
                  this.app.gSup.SetRangeCheckboxes(pLocalArray[1], pLocalArray[2], pLocalArray[3], pLocalArray[4], pLocalArray[5], pLocalArray[6], this.app.gSup.strURL, pLocalArray[7]);
              } else {
                  document.getElementById("loadingImg").style.visibility = "hidden";
                  arrayCheckedCheckboxes = [];
                  var pform = document.getElementById("NavigationForm");
                  for (var i = 0; i < pform.elements.length; i++) {
                      if (pform.elements[i].type == 'checkbox') {
                          strID = pform.elements[i].id;
                          document.getElementById(strID).disabled = false;
                      }
                  }
                  if (app.pMapSup == undefined) {
                      app.pMapSup = new MH_MapSetup({}); // instantiate the class
                  }
                  //document.getElementById("txtQueryResults").innerHTML = "";

                  this.app.pMapSup.QueryZoom(pLocalArray[1]);


                  var pElement = document.getElementById('Div_FilterValues');
                  if (pElement.style.visibility == 'collapse') {
                      $('input[type=checkbox]').removeAttr('checked'); //uncheck the filter query parameters
                  }

              }

              return results;
          },

          err: function (err) {
              this.app.gSup.numberOfErrors += 1;
              console.log("Failed to get stat results due to an error: ", err);
              //document.getElementById("txtQueryResults").innerHTML = "Error on Query, trying again" + String(this.app.gSup.numberOfErrors);
              //alert(err.name);
              ////this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex], "FishID", "FishID",
              ////                    'section3content', this.app.gSup.iTableIndex.toString() + "-FishID");
              pLocalArray = this.app.gSup.m_array_qry_Query4UniquesAndCheckBoxes[this.app.gSup.m_index_qry_Query4UniquesAndCheckBoxes];
              this.iTableIndex = pLocalArray[0];
              this.app.gSup.qry_Query4UniquesAndCheckBoxes(strURL, pLocalArray[1], pLocalArray[2], pLocalArray[3], pLocalArray[4], pLocalArray[5]);

          }
      }
    )
    ;

  }
);




