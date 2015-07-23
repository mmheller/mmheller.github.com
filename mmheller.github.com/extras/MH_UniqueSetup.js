//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        July 2015

function StartQuery(blnSelect) {
    //loop through the checkboxes and disable, so user interaction dosen't disrupt the queryies
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
    var strQuery4Display = "";
    var strMapServiceURL = "https://www.sciencebase.gov/arcgis/rest/services/Catalog/530fdba2e4b0686a920d1eea/MapServer";
    
//    arrayQuery.forEach(function (iIndexandQuery) {//remove some of the strings to make wildcard functionality work
//        var iIndex = iIndexandQuery[0];
//        var strQuery = iIndexandQuery[1];
//        strQuery4Display += "Table index= " + iIndex.toString() + ":" + strQuery + "\n<br>";
//    });

    app.gQuery.SendQuery(arrayQuery, 0);

//    var div = document.getElementById('querycontent');
//    div.innerHTML = strQuery4Display;
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
              //strURL, strQuery, strFieldNameText, strFieldNameValue, strContainerDivID, strNewDivID
              //populate an array of checked checkboxes
              arrayCheckedCheckboxes = [];

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
              this.qry_Query4UniquesAndCheckBoxes(strURL, this.arrayQueryStringsPerTable[this.iTableIndex], "Fund_Year", "Fund_Year",
                                                    'section3content', this.iTableIndex.toString() + "-Fund_Year");
              //              AddCheckbox("section4content", "6-dest_orgname-1", "Funding_Recipients_Dispersal", "UNIVERSITY OF MONTANA SYSTEM", false)
              //              AddCheckbox("section5content", "2-dest_orgname-1", "ConsvTargets", "Sage shrub/grassland (Habitats and Ecosystems)", false)

          },

          qry_Query4UniquesAndCheckBoxes: function (strURL, strQuery, strFieldNameText, strFieldNameValue, strContainerDivID, strNewDivID) {
              if (strFieldNameText == "EcotypicAreas") {
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

                  document.getElementById(this.app.gSup.strContainerDivID).innerHTML = ''; // clear out existing items

                  if (values != undefined) {
                      for (var i = 0; i < values.length; i++) {
                          varValue = values[i];
                          var tt = texts[i];
                          //if checkboxDivID is in list of checked boxes, then make sure new creation is checked
                          var blnChecked = false;
                          var strDivSuffix;

                          if (typeof stringValue == "string") {
                              strDivSuffix = "-" + varValue.replace(" ", "_").replace(",", "").replace(".", "");
                          } else {
                              strDivSuffix = "-" + varValue;
                          }
                          var strNewDivID = this.app.gSup.strNewDivID + strDivSuffix;

                          if (this.app.gSup.m_arrayCheckedCheckboxes != undefined) {
                              if (this.app.gSup.m_arrayCheckedCheckboxes.length > 0) {
                                  var iExists = this.app.gSup.m_arrayCheckedCheckboxes.indexOf(strNewDivID);
                                  if (iExists >= 0) {
                                      blnChecked = true;
                                  }
                              }
                          }
                          AddCheckbox(this.app.gSup.strContainerDivID, strNewDivID, varValue, tt, blnChecked, true)
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
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "DelivType", "DelivType",
                                                            'section8content', this.app.gSup.iTableIndex.toString() + "-DelivType");
                      break;
                  case "DelivType":
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
                                                                        "PersonName", "PersonName",
                                                            'section11content', this.app.gSup.iTableIndex.toString() + "-PersonName");
                      break;
                  case "PersonName":
                      this.app.gSup.iTableIndex = 0;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "PrjStatus", "PrjStatus",
                                                            'section12content', this.app.gSup.iTableIndex.toString() + "-PrjStatus");
                      break;

                  case "PrjStatus":
                      this.app.gSup.iTableIndex = 12;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "NAME", "NAME",
                                                            'section13content', this.app.gSup.iTableIndex.toString() + "-Name");
                      break;

                  case "NAME":
                      this.app.gSup.iTableIndex = 0;
                      this.app.gSup.qry_Query4UniquesAndCheckBoxes(this.app.gSup.strURL, this.app.gSup.arrayQueryStringsPerTable[this.app.gSup.iTableIndex],
                                                                        "Support_Name", "Support_Name",
                                                            'section14content', this.app.gSup.iTableIndex.toString() + "-Support_Name");
                      break;
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




