//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        Oct 2014, Updated Oct 2018

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/request",
], function (
  declare, lang, esriRequest
) {

    return declare([], {
        pMap: null,
        dblExpandNum: null,
        pFeatureLayer: null,
        divTag4Results: null,
        strSearchField: null,
        pSR: null,

        constructor: function (options) {
            this.pMap = options.pMap || null;
            this.dblExpandNum = options.dblExpandNum || null;
            this.returnEvents = lang.hitch(this, this.returnEvents);            // returnEvents is called by an external function, esri.request hitch() is used to provide the proper context so that returnEvents will have access to the instance of this class
            this.divTag4Results = options.divTag4Results || null;
            this.strSearchField = options.strSearchField || null;
            this.pSR = options.pSR || null;
        },

        zoomToPoint: function (pointx, pointy, option, dblZoom) {
            require(["esri/graphic", "esri/geometry/Point", "esri/SpatialReference"
            ], function (Graphic, Point, SpatialReference) {
                //                this.pMap.graphics.clear();
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
            CED_PP_point.clearSelection();
            CED_PP_line.clearSelection();
            CED_PP_poly.clearSelection();

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

