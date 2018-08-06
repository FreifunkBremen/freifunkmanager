import * as V from 'superfine';

export default class Table {

	constructor (el, properties, headings, sortIndex, renderRow) {
		this.sortReverse = false;
		this.el = el;
		this.headings = headings;
		this.sortIndex = sortIndex;
		this.renderRow = renderRow;
		this.properties = properties;
	}

	sortTable(i) {
		this.sortReverse = i === this.sortIndex ? !this.sortReverse : false;
		this.sortIndex = i;
		this.render();
	}

	render () {
		const children = [],
			self = this;


		if (this.data.length !== 0) {
			const th = this.headings.map((d, i) => {
				const properties = {};

				let name = d.name;

				if (d.class) {
					properties.class += ' ' + d.class;
					properties.title = name;
					name = '';
				}

				if (!d.sort) {
					return V.h('th', properties, name);
				}
				
				properties.onclick = () => self.sortTable(i);
				properties.class = 'sort-header';

				if (self.sortIndex === i) {
					properties.class += self.sortReverse ? ' sort-up' : ' sort-down';
				}

				return V.h('th', properties, name);
			});
			let rows = this.data.slice(0).sort(this.headings[this.sortIndex].sort);

			if (this.headings[this.sortIndex].reverse ? !this.sortReverse : this.sortReverse) {
				rows = rows.reverse();
			}

			children.push(V.h('thead', {}, V.h('tr', {}, th)));
			children.push(V.h('tbody', {}, rows.map(this.renderRow)));
		}
		V.render(this.vel, this.vel = V.h('table',this.properties, children), this.el);
	}

	setData(d) {
		this.data = d;
		this.render();
	}

}
