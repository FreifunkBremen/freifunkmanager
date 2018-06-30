import * as V from 'superfine';
import * as domlib from '../domlib';
import * as socket from '../socket';
import * as store from '../store';
import View from '../view';
import {singelton as notify} from './notify';
import {render} from '../gui';

export const WINDOW_HEIGHT_MENU = 50;

export class MenuView extends View {
	constructor () {
		super();
		this.el = document.createElement('header');
		const menuContainer = domlib.newAt(this.el, 'nav');
		this.menuList = domlib.newAt(menuContainer, 'ul');

		const logo = domlib.newAt(this.menuList, 'li', {'class':'logo'});
		domlib.newAt(logo, 'img', {'src':'/img/logo.svg'});

		const aList = domlib.newAt(this.menuList, 'li', {'class':'item-1'});
		domlib.newAt(aList, 'a', {'href':'#/list'}, 'List');

		const aMap = domlib.newAt(this.menuList, 'li', {'class':'item-2'});
		domlib.newAt(aMap, 'a', {'href':'#/map'}, 'Map');

		const aStatistics= domlib.newAt(this.menuList, 'li', {'class':'item-3'});
		domlib.newAt(aStatistics, 'a', {'href':'#/statistics'}, 'Statistics');

	}
	loginTyping(e) {
		this._loginInput = e.target.value;
	}
	login() {
		socket.sendjson({'subject': 'login', 'body': this._loginInput}, (msg) => {
			if (msg.body) {
				store.isLogin = true;
				render();
			}else {
				notify.send({
					'header': 'Anmeldung ist fehlgeschlagen',
					'type': 'error'
				}, 'Login');
			}
		});
		this._loginInput = '';
	}

	logout() {
		socket.sendjson({'subject': 'logout'}, (msg) => {
			if (msg.body) {
				store.isLogin = false;
				render();
			} else {
				notify.send({
					'header': 'Abmeldung ist fehlgeschlagen',
					'type': 'error'
				}, 'Logout');
			}
		});
	}

	render () {
		const socketStatus = socket.getStatus();
		let statusClass = 'status ',
			vLogin = V.h('li', {
				'class': 'login',
			}, [
				V.h('input', {
					'type': 'password',
					'value': this._loginInput,
					'oninput': this.loginTyping.bind(this),
				}),
				V.h('a', {
					'onclick': this.login.bind(this)
				}, 'Login'
				)
			]);

		if (store.isLogin) {
			vLogin = V.h('li', {
				'class': 'login',
				'onclick': this.logout.bind(this)
			}, 'Logout');
		}

		if (socketStatus !== 1) {
			// eslint-disable-next-line no-magic-numbers
			if (socketStatus === 0 || socketStatus === 2) {
				statusClass += 'connecting';
			} else {
				statusClass += 'offline';
			}
		}

		V.render(this.vMenu, this.vMenu = V.h('span',{},[V.h('li', {
			'class': statusClass,
			'onclick': () => location.reload(true)
		}), vLogin]), this.menuList);
	}
}
