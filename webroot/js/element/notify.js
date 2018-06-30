import * as V from 'superfine';
import View from '../view';


const DELAY_OF_NOTIFY = 15000,
	MAX_MESSAGE_SHOW = 5;

class NotifyView extends View {
	constructor () {
		super();
		this.el.classList.add('notifications');
		if ('Notification' in window) {
			window.Notification.requestPermission();
		}

		this.messages = [];
		window.setInterval(this.removeLast.bind(this), DELAY_OF_NOTIFY);
	}

	removeLast () {
		this.messages.splice(0, 1);
		this.render();
	}

	renderMSG (msg) {
		const {messages} = this,
			content = [msg.content];

		let {render} = this;
		render = render.bind(this);

		if (msg.header) {
			content.unshift(V.h('div', {'class': 'header'}, msg.header));
		}


		return V.h(
			'div', {
				'class': `notify ${msg.type}`,
				'onclick': () => {
					const index = messages.indexOf(msg);
					if (index !== -1) {
						messages.splice(index, 1);
						render();
					}
				}
			}, V.h('div', {'class': 'content'}, content));
	}

	send (props, content) {
		let msg = props;
		if (typeof props === 'object') {
			msg.content = content;
		} else {
			msg = {
				'content': content,
				'type': props
			};
		}
		if ('Notification' in window &&
			window.Notification.permission === 'granted') {
			let body = msg.type,
				title = content;
			if (msg.header) {
				title = msg.header;
				body = msg.content;
			}

			// eslint-disable-next-line no-new
			new window.Notification(title, {
				'body': body,
				'icon': '/favicon-32x32.png'
			});

			return;
		}
		if (this.messages.length > MAX_MESSAGE_SHOW) {
			this.removeLast();
		}

		this.messages.push(msg);
		this.render();
	}

	render () {
		V.render(this.vel, this.vel = V.h('div', {'class': 'notifications'}, this.messages.map(this.renderMSG.bind(this))), this.el);
	}
}
// eslint-disable-next-line one-var
const singelton = new NotifyView();
export {singelton, NotifyView};
