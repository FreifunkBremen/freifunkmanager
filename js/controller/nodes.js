define(["moment","tablesort", "tablesort.numeric"],function(moment){
	var data;
	return function(el,config,popup,map){
		var changeEvent = function(nodeid,attr,attr2){
			return function (e){
				var input = e.which || e.keyCode;
				if (input === 13){  // 13 is enter
					if(e.target.validity.valid) {
						var value = e.target.value || e.srcElement.value || '';
						if(data.aliases[nodeid] === undefined){
							data.aliases[nodeid] = {};
						}
						if(attr2 === undefined|| attr2 === null){
							data.aliases[nodeid][attr] = value;
						}else{
							if(data.aliases[nodeid][attr] === undefined){
								data.aliases[nodeid][attr] = {};
							}
							if(attr == "wireless")
								value = parseInt(value);
							data.aliases[nodeid][attr][attr2] = value;
						}
						send('POST',config.api+'/aliases/alias/'+nodeid,data.aliases[nodeid]).then(function(){
							popup.saved(nodeid);
							render();
						});
					}else{
							console.log("invalid value");
					}
				}
			};
		};
		var title = document.createElement("h1"),
			table = document.createElement("table"),
			thead = document.createElement("thead"),
			tbody = document.createElement("tbody"),
			sort, input;
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
			var icon,td,split1,split2,text,input,
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
			input = document.createElement("input");
			input.pattern = pattern="[A-Za-z0-9-_]{3,32}";
			input.value = (alias && alias.hostname)?alias.hostname:node.nodeinfo.hostname;
			input.addEventListener('keypress', changeEvent(nodeid,'hostname'));
			td.appendChild(input);
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
			input = document.createElement("input");
			input.type = 'number';
			input.min = '1';
			input.max = '13';
			input.value = (alias && alias.wireless !== undefined && alias.wireless.channel24)?alias.wireless.channel24:((node.nodeinfo.wireless && node.nodeinfo.wireless.channel24)?node.nodeinfo.wireless.channel24:'');
			input.addEventListener('keypress', changeEvent(nodeid,'wireless','channel24'));
			split1.appendChild(input);
			input = document.createElement("input");
			input.type = 'number';
			input.min = '36';
			input.max = '160';
			input.value = (alias && alias.wireless !== undefined && alias.wireless.channel5)?alias.wireless.channel5:((node.nodeinfo.wireless && node.nodeinfo.wireless.channel5)?node.nodeinfo.wireless.channel5:'');
			input.addEventListener('keypress', changeEvent(nodeid,'wireless','channel5'));
			split2.appendChild(input);
			td.appendChild(split1);
			td.appendChild(split2);
			tr.appendChild(td);

			td = document.createElement("td");
			td.classList.add("split");
			split1 = document.createElement("span");
			split2 = document.createElement("span");
			input = document.createElement("input");
			input.type = 'number';
			input.min = '0';
			input.value = (alias && alias.wireless !== undefined && alias.wireless.txpower24)?alias.wireless.txpower24:((node.nodeinfo.wireless && node.nodeinfo.wireless.txpower24)?node.nodeinfo.wireless.txpower24:'');
			input.addEventListener('keypress', changeEvent(nodeid,'wireless','txpower24'));
			split1.appendChild(input);
			input = document.createElement("input");
			input.type = 'number';
			input.min = '0';
			input.value = (alias && alias.wireless !== undefined && alias.wireless.txpower5)?alias.wireless.txpower5:((node.nodeinfo.wireless && node.nodeinfo.wireless.txpower5)?node.nodeinfo.wireless.txpower5:'');
			input.addEventListener('keypress', changeEvent(nodeid,'wireless','txpower5'));
			split2.appendChild(input);
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
			if(alias && (alias.hostname || alias.wireless)){
				icon = document.createElement("i");
				icon.classList.add("icon");
				icon.textContent = "\uf096";
				td.appendChild(icon);
			}
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
