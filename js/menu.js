define(function(){
	return function(el,store){
		menu = document.createElement("header");
		menu.classList.add("menu");
		right = document.createElement("div");
		right.classList.add("icons");
		menu.appendChild(right);
		el.appendChild(menu);

		var buttonNodes = document.createElement("i");
		buttonNodes.textContent = "";
		buttonNodes.onclick = function () {
			window.location.href = "#nodes";
		};
		right.appendChild(buttonNodes);

		var buttonMap = document.createElement("i");
		buttonMap.textContent = '\uf278';
		buttonMap.onclick = function () {
			window.location.href = "#map";
		};
		right.appendChild(buttonMap);

		var buttonAliases = document.createElement("i");
		buttonAliases.textContent = "\uf0ec";
		buttonAliases.onclick = function () {
			window.location.href = "#aliases";
		};
		right.appendChild(buttonAliases);

		var buttonStatistic = document.createElement("i");
		buttonStatistic.classList.add("mini");
		buttonStatistic.textContent = "";
		buttonStatistic.onclick = function () {
			window.location.href = "#grafana";
		};
		right.appendChild(buttonStatistic);

		var buttonMeshviewer = document.createElement("i");
		buttonMeshviewer.classList.add("mini");
		buttonMeshviewer.textContent = '\uf279';
		buttonMeshviewer.onclick = function () {
			window.location.href = "#meshviewer";
		};
		right.appendChild(buttonMeshviewer);


		var buttonRefresh = document.createElement("i");
		buttonRefresh.textContent = "";
		var refreshtime = document.createElement("span");
		store.setTimeSinceUpdate(refreshtime);
		buttonRefresh.appendChild(refreshtime);
		buttonRefresh.onclick = function () {
			store.refresh();
		};
		right.appendChild(buttonRefresh);
	};
});
