import * as domlib from './domlib';
import * as lib from './lib';
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
	currentView = new View(),
	debouncer = new lib.Debouncer(GUI_RENDER_DEBOUNCER_TIME, "gui render");

export function render () {
	debouncer.run(renderView);
}

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


export function setView (toView) {
	currentView.unbind();
	currentView = toView;
	currentView.bind(elMain);
	currentView.render();
}
