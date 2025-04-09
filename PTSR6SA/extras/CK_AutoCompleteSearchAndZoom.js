//Created By:  Matt Heller, Great Northern Landscape Conservation Cooperative / U.S. Fish and Wildlife Service
//Date:        Oct 2014

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
  "esri/tasks/FindTask",
   "esri/tasks/FindParameters",
	"esri/tasks/query",
	"dojo/promise/all",
], function (
  declare, lang, esriRequest, FindTask, FindParameters, query, All
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

        ExecutePTSFind: function (strSearchValue) { //had to revamp to a regular query due to AGOL not supporting find operations
            app.gQuery.ClearDivs();

			var q_Layer1 = new esri.tasks.Query();
			var qt_Layer1 = new esri.tasks.QueryTask(this.strURL + "/0");
			q_Layer1.where = "ProjectID like '%" + strSearchValue + "%'" +
                                 " or Prj_Title like '%" + strSearchValue + "%'" +
                                 " or PI_Org like '%" + strSearchValue + "%'" +
                                 " or Partner_Organizaitons like '%" + strSearchValue + "%'" +
                                 " or Subject_Keywords like '%" + strSearchValue + "%'" +
                                 " or Location_Keywords like '%" + strSearchValue + "%'" +
                                 " or LeadName_LastFirst like '%" + strSearchValue + "%'"
			q_Layer1.outFields = ["ProjectID"];

			var q_Layer2 = new esri.tasks.Query();
			var qt_Layer2 = new esri.tasks.QueryTask(this.strURL + "/9");
			q_Layer2.where = "PersonName like '%" + strSearchValue + "%'" +	" or GroupName like '%" + strSearchValue + "%'" 
			q_Layer2.outFields = ["projectid"];

			q_Layer1.returnGeometry = false;
			pLayer1 = qt_Layer1.execute(q_Layer1);
			q_Layer2.returnGeometry = false;
			pLayer2 = qt_Layer2.execute(q_Layer2);

			var pLayer1, pLayer2, pPromises;
			pPromises = new All([pLayer1, pLayer2]);
			pPromises.then(this.showResultsFromFind, this.err);
        },

        showResultsFromFind: function (results) {
			var tempValue;
			var arrayValues = [];
			var testVals = {};

			for (let i = 0; i < 2; i++) {
				if ((results[i] != null) && (results[i] != undefined)) {
					if (results[i].features.length > 0) {
						dojo.forEach(results[i].features, function (pfeatureItem) {  //Loop through the QueryTask results and populate an array with the unique values
							tempValue = pfeatureItem.attributes.ProjectID;
							if (tempValue == undefined) {
								tempValue = pfeatureItem.attributes.projectid;
							}
							if (!testVals[tempValue]) {
								testVals[tempValue] = true;
								arrayValues.push(tempValue);
								this.app.gQuery.arryExtraPrjIDs4URLParam.push(tempValue);
								//var CheckedValue = tempValue;
								//arrayValues.push(CheckedValue);
								//this.app.gQuery.arryExtraPrjIDs4URLParam.push(CheckedValue);
							}
							else {
								console.log("Project ID Already Acconted For");
								//do nothing
							}
						});
					}
				}
			}
			if (arrayValues.length > 0) {
				this.app.gQuery.arrayProjectIDs = arrayValues;
				this.app.gQuery.m_iarrayQueryIndex += 1; //increment the index value of the query array by 1
				if (app.gQuery.strQuery == null) {
					app.gQuery.strQuery = "ProjectID in (" + arrayValues.join(",") + ")";
				} else {
					app.gQuery.strQuery = app.gQuery.strQuery.replace(")", "," + arrayValues.join(",") + ")");
				}
				app.gQuery.SendQuery4ProjectResults(app.gQuery.strQuery, app.gQuery.m_grid);
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

