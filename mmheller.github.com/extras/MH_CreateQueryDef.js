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
                      if (pform.elements[i].checked) {
                          strID = pform.elements[i].id;
                          var n1st = strID.indexOf("-") + 1;
                          var n2nd = strID.indexOf("-", n1st);
                          strFieldfromCheckBox = strID.substring(n1st, n2nd);

                          var strTableIndex = strID.substring(0, (n1st - 1));
                          var nTableIndex = Number(strTableIndex);
                          var arrayTable = arrayTables[nTableIndex];

                          if (arrayTable == undefined) {
                              arrayTable = [[strFieldfromCheckBox, [pform.elements[i].value]]];
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
                                  arrayValues.push(pform.elements[i].value);
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

                          if (strFieldName == "Fund_Year") {
                              strQuerySubset = strFieldName + " in (" + arrayValues.join(",") + ")";
                          } else {
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

