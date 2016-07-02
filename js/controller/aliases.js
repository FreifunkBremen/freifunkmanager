define(function(){
	var data;
	return function(el,map){
		var title = document.createElement("h1"),
			table = document.createElement("table"),
			thead = document.createElement("thead"),
			tbody = document.createElement("tbody");
		title.textContent = "Undone Changes";
		table.appendChild(thead);
		table.appendChild(tbody);
		table.classList.add("table");

		thead.innerHTML = "<tr><th>Node</th><th>Freq</th><th>Channel</th><th>Power</th><th>Location</th></tr>";

		var row = function(nodeid,alias,node){
			var icon,td,
				tr = document.createElement("tr");

			//Node
			td = document.createElement("td");
			td.classList.add("text");
			if(alias.hostname && alias.hostname != node.nodeinfo.hostname){
				icon = document.createElement("i");
				icon.classList.add("icon");
				icon.textContent = "\uf096";
				td.appendChild(icon);
			}
			td.appendChild(document.createTextNode((alias.hostname)?alias.hostname:node.nodeinfo.hostname));
			var textNodeID = document.createElement("small");
			textNodeID.textContent = nodeid;
			td.appendChild(textNodeID);
			tr.appendChild(td);

			td = document.createElement("td");
			td.classList.add("split");
			var freq24 = document.createTextNode("2.4 Ghz");
			var freq5 = document.createTextNode("5 Ghz");
			td.appendChild(freq24);
			td.appendChild(freq5);
			tr.appendChild(td);

			td = document.createElement("td");
			td.classList.add("split");
			var ch24 = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.channel24)?alias.wireless.channel24:((node.nodeinfo.wireless && node.nodeinfo.wireless.channel24)?node.nodeinfo.wireless.channel24:'-'));
			var ch5 = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.channel5)?alias.wireless.channel5:((node.nodeinfo.wireless && node.nodeinfo.wireless.channel5)?node.nodeinfo.wireless.channel5:'-'));
			td.appendChild(ch24);
			td.appendChild(ch5);
			tr.appendChild(td);

			td = document.createElement("td");
			tr.appendChild(td);

			//Location
			td = document.createElement("td");
			if(alias.location !== undefined &&
				node.nodeinfo.location !== undefined &&
				node.nodeinfo.location.latitude != alias.location.latitude &&
				node.nodeinfo.location.longitude != alias.location.longitude
			){
				td.classList.add("text");
				icon = document.createElement("i");
				icon.classList.add("icon");
				icon.textContent = "\uf096";
				td.appendChild(icon);
			}
			td.classList.add("text");
			icon = document.createElement("i");
			icon.classList.add("icon");
			icon.textContent = "\uf124";
			icon.onclick = function () {
				window.location.href = "#map/"+nodeid;
				map.render(nodeid);
			};
			td.appendChild(icon);
			tr.appendChild(td);


			tbody.appendChild(tr);
		};

		var render = function() {
			tbody.textContent = "";
			if(data !== undefined)
				Object.keys(data.aliases).map(function(key){
					row(key,data.aliases[key],data.nodes[key]);
				});
		};
		return {
			storageNotify: function(d){
				data = d;
				render();
			},
			controller: function(){
				el.textContent = "";
				el.appendChild(title);
				el.appendChild(table);
				render();
			}
		};
	};
});
