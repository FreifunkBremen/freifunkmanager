define(['leaflet','controller/sidebar','leaflet.label'],function(L,Sidebar){
	var data,currentNode;
	return function(el,config){
		var mapEl = document.createElement("div");
		mapEl.classList.add("map");

		var sideBarEl = document.createElement("div");
		var bar = Sidebar(sideBarEl,config);

		var map = L.map(mapEl,{zoomControl:false}).setView([51.505, -0.09], 13);
		var layergeojson,layernodes;



		L.tileLayer(
			config.map.tiles.url,
			config.map.tiles.option).addTo(map);
		map.setView(config.map.view,config.map.zoom);

		var geoJsonOption = {
			pointToLayer: function (feature, latlng){
				feature.properties.radius = 10;
				return L.circleMarker(latlng, feature.properties);
			},
			onEachFeature: function(feature, layer) {
				if(feature.properties.name.length >0)
					layer.bindLabel(feature.properties.name);
			},
			style: function(feature){
				if(feature.geometry.type === "LineString" || feature.geometry.type === "Polygon")
					return {color: feature.properties.stroke,
						opacity:feature.properties["stroke-opacity"],
						fillColor: feature.properties.fill,
						fillOpacity:feature.properties["fill-opacity"],
						stroke: true,
						weight: feature.properties["stroke-width"],
						lineCap: "round",
						lineJoin: "round"};
				return {
					color: feature.properties["marker-color"],
					fillColor: feature.properties["marker-color"],
					fillOpacity: 0.2,
					weight: 2,
					stroke: true
				};
			}
		};

		nodeIcon = L.divIcon({className: "nodeicon"});


		render = function(){
			if(layernodes)
				layernodes.clearLayers();
			if(layergeojson)
				layergeojson.clearLayers();
			if(data.geojson && Object.keys(data.geojson).length > 0){
				layergeojson = L.geoJson(data.geojson,geoJsonOption).addTo(map);
				map._onResize();
			}

			var nodes = Object.keys(data.nodes).filter(function(key){
				return data.nodes[key].nodeinfo && data.nodes[key].nodeinfo.location;
			}).map(function(key){
				var node = data.nodes[key];
				var alias = data.aliases[key];
				if(alias && alias.location)
					pos = [alias.location.latitude,alias.location.longitude];
				else
					pos = [node.nodeinfo.location.latitude,node.nodeinfo.location.longitude];

				var m = L.marker(pos,{
					icon: nodeIcon
				});

				var className = "nodeicon";
				if(node.flags && !node.flags.online)
					className += " offline";
				var wifi24="-",wifi5="-",ch24="-",ch5="-",tx24="-",tx5="-";
				if(node.statistics && node.statistics.clients){
					wifi24 = node.statistics.clients.wifi24;
					if(wifi24 < config.map.icon.warn.wifi24 && wifi24 > 0)
						className += " client24";
					else if(wifi24 < config.map.icon.crit.wifi24 && wifi24 >= config.map.icon.warn.wifi24)
						className += ' client24-warn';
					else if(wifi24 >= config.map.icon.crit.wifi24)
						className += ' client24-crit';

					wifi5 = node.statistics.clients.wifi5;
					if(config.map.icon.warn.wifi5 < 20 && wifi5 > 0)
						className += ' client5';
					else if(wifi5 < config.map.icon.crit.wifi5 && wifi5 >= config.map.icon.warn.wifi5)
						className += ' client5-warn';
					else if(wifi5 >= config.map.icon.crit.wifi5)
						className += ' client5-crit';
				}
				if(node.nodeinfo.wireless){
					ch24 = (alias && alias.wireless && alias.wireless.channel24)?alias.wireless.channel24:((node.nodeinfo.wireless.channel24)?node.nodeinfo.wireless.channel24:'-');
					ch5 = (alias && alias.wireless && alias.wireless.channel5)?alias.wireless.channel5:((node.nodeinfo.wireless.channel5)?node.nodeinfo.wireless.channel5:'-');
					tx24 = (alias && alias.wireless && alias.wireless.txpower24)?alias.wireless.txpower24:((node.nodeinfo.wireless.txpower24)?node.nodeinfo.wireless.txpower24:'-');
					tx5 = (alias && alias.wireless && alias.wireless.txpower5)?alias.wireless.txpower5:((node.nodeinfo.wireless.txpower5)?node.nodeinfo.wireless.txpower5:'-');
				}
				m.bindLabel(((alias && alias.hostname)?alias.hostname:node.nodeinfo.hostname)+" <div class=\"nodeicon-label\">("+key+")"+
					"<table><tr><th></th><th>Cl</th><th>Ch</th><th>Tx</th></tr>"+
					"<tr><td>2.4G</td><td>"+wifi24+"</td><td>"+ch24+"</td><td>"+tx24+"</td></tr>"+
					"<tr><td>5G</td><td>"+wifi5+"</td><td>"+ch5+"</td><td>"+tx5+"</td></tr>"+
					"</table>"+
					"</div>"
				);
				if(currentNode && currentNode == key){
					className += ' select';
					map.setView(m.getLatLng(),config.map.zoom);
					m.options.draggable = true;
					bar.setSelected(key,m,function(){
						m.dragging.disable();
						m._icon.classList.remove("select");
					});
				}
				m.setIcon(L.divIcon({className: className}));
				m.on("click", function(){
					window.location.href = "#map/"+key;
					currentNode = key;
					render();
				});
				return m;
			});
			layernodes = L.featureGroup(nodes).addTo(map);
		};

		return {
			storageNotify: function(d){
				data = d;
				bar.storageNotify(d);
				render();
			},
			controller: function(){
				currentNode = arguments[0];
				el.innerHTML = "";
				el.appendChild(sideBarEl);
				el.appendChild(mapEl);
			}
		};
	};
});
