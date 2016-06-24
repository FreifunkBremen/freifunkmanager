send('GET',"config.json").then(function(config){
	internal.config = config
	createModel()
	localStorage.removeItem("nodes")
	localStorage.removeItem("aliases")
	if(false && localStorageTest()){
		internal.nodes = JSON.parse(localStorage.getItem("nodes"))
		internal.aliases = JSON.parse(localStorage.getItem("aliases"))
		if(!internal.nodes){
			send('GET',internal.config.api+"/nodes").then(function(data){
				internal.nodes = data
				internal.lastload = new Date()
			})
		}
		if(!internal.aliases){
			send('GET',internal.config.api+"/aliases").then(function(data){
				internal.aliases = data
			})
		}
	}else{
		refreshData()
	}
	updateBange()
	setInterval(function () {
		refreshData()
	}, config.reload);
	route()
})
