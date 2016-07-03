define(["helper/router","helper/storage","menu","popup","controller/nodes","controller/aliases","controller/map","controller/frame"],
function (Router, storage, menu, popup, controllerNodes, controllerAliases, controllerMap, controllerFrame) {
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

		var aliases = controllerAliases(el,map);
		store.addNotify(aliases);

		var popupInstance = popup(document.body,map);
		store.addNotifyNew(popupInstance);

		var nodes = controllerNodes(el,map);
		store.addNotify(nodes);

		Router.config({
			mode: 'hash'
		})
		.add(/grafana/, controllerFrame(el,config.grafana.all))
		.add(/meshviewer/, controllerFrame(el,config.meshviewer))
		.add(/aliases/, aliases.controller)
		.add(/nodes/, nodes.controller)
		.add(/map\/(.*)/, map.controller)
		.add(/map/, map.controller)
		.add(nodes.controller)
		.check().listen();
	};
});
