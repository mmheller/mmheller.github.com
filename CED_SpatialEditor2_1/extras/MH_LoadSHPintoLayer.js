
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/request",
    "esri/urlUtils",
    "esri/tasks/query",
    "dojo/sniff",
    "esri/geometry/scaleUtils", "dojo/_base/array", "esri/graphic",
    "esri/layers/FeatureLayer",
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/on",
], function (
            declare, lang, request, urlUtils, Query,
            sniff, scaleUtils, arrayUtils, Graphic, FeatureLayer,
            dom, domClass, registry, on
) {

    return declare([], {

        shpLoadSetup: function () {
            on(dom.byId("uploadForm"), "change", function (event) { //Shapefile loading
                dom.byId('upload-status').innerHTML = '<p style="color:blue">Select shapefile as .zip file</p>';
                var fileName = event.target.value.toLowerCase();
                if (sniff("ie")) { //filename is full path in IE so extract the file name
                    var arr = fileName.split("\\");
                    fileName = arr[arr.length - 1];
                }
                if (fileName.indexOf(".zip") !== -1) {//is file a zip - if not notify user
                    app.pSHPLoading.generateFeatureCollection(fileName);
                }
                else {
                    dom.byId('upload-status').innerHTML = '<p style="color:LightCoral;margin-right:5px"><b>Add shapefile as .zip file</b></p>';
                }
            });
        },

        generateFeatureCollection: function (fileName) {
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
                url: app.portalUrl4Shapefile + '/sharing/rest/content/features/generate',
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
                    app.pSHPLoading.addShapefileToMap(response.featureCollection);
                }),
                error: lang.hitch(this, app.pSHPLoading.errorHandler)
            });

        },


        addShapefileToMap: function (featureCollection) {
            var fullExtent;
            var layers = [];
            arrayUtils.forEach(featureCollection.layers, function (layer) {
                var featureLayer = new FeatureLayer(layer);
                fullExtent = fullExtent ? fullExtent.union(featureLayer.fullExtent) : featureLayer.fullExtent;
            });
            app.map.setExtent(fullExtent.expand(1.25), true);
            dom.byId('upload-status').innerHTML = "";
            app.pSHPLoading.add2HostedFeatuerLayerViaApplyEdits(featureCollection);

        },

        add2HostedFeatuerLayerViaApplyEdits: function (featureCollection) {
            if (typeof app.iCEDID != 'undefined') {
                var iCEDID_4_Edits = app.iCEDID;
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
                    pSrcFeatureLayer.applyEdits(pNewFeatures2Add, null, null, app.pSHPLoading.onsucess, onerror);
                }
            });

            dom.byId('upload-status').innerHTML = "";
        },

        onsucess: function (msg) {
            var bnlSuccessfull = msg[0].success;
            dom.byId('upload-status').innerHTML = "<p style='color:GreenYellow;margin-right:5px'><b>Successful load of shapefile" + "</b></p>";
        },

        onerror: function (msg) {
            dom.byId('upload-status').innerHTML = "<p style='color:pink;margin-right:5px'><b>" + msg.message + "</b></p>";
        },

        errorHandler: function (error) {
            dom.byId('upload-status').innerHTML = "<p style='color:LightSalmon;margin-right:5px'><b>" + error.message + "</b></p>";
        }

    });
}
);