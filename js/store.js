var internal = {
	config:{},
	nodes:{},
	aliases:{}
}
//var toast = document.querySelector('#toast');
var container = document.getElementById("container")
var menuNodes = document.getElementById("menu_nodes")
var menuAliases = document.getElementById("menu_aliases")


function refreshData(){
	send('GET',internal.config.api+"/aliases").then(function(data){
		internal.aliases = data
		menuAliases.setAttribute("data-badge",Object.keys(internal.aliases).length)
	})
	send('GET',internal.config.api+"/nodes").then(function(data){
		Object.keys(data).map(function(key){
			if(typeof internal.nodes[key]=='undefined'){
				notify(key)
			}
			internal.nodes[key] = data[key]
		})
		menuNodes.setAttribute("data-badge",Object.keys(internal.nodes).length)
	})
	localStorage.setItem("nodes",JSON.stringify(internal.nodes))
	localStorage.setItem("aliases",JSON.stringify(internal.aliases))
}
