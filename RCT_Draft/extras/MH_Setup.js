
function getPageWidth() {
    var body = document.body,
        html = document.documentElement;
    var width = Math.max(body.scrollWidth, body.offsetWidth,
        html.clientWidth, html.scrollWidth, html.offsetWidth);
    return width;
}



function closeAllSelect(elmnt) {
	/*a function that will close all select boxes in the document,
	except the current select box:*/
	var x, y, i, xl, yl, arrNo = [];
	x = document.getElementsByClassName("select-items");
	y = document.getElementsByClassName("select-selected");
	xl = x.length;
	yl = y.length;
	for (i = 0; i < yl; i++) {
		if (elmnt == y[i]) {
			arrNo.push(i)
		} else {
			y[i].classList.remove("select-arrow-active");
		}
	}
	for (i = 0; i < xl; i++) {
		if (arrNo.indexOf(i)) {
			x[i].classList.add("select-hide");
		}
	}
}

function getTokens() {
    var tokens = [];
    var query = location.search;
    query = query.slice(1);
    query = query.split('&');

    if (query[0] != '') {
        $.each(query, function (i, value) {
            var token = value.split('=');
            var key = decodeURIComponent(token[0]);
            var data = decodeURIComponent(token[1]);
            tokens[key] = data;
        });
    }
    return tokens;
}

define([
    "esri/config", "esri/Map", "esri/views/MapView", "dojo/_base/declare", "esri/rest/query",
    "esri/rest/support/Query", "esri/tasks/QueryTask", "esri/rest/geometryService",
    "esri/geometry/support/webMercatorUtils",
    "esri/widgets/BasemapGallery", "esri/widgets/BasemapGallery/support/PortalBasemapsSource", "esri/widgets/ScaleBar", "dojo",
    "esri/PopupTemplate", "esri/layers/FeatureLayer", "esri/Color", "esri/renderers/SimpleRenderer", "esri/layers/CSVLayer", "esri/layers/GeoJSONLayer",
    "extras/MH_Zoom2FeatureLayers", "esri/renderers/UniqueValueRenderer",
    "esri/widgets/Legend", "esri/widgets/Locate", "esri/layers/GraphicsLayer", "esri/Graphic", 
    "esri/core/watchUtils",
    "esri/widgets/support/DatePicker",
    "dojo/dom", "dojo/dom-style",
], function (
    esriConfig, Map, MapView, declare, query, Query, QueryTask, geometryService,
    webMercatorUtils, BasemapGallery, PortalSource, ScaleBar, dojo,
    PopupTemplate, FeatureLayer, Color,
    SimpleRenderer, CSVLayer, GeoJSONLayer,
    MH_Zoom2FeatureLayers, UniqueValueRenderer, Legend, Locate, GraphicsLayer, Graphic, watchUtils, DatePicker, dom, domStyle
) {

    return declare([], {
        m_pRiverSymbolsFeatureLayerCFS: null,
        m_pRiverSymbolsFeatureLayerTemp: null,
        //m_pRiverSymbolsFeatureLayerHt: null,
        m_StreamStatusRendererCFS: null,
        m_StreamStatusRendererTemp: null,
        m_StreamStatusRendererHT: null,
        m_StartDateTime: null,
        m_StartDateTimeAnalysis: null,
        m_EndDateTime: null,
        m_CFSAnlaysisType: null,

        addReservoirConditionFeatureLayer: function (arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange, arrayOIDPlum, arrayOIDsRed) {
            let arrayofArrays = [arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange, arrayOIDPlum];////// for each array, red takes presedence so remove OID's from non-red arrays if in Red arra
            let nonRedOID = null;
            let arrayItems2remove = [];
            let index2Remove = null;
            for (let i = 0; i < arrayofArrays.length; i++) {
                for (let iColor = 0; iColor < arrayofArrays[i].length; iColor++) {
                    nonRedOID = arrayofArrays[i][iColor];
                    for (let iRedOID = 0; iRedOID < arrayOIDsRed.length; iRedOID++) {
                        if (nonRedOID == arrayOIDsRed[iRedOID]) {  //remove the OID from the non-red array
                            arrayItems2remove.push(nonRedOID);
                            break;
                        }
                    }
                }
                for (let iRemove = 0; iRemove < arrayItems2remove.length; iRemove++) {
                    index2Remove = arrayofArrays[i].indexOf(arrayItems2remove[iRemove]);
                    if (index2Remove > -1) {
                        arrayofArrays[i].splice(index2Remove, 1); // 2nd parameter means remove one item only
                    }
                }
                arrayItems2remove = [];
            }
            //\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            console.log("add Stream Condition FeatureLayer and custom legend")
            let strValueExpression = "";
            let arrayValueExpression = [];

            let arrayValueExpressionTemp = [];


            let defaultUniqueSymbolRendererCFS = {
                type: "unique-value",  // autocasts as new UniqueValueRenderer()
                defaultSymbol: {
                    type: "simple-line", color: [0, 169, 230], width: 1
                }  // autocasts as new SimplelineSymbol()
            };

            let defaultUniqueSymbolRendererTemp = {
                type: "unique-value",  // autocasts as new UniqueValueRenderer()
                defaultSymbol: {
                    type: "simple-line", color: [0, 169, 230], width: 1
                }  // autocasts as new SimplelineSymbol()
            };

            app.pSup.m_StreamStatusRendererCFS = defaultUniqueSymbolRendererTemp;
            app.pSup.m_StreamStatusRendererCFS.defaultLabel = "Stream Section (Open)";

            app.pSup.m_StreamStatusRendererTemp = defaultUniqueSymbolRendererCFS;
            app.pSup.m_StreamStatusRendererTemp.defaultLabel = "Stream Section (Open)";

            //app.pSup.m_StreamStatusRendererHT = defaultUniqueSymbolRenderer;
            //app.pSup.m_StreamStatusRendererHT.defaultLabel = "Stream Section (Open)";


            let ArrayUniqueVals2Add = []
            let ArrayUniqueVals2AddTemp = []

            if (arrayOIDYellow.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDYellow.join(", ") + "], $feature.OBJECTID), 'Yellow'");
                ArrayUniqueVals2Add.push({
                    value: 'Yellow',
                    symbol: { type: "simple-line", color: [255, 255, 0], width: 18 },
                    label: "Prepare"
                });
            }

            if (arrayOIDsGold.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsGold.join(", ") + "], $feature.OBJECTID), 'Gold'");
                ArrayUniqueVals2Add.push({
                    value: 'Gold',
                    symbol: { type: "simple-line", color: [249, 166, 2], width: 18 },
                    label: "Conservation Actions"
                });
            }
            if (arrayOIDsOrange.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsOrange.join(", ") + "], $feature.OBJECTID), 'Orange'");
                ArrayUniqueVals2Add.push({
                    value: 'Orange',
                    symbol: { type: "simple-line", color: [253, 106, 2], width: 18 },
                    label: "Unofficial Closure"
                });
            }

            if (arrayOIDsRed.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsRed.join(", ") + "], $feature.OBJECTID), 'Red'");
                ArrayUniqueVals2Add.push({
                    value: 'Red',
                    symbol: { type: "simple-line", color: [255, 0, 0], width: 18 },
                    label: "Official Restriction"
                });
            }

            if (arrayOIDPlum.length > 0) {
                arrayValueExpressionTemp.push("Includes([" + arrayOIDPlum.join(", ") + "], $feature.OBJECTID), 'Plum'");
                ArrayUniqueVals2AddTemp.push({
                    value: 'Plum',
                    symbol: { type: "simple-line", color: [221, 160, 221], width: 18 },
                    label: "Hoot Owl and/or Conservation Measures"
                });
            }


            if (ArrayUniqueVals2Add.length > 0) {  //getting an error when trying to use addUniqueValueInfo, I think due to the google chart api conflict, so using universal adding to an array then adding to the unique value renderer dictionary
                strValueExpression = "When(" + arrayValueExpression.join(", ") + ", 'other')";
                app.pSup.m_StreamStatusRendererCFS["valueExpression"] = strValueExpression;
                app.pSup.m_StreamStatusRendererCFS["uniqueValueInfos"] = ArrayUniqueVals2Add;

                //app.pSup.m_StreamStatusRendererHT["valueExpression"] = strValueExpression;
                //app.pSup.m_StreamStatusRendererHT["uniqueValueInfos"] = ArrayUniqueVals2Add;
            }

            if (ArrayUniqueVals2AddTemp.length > 0) {  //getting an error when trying to use addUniqueValueInfo, I think due to the google chart api conflict, so using universal adding to an array then adding to the unique value renderer dictionary
                strValueExpression = "When(" + arrayValueExpressionTemp.join(", ") + ", 'other')";

                app.pSup.m_StreamStatusRendererTemp["valueExpression"] = strValueExpression;
                app.pSup.m_StreamStatusRendererTemp["uniqueValueInfos"] = ArrayUniqueVals2AddTemp;
            }

            let featureLayerCFS = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[5],
                outFields: ["OBJECTID"],
                renderer: app.pSup.m_StreamStatusRendererCFS
            });

            let featureLayerTemp = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[5],
                outFields: ["OBJECTID"],
                renderer: app.pSup.m_StreamStatusRendererTemp
            });

            //let featureLayerHT = new FeatureLayer({
            //    url: app.strHFL_URL + app.idx11[5],
            //    outFields: ["OBJECTID"],
            //    renderer: app.pSup.m_StreamStatusRendererHT
            //});


            app.map.layers.add(featureLayerCFS, 5);
            app.map.layers.add(featureLayerTemp, 5);
            //app.map.layers.add(featureLayerHT, 5);


            console.log("Completed: Add Stream Condition FeatureLayer and custom legend")

            app.blnIsInitialPageLoad_Reservoir = false;
        },

        addStreamConditionFeatureLayer: function (arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange, arrayOIDPlum, arrayOIDsRed, arrayOIDsGreen, arrayOIDsPurple) {
            let arrayofArrays = [arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange];////// for each array, red takes presedence so remove OID's from non-red arrays if in Red arra
            //let arrayofArrays = [arrayOIDYellow, arrayOIDsGold, arrayOIDsOrange, arrayOIDPlum, arrayOIDsGreen, arrayOIDsPurple];////// for each array, red takes presedence so remove OID's from non-red arrays if in Red arra

            let nonRedOID = null;
            let arrayItems2remove = [];
            let index2Remove = null;


            for (let i = 0; i < arrayofArrays.length; i++) {
                for (let iColor = 0; iColor < arrayofArrays[i].length; iColor++) {
                    nonRedOID = arrayofArrays[i][iColor];
                    for (let iRedOID = 0; iRedOID < arrayOIDsRed.length; iRedOID++) {
                        if (nonRedOID == arrayOIDsRed[iRedOID]) {  //remove the OID from the non-red array
                            arrayItems2remove.push(nonRedOID);
                            break;
                        }
                    }
                }
                for (let iRemove = 0; iRemove < arrayItems2remove.length; iRemove++) {
                    index2Remove = arrayofArrays[i].indexOf(arrayItems2remove[iRemove]);
                    if (index2Remove > -1) {
                        arrayofArrays[i].splice(index2Remove, 1); // 2nd parameter means remove one item only
                    }
                }
                arrayItems2remove = [];
            }



            //\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            console.log("add Stream Condition FeatureLayer and custom legend")
            let strValueExpression = "";
            let arrayValueExpression = [];
            let arrayValueExpressionTemp = [];

            let defaultUniqueSymbolRendererCFS = {
                type: "unique-value",  // autocasts as new UniqueValueRenderer()
                defaultSymbol: {
                    type: "simple-line", color: [0, 169, 230], width: 1
                }  // autocasts as new SimplelineSymbol()
            };

            let defaultUniqueSymbolRendererTemp = {
                type: "unique-value",  // autocasts as new UniqueValueRenderer()
                defaultSymbol: {
                    type: "simple-line", color: [0, 169, 230], width: 1
                }  // autocasts as new SimplelineSymbol()
            };

            app.pSup.m_StreamStatusRendererCFS = defaultUniqueSymbolRendererCFS;
            app.pSup.m_StreamStatusRendererCFS.defaultLabel = "Stream Section (Open symbolized otherwise)";

            app.pSup.m_StreamStatusRendererTemp = defaultUniqueSymbolRendererTemp;
            app.pSup.m_StreamStatusRendererTemp.defaultLabel = "Stream Section (Open unless symbolized otherwise)";

            //app.pSup.m_StreamStatusRendererHT = defaultUniqueSymbolRenderer;
            //app.pSup.m_StreamStatusRendererHT.defaultLabel = "Stream Section (Open)";

          
            let ArrayUniqueVals2Add = []
            let ArrayUniqueVals2AddTemp = []

            ////////////////////////work with the Temp layer first since that needs to be displayed ontop of the CFS/Ht layer
            if (arrayOIDPlum.length > 0) {
                arrayValueExpressionTemp.push("Includes([" + arrayOIDPlum.join(", ") + "], $feature.OBJECTID), 'Plum'");
                ArrayUniqueVals2AddTemp.push({
                    value: 'Plum',
                    symbol: { type: "simple-line", color: [221, 160, 221], width: 12 },
                    label: "Hoot Owl and/or Conservation Measures"
                });
            }


            if (ArrayUniqueVals2AddTemp.length > 0) {  //getting an error when trying to use addUniqueValueInfo, I think due to the google chart api conflict, so using universal adding to an array then adding to the unique value renderer dictionary
                strValueExpression = "When(" + arrayValueExpressionTemp.join(", ") + ", 'other')";

                app.pSup.m_StreamStatusRendererTemp["valueExpression"] = strValueExpression;
                app.pSup.m_StreamStatusRendererTemp["uniqueValueInfos"] = ArrayUniqueVals2AddTemp;

                let featureLayerTemp = new FeatureLayer({
                    url: app.strHFL_URL + app.idx11[5],
                    outFields: ["OBJECTID"],
                    renderer: app.pSup.m_StreamStatusRendererTemp
                });

                app.map.layers.add(featureLayerTemp, 5);
            }





            if (arrayOIDYellow.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDYellow.join(", ") + "], $feature.OBJECTID), 'Yellow'");
                ArrayUniqueVals2Add.push({
                    value: 'Yellow',
                    symbol: { type: "simple-line", color: [255, 255, 0], width: 18 },
                    label: "Prepare"
                });
            }

            if (arrayOIDsGold.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsGold.join(", ") + "], $feature.OBJECTID), 'Gold'");
                ArrayUniqueVals2Add.push({
                    value: 'Gold',
                    symbol: { type: "simple-line", color: [249, 166, 2], width: 18 },
                    label: "Conservation Actions"
                });
            }
            if (arrayOIDsOrange.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsOrange.join(", ") + "], $feature.OBJECTID), 'Orange'");
                ArrayUniqueVals2Add.push({
                    value: 'Orange',
                    symbol: {
                        type: "simple-line", color: [253, 106, 2], width: 18
                    },
                    label: "Unofficial Closure"
                });
            }


            if (arrayOIDsGreen.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsGreen.join(", ") + "], $feature.OBJECTID), 'Green'");
                ArrayUniqueVals2Add.push({
                    value: 'Green',
                    symbol: { type: "simple-line", color: [0, 255, 0], width: 18 },
                    label: "Ideal Flows"
                });
            }

            if (arrayOIDsPurple.length > 0) {
                arrayValueExpression.push("Includes([" + arrayOIDsPurple.join(", ") + "], $feature.OBJECTID), 'Purple'");
                ArrayUniqueVals2Add.push({
                    value: 'Purple',
                    symbol: { type: "simple-line", color: [160, 32, 240], width: 18 },
                    label: "High Flows"
                });
            }


            if (arrayOIDsRed.length > 0) {
                let strRedLabel = "Official Restriction";
                if (app.Basin_ID == "Smith") {
                    strRedLabel = "Low Flows";
                }
                arrayValueExpression.push("Includes([" + arrayOIDsRed.join(", ") + "], $feature.OBJECTID), 'Red'");
                ArrayUniqueVals2Add.push({
                    value: 'Red',
                    symbol: { type: "simple-line", color: [255, 0, 0], width: 18 },
                    label: strRedLabel
                });
            }

            if (ArrayUniqueVals2Add.length > 0) {  //getting an error when trying to use addUniqueValueInfo, I think due to the google chart api conflict, so using universal adding to an array then adding to the unique value renderer dictionary
                strValueExpression = "When(" + arrayValueExpression.join(", ") + ", 'other')";
                app.pSup.m_StreamStatusRendererCFS["valueExpression"] = strValueExpression;
                app.pSup.m_StreamStatusRendererCFS["uniqueValueInfos"] = ArrayUniqueVals2Add;
                //app.pSup.m_StreamStatusRendererHT["valueExpression"] = strValueExpression;
                //app.pSup.m_StreamStatusRendererHT["uniqueValueInfos"] = ArrayUniqueVals2Add;
            }

            let featureLayerCFS = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[5],
                outFields: ["OBJECTID"],
                renderer: app.pSup.m_StreamStatusRendererCFS
            });
            //let featureLayerHt = new FeatureLayer({
            //    url: app.strHFL_URL + app.idx11[5],
            //    outFields: ["OBJECTID"],
            //    renderer: app.pSup.m_StreamStatusRendererHT
            //});

            app.map.layers.add(featureLayerCFS, 5);

            //app.map.layers.add(featureLayerHt, 5);


           
            

            console.log("Completed: Add Stream Condition FeatureLayer and custom legend")

            app.blnIsInitialPageLoad = false;
         },

        GetSetHeaderWarningContent: function (strAGSIndexTableURL, strH2OID, blnUseAlternateHeader, strBasinID) {
            let strBasinOrWatershed = "Watershed";
			if ((typeof strH2OID == 'undefined') & (typeof strBasinID == 'undefined')) {
                strH2OID = "UMH";
            } else if ((typeof strH2OID == 'undefined') & (typeof strBasinID != 'undefined')) {
                strBasinOrWatershed = "Basin";
				strH2OID = strBasinID;
			} 
            strURLFieldName = "URL";
            let query = new Query();
            query.outFields = [strURLFieldName];
            let queryTask = new QueryTask(strAGSIndexTableURL);
            query.where = "(BasinOrWatershed = '" + strBasinOrWatershed + "') AND (Name = '" + strH2OID + "')";
            queryTask.execute(query).then(showHeaderWarningContentResults);

			function showHeaderWarningContentResults(results) {  //get banner / header content
				console.log("showHeaderWarningContentResults");
                var resultItems = [];
                var resultCount = results.features.length;
                for (var i = 0; i < resultCount; i++) {
                    var featureAttributes = results.features[i].attributes;
                    var strGoogleSheetURL = featureAttributes[strURLFieldName];  
                    strGoogleSheetURL = strGoogleSheetURL.replace("   ", "");
                }
				strGoogleSheetURL += "&key=AIzaSyA2E5MNl-Hqoy36tbqHpccVpsSPYbnL5BA";

                $.get(strGoogleSheetURL)
                    .done(function (jsonResult) {
						//if (jsonResult.feed != undefined) {
						if (jsonResult != undefined) {
                            var strHeaderTxt = "";
                            var strAlertTxt = "";
                            var pEntries = jsonResult.values[1];

                            if (blnUseAlternateHeader) {
								//strHeaderTxt = pEntries[0].gsx$headeralt.$t
								strHeaderTxt = pEntries[2];
                            } else {
								strHeaderTxt = pEntries[0];
                            }

							strAlertTxt = pEntries[1];
                            $("#divWatershedBasinInfoTop").html(strHeaderTxt);
                            $("#divCustomAlert").html(strAlertTxt);
                        }
                    })
					.always(function (data) {
                        app.pSup.Phase2();  //starting up the map and other content becuase the header content can mess up the content dimiensions if done prior
                    });
            }
        },

        LayerCheckBoxSetup: function (cbxLayers) {
            app.view.when(() => {
                console.log("resources in the MapView have loaded"); // when the resources in the MapView have loaded.
                var des = document.getElementById('toggleLayers');

                dojo.forEach(cbxLayers, function (playerset) {
                    var strLayerName = playerset.title;
                    var clayer0 = playerset.layers[0];
                    var clayer1 = playerset.layers[1];
                    var pID0 = clayer0.id;
                    var pID1 = clayer1.id;

                    var blnCheckIt = false;  // determine if checkbox will be on/off
                    if (clayer0.visible) {
                        blnCheckIt = true;
                    }

                    var checkboxHTML = document.createElement('input');
                    checkboxHTML.type = "checkbox";
                    checkboxHTML.name = strLayerName;
                    checkboxHTML.value = [clayer0, clayer1];
                    checkboxHTML.id = pID0 + pID1;
                    checkboxHTML.checked = blnCheckIt;

                    checkboxHTML.onchange = function (evt) {
                        if (clayer0.visible) {
                            clayer0.visible = false;
                            clayer1.visible = false;
                        } else {
                            clayer0.visible = true;
                            clayer1.visible = true;
                        }
                        this.checked = clayer0.visible;
                    }

                    var label = document.createElement('label')
                    label.htmlFor = pID0 + pID1;
                    label.appendChild(document.createTextNode(strLayerName));

                    des.appendChild(checkboxHTML);
                    des.appendChild(document.createTextNode('\u00A0'))
                    des.appendChild(label);
                    des.appendChild(document.createTextNode('\u00A0\u00A0\u00A0\u00A0'));
                });
            });
        },

        Phase1: function () {
            console.log("MH_setup Phase1");

            
            
            app.blnIsInitialPageLoad = true;
            app.blnIsInitialPageLoad_Reservoir = true;

            

            //////////////////////////////////////////////////////////////////////////////
            //////////////////////////////Basins & Watersheds///////////////////////////////////////
            //////////////////////////////////////////////////////////////////////////////
            app.H2O_ID = getTokens()['H2O_ID'];
            app.Basin_ID = getTokens()['Basin_ID'];
			if (app.Basin_ID == "UY_Shields") {
				app.Basin_ID = "Upper Yellowstone Headwaters";
			}
			
            app.arrayEntireList = [["Beaverhead/Centennial", "Beaverhead", "UMH"],          //array [watershed listed on website, watershed in layer, basin name in website]
				["Big Hole", "Big Hole", "UMH"],
				["Boulder", "Boulder", "UMH"], ["Broadwater", "Broadwater", "UMH"], 
				["Gallatin-Lower", "Lower Gallatin", "UMH"], ["Gallatin-Upper", "Upper Gallatin", "UMH"], ["Jefferson", "Jefferson", "UMH"],
                ["Madison", "Madison", "UMH"], ["Ruby", "Ruby", "UMH"],

				["Shields", "Shields", "Upper Yellowstone Headwaters"],
                ["Upper Yellowstone", "Upper Yellowstone", "Upper Yellowstone Headwaters"],
                ["Yellowstone Headwaters", "Yellowstone Headwaters", "Upper Yellowstone Headwaters"],

				["Middle Musselshell", "Middle Musselshell", "Musselshell"],
				["Sun", "Sun", "Blackfoot-Sun"], ["Lower Musselshell", "Lower Musselshell", "Musselshell"],
				["Lower Bighorn", "Lower Bighorn", "Bighorn"], ["Little Bighorn", "Little Bighorn", "Bighorn"],
				["Flatwillow", "Flatwillow", "Musselshell"], ["Shoshone", "Shoshone", "Bighorn"],
				//["Box Elder", "Box Elder", "Musselshell"],
				["Blackfoot", "Blackfoot", "Blackfoot-Sun"],
				["Little Wind", "Little Wind", "Bighorn"], ["Lower Wind", "Lower Wind", "Bighorn"],
				["North Fork Shoshone", "North Fork Shoshone", "Bighorn"], ["Bighorn Lake", "Bighorn Lake", "Bighorn"],
				["South Fork Shoshone", "South Fork Shoshone", "Bighorn"], ["Upper Wind", "Upper Wind", "Bighorn"],
				//["Greybull", "Greybull", "Bighorn"], ["Dry", "Dry", "Bighorn"],
				["Upper Bighorn", "Upper Bighorn", "Bighorn"], ["Upper Musselshell", "Upper Musselshell", "Musselshell"],
				["Boulder and East Boulder", "Boulder and East Boulder", "Boulder and East Boulder"],
                /*["City of Choteau - Teton River", "City of Choteau - Teton River", "Blackfoot-Sun"],*/
                ["North Fork Flathead", "North Fork Flathead", "Flathead"],
                ["Mainstem Flathead", "Mainstem Flathead", "Flathead"],
                ["Swan", "Swan", "Flathead"],
                ["Bitterroot", "Bitterroot", "Bitter Root"],
                ["Lower Flathead", "Lower Flathead", "Flathead"],
                ["Middle Fork Flathead", "Middle Fork Flathead", "Flathead"],
                ["Clarks Fork Yellowstone", "Clarks Fork Yellowstone", "Clarks Fork Yellowstone"],
                ["Rock Creek", "Rock Creek", "Clarks Fork Yellowstone"],
                ["South Fork Flathead", "South Fork Flathead", "Flathead"],
                //["Sweet Grass Creek", "Sweet Grass Creek", "test"],
                ["Stillwater", "Stillwater", "Flathead"],
                ["Lower Clark Fork", "Lower Clark Fork", "Lower Clark Fork"],
                ["Green Mountain Conservation District", "Green Mountain Conservation District", "Lower Clark Fork"],
                ["Eastern Sanders Conservation District", "Eastern Sanders Conservation District", "Lower Clark Fork"],


                ["Blackfoot", "Blackfoot", "Upper Clark Fork"],
                ["Flint-Rock", "Flint-Rock", "Upper Clark Fork"],
                ["Upper Clark Fork", "Upper Clark Fork", "Upper Clark Fork"],
                ["Granite Headwaters", "Granite Flint-Rock", "Upper Clark Fork"],


                ["Upper Green", "Upper Green", "Upper Green"],
                ["Upper Green-Slate", "Upper Green-Slate", "Upper Green"],
                ["Big Sandy", "Big Sandy WY", "Upper Green"],


                ["Big Muddy", "Big Muddy", "Big Muddy"],


                ["Lower Marais Des Cygnes", "Lower Marais Des Cygnes", "Lower Marais Des Cygnes"],
                ["Neosho Headwaters", "Neosho Headwaters", "Lower Marais Des Cygnes"],
                ["Upper Marais Des Cygnes", "Upper Marais Des Cygnes", "Lower Marais Des Cygnes"],
                ["Upper Neosho", "Upper Marais Des Cygnes", "Lower Marais Des Cygnes"],
                



                ["Smith", "Smith", "Smith"],
                

                ["Lower San Juan-Four Corners", "Lower San Juan-Four Corners", "Southwest Colorado"],
                ["Mancos", "Mancos", "Southwest Colorado"],
                ["McElmo", "McElmo", "Southwest Colorado"],
                ["Upper Dolores", "Upper Dolores", "Southwest Colorado"],

                ["Alamosa-Trinchera", "Alamosa-Trinchera", "Upper Rio Grande"],
                ["Conejos", "Conejos", "Upper Rio Grande"],
                //["Rio Chama", "Rio Chama", "Upper Rio Grande"],
                ["Rio Grande Headwaters", "Rio Grande Headwaters", "Upper Rio Grande"],
                ["Saguache", "Saguache", "Upper Rio Grande"],
                ["San Luis", "San Luis", "Upper Rio Grande"],
                //["Upper Rio Grande", "Upper Rio Grande", "Upper Rio Grande"],

                
                ["Conejos", "Conejos", "Upper Rio Grand - New Mexico"],
                ["Elephant Butte Reservoir", "Elephant Butte Reservoir", "Upper Rio Grand - New Mexico"],
                ["Jemez", "Jemez", "Upper Rio Grand - New Mexico"],
                ["Rio Chama", "Rio Chama", "Upper Rio Grand - New Mexico"],
                ["Rio Grande-Albuquerque", "Rio Grande-Albuquerque", "Upper Rio Grand - New Mexico"],
                ["Rio Grande-Santa Fe", "Rio Grande-Santa Fe", "Upper Rio Grand - New Mexico"],
                ["Rio Puerco", "Rio Puerco", "Upper Rio Grand - New Mexico"],
                ["Upper Rio Grande", "Upper Rio Grande", "Upper Rio Grand - New Mexico"]

            ];

			if ((app.H2O_ID == undefined) & (app.Basin_ID == undefined)) {
                //app.Basin_ID = "UMH";
                app.Basin_ID = "all"


                ///////////////////////////////Test
                //strTest777URL = "https://rivers.alberta.ca/apps/Basins/data/figures/river/abrivers/stationdata/R_HG_05AD005_table.json"; //Belly River near Mountain View
                //strTest777URL = "https://rivers.alberta.ca/apps/Basins/data/figures/river/abrivers/stationdata/R_HG_05AD003_table.json"; // Waterton River near Waterton Park - WSC | Table Data
                //strTest777URL = "https://rivers.alberta.ca/apps/Basins/data/figures/river/abrivers/stationdata/R_HG_05AD017_table.json"; //Mountain View Irrigation District Canal
                //strTest777URL = "https://rivers.alberta.ca/apps/Basins/data/figures/river/abrivers/stationdata/R_HG_11AA001_table.json"; //North Milk River near International Boundary
                //strTest777URL = "https://rivers.alberta.ca/apps/Basins/data/figures/river/abrivers/stationdata/R_HG_05AE924_table.json"; //St. Mary River above St. Mary Reservoir
                //strTest777URL = "https://rivers.alberta.ca/apps/Basins/data/figures/river/abrivers/stationdata/R_HG_05AE002_table.json"; //Lee Creek at Cardston
                //strTest777URL = "https://rivers.alberta.ca/apps/Basins/data/figures/river/abrivers/stationdata/R_HG_05AD042_table.json"; //Yarrow Creek at Spread Eagle Road



                //fetch(strTest777URL)
                //    .then(response => response.json())
                //    .then(data => {
                //        //console.log(data[0][data]); // Process the JSON data
                //        console.log(data[0]['data']); // Process the JSON data
                //        console.log(data[0]['data'][0][0] + " " + data[0]['data'][0][1] + " " + data[0]['data'][0][2]); // Process the JSON data
                //        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"); // Process the JSON data
                //        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"); // Process the JSON data
                //        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"); // Process the JSON data
                //    })
                //    .catch(error => {
                //        console.error('Error fetching JSON:', error);
                //    });
                    
			}

            var arrayNavList = [];

            app.blnPickArea = false;  //this turns on picking of an area, hides some UI elements, and controls whether or not to run summaries

            if (app.Basin_ID == "all") {
                document.getElementById("navList").style.display = "none";
                document.getElementById("entriesCon_div").style.display = "none";
                document.getElementById("NoAreaSelected_Div").style.display = "inline";

				arrayNavList = app.arrayEntireList;
				app.H2O_ID = undefined;
                app.Basin_ID = undefined;
                app.blnPickArea = true;    

                document.getElementById("bdy1").style["paddingTop"] = "130px";
			} else if (app.Basin_ID != undefined) {
				for (var ib2 = 0; ib2 < app.arrayEntireList.length; ib2++) { 							//if a watershed is passed, determine the correspoinding watersheds
					if (app.Basin_ID == app.arrayEntireList[ib2][2]) {
						arrayNavList.push(app.arrayEntireList[ib2]);
					}
				}
			}
			else {
				for (var ib = 0; ib < app.arrayEntireList.length; ib++) { 			//if a watershed is passed, determine the area/basin
					if (app.H2O_ID == app.arrayEntireList[ib][1]) {
						app.Basin_ID = app.arrayEntireList[ib][2];
						break;
					}
				}
				for (var ib2 = 0; ib2 < app.arrayEntireList.length; ib2++) { 							//if a watershed is passed, determine the correspoinding watersheds
					if (app.Basin_ID == app.arrayEntireList[ib2][2]) {
						arrayNavList.push(app.arrayEntireList[ib2]);
					}
				}
			}

            app.arrayNavListBasin = [
                ["Big Muddy", "Big Muddy", "MT"],
                ["Lower Marais Des Cygnes", "Lower Marais Des Cygnes", "KS"],
                                    ["Upper Missouri Headwaters", "UMH", "MT"],
                                    ["Upper Rio Grande - CO", "Upper Rio Grande", "CO"],
                                    ["Upper Rio Grande - NM", "Upper Rio Grand - New Mexico", "NM"],
                                    ["Upper Yellowstone Headwaters", "UY_Shields", "MT"],
                                    ["Upper Green", "Upper Green", "WY"],
                                    ["Upper Clark Fork", "Upper Clark Fork", "MT"],
                                    ["Smith", "Smith", "MT"],
                                    ["Southwest Colorado", "Southwest Colorado", "CO"],
                                    ["Musselshell", "Musselshell", "MT"],
                                    ["Lower Clark Fork", "Lower Clark Fork", "MT"],
                                    ["Flathead", "Flathead", "MT"],
                                    ["Clarks Fork Yellowstone", "Clarks Fork Yellowstone", "MT"],
                                    ["Boulder and East Boulder", "Boulder and East Boulder", "MT"],
                                    ["Blackfoot-Sun", "Blackfoot-Sun", "MT"],
                                    ["Bitterroot", "Bitter Root", "MT"],
                                    ["Bighorn", "Bighorn", "MTWY"]
                                    //,
                                    //["All", "all"]
			];

			var strURLPrefix = "index.html?H2O_ID=";
			var strURLPrefixBasin = "index.html?Basin_ID=";
			var strURLSuffix = "";
			document.addEventListener("click", closeAllSelect);

			var selBasin = document.getElementById("sel_Basin");
            for (var i = 0; i < app.arrayNavListBasin.length; i++) {
				var a = document.createElement("a");
				var newItem = document.createElement("option");
                a.textContent = app.arrayNavListBasin[i][0];
				a.setAttribute('role', "presentation");

                a.setAttribute('href', strURLPrefixBasin + app.arrayNavListBasin[i][1] + strURLSuffix);
				newItem.appendChild(a);
				selBasin.add(newItem, i+1);

                if ((app.arrayNavListBasin[i][1] == app.Basin_ID) | (app.arrayNavListBasin[i][0] == app.Basin_ID)) {				//set the region/basin in the dropdown!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    selBasin.options[i + 1].selected = true;
                    app.StateArea = app.arrayNavListBasin[i][2];
				}
			}
            
            //////////////////////////////////////////////////////////////////////////////
            //////////////////////////////dates///////////////////////////////////////
            //////////////////////////////////////////////////////////////////////////////
            let dteTempCurrentDate = new Date();
            let currentHours = dteTempCurrentDate.getHours();
            currentHoursEnd = ("0" + currentHours).slice(-2);
            let currentMinutes = dteTempCurrentDate.getMinutes();
            currentMinutes = ("0" + currentMinutes).slice(-2);
            let currentSectonds = dteTempCurrentDate.getSeconds();
            currentSectonds = ("0" + currentSectonds).slice(-2);
            let strTempTimeOnly = "T" + currentHoursEnd + ":" + currentMinutes + ":" + currentSectonds;


            if (getTokens()['endDate'] == undefined) {
                app.pSup.m_EndDateTime = new Date();
            } else {
                let dteTempEndDate1 = new Date(getTokens()['endDate']);
                let dteTempEndDate1B = addHoursToDate(dteTempEndDate1, 7);;  //convert day/time to local
                function addHoursToDate(date, hours) {
                    return new Date(new Date(date).setHours(date.getHours() + hours));
                }

                let strEndMonth = dteTempEndDate1B.getMonth() + 1;
                strEndMonth = ("0" + strEndMonth).slice(-2);
                let strEndDay = dteTempEndDate1B.getDate();
                strEndDay = ("0" + strEndDay).slice(-2);

                app.pSup.m_EndDateTime = new Date(dteTempEndDate1B.getFullYear().toString() + "-" + strEndMonth + "-" + strEndDay + strTempTimeOnly);
            }

            app.Days4Analisis = 3;
            if ((app.Basin_ID == "Upper Clark Fork") | (app.H2O_ID == "Blackfoot") | (app.H2O_ID == "Upper Clark Fork") | (app.H2O_ID == "Flint-Rock")) {                      /////Determine what analysis method and number of days for anlaysis
                app.Days4Analisis = 5;
                app.pSup.m_CFSAnlaysisType = "4of5Average";
                $("#strFlowStatusMethod").html("Status Method: if daily average flow falls below daily enforceable flow rate during 4 out of 5 consecutive days");
            }
            document.getElementById("txtFromToDate").innerHTML = "Gage readings may be provisional, Conditions based on gage readings of the last " + app.Days4Analisis.toString() + " days "
            
            let diffTime = null;
            let diffDays = null;

            if (getTokens()['startDate'] == undefined) {
                app.pSup.m_StartDateTime = new Date();
                app.pSup.m_StartDateTime.setDate(app.pSup.m_StartDateTime.getDate() - app.Days4Analisis);
                app.pSup.m_StartDateTimeAnalysis = new Date(app.pSup.m_StartDateTime);
                app.pSup.m_StartDateTimeAnalysisTEMP = new Date(app.pSup.m_StartDateTime);

                diffTime = Math.abs(app.pSup.m_EndDateTime - app.pSup.m_StartDateTime);
                diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            } else {
                let dteTempStartDate1 = new Date(getTokens()['startDate']);
                let dteTempStartDate1B = addHoursToDate(dteTempStartDate1, 7);;  //convert day/time to local

                let strStartMonth = dteTempStartDate1B.getMonth() + 1;
                strStartMonth = ("0" + strStartMonth).slice(-2);
                let strStartDay = dteTempStartDate1B.getDate();
                strStartDay = ("0" + strStartDay).slice(-2);

                app.pSup.m_StartDateTime = new Date(dteTempStartDate1B.getFullYear().toString() + "-" + strStartMonth + "-" + strStartDay + strTempTimeOnly);
                diffTime = Math.abs(app.pSup.m_EndDateTime - app.pSup.m_StartDateTime);
                diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                app.pSup.m_StartDateTimeAnalysisTEMP = new Date(app.pSup.m_StartDateTime);

                if (diffDays > app.Days4Analisis) {                                     ///for FLOW, if the date range is greater than the days4analysis then base the start date from end date
                    app.pSup.m_StartDateTimeAnalysis = new Date(app.pSup.m_EndDateTime);
                    app.pSup.m_StartDateTimeAnalysis.setDate(app.pSup.m_StartDateTimeAnalysis.getDate() - app.Days4Analisis);
                } else {
                    app.pSup.m_StartDateTimeAnalysis = new Date(app.pSup.m_StartDateTime);
                }

                if (diffDays > 3) {                                     ///FOR TEMPERATURE, if the date range is greater than the days4analysis then base the start date from end date
                    app.pSup.m_StartDateTimeAnalysisTEMP = new Date(app.pSup.m_EndDateTime);
                    app.pSup.m_StartDateTimeAnalysisTEMP.setDate(app.pSup.m_StartDateTimeAnalysisTEMP.getDate() - 3);
                } else {
                    app.pSup.m_StartDateTimeAnalysisTEMP = new Date(app.pSup.m_StartDateTime);
                }
                                
            }
            

            const inputDatePicker = document.getElementById("input-date-picker");
            if (inputDatePicker) {
                inputDatePicker.value = [app.pSup.m_StartDateTime, app.pSup.m_EndDateTime];  ////////set the values in the date range picker
            };

            var btnChangeDateRange = document.getElementById('btnChangeDateRange');
            btnChangeDateRange.onclick = function () {
                let diffTime = Math.abs(new Date(inputDatePicker.value[1]) - new Date(inputDatePicker.value[0]));
                let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 70) {
                    $("#txtDateRangeMessage").html("DATE RANGE MUST BE LESS THAN 70 DAYS TO PROCEED"); 
                } else {
                    $("#txtDateRangeMessage").html(""); 

                    let strRCTURL = window.location.href;
                    let str2Remove = "";
                    // string manipulation to ensure the new URL is correct
                    if (strRCTURL.indexOf("startDate") > -1) {
                        str2Remove = strRCTURL.slice(strRCTURL.indexOf("startDate") - 1, strRCTURL.indexOf("&endDate"));  //get the start date and value to remove
                        strRCTURL = strRCTURL.replace(str2Remove, "");
                    }
                    if (strRCTURL.indexOf("endDate") > -1) {
                        str2Remove = strRCTURL.slice(strRCTURL.indexOf("&endDate="), strRCTURL.length);  //get the end date and value to remove
                        strRCTURL = strRCTURL.replace(str2Remove, "");
                    }
                    let strURLPrefix = "";
                    if (strRCTURL.indexOf("index.html") == -1) {
                        strURLPrefix = "index.html";
                    }
                    if (strRCTURL.indexOf("?") == -1) {
                        strURLPrefix += "?";
                    } else {
                        strURLPrefix += "&";
                    }
                    strRCTURL += strURLPrefix + "startDate=" + inputDatePicker.value[0] + "&endDate=" + inputDatePicker.value[1];
                    window.open(strRCTURL, "_self");
                }
            };
            //////////////////////////////////////////////////////
            

            $("#dropDownId").append("<li><a data-value='American Whitewater Difficulty and Flow'>American Whitewater Difficulty and Flow</a></li>")
            $("#dropDownId").append("<li><a data-value='FEMA Flood Layer Hazard Viewer'>FEMA Flood Layer Hazard Viewer</a></li>")

            if (!(app.blnPickArea)){

                if (app.StateArea.indexOf("CO") > -1) {
                    $("#dropDownId").append("<li><a data-value='BOR Basin Status Maps'>BOR Basin Status Maps</a></li>")
                    $("#dropDownId").append("<li><a data-value='CO DWR Surface Water Stations'>CO DWR Surface Water Stations</a></li>")
                }
                if (app.StateArea.indexOf("MT") > -1) {
                    $("#dropDownId").append("<li><a data-value='GYE Aquatic Invasives'>GYE Aquatic Invasives</a></li>")
                    $("#dropDownId").append("<li><a data-value='MT Channel Migration Zones'>Channel Migration Zones</a></li>")
                    $("#dropDownId").append("<li><a data-value='MT DNRC Fire Map'>MT DNRC Fire Map</a></li>")
                    $("#dropDownId").append("<li><a data-value='MT DNRC Stream and Gage Explorer'>MT DNRC Stream and Gage Explorer</a></li>")
                    $("#dropDownId").append("<li><a data-value='Official MT FWP (closures, etc.)'>Official MT FWP (closures, etc.)</a></li>")
                }

                if (app.Basin_ID == "Upper Clark Fork") {
                    $("#dropDownId").append("<li><a data-value='MT DNRC Upper Clark Fork & Blackfoot Water Rights'>MT DNRC Upper Clark Fork & Blackfoot Water Rights</a></li>")
                }
            }
            $("#dropDownId").append("<li><a data-value='National Water Prediction Service'>National Water Prediction Service</a></li>")

            $("#dropDownId").append("<li><a data-value='NRCS iMap-Basin Snow Water Equivalent'>NRCS iMap-Basin Snow Water Equivalent</a></li>")
            $("#dropDownId").append("<li><a data-value='USGS National Water Dashboard'>USGS National Water Dashboard</a></li>")

			var x, i, j, l, ll, selElmnt, a, b, c;
			/*look for any elements with the class "custom-select":*/

			x = document.getElementsByClassName("custom-select");
			l = x.length;
			for (i = 0; i < l; i++) {
				selElmnt = x[i].getElementsByTagName("select")[0];
				ll = selElmnt.length;
				/*for each element, create a new DIV that will act as the selected item:*/
				a = document.createElement("DIV");
				a.setAttribute("class", "select-selected");
				a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
				x[i].appendChild(a);
				/*for each element, create a new DIV that will contain the option list:*/
				b = document.createElement("DIV");
				b.setAttribute("class", "select-items select-hide");
				for (j = 1; j < ll; j++) {
					/*for each option in the original select element, create a new DIV that will act as an option item:*/
					c = document.createElement("DIV");
					c.innerHTML = selElmnt.options[j].innerHTML;
					c.addEventListener("click", function (e) {
						/*when an item is clicked, update the original select box,and the selected item:*/
						var y, i, k, s, h, sl, yl;
						s = this.parentNode.parentNode.getElementsByTagName("select")[0];
						sl = s.length;
						h = this.parentNode.previousSibling;
						for (i = 0; i < sl; i++) {
							if (s.options[i].innerHTML == this.innerHTML) {
								s.selectedIndex = i;
								h.innerHTML = this.innerHTML;
								y = this.parentNode.getElementsByClassName("same-as-selected");
								yl = y.length;
								for (k = 0; k < yl; k++) {
									y[k].removeAttribute("class");
								}
								this.setAttribute("class", "same-as-selected");
								break;
							}
						}
						h.click();
					});
					b.appendChild(c);
				}
				x[i].appendChild(b);
				a.addEventListener("click", function (e) {
					/*when the select box is clicked, close any other select boxes,	and open/close the current select box:*/
					e.stopPropagation();
					closeAllSelect(this);
					this.nextSibling.classList.toggle("select-hide");
					this.classList.toggle("select-arrow-active");
					//alert("matt test");
				});
			}

			if (getTokens()['UMHBanner'] != undefined) {
				$('#UMH_NavBar2').show();
				document.body.style.paddingTop = '130px';
				UMH_NavBar1.style.paddingTop = '80px';
			}

            app.test = false;
            var strTest = getTokens()['test'];
            if (strTest != undefined) {
                if (strTest.toUpperCase() == 'TRUE') {
                    app.test = true;
                }
            }

            var strHeadertextArgument = getTokens()['UseAlternateHeader'];
            var blnUseAlternateHeader = false;
            if (strHeadertextArgument != undefined){
                if (strHeadertextArgument.toUpperCase() == "TRUE") {
                    blnUseAlternateHeader = true;
                    strURLSuffix = "&UseAlternateHeader=TRUE";
                }
            }

            var ulist = document.getElementById("navList");  //build the naviation options in the header nav bar
            for (var i = 0; i < arrayNavList.length; i++) {
                var a = document.createElement("a");
                var newItem = document.createElement("li");
                a.textContent = arrayNavList[i][0];
                a.setAttribute('role', "presentation");

                let strWatershedClickURL = strURLPrefix + arrayNavList[i][1] + strURLSuffix;

                //determine of watershed found in multiple basins
                iBCounter = 0;
                for (var iB = 0; iB < app.arrayEntireList.length; iB++) {
                    if (arrayNavList[i][1] == app.arrayEntireList[iB][1]) {
                        iBCounter += 1;
                    }
                }
                if (iBCounter > 1) {
                    strWatershedClickURL += "&Basin_ID=" + app.Basin_ID;
                }
                
                a.setAttribute('href', strWatershedClickURL);

                newItem.appendChild(a);
                ulist.appendChild(newItem);
            }


            app.idx11 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];  //PRODUCTION
			//app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/RCT_Support/FeatureServer/";  //PRODUCTION "RCT Core Geospatial" Layers
            //app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/RCT_Support_FY22/FeatureServer/";//PRODUCTION RCT Support FY22


            app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/RCT_Edits_Tyler_view/FeatureServer/"; //Tyler Dev Edit


            //app.strHFL_URL = "https://services.arcgis.com/9ecg2KpMLcsUv1Oh/arcgis/rest/services/Oct29_NewLayer/FeatureServer/";  //Vaughn's Dev
            //app.idx11 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];    //Vaughn's Dev


            //app.strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/RCT_Support_FY22_multi/FeatureServer/";  //dev to test multi-gage per section
            //app.idx11 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];  //PRODUCTION

            //////////////////////////////////////////determine if gaged reservoirs exist/////////////////////////////
            //////////////////////////////////////////determine if gaged reservoirs exist/////////////////////////////
            if (!(app.blnPickArea)) {  // run if area specified
                let queryObject = new Query();
                let strReservoirQuery = this.getQueryDefs1_4()[4];// this is strQueryDef2
                queryObject.where = strReservoirQuery;
                queryObject.returnGeometry = false;
                queryObject.outFields = ["*"];
                query.executeQueryJSON(app.strHFL_URL + app.idx11[7], queryObject).then(function (results) {
                    let blnFeaturesExist = false;
                    let pFeatures = results.features;
                    var resultCount = pFeatures.length;
                    if (resultCount > 0) {
                        blnFeaturesExist = true;
                    }
                    app.blnReservoirGagesExist = blnFeaturesExist;

                    if (blnFeaturesExist) {
                        document.getElementById("entriesConRESERVOIR_div").style.display = 'inline';
                    }

                    this.app.pSup.GetSetHeaderWarningContent(app.strHFL_URL + app.idx11[11], app.H2O_ID, blnUseAlternateHeader, app.Basin_ID);  //this will eventually trigger Phase2
                }).catch(function (error) {
                    console.log("ReturnFeaturesExist_YesNo, error: ", error.message);
                });;
            }
            else {
                app.pSup.Phase2();
            }
        },

        Phase2: function () {

            if (typeof app.H2O_ID != 'undefined') {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 10;
            } else {
                var arrayCenterZoom = [-112.0163, 46.5857];
                var izoomVal = 11;
            }
                        
            esriConfig.apiKey = "AAPK47ae32508072459cb3fa84646f0f3928F7dRMTNaroq-OYC7WBC-O1R3frCJVtlOtnnJ-hSUIKUXJPaglsAO9sQ4AxRYBPy_";

            app.map = new Map({ basemap: "" }); // Basemap layer
            //app.map = new Map({ basemap: "arcgis-national-geographic" }); // Basemap layer
            app.map = new Map({ basemap: "osm" }); // Basemap layer
            app.view = new MapView({  //app.map = BootstrapMap.create("mapDiv", { basemap: "topo", center: arrayCenterZoom, zoom: izoomVal, scrollWheelZoom: false});// Get a reference to the ArcGIS Map class
                map: app.map,
                center: arrayCenterZoom,
                zoom: izoomVal, // scale: 72223.819286
                container: "mapDiv",
                constraints: {
                    snapToZoom: false
                }
            });

            const locateBtn = new Locate({
                view: app.view
            });
            app.view.ui.add(locateBtn, {
                position: "top-left"
            });

            let iPateWidth = getPageWidth();
            domStyle.set("mapDiv", "height", iPateWidth - 50 + "px");  //change map height on open based on width - 50,  bootstrap/ESRI map width changes automatically on open but height does not

            app.view.watch("widthBreakpoint", function (newVal) {
                if (newVal === "xsmall") {
                    console.log("resized", "");
                }
                if (newVal === "small") {
                    console.log("resized", "");
                }
            });

            app.view.when(function () {
                mapLoaded();
            })
            
            const allowedBasemapTitles = ["Imagery Hybrid", "OpenStreetMap", "Dark Gray Canvas"];
            //const allowedBasemapTitles = ["Imagery Hybrid", "Topographic", "Dark Gray Canvas"];
            const source = new PortalSource({                // filtering portal basemaps
                filterFunction: (basemap) => allowedBasemapTitles.indexOf(basemap.portalItem.title) > -1
            });
            const basemapGallery = new BasemapGallery({
                showArcGISBasemaps: true,
                view: app.view,
                source: source
            }, "basemapGallery");
                        
            let scaleBar = new ScaleBar({
                view: app.view,
                container: "scaleDiv",
                unit: "dual"
            });
            
            let template = new PopupTemplate();
            template.title = "Gage (Watershed:{Watershed})";
            template.content = "<b>{GageTitle}</b><br><a href={GageURL} target='_blank'>Link to gage at {Agency} website</a>";
            var pGageFeatureLayer = new FeatureLayer({ url: app.strHFL_URL + app.idx11[1], popupTemplate: template });


            if ((app.Basin_ID == "Upper Clark Fork") | (app.Basin_ID == "Blackfoot-Sun") | (app.H2O_ID == "Blackfoot") | (app.H2O_ID == "Upper Clark Fork") | (app.H2O_ID == "Flint - Rock")) {  //since the Turah gage is used for a conservation target for all, add this gage
                let HighlightedGage_Renderer = {
                    type: "simple",  // autocasts as new SimpleRenderer()
                    symbol: {
                        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                        //path: "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z",
                        size: 30,
                        color: [186, 85, 255, 0.5], //crocus
                        outline: {  // autocasts as new SimpleLineSymbol()
                            width: 0.5,
                            color: "white"
                        }
                    }
                };

                const EndPoints_labelClass = {// autocasts as new LabelClass()
                    symbol: {
                        type: "text",  // autocasts as new TextSymbol()
                        color: [60, 0, 100],
                        haloColor: "white",
                        haloSize: 1,
                        font: {  // autocast as new Font()
                            family: "arial",
                            size: 15,
                            weight: "bold"
                        }
                    },
                    labelPlacement: "center-right",
                    //labelPlacement: "right-center",
                    labelExpressionInfo: {
                        expression: "Replace(Replace(Replace(Replace(Replace($feature.GageTitle, 'Blackfoot River near ',''), 'Clark Fork at ',''),' Bridge nr Bonner ',''),' MT',''), 'MT','') + ' Gage'"
                        //expression: "'Turah Gage'"
                    },
                    //minScale: 600000
                };
                
                var pGageFeatureLayerHighlighted = new FeatureLayer({
                    url: app.strHFL_URL + app.idx11[1],
                    renderer: HighlightedGage_Renderer,
                    labelingInfo: [EndPoints_labelClass],
                    popupTemplate: template
                });



                pGageFeatureLayerHighlighted.definitionExpression = "(GageTitle = 'Clark Fork at Turah Bridge nr Bonner MT') OR (GageTitle = 'Blackfoot River near Bonner MT')";
            }


            const EndPoints_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: [255, 26, 238],
                    font: {  // autocast as new Font()
                        family: "arial",
                        size: 9,
                        weight: "bold"
                    }
                },
                labelPlacement: "above-center",
                labelExpressionInfo: {
                    expression: "$feature.Start_End + ' of ' + $feature.Section_Name"
                },
                minScale: 600000
            };

            pEPointsFeatureLayer = new FeatureLayer({
                //url: app.strHFL_URL + "0",
                url: app.strHFL_URL + app.idx11[0],
                /*popupTemplate: templateEPOINT,*/
                minScale: 1000000,
                labelingInfo: [EndPoints_labelClass]
            });

            let strQueryDef1 = this.getQueryDefs1_4()[0]; //endpoints
            let strQueryDef2 = this.getQueryDefs1_4()[1]; //stream sections
            let strQueryDef3 = this.getQueryDefs1_4()[2]; //watersheds
            let strQueryDef4 = this.getQueryDefs1_4()[3]; //watershed mask
            let strQueryDef5 = this.getQueryDefs1_4()[4]; //Reservoir
            

            let strlabelField3 = "SectionName";
            const Secitons_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: new Color([0, 0, 128]),
                    font: { family: "arial", size: 10 },
                    setAlign: { setAngle: 45 }
                },
                labelPlacement: "center-along",
                labelRotation: false,
                labelExpressionInfo: { expression: "$feature." + strlabelField3 },
                minScale: 1500000
            };

            app.SectionQryStringGetGageData = strQueryDef2;
            app.ReservoirQryStringGetGageData = strQueryDef5;
            pEPointsFeatureLayer.definitionExpression = strQueryDef1;


            pSectionsFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[5],
                opacity: 0.9,
                labelingInfo: [Secitons_labelClass], outFields: ["StreamName", "SectionID", "SectionName"]
                //,
                //popupTemplate: templateSections
            });
            pSectionsFeatureLayer.definitionExpression = strQueryDef2;
            app.pGetWarn.m_strSteamSectionQuery = strQueryDef2;


            pLakeResFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[7],
                opacity: 0.9,
                outFields: ["Lake_Reservoir_Name", "ResFlood_ft", "Agency", "GageURL1", "GageURL2", "Gage_Name ", "Watershed", "Basin", "StreamSystem", "TeaCupURL"]
                //,
                //popupTemplate: templateSections
            });
            pLakeResFeatureLayer.definitionExpression = strQueryDef2;
            

            app.view.when(() => {      /// this code adds popup content on the fly
                // Watch for when features are selected
                app.view.popup.watch("selectedFeature", (graphic) => {
                    console.log(app.view.popup.featureCount.toString() + " featureCount");
                    //console.log(app.view.popup.features.length.toString() + " featureCount");
                    let pFeatures = app.view.popup.features;   //determine if multiple gages or multiple sections selected to minimize the duplication of current data
                    let iGageCount = 0;
                    let iSectionCount = 0;
                    let iOtherCount = 0;
                    for (var iF = 0; iF < pFeatures.length; iF++) {
                        let pFeature = pFeatures[iF];
                        if (pFeature.attributes.GageURL) {
                            iGageCount += 1;
                        } else if (pFeature.attributes.SectionName) {
                            iSectionCount += 1;
                        } else {
                            iOtherCount += 1;
                        }
                    }

                    if (graphic) {
                        let atts = graphic.attributes;
                        if (atts.GageURL) {        ///this looks for stream gage features and adds content
                            const graphicTemplate = graphic.getEffectivePopupTemplate();

                            let strSelectedGageid = atts.GageURL.replace("https://waterdata.usgs.gov/monitoring-location/", "");
                            strSelectedGageid = strSelectedGageid.substring(0, strSelectedGageid.search("/"));

                            let strAdditionalPopup = "";
                            let strImageURLPrefix = document.location.href;                           //grabbing the URL due to images not visible via relative pathing
                            if (strImageURLPrefix.indexOf("?") > 0) {
                                strImageURLPrefix = strImageURLPrefix.slice(0, strImageURLPrefix.lastIndexOf("?") + 0);
                            }
                            strImageURLPrefix = strImageURLPrefix.replace("/index.html", "");

                            if (iGageCount > 1) {
                                if (!(app.blnPickArea)) {
                                    strAdditionalPopup = "<br><i>Note: Selecting 1 stream gage will provide details (zoom into map for detail)</i>";
                                }
                            } else {

                                let vm1 = new app.pGage.readingsViewModel();
                                for (var i = 0; i < vm1.gageRecords().length; i++) {
                                    let strSelectedGageURL = atts.GageURL.toUpperCase();
                                    let strGage2Compare = vm1.gageRecords()[i].Hyperlink;
                                    if (strGage2Compare.indexOf("/location/") > 0) {     //removing /location/ text becuase some of the DNRC gage hyperlinks differ from the gageURL
                                        strGage2Compare = strGage2Compare.replace("/location/", "/");
                                    }
                                    strGage2Compare = strGage2Compare.toUpperCase();
                                    console.log(strGage2Compare + ":vs:" + strSelectedGageURL + "-----" + strGage2Compare.search(strSelectedGageid).toString());
                                    if ((strGage2Compare == strSelectedGageURL) |
                                        (strGage2Compare.search(strSelectedGageid) > -1) |
                                        (strGage2Compare.replace("STAGE/GAGE-REPORT/","STAGE/GAGE-REPORT/LOCATION/") == strSelectedGageURL)){
                                        strAdditionalPopup = '<br>Discharge:' + vm1.gageRecords()[i].Discharge + ' CFS <img height="15px"  src="' + strImageURLPrefix + '/' + vm1.gageRecords()[i].Day3CFSTrend + '" alt="3 day Flow Trend"><br>' +
                                            'Water Temp: ' + vm1.gageRecords()[i].WaterTemp + ' F <img height="15px"  src="' + strImageURLPrefix + '/' + vm1.gageRecords()[i].Day3TMPTrend + '" alt="3 day Temp Trend"><br>' +
                                            'Gage Height: ' + vm1.gageRecords()[i].GageHt + ' ft <img height="15px"  src="' + strImageURLPrefix + '/' + vm1.gageRecords()[i].Day3HtTrend + '" alt="3 day Height Trend">';
                                        break
                                    }
                                }
                            }
                            if (strAdditionalPopup == "") {
                                if (!(app.blnPickArea)){
                                    strAdditionalPopup = "<br><i>Note: Selected gage is not a summary (trigger) measure locaton in the filtered area</i>";
                                }
                            }
                            let pGraphicTempContent = graphicTemplate.content;
                            pGraphicTempContent = pGraphicTempContent.slice(0, pGraphicTempContent.lastIndexOf("</a>") + 4);  //remove the custom onthefly content that was added
                            graphicTemplate.content = pGraphicTempContent + strAdditionalPopup;
                        }
                    }
                });
            });


            pBasinsFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[8],
                opacity: 0.5, id: "Basins", outFields: ["*"]
            });
            if (app.Basin_ID != undefined) {
				if (app.Basin_ID == "UMH") {
                    pBasinsFeatureLayer.definitionExpression = "Name = 'Upper Missouri Headwaters'";
				} else {
                    pBasinsFeatureLayer.definitionExpression = "Name = '" + app.Basin_ID + "'";
				}
            }


            let vColor22 = new Color("#3F3F40");
            let vDarkGreyColor = new Color("#3F3F40");
            var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels

            let templateBLM = new PopupTemplate();
            templateBLM.title = "<b>BLM Facility</b>";
            templateBLM.content = "{FacilityName}<br><a href={BLMFacURL} target='_blank'>Link to BLM Facility</a>";
            const BLM_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: vDarkGreyColor,
                    font: { family: "arial", size: 9}
                },
                labelPlacement: "above-center",
                labelExpressionInfo: { expression: "$feature.FacilityName" }
            };
            let pBLMFeatureLayer = new FeatureLayer({
                url: "https://gis.blm.gov/arcgis/rest/services/recreation/BLM_Natl_Recreation_Sites_Facilities/MapServer/0",
                popupTemplate: templateBLM, opacity: 0.5,
                visible: false, labelingInfo: [BLM_labelClass]
            });

            let templateBLM_Rec = new PopupTemplate();
            templateBLM_Rec.title = "<b>BLM Rec. Site</b>";
            templateBLM_Rec.content = "{RecAreaName}<br><a href={BLMRecURL} target='_blank'>Link to BLM Rec. Site</a>";
            const BLM_Rec_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: vDarkGreyColor,
                    font: { family: "arial", size: 9 }
                },
                labelPlacement: "above-center",
                labelExpressionInfo: { expression: "$feature.RecAreaName" }
            };
            let pBLM_RecFeatureLayer = new FeatureLayer({
                url: "https://gis.blm.gov/arcgis/rest/services/recreation/BLM_Natl_Recreation_Sites_Facilities/MapServer/3",
                popupTemplate: templateBLM_Rec, opacity: 0.5,
                visible: false, labelingInfo: [BLM_Rec_labelClass]
            });

            if (!(app.blnPickArea)) {
                if (app.StateArea.indexOf("CO") > -1) {
                    let templateCOFAC = new PopupTemplate();
                    templateCOFAC.title = "<b>CPW Facility</b>";
                    templateCOFAC.content = "{PROPNAME} - {d_FAC_TYPE}";
                    const COFAC_labelClass = {// autocasts as new LabelClass()
                        symbol: {
                            type: "text",  // autocasts as new TextSymbol()
                            color: vDarkGreyColor,
                            font: { family: "arial", size: 9 }
                        },
                        labelPlacement: "above-center",
                        labelExpressionInfo: { expression: "$feature.PROPNAME + ' - ' + $feature.d_FAC_TYPE" }
                    };
                    var pCOFACFeatureLayer = new FeatureLayer({
                        url: "https://services1.arcgis.com/Ezk9fcjSUkeadg6u/ArcGIS/rest/services/Colorado_Parks_and_Wildlife_Facilities/FeatureServer/0",
                        popupTemplate: templateCOFAC, opacity: 0.5,
                        visible: false, labelingInfo: [COFAC_labelClass]
                    });
                }
                
                if (app.StateArea.indexOf("MT") > -1) {
                    var templateFWPAISAccess = new PopupTemplate();
                    templateFWPAISAccess.title = "Montana AIS Watercraft Access";
                    templateFWPAISAccess.content = "{SITENAME}</br>{ACCESSTYPE}</br>{WATERBODY}</br>{STATUS}</b>";
                    var pFWPAISAccessFeatureLayer = new FeatureLayer({
                        url: "https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FISH_AIS_WATERCRAFT_ACCESS/FeatureServer/0",
                        popupTemplate: templateFWPAISAccess, minScale: 5200000, visible: false
                    });

                    let templateFAS = new PopupTemplate();
                    templateFAS.title = "MT FAS (Fishing Access Site)";
                    templateFAS.content = "<b>{NAME}</b><br>{BOAT_FAC}<br><a href={WEB_PAGE} target='_blank'>Link to Fish Access Site</a>";
                    const FAS_labelClass = {// autocasts as new LabelClass()
                        symbol: {
                            type: "text", color: vColor22,
                            font: { family: "arial", size: 9, weight: "bold" }
                        },
                        labelPlacement: "above-center",
                        labelExpressionInfo: { expression: "$feature.NAME" }
                    };
                    var pFASFeatureLayer = new FeatureLayer({
                        url: "https://services3.arcgis.com/Cdxz8r11hT0MGzg1/arcgis/rest/services/FWPLND_FAS_POINTS/FeatureServer/0",
                        popupTemplate: templateFAS,
                        opacity: 0.5,
                        visible: false,
                        labelingInfo: [FAS_labelClass]
                    });
                    //////////////////////////
                    let sfsr_MTSP = {
                        type: "simple",  // autocasts as new SimpleRenderer()
                        symbol: { // autocasts as new SimpleFillSymbol()
                            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                            color: [57, 168, 87, 0.45],
                            style: "solid",
                            outline: {  // autocasts as new SimpleLineSymbol()
                                color: [29, 112, 52],
                                width: 0.1
                            }
                        },
                    };
                    let strlabelField11 = "Name";
                    const MTSP_labelClass = {// autocasts as new LabelClass()
                        symbol: { type: "text", color: [29, 112, 52], font: { family: "arial", size: 9 } },
                        labelExpressionInfo: { expression: "$feature." + strlabelField11 },
                        minScale: 2000000
                    };

                    var templateMTSP = new PopupTemplate();
                    templateMTSP.title = "Montana State Parks";
                    templateMTSP.content = "{NAME} <a href={WEB_PAGE} target='_blank'>(link here)</a></br>{BOAT_FAC}</br>{STATUS}</b>";

                    var pMTSPFeatureLayer = new FeatureLayer({
                        url: "https://services3.arcgis.com/Cdxz8r11hT0MGzg1/ArcGIS/rest/services/FWPLND_STATEPARKS/FeatureServer/0",
                        renderer: sfsr_MTSP, "opacity": 0.9, autoGeneralize: true,
                        outFields: [strlabelField11], labelingInfo: [MTSP_labelClass], popupTemplate: templateMTSP
                    });

                }
            }

            const strSNOTELSitePageURL = "https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=";
            const strSNOTELGraphURL = "https://wcc.sc.egov.usda.gov/nwcc/view?intervalType=+View+Current+&report=WYGRAPH&timeseries=Daily&format=plot&sitenum=";
            const templateSNOTEL = {
                title: "<b>{Name} SNOTEL Site</b>",
                expressionInfos: [{
                    name: "snoTelInfo",
                    title: "% of population 16+ participating in the labor force",
                    expression: "Left($feature.stationTriplet, 3)"
                }],
                content: "<a href=" + strSNOTELSitePageURL + "{expression/snoTelInfo}" + " target='_blank'>Link to SNOTEL Site Page</a><br>" +
                         "<a href=" + strSNOTELGraphURL + "{expression/snoTelInfo}" + "&interval=WATERYEAR target='_blank'>Link to SWE Current/Historical Graphs</a>"
                
            };
            const SNOTEL_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text",  // autocasts as new TextSymbol()
                    color: vDarkGreyColor,
                    font: { family: "arial", size: 9, weight: "bold" }
                },
                labelPlacement: "above-center",
                labelExpressionInfo: { expression: "$feature.Name" }
            };

            let snoTel_Renderer = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: {
                    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                    size: 15,
                    color: [255, 255, 255, 0.75],
                    outline: {  // autocasts as new SimpleLineSymbol()
                        width: 0.5,
                        color: "black"
                    }
                }
            };

            let pSNOTELFeatureLayer = new FeatureLayer({
                url: "https://services.arcgis.com/SXbDpmb7xQkk44JV/arcgis/rest/services/stations_SNTL_ACTIVE/FeatureServer/0",
                popupTemplate: templateSNOTEL, visible: false,
                labelingInfo: [SNOTEL_labelClass],
                renderer: snoTel_Renderer
            });

            const pNOAAUSDMtemplate = {
                title: "U.S. Drought Monitor",
                content: "Drought & Dryness Category D{DM}, U.S. Area % {US_PRCNT}" + "<br />" +
                    "<a href ='https://www.drought.gov/national'>National Drought Status</a>"
                //content: "Drought & Dryness Category D{DM} U.S. Area {US_AREA} U.S. Area % {US_PRCNT}",
            };
            
            let pNOAAUSDMrenderer = {
                type: "unique-value",  // autocasts as new UniqueValueRenderer()
                field: "DM",  // contains values referenced in uniqueValueInfos
                uniqueValueInfos: [
                    {
                        value: "0",  
                        label: "D0 - Abnormally Dry",
                        symbol: {type: "simple-fill", color: new Color("#ffff00")}
                    }, {
                        value: "1",  
                        label: "D1 - Moderate Drought",
                        symbol: {type: "simple-fill", color: new Color("#fcd37f")}
                    }, {
                        value: "2",  
                        label: "D2 - Sever Drought",
                        symbol: {type: "simple-fill", color: new Color("#ffaa00")}
                    }, {
                        value: "3",  
                        label: "D3 - Extreme Drought",
                        symbol: {type: "simple-fill", color: new Color("#e60000")}
                    }, {
                        value: "4",  
                        label: "D4 - Exceptional Drought",
                        symbol: {type: "simple-fill", color: new Color("#730000")}
                    }
                ]
            };
            
            let pNOAAUSDMFeatureLayer = new GeoJSONLayer({
                url: "https://www.ncei.noaa.gov/pub/data/nidis/geojson/us/usdm/USDM-current.geojson",
                copyright: "U.S. Drought Monitor",
                popupTemplate: pNOAAUSDMtemplate,
                renderer: pNOAAUSDMrenderer,
                visible: false,
                opacity: 0.5
            });


            const templateNOAA = { //auto cast of PopupTemplate
                title: "{STATION_NAME} ({ICAO}) Weather",
                content: populationChange,
                fieldInfos: [
                    { fieldName: "STATION_NAME", format: { digitSeparator: true, places: 0 } },
                    { fieldName: "TEMP", format: { digitSeparator: true, places: 0 } },
                    { fieldName: "WIND_SPEED", format: { digitSeparator: true, places: 0 }}, 
                    {fieldName:  "WIND_DIRECT", format: {digitSeparator: true, places: 2}
                }]
            };

            function populationChange(feature) {
                const div = document.createElement("div");
                let iMPH = Math.round(feature.graphic.attributes.WIND_SPEED * 0.6214);
                let iDegreesTemp = feature.graphic.attributes.WIND_DIRECT;
                let iDegreesDispaly;

                let strDirection;
                if (iDegreesTemp == null) {
                    strDirection = "not reported";
                    iDegreesDispaly = "";
                } else {
                    const directions = ['Northerly', 'Northeasterly', 'Easterly', 'Southeasterly', 'Southerly', 'Southwesterly', 'Westerly', 'Northwesterly'];  // Define array of directions
                    iDegreesTemp = iDegreesTemp * 8 / 360;  // Split into the 8 directions
                    iDegreesTemp = Math.round(iDegreesTemp, 0);  // round to nearest integer.
                    iDegreesTemp = (iDegreesTemp + 8) % 8; // Ensure it's within 0-7
                    strDirection = directions[iDegreesTemp] +",";

                    iDegreesDispaly = feature.graphic.attributes.WIND_DIRECT + String.fromCharCode(176);
                }

                div.innerHTML =
                    "Temperature: <b>" + Math.round(feature.graphic.attributes.TEMP) + String.fromCharCode(176) + " F</b> <br>" +
                    "Windspeed: <b>" + iMPH + " mph / " + Math.round(feature.graphic.attributes.WIND_SPEED) + " kph" + "<br></b>" +
                    "Wind Direction <b>" + strDirection + "</b> " + iDegreesDispaly + "<br/> <br/>" +
                    "<a href='https://forecast.weather.gov/zipcity.php?inputstring=" + feature.graphic.attributes.ICAO + "' target='_blank'>Link to NOAA/NWS Forecast</a > <br/>" +
                    "<a href='https://forecast.weather.gov/data/obhistory/" + feature.graphic.attributes.ICAO + ".html' target='_blank'>Link to NOAA/NWS Observations</a > <br/>" +
                    "<a href='https://www.windy.com/airport/" + feature.graphic.attributes.ICAO + "' target='_blank'>Link to Wind</a >";
                return div;
            };

            const NOAA_labelClass = {// autocasts as new LabelClass()
                symbol: {
                    type: "text", color: vDarkGreyColor,
                    font: { family: "arial", size: 9, weight: "bold" }
                },
                labelPlacement: "above-center",
                labelExpressionInfo: { expression: "$feature.ICAO + textformatting.NewLine + 'Weather'" }
                //labelExpressionInfo: { expression: "$feature.STATION_NAME + textformatting.NewLine + 'Weather'" }
            };

            let pNOAAFeatureLayer = new FeatureLayer({
                //url: "https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/obs_meteoceanhydro_insitu_pts_geolinks/MapServer/1",
                //url: "https://maps1.arcgisonline.com/arcgis/rest/services/NWS_Weather_Stations/MapServer/4",
                url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NOAA_METAR_current_wind_speed_direction_v1/FeatureServer/0",
                popupTemplate: templateNOAA,
                visible: false,
                outFields:["*"],
                //minScale: 5000000,
                labelingInfo: [NOAA_labelClass]
            });

            let templateFWP = new PopupTemplate();
            templateFWP.title = "Official Stream Restriction";
            templateFWP.content = "<b>{TITLE}</b><br>{WATERBODY}<br>{DESCRIPTION} Publish Date:{PUBLISHDATE}";
            app.strFWPURL = "https://services3.arcgis.com/Cdxz8r11hT0MGzg1/ArcGIS/rest/services/FISH_WATERBODY_RESTRICTIONS/FeatureServer/0";

            let strDateTime = app.pGage.GetDatesForRunningRCT()[1];
            let strDateTimeUserFreindly = app.pGage.GetDatesForRunningRCT()[3];;
            let strDateTimeMinus3 = app.pGage.GetDatesForRunningRCT()[0];
            let strDateTimeMinus3UserFreindly = app.pGage.GetDatesForRunningRCT()[2];
            let strStartDateTimeUserFreindly = app.pGage.GetDatesForRunningRCT()[5];

            console.log(app.pGage.GetDatesForRunningRCT()[0] + " " + app.pGage.GetDatesForRunningRCT()[1] + " " + app.pGage.GetDatesForRunningRCT()[2] + " " + app.pGage.GetDatesForRunningRCT()[3]);
            
            if (app.test) {                //app.strFWPURL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/TestH2ORest/FeatureServer/0";
                app.strFWPQuery = "(PUBLISHDATE > '7/15/2017') AND (PUBLISHDATE < '7/20/2017')";
            } else {
                //if dealing with an earier date then consider the start and end dates, otherwise look for the open Official Closure
                let dteToday = new Date();
                dteToday.setDate(dteToday.getDate() - 1);  //round to yesterdays date 

                if (app.pSup.m_EndDateTime < dteToday) {  
                    app.strFWPQuery = "(PUBLISHDATE < '" + strDateTimeUserFreindly + "') AND (ARCHIVEDATE > '" + strStartDateTimeUserFreindly + "')";                    
                } else {
                    app.strFWPQuery = "(ARCHIVEDATE IS NULL) OR (ARCHIVEDATE > '" + strDateTimeUserFreindly + "')";
                }
            }
			            
            let sfsr_FWP = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: {
                    type: "simple-fill", color: [255, 0, 0, 0.25], style: "solid",
                    outline: { color: [255, 0, 0], width: 5 }
                },  
            };

            let pFWPFeatureLayer = new FeatureLayer({
                url: app.strFWPURL,
                popupTemplate: templateFWP, "opacity": 0.6, renderer: sfsr_FWP, visible: true
            });
            pFWPFeatureLayer.definitionExpression = app.strFWPQuery;

            let pCartoFeatureLayer = new FeatureLayer({ url: app.strHFL_URL + app.idx11[4],  "opacity": 0.9, autoGeneralize: true});


            //const pCartoPoly_labelClass = {// autocasts as new LabelClass()
            //    symbol: {
            //        type: "text", color: [127, 50, 168, 255], //purple
            //        font: { family: "arial", size: 11, weight: "bold" },
            //        haloColor: [255, 255, 255, 255],  // white
            //        haloSize: 1
            //    },
            //    labelPlacement: "above-center",
            //    //labelPlacement: "above-center",
            //    labelExpressionInfo: { expression: "$feature.Label" },
            //    minScale: 2000000
            //};
            //pCartoPoly_labelClass.deconflictionStrategy = "none";

            let sfsr_CartoPoly = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: {
                    type: "simple-fill", color: [195, 2, 219, 0.1], style: "solid",
                    outline: { color: [50, 50, 50], width: 1 }
                },
            };
            let pCartoFeatureLayerPoly = new FeatureLayer({ url: app.strHFL_URL + app.idx11[6], minScale: 1500000, "opacity": 0.9, renderer: sfsr_CartoPoly, autoGeneralize: true});
            //let pCartoFeatureLayerPoly = new FeatureLayer({url: app.strHFL_URL + app.idx11[6], "opacity": 0.9,labelingInfo: [pCartoPoly_labelClass], renderer: sfsr_CartoPoly, autoGeneralize: true});


            //let pCartoFeatureLayerPoly = new FeatureLayer({
            //    url: app.strHFL_URL + app.idx11[6], "opacity": 0.9,
            //    autoGeneralize: true });


            if (app.Basin_ID == "Flathead") {
                var templateDist2WaterTableFlathead = new PopupTemplate();
                templateDist2WaterTableFlathead.title = "Depth to Water Table, Flathead River (feet)";
                templateDist2WaterTableFlathead.content = "{DEPTH}";

                var pDist2WaterTableFlathead = new FeatureLayer({
                    url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/Flathead_River_Watershed_Layers/FeatureServer/4",
                    "opacity": 0.5, autoGeneralize: true,
                    popupTemplate: templateDist2WaterTableFlathead, visible: false
                });

                var p1964FloodFlathead = new FeatureLayer({
                    url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/Flathead_River_Watershed_Layers/FeatureServer/0",
                    "opacity": 0.5, autoGeneralize: true, visible: false
                });    
            }


            //////////////////////////

            let sfsr_Waterhsed = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: { // autocasts as new SimpleFillSymbol()
                    type: "simple-fill", color: [255, 255, 255, 0.10], style: "solid",
                    outline: { color: [0, 72, 118], width: 2 }
                },
            };

            let strlabelField1 = "Name";
            var vGreyColor = new Color("#666");              // create a text symbol to define the style of labels
            const Watershed_labelClass = {// autocasts as new LabelClass()
                symbol: { type: "text", color: vGreyColor, font: { family: "arial", size: 10 } },
                labelExpressionInfo: { expression: "$feature." + strlabelField1 },
                "deconflictionStrategy": "none",
            };

            let pWatershedsFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[9],
                renderer: sfsr_Waterhsed, "opacity": 0.9, autoGeneralize: true,
                outFields: [strlabelField1], labelingInfo: [Watershed_labelClass]
            });
            pWatershedsFeatureLayer.definitionExpression = strQueryDef3;

            //////////////////////////


            let sfsr_Mask = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: { // autocasts as new SimpleFillSymbol()
                    type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                    color: [9, 60, 114, 0.25],
                    style: "solid", outline: { color: [200, 200, 200], width: 2 }
                },
            };

            const WaterShedMask_labelClass = {
                symbol: {
                    type: "text",
                    color: [69,91,128],
                    font: {
                        family: "arial",
                        size: 9
                    }
                },
                labelExpressionInfo: {
                    expression: "$feature.Name + ' Watershed Area'"
                },
                minScale: 2000000
            }

            let pWatershedsMaskFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[9],
                renderer: sfsr_Mask, "opacity": 0.5, autoGeneralize: true,
                outFields: [strlabelField1],
                labelingInfo: [WaterShedMask_labelClass]
            });
            pWatershedsMaskFeatureLayer.definitionExpression = strQueryDef4;

            let sfsr_BasinMask = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: { // autocasts as new SimpleFillSymbol()
                    type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                    color: [26, 90, 158, 0.45],
                    style: "solid",
                    outline: {  // autocasts as new SimpleLineSymbol()
                        color: [200, 200, 200],
                        width: 0.1
                    }
                },
            };

            var pBasinsMaskFeatureLayer = new FeatureLayer({
                url: app.strHFL_URL + app.idx11[9],
                "opacity": 0.7, autoGeneralize: true, renderer: sfsr_BasinMask, minScale: 5000000,
            });
            pBasinsMaskFeatureLayer.definitionExpression = "Basin IS NULL";
            
            app.pSup.m_pRiverSymbolsFeatureLayerCFS = new FeatureLayer({
                //url: app.strHFL_URL + "10",
                url: app.strHFL_URL + app.idx11[10],
                visible: true
            });

            app.pSup.m_pRiverSymbolsFeatureLayerTemp = new FeatureLayer({
                //url: app.strHFL_URL + "10",
                url: app.strHFL_URL + app.idx11[10],
                visible: true
            });

            //app.pSup.m_pRiverSymbolsFeatureLayerHt = new FeatureLayer({
            //    //url: app.strHFL_URL + "10",
            //    url: app.strHFL_URL + app.idx11[10],
            //    visible: true
            //});


            let CSV_Renderer = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: {
                    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                    size: 15,
                    color: [238, 69, 0, 0.5], //orangeRed
                    outline: {  // autocasts as new SimpleLineSymbol()
                        width: 0.5,
                        color: "white"
                    }
                }
            };
            var pCSVTemplate = new PopupTemplate();
            pCSVTemplate.title = "<b>Monitoring Sites</b>";
            pCSVTemplate.content = "Station Name: {STATION_NAME}<br>Drainage Name: {Drainage_Name}<br><a href={URL} target='_blank'> Link monitoring data</a>";

            let pMonitoringCSVLayer = new FeatureLayer({
                url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/RCT_Monitoring_Sites/FeatureServer/0",
                visible: false,
                renderer: CSV_Renderer,
                popupTemplate: pCSVTemplate
            });

            if (app.Basin_ID == "Flathead") {
                pMonitoringCSVLayer.visible = "True";
            }

            app.graphicsLayer = new GraphicsLayer();

            //let arrayLayer2add = [app.pSup.m_pRiverSymbolsFeatureLayerHt, app.pSup.m_pRiverSymbolsFeatureLayerTemp, app.pSup.m_pRiverSymbolsFeatureLayerCFS,
            let arrayLayer2add = [app.pSup.m_pRiverSymbolsFeatureLayerTemp, app.pSup.m_pRiverSymbolsFeatureLayerCFS,
                pWatershedsMaskFeatureLayer, pBasinsMaskFeatureLayer,
                pWatershedsFeatureLayer, pBasinsFeatureLayer, pLakeResFeatureLayer, pNOAAUSDMFeatureLayer, pCartoFeatureLayer, pCartoFeatureLayerPoly,
                pSectionsFeatureLayer, pSNOTELFeatureLayer, pNOAAFeatureLayer, pFWPFeatureLayer,
                pBLMFeatureLayer, pBLM_RecFeatureLayer, pGageFeatureLayer, pEPointsFeatureLayer,
                pMonitoringCSVLayer, app.graphicsLayer];

            if ((app.Basin_ID == "Upper Clark Fork") | (app.Basin_ID == "Blackfoot-Sun")) {
                arrayLayer2add.push(pGageFeatureLayerHighlighted);
            }

            if (!(app.blnPickArea)) {
                if (app.StateArea.indexOf("MT") > -1) {
                    arrayLayer2add.push(pFWPAISAccessFeatureLayer);
                    arrayLayer2add.push(pFASFeatureLayer);
                    arrayLayer2add.push(pMTSPFeatureLayer);
                }
                if (app.StateArea.indexOf("CO") > -1) {
                    arrayLayer2add.push(pCOFACFeatureLayer);
                }
            }

            if (app.Basin_ID == "Flathead") {
                arrayLayer2add.push(pDist2WaterTableFlathead);
                arrayLayer2add.push(p1964FloodFlathead);
            }

            app.map.layers.addMany(arrayLayer2add);

            app.pZoom = new MH_Zoom2FeatureLayers({}); // instantiate the class
            app.dblExpandNum = 0.5;


            let diffTime = Math.abs(app.pSup.m_EndDateTime - app.pSup.m_StartDateTime);
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            //let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            let strDaysNoteSuffix = "";
            if (app.Days4Analisis != diffDays) {
                strDaysNoteSuffix = " of the " + diffDays.toString() + " day range";
            }

            document.getElementById("txtFromToDate").innerHTML = "Gage readings may be provisional, conditions based on gage readings of the last " + app.Days4Analisis.toString() + " days" + strDaysNoteSuffix;

            //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
            //|||||||||||||||||||||||||||||||     This starts retevial of gage data         ||||||||||||||||||||||||||||||||||||||||||||||||||||
            //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
            if (!(app.blnPickArea)) {
                console.log("app.blnReservoirGagesExist: " + app.blnReservoirGagesExist.toString());
                app.pGage.Start(strDateTimeMinus3, strDateTime);   //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
            }
            //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
            //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
            //|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

            let legendLayers = [];
            legendLayers.push({ layer: pMonitoringCSVLayer, title: 'Monitoring Locations' });
            legendLayers.push({ layer: pSNOTELFeatureLayer, title: 'SNOTEL Sites' });
            legendLayers.push({ layer: pNOAAFeatureLayer, title: 'Weather Stations' });

            if (!(app.blnPickArea)) {
                if (app.StateArea.indexOf("CO") > -1) {
                    legendLayers.push({ layer: pCOFACFeatureLayer, title: 'CPW Facilities' });
                }

                if (app.StateArea.indexOf("MT") > -1) {
                    legendLayers.push({ layer: pFWPAISAccessFeatureLayer, title: 'MT AIS Watercraft Access' });
                    legendLayers.push({ layer: pMTSPFeatureLayer, title: 'MT State Parks' });
                    legendLayers.push({ layer: pFASFeatureLayer, title: 'FWP Fish Access Sites' });
                }
            }
            legendLayers.push({ layer: pBLMFeatureLayer, title: 'BLM Access Sites' });
            legendLayers.push({ layer: pBLM_RecFeatureLayer, title: 'BLM Recreation Boating Sites' });
            
            legendLayers.push({ layer: pEPointsFeatureLayer, title: 'Start/End Section Locations' });
            legendLayers.push({ layer: pGageFeatureLayer, title: 'Gages' });

            if ((app.Basin_ID == "Upper Clark Fork") | (app.Basin_ID == "Blackfoot-Sun")) {
                legendLayers.push({ layer: pGageFeatureLayerHighlighted, title: 'Turah and Bonner Gages' });
            }

            legendLayers.push({ layer: app.pSup.m_pRiverSymbolsFeatureLayerCFS, title: 'River Status' });
            legendLayers.push({ layer: app.pSup.m_pRiverSymbolsFeatureLayerTemp, title: 'River Status (Temp)' });
            //legendLayers.push({ layer: app.pSup.m_pRiverSymbolsFeatureLayerHt, title: 'River Status (Ht)' });


            if (app.Basin_ID == "UMH") {
                legendLayers.push({ layer: pCartoFeatureLayerPoly, title: 'Special Areas of Interest' });
            }

            if (app.Basin_ID == "Flathead") {
                legendLayers.push({ layer: pDist2WaterTableFlathead, title: 'Depth to Water Table, Flathead River (ft)' });
                legendLayers.push({ layer: p1964FloodFlathead, title: '1964 Flood, Flathead River' });
            }

            legendLayers.push({ layer: pNOAAUSDMFeatureLayer, title: 'U.S. Drought Monitor' });
            
            if (app.test) {
                legendLayers.push({ layer: app.pSup.m_pFWPFeatureLayer, title: 'Test Condition Messaging' });
            }
            else {
                legendLayers.push({ layer: app.pSup.m_pFWPFeatureLayer, title: 'MT Waterbody Restrictions' });
            }

            app.legend = new Legend({
                view: app.view,
                layerInfos: legendLayers,
                container: "legendDiv"
            });

            var cbxLayers = [];
            cbxLayers.push({ layers: [pBLMFeatureLayer, pBLMFeatureLayer], title: 'BLM Access Sites' });
            cbxLayers.push({ layers: [pBLM_RecFeatureLayer, pBLM_RecFeatureLayer], title: 'BLM Recreation Boating Sites' });

            if (!(app.blnPickArea)) {
                if (app.StateArea.indexOf("CO") > -1) {
                    cbxLayers.push({ layers: [pCOFACFeatureLayer, pCOFACFeatureLayer], title: 'CPW Facilities' });
                }
                if (app.StateArea.indexOf("MT") > -1) {
                    cbxLayers.push({ layers: [pFASFeatureLayer, pFASFeatureLayer], title: 'MT FWP Fishing Access Sites' });
                    cbxLayers.push({ layers: [pMTSPFeatureLayer, pMTSPFeatureLayer], title: 'MT State Parks' });
                    cbxLayers.push({ layers: [pFWPAISAccessFeatureLayer, pFWPAISAccessFeatureLayer], title: 'MT AIS Watercraft Access' });
                }
            }
            cbxLayers.push({ layers: [pSNOTELFeatureLayer, pSNOTELFeatureLayer], title: 'SNOTEL Sites' });
            cbxLayers.push({ layers: [pNOAAFeatureLayer, pNOAAFeatureLayer], title: 'Weather Stations' });
            cbxLayers.push({ layers: [pMonitoringCSVLayer, pMonitoringCSVLayer], title: 'Monitoring Locations' });

            cbxLayers.push({ layers: [pNOAAUSDMFeatureLayer, pNOAAUSDMFeatureLayer], title: 'U.S. Drought Monitor' });
            

            if (app.Basin_ID == "Flathead") {
                cbxLayers.push({ layers: [pDist2WaterTableFlathead, pDist2WaterTableFlathead], title: 'Depth to Water Table, Flathead River' });
                cbxLayers.push({ layers: [p1964FloodFlathead, p1964FloodFlathead], title: '1964 Flood, Flathead River' });
            }
                        
			this.LayerCheckBoxSetup(cbxLayers);

            if (!(app.blnPickArea)) {
                SetupStreamClick();
                SetupReservoirClick();
            } else {
                SetupBasinClick();
            }

            ko.bindingHandlers.googleBarChart = {
                init: function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
					var chart = new google.visualization.LineChart(element);
					ko.utils.domData.set(element, 'googleLineChart', chart);
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var value1 = ko.unwrap(valueAccessor());
                    //////////////////////////////////// reorder the data columns to put no-data columns to the end
                    var value = new google.visualization.DataView(value1);// build data view
                    let arryNoDataColumns = [];
                    let arryDataColumns = [];
                    let strColName = "";
                    for (ic = 0; ic < value.getNumberOfColumns(); ic++) {  //find columns that have no data
                        if (ic == 0) {
                            arryDataColumns.push(value.getColumnLabel(ic))
                        } else {
                            strColName = value.getColumnLabel(ic);
                            if (strColName.indexOf("No Data") > 0) {
                                arryNoDataColumns.push(value.getColumnLabel(ic))
                            } else {
                                arryDataColumns.push(value.getColumnLabel(ic))
                            }
                        }
                    }
                    for (iic = 0; iic < arryNoDataColumns.length; iic++) {  //add the columns with no data to the back of the array
                        arryDataColumns.push(arryNoDataColumns[iic])
                    }
                    value.setColumns(arryDataColumns);
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                    var tickMarks = [];
                    var strTitle = "";

                    if ((value.getColumnLabel(0) == "DatetimeTMP") | (value.getColumnLabel(0) == "DatetimeTMPSingle")) {
                        strTitle = "Stream Temperature (F)"
                    }
                    else if ((value.getColumnLabel(0) == "DatetimeCFS") | (value.getColumnLabel(0) == "DatetimeCFSSingle") | (value.getColumnLabel(0) == "DatetimeCFSRecSingle")) {
                        strTitle = "Stream Section Discharge (CFS)"
                    }
                    else if ((value.getColumnLabel(0) == "DatetimeHt") | (value.getColumnLabel(0) == "DatetimeHtSingle")) {
                        strTitle = "Gage Height (ft)"
                    }
                    else if ((value.getColumnLabel(0) == "DatetimeFB") | (value.getColumnLabel(0) == "DatetimeFBSingle")) {
                        strTitle = "Reservoir Pool Height (ft)"
                    }


                    for (var i = 0; i < value.getNumberOfRows(); i += 48) {
                        tickMarks.push(value.getValue(i, 0));
                    }
                      var options = {
                        chart: {
                            "title": "nope",
                          
                          }, legend:
                          {
                              position: 'right',
                              textStyle: { fontSize: 12 }
                          },
                          vAxis: {
                              textStyle: {fontSize: 10 }
                          },
                          hAxis: {
                              format: 'M/d HH' + ":00",
                              ticks: tickMarks,
                              textStyle: {fontSize: 10 }
                          },
                          "title": strTitle,
                          height: 400,
                          chartArea: {
                              left: "5%", top: "5%"
                          }
                      };

                    
                    if ((value.getColumnLabel(0) == "DatetimeCFS") & (value.getNumberOfColumns() == 3)) {
                        var optionsSeries = {
                            0: { lineWidth: 3 }, //blue
                            1: { lineWidth: 8 }  //dark orange
                        };
                        var optionsSeriesColors = ['#3385ff', //blue
                            '#df7206'];  //dark orange
                        options.series = optionsSeries;
                        options.colors = optionsSeriesColors;

                    } else if (value.getColumnLabel(0) == "DatetimeTMPSingle") {
                        var options4ChartAreaTrendlines = {
                            0: {
                                labelInLegend: 'Temp Trend Line',
                                visibleInLegend: true,
                            }
                        };
                        options.trendlines = options4ChartAreaTrendlines;

                        var optionsSeries = {
                            0: { lineWidth: 3 }, //blue
                            1: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                        };
                        var optionsSeriesColors = ['#3385ff', //blue
                                                    '#919191'];  //medium grey
                        options.series = optionsSeries;
                        options.colors = optionsSeriesColors;
                    } else if (value.getColumnLabel(0) == "DatetimeCFSRecSingle") {
                        var optionsSeries = null;
                        var optionsSeriesColors = null;

                        if (value.getNumberOfColumns() == 7) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 10, lineDashStyle: [1, 1] },  //light grey
                                2: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                                3: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                                4: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                                5: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#ccced0',  //light grey
                                '#919191',  //medium grey
                                '#919191',  //medium grey
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        } else if (value.getNumberOfColumns() == 6) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                                2: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                                3: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#919191',  //medium grey
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        } else if (value.getNumberOfColumns() == 4) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                                2: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        } else if ((value.getNumberOfColumns() == 3) & (value.getColumnLabel(0) == "DatetimeCFSSingle")) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 8 }  //dark orange
                                //1: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#df7206', ////dark orange
                                '#61605f']; ///dark grey
                        } else if ((value.getNumberOfColumns() == 3) & (value.getColumnLabel(0) == "DatetimeHtSingle")) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                //1: { lineWidth: 8 }  //dark orange
                                1: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        }

                        let strTrendLinePrefix = "Gage Ht";
                        if ((value.getColumnLabel(0) == "DatetimeCFSSingle") | (value.getColumnLabel(0) == "DatetimeCFSRecSingle")) {
                            strTrendLinePrefix = "CFS";
                        }

                        var options4ChartAreaTrendlines = {
                            0: {
                                labelInLegend: strTrendLinePrefix + ' Trend Line',
                                visibleInLegend: true,
                            }
                        };
                        options.trendlines = options4ChartAreaTrendlines;
                        options.series = optionsSeries;
                        options.colors = optionsSeriesColors;
                    }else if ((value.getColumnLabel(0) == "DatetimeHtSingle") |
                                        (value.getColumnLabel(0) == "DatetimeCFSSingle")) {
                        var optionsSeries = null;
                        var optionsSeriesColors = null;

                        if (value.getNumberOfColumns() == 6) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 10, lineDashStyle: [1, 1] },  //light grey
                                2: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                                3: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                                4: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#ccced0',  //light grey
                                '#919191',  //medium grey
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        } else if (value.getNumberOfColumns() == 5) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 10, lineDashStyle: [1, 1] },  //medium grey
                                2: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                                3: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#919191',  //medium grey
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        } else if (value.getNumberOfColumns() == 4) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                                2: { lineWidth: 8 }  //dark orange
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        } else if ((value.getNumberOfColumns() == 3) & (value.getColumnLabel(0) == "DatetimeCFSSingle")) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                1: { lineWidth: 8 }  //dark orange
                                //1: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#df7206', ////dark orange
                                '#61605f']; ///dark grey
                        } else if ((value.getNumberOfColumns() == 3) & (value.getColumnLabel(0) == "DatetimeHtSingle")) {
                            optionsSeries = {
                                0: { lineWidth: 3 }, //blue
                                //1: { lineWidth: 8 }  //dark orange
                                1: { lineWidth: 10, lineDashStyle: [1, 1] }, //dark grey
                            };
                            optionsSeriesColors = ['#3385ff', //blue
                                '#61605f', //dark grey
                                '#df7206'];  //dark orange
                        }

                        let strTrendLinePrefix = "Gage Ht";
                        if ((value.getColumnLabel(0) == "DatetimeCFSSingle") | (value.getColumnLabel(0) == "DatetimeCFSRecSingle")) {
                            strTrendLinePrefix = "CFS";
                        }

                        var options4ChartAreaTrendlines = {
                            0: {
                                labelInLegend: strTrendLinePrefix + ' Trend Line',
                                visibleInLegend: true,
                            }
                        };
                        options.trendlines = options4ChartAreaTrendlines;
                        options.series = optionsSeries;
                        options.colors = optionsSeriesColors;
                    }

                    options = ko.unwrap(options);
                    var chart = ko.utils.domData.get(element, 'googleLineChart');
                    chart.draw(value, options);
                },
            };

			var iMapOrientation = app.map.width / app.map.height;
			app.dblExpandNum = 0.5;

			if (typeof app.H2O_ID != 'undefined') {
				if ((iMapOrientation > 1.5) & ((app.H2O_ID == "Madison") |
					(app.H2O_ID == "Boulder") |
					(app.H2O_ID == "Ruby") |
					(app.H2O_ID == "Sun") |
					(app.H2O_ID == "Blackfoot") |
					(app.H2O_ID == "Lower Bighorn") |
					(app.H2O_ID == "Little Bighorn") |
					(app.H2O_ID == "Little Wind") |
					(app.H2O_ID == "Lower Wind") |
					(app.H2O_ID == "Shoshone") |
					(app.H2O_ID == "North Fork Shoshone") |
					(app.H2O_ID == "South Fork Shoshone") |
					(app.H2O_ID == "Bighorn Lake") |
					(app.H2O_ID == "Upper Wind") |
					(app.H2O_ID == "Upper Bighorn") |
					(app.H2O_ID == "Upper Gallatin") |
					(app.H2O_ID == "Lower Gallatin"))) {
                    app.dblExpandNum = 1;
				} else if ((app.H2O_ID == "Broadwater") |
					(app.H2O_ID == "Sun") |
					(app.H2O_ID == "Blackfoot") |
					(app.H2O_ID == "Shields") |
					(app.H2O_ID == "Little Bighorn") |
					(app.H2O_ID == "Little Wind") |
					(app.H2O_ID == "Lower Wind") |
					(app.H2O_ID == "Shoshone") |
					(app.H2O_ID == "North Fork Shoshone") |
					(app.H2O_ID == "South Fork Shoshone") |
					(app.H2O_ID == "Bighorn Lake") |
					(app.H2O_ID == "Upper Wind") |
					(app.H2O_ID == "Lower Bighorn") |
					(app.H2O_ID == "Upper Bighorn") |
					(app.H2O_ID == "Boulder")) {
                    app.dblExpandNum = 1;
                }

                app.pZoom.qry_Zoom2FeatureLayerExtent(pWatershedsFeatureLayer, "OBJECTID");
            } else {
				if (typeof app.Basin_ID != 'undefined') {
					if ((iMapOrientation > 1.5) & ((app.Basin_ID == "Musselshell") |
						(app.Basin_ID == "Blackfoot-Sun") |
						(app.Basin_ID == "Boulder and East Boulder") |
						(app.Basin_ID == "Bighorn"))) {
						app.dblExpandNum = 1;
					} else if ((app.Basin_ID == "Musselshell") |
						(app.Basin_ID == "Blackfoot-Sun") |
						(app.Basin_ID == "Boulder and East Boulder") |
						(app.Basin_ID == "Bighorn")) {
						app.dblExpandNum = 1;
					}

					app.pZoom.qry_Zoom2FeatureLayerExtent(pWatershedsFeatureLayer, "OBJECTID");
				} else {
                    app.pZoom.qry_Zoom2FeatureLayerExtent(pBasinsFeatureLayer, "OBJECTID");
				}
            }

            function err(err) {
                console.log("Failed to get stat results due to an error: ", err);
            }

            function mapLoaded() {        // map loaded//            // Map is ready
                app.view.on("pointer-move", (evt) => {
                    /*console.log(evt.x, evt.y);*/
                    var point = app.view.toMap(evt);
                    var mp = webMercatorUtils.webMercatorToGeographic(point);  //the map is in web mercator but display coordinates in geographic (lat, long)
                    dom.byId("txt_xyCoords").innerHTML = "Latitude:" + mp.y.toFixed(4) + "<br>Longitude:" + mp.x.toFixed(4);  //display mouse coordinates
                }); //after map loads, connect to listen to mouse move & drag events
                console.log("maploaded")
            }

            function SetupBasinClick() {
                app.view.on("pointer-down", (event) => {
                    const opts = {
                        include: pBasinsFeatureLayer// only include graphics from pSectionsFeatureLayer in the hitTest
                    }
                    app.view.hitTest(event, opts).then((response) => {
                        if (response.results.length) {// check if a feature is returned from the pSectionsFeatureLayer
                            showResults(response.results);
                        }
                    });
                });
            }


            function SetupStreamClick() {
                app.view.on("pointer-down", (event) => {
                    const opts = {
                        include: pSectionsFeatureLayer// only include graphics from pSectionsFeatureLayer in the hitTest
                    }
                    app.view.hitTest(event, opts).then((response) => {
                        if (response.results.length) {// check if a feature is returned from the pSectionsFeatureLayer
                            showResults(response.results);
                        }
                    });
                });
            }

            function SetupReservoirClick() {
                app.view.on("pointer-down", (event) => {
                    const opts = {
                        include: pLakeResFeatureLayer// only include graphics from pLakeResFeatureLayer in the hitTest
                    }
                    app.view.hitTest(event, opts).then((response) => {
                        if (response.results.length) {// check if a feature is returned from the pLakeResFeatureLayer
                            showResults(response.results);
                        }
                    });
                });
            }


			function showResults(pFeatures) {
                console.log("showResults from click")
                app.blnZoom = false; //this controls zooming to sections if user clicks a summary or if clicks on map
                if (pFeatures.length > 0) {
                    var feature = pFeatures[0];
                    if (feature.graphic.layer.id == "Basins") {                     //if no geographiy is specified, handle clicking on a basin area
                        let strBasinName = feature.graphic.attributes.Name;

                        iBasinIndex1 = 0
                        iBasinIndex2 = 1

                        if (strBasinName.search("Upper Rio") > -1) {
                            strBasinName = strBasinName.replace("Grande-New", "Grand - New");
                            iBasinIndex1 = 1
                            iBasinIndex2 = 1
                        }

                        let strBasinName2;
                        for (var iB = 0; iB < app.arrayNavListBasin.length; iB++) { // the basin polygon attributes may be worded slightly different than what's needed for the URL parameter, this loop gets the expexted basin name for URLs
                            if (strBasinName == app.arrayNavListBasin[iB][iBasinIndex1]){
                                strBasinName2 = app.arrayNavListBasin[iB][iBasinIndex2];
                                break;
                            }
                        }

                        let strURL4Basin = 'index.html?Basin_ID=' + strBasinName2;
                        
                        window.open(strURL4Basin, "_self");
                    } else {
                        let strSearchField1, strSearchField2, strSearchValue1, strSearchValue2, table, strTempText, strFoundValue1, strFoundValue2;
                        if (feature.graphic.layer.geometryType == "polygon") {  //assuming the poly layer is the reservoir layer
                            strSearchField1 = "SiteName";
                            strSearchField2 = "Lake_Reservoir_Name_";

                            strSearchValue1 = feature.graphic.attributes.Gage_Name;
                            strSearchValue2 = feature.graphic.attributes.Lake_Reservoir_Name;

                            table = document.getElementById("entriesReservoir");

                        } else {
                            strSearchField1 = "StreamName";
                            strSearchField2 = "SectionID";

                            strSearchValue1 = feature.graphic.attributes.StreamName;
                            strSearchValue2 = feature.graphic.attributes.SectionID;

                            table = document.getElementById("entries");
                        }

                        var rows = table.getElementsByTagName("tr");

                        for (var i = 0; i < rows.length; i++) {
                            strTempText = (rows)[i].innerHTML;  //parse the section summary text to set var's for charting and zooming
                            strTempText = strTempText.substring(strTempText.indexOf(strSearchField1) + (strSearchField1.length + 2), strTempText.length);
                            strFoundValue1 = strTempText.substring(0, strTempText.indexOf("</span>"));
                            strTempText = strTempText.substring(strTempText.indexOf(strSearchField2) + (strSearchField2.length + 2), strTempText.length);
                            strFoundValue2 = strTempText.substring(0, strTempText.indexOf("</span>"));

                            if ((strSearchValue1 == strFoundValue1) & (strSearchValue2 == strFoundValue2)) {
                                (rows)[i].click();

                                break;
                            }
                        }
                    }
                }
            }
        },



        getQueryDefs1_4: function () {

            let strQueryDef1 = "1=1";
            let strQueryDef2 = "1=1";
            let strQueryDef3 = "";
            let strQueryDef4 = "Name in ('')";
            let strQueryDef = "1=1";
            let strQueryDef5 = "";
            let strQueryDef6 = "";
            let strQueryDef7 = "";

            arrayTmp4Query3 =[];
            if((app.Basin_ID == undefined) & (typeof app.H2O_ID == 'undefined')) {
            for (var ib2 = 0; ib2 < app.arrayEntireList.length; ib2++) { 							//if a watershed is passed, determine the correspoinding watersheds
                arrayTmp4Query3.push(app.arrayEntireList[ib2][1]);
            }
            strQueryDef3 = "Name in ('" + arrayTmp4Query3.join("','") + "')";
            } else if ((app.Basin_ID != undefined) & (typeof app.H2O_ID == 'undefined')) {
                for (var ib2 = 0; ib2 < app.arrayEntireList.length; ib2++) { 							//if a watershed is passed, determine the correspoinding watersheds
                    if (app.Basin_ID == app.arrayEntireList[ib2][2]) {
                        arrayTmp4Query3.push(app.arrayEntireList[ib2][1]);
                    }
                }
                strQueryDef1 = "(Watershed_Name in ('" + arrayTmp4Query3.join("','") +
                    "')) OR (WatershedName_Alt1 in ('" + arrayTmp4Query3.join("','") +
                    "')) OR (WatershedName_Alt2 in ('" + arrayTmp4Query3.join("','") + "'))";

                strQueryDef2 = "(Watershed in ('" + arrayTmp4Query3.join("','") +
                    "')) OR (WatershedName_Alt1 in ('" + arrayTmp4Query3.join("','") +
                    "')) OR (WatershedName_Alt2 in ('" + arrayTmp4Query3.join("','") + "'))";

                strQueryDef3 = "(Name in ('" + arrayTmp4Query3.join("','") +
                    "')) OR (Name_Alternate1 in ('" + arrayTmp4Query3.join("','") +
                    "')) OR (Name_Alternate2 in ('" + arrayTmp4Query3.join("','") + "'))";

                strQueryDef4 = "(NOT(Name in ('" + arrayTmp4Query3.join("','") + "'))) AND " +
                    "((NOT(Name_Alternate1 in ('" + arrayTmp4Query3.join("','") + "'))) OR (Name_Alternate1 is Null)) AND" +
                    "((NOT(Name_Alternate2 in ('" + arrayTmp4Query3.join("','") + "'))) OR (Name_Alternate2 is Null)) AND" +
                    "((NOT(NoShowIfBasin in ('" + app.Basin_ID + "'))) OR (NoShowIfBasin is Null))";

                strQueryDef5 = "((Watershed in ('" + arrayTmp4Query3.join("','") +
                    "')) OR (WatershedName_Alt1 in ('" + arrayTmp4Query3.join("','") +
                    "')) OR (WatershedName_Alt2 in ('" + arrayTmp4Query3.join("','") + "')))" +
                    " And (LiveDataAvailable = 'True')";

            } else if (typeof app.H2O_ID != 'undefined') {
                strQueryDef1 = "Watershed_Name = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt1 = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt2 = '" + app.H2O_ID + "'";
                strQueryDef2 = "Watershed = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt1 = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt2 = '" + app.H2O_ID + "'";

                strQueryDef3 = "(Name = '" + app.H2O_ID + "'" + " OR " + " Name_Alternate1 = '" +
                    app.H2O_ID + "'" + " OR " + " Name_Alternate2 = '" + app.H2O_ID + "')";

                strQueryDef4 = "Name <> '" + app.H2O_ID + "'" +
                    " AND (" + " Name_Alternate1 <> '" + app.H2O_ID + "' OR (Name_Alternate1 is Null))" +
                    " AND (" + " Name_Alternate2 <> '" + app.H2O_ID + "' OR (Name_Alternate2 is Null))" +
                    " AND (" + " NoShowIfBasin <> '" + app.Basin_ID + "' OR (NoShowIfBasin is Null))";

                strQueryDef5 = "(Watershed = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt1 = '" + app.H2O_ID + "'" + " OR " + " WatershedName_Alt2 = '" + app.H2O_ID + "')" +
                                " AND (LiveDataAvailable = 'True')";

            }

            if ((app.Basin_ID == "Upper Clark Fork") | (app.Basin_ID == "Blackfoot-Sun") | (app.H2O_ID == "Upper Clark Fork") | (app.H2O_ID == "Flint - Rock")) {
                strQueryDef6 = "(SectionName in ('Clark Fork Section 1','Clark Fork Section 2','Clark Fork Section 3','Clark Fork Section 4','Clark Fork Section 5','Clark Fork Section 6','Rock Creek Section 1'))" +                                    //Turah gage propogate functionality
                    " OR (StreamName in ('Little Blackfoot River','Gold Creek','Flint Creek','Middle Fork Rock Creek','East Fork Rock Creek','Silver Bow Creek'))";

                //strQueryDef6 = "(SectionName in ('Clark Fork Section 1','Clark Fork Section 2','Clark Fork Section 3','Clark Fork Section 4','Clark Fork Section 5','Clark Fork Section 6','Rock Creek Section 1'))" +                                    //Turah gage propogate functionality
                //    " OR (StreamName in ('Little Blackfoot River','Gold Creek','Flint Creek','Middle Fork Rock Creek','East Fork Rock Creek','Silver Bow Creek','Clearwater River','North Fork Blackfoot River','Nevada Creek'))";

            } else if ((app.Basin_ID == "UMH") | (app.H2O_ID == "Big Hole")) {
                strQueryDef6 = "(SectionName in ('Big Hole River Section 3', 'Big Hole River Section 4'))" +                                    //Big hole propogate  functionality
                    " OR (StreamName in (''))";
            }

            //strQueryDef6 = "(Basin in ('Upper Clark Fork')) OR (Watershed in ('Blackfoot'))";                                                                 //Turah / Big Hole River Section 4' gage functionality

            if ((app.Basin_ID == "Upper Clark Fork") | (app.Basin_ID == "Blackfoot-Sun") | (app.H2O_ID == "Blackfoot")) {
                strQueryDef7 = "(SectionName in ('nothing'))" +                                    //Turah gage propogate functionality
                    " OR (StreamName in ('Blackfoot River','Clearwater River','North Fork Blackfoot River','Nevada Creek'))";
            }
            //if (((app.Basin_ID == "Upper Clark Fork") | (app.Basin_ID == "Blackfoot-Sun")) & (app.H2O_ID == "Blackfoot")) {
            //    strQueryDef7 = "(SectionName in ('nothing'))" +                                    //Turah gage propogate functionality
            //        " OR (StreamName in ('Blackfoot River','Clearwater River','North Fork Blackfoot River','Nevada Creek'))";
            //} else if (((app.Basin_ID == "Upper Clark Fork") | (app.Basin_ID == "Blackfoot-Sun")) & (!(app.H2O_ID == "Blackfoot"))) {
            //    strQueryDef7 = "(SectionName in ('nothing'))" +                                    //Turah gage propogate functionality
            //        " OR (StreamName in ('nothing'))";
            //}
            
            return [strQueryDef1, strQueryDef2, strQueryDef3, strQueryDef4, strQueryDef5, strQueryDef6, strQueryDef7];
        },



        Phase3: function (pArrayOIDYellow, pArrayOIDsGold, pArrayOIDsOrange, pArrayOIDsPlum, pArrayOIDsRed, m_arrayOIDsGreen, m_arrayOIDsPurple) {  //creating this phase 3 to create legend items for river status based on the summarized data
            try {
                app.pSup.m_pRiverSymbolsFeatureLayerCFS.renderer = app.pSup.m_StreamStatusRendererCFS;
                app.pSup.m_pRiverSymbolsFeatureLayerTemp.renderer = app.pSup.m_StreamStatusRendererTemp;
                //app.pSup.m_pRiverSymbolsFeatureLayerHt.renderer = app.pSup.m_StreamStatusRendererHT;
			}
			catch (err) {
				console.log("Phase3 legendlayers issue::", err.message);
				$("#divShowHideLegendBtn").hide;
			}
            

            $('#dropDownId a').click(function () {
                let strSelectedText = $(this).text();
                //$('#selected').text($(this).text());
                let blnAddCoords = false;
                let blnAddCoordsUSGS = false;
                let strURL;
                var pExtent = app.view.extent;

                if (strSelectedText == "Channel Migration Zones") {
                    strURL = "https://montana.maps.arcgis.com/home/webmap/viewer.html?webmap=f59d958f8ec94e70b5a0bff9bb7dacae&extent=";
                    blnAddCoords = true;
                }


                
                if (strSelectedText == "MT DNRC Upper Clark Fork & Blackfoot Water Rights") {
                    strURL = "https://mtdnrc.maps.arcgis.com/apps/webappviewer/index.html?id=a49c3c9c95a046449ed785bd63edda4c&extent=";
                    blnAddCoords = true;
                }



                if (strSelectedText == "MT DNRC Fire Map") {
                    strURL = "https://mtdnrc.maps.arcgis.com/apps/webappviewer/index.html?id=6bea18851bec440d9260cb0d28f53281&extent=";
                    blnAddCoords = true;
                }
                
                if (strSelectedText == "FEMA Flood Layer Hazard Viewer") {
                    strURL = "https://hazards-fema.maps.arcgis.com/apps/webappviewer/index.html?id=8b0adb51996444d4879338b5529aa9cd&extent=";
                    blnAddCoords = true;
                }

                if (strSelectedText == "MT DNRC Stream and Gage Explorer") {
                    strURL = "https://gis.dnrc.mt.gov/apps/StAGE/index.html?extent=";
                    blnAddCoords = true;
                }

                if (strSelectedText == "American Whitewater Difficulty and Flow") {
                    strURL = "https://www.americanwhitewater.org/content/River/view/river-index";
                    blnAddCoords = false;
                }

                if (strSelectedText == "BOR Basin Status Maps") {
                    strURL = "https://www.usbr.gov/uc/water/hydrodata/status_maps/";
                    blnAddCoords = false;
                }

                if (strSelectedText == "USGS National Water Dashboard") {
                    // https://dashboard.waterdata.usgs.gov/app/nwd/en/?aoi=bbox-%5B-119.94824%2C44.56204%2C-108.64438%2C48.39114
                    // https://dashboard.waterdata.usgs.gov/app/nwd/en/?aoi=bbox-%5B-119.94824%2C44.56204%2C-108.64438%2C48.39114%5D&view=%7B%22basemap%22%3A%22EsriTopo%22%2C%22bounds%22%3A%22-119.94823983103537%2C44.56203899517036%2C-108.64437909334788%2C48.39113519331582%22%2C%22insetMap%22%3Afalse%2C%22panel%22%3A%7B%22id%22%3A%22ViewerTools%22%2C%22open%22%3Atrue%2C%22checkbox%22%3A%220%2C10%2C20%2C21%2C22%2C23%22%2C%22range%22%3A%220%3A1.0%2C1%3A1.0%2C2%3A1.0%2C3%3A1.0%2C4%3A1.0%2C5%3A1.0%2C6%3A1.0%2C7%3A1.0%2C8%3A0.8%2C9%3A0.3%2C10%3A0.5%2C11%3A0.5%2C12%3A0.5%2C13%3A0.5%2C14%3A0.5%2C15%3A0.5%2C16%3A0.5%2C17%3A1.0%2C18%3A1.0%2C19%3A1.0%2C20%3A1.0%22%2C%22select%22%3A%220%3A0%2C1%3A0%2C2%3A0%2C3%3A0%2C4%3A0%2C5%3A0%2C6%3A0%2C7%3A0%2C8%3A0%2C9%3A0%2C10%3A0%2C11%3A0%2C12%3A0%2C13%3A0%2C14%3A0%2C15%3A0%2C16%3A0%2C17%3A0%2C18%3A0%2C19%3A0%22%7D%7D
                    blnAddCoords = false;
                    pSR_WKID = pExtent.spatialReference.wkid;
                    //strURL = "https://dashboard.waterdata.usgs.gov/app/nwd/en/?aoi=default&view=%7B%22basemap%22%3A%22EsriTopo%22%2C%22bounds%22%3A%22";
                    strURL = "https://dashboard.waterdata.usgs.gov/app/nwd/en/?aoi=bbox-%5B";

                    var pGeogExtent = webMercatorUtils.webMercatorToGeographic(pExtent);  //the map is in web mercator but display coordinates in geographic (lat, long)
                    strURL += Math.round(pGeogExtent.xmin * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.ymin * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.xmax * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.ymax * 100) / 100;
                    //strURL += '%22%2C%22insetMap%22%3Afalse%2C%22panel%22%3A%7B%22checkbox%22%3A%220%2C9%2C19%2C20%2C21%2C22%22%2C%22range%22%3A%220%3A1.0%2C1%3A1.0%2C2%3A1.0%2C3%3A1.0%2C4%3A1.0%2C5%3A1.0%2C6%3A1.0%2C7%3A0.8%2C8%3A0.3%2C9%3A0.5%2C10%3A0.5%2C11%3A0.5%2C12%3A0.5%2C13%3A0.5%2C14%3A0.5%2C15%3A0.5%2C16%3A1.0%2C17%3A1.0%2C18%3A1.0%2C19%3A1.0%22%2C%22select%22%3A%220%3A0%2C1%3A0%2C2%3A0%2C3%3A0%2C4%3A0%2C5%3A0%2C6%3A0%2C7%3A0%2C8%3A0%2C9%3A0%2C10%3A0%2C11%3A0%2C12%3A0%2C13%3A0%2C14%3A0%2C15%3A0%2C16%3A0%2C17%3A0%2C18%3A0%22%7D%7D';
                }

                if (strSelectedText == "National Water Prediction Service") {
                    //https://water.noaa.gov/#@=-110.809092,45.7854252,5.1024202
                    blnAddCoords = false;
                    pSR_WKID = pExtent.spatialReference.wkid;
                    strURL = "https://water.noaa.gov/#@=";

                    var pGeogExtent = webMercatorUtils.webMercatorToGeographic(pExtent);  //the map is in web mercator but display coordinates in geographic (lat, long)

                    strURL += (Math.round(pGeogExtent.center.x.toString() * 100) / 100).toString();//longitude
                    strURL += "," + (Math.round(pGeogExtent.center.y.toString() * 100) / 100).toString();//latitude

                    dblExtentWidth = pGeogExtent.xmax - pGeogExtent.xmin;

                    if (dblExtentWidth > 3.750001) {
                        strURL += ",4.75";
                    }

                    if ((dblExtentWidth > 3.500001) & (dblExtentWidth < 3.75)) {
                        strURL += ",5.96";
                    }

                    if ((dblExtentWidth > 2.750001) & (dblExtentWidth < 3.5)) {
                        strURL += ",7.87";
                    }

                    if ((dblExtentWidth > 2.30001) & (dblExtentWidth < 2.75)) {
                        strURL += ",8.19";
                    }

                    if ((dblExtentWidth > 1.30001) & (dblExtentWidth < 2.3)) {
                        strURL += ",8.5";
                    }

                    if ((dblExtentWidth > 0.75001) & (dblExtentWidth < 1.3)) {
                        strURL += ",8.9";
                    }

                    if ((dblExtentWidth > 0.5001) & (dblExtentWidth < 0.75)) {
                        strURL += ",9.25";
                    }

                    if ((dblExtentWidth > 0.25001) & (dblExtentWidth < 0.5)) {
                        strURL += ",10.4";
                    }

                    if (dblExtentWidth < 0.25) {
                        strURL += ",11";
                    }

                }

                if (strSelectedText == "NRCS iMap-Basin Snow Water Equivalent") {
                    //https://nwcc-apps.sc.egov.usda.gov/imap/#version=169&elements=&networks=!&states=!&basins=!&hucs=&minElevation=&maxElevation=&elementSelectType=any&activeOnly=true&activeForecastPointsOnly=false&hucLabels=false&hucIdLabels=false&hucParameterLabels=true&stationLabels=&overlays=&hucOverlays=&basinOpacity=75&basinNoDataOpacity=25&basemapOpacity=100&maskOpacity=0&mode=data&openSections=dataElement,parameter,date,basin,options,elements,location,networks&controlsOpen=true&popup=&popupMulti=&popupBasin=&base=esriNgwm&displayType=basin&basinType=6&dataElement=WTEQ&depth=-8&parameter=PCTMED&frequency=DAILY&duration=I&customDuration=&dayPart=E&monthPart=E&forecastPubDay=1&forecastExceedance=50&useMixedPast=true&seqColor=1&divColor=7&scaleType=D&scaleMin=&scaleMax=&referencePeriodType=POR&referenceBegin=1991&referenceEnd=2020&minimumYears=20&hucAssociations=true&relativeDate=-1&lat=44.961&lon=-110.220&zoom=7.0
                    blnAddCoords = false;
                    pSR_WKID = pExtent.spatialReference.wkid;
                    strURL = "https://nwcc-apps.sc.egov.usda.gov/imap/#version=169&elements=&networks=!&states=!&basins=!&hucs=&minElevation=&maxElevation=&elementSelectType=any&activeOnly=true&activeForecastPointsOnly=false&hucLabels=false&hucIdLabels=false&hucParameterLabels=true&stationLabels=&overlays=&hucOverlays=&basinOpacity=75&basinNoDataOpacity=25&basemapOpacity=100&maskOpacity=0&mode=data&openSections=dataElement,parameter,date,basin,options,elements,location,networks&controlsOpen=true&popup=&popupMulti=&popupBasin=&base=esriNgwm&displayType=basin&basinType=6&dataElement=WTEQ&depth=-8&parameter=PCTMED&frequency=DAILY&duration=I&customDuration=&dayPart=E&monthPart=E&forecastPubDay=1&forecastExceedance=50&useMixedPast=true&seqColor=1&divColor=7&scaleType=D&scaleMin=&scaleMax=&referencePeriodType=POR&referenceBegin=1991&referenceEnd=2020&minimumYears=20&hucAssociations=true&relativeDate=-1";

                    var pGeogExtent = webMercatorUtils.webMercatorToGeographic(pExtent);  //the map is in web mercator but display coordinates in geographic (lat, long)
                    strURL += "&lat=" + (Math.round(pGeogExtent.center.y.toString() * 100) / 100).toString();
                    strURL += "&lon=" + (Math.round(pGeogExtent.center.x.toString() * 100) / 100).toString();

                    dblExtentWidth = pGeogExtent.xmax - pGeogExtent.xmin;

                    if (dblExtentWidth > 3.750001) {
                        strURL += "&zoom=6.0";
                    }

                    if ((dblExtentWidth > 2.750001) & (dblExtentWidth < 3.75)) {
                        strURL += "&zoom=7.0";
                    }

                    if ((dblExtentWidth > 2.30001) & (dblExtentWidth < 2.75)) {
                        strURL += "&zoom=9.2";
                    }

                    if ((dblExtentWidth > 1.30001) & (dblExtentWidth < 2.3)) {
                        strURL += "&zoom=9.7";
                    }

                    if ((dblExtentWidth > 0.75001) & (dblExtentWidth < 1.3)) {
                        strURL += "&zoom=10.2";
                    }

                    if ((dblExtentWidth > 0.5001) & (dblExtentWidth < 0.75)) {
                        strURL += "&zoom=10.5";
                    }

                    if ((dblExtentWidth > 0.25001) & (dblExtentWidth < 0.5)) {
                        strURL += "&zoom=11.8";
                    }

                    if (dblExtentWidth < 0.25) {
                        strURL += "&zoom=12.8";
                    }

                }

                if (strSelectedText == "Official MT FWP (closures, etc.)") {
                    strURL = "https://experience.arcgis.com/experience/ba378e9a50ec4d53bbe92e406b647d3e";
                    blnAddCoords = false;
                }
                if (strSelectedText == "GYE Aquatic Invasives") {
                    blnAddCoords = false;
                    pSR_WKID = pExtent.spatialReference.wkid;
                    strURL = "https://gagecarto.github.io/aquaticInvasiveExplorer/index.html#bnds=";
                    var pGeogExtent = webMercatorUtils.webMercatorToGeographic(pExtent);  //the map is in web mercator but display coordinates in geographic (lat, long)
                    strURL += Math.round(pGeogExtent.xmin * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.ymin * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.xmax * 100) / 100 + ",";
                    strURL += Math.round(pGeogExtent.ymax * 100) / 100;
                }

                if (strSelectedText == "CO DWR Surface Water Stations") {
                    strURL = "https://data.colorado.gov/Water/DWR-Surface-Water-Stations-Map-Statewide-/8kgh-vbea";
                    blnAddCoords = false;
                }
                

                if (blnAddCoords) {
                    pSR_WKID = pExtent.spatialReference.wkid;
                    strURL += pExtent.xmin + ",";
                    strURL += pExtent.ymin + ",";
                    strURL += pExtent.xmax + ",";
                    strURL += pExtent.ymax + ",";
                    strURL += pSR_WKID.toString();
                }

                window.open(strURL);
            });



		},

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);
