send('GET',"config.json").then(function(config){
	internal.config = config
	if(localStorageTest()){
		internal.nodes = JSON.parse(localStorage.getItem("nodes"))
		internal.aliases = JSON.parse(localStorage.getItem("aliases"))
		if(!internal.nodes){
			send('GET',internal.config.api+"/nodes").then(function(data){
				internal.nodes = data
			})
		}
		if(!internal.aliases){
			send('GET',internal.config.api+"/aliases").then(function(data){
				internal.aliases = data
			})
		}
	}
	menuAliases.setAttribute("data-badge",Object.keys(internal.aliases).length)
	menuNodes.setAttribute("data-badge",Object.keys(internal.nodes).length)
	setInterval(function () {
		refreshData()
		route()
	}, config.reload);
	route()
})
