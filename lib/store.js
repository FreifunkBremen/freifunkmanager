function get(url) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.send();
  }).then(JSON.parse);
}
function localStorageTest() {
  var test = 'test'
  try {
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch(e) {
    return false
  }
}

var internal = {
	config:{},
	nodes:{},
	aliases:{},
	tmp:{
		aliases_count: 0,
		nodes_count: 0
	}
}
//var toast = document.querySelector('#toast');
var toast = document.getElementById("toast")
var container = document.getElementById("container")
var refreshButton = document.getElementById("refresh")
var menuNodes = document.getElementById("menu_nodes")
var menuAliases = document.getElementById("menu_aliases")


function notify(key){
	toast.MaterialSnackbar.showSnackbar({
		message:"New Nodes with nodeid '"+key+"'!",
		actionHandler: function(event) {
			console.log(event)
		},
		actionText: 'Edit',
		timeout: 3000
	});
}
function update(){
	get(internal.config.api+"/aliases").then(function(data){
		internal.aliases = data
		menuAliases.setAttribute("data-badge",Object.keys(internal.aliases).length)
	})
	get(internal.config.api+"/nodes").then(function(data){
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



function routeNodes(){
	fill = '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width:100%">'
		+ '<thead>'
			+ '<tr>'
				+ '<th class="mdl-data-table__cell--non-numeric">Hostname</th>'
				+ '<th>Clients</th>'
				+ '<th>Ports</th>'
				+ '<th>2.4 Ghz</th>'
				+ '<th>5 Ghz</th>'
				+ '<th>Location</th>'
				+ '<th>SSH</th>'
			+ '</tr>'
		+ '</thead>'
		+ '<tbody>'
	Object.keys(internal.nodes).map(function(key){
		fill += '<tr>'
						+ '<td class="mdl-data-table__cell--non-numeric">'
							+ '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty">'
								+ '<input class="mdl-textfield__input" type="text" id="hostname_'+key+'" value="'+internal.nodes[key].nodeinfo.hostname+'"/>'
								+ '<label class="mdl-textfield__label" for="hostname_'+key+'">'+key+'</label>'
							+ '</div>'
						+ '</td>'
						+ '<td>'
							+ '2.4 Ghz: '+internal.nodes[key].statistics.clients.wifi24
							+ '<br/>'
							+ '5 Ghz: '+internal.nodes[key].statistics.clients.wifi5
					+ '</td>'
					+ '<td>100%</td>'
					+ '<td>'
						+ 'Ch: '+((internal.nodes[key].nodeinfo.settings !== undefined)?internal.nodes[key].nodeinfo.settings.freq24.channel:'-')
						+ '<br/>'
						+ 'Tx: '+((internal.nodes[key].nodeinfo.settings !== undefined)?internal.nodes[key].nodeinfo.settings.freq24.txpower:'-')
					+ '</td>'
					+ '<td>'
						+ 'Ch: '+((internal.nodes[key].nodeinfo.settings !== undefined)?internal.nodes[key].nodeinfo.settings.freq5.channel:'-')
						+ '<br/>'
						+ 'TX: '+((internal.nodes[key].nodeinfo.settings !== undefined)?internal.nodes[key].nodeinfo.settings.freq5.txpower:'-')
					+ '</td>'
					+ '<td class="mdl-data-table__cell--non-numeric"><i class="material-icons">location</i></td>'
					+ '<td>SSH</td>'
				+ '</tr>'
	})
	fill += '</tbody></table>'
	container.innerHTML = fill
}
function routeAliases(){
	fill = '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width:100%">'
		+ '<thead>'
			+ '<tr>'
				+ '<th class="mdl-data-table__cell--non-numeric">Hostname</th>'
				+ '<th class="mdl-data-table__cell--non-numeric">Location</th>'
				+ '<th>2.4 Ghz</th>'
				+ '<th>5 Ghz</th>'
			+ '</tr>'
		+ '</thead>'
		+ '<tbody>'
	Object.keys(internal.aliases).map(function(key){
		fill += '<tr>'
						+ '<td class="mdl-data-table__cell--non-numeric">'
							+ internal.aliases[key].hostname
							+ '<br/>'
							+ '<small>'+key+'</small>'
						+ '</td>'
						+ '<td class="mdl-data-table__cell--non-numeric"><i class="material-icons">location</i></td>'
						+ '<td>'
							+ 'Ch: '+((internal.aliases[key].freq24 !== undefined)?internal.aliases[key].freq24.channel:'-')
							+ '<br/>'
							+ 'Tx: '+((internal.aliases[key].freq24 !== undefined)?internal.aliases[key].freq24.txpower:'-')
						+ '</td>'
						+ '<td>'
							+ 'Ch: '+((internal.aliases[key].freq5 !== undefined)?internal.aliases[key].freq5.channel:'-')
							+ '<br/>'
							+ 'TX: '+((internal.aliases[key].freq5 !== undefined)?internal.aliases[key].freq5.txpower:'-')
						+ '</td>'
					+ '</tr>'
	})
	fill += '</tbody></table>'
	container.innerHTML = fill
}
function routeMap(){
	container.innerHTML = "<iframe src="+internal.config.map+"/>"
}
function routeStatistic(){
	container.innerHTML = "<iframe src="+internal.config.statistics.all+"/>"
}
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
refreshButton.addEventListener('click', update)
window.addEventListener("hashchange",route)

get("config.json").then(function(config){
	internal.config = config
	if(localStorageTest()){
		internal.nodes = JSON.parse(localStorage.getItem("nodes"))
		internal.aliases = JSON.parse(localStorage.getItem("aliases"))
		if(!internal.nodes){
			get(internal.config.api+"/nodes").then(function(data){
				internal.nodes = data
			})
		}
		if(!internal.aliases){
			get(internal.config.api+"/aliases").then(function(data){
				internal.aliases = data
			})
		}
	}
	menuAliases.setAttribute("data-badge",Object.keys(internal.aliases).length)
	menuNodes.setAttribute("data-badge",Object.keys(internal.nodes).length)
	setInterval(function () {
		update()
	}, config.reload);
	route()
})
