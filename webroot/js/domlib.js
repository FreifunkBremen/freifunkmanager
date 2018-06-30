export function setProps (el, props) {
	if (props) {
		if (props.class) {
			let classList = props.class;
			if (typeof props.class === 'string') {
				classList = classList.split(' ');
			}
			el.classList.add(...classList);
			delete props.class;
		}
		Object.keys(props).map((key) => {
			if (key.indexOf('on') === 0 && typeof props[key] === 'function') {
				// eslint-disable-next-line no-magic-numbers
				return el.addEventListener(key.slice(2), props[key]);
			}
			return false;
		});
		Object.keys(props).map((key) => el.setAttribute(key, props[key]));
	}
}

export function newEl (eltype, props, content) {
	const el = document.createElement(eltype);
	setProps(el, props);
	if (content) {
		el.innerHTML = content;
	}

	return el;
}

export function appendChild (el, child) {
	if (child && !child.parentNode) {
		el.appendChild(child);
	}
}

export function removeChild (el) {
	if (el && el.parentNode) {
		el.parentNode.removeChild(el);
	}
}

// eslint-disable-next-line max-params
export function newAt (at, eltype, props, content) {
	const el = document.createElement(eltype);
	setProps(el, props);
	if (content) {
		el.innerHTML = content;
	}
	at.appendChild(el);

	return el;
}
