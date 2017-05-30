/* exported guiConsole */
/* globals domlib,store,socket */
const guiConsole = {};

(function init () {
	'use strict';

	const view = guiConsole,
		ownCMDs = ['0'],
		cmdRow = {};
	let container = null,
		el = null,
		output = null,
		editing = false,
		ownfilter = false;

	function createID () {
		let digit = new Date().getTime();

		// Use high-precision timer if available
		/* eslint-disable */
		if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
			digit += performance.now();
		}

		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
			const result = (digit + Math.random() * 16) % 16 | 0;

			digit = Math.floor(digit / 16);

			return (char === 'x'
			? result
			: result & 0x3 | 0x8).toString(16);
		});
		/* eslint-enable*/
	}

	function updateCMD (row, cmd) {
		if (cmd.cmd === '' && cmd.timestemp === 0) {
			return;
		}
		row.cmd.innerHTML = cmd.cmd;
		row.timestemp.innerHTML = moment(cmd.timestemp).fromNow(true);

		let running = 0,
			failed = 0,
			sum = 0;

		if (cmd.clients) {
			sum = Object.keys(cmd.clients).length;

			Object.keys(cmd.clients).forEach((addr) => {
				const client = cmd.clients[addr],
					clientRow = row.clients[addr];

				clientRow.status.classList.remove('running', 'failed', 'success');
				if (client.running) {
					running += 1;
					clientRow.status.classList.add('running');
				} else if (client.with_error) {
					failed += 1;
					clientRow.status.classList.add('failed');
				} else {
					clientRow.status.classList.add('success');
				}

				clientRow.result.innerHTML = client.result;
				clientRow.host.innerHTML = addr;
			});
		}

		row.status.classList.remove('running', 'failed', 'success');
		if (running > 0) {
			row.status.innerHTML = `running (${running}`;
			row.status.classList.add('running');
		} else if (failed > 0 || sum === 0) {
			row.status.innerHTML = `failed (${failed}`;
			row.status.classList.add('failed');
		} else {
			row.status.innerHTML = `success (${sum}`;
			row.status.classList.add('success');
		}
		row.status.innerHTML += `/${sum})`;
	}

	function createRow (cmd) {
		const row = {
				'clients': {},
				'clientsContainer': document.createElement('tr'),
				'clientsEl': {},
				'el': document.createElement('tr')
			},
			tab = domlib.newAt(row.clientsContainer, 'td'),
			clientRow = domlib.newAt(tab, 'table');

		tab.setAttribute('colspan', '3');


		if (cmd.cmd === '' && cmd.timestemp === 0) {
			const initRow = domlib.newAt(row.el, 'td');

			initRow.setAttribute('colspan', '3');
			initRow.innerHTML = '\n' +
					'  _______                     ________        __\n' +
					' |       |.-----.-----.-----.|  |  |  |.----.|  |_\n' +
					' |   -   ||  _  |  -__|     ||  |  |  ||   _||   _|\n' +
					' |_______||   __|_____|__|__||________||__|  |____|\n' +
					'          |__| W I R E L E S S   F R E E D O M\n' +
					' -----------------------------------------------------\n' +
					' FreifunkManager shell for openwrt/Lede/gluon systems \n' +
					' -----------------------------------------------------\n' +
					'  * 1 1/2 oz Gin            Shake with a glassful\n' +
					'  * 1/4 oz Triple Sec       of broken ice and pour\n' +
					'  * 3/4 oz Lime Juice       unstrained into a goblet.\n' +
					'  * 1 1/2 oz Orange Juice\n' +
					'  * 1 tsp. Grenadine Syrup\n' +
					' -----------------------------------------------------\n';

			return row;
		}
		row.timestemp = domlib.newAt(row.el, 'td');
		row.cmd = domlib.newAt(row.el, 'td');
		row.status = domlib.newAt(row.el, 'td');

		row.el.classList.add('cmd');
		row.timestemp.classList.add('time');
		row.status.classList.add('status');

		if (cmd.clients) {
			Object.keys(cmd.clients).forEach((addr) => {
				const clientEl = domlib.newAt(clientRow, 'tr'),
					clients = {
						'host': domlib.newAt(clientEl, 'td'),
						'result': domlib.newAt(clientEl, 'td'),
						'status': domlib.newAt(clientEl, 'td')
					};

				clients.host.classList.add('host');
				clients.status.classList.add('status');

				row.clientsEl[addr] = clientEl;
				row.clients[addr] = clients;
			});
			row.el.addEventListener('click', () => {
				if (row.clientsContainer.parentElement) {
					row.el.parentElement.removeChild(row.clientsContainer);
				} else {
					row.el.parentElement.insertBefore(row.clientsContainer, row.el.nextSibling);
				}
			});
		}


		updateCMD(row, cmd);

		return row;
	}

	function update () {
		if (editing) {
			return;
		}
		let cmds = store.getCMDs();

		if (ownfilter) {
			const tmp = cmds;

			cmds = {};
			Object.keys(tmp).
				forEach((id) => {
					if (ownCMDs.indexOf(id) >= 0) {
						cmds[id] = tmp[id];
					}
				});
		}
		Object.keys(cmdRow).forEach((id) => {
			if (cmdRow[id].el.parentElement) {
				output.removeChild(cmdRow[id].el);
			}
		});

		Object.keys(cmds).forEach((id) => {
			const cmd = cmds[id];

			if (cmdRow[id]) {
				updateCMD(cmdRow[id], cmd);
			} else {
				cmdRow[id] = createRow(cmd);
			}
		});

		Object.keys(cmdRow).
		sort((aID, bID) => {
			if (!cmds[aID] || !cmds[bID]) {
				return 0;
			}

			return new Date(cmds[aID].timestemp) - new Date(cmds[bID].timestemp);
		}).
		forEach((id) => {
			if (cmds[id] && !cmdRow[id].el.parentElement) {
				output.appendChild(cmdRow[id].el);
				if (cmdRow[id].clientsContainer.parentElement) {
					cmdRow[id].el.parentElement.insertBefore(cmdRow[id].clientsContainer, cmdRow[id].el.nextSibling);
				}
			}
		});
	}

	view.bind = function bind (bindEl) {
		container = bindEl;
	};
	view.render = function render () {
		if (!container) {
			return;
		} else if (el) {
			container.appendChild(el);
			update();

			return;
		}
		console.log('generate new view for console');
		el = domlib.newAt(container, 'div');

		store.updateCMD({
			'cmd': '',
			'id': '0',
			'timestemp': 0
		});

		output = domlib.newAt(el, 'table');
		output.classList.add('console');

		const prompt = domlib.newAt(el, 'div'),
			filterBtn = domlib.newAt(prompt, 'span'),
			promptInput = domlib.newAt(prompt, 'input');

		prompt.classList.add('prompt');

		promptInput.addEventListener('keyup', (event) => {
			// eslint-disable-next-line no-magic-numbers
			if (event.keyCode !== 13) {
				return;
			}
			const cmd = {
				'cmd': promptInput.value,
				'id': createID(),
				'timestemp': new Date()
			};

			ownCMDs.push(cmd.id);
			socket.sendcmd(cmd);
			promptInput.value = '';
		});
		promptInput.addEventListener('focusin', () => {
			editing = true;
		});
		promptInput.addEventListener('focusout', () => {
			editing = false;
			update();
		});

		filterBtn.classList.add('btn');
		filterBtn.innerHTML = 'Show all';
		filterBtn.addEventListener('click', () => {
			ownfilter = !ownfilter;
			filterBtn.classList.toggle('active');
			filterBtn.innerHTML = ownfilter
				? 'Show own'
				: 'Show all';
			update();
		});


		update();
	};
})();
