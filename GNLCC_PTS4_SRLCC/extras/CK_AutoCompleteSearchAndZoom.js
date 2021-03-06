﻿//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "esri/tasks/FindTask",
   "esri/tasks/FindParameters",
], function (
  declare, lang, esriRequest, FindTask, FindParameters
) {

    return declare([], {
        pMap: null,
        dblExpandNum: null,
        pFeatureLayer: null,
        divTag4Results: null,
        strSearchField: null,
        pSR: null,
        strURL: null,
  
        constructor: function (options) {
            this.pMap = options.pMap || null;
            this.dblExpandNum = options.dblExpandNum || null;
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
            this.divTag4Results = options.divTag4Results || null;
            this.strSearchField = options.strSearchField || null;
            this.pSR = options.pSR || null;
            this.strURL = options.strURL || null;
        },

        ExecutePTSFind: function (strSearchValue) {
            app.gQuery.ClearDivs();
            var pFindask = new esri.tasks.FindTask(this.strURL);

            var params = new FindParameters();
            params.layerIds = [0];
            
            params.searchFields = ["ProjectID", "Prj_Title", "PI_Org", "Partner_Organizaitons", "Subject_Keywords", "Location_Keywords", "LeadName_LastFirst"];
            params.searchText = strSearchValue;
            params.returnGeometry = false;
            pFindask.execute(params, this.showResultsFromFind);
        },

        showResultsFromFind: function (resultFeatures) {
            if ((resultFeatures != null) && (resultFeatures != undefined)) {
                if (resultFeatures.length > 0) {
                    var tempValue;
                    var arrayValues = [];
                    var testVals = {};

                    dojo.forEach(resultFeatures, function (pfeatureItem) {  //Loop through the QueryTask results and populate an array with the unique values
                        tempValue = pfeatureItem.feature.attributes.ProjectID;
                        if (tempValue == undefined) {
                            tempValue = pfeatureItem.feature.attributes.projectid;
                        }
                        if (!testVals[tempValue]) {
                            testVals[tempValue] = true;
                            var CheckedValue = tempValue;
                            arrayValues.push(CheckedValue); //values.push({ name: zone });//values.push("'" + strValue + "'"); //values.push({ name: zone });
                            this.app.gQuery.arryExtraPrjIDs4URLParam.push(CheckedValue);
                        }
                    });
                    this.app.gQuery.arrayProjectIDs = arrayValues;
                    this.app.gQuery.m_iarrayQueryIndex += 1; //increment the index value of the query array by 1

                    if (app.gQuery.strQuery == null) {
                        app.gQuery.strQuery = "ProjectID in (" + arrayValues.join(",") + ")";
                    } else {
                        app.gQuery.strQuery = app.gQuery.strQuery.replace(")", "," + arrayValues.join(",") + ")");
                    }
                    app.gQuery.SendQuery4ProjectResults(app.gQuery.strQuery, app.gQuery.m_grid);
                }
            }
            else {
                // do nothing
            }
        },


        zoomToPoint: function (pointx, pointy, option, dblZoom) {
            require(["esri/graphic", "esri/geometry/Point", "esri/SpatialReference"
            ], function (Graphic, Point, SpatialReference) {
                var ptempSR = new SpatialReference({ wkid: 3857 });

                mapPoint1 = new Point(pointx, pointy, ptempSR);

                if (option == "noPoint") { //just select the parcel so the perimeter is highlighted
                    require(["esri/tasks/query", "esri/layers/FeatureLayer"], function (
                        Query, FeatureLayer
                ) {
                        var query = new Query();
                        query.geometry = mapPoint1;
                        parcelLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (parcel) {
                            var parcelObject = parcel[0];
                            this.app.map.setExtent((map.graphics.add(new Graphic(createJSONPolygon(parcelObject.geometry.rings)))).geometry.getExtent().expand(1.5));
                        });
                    }); //End require
                } else { //add a point graphic to the map and label it
                    if (dblZoom == null) {
                        this.app.map.centerAt(mapPoint1);
                    }
                    else {
                        this.app.map.centerAndZoom(mapPoint1, dblZoom);
                    }
                }
            }); //End zoomToPoint require
        },



        //        InitialSearch_And_AutoComplete: function () {
        //            this.strSearchField = "SID";
        //            $('#loc').autocomplete({
        //                source: function (request, response) {
        //                    $.ajax({
        //                        url: app.strTheme1_URL + "0/query",
        //                        dataType: "jsonp",
        //                        data: {
        //                            where: strSearchField + " LIKE '%" + request.term.replace(/\'/g, '\'\'').toUpperCase() + "%'",     //makes single quotes into double for sql
        //                            outFields: strSearchField,
        //                            returnGeometry: true,
        //                            f: "pjson"
        //                        },
        //                        success: function (data) {
        //                            if (data.features) {
        //                                response($.map(data.features.slice(0, 19), function (item) {      //only display first 10
        //                                    return { label: item.attributes.SID, value2: item.geometry.x, value3: item.geometry.y}  //REmove the hardcode of the field eventually

        //                                }));
        //                            }
        //                        }
        //                    });
        //                },
        //                minLength: 3,
        //                select: function (event, ui) {
        //                    this.blur();
        //                    var xpoint = ui.item.value2;

        //                    var ypoint = ui.item.value3;
        //                    this.zoomToPoint(xpoint, ypoint, ""); //Add the noPoint variable to keep the point graphic from drawing on the screen
        //                }
        //            });


        //            //            return pQueryT.execute(pQuery, this.returnEvents, this.err);
        //        },






        createJSONPolygon: function (coords, selector, atts) {
            var frank = String(coords);

            var fixedCoords = frank.replace(/,/g, "],[");
            var fixedCoords2 = fixedCoords.replace(/],\[4/g, ",4");
            fixedCoords2 = eval("[[[" + fixedCoords2 + "]]]")
            map.graphics.clear();
            PolyPost = {
                "geometry": { "rings": fixedCoords2, "spatialReference": { "wkid": 102206} }, "symbol": {
                    "color": [0, 0, 0, 64], "outline": { "color": [82, 246, 248, 255], "width": 2, "type": "esriSLS", "style": "esriSLSSolid" },
                    "type": "esriSFS", "style": "esriSFSNull"
                }
            };
            return PolyPost
        },


        returnEvents: function (results) {  //placeholder to enable return events if needed later
            //            var resultFeatures = results.features;

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

