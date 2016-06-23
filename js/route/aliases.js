function routeAliases(){
	fill = '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width:100%">'
		+ '<thead>'
			+ '<tr>'
				+ '<th class="mdl-data-table__cell--non-numeric">Hostname</th>'
				+ '<th class="mdl-data-table__cell--non-numeric">Location</th>'
				+ '<th>2.4 Ghz</th>'
				+ '<th>5 Ghz</th>'
			+ '</tr>'
		+ '</thead>'
		+ '<tbody>'
	Object.keys(internal.aliases).map(function(key){
		fill += '<tr>'
						+ '<td class="mdl-data-table__cell--non-numeric">'
							+ internal.aliases[key].hostname
							+ '<br/>'
							+ '<small>'+key+'</small>'
						+ '</td>'
						+ '<td class="mdl-data-table__cell--non-numeric"><i class="material-icons">place</i></td>'
						+ '<td>'
							+ 'Ch: '+((internal.aliases[key].freq24 !== undefined)?internal.aliases[key].freq24.channel:'-')
							+ '<br/>'
							+ 'Tx: '+((internal.aliases[key].freq24 !== undefined)?internal.aliases[key].freq24.txpower:'-')
						+ '</td>'
						+ '<td>'
							+ 'Ch: '+((internal.aliases[key].freq5 !== undefined)?internal.aliases[key].freq5.channel:'-')
							+ '<br/>'
							+ 'TX: '+((internal.aliases[key].freq5 !== undefined)?internal.aliases[key].freq5.txpower:'-')
						+ '</td>'
					+ '</tr>'
	})
	fill += '</tbody></table>'
	container.innerHTML = fill
}
