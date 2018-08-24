import * as domlib from '../domlib';
import * as gui from '../gui';
import * as socket from '../socket';
import * as store from '../store';
import View from '../view';

export class SettingsView extends View {

	constructor () {
		super();
		domlib.newAt(this.el, 'h1').innerHTML = 'Settings';

		this.ping = domlib.newAt(this.el, 'input',{
			'type': 'checkbox',
			'id': 'settings_ping',
			'onchange': this.updateSettings('ping').bind(this),
		});
		domlib.newAt(this.el, 'label', {'for': 'settings_ping'},'Ping');
	}

	updateSettings (key) {
		return function(ev){
			const copySettings = Object.assign({}, store.settings);
			if (ev.target.type === 'checkbox') {
				copySettings[key] = ev.target.checked;
				socket.sendjson({'subject': 'settings','body': copySettings}, (msg) => {
					if (msg.body) {
						store.settings = copySettings;
					}
				});
			}

		}
	}

	render () {
		if(!store.settings){
			return
		}
		this.ping.checked = store.settings.ping || false;
	}
}
