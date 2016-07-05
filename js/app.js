require.config({
	baseUrl: "js",
	paths: {
		"leaflet": "../bower_components/leaflet/dist/leaflet",
		"leaflet.label": "../bower_components/Leaflet.label/dist/leaflet.label",
		"moment": "../bower_components/moment/min/moment-with-locales.min",
		"tablesort": "../bower_components/tablesort/tablesort.min",
		"tablesort.numeric": "../bower_components/tablesort/src/sorts/tablesort.numeric"
	},
	shim: {
		"leaflet.label": ["leaflet"],
		"tablesort": {
			exports: "Tablesort"
		},
		"tablesort.numeric": ["tablesort"],
	}
});
require(["main", "helper/lib"], function (main) {
	send("GET","config.json").then(main);
});
