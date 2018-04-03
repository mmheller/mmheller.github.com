require([
		"dijit/Tooltip",
		"dojo/domReady!"
], function(
Tooltip
){
	new Tooltip( {
		connectId: "baseMaps",
		label: "Change basemap",
		showDelay: 0
	});

	//Create tooltips for query/select tools	
	new Tooltip( {
		connectId: "queryPoint",
		label: "Click on map to query single hexagon",
		showDelay: 0,
		position: ["below"]
	});
	
	new Tooltip( {
		connectId: "drawPoints",
		label: "Draw points on map to query data",
		showDelay: 0,
		position: ["below"]
	});
	
	new Tooltip( {
		connectId: "drawLine",
		label: "Draw line on map to query data",
		showDelay: 0,
		position: ["below"]
	});
	
	new Tooltip( {
		connectId: "drawPoly",
		label: "Draw polygon on map to query data",
		showDelay: 0,
		position: ["below"]
	});
	
	new Tooltip( {
		connectId: "drawCircle",
		label: "Draw circle on map to query data",
		showDelay: 0,
		position: ["below"]
	});
	
	new Tooltip( {
		connectId: "drawRect",
		label: "Draw rectangle on map to query data",
		showDelay: 0,
		position: ["below"]
	});	
	
	new Tooltip( {
		connectId: "drawClear",
		label: "Clear drawing and queried data",
		showDelay: 0,
		position: ["below"]
	});
	
	//Create tooltips for CHAT layer legend elements
	new Tooltip( {
		connectId: "infoCHAT",
		label: "Hover on legend elements for more information.",
		showDelay: 0
	});
	
	new Tooltip( {
		connectId: "legendHeadCHAT",
		label: "<div class='legendToolTip'>" +
					"Crucial Habitat Rank is the aggregated representation of Nevada wildlife and habitat information describing areas expected to contain the crucial resources necessary for continued fish and wildlife populations or important ecological systems expected to promote high values of fish and wildlife biodiversity. Specifically, Crucial Habitat includes data that describes wildlife resource information regarding:" +
					"<ul>" +
						"<li>Terrestrial Species of Concern;</li>" +
						"<li>Terrestrial Species of Economic & Recreational Importance;</li>" +
						"<li>Wetland/Riparian Habitat; and</li>" +
						"<li>Landscape Condition. </li>" +
					"</ul>" +
					"Crucial Habitat is ranked using a relative, six-level prioritization scheme, where 1 represents the \"Most Crucial\" areas and 6 represents the \"Least Crucial\", although potentially still important, areas. Crucial Habitat ranks are <strong>non-regulatory</strong> and in no way imply any specific avoidance or mitigation measures for a given area. Crucial Habitat ranks should be interpreted as the relative probability, or risk, that a high-priority species or habitat would be encountered in a given area based on the best available wildlife resource information." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendCHAT1",
		label: "<div class='legendToolTip'>" +
					"CHAT Rank 1 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of Threatened or Endangered species in areas with the highest Landscape Condition Rank (at least as good as 80% of the Wilderness Areas and National Parks in Nevada)<br />[<i>SOC Rank 1 and LC Rank 1</i>];</li>" +
						"<li>Known locations of all S1 or S2 species or S3 species with Extremely Vulnerable or Highly Vulnerable CCVI scores in areas with the highest Landscape Condition Rank<br />[<i>SOC Rank 1-2 and LC Rank 1</i>];</li>" +
						"<li>Known locations of bald or golden eagle nest sites or greater sage-grouse lek sites in areas with the highest Landscape Condition Rank<br />[<i>SOC Rank 1 and LC Rank 1</i>];</li>" +
						"<li>Greater sage-grouse Essential/Irreplaceable Habitat in areas with the highest Landscape Condition Rank<br />[<i>SOC Rank 2 and LC Rank 1</i>];</li>" +
						"<li>Modeled potential biodiversity of terrestrial Species of Concern above 80% in areas with the highest Landscape Condition Rank<br />[<i>SOC Rank 2 and LC Rank 1</i>];</li>" +
						"<li>Areas with Priority Habitat for at least two terrestrial game species in areas with the highest Landscape Condition Rank<br />[<i>SERI Rank 1-2 and LC Rank 1</i>]; or</li>" +
						"<li>Nevada's highest priority wetland/riparian habitats (High Priority/High Stewardship Urgency)<br />[<i>Wet/Rip Habitat Rank 1</i>].</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendCHAT2",
		label: "<div class='legendToolTip'>" +
					"CHAT Rank 2 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of S3 species with Moderately Vulnerable CCVI scores or S4 species with Extremely Vulnerable or Highly Vulnerable CCVI scores in areas with the highest Landscape Condition Rank<br />[<i>SOC Rank 3 and LC Rank 1</i>];</li>" +
						"<li>Greater sage-grouse Important Habitat in areas with the highest Landscape Condition Rank<br />[<i>SOC Rank 3 and LC Rank 1</i>];</li>" +
						"<li>Modeled potential biodiversity of terrestrial Species of Concern between 60% and 80% in areas with the highest Landscape Condition Rank<br />[<i>SOC Rank 3 and LC Rank 1</i>];</li>" +
						"<li>Areas with Priority Habitat for at least any terrestrial game species or areas with General Habitat for at least 8 terrestrial game species in areas with the highest Landscape Condition Rank<br />[<i>SERI Rank 3 and LC Rank 1</i>]; or</li>" +
						"<li>Nevada's high priority wetland/riparian habitats (High Priority or Middle Priority/High Stewardship Urgency)<br />[<i>Wet/Rip Habitat Rank 2-3</i>].</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendCHAT3",
		label: "<div class='legendToolTip'>" +
					"CHAT Rank 3 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of Threatened or Endangered species in areas with good Landscape Condition Rank (mostly as good as 80% of the Wilderness Areas and National Parks in Nevada)<br />[<i>SOC Rank 1 and LC Rank 2</i>];</li>" +
						"<li>Known locations of all S1 or S2 species, S3 species with Extremely Vulnerable, Highly Vulnerable, or Moderately Vulnerable CCVI scores, or S4 species with Extremely Vulnerable or Highly Vulnerable CCVI scores in areas with good Landscape Condition Rank<br />[<i>SOC Rank 1-3 and LC Rank 2</i>];</li>" +
						"<li>Known locations of bald or golden eagle nest sites or greater sage-grouse lek sites in areas with good Landscape Condition Rank<br />[<i>SOC Rank 1 and LC Rank 2</i>];</li>" +
						"<li>Greater sage-grouse Essential/Irreplaceable and Important Habitat in areas with good Landscape Condition Rank<br />[<i>SOC Rank 2-3 and LC Rank 2</i>];</li>" +
						"<li>Modeled potential biodiversity of terrestrial Species of Concern above 60% in areas with good Landscape Condition Rank<br />[<i>SOC Rank 2-3 and LC Rank 2</i>];</li>" +
						"<li>Areas with Priority Habitat for any terrestrial game species or areas with General Habitat for at least 8 terrestrial game speces in areas with good Landscape Condition Rank<br />[<i>SERI Rank 1-3 and LC Rank 2</i>]; or</li>" +
						"<li>Nevada's middle priority wetland/riparian habitats (Middle Priority/Moderate Stewardship Urgency)<br />[<i>Wet/Rip Habitat Rank 4</i>].</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendCHAT4",
		label: "<div class='legendToolTip'>" +
					"CHAT Rank 4 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of Threatened or Endangered species in all other areas<br />[<i>SOC Rank 1 and LC Rank 6</i>];</li>" +
						"<li>Known locations of all S1 or S2 species, S3 species with Extremely Vulnerable, Highly Vulnerable, or Moderately Vulnerable CCVI scores, or S4 species with Extremely Vulnerable or Highly Vulnerable CCVI scores in all other areas<br />[<i>SOC Rank 1-3 and LC Rank 6</i>];</li>" +
						"<li>Known locations of bald or golden eagle nest sites or greater sage-grouse lek sites in all other areas<br />[<i>SOC Rank 1 and LC Rank 6</i>];</li>" +
						"<li>Greater sage-grouse Essential/Irreplaceable and Important Habitat in all other areas<br />[<i>SOC Rank 2-3 and LC Rank 6</i>];</li>" +
						"<li>Modeled potential biodiversity of terrestrial Species of Concern above 60% in all other areas<br />[<i>SOC Rank 2-3 and LC Rank 6</i>];</li>" +
						"<li>Areas with Priority Habitat for any terrestrial game species or areas with General Habitat for at least 8 terrestrial game speces in all other areas<br />[<i>SERI Rank 1-3 and LC Rank 6</i>]; or</li>" +
						"<li>Nevada's lower priority wetland/riparian habitats (Low Priority/Low Stewardship Urgency)<br />[<i>Wet/Rip Rank 5</i>].</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendCHAT5",
		label: "<div class='legendToolTip'>" +
					"CHAT Rank 5 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of S3 species with Presumed Stable or Increase Likely CCVI scores, S4 species with Moderaletly Vulnerable CCVI scores, or S5 species with Extremely Vulnerable or Highly Vulnerable CCVI scores<br />[<i>SOC Rank 4</i>];</li>" +
						"<li>Greater sage-grouse Habitat of Moderate Importance<br />[<i>SOC Rank 4</i>];</li>" +
						"<li>Modeled potential biodiversity of terrestrial Species of Concern between 40% and 60%<br />[<i>SOC Rank 4</i>];</li>" +
						"<li>Areas with General Habitat for 4 to 7 terrestrial game species<br />[<i>SERI 4</i>]; or</li>" +
						"<li>Other wetland/riparian habitats (especially spring/seep sites)<br />[<i>Wet/Rip Habitat Rank 6</i>].</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendCHAT6",
		label: "<div class='legendToolTip'>" +
					"CHAT Rank 6 indicates all other areas." +
				"</div>",
		showDelay: 0
	});
	
	//Create tooltips for SOC layer legend elements
	new Tooltip( {
		connectId: "legendHeadSOC",
		label: "<div class='legendToolTip'>" +
                    "GAP Status Code: represents a measure of management intent to permanently protect biodiversity. GAP Status 1 & 2 areas are primarily managed for biodiversity, GAP Status 3 areas are managed for multiple uses including conservation and extraction, GAP Status 4 areas identify unprotected areas or data gaps. Shows the full range of GAP Status Codes (1 through 4) for all lands and marine areas in PAD-US. <br><br>" +
                    "US Geological Survey, Gap Analysis Program (GAP). May 2016. Protected Areas Database of the United States (PADUS), version 1.4 Combined Feature Class " +
                    //"Species of Concern (SOC) represents the aggregated inforamtion describing the known location or habitat for species of conservation priority as identified by the Nevada State Wildlife Action Plan (2012). SOC include federally or state listed Threatened, Endangered, or Candidate species, as well as other species that were selected based upon their state conservation rank (S-Rank), degree of threats facing the species, Nevada's relative importance to the species overall range, the state of current knowledge of a species' life history, and the opportunity to increase the current knowledge of or implement a conservation strategy for a species. Species were also assessed based on their overall vulnerabilty to climate change using the NatureServe Climate Change Vulnerability Index (CCVI). Data representing SOC includes:" +
					//"<ul>" +
					//	"<li>Documented species occurrence locations (NDOW, NNHP, museum specimen records, and partner organizations);</li>" +
					//	"<li>Documented special use sites such as raptor nest and greater sage-grouse lek sites (NDOW);</li>" +
					//	"<li>Radio-marked greater sage-grouse locations (NDOW, USGS, university partners);</li>" +
					//	"<li>Nevada Greater Sage-Grouse Habitat Categorization Map (NDOW); and</li>" +
					//	"<li>USGS National GAP species distribution models.</li>" +
					//"</ul>" +
					//"Currently, due to data availability, SOC are limited to terrestrial and amphibian species. Although individual species information is not provided specifically, SOC ranks should be interpreted as the relative probability, or risk, that a high-priority species of concern or its habitat would be encountered in a given area based on the best available wildlife resource information. SOC ranks are <strong>non-regulatory</strong> and in no way imply any specific avoidance or mitigation measures for a given area." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSOC1",
		label: "<div class='legendToolTip'>" +
					"SOC Rank 1 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of Threatened or Endangered species;</li>" +
						"<li>Known locations of S1 species;</li>" +
						"<li>Known locations of S2 species with Extremely Vulnerable or Highly Vulnerable CCVI scores;</li>" +
						"<li>Known locations of bald or golden eagle nest sites; or</li>" +
						"<li>Known locations of greater sage-grouse lek sites (active, pending, or unknown status).</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSOC2",
		label: "<div class='legendToolTip'>" +
					"SOC Rank 2 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of S2 species with Moderately Vulnerable, Presumed Stable, or Increase Likely CCVI scores;</li>" +
						"<li>Known locations of S3 species with Extremely Vulnerable or Highly Vulnerable CCVI scores;</li>" +
						"<li>Greater Sage-Grouse Essential/Irreplaceable Habitat (Category 1); or</li>" +
						"<li>Modeled potential species distribution biodiversity above 80%.</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSOC3",
		label: "<div class='legendToolTip'>" +
					"SOC Rank 3 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of S3 species with Moderately Vulnerable CCVI scores;</li>" +
						"<li>Known locations of S4 species with Extremely Vulnerable or Highly Vulnerable CCVI scores;</li>" +
						"<li>Greater Sage-Grouse Important Habitat (Category 2); or</li>" +
						"<li>Modeled potential species distribution biodiversity from 61% to 80%.</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSOC4",
		label: "<div class='legendToolTip'>" +
					"SOC Rank 4 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of S3 species with Presumed Stable or Increase Likely CCVI scores;</li>" +
						"<li>Known locations of S4 species with Moderately Vulnerable CCVI scores;</li>" +
						"<li>Known locations of S5 species with Extremely Vulnerable or Highly Vulnerable CCVI scores;</li>" +
						"<li>Greater Sage-Grouse Habitat of Moderate Importance (Category 3); or</li>" +
						"<li>Modeled potential species distribution biodiversity from 41% to 60%.</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSOC5",
		label: "<div class='legendToolTip'>" +
					"SOC Rank 5 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of S4 species with Presumed Stable or Increase Likely CCVI scores;</li>" +
						"<li>Known locations of S5 species with Moderately Vulnerable CCVI scores;</li>" +
						"<li>Greater Sage-Grouse Low Value Habitat/Transitional Range (Category 4); or</li>" +
						"<li>Modeled potential species distribution biodiversity from 21% to 40%.</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSOC6",
		label: "<div class='legendToolTip'>" +
					"SOC Rank 6 indicates one or more of the following:" +
					"<ul>" +
						"<li>Known locations of S5 species with Presumed Stable or Increase Likely CCVI scores or</li>" +
						"<li>Modeled potential species distribution biodiversity from 0% to 20%.</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});	
	
	//Create tooltips for SERI layer legend elements
	new Tooltip( {
		connectId: "legendHeadSERI",
		label: "<div class='legendToolTip'>" +
					"Distinguishes federally managed areas from Tribal and others (states, local government, private. <br><br>" +
                    "US Geological Survey, Gap Analysis Program (GAP). May 2016. Protected Areas Database of the United States (PADUS), version 1.4 Combined Feature Class " +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSERI1",
		label: "<div class='legendToolTip'>" +
					"SERI Rank 1 indicates areas of mapped Priority distribution for three or more species." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSERI2",
		label: "<div class='legendToolTip'>" +
					"SERI Rank 2 indicates areas of mapped Priority distribution for two species." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSERI3",
		label: "<div class='legendToolTip'>" +
					"SERI Rank 3 indicates one or more of the following:" +
					"<ul>" +
						"<li>Mapped Priority distribution for one species or</li>" +
						"<li>Mapped General distribution for eight or more species.</li>" +
					"</ul>" +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSERI4",
		label: "<div class='legendToolTip'>" +
					"SERI Rank 4 indicates areas of mapped General distribution for four to seven species." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSERI5",
		label: "<div class='legendToolTip'>" +
					"SERI Rank 5 indicates areas of mapped General distribution for one to three species." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendSERI6",
		label: "<div class='legendToolTip'>" +
					"SERI Rank 6 indicates all other areas." +
				"</div>",
		showDelay: 0
	});	
	
	//Create tooltips for Wetland/Riparian Habitat layer legend elements
	new Tooltip( {
		connectId: "legendHeadWetRip",
		label: "<div class='legendToolTip'>" +
					"Important wetland/riparian habitats in Nevada were identified by the Nevada Priority Wetlands Inventory (2007) which assessed 234 distinct habitats in terms of their wildlife habitat value and their capacity to convey, store, and cleanse water; control erosion and flooding; and promote recreation opportunities. Wetland/riparian habitats were given a rating based on stewardship urgency and a priority class based on estimates of wildlife and ecological function, socioeconomic importance, and land use and disturbance intensity. The wetland/riparian habitats described by the Priority Wetlands Inventory were delineated based upon a review of data from the following sources:" +
					"<ul>" +
						"<li>USFWS National Wetlands Inventory (ver. 1.3);</li>" +
						"<li>USGS National Hydrography Dataset;</li>" +
						"<li>NNHP Nevada Vegetation Synthesis Map (SynthMap);</li>" +
						"<li>Nevada Springs Conservation Plan (2011) field validated spring sites; and</li>" +
						"<li>USGS Geographic Names Information System (GNIS) spring sites.</li>" +
					"</ul>" +
					"Data were evaluated over several iterations in order to determine which source or sources best represented a given wetland/riparian habitat described in the Priority Wetlands Inventory." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendWetRip1",
		label: "<div class='legendToolTip'>" +
					"Wet/Rip Rank 1 indicates High Priority/High Stewardship Urgency wetland/riparian habitats as identified by the Nevada Priority Wetlands Inventory." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendWetRip2",
		label: "<div class='legendToolTip'>" +
					"Wet/Rip Rank 2 indicates High Priority/Moderate Stewardship Urgency or Middle Priority/Moderate Stewardship Urgency wetland/riparian habitats as identified by the Nevada Priority Wetlands Inventory." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendWetRip3",
		label: "<div class='legendToolTip'>" +
					"Wet/Rip Rank 3 indicates High Priority/Low Stewardship Urgency wetland/riparian habitats as identified by the Nevada Priority Wetlands Inventory." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendWetRip4",
		label: "<div class='legendToolTip'>" +
					"Wet/Rip Rank 4 indicates Middle Priority/Low Stewardship Urgency wetland/riparian habitats as identified by the Nevada Priority Wetlands Inventory." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendWetRip5",
		label: "<div class='legendToolTip'>" +
					"Wet/Rip Rank 5 indicates one or more of the following:" +
					"<ul>" +
						"<li>Low Priority/High Stewardship Urgency or</li>" +
						"<li>Low Priority/Middle Stewardship Urgency</li>" +
						"<li>Low Priority/Low Stewardship Urgency</li>" +
						"<li>Middle Priority/Low Stewardship Urgency</li>" +
					"</ul>" +
					"wetland/riparian habitats as identified by the Nevada Priority Wetlands Inventory." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendWetRip6",
		label: "<div class='legendToolTip'>" +
					"Wet/Rip Rank 6 indicates other wetland/riparian habitats not identified by the Nevada Priority Wetlands Inventory, especially spring sites." +
				"</div>",
		showDelay: 0
	});	
	
	//Create tooltips for Landscape Condition layer legend elements
	new Tooltip( {
		connectId: "legendHeadLC",
		label: "<div class='legendToolTip'>" +
					"Landscape Condition is represented by the Landscape Condition Model (LCM) developed by NatureServe (2009) by evaluating stress-inducing land use classes and their assumed impact on the landscape for the entire contiguous United States. These classes included transportation, urban and industrial development, and managed and modified land covers. Each landscape stressor was given a relative site intensity score to represent the assumed level of stress induced by each land cover type on terrestrial ecological systems and habitat for native species. Stress level scores were not considered to be cumulative when multiple land covers occurred at the same location. Landscape stressors were also assigned a distance decay function to model the assumed decrease in the stress-inducing effect as the distance away from the land cover site increases. The final score for any given location was modeled to be the lowest value (i.e. highest level of stress) of all overlapping land cover types which occur at that location.<br /><br />" +
					"Following a methodology proposed by the WGA Landscape Integrity technical workgroup, a Landscape Integrity Quality Threshold (LIQT) was identified by finding the distribution of LCM scores in areas of known high ecological integrity. These areas were identified using the USGS Protected Areas Database (PAD ver. 1.3) as areas managed for biodiversity (PAD Status 1 and 2), such as wilderness areas and national parks. The LIQT was set such that 80% of the PAD Status 1 and 2 areas were represented by the LCM when capped by the LIQT. Finally, the LCM was aggregated to the standard one-square mile hexagon mapping layer provided by the WGA using the majority and maximum techniques." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendLC1",
		label: "<div class='legendToolTip'>" +
					"Landscape Condition Rank 1 indicates areas with a maximum LCM score equal to the Landscape Integrity Quality Threshold (i.e. all pixels modeled to be in at least as good condition as the PAD Status 1 and 2 areas)." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendLC2",
		label: "<div class='legendToolTip'>" +
					"Landscape Condition Rank 2 indicates areas with a majority LCM score equal to the Landscape Integrity Quality Threshold (i.e. most pixels modeled to be in at least as good condition as the PAD Status 1 and 2 areas)." +
				"</div>",
		showDelay: 0
	});

	new Tooltip( {
		connectId: "legendLC6",
		label: "<div class='legendToolTip'>" +
					"Landscape Condition Rank 6 indicates all other areas." +
				"</div>",
		showDelay: 0
	});
});