'use strict';
angular.module('config', [])
	.factory('config', function() {
		return {
			api: 'https://mgmt.ffhb.de/api',
			map: {
				view: {lat: 53.0702, lng: 8.815}
			},
			geojson: 'https://meshviewer.breminale.ffhb.de/data/meshviewer.geojson',
			refresh: 60000
		};
	});
