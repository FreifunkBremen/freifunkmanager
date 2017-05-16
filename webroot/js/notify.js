/* exported notify */

const notify = {};

(function init () {
	'use strict';

	const DELAY_OF_NOTIFY = 15000,
		MAX_MESSAGE_SHOW = 10,
		messages = [];

	let container = null;

	if ('Notification' in window) {
		window.Notification.requestPermission();
	}

	function removeLast () {
		messages.splice(0, 1);
		if (container && container.firstElementChild) {
			container.removeChild(container.firstElementChild);
		}
	}

	function renderMsg (msg) {
		const msgBox = document.createElement('div');

		msgBox.classList.add('notify', msg.type);
		msgBox.innerHTML = msg.text;
		container.appendChild(msgBox);
		msgBox.addEventListener('click', () => {
			container.removeChild(msgBox);
			if (messages.indexOf(msg) !== -1) {
				messages.splice(messages.indexOf(msg), 1);
			}
		});
	}

	window.setInterval(removeLast, DELAY_OF_NOTIFY);

	notify.bind = function bind (el) {
		container = el;
	};

	notify.send = function send (type, text) {
		if ('Notification' in window &&
			window.Notification.permission === 'granted') {
			// eslint-disable-next-line no-new
			new window.Notification(text, {
				'body': type,
				'icon': '/img/logo.jpg'
			});

			return;
		}
		if (messages.length > MAX_MESSAGE_SHOW) {
			removeLast();
		}
		const msg = {
			'text': text,
			'type': type
		};

		messages.push(msg);
		renderMsg(msg);
	};
})();
