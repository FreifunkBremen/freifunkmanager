import * as domlib from './domlib';
import {MenuView} from './element/menu';
import Navigo from '../node_modules/navigo/lib/navigo';
import View from './view';
import {singelton as notify} from './element/notify';

const router = new Navigo(null, true, '#'),
	elMain = domlib.newEl('main'),
	elMenu = new MenuView(),
	GUI_RENDER_DEBOUNCER_TIME = 100;

export {router};

let init = false,
	currentView = new View();

function renderView () {
	if (!document.body) {
		return;
	}

	if (!init) {
		elMenu.bind(document.body);
		notify.bind(document.body);

		document.body.appendChild(elMain);

		init = true;
	}
	currentView.render();

	notify.render();
	elMenu.render();

	router.resolve();
}


let renderDebounceTimer = null,
	numRenderCallsSkipped = 0;

export function render () {
	if (renderDebounceTimer == null) {
		renderView();
		renderDebounceTimer = window.setTimeout(() => {
			renderDebounceTimer = null;
			if (numRenderCallsSkipped > 0) {
				console.log("skipped " + numRenderCallsSkipped + " render calls; calling render() now");
				numRenderCallsSkipped = 0;
				render();
			}
		}, GUI_RENDER_DEBOUNCER_TIME);
	} else {
		console.log("skip rendering");
		numRenderCallsSkipped++;
	}
}

export function setView (toView) {
	currentView.unbind();
	currentView = toView;
	currentView.bind(elMain);
	currentView.render();
}
