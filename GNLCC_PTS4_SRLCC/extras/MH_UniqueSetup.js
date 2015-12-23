//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        July 2015

function StartQuery(blnSelect) {    //loop through the checkboxes and disable, so user interaction dosen't disrupt the queryies
    app.map.graphics.clear();
    app.map.infoWindow.hide();
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
    app.gQuery.SendQuery(arrayQuery, 0);
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
    for (var i = 0; i < pform.elements.length; i++) {
        if (pform.elements[i].type == 'checkbox') {
            strID = pform.elements[i].id;
            document.getElementById(strID).disabled = true
        }
    }
    var strQuery = "";
    var arrayQuery = this.app.gCQD.Return_InitialQueryDefs();
    app.gQuery.SendQuery(arrayQuery, 0);
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
  "esri/request",
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
          strContainerDivID: null,
          strFieldNameText: null,
          strFieldNameValue: null,
          strNewDivID: null,
          arrayQueryStringsPerTable: null,
          iTableIndex: null,
          strURL: null,
          m_arrayCheckedCheckboxes: null,

          constructor: function (options) {
          },

          Phase1: function (strURL, arrayQueryStringsPerTable, strQuery) {
              this.strURL = strURL;
              this.arrayQueryStringsPerTable = arrayQueryStringsPerTable;
              if (arrayQueryStringsPerTable.length < 1) {
                  for (var i = 0; i < 13; i++) {
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
              this.iTableIndex = 6

              if (document.getElementById("cbx_FilterValues").checked) {
                  this.qry_Query4UniquesAndCheckBoxes(strURL, this.arrayQueryStringsPerTable[this.iTableIndex], "Fund_Year", "Fund_Year",
                                                    'section3content', this.iTableIndex.toString() + "-Fund_Year");
              }
              //              AddCheckbox("section4content", "6-dest_orgname-1", "Funding_Recipients_Dispersal", "UNIVERSITY OF MONTANA SYSTEM", false)
              //              AddCheckbox("section5content", "2-dest_orgname-1", "ConsvTargets", "Sage shrub/grassland (Habitats and Ecosystems)", false)
          },

          qry_Query4UniquesAndCheckBoxes: function (strURL, strQuery, strFieldNameText, strFieldNameValue, strContainerDivID, strNewDivID) {
              if (strFieldNameText == "PersonName") {
                  var strstop = "";
              }
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
              pQuery.outStatistics = [pstatDef];
              return pQueryTask.execute(pQuery, this.returnEvents, this.err);
          },

          returnEvents: function (results) {
              var arrayRemoveStrings = ["", "---select an effort type---"];
              var resultFeatures = results.features;
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

                              texts.push(strText + " (" + feature.attributes["genericstat"].toString() + ")");
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
                  }

                  document.getElementById(this.app.gSup.strContainerDivID).innerHTML = ''; // clear out existing items

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
                  else if (this.strFieldNameText == "Project_ID") {
                      if (values == undefined) {
                          var strstop = "";
                      }
                      var strQuery2 = "Project_ID in (";
                      for (var i = 0; i < values.length; i++) { strQuery2 += values[i] + ","; }
                      this.strQuery1 = strQuery2.slice(0, -1) + ")";
                  }
              }
              switch (this.app.gSup.strFieldNameText) {                //                'count' | 'sum' | 'min' | 'max' | 'avg' | 'stddev'
                  case "Fund_Year":
                      this.app.gSup.iTableIndex = 4;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "EcotypicAreaName", "EcotypicAreaName",
                                                            'section1content', this.app.gSup.iTableIndex.toString() + "-EcotypicAreaName");
                      break;

                  case "EcotypicAreaName":
                      this.app.gSup.iTableIndex = 0;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "PI_Org", "PI_Org",
                                                            'section2content', this.app.gSup.iTableIndex.toString() + "-Prj_Org");
                      break;

                  case "PI_Org":
                      this.app.gSup.iTableIndex = 5;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "dest_orgname", "dest_orgname",
                                                            'section4content', this.app.gSup.iTableIndex.toString() + "-dest_orgname");
                      break;

                  case "dest_orgname":
                      this.app.gSup.iTableIndex = 1;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "CommonName", "CommonName",
                                                            'section5content', this.app.gSup.iTableIndex.toString() + "-CommonName");
                      break;

                  case "CommonName":
                      this.app.gSup.iTableIndex = 5;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "DestinationType", "DestinationType",
                                                            'section6content', this.app.gSup.iTableIndex.toString() + "-DestinationType");
                      break;

                  case "DestinationType":
                      this.app.gSup.iTableIndex = 8;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "GoalName", "GoalName",
                                                            'section7content', this.app.gSup.iTableIndex.toString() + "-GoalName");
                      break;
                  case "GoalName":
                      this.app.gSup.iTableIndex = 2;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex] + " and (not (NationalLCCDelivType in ('Contractual Document')))",
                                                                        "NationalLCCDelivType", "NationalLCCDelivType",
                                                            'section8content', this.app.gSup.iTableIndex.toString() + "-NationalLCCDelivType");
                      break;
                  case "NationalLCCDelivType":
                      this.app.gSup.iTableIndex = 7;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "orgname", "orgname",
                                                            'section9content', this.app.gSup.iTableIndex.toString() + "-orgname");
                      break;
                  case "orgname":
                      this.app.gSup.iTableIndex = 11;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "Stressor", "Stressor",
                                                            'section10content', this.app.gSup.iTableIndex.toString() + "-Stressor");
                      break;
                  case "Stressor":
                      this.app.gSup.iTableIndex = 9;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "GroupName", "GroupName",
                                                            'section11content', this.app.gSup.iTableIndex.toString() + "-GroupName");
                      break;
                  case "GroupName":
                      this.app.gSup.iTableIndex = 0;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "PrjStatus", "PrjStatus",
                                                            'section12content', this.app.gSup.iTableIndex.toString() + "-PrjStatus");
                      break;

                  case "PrjStatus":
                      this.app.gSup.iTableIndex = 12;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex] +
                                                                    " and (not (NAME in ('Arizona','California','Colorado','Nebraska','Nevada','New Mexico','North Dakota','Saskatchewan','South Dakota','Utah')))",
                                                                        "NAME", "NAME",
                                                            'section13content', this.app.gSup.iTableIndex.toString() + "-Name");
                      break;

//                  case "NAME":
//                      this.app.gSup.iTableIndex = 0;
//                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
//                                                                        "Support_Name", "Support_Name",
//                                                            'section14content', this.app.gSup.iTableIndex.toString() + "-Support_Name");
//                      break;

                  //                  case "Support_Name":   
                  //                      this.app.gSup.iTableIndex = 0;   
                  //                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],   
                  //                                                                        "Total__Funding_by_Your_LCC", "Total__Funding_by_Your_LCC",   
                  //                                                            'section15content', this.app.gSup.iTableIndex.toString() + "-Total__Funding_by_Your_LCC");   
                  //                      break;   

              }

              return results;
          },


          err: function (err) {
              console.log("Failed to get stat results due to an error: ", err);
              alert(error.name);
          }
      }
    )
    ;

  }
);




