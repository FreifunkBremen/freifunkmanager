define(["moment","tablesort", "tablesort.numeric"],function(moment){
	var data;
	return function(el,map){
		var title = document.createElement("h1"),
			table = document.createElement("table"),
			thead = document.createElement("thead"),
			tbody = document.createElement("tbody"),
			sort;
		title.textContent = "Nodes";
		table.appendChild(thead);
		table.appendChild(tbody);
		table.classList.add("table");

		thead.innerHTML = "<tr><th>Last</th><th>Node</th><th>First</th><th class=\"no-sort\">Freq</th><th>Clients</th><th>Channel</th><th>Power</th><th>Location</th></tr>";

		var toChangeIcon = function(el){
			var icon = document.createElement("i");
			icon.classList.add("icon");
			icon.textContent = "\uf096";
			el.appendChild(icon);
		};

		var row = function(nodeid,node,alias){
			var icon,td,split1,split2,text,
				tr = document.createElement("tr");

			td = document.createElement("td");
			td.classList.add("text");
			icon = document.createElement("i");
			icon.classList.add("icon");
			icon.classList.add((node.flags && node.flags.online)?"online":"offline");
			icon.textContent = "\uf111";
			td.appendChild(icon);
			text = document.createElement("small");
			text.textContent = moment(node.lastseen).fromNow(true);
			td.setAttribute("data-sort",node.lastseen);
			td.appendChild(text);
			tr.appendChild(td);

			//Node
			td = document.createElement("td");
			td.classList.add("text");
			td.appendChild(document.createTextNode((alias && alias.hostname)?alias.hostname:node.nodeinfo.hostname));
			text = document.createElement("small");
			text.textContent = nodeid;
			td.appendChild(text);
			tr.appendChild(td);

			td = document.createElement("td");
			td.classList.add("text");
			text = document.createElement("small");
			text.textContent = moment(node.firstseen).fromNow(true);
			td.setAttribute("data-sort",node.firstseen);
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
			var wifi24 =(node.statistics && node.statistics.clients.wifi24)?node.statistics.clients.wifi24:0;
			split1.textContent = wifi24;

			split2 = document.createElement("span");
			var wifi5 = (node.statistics && node.statistics.clients.wifi5)?node.statistics.clients.wifi5:0;
			split2.textContent = wifi5;

			td.setAttribute("data-sort",wifi24+wifi5);
			td.appendChild(split1);
			td.appendChild(split2);
			tr.appendChild(td);

			td = document.createElement("td");
			td.classList.add("split");
			split1 = document.createElement("span");
			split2 = document.createElement("span");
			text = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.channel24)?alias.wireless.channel24:((node.nodeinfo.wireless && node.nodeinfo.wireless.channel24)?node.nodeinfo.wireless.channel24:'-'));
			split1.appendChild(text);
			text = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.channel5)?alias.wireless.channel5:((node.nodeinfo.wireless && node.nodeinfo.wireless.channel5)?node.nodeinfo.wireless.channel5:'-'));
			split2.appendChild(text);
			td.appendChild(split1);
			td.appendChild(split2);
			tr.appendChild(td);

			td = document.createElement("td");
			td.classList.add("split");
			split1 = document.createElement("span");
			split2 = document.createElement("span");
			text = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.txpower24)?alias.wireless.txpower24:((node.nodeinfo.wireless && node.nodeinfo.wireless.txpower24)?node.nodeinfo.wireless.txpower24:'-'));
			split1.appendChild(text);
			text = document.createTextNode((alias && alias.wireless !== undefined && alias.wireless.txpower5)?alias.wireless.txpower5:((node.nodeinfo.wireless && node.nodeinfo.wireless.txpower5)?node.nodeinfo.wireless.txpower5:'-'));
			split2.appendChild(text);
			td.appendChild(split1);
			td.appendChild(split2);
			tr.appendChild(td);

			//Location
			td = document.createElement("td");
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
				Object.keys(data.nodes).map(function(key){
					row(key,data.nodes[key],data.aliases[key]);
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
