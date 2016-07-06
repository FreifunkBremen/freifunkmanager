'use strict';
angular.module('config', [])
	.factory('config', function() {
		return {
			api: 'http://mgmt.ffhb.de/api',
			map: {
				view: {lat: 53.0702, lng: 8.815}
			},
			geojson: 'https://raw.githubusercontent.com/FreifunkBremen/internal-maps/master/breminale.geojson',
			refresh: 60000
		};
	});
