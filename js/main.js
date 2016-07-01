define(["helper/router","helper/storage","menu","controller/nodes","controller/map","controller/frame"],
function (Router, storage, menu, controllerNodes, controllerMap, controllerFrame) {
	return function(config){
		var store = storage(config);
		store.refresh();
		store.autorefresh(config.reload);

		document.title = "eventmanager";


		menu(document.body,store);
		el = document.createElement("div");
		el.classList.add("content");
		document.body.appendChild(el);


		var map = controllerMap(el,config);
		store.addNotify(map);

		var nodes = controllerNodes(el,config);
		store.addNotify(nodes);

		Router.config({
			mode: 'hash'
		})
		.add(/grafana/, controllerFrame(el,config.grafana.all))
		.add(/meshviewer/, controllerFrame(el,config.meshviewer))
		.add(/list/, nodes.controller)
		.add(/map\/(.*)/, map.controller)
		.add(/map/, map.controller)
		.add(nodes.controller)
		.check().listen();
	};
});
