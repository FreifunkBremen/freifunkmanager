define(function(){
	return function(el,store){
		menu = document.createElement("header")
		menu.classList.add("menu")
		right = document.createElement("div")
		right.classList.add("icons")
		menu.appendChild(right)
		el.appendChild(menu)

		var buttonList = document.createElement("i")
		buttonList.innerHTML = ""
		buttonList.onclick = function () {
			window.location.href = "#list"
		}
		right.appendChild(buttonList)

		var buttonMap = document.createElement("i")
		buttonMap.innerHTML = '\uf278'
		buttonMap.onclick = function () {
			window.location.href = "#map"
		}
		right.appendChild(buttonMap)

		var buttonStatistic = document.createElement("i")
		buttonStatistic.innerHTML = ""
		buttonStatistic.onclick = function () {
			window.location.href = "#statistics"
		}
		right.appendChild(buttonStatistic)


		var buttonRefresh = document.createElement("i")
		buttonRefresh.innerHTML = ""
		var refreshtime = document.createElement("span")
		store.setTimeSinceUpdate(refreshtime)
		buttonRefresh.appendChild(refreshtime)
		buttonRefresh.onclick = function () {
			store.refresh()
		}
		right.appendChild(buttonRefresh)
	}
})
