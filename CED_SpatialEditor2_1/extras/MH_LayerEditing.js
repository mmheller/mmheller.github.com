
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/urlUtils",
    "dojo/sniff",
    "esri/geometry/scaleUtils",  "dojo/_base/array", 
    "esri/dijit/editing/Editor-all",
    "esri/SnappingManager",
    "dijit/Toolbar",
    "dojo/dom",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/on"
], function (
            declare, lang, urlUtils,   
            sniff, scaleUtils, arrayUtils, Editorall, SnappingManager, 
            Toolbar, dom, domClass, registry, on
) {

    return declare([], {

        btn_PolyEdit_click: function (results) {
            var dom = dojo.byId("tpick-surface-0");
            on.emit(dom, "click", { bubbles: true, cancelable: true });
        },

        btn_Next_click: function () {
            alert("will jump to URL per Justin");
        },

        initEditor: function (results) {
            var layers = dojo.map(results, function (result) {
                var fieldInfos = dojo.map(result.layer.fields, function (field) {
                    return { 'fieldName': field.name, 'label': field.alias };
                });
                return {
                    featureLayer: result.layer, 'fieldInfos': fieldInfos, 'isEditable': false
                };
            });
            var featureLayer = results[0].layer;

            if (typeof app.iCEDID != 'undefined') {
                var iCEDID_4_Edits = app.iCEDID;
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
            app.map.enableSnapping({ snapKey: dojo.keys.copyKey });       //Dojo.keys.copyKey maps to CTRL in Windows and CMD in Mac !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            editorWidget.startup();
            app.map.infoWindow.resize(325, 500);
        }
    });
}
);