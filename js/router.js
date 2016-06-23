function route(){
	if (location.hash === "#aliases") {
		routeAliases()
	}else if (location.hash === "#map") {
		routeMap()
	}else if (location.hash === "#statistics") {
		routeStatistic()
	}else{
		routeNodes()
	}
}




window.addEventListener("hashchange",route)
