define([
	  "esri/Color",
	  "esri/config",
	  "esri/dijit/HomeButton",
	  "esri/dijit/Legend",
	  "esri/dijit/OpacitySlider",	  
	  "esri/dijit/PopupTemplate",
	  "esri/geometry/scaleUtils",
      "esri/InfoTemplate",
      "esri/map",
      "esri/layers/FeatureLayer",
	  "esri/layers/ArcGISTiledMapServiceLayer",
	  "esri/layers/ArcGISImageServiceLayer",
	  "esri/renderers/SimpleRenderer",
	  "esri/renderers/UniqueValueRenderer",
	  "esri/request",
	  "esri/symbols/PictureMarkerSymbol",
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/tasks/query",
	  "esri/tasks/RelationshipQuery",
      "esri/toolbars/draw",
	  "dgrid/Grid",
	  "dgrid/Selection",
	  "dojo/aspect",
      "dojo/dom",
	  "dojo/json",
      "dojo/on",
	  "dojo/number",
      "dojo/parser",
	  "dojo/sniff",
	  "dojo/window",
      "dojo/_base/array",
	  "dojo/_base/declare",
	  "dojo/_base/lang",
      "dijit/form/Button",
      "dijit/layout/BorderContainer",
      "dijit/layout/ContentPane",	  	  
      "dojo/domReady!"
    ],
function (Color, esriConfig, HomeButton, Legend, OpacitySlider, PopupTemplate, scaleUtils, InfoTemplate, Map, FeatureLayer, ArcGISTiledMapServiceLayer, 
			ArcGISImageServiceLayer, SimpleRenderer, UniqueValueRenderer, request, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, Query, 
			RelationshipQuery, Draw, Grid, Selection, aspect, dom, JSON, on, number, parser, sniff, dojoWindow, arrayUtils, declare, lang, Button, 
			BorderContainer, ContentPane) {
				
		return function (layerParms) {
			
			// layerParms function argument should be an object with the following properties populated:
			// {
			//		"featureLayerServiceURL": /*string*/,
			//      "tileLayerServiceURL": /*string*/,
			//      "dataLayerServiceURL": /*string*/
			// }				
			
			require(['aquaticSpeciesIndex.js']);
			
			// The portalURL variable and esriConfig.defaults.io.proxyUrl property specify what ArcGIS online site to send an
			// uploaded shapefile to so that it can be converted into a feature layer and accessed by this application.
			// I just use Esri's ArcGIS online URL since no other requirements or setup is necessary.
			var portalUrl = "https://www.arcgis.com";
			esriConfig.defaults.io.proxyUrl = "/proxy/";
				
			// Declare some variables that will be used throughout the script. 
			var selectionToolbar, tiledLayer, featureLayer, dataLayer, map,
				imageLayer, speciesOutputGrid, shapeFileFeatureLayer;
				
			// Delcare the table layout that will be displayed below the map.
			var tableLayout = [
				{'label': 'Conservation Target', 'field': 'speciesName', 'width': 'auto'},
				//{'label': 'Amount (sq. km)', 'field': 'speciesAmount', 'width': 'auto'},
				{'label': 'Importance of Selection to Optimal Plan (% of target in plan)','field': 'total', 'width': 'auto'}
			];

			// Create custom dgrid class that includes the "dgrid/Selection" mixin object.
			CustomGrid = declare([Grid, Selection]);
			
			// dgrid.Grid object let's you create a simple HTML table with parameters you specify.
			// In this case the fields will specify data from our dataLayer feature layer.
			
			speciesOutputGrid = new CustomGrid({
				columns: tableLayout,
				allowTextSelection: true,
				selectionMode: "single"
			},	'speciesGrid-2');
			
			speciesOutputGrid.on('dgrid-select', targetRowSelect);
			speciesOutputGrid.on('dgrid-deselect', targetRowDeselect);
			speciesOutputGrid.on('.dgrid:mouseover', targetRowMouseover);
			speciesOutputGrid.on('.dgrid:mouseout', targetRowMouseout);

			// Load the basemap from Esri's streets catalog.
			map = new Map("mapDiv-2", {
				basemap: "satellite",
				center: [-80, 38],
				zoom: 6,
				minZoom: 6,
				maxZoom: 13,
				shapeSelected: false
			});
			
			// Create a home button to reset map position.
			var homeButton = new HomeButton({
					map: map
				},"homebutton-2");
			homeButton.startup();
			
			// Setup the opacity info object to be passed to the opacity slider.
			var oInfo = {
				field: "fieldName",
				stops: [
					{value:8, opacity:1}
				]
			};

			// Create opacity slider for users.
			var opacitySlider = new OpacitySlider({
					opacityInfo: oInfo,
					maxValue: 10,
					minValue: 0,
					showLabels: false,
					showTransparentBackground: false
					
				},"opacityslider-2");
			opacitySlider.startup();

			opacitySlider.on("handle-value-change", function(data) {
				//console.log("data = ", data);
				tiledLayer.setOpacity((data.stops[0].value / 10));
			});			
			
			// After base map is loaded load the tile layer maps we have published.
			map.on("load", initSelectToolbar);

			tiledLayer = new ArcGISTiledMapServiceLayer(layerParms.tileLayerServiceURL,
				{
					opacity: (opacitySlider.opacityInfo.stops[0].value / 10)
				}
			);
			
			// Load the polygon feature layer for selection.
			featureLayer = new FeatureLayer(layerParms.featureLayerServiceURL,
				{
					mode: FeatureLayer.MODE_SELECTION,
					showAttribution: false,
					outFields: ["*"]
				}
			);
			
	
			// Load the data table from the publsihed data layer.
			dataLayer = new FeatureLayer(layerParms.dataLayerServiceURL,
				{
					outFields: ["*"]
				}
			);
		

			//////////////////////////////////////////////////////////////////////////////
			// After each layer is loaded we'll add the layer to the map Object 
			// which will display it within the app. Of course the dataLayer does
			// // not get added to the basemap.
			featureLayer.on("load", function(layer) {
				console.log("featureLayer is loaded");
				//console.log("featureLayer = ", featureLayer);
				
				//Set the color and stlye of selected features.
				var selectionSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_DIAGONAL_CROSS,    
					new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,0,0]), 2),
					new Color([0,0,0,0])
				);			
				featureLayer.setSelectionSymbol(selectionSymbol);
				
				// Add the feature layer to the map.
				map.addLayer(featureLayer);

			});
			
			tiledLayer.on("load", function(layer) {
					console.log("tiledLayer is loaded");
					//console.log("tiledLayer = ", tiledLayer);
					map.addLayer(tiledLayer);
					
			});
			
			dataLayer.on("load", function(layer) {
					console.log("dataLayer is loaded");
					//console.log("dataLayer = ", dataLayer);
			});

			// Every time the user tries to zoom either in or out this function will
			// kick off. We've set some restrictions on the zoom. A user will not
			// be able to zoom further then level 6 because there is no point to.
			// and the user will not be able to zoom closer than level 12 because
			// the tiled layer only has tiles defined up to level 12.
			// We'll also set the opacity of the tiled layer as the user zooms in 
			// and out.
			map.on("zoom-end", function(z) {
					//console.log("zoom level = ", z.level);
					var minZoom = 6;
					var maxZoom = 13;
			});


			//////////////////////////////////////////////////////////////////////////////
			// This function is the meat of the application. 
			// The basic algorithm for this function goes as follows:
			// 1) Create Draw event for anything on the map.
			// 2) When the draw event completes we check to see if it's a polygon or point.
			// 3) We query the feature layer based on the selected geomtry from the user.
			// 4) Once we've selected the feature(s) from the feature layer we perform
			//    a relationship query against the datalayer to get the needed data 
			//    for the table.
			// 5) Once this data is obtained we call summerizeSpeciesAmounts() to 
			//    update the table.
			
			function initSelectToolbar (event) {
			
				// Disable infowindow on map. We don't need it.
				map.setInfoWindowOnClick(false); 
				
				// New Draw object checked against our map.
				selectionToolbar = new Draw(event.map);
				// Create a new Query object.
				var selectFeatureQuery = new Query();
				// Create a new Relationship query object.
				var relatedDataQuery = new RelationshipQuery();
				// We want to get all the fields from the relationship query.
				relatedDataQuery.outFields = ["*"];
				relatedDataQuery.relationshipId = 0;

				// User's selected something let's get the geomtry and query the feature layer
				// for the selection.
				on(selectionToolbar, "DrawEnd", function (geometry) {
					selectFeatureQuery.geometry = geometry;
					
					// If selected feature is polygon...
					if (geometry.type == "polygon") {
						var featuresBtn = dom.byId("selectFeaturesButton-2");
						var btnEvent = new Event('click');
						featuresBtn.dispatchEvent(btnEvent);
						//we don't want the user to select more than one polygon.
						selectionToolbar.deactivate();
						featureLayer.selectFeatures(selectFeatureQuery,FeatureLayer.SELECTION_ADD);
						
					// Else we assume selected feature is a point within a single PU.
					} else {
						//console.log("single feature query select...");
						featureLayer.queryIds(selectFeatureQuery, function(objectIds) {
							//console.log("objectIds = ", objectIds);
							var graphics = featureLayer.getSelectedFeatures();
							//console.log("graphics = ", graphics);
							var selectSubtract = false;
							selectSubtract = graphics.some( function (feature) {
								//console.log("feature.attributes.objectid = " + feature.attributes.OBJECTID);
								return (objectIds[0] == feature.attributes.OBJECTID);
							});
							if (selectSubtract) {
								featureLayer.selectFeatures(selectFeatureQuery,	FeatureLayer.SELECTION_SUBTRACT);
								speciesOutputGrid.refresh();
							} else {
								featureLayer.selectFeatures(selectFeatureQuery,	FeatureLayer.SELECTION_ADD);
							}
							//console.log("graphics = ", graphics);
						});
					}
				});
				
		
				on (featureLayer,"selection-complete", function (results,method) {
					//var graphics = featureLayer.getSelectedFeatures();
					//var objectids = new Array;
					//graphics.forEach( function (feature) {
					//	objectids.push(feature.attributes.OBJECTID);
					//});
					//relatedDataQuery.objectIds = objectids;
					//featureLayer.queryRelatedFeatures(relatedDataQuery, null, function (err) {
					//	console.log("related query error: ", err);
					//});
					var graphics = featureLayer.getSelectedFeatures();
					_Objectids = new Array;

					graphics.forEach(function (feature) {
						_Objectids.push(feature.attributes.OBJECTID);
					});
					let strObjectIDstring = _Objectids.join(",");
					console.log(_Objectids.length.toString() + " objectids = " + strObjectIDstring);

					_iRangeOfFeatures2Proc = 150;  //sets the amount of features to pass for the relate then repeats if more features than this variable,  this prevents maxing out the relate
					_iIterations = Math.ceil(_Objectids.length / _iRangeOfFeatures2Proc);
					_iStep = 1;
					_features4Summary = undefined;
					_slicedObjectids = _Objectids.slice(((_iStep * _iRangeOfFeatures2Proc) - _iRangeOfFeatures2Proc), (_iStep * _iRangeOfFeatures2Proc));
					_iTotalFeaturesWithNoRelatedRecord = 0
					relatedDataQuery.objectIds = _slicedObjectids;

					featureLayer.queryRelatedFeatures(relatedDataQuery, null, function (err) {
						console.log("related query error: ", err);
					});


				});
				
				on (featureLayer,"query-related-features-complete", function (results) {
					//var features = results.featureSets;
					//var objectids = new Array;
					//summerizeSpeciesAmounts(features);
					let featuresTemp = results.featureSets;
					if (_features4Summary == undefined) {
						_features4Summary = featuresTemp;
					} else {
						for (let is = 0; is < _slicedObjectids.length; is++) {
							if (featuresTemp[_slicedObjectids[is]] != undefined) {
								_features4Summary[_slicedObjectids[is]] = featuresTemp[_slicedObjectids[is]];
							} else {
								console.log("no related data for objectid=" + _slicedObjectids[is]);
								_iTotalFeaturesWithNoRelatedRecord += 1;
							}
						}
					}
					if (_iStep < _iIterations) {
						_iStep += 1;
						_slicedObjectids = _Objectids.slice(((_iStep * _iRangeOfFeatures2Proc) - _iRangeOfFeatures2Proc), (_iStep * _iRangeOfFeatures2Proc));
						relatedDataQuery.objectIds = _slicedObjectids;
						featureLayer.queryRelatedFeatures(relatedDataQuery, null, function (err) {
							console.log("related query error: ", err);
						});

						dom.byId("totalFeaturesSelected-1").innerHTML = "Processing Features: " +
							_iStep.toString() * _iRangeOfFeatures2Proc.toString() + " of " + _Objectids.length.toString()
					} else {
						summerizeSpeciesAmounts(_features4Summary);
						console.log("number of feature with no related records: " + _iTotalFeaturesWithNoRelatedRecord.toString());
					}
				});

			}
			
			// When the user selects this button we set the Draw object to create
			// a polygon
			on(dom.byId("selectFeaturesButton-2"), "click", function (event) {
				var featuresBtn = dom.byId("selectFeaturesButton-2");
				var featureBtn = dom.byId("selectFeatureButton-2");
			
				if (!featuresBtn.toggle) {
					featuresBtn.className = "btn-active";
					featuresBtn.toggle = true;
					featureBtn.className = "btn";
					featureBtn.toggle = false;
					selectionToolbar.activate(Draw.POLYGON);
				} else {
					featuresBtn.className = "btn";
					featuresBtn.toggle = false;
					selectionToolbar.deactivate();
				}
			});
			
			// When the user selects this button we set the Draw object to create
			// a point.
			on(dom.byId("selectFeatureButton-2"), "click", function (event) {
				var featuresBtn = dom.byId("selectFeaturesButton-2");
				var featureBtn = dom.byId("selectFeatureButton-2");
			
				if (!featureBtn.toggle) {
					featureBtn.className = "btn-active";
					featureBtn.toggle = true;
					featuresBtn.className = "btn";
					featuresBtn.toggle = false;
					selectionToolbar.activate(Draw.POINT);
				} else {
					featureBtn.className = "btn";
					featureBtn.toggle = false;
					selectionToolbar.deactivate();
				}		
			});

			// This button will cause a file explorer window to be displayed
			// which will allow the user to choose a shapefile.
			on(dom.byId("uploadForm-2"), "change", function (event) {
				var fileName = event.target.value.toLowerCase();
				
				//filename is full path in IE so extract the file name
				if (sniff("ie")) { 
					var arr = fileName.split("\\");
					fileName = arr[arr.length - 1];
				}
				
				//Is fileName zip file?
				if (fileName.indexOf(".zip") !== -1) {
					generateFeatureCollection(fileName);
				}
				//Notify user file needs to be zipped.
				else {
					dom.byId('statusMessage-2').innerHTML = '<p class="status-message-bad" id="statusMessage-2">Error: Shapefile needs to be zipped</p>';
				}
			});
		
			// This button clears all selected features on the map as well
			// as any shape files that were loaded.
			on(dom.byId("clearSelectionButton-2"), "click", function () {
				var featuresBtn = dom.byId("selectFeaturesButton-2");
				var featureBtn = dom.byId("selectFeatureButton-2");
			
				if (shapeFileFeatureLayer) {
					var formLabelId = dom.byId('formLabelId-2');
					map.removeLayer(shapeFileFeatureLayer);
					shapeFileFeatureLayer = null;
				}

				featureBtn.className = "btn";
				featureBtn.toggle = false;
				featuresBtn.className = "btn";
				featuresBtn.toggle = false;
				
				selectionToolbar.deactivate()
				featureLayer.clearSelection();
				speciesOutputGrid.refresh();
				map.shapeSelected = false;
				
				document.getElementsByClassName("descriptionModelBox")[0].style.display = "none";
				speciesOutputGrid.clearSelection();
				dom.byId("totalFeaturesSelected-2").innerHTML = "Total Features Selected: 0"
				
			});
			
			
			// Get the data from the queries and apply it to the table.
			function summerizeSpeciesAmounts(features) {
			
				var graphics = featureLayer.getSelectedFeatures();
				var totalNumberFeaturesSelected = graphics.length;
				var selectedFeatures = new Array();
				var selectedFeaturesOut = new Array();
				var totalNumSpecies = 10;
				var dataAvailable = false;
				
				for (var i=0;i<totalNumSpecies;i++) { 
					selectedFeatures.push({
						"speciesId" : 0,
						"speciesName" : "",
						"speciesAmount" : 0,
						"total" : 0.0,
						"speciesDescription" : ""
					});
				}
				
				//console.log("selectedFeatures = ", selectedFeatures);
				//console.log("graphics = ", graphics);
				//console.log("features = ", features);

				graphics.forEach( function (feature) {
					strObjectId = "" + feature.attributes.OBJECTID;
					//console.log("objectID = " + strObjectId);
					if (features[strObjectId]) {
						dataAvailable = true;
						var puFeatures = features[strObjectId].features;
						//console.log("puFeatures = ", puFeatures); 
						puFeatures.forEach( function (puFeature) {
							var catSpeciesId = aquaticSpeciesCategories[aquaticSpeciesIndex[puFeature.attributes.species-1].catIndex].catId;
							//console.log("aquaticSpeciesIndex[puFeature.attributes.species-1].catIndex = " + aquaticSpeciesIndex[puFeature.attributes.species-1].catIndex);
							//console.log("catSpeciesId = " + catSpeciesId);
							selectedFeatures[catSpeciesId].speciesId = catSpeciesId;
							
							if (!selectedFeatures[catSpeciesId].speciesDescription) {
								selectedFeatures[catSpeciesId].speciesDescription = aquaticSpeciesCategories[catSpeciesId-1].description;
							}
							selectedFeatures[catSpeciesId].speciesAmount += puFeature.attributes.amount;
							
						});
					}
				});
				selectedFeatures.forEach( function (selectedFeature) {
					if (selectedFeature.speciesId > 0) {
						tmpObject = aquaticSpeciesCategories[selectedFeature.speciesId-1];
						selectedFeature.speciesName = tmpObject["conversationTarget"];
						selectedFeature.total = ((selectedFeature.speciesAmount) / (tmpObject["featureSum"]) * 100);
						selectedFeature.total = number.format(number.round(selectedFeature.total,4), {
							places: 4});
						//console.log("selectedFeature.total = " + selectedFeature.total);
						if (selectedFeature.total == 0) {
							selectedFeature.total = "value less than 0.0001";
						}

						//if (selectedFeature.speciesAmount == 0) selectedFeature.speciesAmount = "value less than 0.001";
						selectedFeaturesOut.push(selectedFeature);
					}
				});
				
				if (!dataAvailable) {
					selectedFeaturesOut.push({speciesName:"No data available for that area"});
				}
				//console.log("selectedFeaturesOut = ", selectedFeaturesOut);
				speciesOutputGrid.refresh();
				speciesOutputGrid.renderArray(selectedFeaturesOut);
				dom.byId("totalFeaturesSelected-2").innerHTML = "Total Features Selected: " + totalNumberFeaturesSelected;
				
				//console.log("selectedFeatures = ", selectedFeatures);
				
				return;
			}
			
			// Take the loaded shape file and generate a feature layer that can be displayed on the map.
			function  generateFeatureCollection(fileName) {
				var name = fileName.split(".");
				
				//Chrome and IE add c:\fakepath to the value - we need to remove it
				//See this link for more info: http://davidwalsh.name/fakepath
				name = name[0].replace("c:\\fakepath\\", "");
				
				dom.byId('statusMessage-2').innerHTML = '<p class="status-message-neutral" id="statusMessage-2">Status: Loading... ' + name + '</p>' 
				
				//Define the input params for generate see the rest doc for details
				//http://www.arcgis.com/apidocs/rest/index.html?generate.html
				var params = {
					'name': name,
					'targetSR': map.spatialReference,
					'maxRecordCount': 500,
					'enforceInputFileSizeLimit': true,
					'enforceOutputJsonSizeLimit': true
				};
				
				//generalize features for display Here we generalize at 1:40,000 which is approx 10 meters
				//This should work well when using web mercator.
				var extent = scaleUtils.getExtentForScale(map, 40000);
				var resolution = extent.getWidth() / map.width;
				params.generalize = true;
				params.maxAllowableOffset = resolution;
				params.reducePrecision = true;
				params.numberOfDigitsAfterDecimal = 0;
				
				var myContent = {
					'filetype': 'shapefile',
					'publishParameters': JSON.stringify(params),
					'f': 'json',
					'callback.html': 'textarea'
				};
				
				request({
					url: portalUrl + '/sharing/rest/content/features/generate',
					content: myContent,
					form: dom.byId('uploadForm-2'),
					handleAs: 'json',
					load: lang.hitch(this, function (response) {
						if (response.error) {
							console.log("error was hit...");
							errorHandler(response.error);
							return;
						}
						var layerName = response.featureCollection.layers[0].layerDefinition.name;
						dom.byId('statusMessage-2').innerHTML = '<p class="status-message-good" id="statusMessage-2">Status: shapefile is loaded</p>';
						addShapefileToMap(response.featureCollection);
					}),
					error: lang.hitch(this, shapeFileErrorHandler)
				});
				
				function shapeFileErrorHandler(error) {
					dom.byId('statusMessage-2').innerHTML = '<p class="status-message-bad" id="statusMessage-2">Error: Failed to load shapefile</p>';
					console.log('Error loading shapefile.');
					console.log('Error Message = ', error);
				}

			}
		
			// Add the shapefile to the map.
			function addShapefileToMap (featureCollection) {
				//add the shapefile to the map and zoom to the feature collection extent
				//If you want to persist the feature collection when you reload browser you could store the collection in
				//local storage by serializing the layer using featureLayer.toJson()  see the 'Feature Collection in Local Storage' sample
				//for an example of how to work with local storage.
				var fullExtent;
				var layers = [];
				var selectShapeQuery = new Query();
				var featuresBtn = dom.byId("selectFeaturesButton-2");
				var featureBtn = dom.byId("selectFeatureButton-2");

				arrayUtils.forEach(featureCollection.layers, function (layer) {
					var infoTemplate = new InfoTemplate("Details", "${*}");
					shapeFileFeatureLayer = new FeatureLayer(layer, {
						infoTemplate: infoTemplate
					});
					//associate the feature with the popup on click to enable highlight and zoom to
					shapeFileFeatureLayer.on('click', function (event) {
						//map.infoWindow.setFeatures([event.graphic]);
						if ((!featureBtn.toggle) && (!featuresBtn.toggle) && (!map.shapeSelected)) {
							selectShapeQuery.geometry = event.graphic.geometry;
							map.shapeSelected = true;
							featureLayer.selectFeatures(selectShapeQuery,FeatureLayer.SELECTION_ADD);
							map.removeLayer(shapeFileFeatureLayer);
						}
					});
					
					//change default symbol if desired. Comment this out and the layer will draw with the default symbology
					changeRenderer(shapeFileFeatureLayer);
					fullExtent = fullExtent ? fullExtent.union(shapeFileFeatureLayer.fullExtent) : shapeFileFeatureLayer.fullExtent;
					layers.push(shapeFileFeatureLayer);
				});
				
				map.addLayers(layers);
				map.setExtent(fullExtent.expand(1.25), true);

				dom.byId('statusMessage-2').innerHTML = "";
			}

			// This sets out the shape file is rendered on the map.
			function changeRenderer (layer) {
				//change the default symbol for the feature collection for polygons and points
				var symbol = null;
				switch (layer.geometryType) {
				  case 'esriGeometryPoint':
					symbol = new PictureMarkerSymbol({
					  'angle': 0,
					  'xoffset': 0,
					  'yoffset': 0,
					  'type': 'esriPMS',
					  'url': 'https://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png',
					  'contentType': 'image/png',
					  'width': 20,
					  'height': 20
					});
					break;
				  case 'esriGeometryPolygon':
					symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
					  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
						new Color([112, 112, 112]), 1), new Color([136, 136, 136, 0.25]));
					break;
				}
				if (symbol) {
				  layer.setRenderer(new SimpleRenderer(symbol));
				}
			}

			// This function highlights selected grid row and pops up description of selected target.
			function targetRowSelect (evt) {
				//console.log("targetRowSelect clicked = ", evt);
				//console.log("grid = ", evt.grid);
			
				$("#dMBox-2 .speciesDescription")[0].innerHTML = evt.rows[0].data.speciesDescription;
				$("#dMBox-2 .descriptionModelBox")[0].style.display = "block";
				$("#dMBox-2 .descriptionModelBoxClose")[0].onclick = function() {
					$("#dMBox-2 .descriptionModelBox")[0].style.display = "none";
					evt.grid.clearSelection();
				}
			}

			function targetRowDeselect (evt) {
				$("#dMBox-2 .descriptionModelBox")[0].style.display = "none";
			}

			function targetRowMouseover (evt) {
				//console.log("mouseover evt = ", evt);
				//console.log("speciesOutputGrid = ", speciesOutputGrid);
				
				// Show the tooltip if there are rows in the table and one isn't selected.
				if (($("#speciesGrid-2 .dgrid-row").get().length) && (!($("#speciesGrid-2 .dgrid-selected").get().length))) {					
					var x = evt.clientX, y = evt.clientY;
					$("#speciesGrid-2 .tooltip")[0].style.display = "block";
					$("#speciesGrid-2 .tooltip")[0].style.top = (y+20) + 'px';
					$("#speciesGrid-2 .tooltip")[0].style.left = (x+20) + 'px';
				}
				else 
					$("#speciesGrid-2 .tooltip")[0].style.display = "none";
			}

			function targetRowMouseout (evt) {
				$("#speciesGrid-2 .tooltip")[0].style.display = "none";
			}

			function getJSON(url, callback) {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.responseType = 'json';
				xhr.onreadystatechange = function() { 
					if (xhr.readState === 4) {
						var status = xhr.status;
							if (status === 200) {
								callback(null, xhr.response);
							} else {
								callback(status, xhr.response);
							}
					}
				};
				xhr.send();
			}
		}
});
