
define([
    "extras/MH_Zoom2FeatureLayers",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/request",
    "dojo/promise/all",
    "esri/urlUtils",
    "esri/layers/FeatureLayer",
    "esri/tasks/query",
    "dojo/promise/all",
    "esri/dijit/Scalebar",
    "dojo/sniff",
    "esri/geometry/scaleUtils", "esri/request", "dojo/_base/array", "esri/graphic",
    "esri/dijit/editing/Editor-all",
    "esri/SnappingManager",
    "esri/layers/FeatureLayer",
    "esri/renderers/SimpleRenderer",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "dijit/form/CheckBox",
    "dijit/Toolbar",
    "esri/geometry/Polygon", "esri/InfoTemplate",
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/mouse",
    "dojo/on",
    "esri/map"
], function (
            MH_Zoom2FeatureLayers, declare, lang, esriRequest, all, urlUtils, FeatureLayer, Query, All,
            Scalebar, sniff, scaleUtils, request, arrayUtils, Graphic, Editorall, SnappingManager, FeatureLayer,
        SimpleRenderer, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol,
        CheckBox, Toolbar, Polygon,InfoTemplate, dom, domClass, registry, mouse, on, Map
) {

    return declare([], {
        Phase1: function () {
            var iCEDID = getTokens()['CEDID'];    //*****************************************************Justin Change this to your Django CEID id variable!!!!!!!!
            if (typeof iCEDID != 'undefined') {
                var arrayCenterZoom = [-111, 45.5];
                var izoomVal = 5;
            } else {
                var arrayCenterZoom = [-111, 45.5];
                var izoomVal = 10;
            }

            esri.config.defaults.geometryService = new esri.tasks.GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
            app.map = new esri.Map("map", { basemap: "topo", center: arrayCenterZoom, zoom: izoomVal, slider: true });
            dojo.connect(app.map, "onLayersAddResult", initEditor);

            var scalebar = new Scalebar({ map: app.map, scalebarUnit: "dual" });
            var pEditButton = dojo.byId("btn_PolyEdit");
            on(pEditButton, "click", btn_PolyEdit_click);

            var component = registry.byId("BorderContainer_Footprinttool"); //remedy for error Tried to register widget with id==BorderContainer_Footprinttool but that id is already registered
            if (component) {//if it exists
                domConstruct.destroy(component);                //destroy it
            }

            on(dom.byId("uploadForm"), "change", function (event) { //Shapefile loading
                dom.byId('upload-status').innerHTML = '<p style="color:blue">Select shapefile as .zip file</p>';
                var fileName = event.target.value.toLowerCase();
                if (sniff("ie")) { //filename is full path in IE so extract the file name
                    var arr = fileName.split("\\");
                    fileName = arr[arr.length - 1];
                }
                if (fileName.indexOf(".zip") !== -1) {//is file a zip - if not notify user
                    generateFeatureCollection(fileName);
                }
                else {
                    dom.byId('upload-status').innerHTML = '<p style="color:LightCoral;margin-right:5px"><b>Add shapefile as .zip file</b></p>';
                }
            });


            var portalUrl4Shapefile = "https://www.arcgis.com";
            var strHFL_URL = "https://utility.arcgis.com/usrsvcs/servers/e09a9437e03d4190a3f3a8f2e36190b4/rest/services/Development_Src_v2/FeatureServer/0";
            pSrcFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL, {
                mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: ['*']
            });

            if (typeof iCEDID != 'undefined') {
                pSrcFeatureLayer.setDefinitionExpression("(project_id = " + iCEDID + ")");
            }
            app.map.addLayers([pSrcFeatureLayer]);

            if (typeof iCEDID != 'undefined') {
                //app.dblExpandNum = 3.75;
                app.dblExpandNum = 1;
                app.pSup = new MH_Zoom2FeatureLayers({}); // instantiate the class
                app.pSup.qry_Zoom2FeatureLayerExtent(pSrcFeatureLayer);
            }
            
            //var portalUrl4Shapefile = "https://fws.maps.arcgis.com";
            //var portalUrl4Shapefile = "https://www.arcgis.com";
            //var strHFL_URL = "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/Development_Src_v2/FeatureServer/0";
            //var info = new OAuthInfo({ appId: "jHualSvRS1V5nVMM", popup: false });
            //esriId.registerOAuthInfos([info]);
            //esriId.getCredential(info.portalUrl + "/sharing");                // user will be redirected to OAuth Sign In page
            //esriId.checkSignInStatus(info.portalUrl + "/sharing").then(
            //  function () {
            //      pSrcFeatureLayer = new esri.layers.FeatureLayer(strHFL_URL, {mode: esri.layers.FeatureLayer.MODE_ONDEMAND, "opacity": 0.6, outFields: ['*']});
            //      map.addLayers([pSrcFeatureLayer]);
            //      console.log("adding layer");

            //      if (pFCol) {
            //          console.log("feature col exists");
            //      } else {
            //          console.log("does not exists");
            //      }

            //  }
            //).otherwise(function () { });// Do nothing

            function err(err) {
                console.log("Failed to get stat results due to an error: ", err);
            }

            function generateFeatureCollection(fileName) {
                var name = fileName.split(".");
                name = name[0].replace("c:\\fakepath\\", "");            //Chrome and IE add c:\fakepath to the value - we need to remove it, See this link for more info: http://davidwalsh.name/fakepath
                dom.byId('upload-status').innerHTML = '<b>Loading… </b>' + name;

                var params = { //Define the input params for generate see the rest doc for details,  http://www.arcgis.com/apidocs/rest/index.html?generate.html
                    'name': name,
                    'targetSR': app.map.spatialReference,
                    'maxRecordCount': 1000,
                    'enforceInputFileSizeLimit': true,
                    'enforceOutputJsonSizeLimit': true
                };
                var extent = scaleUtils.getExtentForScale(app.map, 40000);//generalize features for display Here we generalize at 1:40,000 which is approx 10 meters, This should work well when using web mercator.
                var resolution = extent.getWidth() / app.map.width;
                params.generalize = true;
                params.maxAllowableOffset = resolution;
                params.reducePrecision = true;
                params.numberOfDigitsAfterDecimal = 0;

                var myContent = {
                    'filetype': 'shapefile', 'publishParameters': JSON.stringify(params),
                    'f': 'json', 'callback.html': 'textarea'
                };

                //esriId.destroyCredentials();//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                //map.removeLayer(pSrcFeatureLayer);

                request({            //use the rest generate operation to generate a feature collection from the zipped shapefile
                    url: portalUrl4Shapefile + '/sharing/rest/content/features/generate',
                    content: myContent,
                    form: dom.byId('uploadForm'),
                    handleAs: 'json',
                    load: lang.hitch(this, function (response) {
                        if (response.error) {
                            errorHandler(response.error);
                            return;
                        }
                        var layerName = response.featureCollection.layers[0].layerDefinition.name;
                        dom.byId('upload-status').innerHTML = '<b>Loaded: </b>' + layerName;


                        pFCol = response.featureCollection;
                        addShapefileToMap(response.featureCollection);

                    }),
                    error: lang.hitch(this, errorHandler)
                });
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

            function addShapefileToMap(featureCollection) {            //add the shapefile to the map and zoom to the feature collection extent,If you want to persist the feature collection when you reload browser you could store the collection in local storage by serializing the layer using featureLayer.toJson()  see the 'Feature Collection in Local Storage' sample for an example of how to work with local storage.
                var fullExtent;
                var layers = [];
                arrayUtils.forEach(featureCollection.layers, function (layer) {
                    var featureLayer = new FeatureLayer(layer);
                    fullExtent = fullExtent ? fullExtent.union(featureLayer.fullExtent) : featureLayer.fullExtent;
                });
                app.map.setExtent(fullExtent.expand(1.25), true);
                dom.byId('upload-status').innerHTML = "";
                add2HostedFeatuerLayerViaApplyEdits(featureCollection);
            }

            function add2HostedFeatuerLayerViaApplyEdits(featureCollection) {
                if (typeof iCEDID != 'undefined') {
                    var iCEDID_4_Edits = iCEDID;
                } else {
                    var iCEDID_4_Edits = 9999;
                }

                var fullExtent;
                var layers = [];
                dom.byId('upload-status').innerHTML = "Uploading data to Hosted Featuer Layer";

                arrayUtils.forEach(featureCollection.layers, function (pUpLoadedfeatureLayer) {
                    var pFeatureSet = pUpLoadedfeatureLayer.featureSet;
                    var pNewFeatures2Add = [];
                    arrayUtils.forEach(pFeatureSet.features, function (pFeature) {
                        var attr = {};
                        attr["SBURL"] = "NOT YET DEFINED";
                        attr["Project_ID"] = iCEDID_4_Edits;
                        attr["DateCreated"] = Date.now();
                        attr["DateUpdated"] = Date.now();
                        var graphic = new Graphic(pFeature.geometry);
                        graphic.setAttributes(attr);
                        pNewFeatures2Add.push(graphic);
                    });

                    var capabilities = pSrcFeatureLayer.getEditCapabilities();
                    if (capabilities.canUpdate) {
                        console.log("This layer can be updated");
                        pSrcFeatureLayer.applyEdits(pNewFeatures2Add, null, null, onsucess, onerror);
                    }
                });

                dom.byId('upload-status').innerHTML = "";
            }

            function onsucess(msg) {
                var bnlSuccessfull = msg[0].success;
                dom.byId('upload-status').innerHTML = "<p style='color:GreenYellow;margin-right:5px'><b>Successful load of shapefile" + "</b></p>";
            }
            function onerror(msg) {
                dom.byId('upload-status').innerHTML = "<p style='color:pink;margin-right:5px'><b>" + msg.message + "</b></p>";
            }
            function errorHandler(error) {
                dom.byId('upload-status').innerHTML = "<p style='color:LightSalmon;margin-right:5px'><b>" + error.message + "</b></p>";
            }

            function btn_PolyEdit_click() {
                var dom = dojo.byId("tpick-surface-0");
                on.emit(dom, "click", { bubbles: true, cancelable: true });
            }

            function initEditor(results) {       //build the layer and field information for the layer, display the description field using a text area.
                var layers = dojo.map(results, function (result) {
                    var fieldInfos = dojo.map(result.layer.fields, function (field) {
                        return { 'fieldName': field.name, 'label': field.alias };
                    });
                    return {
                        featureLayer: result.layer, 'fieldInfos': fieldInfos, 'isEditable': false
                    };
                });
                var featureLayer = results[0].layer;

                if (typeof iCEDID != 'undefined') {
                    var iCEDID_4_Edits = iCEDID;
                } else {
                    var iCEDID_4_Edits = 9999;
                }

                dojo.connect(featureLayer, 'onBeforeApplyEdits', function (adds, deletes, updates) {          //add a default value for newly added features
                    dojo.forEach(adds, function (add) {
                        add.attributes['SBURL'] = 'Unknown SB URL';
                        add.attributes['Project_ID'] = iCEDID_4_Edits;
                        add.attributes["DateCreated"] = Date.now();
                        add.attributes["DateUpdated"] = Date.now();
                    });
                });

                //dojo.connect(featureLayer, 'before-apply-edits', function (updates) {          //add a default value for newly added features
                //    dojo.forEach(updates, function (updateM) {
                //        if (updateM.attributes['SBURL'] === null) {
                //            updateM.attributes['SBURL'] = 'Unknown SB URL';
                //        }
                //        updateM.attributes["DateUpdated"] = Date.now();
                //    });
                //});

                var templatePicker = new esri.dijit.editing.TemplatePicker({
                    featureLayers: [featureLayer],
                    style: "visibility:collapse; height:5px"
                }, 'templatePickerDiv');
                templatePicker.startup();

                var settings = {
                    map: app.map,
                    templatePicker: templatePicker,
                    enableUndoRedo: true,
                    layerInfos: layers,
                    toolbarVisible: true,
                    createOptions: { polygonDrawTools: [esri.dijit.editing.Editor.CREATE_TOOL_FREEHAND_POLYGON, esri.dijit.editing.Editor.CREATE_TOOL_AUTOCOMPLETE] },
                    toolbarOptions: { reshapeVisible: true, cutVisible: true, mergeVisible: true }
                };
                var params = { settings: settings };

                editorWidget = new esri.dijit.editing.Editor(params, 'editorDiv');
                app.map.enableSnapping({ snapKey: dojo.keys.copyKey });       //Dojo.keys.copyKey maps to CTRL in Windows and CMD in Mac
                editorWidget.startup();
                app.map.infoWindow.resize(325, 500);
            }
        },

        err: function (err) {
            console.log("Failed to get stat results due to an error: ", err);
        }

    });
  }
);