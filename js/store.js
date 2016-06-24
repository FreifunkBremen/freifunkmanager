var internal = {
	config:{},
	nodes:{},
	aliases:{},
	lastload:0
}
//var toast = document.querySelector('#toast');
var container = document.getElementById("container")
var menuNodes = document.getElementById("menu_nodes")
var menuAliases = document.getElementById("menu_aliases")



function updateBange(){
	if(internal.nodes && Object.keys(internal.nodes))
			menuNodes.setAttribute("data-badge",Object.keys(internal.nodes).length)
	if(internal.aliases && Object.keys(internal.aliases))
			menuAliases.setAttribute("data-badge",Object.keys(internal.aliases).length)
}

function refreshData(){
	console.log("load new files")
	send('GET',internal.config.api+"/aliases").then(function(data){
		internal.aliases = data
		updateBange()
		localStorage.setItem("aliases",JSON.stringify(internal.aliases))
	})
	return send('GET',internal.config.api+"/nodes").then(function(data){
		Object.keys(data).map(function(key){
			if(internal.nodes[key]== undefined){
				notify(key,data[key])
			}
			internal.nodes[key] = data[key]
		})
		updateBange()
		internal.lastload = new Date()
		localStorage.setItem("nodes",JSON.stringify(internal.nodes))
		route()
	})
}
