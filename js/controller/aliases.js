define(["tablesort", "tablesort.numeric"],function(){
	var data;
	return function(el,map){
		var title = document.createElement("h1"),
			table = document.createElement("table"),
			thead = document.createElement("thead"),
			tbody = document.createElement("tbody"),
			sort;
		title.textContent = "Undone Changes";
		table.appendChild(thead);
		table.appendChild(tbody);
		table.classList.add("table");

		thead.innerHTML = "<tr><th>Node</th><th class=\"no-sort\">Freq</th><th>Channel</th><th>Power</th><th>Location</th></tr>";

		var toChangeIcon = function(el){
			var icon = document.createElement("i");
			icon.classList.add("icon");
			icon.textContent = "\uf096";
			el.appendChild(icon);
		};

		var row = function(nodeid,alias,node){
			var icon,td,split1,split2,text,
				tr = document.createElement("tr");

			//Node
			td = document.createElement("td");
			td.classList.add("text");
			if(alias && alias.hostname && node.nodeinfo && alias.hostname != node.nodeinfo.hostname){
				toChangeIcon(td);
			}
			td.appendChild(document.createTextNode((alias && alias.hostname)?alias.hostname:node.nodeinfo.hostname));
			text = document.createElement("small");
			text.textContent = nodeid;
			td.appendChild(text);
			tr.appendChild(td);

			td = document.createElement("td");
			td.classList.add("split");
			var freq24 = document.createElement("span");
			freq24.textContent = "2.4 Ghz";
			var freq5 = document.createElement("span");
			freq5.textContent = "5 Ghz";
			td.appendChild(freq24);
			td.appendChild(freq5);
			tr.appendChild(td);

			td = document.createElement("td");
			td.classList.add("split");
			split1 = document.createElement("span");
			split2 = document.createElement("span");
			text = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.channel24)?alias.wireless.channel24:((node.nodeinfo.wireless && node.nodeinfo.wireless.channel24)?node.nodeinfo.wireless.channel24:'-'));
			if(alias && alias.wireless !== undefined && alias.wireless.channel24 &&
				node.nodeinfo.wireless && node.nodeinfo.wireless.channel24 &&
				alias.wireless.channel24 != node.nodeinfo.wireless.channel24){
				toChangeIcon(split1);
			}
			split1.appendChild(text);
			text = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.channel5)?alias.wireless.channel5:((node.nodeinfo.wireless && node.nodeinfo.wireless.channel5)?node.nodeinfo.wireless.channel5:'-'));
			if(alias && alias.wireless !== undefined && alias.wireless.channel5 &&
				node.nodeinfo.wireless && node.nodeinfo.wireless.channel5 &&
				alias.wireless.channel5 != node.nodeinfo.wireless.channel5){
				toChangeIcon(split2);
			}
			split2.appendChild(text);
			td.appendChild(split1);
			td.appendChild(split2);
			tr.appendChild(td);

			td = document.createElement("td");
			td.classList.add("split");
			split1 = document.createElement("span");
			split2 = document.createElement("span");

			text = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.txpower24)?alias.wireless.txpower24:((node.nodeinfo.wireless && node.nodeinfo.wireless.txpower24)?node.nodeinfo.wireless.txpower24:'-'));
			if(alias && alias.wireless !== undefined && alias.wireless.txpower24 &&
				node.nodeinfo.wireless && node.nodeinfo.wireless.txpower24 &&
				alias.wireless.txpower24 != node.nodeinfo.wireless.txpower24){
				toChangeIcon(split1);
			}
			split1.appendChild(text);
			text = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.txpower5)?alias.wireless.txpower5:((node.nodeinfo.wireless && node.nodeinfo.wireless.txpower5)?node.nodeinfo.wireless.txpower5:'-'));
			if(alias && alias.wireless !== undefined && alias.wireless.txpower5 &&
				node.nodeinfo.wireless && node.nodeinfo.wireless.txpower5 &&
				alias.wireless.txpower5 != node.nodeinfo.wireless.txpower5){
				toChangeIcon(split2);
			}
			split2.appendChild(text);
			td.appendChild(split1);
			td.appendChild(split2);
			tr.appendChild(td);

			//Location
			td = document.createElement("td");
			if(alias.location !== undefined &&
				((node.nodeinfo.location !== undefined &&
				node.nodeinfo.location.latitude != alias.location.latitude &&
				node.nodeinfo.location.longitude != alias.location.longitude) || node.nodeinfo.location === undefined)
			){
				toChangeIcon(td);
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
			if(sort === undefined)
				sort = new Tablesort(table);
			sort.refresh();
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
