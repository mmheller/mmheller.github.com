//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  ], function (
  declare, lang, esriRequest
) {
      return declare([], {   // this will loop through the checkboxes, build a query def for each topic and item selected, and return an array
          constructor: function (options) {
          },


          GetMasterAGSMapservicURL: function () {
              return "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/GNLCC_PTS/FeatureServer/";
              //return "https://www.sciencebase.gov/arcgis/rest/services/Catalog/530fdba2e4b0686a920d1eea/MapServer/";
          },

          Return_InitialQueryDefs: function () {
              //do not turn off layer visibility here, the checkbox click methods will handle layer visibility
              var pform = document.getElementById("NavigationForm");
              var arrayQuery = [];
              var strQuerySubset = ""

              var strID = "";
              var strTableIndex = "";
              var strField = "";
              var arrayTables = [];

              for (var i = 0; i < pform.elements.length; i++) {  //loop through the checkboxes of the form and determin if one of the ones to click
                  if (pform.elements[i].type == 'checkbox') {
                      if ((pform.elements[i].checked) & (pform.elements[i].id != "cbx_FilterValues") & (pform.elements[i].parentElement.parentElement.id != "GISLayerContent")) {
                          strID = pform.elements[i].id;
                          var n1st = strID.indexOf("-") + 1;
                          var n2nd = strID.indexOf("-", n1st);
                          strFieldfromCheckBox = strID.substring(n1st, n2nd);

                          var strTableIndex = strID.substring(0, (n1st - 1));
                          var nTableIndex = Number(strTableIndex);
                          var arrayTable = arrayTables[nTableIndex];

                          if (arrayTable == undefined) {
                              if (strID.indexOf("-ValueRange") > 0) {
                                  var strQueryString2Add = ""
                                  if (pform.elements[i].value == "0") {
                                      strQueryString2Add = "(" + strFieldfromCheckBox + " = " + 0 + ")";
                                  } else if (pform.elements[i].value.indexOf("and up") > 0) {
                                      var n1stRangeIndex = pform.elements[i].value.indexOf(" and up");
                                      var n1stRangeValue = pform.elements[i].value.substring(0, n1stRangeIndex);
                                      strQueryString2Add = "(" + strFieldfromCheckBox + " >= " + n1stRangeValue + ")";
                                  } else {
                                      var n1stRangeIndex = pform.elements[i].value.indexOf("_");
                                      var n1stRangeValue = pform.elements[i].value.substring(0, n1stRangeIndex);
                                      var n2ndRangeValue = pform.elements[i].value.substring(n1stRangeIndex + 1, pform.elements[i].value.length);
                                      strQueryString2Add = "((" + strFieldfromCheckBox + " >= " + n1stRangeValue + ") and (" + strFieldfromCheckBox + " <= " + n2ndRangeValue + "))";
                                  }
                                  arrayTable = [[strFieldfromCheckBox, [strQueryString2Add]]];
                              } else {
                                  arrayTable = [[strFieldfromCheckBox, [pform.elements[i].value]]];
                              }
                              arrayTables[nTableIndex] = arrayTable;
                          } else {
                              var blnFieldFound = false;
                              var arrayTableLength = arrayTable.length;    // if not field then add the field
                              for (var ii = 0; ii < arrayTableLength; ii++) {
                                  var arrayField = arrayTable[ii];
                                  strFieldName = arrayField[0];
                                  if (strFieldName == strFieldfromCheckBox) {
                                      blnFieldFound = true;
                                      break;
                                  }
                              }
                              if (blnFieldFound) {
                                  var arrayValues = arrayField[1];
                                  if (strID.indexOf("-ValueRange") > 0) {
                                      //                                      var n1stRangeIndex = pform.elements[i].value.indexOf("_");
                                      //                                      var n1stRangeValue = pform.elements[i].value.substring(0, n1stRangeIndex);
                                      //                                      var n2ndRangeValue = pform.elements[i].value.substring(n1stRangeIndex + 1, pform.elements[i].value.length);
                                      if (pform.elements[i].value == "0") {
                                          strQueryString2Add = "(" + strFieldfromCheckBox + " = " + 0 + ")";
                                      } else if (pform.elements[i].value.indexOf("and up") > 0) {
                                          var n1stRangeIndex = pform.elements[i].value.indexOf(" and up");
                                          var n1stRangeValue = pform.elements[i].value.substring(0, n1stRangeIndex);
                                          strQueryString2Add = "(" + strFieldfromCheckBox + " >= " + n1stRangeValue + ")";
                                      } else {
                                          var n1stRangeIndex = pform.elements[i].value.indexOf("_");
                                          var n1stRangeValue = pform.elements[i].value.substring(0, n1stRangeIndex);
                                          var n2ndRangeValue = pform.elements[i].value.substring(n1stRangeIndex + 1, pform.elements[i].value.length);
                                          strQueryString2Add = "((" + strFieldfromCheckBox + " >= " + n1stRangeValue + ") and (" + strFieldfromCheckBox + " <= " + n2ndRangeValue + "))";
                                      }
                                      arrayValues.push(strQueryString2Add);
                                      //arrayValues.push("((" + strFieldfromCheckBox + " >= " + n1stRangeValue + ") and (" + strFieldfromCheckBox + " <= " + n2ndRangeValue + "))");
                                  } else {
                                      arrayValues.push(pform.elements[i].value);
                                  }
                              } else {
                                  arrayField = [strFieldfromCheckBox, [pform.elements[i].value]];
                                  arrayTable.push(arrayField);
                              }

                          }
                      }
                  }
              }


              var arrayTableSLength = arrayTables.length;    // if not field then add the field
              if (arrayTableSLength > 0) {
                  arrayTables.forEach(function (arrayTable) {
                      nTableIndex = arrayTables.indexOf(arrayTable);
                      arrayTable.forEach(function (arrayField) {
                          strFieldName = arrayField[0];
                          arrayValues = arrayField[1];

                          if ((arrayValues.join().indexOf("=") > 0) | (arrayValues.join().indexOf(">") > 0) | (arrayValues.join().indexOf("<") > 0)) {
                              strQuerySubset = "(" + arrayValues.join(" or ") + ")";
                          }
                          else if ((strFieldName == "Fund_Year") | (strFieldName == "Total__Funding_by_Your_LCC")) {
                              strQuerySubset = strFieldName + " in (" + arrayValues.join(",") + ")";
                          }
                          else {
                              strQuerySubset = strFieldName + " in ('" + arrayValues.join("','") + "')";
                          }

                          arrayQuery.push([nTableIndex, strQuerySubset]);

                          //strQuery += nTableIndex.toString() + ":" + strQuerySubset + "\n<br>";
                      }) //arrayTable.forEach(function(arrayField) {
                  }) //arrayTables.forEach(function(arrayTable) {
              } //if (arrayTableSLength > 0) {

              return arrayQuery;
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

