//Created By:  Matt Heller,  U.S. Fish and Wildlife Service, Science Applications, Region 6
//Date:        May 2018, Updated May 2019

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

define([
    "extras/MH_LoadSHPintoLayer",
    "extras/MH_LayerEditing",
    "extras/MH_Zoom2FeatureLayersFootprinter",
    "extras/MH_ProcAreaIntersect",
    "dijit/form/CheckBox", "esri/layers/GraphicsLayer",
    "esri/dijit/BasemapGallery",
    "esri/geometry/webMercatorUtils",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/urlUtils",
    "esri/layers/FeatureLayer",
    "esri/dijit/Scalebar",
    "esri/geometry/scaleUtils", "dojo/_base/array", 
    "esri/layers/FeatureLayer",
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/mouse",
    "dojo/on",
    "esri/map"
], function (
            MH_LoadSHPintoLayer, MH_LayerEditing, MH_Zoom2FeatureLayers, MH_ProcAreaIntersect, CheckBox, GraphicsLayer, BasemapGallery, webMercatorUtils, declare, lang, urlUtils, FeatureLayer,
            Scalebar, scaleUtils, arrayUtils, FeatureLayer,
            dom, domClass, registry, mouse, on, Map
) {

    return declare([], {
        Phase1: function () {
            app.iCEDID = getTokens()['CEDID'];    //*****************************************************Justin Change this to your Django CEID id variable!!!!!!!!
            if (typeof app.iCEDID != 'undefined') {
                var arrayCenterZoom = [-111, 45.5];
                var izoomVal = 5;
            } else {
                var arrayCenterZoom = [-111, 45.5];
                var izoomVal = 10;
            }

            app.blnEditOccured = false;

            esri.config.defaults.geometryService = new esri.tasks.GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
            app.map = new esri.Map("map", { basemap: "topo", center: arrayCenterZoom, zoom: izoomVal, slider: true });

            app.pLEdit = new MH_LayerEditing({}); // instantiate the class
            dojo.connect(app.map, "onLayersAddResult", app.pLEdit.initEditor);

            dojo.connect(app.map, 'onLayersAddResult', function (results) {            //add check boxes 
                if (results !== 'undefined') {
                    dojo.forEach(arraycbxLayers, function (cbxLayersAndDiv) {
                        var cbxLayers = cbxLayersAndDiv[0];
                        var strDiv = cbxLayersAndDiv[1];
                        dojo.forEach(cbxLayers, function (layer) {
                            var layerName = layer.title;
                            var checkBox = new CheckBox({
                                name: "checkBox" + layer.layer.id, value: layer.layer.id, checked: layer.layer.visible,
                                onChange: function (evt) {
                                    var clayer = app.map.getLayer(this.value);
                                    if (clayer.visible) {
                                        clayer.hide();
                                    } else {
                                        clayer.show();
                                    }
                                    this.checked = clayer.visible;
                                }
                            });
                            dojo.place(checkBox.domNode, document.getElementById(strDiv), "after"); //add the check box and label to the toc
                            var checkLabel = dojo.create('label', { 'for': checkBox.name, innerHTML: layerName }, checkBox.domNode, "after");
                            dojo.place("<br />", checkLabel, "after");
                        });
                    });
                }
            });

            var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" });
            app.loading = document.getElementById("loadingImg");  //loading image. id
            dojo.connect(app.map, "onUpdateStart", showLoading);
            dojo.connect(app.map, "onUpdateEnd", hideLoading);

            var basemapTitle = dom.byId("basemapTitle");
            on(basemapTitle, "click", function () {
                domClass.toggle("panelBasemaps", "panelBasemapsOn");
            });
            on(basemapTitle, mouse.enter, function () {
                domClass.add("panelBasemaps", "panelBasemapsOn");
            });
            var panelBasemaps = dom.byId("panelBasemaps");
            on(panelBasemaps, mouse.leave, function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });

            var pEditButton = document.getElementById("btn_PolyEdit");
            on(pEditButton, "click", app.pLEdit.btn_PolyEdit_click);
            var pNextButton = document.getElementById("btn_Next");
            on(pNextButton, "click", app.pLEdit.btn_Next_click);
            
            var component = registry.byId("BorderContainer_Footprinttool"); //remedy for error Tried to register widget with id==BorderContainer_Footprinttool but that id is already registered
            if (component) {//if it exists
                domConstruct.destroy(component);                //destroy it
            }

            app.pSHPLoading = new MH_LoadSHPintoLayer({}); // instantiate the class
            app.pSHPLoading.shpLoadSetup();
            app.pProcAreaIntersect = new MH_ProcAreaIntersect({}); // instantiate the class

            app.portalUrl4Shapefile = "https://www.arcgis.com";

            if (document.location.host == "conservationefforts.org") {
                var strHFL_URL = "https://utility.arcgis.com/usrsvcs/servers/3ffd269482224fa9a08027ef8617a44c/rest/services/NA_SRC_v2/FeatureServer/5"; //***Production!!!!
            } else {
                var strHFL_URL = "https://utility.arcgis.com/usrsvcs/servers/e09a9437e03d4190a3f3a8f2e36190b4/rest/services/Development_Src_v2/FeatureServer/0"; //***Sandbox!!!!!
                document.getElementById("txt_Version").innerHTML += ": Sandbox AGOL Hosted Feature Layer Currently Configured";
            }

            app.pSrcFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL, { id:"99",
                mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: ['*']
            });

            app.pStateGraphicsLayer = new esri.layers.GraphicsLayer();
            app.pCountyGraphicsLayer = new esri.layers.GraphicsLayer();
            app.pMZGraphicsLayer = new esri.layers.GraphicsLayer();
            app.pPopGraphicsLayer = new esri.layers.GraphicsLayer();

            app.map.addLayer(app.pStateGraphicsLayer);
            app.map.addLayer(app.pCountyGraphicsLayer);
            app.map.addLayer(app.pMZGraphicsLayer);
            app.map.addLayer(app.pPopGraphicsLayer);

            if (typeof app.iCEDID != 'undefined') {
                app.pSrcFeatureLayer.setDefinitionExpression("(project_id = " + app.iCEDID + ")");
            }

            var strBase_URL = "https://utility.arcgis.com/usrsvcs/servers/5d5fc053dd7e4de4b9765f7a6b6f1f61/rest/services/CEDfrontpage_map_v9_Restrict/FeatureServer/";
            CED_PP_point = new FeatureLayer(strBase_URL + "0", { id: "0", "opacity": 0.3, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
            CED_PP_point.setDefinitionExpression("((SourceFeatureType = 'point') OR ( SourceFeatureType = 'poly' AND Wobbled_GIS = 1)) and (TypeAct not in ('Non-Spatial Plan', 'Non-Spatial Project'))");
            CED_PP_line = new FeatureLayer(strBase_URL + "1", { id: "1", "opacity": 0.3, mode: FeatureLayer.MODE_ONDEMAND, visible: false });
            CED_PP_poly = new FeatureLayer(strBase_URL + "2", { id: "2", "opacity": 0.2, mode: esri.layers.FeatureLayer.MODE_ONDEMAND, autoGeneralize: true, visible: false });

            app.map.addLayers([app.pSrcFeatureLayer, CED_PP_poly, CED_PP_line, CED_PP_point]);
            var cbxLayers1 = [];
            cbxLayers1.push({ layer: CED_PP_point, title: 'Approved CED Point' });
            cbxLayers1.push({ layer: CED_PP_line, title: 'Approved CED Lines' });
            cbxLayers1.push({ layer: CED_PP_poly, title: 'Approved CED Polygons' });

            var cbxLayers2 = [];
            cbxLayers2.push({ layer: app.pStateGraphicsLayer, title: 'Intersecting State(s)' });
            cbxLayers2.push({ layer: app.pCountyGraphicsLayer, title: 'Intersecting County(s)' });
            cbxLayers2.push({ layer: app.pMZGraphicsLayer, title: 'Intersecting MZ(s)' });
            cbxLayers2.push({ layer: app.pPopGraphicsLayer, title: 'Intersecting Pop Area(s)' });
            
            var arraycbxLayers = [[cbxLayers1, "LayerToggleDiv"], [cbxLayers2, "ToggleGraphics"]];

            $('#checkGraphicsLayers1').on('change', function () {
                //var _val = $(this).is(':checked') ? 'checked' : 'unchecked';
                var pGraphicsLayer = app.map.graphics;
                if (pGraphicsLayer.visible) {
                    pGraphicsLayer.hide();
                } else {
                    pGraphicsLayer.show();
                }
            });


            if (typeof app.iCEDID != 'undefined') {
                //app.dblExpandNum = 3.75;
                app.dblExpandNum = 1;
                app.pSup = new MH_Zoom2FeatureLayers({}); // instantiate the class
                app.pSup.qry_Zoom2FeatureLayerExtent(app.pSrcFeatureLayer);
            }
            
            if (app.map.loaded) {
                mapLoaded();
            } else {
                app.map.on("load", function () { mapLoaded(); });
            }

            function mapLoaded() {        // map loaded//            // Map is ready
                app.map.on("mouse-move", showCoordinates); //after map loads, connect to listen to mouse move & drag events
                app.map.on("mouse-drag", showCoordinates);

                app.basemapGallery = new BasemapGallery({ showArcGISBasemaps: true, map: app.map }, "basemapGallery");
                app.basemapGallery.startup();
                app.basemapGallery.on("selection-change", function () { domClass.remove("panelBasemaps", "panelBasemapsOn"); });
                app.basemapGallery.on("error", function (msg) { console.log("basemap gallery error:  ", msg); });
            }

            function showCoordinates(evt) {
                var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);  //the map is in web mercator but display coordinates in geographic (lat, long)
                dom.byId("txt_xyCoords").innerHTML = " Latitude:" + mp.y.toFixed(4) + ", Longitude:" + mp.x.toFixed(4);  //display mouse coordinates
            }

            function err(err) {
                console.log("Failed to get stat results due to an error: ", err);
            }

            function getTokens() {
                var tokens = [];
                var query = location.search;
                query = query.slice(1);
                query = query.split('&');
                $.each(query, function (i, value) {
                    var token = value.split('=');
                    var key = decodeURIComponent(token[0]);
                    var data = decodeURIComponent(token[1]);
                    tokens[key] = data;
                });
                return tokens;
            }
        },

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);