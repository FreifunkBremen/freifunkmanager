var dialogEditNode = document.getElementById("dialog-editNode")
dialogEditNodeClose = document.querySelector('#dialog-editNode .close')
dialogEditNodeSave = document.querySelector('#dialog-editNode .save')
dialogEditNodeTitle = document.querySelector('#dialog-editNode .mdl-dialog__title')
dialogEditNodeContent = document.querySelector('#dialog-editNode .mdl-dialog__content')

dialogEditNodeMap = L.map('dialog-editNode-map').setView([51.505, -0.09], 13);
var dialogEditNodeMapCurrent

function createModel(){
	if (! dialogEditNode.showModal) {
		dialogPolyfill.registerDialog(dialogEditNode);
	}

	//MAP Part
	dialogEditNodeMap.setView(internal.config.editmap.view,internal.config.editmap.zoom)
	L.tileLayer(internal.config.editmap.tiles.url,internal.config.editmap.tiles.option).addTo(dialogEditNodeMap)
	send('GET',internal.config.editmap.geojson).then(function(data){
		L.geoJson(data,{
			pointToLayer: function (feature, latlng){
				feature.properties.radius = 10
				m = L.circleMarker(latlng,feature.properties)
				return m
			},
			onEachFeature:function(feature, layer) {
				layer.bindLabel(feature.properties.name)
			},
			style:function(feature){
				if(feature.geometry.type=='LineString')
					return {color:feature.properties["stroke"],
						stroke:true,
						weight: 5,
						lineCap:'round',
						lineJoin:'round'}
				return {
					color:feature.properties["marker-color"],
					fillColor:feature.properties["marker-color"],
					fillOpacity: 0.2,
					weight: 2,
					stroke: true
				}
			}
		}).addTo(dialogEditNodeMap)
	})
	dialogEditNodeMapCurrent = L.marker(internal.config.editmap.view,{
		draggable: true
	}).addTo(dialogEditNodeMap)




	dialogEditNodeClose.addEventListener('click',function(){
		dialogEditNode.close()
	})
	dialogEditNodeSave.addEventListener('click',function(e){
		nodeid = dialogEditNodeContent.querySelector('input[name="nodeid"]').value
		if(internal.aliases[nodeid] == undefined){
			internal.aliases[nodeid] = {}
		}
		if(internal.aliases[nodeid].location == undefined){
			internal.aliases[nodeid].location = {}
		}
		pos = dialogEditNodeMapCurrent.getLatLng()
		internal.aliases[nodeid].location.latitude = pos[0]
		internal.aliases[nodeid].location.longitude = pos[1]
		internal.aliases[nodeid].hostname = dialogEditNodeContent.querySelector('input[name="hostname"]').value
		console.log("save",internal.aliases[nodeid],dialogEditNodeMapCurrent.getLatLng())
		send('POST',internal.config.api+'/aliases/alias/'+nodeid,internal.aliases[nodeid]).then(function(){
			dialogEditNode.close()
		})
	})
}

function editModel(key){
	dialogEditNodeTitle.innerHTML = 'Edit Node: '+key
	fill = '<input type="hidden" name="nodeid" value="'+key+'"/>'
					+ '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty">'
						+ '<input class="mdl-textfield__input" type="text" name="hostname" value="'+internal.nodes[key].nodeinfo.hostname+'"/>'
						+ '<label class="mdl-textfield__label" for="hostname">Hostname</label>'
					+'</div>'
	dialogEditNodeContent.innerHTML = fill
	if(internal.nodes[key].nodeinfo.location != undefined){
		pos = [internal.nodes[key].nodeinfo.location.latitude, internal.nodes[key].nodeinfo.location.longitude]
		dialogEditNodeMapCurrent.setLatLng(pos)
		dialogEditNodeMap.setView(pos)
	}else{
		dialogEditNodeMapCurrent.setLatLng(internal.config.editmap.view)
		dialogEditNodeMap.setView(internal.config.editmap.view)
	}
	dialogEditNodeMapCurrent.bindLabel("Move Node: "+key)

	dialogEditNode.showModal()
	//WOrkaround
	dialogEditNodeMap._onResize()
}
