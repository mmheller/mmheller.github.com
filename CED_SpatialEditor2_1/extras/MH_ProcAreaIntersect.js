//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        February 2018, updated May 2019

define([
    "extras/MH_LoadSHPintoLayer",
    "extras/MH_LayerEditing",
    "extras/MH_Zoom2FeatureLayersFootprinter",
    "esri/tasks/GeometryService", "esri/tasks/ProjectParameters", "esri/SpatialReference", "esri/graphic", "esri/geometry/Polygon", 
    "esri/Color", "esri/tasks/QueryTask", "esri/tasks/query", "esri/geometry/geometryEngine",
    "dijit/form/CheckBox", "dojo/promise/all",
    "esri/dijit/BasemapGallery",
    "esri/geometry/webMercatorUtils",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/urlUtils",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
    "dojo/_base/array", 
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/mouse",
    "dojo/on",
    "esri/map"
], function (
            MH_LoadSHPintoLayer, MH_LayerEditing, MH_Zoom2FeatureLayers,
            GeometryService, ProjectParameters, SpatialReference, Graphic, Polygon, Color2, QueryTask, Query, geometryEngine,
            CheckBox, all, BasemapGallery, webMercatorUtils, declare, lang, urlUtils, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol,
            arrayUtils, 
            dom, domClass, registry, mouse, on, Map
) {

    return declare([], {
        StartAreaIntersect: function () {
            showLoading();
            document.getElementById("btn_Next").disabled = true;

            app.pStateGraphicsLayer.clear();
            app.pCountyGraphicsLayer.clear();
            app.pMZGraphicsLayer.clear();
            app.pPopGraphicsLayer.clear();
            document.getElementById("ToggleGraphicsContainer").style.display = 'none';

            //strHUCs = "https://edits.nationalmap.gov/arcgis/rest/services/WBD/Wbd_EditVersion/MapServer/2";
            strCountiesURL = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Counties/FeatureServer/0";
            strGRSGPopulationAreasURL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/CED_Base_Layers/FeatureServer/0";
            strWAFWAManagementZones = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/CED_Base_Layers/FeatureServer/1";
            strStates = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/States_and_Provinces_Map/FeatureServer/0";

            app.m_Array2Proc = [];
            //app.m_Array2Proc.push([strHUCs, "HUC12", "HUCs"]);
            app.m_Array2Proc.push([strCountiesURL, "NAME", "Counties", "STATE_NAME"]);
            app.m_Array2Proc.push([strGRSGPopulationAreasURL, "POPULATION", "GRSG Population Areas", ""]);
            app.m_Array2Proc.push([strWAFWAManagementZones, "Mgmt_zone2", "WAFWA Management Zones", ""]);  //Name
            app.m_Array2Proc.push([strStates, "NAME", "States", ""]);

            app.m_ProcIndex = 0;
            app.dblExpandNum = 2;
            qry_Zoom2FeatureLayerExtentAreaIntersect(app.pSrcFeatureLayer);

            function qry_Zoom2FeatureLayerExtentAreaIntersect(pFeatureLayer1) {
                var pQueryT1 = new QueryTask(pFeatureLayer1.url);
                var pQuery1 = new Query();
                pQuery1.returnGeometry = true;
                pQuery1.outFields = ["objectid", "Project_ID"];

                var strQuery1 = pFeatureLayer1.getDefinitionExpression();
                pQuery1.where = strQuery1;
                var FLayer1, pPromises;
                FLayer1 = pQueryT1.execute(pQuery1);
                pPromises = new all([FLayer1]);
                return pPromises.then(returnEventsZoom, err);
            }


            function showLoading() {
                esri.show(app.loading);
                app.map.disableMapNavigation();
                app.map.hideZoomSlider();
            }

            function hideLoading(error) {
                esri.hide(app.loading);
                app.map.enableMapNavigation();
                app.map.showZoomSlider();
            }

            function returnEventsZoom(results) {

                var resultFeatures = [];
                resultFeatures = resultFeatures.concat(results[0].features);

                if (resultFeatures.length > 0) {
                    app.m_EffortArea = 0;
                    app.m_ArrayIntersectResults = [];
                    arrayGemetriesOfEffort = [];

                    var blnError = false;
                    for (var i = 0; i < results[0].features.length; i++) {
                        var pFeature = results[0].features[i];
                        if (pFeature.geometry.rings.length > 400) {
                            blnError = true;
                            break;
                        }
                        try {
                            arrayGemetriesOfEffort.push(pFeature.geometry);
                        } catch (err) {
                            showErrorDialog("Spatial area polygon is too complex, replace the polygon with a new generalized polygon.  Contact the CED development team if help is needed");
                        }
                    }

                    if (blnError) {
                        showErrorDialog("Spatial area polygon has " + pFeature.geometry.rings.length.toString() + " multi-part polygons, replace the polygon with a new generalized polygon with less multi part polygons.  Contact the CED development team if help is needed");
                        return;
                    } else {
                        var pExtent = null;
                        pfeatureExtent1 = esri.graphicsExtent(resultFeatures);
                        if (pfeatureExtent1) {
                            if ((pfeatureExtent1.xmin != pfeatureExtent1.xmax) & (pfeatureExtent1.ymin != pfeatureExtent1.ymax)) {  //if not a multipoint feature then continue
                                pExtent = new esri.geometry.Extent(pfeatureExtent1.xmin, pfeatureExtent1.ymin, pfeatureExtent1.xmax, pfeatureExtent1.ymax, new esri.SpatialReference({ "wkid": 3857 }));
                                pExtent = pExtent.expand(app.dblExpandNum);
                                app.map.setExtent(pExtent, true);
                            }
                        }

                        app.pGeometry = mergeGeometries(arrayGemetriesOfEffort);

                        var iWebMercAreaPlanar = calcAreaPlanar4ProjectedAndNotWebMerc(app.pGeometry);

                        try {
                            var iWebMercAreaGeodesic = calcAreaGeodesic4WebMercOrGeographicWGS84(app.pGeometry);
                        } catch (err) {
                            showErrorDialog("Spatial area polygon is too complex, replace the polygon with a new generalized polygon.  Contact the CED development team if help is needed");
                        }
                        showLoading();
                        var outSpatialReference = new SpatialReference({ wkid: 5071 });  //NAD_1983_HARN_Contiguous_USA_Albers, WKID list here https://developers.arcgis.com/rest/services-reference/projected-coordinate-systems.htm
                        gsvc = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
                        var params = new ProjectParameters();
                        params.geometries = [app.pGeometry];
                        params.outSR = outSpatialReference;
                        showLoading();
                        gsvc.project(params, projectedPolysResults, projectError);
                    }
                }
                else {
                    // do nothing
                }
            }

            function showErrorDialog(strMessage) {
                $("#dialogError").html(strMessage);
                $(function () {
                    $("#dialogError").dialog({
                        modal: true,
                        buttons: {
                            Ok: function () {
                                $(this).dialog("close");
                            },
                        },
                        width: "30%",
                        maxWidth: "768px"
                    });
                });
            }

            function projectError(pResults) {
                showErrorDialog("The area is to complex to calculate Acres, proceeding with other spatial operations.");
                app.m_ProcIndex = 0;
                hideLoading();
                document.getElementById("btn_Next").disabled = false;
                qry_SelectFeaturesFromLayer(app.m_ProcIndex);  //run the select by intersect
            }

            function projectedPolysResults(pResults) {
                showLoading();
                pProjectedGeometry = pResults[0];
                app.m_EffortArea = calcAreaPlanar4ProjectedAndNotWebMerc(pProjectedGeometry);
                app.m_ProcIndex = 0;
                qry_SelectFeaturesFromLayer(app.m_ProcIndex);  //run the select by intersect
            }

            function calcAreaPlanar4ProjectedAndNotWebMerc(geom) {
                iValue = geometryEngine.planarArea(geom, 109403);//area in US_acres, codes here http://resources.arcgis.com/en/help/runtime-java/apiref/constant-values.html#com.esri.core.geometry.AreaUnit.Code.ACRE
                return (Math.round(iValue * 10) / 10);
            }

            function calcAreaGeodesic4WebMercOrGeographicWGS84(geom) {
                iValue = geometryEngine.geodesicArea(geom, 109403); //area in US_acres, codes here http://resources.arcgis.com/en/help/runtime-java/apiref/constant-values.html#com.esri.core.geometry.AreaUnit.Code.ACRE
                return (Math.round(iValue * 10) / 10);
            }


            function mergeGeometries(pGeometies) {// might have multi polygons merge them into a single one
                var polygon = pGeometies[0];
                for (i = 1; i < pGeometies.length; i++) {
                    var poly = pGeometies[i];
                    for (j = 0; j < poly.rings.length; j++) {
                        polygon.addRing(poly.rings[j]);
                    }
                }
                return polygon;
            }

            function qry_SelectFeaturesFromLayer(iProxIndex) {
                showLoading();
                var strURL = app.m_Array2Proc[iProxIndex][0];
                var strOutField = app.m_Array2Proc[iProxIndex][1];
                var strOutField2 = app.m_Array2Proc[iProxIndex][3];

                var arrayFields = [strOutField];
                if (strOutField != "") {
                    arrayFields.push(strOutField2);
                }

                var pQuery = new Query();
                var queryTask = QueryTask(strURL);
                pQuery.returnGeometry = true;
                pQuery.outFields = arrayFields;
                pQuery.outSpatialReference = { "wkid": 102100 }; //a.k.a. 3857, WGS_1984_Web_Mercator_Auxiliary_Sphere see https://support.esri.com/en/technical-article/000013950
                pQuery.geometry = app.pGeometry;
                pQuery.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;  //this indicates to do the spatial select
                queryTask.execute(pQuery, Results1, Results1Error1);
            }

            function err(err) {
                console.log("Failed to get stat results due to an error: ", err);
            }

            function Results1(results) {
                var strOutField = app.m_Array2Proc[app.m_ProcIndex][1];
                var strOutField2 = "";
                var strTheme = app.m_Array2Proc[app.m_ProcIndex][2];

                if (app.m_Array2Proc[app.m_ProcIndex][3] != "") {
                    strOutField2 = app.m_Array2Proc[app.m_ProcIndex][3];
                }

                var strValue = "";
                var strValue2 = "";
                var pGeometryResult = null;
                var pFeature = null;
                var pGraphic = null;
                var iRedValue4RBG = 98 + (app.m_ProcIndex * 40);
                var iBlueValue4RBG = 204 - (app.m_ProcIndex * 40);
                var nTransparency = 0.6 - (app.m_ProcIndex * 0.1);
                var pfillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                    new Color2([iRedValue4RBG, 194, iBlueValue4RBG]), 2),
                                    new Color2([iRedValue4RBG, 194, iBlueValue4RBG, nTransparency])
                                    );

                pFeatures = results.features;
                var resultCount = pFeatures.length;
                if (resultCount > 0) {
                    for (var i = 0; i < pFeatures.length; i++) {
                        pFeature = pFeatures[i];
                        strValue = pFeature.attributes[strOutField];

                        if (strOutField2 != "") {
                            strValue2 = pFeature.attributes[strOutField2];
                        }

                        var pResultObject = new Object();
                        pResultObject.intersectTheme = strTheme;
                        pResultObject.intersectName = strValue;
                        pResultObject.intersectName2 = strValue2;
                        app.m_ArrayIntersectResults.push(pResultObject);

                        pGeometryResult1 = pFeature.geometry;
                        pGraphic = new Graphic();
                        pGraphic.setGeometry(pGeometryResult1);
                        pGraphic.setSymbol(pfillSymbol);

                        switch (strTheme) {     //add the graphic to the appropirate graphic layer
                            case "States":
                                app.pStateGraphicsLayer.add(pGraphic);
                            case "Counties":
                                app.pCountyGraphicsLayer.add(pGraphic);
                            case "WAFWA Management Zones":
                                app.pMZGraphicsLayer.add(pGraphic);
                            case "GRSG Population Areas":
                                app.pPopGraphicsLayer.add(pGraphic);
                        }
                    }
                }

                app.m_ProcIndex += 1;

                if (app.m_ProcIndex < app.m_Array2Proc.length) {
                    qry_SelectFeaturesFromLayer(app.m_ProcIndex);
                } else {
                    document.getElementById("ToggleGraphicsContainer").style.display = 'inline';

                    var strDialogText = "<u>Click Ok to continue editing next step OR click Cancel to resume spatial editing...</u><br>";
                    var strDialogText = "";
                    strDialogText += "<b>Effort " + app.iCEDID + " Area:</b> " + app.m_EffortArea.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " (US Acres)<br>";

                    for (var i = 0; i < app.m_ArrayIntersectResults.length; i++) {
                        pResultObject2 = app.m_ArrayIntersectResults[i];
                        strDialogText += "<b>Theme:</b> " + pResultObject2.intersectTheme + " <b>Name:</b> " + pResultObject2.intersectName;
                        if (pResultObject2.intersectName2 != "") {
                            strDialogText += " <b>Addition info:</b> " + pResultObject2.intersectName2
                        }
                        strDialogText +=  "<br>"
                    }

                    $("#dialog").html(strDialogText);

                    $(function () {
                        $("#dialog").dialog({
                            modal: true,
                            buttons: {
                                "Accept Edits and Continue": function () {
                                    $(this).dialog("close");
                                    ExitFootprinter();
                                },
                                "Cancel Process and Continue Editing": function () {
                                    $(this).dialog("close");
                                }
                            },
                            width: "30%",
                            maxWidth: "768px"
                        });
                    });
                }
            }

            function Results1Error1(results) {
                hideLoading();
                document.getElementById("btn_Next").disabled = false;
                console.log("Error with query1: " + results);
                alert("Error with query1");
            }

            function ExitFootprinter() {
                //Populating div's for Django to access
                var counties = ""
                var states = ""
                var wafwamz = ""
                var grsgpops = ""

                for (var i = 0; i < app.m_ArrayIntersectResults.length; i++) {
                    pResultObject2 = app.m_ArrayIntersectResults[i];
                    var theme = pResultObject2.intersectTheme;
                    var result = pResultObject2.intersectName;

                    if (theme == "Counties") {
                        if (counties.length > 0) {
                            counties += "," + pResultObject2.intersectName + ":" + pResultObject2.intersectName2;
                        } else {
                            counties = pResultObject2.intersectName + ":" + pResultObject2.intersectName2;
                        }
                    }

                    if (theme == "States") {
                        if (states.length > 0) {
                            states += "," + pResultObject2.intersectName;
                        } else {
                            states = pResultObject2.intersectName;
                        }
                    }

                    if (theme == "WAFWA Management Zones") {
                        if (wafwamz.length > 0) {
                            wafwamz += "," + pResultObject2.intersectName;
                        } else {
                            wafwamz = pResultObject2.intersectName;
                        }
                    }

                    if (theme == "GRSG Population Areas") {
                        if (grsgpops.length > 0) {
                            grsgpops += ";" + pResultObject2.intersectName;
                        } else {
                            grsgpops = pResultObject2.intersectName;
                        }
                    }
                }

                document.getElementById('id_countyvals').value = counties;
                document.getElementById('id_statevals').value = states;
                document.getElementById('id_mzvals').value = wafwamz;
                document.getElementById('id_grsgpopvals').value = grsgpops;
                document.getElementById('id_areavals').value = app.m_EffortArea;

                hideLoading();
                document.getElementById("btn_Next").disabled = false;

                if (((document.location.host.indexOf("localhost") > -1) | (document.location.host.indexOf("github") > -1)) & (document.location.host != 'localhost:9000')) {
                    alert("Area/Interesect Successfull, Local/Testing version not configured with CED");

                } else {
                    //dojo.byId("uploadForm").submit(); //Use for CED production//firefox has issues finding HTML using this method
                    document.getElementById("uploadForm").submit(); //Use for CED production
                }
            }
        }
    });
  }
);