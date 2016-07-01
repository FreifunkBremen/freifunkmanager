define(['leaflet','leaflet.label','controller/sidebar'],function(leaflet,leaflet_label,Sidebar){
	var data,currentNode
	return function(el,config){
		var mapEl = document.createElement("div")
		mapEl.classList.add("map")

		var sideBarEl = document.createElement("div")
		var bar = Sidebar(sideBarEl,config)

		var map = leaflet.map(mapEl,{zoomControl:false}).setView([51.505, -0.09], 13)
		var layergeojson,layernodes



		leaflet.tileLayer(
			config.editmap.tiles.url,
			config.editmap.tiles.option).addTo(map)
		map.setView(config.editmap.view,config.editmap.zoom)

		var geoJsonOption = {
				pointToLayer: function (feature, latlng){
				feature.properties.radius = 10
				return leaflet.circleMarker(latlng, feature.properties)
			},
			onEachFeature: function(feature, layer) {
				layer.bindLabel(feature.properties.name)
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
						lineJoin: "round"}
				return {
					color: feature.properties["marker-color"],
					fillColor: feature.properties["marker-color"],
					fillOpacity: 0.2,
					weight: 2,
					stroke: true
				}
			}
		}

		nodeIcon = leaflet.divIcon({className: 'nodeicon'})


		render = function(){
			console.log("render")
			if(layernodes)
				layernodes.clearLayers()
			if(layergeojson)
				layergeojson.clearLayers()
			if(data.geojson !== undefined){
				layergeojson = leaflet.geoJson(data.geojson,geoJsonOption).addTo(map)
				map._onResize()
			}

			var nodes = Object.keys(data.nodes).filter(function(key){
				return data.nodes[key].nodeinfo !== undefined && data.nodes[key].nodeinfo.location !== undefined
			}).map(function(key){
				node = data.nodes[key]
				var m = leaflet.marker([node.nodeinfo.location.latitude,node.nodeinfo.location.longitude],{
					draggable: true,
					icon: nodeIcon
				})

				var className = 'nodeicon'
				if(node.flags !== undefined && !node.flags.online)
					className += ' offline'
				var wifi24="-",wifi5="-",ch24="-",ch5="-",tx24="-",tx5="-"
				if(node.statistics !== undefined && node.statistics.clients !== undefined){
					wifi24 = node.statistics.clients.wifi24
					if(wifi24 < config.editmap.icon.warn.wifi24 && wifi24 > 0)
						className += ' client24'
					else if(wifi24 < config.editmap.icon.crit.wifi24 && wifi24 >= config.editmap.icon.warn.wifi24)
						className += ' client24-warn'
					else if(wifi24 >= config.editmap.icon.crit.wifi24)
						className += ' client24-crit'

					wifi5 = node.statistics.clients.wifi5
					if(config.editmap.icon.warn.wifi5 < 20 && wifi5 > 0)
						className += ' client5'
					else if(wifi5 < config.editmap.icon.crit.wifi5 && wifi5 >= config.editmap.icon.warn.wifi5)
						className += ' client5-warn'
					else if(wifi5 >= config.editmap.icon.crit.wifi5)
						className += ' client5-crit'
				}
				if(node.nodeinfo.wireless !== undefined){
					ch24 = (node.nodeinfo.wireless.channel24)?node.nodeinfo.wireless.channel24:'-'
					ch5 = (node.nodeinfo.wireless.channel5)?node.nodeinfo.wireless.channel5:'-'
					tx24 = (node.nodeinfo.wireless.txpower24)?node.nodeinfo.wireless.txpower24:'-'
					tx5 = (node.nodeinfo.wireless.txpower5)?node.nodeinfo.wireless.txpower5:'-'
				}

				m.bindLabel(node.nodeinfo.hostname+" <div class=\"nodeicon-label\">("+key+")"+
					"<table><tr><td></td><td>Cl</td><td>Ch</td><td>Tx</td></tr>"+
					"<tr><td>2.4 Ghz</td><td>"+wifi24+"</td><td>"+ch24+"</td><td>"+tx24+"</td></tr>"+
					"<tr><td>5 Ghz</td><td>"+wifi5+"</td><td>"+ch5+"</td><td>"+tx5+"</td></tr>"+
					"</table>"+
					"</div>"
				)
				if(currentNode && currentNode == key){
					className += ' select'
					map.setView(m.getLatLng(),config.editmap.zoom)
					bar.setSelected(key)
				}
				m.setIcon(leaflet.divIcon({className: className}))
				m.on("click", function(){
					window.location.href = "#map/"+key
					currentNode = key
					render()
				})
				return m
			})
			layernodes = leaflet.featureGroup(nodes).addTo(map)
		}

		return {
			storageNotify: function(d){
				data = d
				bar.storageNotify(d)
				render()
			},
			controller: function(){
				currentNode = arguments[0]
				el.innerHTML = ""
				el.appendChild(sideBarEl)
				el.appendChild(mapEl)
			}
		}
	}
})
