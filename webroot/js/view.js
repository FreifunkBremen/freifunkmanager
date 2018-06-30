export default class View {
	constructor () {
		this.el = document.createElement('div');
	}

	unbind () {
		if (this.el && this.el.parentNode) {
			this.el.parentNode.removeChild(this.el);
		} else {
			console.warn('unbind view not possible');
		}
	}

	bind (el) {
		el.appendChild(this.el);
	}

	// eslint-disable-next-line class-methods-use-this
	render () {
		//console.log('abstract view');
	}
}
