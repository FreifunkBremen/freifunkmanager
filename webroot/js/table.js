import * as V from 'superfine';

export default class Table {

	constructor (el, properties, headings, sortIndex, renderRow) {
		this.sortReverse = false;
		this.el = el;
		this.headings = headings;
		this.sortIndex = sortIndex;
		this.renderRow = renderRow;
		this.properties = properties;
		this.maxDisplayedRows = localStorage.getItem("maxDisplayedRows");

		if (this.maxDisplayedRows == null) {
			this.maxDisplayedRows = 20;
		}
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

			var maxDisplayedRows = rows.length;
			if (this.maxDisplayedRows != -1) {
				maxDisplayedRows = Math.min(this.maxDisplayedRows, maxDisplayedRows);
			}

			var visibleRows = [];
			for (let i = 0; i < maxDisplayedRows; i += 1) {
				visibleRows.push(rows[i]);
			}


			children.push(V.h('thead', {}, V.h('tr', {}, th)));
			children.push(V.h('tbody', {}, visibleRows.map(this.renderRow)));
			children.push(V.h('tfoot', {}, V.h('tr', {}, V.h('td',{colspan: th.length},
				[V.h('span',{}, maxDisplayedRows + " of " + rows.length + " nodes. Show: ")].concat(
					[["5", 5], ["10", 10], ["20", 20], ["50", 50], ["All", -1]].map((item)=>
							V.h('a',{
								class: 'btn',
								onclick:()=> {
									this.maxDisplayedRows = item[1];
									localStorage.setItem("maxDisplayedRows", this.maxDisplayedRows);
								}
							}, item[0])
					))
				))));
		}

		V.render(this.vel, this.vel = V.h('table',this.properties, children), this.el);
	}

	setData(d) {
		this.data = d;
		this.render();
	}

}
