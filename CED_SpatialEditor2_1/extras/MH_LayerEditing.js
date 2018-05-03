
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/urlUtils",
    "dojo/sniff",
    "esri/geometry/scaleUtils", "dojo/_base/array",
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
            //document.getElementById('btn_PolyEdit').style.visibility = 'hidden';
        },

        btn_Next_click: function () {
            alert("will jump to URL per Justin");
        },

        initEditor: function (results) {
            dojo.forEach(results, function (pLayer) {
                if (pLayer.layer.id == "99") {
                    var fieldInfos2 = [];
                    var fieldInfos = dojo.map(pLayer.layer.fields, function (field) {
                        if ("Project_ID,DateCreated,DateUpdated".indexOf(field.name) >= 0) {
                            fieldInfos2.push({ 'fieldName': field.name, 'label': field.alias + " (Attr. Read Only)" });
                        }
                        return { 'fieldName': field.name, 'label': field.alias};
                    });
                    var featureLayerInfos = [{
                        featureLayer: pLayer.layer, 'fieldInfos': fieldInfos2, 'isEditable': false
                        //featureLayer: pLayer.layer, 'fieldInfos': fieldInfos, 'isEditable': false
                    }];
                    var layers = featureLayerInfos;

                    var featureLayer = pLayer.layer;

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
    });
}
);