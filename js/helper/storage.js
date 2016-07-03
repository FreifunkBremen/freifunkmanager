define(["helper/lib","moment"],function(lib,moment){
	return function(config){
		var data = {nodes:{},aliases:{},geojson:{}};
		var notifies = [], notifiesNew = [];

		if(localStorageTest()){
			data.nodes = JSON.parse(localStorage.getItem("nodes"));
			if(!data.nodes)
				data.nodes = {};
			data.aliases = JSON.parse(localStorage.getItem("aliases"));
			if(!data.aliases)
				data.aliases = {};
		}

		var notify =  function(){
			for(var i=0; i<notifies.length;i++)
				notifies[i].storageNotify(data);
		};
		var notifyNew = function(key,data){
			for(var i=0; i<notifiesNew.length;i++)
				notifiesNew[i].storageNotifyNew(key,data);
		};

		var refresh = function(){
			if(config.map.geojson)
				send('GET',config.map.geojson).then(function(d){
						data.geojson = d;
						notify();
				});
			send('GET',config.api+"/aliases").then(function(d){
				data.aliases = d;
				localStorage.setItem("aliases",JSON.stringify(data.aliases));
				notify();
			});
			send('GET',config.api+"/nodes").then(function(d){
				Object.keys(d).map(function(key){
					if(data.nodes === undefined || data.nodes[key] === undefined){
						notifyNew(key,d[key]);
					}
					data.nodes[key] = d[key];
				});
				data.lastload = new Date();
				localStorage.setItem("nodes",JSON.stringify(data.nodes));
				notify();
			});
		};

		return {
			setTimeSinceUpdate:function(str){
				var interval;
				clearInterval(interval);
				interval = setInterval(function(){
					str.innerHTML = moment().diff(data.lastload,"seconds")+" sec";
				}, 100);
			},
			addNotify: function(handler){
				notifies.push(handler);
			},
			addNotifyNew: function(handler){
				notifiesNew.push(handler);
			},
			autorefresh: function(timer){
				var interval;
				clearInterval(interval);
				interval = setInterval(function(){
					refresh();
				}, timer);
			},
			refresh: refresh
		};
	};
});