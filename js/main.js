define(["helper/router","helper/storage","menu","controller/nodes","controller/map"],
function (Router, storage, menu, controllerNodes, controllerMap) {
	return function(config){
		var store = storage(config)
		store.refresh()
		store.autorefresh(config.reload)

		document.title = "eventmanager"


		menu(document.body,store)
		el = document.createElement("div")
		el.classList.add("content")
		document.body.appendChild(el)


		var map = controllerMap(el,config)
		store.addNotify(map)

		var nodes = controllerNodes(el,config)
		store.addNotify(nodes)

		Router.config({
			mode: 'hash'
		})
		.add(/list/, nodes.controller)
		.add(/map\/(.*)/, map.controller)
		.add(/map/, map.controller)
		.add(nodes.controller)
		.check().listen()
		}
})
